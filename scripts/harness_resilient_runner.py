#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
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
ENGINEERING_READY = "ENGINEERING_READY_FOR_INDEPENDENT_AUDIT"
ENGINEERING_BLOCKED = "ENGINEERING_BLOCKED"
RESULT_BEGIN = "QORE_INTERNAL_EXPERT_RESULT_BEGIN"
RESULT_END = "QORE_INTERNAL_EXPERT_RESULT_END"
FINAL_READY = "CANDIDATE_READY_FOR_EXTERNAL_QG"
INTERNAL_SCHEMA = "qore.internal-expert.independent.v1"
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
    ignore = shutil.ignore_patterns("sessions")
    shutil.copytree(template_home, role_root, symlinks=True, ignore=ignore)
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
            f"<!-- QORE_{role}_CYCLE {cycle} END rc={rc} timed_out={str(timed_out).lower()} -->\n"
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
        patch = _git(workspace, "diff", "--binary", "HEAD", "--", ".", f":(exclude){AGENT_RECOVERY_DIR}/")
        changed = [
            p
            for p in _git(workspace, "diff", "--name-only", "HEAD", "--", ".", f":(exclude){AGENT_RECOVERY_DIR}/").splitlines()
            if p
        ]
    finally:
        _git(workspace, "reset", "--mixed", "HEAD")
    if not patch:
        raise RunnerError("Engineer candidate contains no repository patch")
    patch_path.write_text(patch, encoding="utf-8")
    digest = hashlib.sha256(patch.encode("utf-8")).hexdigest()
    return digest, sorted(set(changed))


def _extract_package_context(base_prompt: str) -> str:
    marker = "# WORK PACKAGE"
    pos = base_prompt.find(marker)
    if pos < 0:
        return base_prompt
    return base_prompt[pos:]


def _reviewer_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _engineer_role_prompt(
    *,
    base_prompt: str,
    host_checkpoint: Path,
    findings: list[dict[str, Any]] | None,
    patch_path: Path,
) -> str:
    role = (_reviewer_root() / "harness/engineer/prompts/qore-harness-engineer-independent-v1.md").read_text(encoding="utf-8")
    snapshot = parse_checkpoint_file(host_checkpoint)
    package_context = _extract_package_context(base_prompt)
    finding_text = "NONE"
    if findings:
        finding_text = json.dumps(findings, indent=2, sort_keys=True, ensure_ascii=False)
    local_checkpoint = Path(AGENT_RECOVERY_DIR) / "checkpoints.md"
    local_patch = Path(AGENT_RECOVERY_DIR) / "candidate.patch"
    return (
        role
        + "\n\n# BOUNDED PACKAGE CONTEXT\n"
        + package_context
        + "\n\n# HOST ENGINEERING STATE\n"
        + f"package_id={snapshot.package_id}\n"
        + f"expected_start={snapshot.start}\n"
        + f"expected_tree={snapshot.tree}\n"
        + f"completed_engineering_lanes={snapshot.completed}\n"
        + f"pending_engineering_lanes={snapshot.pending}\n"
        + f"checkpoint_path={local_checkpoint}\n"
        + f"recovery_patch_path={local_patch}\n"
        + f"host_candidate_patch_path={patch_path.name}\n"
        + "\n# VALIDATION_FINDINGS FROM HOST\n"
        + finding_text
        + "\n\nThe VALIDATION_FINDINGS payload is the only validation information you receive. Do not infer or request its source.\n"
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
    _intent_to_add_untracked(audit_workspace)
    try:
        patch = _git(
            audit_workspace,
            "diff",
            "--binary",
            "HEAD",
            "--",
            ".",
            f":(exclude){AGENT_RECOVERY_DIR}/",
        )
    finally:
        _git(audit_workspace, "reset", "--mixed", "HEAD")
    return hashlib.sha256(patch.encode("utf-8")).hexdigest()


def _internal_expert_prompt(
    *,
    base_prompt: str,
    patch_hash: str,
    changed_files: list[str],
    start: str,
    tree: str,
) -> str:
    role = (_reviewer_root() / "harness/engineer/prompts/qore-harness-internal-expert-independent-v1.md").read_text(encoding="utf-8")
    package_context = _extract_package_context(base_prompt)
    return (
        role
        + "\n\n# IMMUTABLE AUDIT BINDING\n"
        + f"START={start}\nTREE={tree}\ncandidate_patch_sha256={patch_hash}\n"
        + "changed_files=" + json.dumps(changed_files, ensure_ascii=False) + "\n"
        + "\n# BOUNDED AUDIT CONTRACT\n"
        + package_context
        + "\n\nYou have no access to implementation-agent transcripts or reasoning. Audit the candidate from first principles and return the required structured result.\n"
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


def _validate_internal_result(result: dict[str, Any], expected_hash: str) -> tuple[str, list[dict[str, Any]]]:
    status = result.get("status")
    if status not in {"CLEAN", "MATERIAL_FINDINGS", "BLOCKED"}:
        raise RunnerError("Internal Expert status invalid")
    if result.get("candidate_patch_sha256") != expected_hash:
        raise RunnerError("Internal Expert candidate patch hash mismatch")
    lanes = result.get("lanes")
    if not isinstance(lanes, dict):
        raise RunnerError("Internal Expert lane evidence missing")
    if any(lanes.get(lane) != "COMPLETED" for lane in FIVE_LANES):
        if status != "BLOCKED":
            raise RunnerError("Internal Expert attempted terminal non-BLOCKED result with incomplete lanes")
    findings = result.get("material_findings")
    if not isinstance(findings, list):
        raise RunnerError("Internal Expert material_findings must be a list")
    normalized: list[dict[str, Any]] = []
    required = {
        "finding_id",
        "severity",
        "root_family",
        "witness",
        "expected",
        "observed",
        "affected_paths",
        "violated_invariant",
        "reproduction",
    }
    for item in findings:
        if not isinstance(item, dict) or not required.issubset(item):
            raise RunnerError("Internal Expert finding is missing required structured fields")
        if item.get("severity") != "MATERIAL":
            raise RunnerError("Internal Expert finding severity must be MATERIAL")
        normalized.append({key: item[key] for key in sorted(required)})
    if status == "CLEAN":
        if normalized:
            raise RunnerError("Internal Expert CLEAN contains material findings")
        if result.get("residual_uncertainty") not in {"NONE", None, ""}:
            raise RunnerError("Internal Expert CLEAN contains residual uncertainty")
    if status == "MATERIAL_FINDINGS" and not normalized:
        raise RunnerError("Internal Expert MATERIAL_FINDINGS contains no findings")
    return str(status), normalized


def _append_host_clean_checkpoint(checkpoints: Path, patch_hash: str, cycle: int) -> Snapshot:
    state = parse_checkpoint_file(checkpoints)
    lines = [
        "QORE_CHECKPOINT_BEGIN",
        f"package_id: {state.package_id}",
        f"checkpoint_sequence: {state.checkpoint_count}",
        "phase: HOST_INDEPENDENT_INTERNAL_EXPERT_CLEAN",
        f"binding: START={state.start} TREE={state.tree}",
        f"evidence: independent_internal_expert_policy=QORE-HARNESS-INDEPENDENT-DUAL-AGENT-POLICY-V1",
        f"evidence: independent_internal_expert_cycle={cycle}",
        f"evidence: candidate_patch_sha256={patch_hash}",
        "evidence: engineer_transcript_shared_with_internal_expert=false",
        "evidence: internal_expert_transcript_shared_with_engineer=false",
        "evidence: internal_expert_session_fresh=true",
        "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN",
        "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN",
        "PENDING NEXT ACTION: deterministic candidate scope gate and external FULL QG",
        "SAFE RESUME INSTRUCTION: CLEAN is reusable only for the exact candidate_patch_sha256 above; any candidate mutation requires a fresh independent Internal Expert session",
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
    reviewer_root = _reviewer_root()
    template_home = Path(os.environ.get("DSH_HOME", "")).resolve()
    if not template_home.is_dir():
        parser.error("DSH_HOME template is missing")
    base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    local_checkpoint = _prepare_engineer_checkpoint(args.checkpoints, workspace)
    _, local_patch = _workspace_paths(workspace)
    role_root = Path(tempfile.mkdtemp(prefix="qore-independent-dual-", dir=os.environ.get("RUNNER_TEMP") or None))

    attempts: list[dict[str, Any]] = []
    audit_history: list[dict[str, Any]] = []
    pending_findings: list[dict[str, Any]] | None = None
    terminal_reason = "INDEPENDENT_DUAL_AGENT_GENERATIONS_EXHAUSTED"
    final_rc = 70
    final_patch_hash: str | None = None
    started = time.monotonic()
    call_budget = args.max_generations * 3
    call_count = 0
    audit_cycle = 0

    try:
        while call_count < call_budget:
            state = parse_checkpoint_file(args.checkpoints)
            if state.blocked:
                terminal_reason = "MATERIAL_BLOCKED_FROM_ENGINEERING_CHECKPOINT"
                final_rc = 2
                break

            remaining = _cost_window_remaining_seconds()
            if remaining is not None and remaining < MIN_SESSION_SECONDS:
                terminal_reason = "COST_WINDOW_CUTOFF_21_25_AMERICA_ASUNCION"
                final_rc = 79
                break
            timeout = args.generation_timeout_seconds
            if remaining is not None:
                timeout = max(MIN_SESSION_SECONDS, min(timeout, remaining))

            needs_engineer = pending_findings is not None or not _engineering_complete(state)
            if needs_engineer:
                call_count += 1
                before = state
                _atomic_write(local_checkpoint, args.checkpoints.read_text(encoding="utf-8"))
                engineer_home = _fresh_role_home(template_home, role_root / f"engineer-{call_count}")
                prompt = _engineer_role_prompt(
                    base_prompt=base_prompt,
                    host_checkpoint=args.checkpoints,
                    findings=pending_findings,
                    patch_path=local_patch,
                )
                rc, text, timed_out = _run_role(
                    dsh_bin=args.dsh_bin,
                    profile=args.profile,
                    prompt=prompt,
                    timeout_seconds=timeout,
                    role_home=engineer_home,
                    cwd=workspace,
                    permission_mode="workspace-write",
                )
                _append_output(
                    args.output,
                    role="ENGINEER",
                    cycle=call_count,
                    rc=rc,
                    timed_out=timed_out,
                    text=text,
                )
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
                attempts.append(
                    {
                        "role": "ENGINEER",
                        "call": call_count,
                        "exit_code": rc,
                        "timed_out": timed_out,
                        "checkpoint_count": state.checkpoint_count,
                        "completed_lanes": state.completed,
                        "pending_lanes": state.pending,
                        "candidate_patch_sha256": patch_hash,
                        "changed_files": changed_files,
                        "received_findings_count": len(pending_findings or []),
                    }
                )
                pending_findings = None
                if rc != 0 or not _engineering_complete(state):
                    continue
                if ENGINEERING_BLOCKED in text:
                    terminal_reason = "ENGINEERING_BLOCKED"
                    final_rc = 2
                    break
                # Engineering is complete; always proceed to a fresh independent audit.
                continue

            # Engineering complete: snapshot the exact patch and audit it in isolation.
            final_patch_hash, changed_files = _candidate_patch(workspace, local_patch)
            audit_cycle += 1
            call_count += 1
            audit_workspace = role_root / f"audit-workspace-{audit_cycle}"
            _create_audit_workspace(workspace, local_patch, audit_workspace)
            if _audit_patch_hash(audit_workspace) != final_patch_hash:
                terminal_reason = "AUDIT_WORKSPACE_PATCH_BINDING_MISMATCH"
                final_rc = 66
                break
            audit_home = _fresh_role_home(template_home, role_root / f"internal-expert-{audit_cycle}")
            audit_prompt = _internal_expert_prompt(
                base_prompt=base_prompt,
                patch_hash=final_patch_hash,
                changed_files=changed_files,
                start=str(state.start),
                tree=str(state.tree),
            )
            rc, text, timed_out = _run_role(
                dsh_bin=args.dsh_bin,
                profile=args.profile,
                prompt=audit_prompt,
                timeout_seconds=timeout,
                role_home=audit_home,
                cwd=audit_workspace,
                permission_mode="workspace-write",
            )
            _append_output(
                args.output,
                role="INTERNAL_EXPERT",
                cycle=audit_cycle,
                rc=rc,
                timed_out=timed_out,
                text=text,
            )
            after_hash = _audit_patch_hash(audit_workspace)
            audit_record: dict[str, Any] = {
                "cycle": audit_cycle,
                "exit_code": rc,
                "timed_out": timed_out,
                "candidate_patch_sha256": final_patch_hash,
                "audit_workspace_patch_sha256_after": after_hash,
                "fresh_session": True,
                "engineer_transcript_shared": False,
                "previous_audit_transcript_shared": False,
            }
            if after_hash != final_patch_hash:
                audit_record["status"] = "BLOCKED_AUDITOR_MUTATED_CANDIDATE"
                audit_history.append(audit_record)
                terminal_reason = "INTERNAL_EXPERT_MUTATED_ISOLATED_CANDIDATE"
                final_rc = 67
                break
            if rc != 0:
                audit_record["status"] = "RECOVERY_REQUIRED"
                audit_history.append(audit_record)
                attempts.append({"role": "INTERNAL_EXPERT", **audit_record})
                continue
            try:
                result = _parse_internal_result(text)
                status, findings = _validate_internal_result(result, final_patch_hash)
            except RunnerError as exc:
                audit_record["status"] = "INVALID_RESULT"
                audit_record["error"] = str(exc)
                audit_history.append(audit_record)
                attempts.append({"role": "INTERNAL_EXPERT", **audit_record})
                continue
            audit_record["status"] = status
            audit_record["finding_count"] = len(findings)
            audit_history.append(audit_record)
            attempts.append({"role": "INTERNAL_EXPERT", **audit_record})

            if status == "BLOCKED":
                terminal_reason = "INTERNAL_EXPERT_BLOCKED"
                final_rc = 2
                break
            if status == "MATERIAL_FINDINGS":
                pending_findings = findings
                # Any finding forces repair by Engineer and a completely fresh full re-audit.
                continue
            if status == "CLEAN":
                final_state = _append_host_clean_checkpoint(
                    args.checkpoints,
                    final_patch_hash,
                    audit_cycle,
                )
                if not final_state.all_complete:
                    terminal_reason = "HOST_CLEAN_MARKERS_DID_NOT_CLOSE_STATE"
                    final_rc = 68
                    break
                with args.output.open("a", encoding="utf-8") as handle:
                    handle.write(
                        "\n## RESUME STATE\nCOMPLETE\n"
                        "## ENGINEER VERDICT\n"
                        f"{FINAL_READY}\n"
                    )
                terminal_reason = "CANDIDATE_COMPLETE"
                final_rc = 0
                break

    except (RunnerError, OSError, subprocess.SubprocessError, StateError) as exc:
        terminal_reason = f"RUNNER_ERROR:{type(exc).__name__}:{exc}"
        final_rc = 69
    finally:
        elapsed = int(time.monotonic() - started)
        meta = {
            "schema": "qore-harness-independent-dual-agent-runner-v1",
            "policy": "QORE-HARNESS-INDEPENDENT-DUAL-AGENT-POLICY-V1",
            "terminal_reason": terminal_reason,
            "exit_code": final_rc,
            "elapsed_seconds": elapsed,
            "attempts": attempts,
            "audit_history": audit_history,
            "independent_roles": True,
            "engineer_transcript_shared_with_internal_expert": False,
            "internal_expert_transcript_shared_with_engineer": False,
            "fresh_internal_expert_each_audit": True,
            "final_candidate_patch_sha256": final_patch_hash,
            "calls_used": call_count,
            "call_budget": call_budget,
        }
        _metadata_write(args.metadata, meta)
        shutil.rmtree(role_root, ignore_errors=True)

    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
