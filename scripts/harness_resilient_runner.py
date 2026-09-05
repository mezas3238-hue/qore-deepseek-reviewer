#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import signal
import subprocess
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from harness_large_batch_state import Snapshot, StateError, parse_checkpoint_file

COST_WINDOW_TZ = ZoneInfo("America/Asuncion")
COST_WINDOW_HARD_STOP_HOUR = 21
COST_WINDOW_HARD_STOP_MINUTE = 25
MIN_SESSION_SECONDS = 60
AGENT_RECOVERY_DIR = ".qore-harness-recovery"
ENGINEERING_BLOCKED = "ENGINEERING_BLOCKED"
RESULT_BEGIN = "QORE_INTERNAL_EXPERT_RESULT_BEGIN"
RESULT_END = "QORE_INTERNAL_EXPERT_RESULT_END"
FINAL_READY = "CANDIDATE_READY_FOR_EXTERNAL_QG"
INTERNAL_SCHEMA = "qore.internal-expert.audit-repair.v2"
FIVE_LANES = tuple(f"IE-L{i}" for i in range(1, 6))


class RunnerError(RuntimeError):
    pass


def _git(root: Path, *args: str, check: bool = True) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and proc.returncode != 0:
        raise RunnerError(
            f"git {' '.join(args)} failed with {proc.returncode}: {proc.stderr.strip()}"
        )
    return proc.stdout


def _resume_complete(text: str) -> bool:
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    for i, raw in enumerate(lines):
        if raw.strip() != "## RESUME STATE":
            continue
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j >= len(lines):
            return False
        return lines[j].strip() in {"COMPLETE", "`COMPLETE`"}
    return False


def _process_group_exists(pgid: int) -> bool:
    try:
        os.killpg(pgid, 0)
    except ProcessLookupError:
        return False
    return True


def _terminate_process_group(proc: subprocess.Popen[str]) -> None:
    pgid = proc.pid
    if not _process_group_exists(pgid):
        return
    try:
        os.killpg(pgid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass
    if _process_group_exists(pgid):
        try:
            os.killpg(pgid, signal.SIGKILL)
        except ProcessLookupError:
            return
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired as exc:
        raise RunnerError("DSH role process group did not terminate") from exc


def _cost_window_remaining_seconds(now: datetime | None = None) -> int | None:
    if not os.environ.get("DEEPSEEK_API_KEY"):
        return None
    current = now.astimezone(COST_WINDOW_TZ) if now is not None else datetime.now(COST_WINDOW_TZ)
    cutoff = current.replace(
        hour=COST_WINDOW_HARD_STOP_HOUR,
        minute=COST_WINDOW_HARD_STOP_MINUTE,
        second=0,
        microsecond=0,
    )
    return max(0, int((cutoff - current).total_seconds()))


def _fresh_role_home(template_home: Path, role_root: Path) -> Path:
    if role_root.exists():
        shutil.rmtree(role_root)
    shutil.copytree(
        template_home,
        role_root,
        symlinks=True,
        ignore=shutil.ignore_patterns("sessions"),
    )
    (role_root / "sessions").mkdir(parents=True, exist_ok=True)
    return role_root


def _run_role(
    *,
    dsh_bin: Path,
    profile: str,
    prompt: str,
    timeout_seconds: int,
    role_home: Path,
    cwd: Path,
    permission_mode: str,
) -> tuple[int, str, bool]:
    env = os.environ.copy()
    env["DSH_HOME"] = str(role_home)
    env["DSH_PERMISSION_MODE"] = permission_mode
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    proc = subprocess.Popen(
        [str(dsh_bin), "--profile", profile, prompt],
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    timed_out = False
    try:
        text, _ = proc.communicate(timeout=timeout_seconds)
        rc = int(proc.returncode or 0)
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        partial = exc.stdout if isinstance(exc.stdout, str) else ""
        _terminate_process_group(proc)
        remainder, _ = proc.communicate()
        text = remainder or partial
        rc = 124
    finally:
        if _process_group_exists(proc.pid):
            _terminate_process_group(proc)
    return rc, text or "", timed_out


def _append_output(
    output_path: Path,
    *,
    role: str,
    cycle: int,
    rc: int,
    timed_out: bool,
    text: str,
) -> None:
    with output_path.open("a", encoding="utf-8") as handle:
        handle.write(f"\n\n<!-- QORE_{role}_CYCLE {cycle} BEGIN -->\n")
        handle.write(text)
        if text and not text.endswith("\n"):
            handle.write("\n")
        handle.write(
            f"<!-- QORE_{role}_CYCLE {cycle} END rc={rc} "
            f"timed_out={str(timed_out).lower()} -->\n"
        )


def _engineering_complete(snapshot: Snapshot) -> bool:
    return len(snapshot.completed) == 6 and snapshot.all_subagents_complete and not snapshot.blocked


def _workspace_paths(workspace: Path) -> tuple[Path, Path]:
    root = workspace / AGENT_RECOVERY_DIR
    root.mkdir(parents=True, exist_ok=True)
    return root / "checkpoints.md", root / "candidate.patch"


def _atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(path)


def _prepare_engineer_checkpoint(host: Path, workspace: Path) -> Path:
    local_checkpoint, _ = _workspace_paths(workspace)
    _atomic_write(local_checkpoint, host.read_text(encoding="utf-8"))
    return local_checkpoint


def _harvest_engineer_checkpoint(host: Path, local: Path, expected: Snapshot) -> Snapshot:
    candidate = parse_checkpoint_file(local)
    if (candidate.package_id, candidate.start, candidate.tree) != (
        expected.package_id,
        expected.start,
        expected.tree,
    ):
        raise StateError("Engineer checkpoint immutable binding mismatch")
    if candidate.checkpoint_count < expected.checkpoint_count:
        raise StateError("Engineer checkpoint count regressed")
    _atomic_write(host, local.read_text(encoding="utf-8"))
    return candidate


def _intent_to_add_untracked(workspace: Path) -> None:
    untracked = [
        p
        for p in _git(workspace, "ls-files", "--others", "--exclude-standard").splitlines()
        if p and not p.startswith(f"{AGENT_RECOVERY_DIR}/")
    ]
    if untracked:
        subprocess.run(["git", "add", "-N", "--", *untracked], cwd=workspace, check=True)


def _candidate_patch(workspace: Path, patch_path: Path) -> tuple[str, list[str]]:
    _git(workspace, "reset", "--mixed", "HEAD")
    _intent_to_add_untracked(workspace)
    try:
        patch = _git(
            workspace,
            "diff",
            "--binary",
            "HEAD",
            "--",
            ".",
            f":(exclude){AGENT_RECOVERY_DIR}/",
        )
        changed = [
            p
            for p in _git(
                workspace,
                "diff",
                "--name-only",
                "HEAD",
                "--",
                ".",
                f":(exclude){AGENT_RECOVERY_DIR}/",
            ).splitlines()
            if p
        ]
    finally:
        _git(workspace, "reset", "--mixed", "HEAD")
    if not patch:
        raise RunnerError("candidate contains no repository patch")
    patch_path.write_text(patch, encoding="utf-8")
    return hashlib.sha256(patch.encode("utf-8")).hexdigest(), sorted(set(changed))


def _extract_package_context(base_prompt: str) -> str:
    marker = "# WORK PACKAGE"
    pos = base_prompt.find(marker)
    return base_prompt[pos:] if pos >= 0 else base_prompt


def _reviewer_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _engineer_role_prompt(*, base_prompt: str, host_checkpoint: Path) -> str:
    role = (
        _reviewer_root()
        / "harness/engineer/prompts/qore-harness-engineer-independent-v1.md"
    ).read_text(encoding="utf-8")
    snapshot = parse_checkpoint_file(host_checkpoint)
    return (
        role
        + "\n\n# BOUNDED PACKAGE CONTEXT\n"
        + _extract_package_context(base_prompt)
        + "\n\n# HOST ENGINEERING STATE\n"
        + f"package_id={snapshot.package_id}\n"
        + f"expected_start={snapshot.start}\n"
        + f"expected_tree={snapshot.tree}\n"
        + f"completed_engineering_lanes={snapshot.completed}\n"
        + f"pending_engineering_lanes={snapshot.pending}\n"
        + f"checkpoint_path={AGENT_RECOVERY_DIR}/checkpoints.md\n"
        + f"recovery_patch_path={AGENT_RECOVERY_DIR}/candidate.patch\n"
        + "\nComplete engineering independently. When all six engineering lanes are complete, emit ENGINEERING_READY_FOR_HOST_HANDOFF and hand the exact candidate to the deterministic host. No downstream process information is available in this role.\n"
    )


def _create_audit_workspace(workspace: Path, patch_path: Path, target: Path) -> None:
    if target.exists():
        shutil.rmtree(target)
    subprocess.run(
        ["git", "clone", "--quiet", "--no-hardlinks", str(workspace), str(target)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    head = _git(workspace, "rev-parse", "HEAD").strip()
    if _git(target, "rev-parse", "HEAD").strip() != head:
        raise RunnerError("audit clone HEAD mismatch")
    _git(target, "remote", "remove", "origin", check=False)
    proc = subprocess.run(
        ["git", "apply", "--check", str(patch_path)],
        cwd=target,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        raise RunnerError(f"audit candidate patch check failed: {proc.stderr.strip()}")
    subprocess.run(["git", "apply", str(patch_path)], cwd=target, check=True)
    _git(target, "diff", "--check", "HEAD", "--")


def _audit_patch_hash(audit_workspace: Path) -> str:
    fd, name = tempfile.mkstemp(prefix="qore-audit-hash-", suffix=".patch")
    os.close(fd)
    temp = Path(name)
    try:
        digest, _ = _candidate_patch(audit_workspace, temp)
        return digest
    finally:
        temp.unlink(missing_ok=True)


def _internal_expert_prompt(
    *,
    initial_hash: str,
    current_hash: str,
    changed_files: list[str],
    start: str,
    tree: str,
    audit_session: int,
) -> str:
    role = (
        _reviewer_root()
        / "harness/engineer/prompts/qore-harness-internal-expert-independent-v1.md"
    ).read_text(encoding="utf-8")
    return (
        role
        + "\n\n# IMMUTABLE TECHNICAL AUDIT ORIGIN\n"
        + f"START={start}\nTREE={tree}\n"
        + f"initial_candidate_patch_sha256={initial_hash}\n"
        + f"current_candidate_patch_sha256={current_hash}\n"
        + f"audit_session={audit_session}\n"
        + "changed_files=" + json.dumps(changed_files, ensure_ascii=False) + "\n"
        + "\n# TECHNICAL AUDIT SCOPE\n"
        + "Audit the exact candidate in this isolated checkout and all causally adjacent reachable behavior needed to determine correctness of the changed work. Use repository contracts, code, tests, callers, retained state, serialization/replay and semantic LSP as evidence. Do not assume anything about who authored the candidate or how it was produced.\n"
        + "\nAudit, repair every material defect you can safely repair inside the candidate's existing bounded scope, and then perform a full five-lane re-audit. Do not emit an interim finding list as a handoff to an implementer. Return CLEAN only after your final corrected candidate is fully clean.\n"
    )


def _parse_internal_result(text: str) -> dict[str, Any]:
    start = text.rfind(RESULT_BEGIN)
    end = text.rfind(RESULT_END)
    if start < 0 or end < 0 or end <= start:
        raise RunnerError("Internal Expert did not emit structured result markers")
    body = text[start + len(RESULT_BEGIN) : end].strip()
    if body.startswith("```json"):
        body = body[len("```json") :]
    elif body.startswith("```"):
        body = body[3:]
    if body.endswith("```"):
        body = body[:-3]
    try:
        result = json.loads(body.strip())
    except json.JSONDecodeError as exc:
        raise RunnerError(f"Internal Expert result JSON invalid: {exc}") from exc
    if not isinstance(result, dict) or result.get("schema") != INTERNAL_SCHEMA:
        raise RunnerError("Internal Expert result schema mismatch")
    return result


def _validate_internal_result(
    result: dict[str, Any],
    *,
    initial_hash: str,
    actual_final_hash: str,
) -> tuple[str, int, int]:
    status = result.get("status")
    if status not in {"CLEAN", "BLOCKED"}:
        raise RunnerError("Internal Expert status must be CLEAN or BLOCKED")
    if result.get("initial_candidate_patch_sha256") != initial_hash:
        raise RunnerError("Internal Expert initial candidate hash mismatch")
    if result.get("final_candidate_patch_sha256") != actual_final_hash:
        raise RunnerError("Internal Expert final candidate hash mismatch")
    audit_pass_count = result.get("audit_pass_count")
    repair_count = result.get("repair_count")
    if type(audit_pass_count) is not int or audit_pass_count < 1:
        raise RunnerError("Internal Expert audit_pass_count invalid")
    if type(repair_count) is not int or repair_count < 0:
        raise RunnerError("Internal Expert repair_count invalid")
    if status == "CLEAN":
        lanes = result.get("lanes")
        if not isinstance(lanes, dict) or any(lanes.get(lane) != "COMPLETED" for lane in FIVE_LANES):
            raise RunnerError("Internal Expert CLEAN lacks five completed final lanes")
        if result.get("last_full_audit_material_findings") != 0:
            raise RunnerError("Internal Expert CLEAN final audit still has findings")
        if result.get("residual_uncertainty") not in {"NONE", None, ""}:
            raise RunnerError("Internal Expert CLEAN contains residual uncertainty")
        if result.get("lsp_final_recheck") not in {"COMPLETE", "NOT_APPLICABLE"}:
            raise RunnerError("Internal Expert CLEAN lacks final LSP disposition")
        repaired = result.get("repaired_findings")
        if not isinstance(repaired, list):
            raise RunnerError("Internal Expert repaired_findings must be a list")
        if actual_final_hash != initial_hash:
            if repair_count < 1 or not repaired:
                raise RunnerError("Internal Expert changed candidate without repair accounting")
            if audit_pass_count < 2:
                raise RunnerError("Internal Expert repaired candidate without full re-audit")
        elif repair_count != 0:
            raise RunnerError("Internal Expert reports repairs but final candidate is unchanged")
    return str(status), audit_pass_count, repair_count


def _replace_workspace_candidate(workspace: Path, final_patch: Path) -> None:
    _git(workspace, "reset", "--hard", "HEAD")
    subprocess.run(
        ["git", "clean", "-fd", "-e", f"{AGENT_RECOVERY_DIR}/"],
        cwd=workspace,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    proc = subprocess.run(
        ["git", "apply", "--check", str(final_patch)],
        cwd=workspace,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        raise RunnerError(f"final Internal Expert patch cannot apply: {proc.stderr.strip()}")
    subprocess.run(["git", "apply", str(final_patch)], cwd=workspace, check=True)
    _git(workspace, "diff", "--check", "HEAD", "--")


def _append_host_clean_checkpoint(
    checkpoints: Path,
    *,
    initial_hash: str,
    final_hash: str,
    audit_pass_count: int,
    repair_count: int,
) -> Snapshot:
    state = parse_checkpoint_file(checkpoints)
    lines = [
        "QORE_CHECKPOINT_BEGIN",
        f"package_id: {state.package_id}",
        f"checkpoint_sequence: {state.checkpoint_count}",
        "phase: HOST_INDEPENDENT_INTERNAL_EXPERT_AUDIT_REPAIR_CLEAN",
        f"binding: START={state.start} TREE={state.tree}",
        "evidence: policy=QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2",
        f"evidence: initial_candidate_patch_sha256={initial_hash}",
        f"evidence: final_candidate_patch_sha256={final_hash}",
        f"evidence: internal_expert_audit_pass_count={audit_pass_count}",
        f"evidence: internal_expert_repair_count={repair_count}",
        "evidence: internal_expert_knows_engineer_identity=false",
        "evidence: engineer_transcript_shared_with_internal_expert=false",
        "evidence: engineer_reentered_after_audit_handoff=false",
        "evidence: internal_expert_audit_repair_authority=true",
        "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN",
        "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN",
        "PENDING NEXT ACTION: deterministic candidate scope gate, canonical FULL QG, then Integration Authority adjudication",
        "SAFE RESUME INSTRUCTION: internal CLEAN is bound to final_candidate_patch_sha256; any later mutation invalidates it; External Expert remains mandatory",
        "QORE_CHECKPOINT_END",
        "",
    ]
    with checkpoints.open("a", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    return parse_checkpoint_file(checkpoints)


def _metadata_write(path: Path, value: dict[str, Any]) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dsh-bin", type=Path, required=True)
    parser.add_argument("--profile", default="headless")
    parser.add_argument("--prompt-file", type=Path, required=True)
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--max-generations", type=int, default=4)
    parser.add_argument("--generation-timeout-seconds", type=int, default=2100)
    parser.add_argument("--max-stagnant-generations", type=int, default=1)
    args = parser.parse_args()
    if args.max_generations < 1 or args.max_generations > 8:
        parser.error("max-generations must be in [1, 8]")
    if args.generation_timeout_seconds < MIN_SESSION_SECONDS:
        parser.error("generation timeout is too small")

    workspace = Path.cwd().resolve()
    template_home = Path(os.environ.get("DSH_HOME", "")).resolve()
    if not template_home.is_dir():
        parser.error("DSH_HOME template is missing")
    base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    local_checkpoint = _prepare_engineer_checkpoint(args.checkpoints, workspace)
    _, local_patch = _workspace_paths(workspace)
    role_root = Path(tempfile.mkdtemp(prefix="qore-independent-audit-repair-", dir=os.environ.get("RUNNER_TEMP") or None))

    attempts: list[dict[str, Any]] = []
    terminal_reason = "INDEPENDENT_AUDIT_REPAIR_SESSION_BUDGET_EXHAUSTED"
    final_rc = 70
    started = time.monotonic()
    session_budget = args.max_generations * 3
    sessions_used = 0
    engineer_sessions = 0
    audit_sessions = 0
    initial_patch_hash: str | None = None
    final_patch_hash: str | None = None
    final_repair_count = 0
    final_audit_pass_count = 0
    audit_started = False

    try:
        while sessions_used < session_budget:
            state = parse_checkpoint_file(args.checkpoints)
            if state.blocked:
                terminal_reason = "MATERIAL_BLOCKED_FROM_ENGINEERING_CHECKPOINT"
                final_rc = 2
                break
            if _engineering_complete(state):
                break
            remaining = _cost_window_remaining_seconds()
            if remaining is not None and remaining < MIN_SESSION_SECONDS:
                terminal_reason = "COST_WINDOW_CUTOFF_21_25_AMERICA_ASUNCION"
                final_rc = 79
                break
            timeout = args.generation_timeout_seconds if remaining is None else max(MIN_SESSION_SECONDS, min(args.generation_timeout_seconds, remaining))
            sessions_used += 1
            engineer_sessions += 1
            before = state
            _atomic_write(local_checkpoint, args.checkpoints.read_text(encoding="utf-8"))
            engineer_home = _fresh_role_home(template_home, role_root / f"engineer-{engineer_sessions}")
            rc, text, timed_out = _run_role(
                dsh_bin=args.dsh_bin,
                profile=args.profile,
                prompt=_engineer_role_prompt(base_prompt=base_prompt, host_checkpoint=args.checkpoints),
                timeout_seconds=timeout,
                role_home=engineer_home,
                cwd=workspace,
                permission_mode="workspace-write",
            )
            _append_output(args.output, role="ENGINEER", cycle=engineer_sessions, rc=rc, timed_out=timed_out, text=text)
            try:
                state = _harvest_engineer_checkpoint(args.checkpoints, local_checkpoint, before)
            except StateError as exc:
                terminal_reason = f"CORRUPT_ENGINEER_CHECKPOINT:{exc}"
                final_rc = 65
                break
            patch_hash: str | None = None
            changed_files: list[str] = []
            try:
                patch_hash, changed_files = _candidate_patch(workspace, local_patch)
            except RunnerError:
                if _engineering_complete(state):
                    raise
            attempts.append({
                "role": "ENGINEER",
                "session": engineer_sessions,
                "exit_code": rc,
                "timed_out": timed_out,
                "completed_lanes": state.completed,
                "pending_lanes": state.pending,
                "candidate_patch_sha256": patch_hash,
                "changed_files": changed_files,
            })
            if ENGINEERING_BLOCKED in text:
                terminal_reason = "ENGINEERING_BLOCKED"
                final_rc = 2
                break
            if rc != 0 or not _engineering_complete(state):
                continue
            break

        if final_rc not in {2, 65, 79}:
            state = parse_checkpoint_file(args.checkpoints)
            if not _engineering_complete(state):
                terminal_reason = "ENGINEERING_NOT_COMPLETE_WITHIN_SESSION_BUDGET"
                final_rc = 70
            else:
                initial_patch_hash, _ = _candidate_patch(workspace, local_patch)
                final_patch_hash = initial_patch_hash
                audit_started = True
                audit_workspace = role_root / "internal-expert-workspace"
                _create_audit_workspace(workspace, local_patch, audit_workspace)
                if _audit_patch_hash(audit_workspace) != initial_patch_hash:
                    raise RunnerError("initial audit workspace patch binding mismatch")
                audit_home = _fresh_role_home(template_home, role_root / "internal-expert")

                while sessions_used < session_budget:
                    remaining = _cost_window_remaining_seconds()
                    if remaining is not None and remaining < MIN_SESSION_SECONDS:
                        terminal_reason = "COST_WINDOW_CUTOFF_21_25_AMERICA_ASUNCION"
                        final_rc = 79
                        break
                    timeout = args.generation_timeout_seconds if remaining is None else max(MIN_SESSION_SECONDS, min(args.generation_timeout_seconds, remaining))
                    audit_sessions += 1
                    sessions_used += 1
                    current_patch = role_root / f"audit-current-{audit_sessions}.patch"
                    current_hash, current_changed = _candidate_patch(audit_workspace, current_patch)
                    rc, text, timed_out = _run_role(
                        dsh_bin=args.dsh_bin,
                        profile=args.profile,
                        prompt=_internal_expert_prompt(
                            initial_hash=initial_patch_hash,
                            current_hash=current_hash,
                            changed_files=current_changed,
                            start=str(state.start),
                            tree=str(state.tree),
                            audit_session=audit_sessions,
                        ),
                        timeout_seconds=timeout,
                        role_home=audit_home,
                        cwd=audit_workspace,
                        permission_mode="workspace-write",
                    )
                    _append_output(args.output, role="INTERNAL_EXPERT", cycle=audit_sessions, rc=rc, timed_out=timed_out, text=text)
                    actual_after_hash = _audit_patch_hash(audit_workspace)
                    record: dict[str, Any] = {
                        "role": "INTERNAL_EXPERT",
                        "session": audit_sessions,
                        "exit_code": rc,
                        "timed_out": timed_out,
                        "candidate_patch_sha256_before": current_hash,
                        "candidate_patch_sha256_after": actual_after_hash,
                        "engineer_identity_known": False,
                        "engineer_transcript_shared": False,
                        "engineer_reentered": False,
                    }
                    if rc != 0:
                        record["status"] = "RECOVERY_REQUIRED"
                        attempts.append(record)
                        continue
                    try:
                        result = _parse_internal_result(text)
                        status, audit_pass_count, repair_count = _validate_internal_result(
                            result,
                            initial_hash=initial_patch_hash,
                            actual_final_hash=actual_after_hash,
                        )
                    except RunnerError as exc:
                        record["status"] = "INVALID_RESULT_RECOVERABLE"
                        record["error"] = str(exc)
                        attempts.append(record)
                        continue
                    record["status"] = status
                    record["audit_pass_count"] = audit_pass_count
                    record["repair_count"] = repair_count
                    attempts.append(record)
                    if status == "BLOCKED":
                        terminal_reason = "INTERNAL_EXPERT_AUDIT_REPAIR_BLOCKED"
                        final_rc = 2
                        break

                    final_patch = role_root / "internal-expert-final.patch"
                    exported_hash, _ = _candidate_patch(audit_workspace, final_patch)
                    if exported_hash != actual_after_hash:
                        raise RunnerError("final audit patch changed during export")
                    _replace_workspace_candidate(workspace, final_patch)
                    canonical_hash, _ = _candidate_patch(workspace, local_patch)
                    if canonical_hash != exported_hash:
                        raise RunnerError("canonical candidate differs from Internal Expert CLEAN patch")
                    final_patch_hash = canonical_hash
                    final_repair_count = repair_count
                    final_audit_pass_count = audit_pass_count
                    final_state = _append_host_clean_checkpoint(
                        args.checkpoints,
                        initial_hash=initial_patch_hash,
                        final_hash=final_patch_hash,
                        audit_pass_count=audit_pass_count,
                        repair_count=repair_count,
                    )
                    if not final_state.all_complete:
                        terminal_reason = "HOST_CLEAN_MARKERS_DID_NOT_CLOSE_STATE"
                        final_rc = 68
                        break
                    with args.output.open("a", encoding="utf-8") as handle:
                        handle.write("\n## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\n" + FINAL_READY + "\n")
                    terminal_reason = "CANDIDATE_COMPLETE"
                    final_rc = 0
                    break

                if final_rc == 70 and audit_sessions > 0:
                    terminal_reason = "INTERNAL_EXPERT_AUDIT_REPAIR_SESSION_BUDGET_EXHAUSTED"

    except (RunnerError, OSError, subprocess.SubprocessError, StateError) as exc:
        terminal_reason = f"RUNNER_ERROR:{type(exc).__name__}:{exc}"
        final_rc = 69
    finally:
        _metadata_write(args.metadata, {
            "schema": "qore-harness-independent-audit-repair-runner-v2",
            "policy": "QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2",
            "terminal_reason": terminal_reason,
            "exit_code": final_rc,
            "elapsed_seconds": int(time.monotonic() - started),
            "attempts": attempts,
            "independent_roles": True,
            "engineer_transcript_shared_with_internal_expert": False,
            "internal_expert_knows_engineer_identity": False,
            "implementation_package_context_shared_with_internal_expert": False,
            "engineer_reentered_after_audit_handoff": False,
            "internal_expert_can_repair": True,
            "internal_expert_reaudits_after_repairs": True,
            "audit_started": audit_started,
            "engineer_sessions": engineer_sessions,
            "internal_expert_sessions": audit_sessions,
            "initial_candidate_patch_sha256": initial_patch_hash,
            "final_candidate_patch_sha256": final_patch_hash,
            "final_internal_expert_repair_count": final_repair_count,
            "final_internal_expert_audit_pass_count": final_audit_pass_count,
            "sessions_used": sessions_used,
            "session_budget": session_budget,
        })
        shutil.rmtree(role_root, ignore_errors=True)
    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
