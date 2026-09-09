#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from harness_large_batch_state import StateError, parse_checkpoint_file
from harness_resilient_runner import (
    ENGINEERING_BLOCKED,
    FINAL_READY,
    MIN_SESSION_SECONDS,
    RunnerError,
    _append_host_clean_checkpoint,
    _append_output,
    _audit_patch_hash,
    _candidate_patch,
    _cost_window_remaining_seconds,
    _create_audit_workspace,
    _engineering_complete,
    _engineer_role_prompt,
    _fresh_role_home,
    _harvest_engineer_checkpoint,
    _internal_expert_prompt,
    _metadata_write,
    _parse_internal_result,
    _prepare_engineer_checkpoint,
    _replace_workspace_candidate,
    _run_role,
    _validate_internal_result,
    _workspace_paths,
)

RUNNER_SCHEMA = "qore-harness-independent-audit-repair-runner-v3"
POLICY = "QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2"


def _purge_untracked_transients(workspace: Path) -> list[str]:
    """Remove only known transient, untracked test artifacts from the candidate tree."""
    proc = subprocess.run(
        ["git", "ls-files", "--others", "--exclude-standard"],
        cwd=workspace,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        raise RunnerError(f"cannot enumerate untracked files: {proc.stderr.strip()}")

    removed: list[str] = []
    for raw in proc.stdout.splitlines():
        rel = raw.strip()
        if not rel:
            continue
        name = Path(rel).name
        is_transient = (
            name == ".coverage"
            or name.startswith(".coverage-")
            or name.startswith(".coverage.")
            or rel.startswith(".pytest_cache/")
            or rel.startswith("htmlcov/")
        )
        if not is_transient:
            continue
        target = workspace / rel
        if target.is_dir():
            shutil.rmtree(target, ignore_errors=True)
        else:
            target.unlink(missing_ok=True)
        removed.append(rel)
    return sorted(removed)


def _remaining_session_timeout(
    *,
    started: float,
    wall_seconds: int,
    grace_seconds: int,
    configured_session_seconds: int,
) -> int | None:
    wall_remaining = int(wall_seconds - (time.monotonic() - started))
    usable_wall = wall_remaining - grace_seconds
    if usable_wall < MIN_SESSION_SECONDS:
        return None

    cost_remaining = _cost_window_remaining_seconds()
    candidates = [configured_session_seconds, usable_wall]
    if cost_remaining is not None:
        if cost_remaining < MIN_SESSION_SECONDS:
            return None
        candidates.append(cost_remaining)
    timeout = min(candidates)
    if timeout < MIN_SESSION_SECONDS:
        return None
    return timeout


def _write_metadata(
    path: Path,
    *,
    terminal_reason: str,
    final_rc: int,
    started: float,
    attempts: list[dict[str, Any]],
    engineer_sessions: int,
    audit_sessions: int,
    engineer_budget: int,
    audit_budget: int,
    initial_patch_hash: str | None,
    final_patch_hash: str | None,
    final_repair_count: int,
    final_audit_pass_count: int,
    audit_started: bool,
    wall_seconds: int,
    grace_seconds: int,
    removed_transients: list[str],
) -> None:
    _metadata_write(
        path,
        {
            "schema": RUNNER_SCHEMA,
            "policy": POLICY,
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
            "engineer_session_budget": engineer_budget,
            "internal_expert_session_budget": audit_budget,
            "initial_candidate_patch_sha256": initial_patch_hash,
            "final_candidate_patch_sha256": final_patch_hash,
            "final_internal_expert_repair_count": final_repair_count,
            "final_internal_expert_audit_pass_count": final_audit_pass_count,
            "runner_wall_budget_seconds": wall_seconds,
            "runner_deadline_grace_seconds": grace_seconds,
            "removed_untracked_transients": removed_transients,
        },
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dsh-bin", type=Path, required=True)
    parser.add_argument("--profile", default="headless")
    parser.add_argument("--prompt-file", type=Path, required=True)
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--engineer-session-budget", type=int, default=4)
    parser.add_argument("--audit-session-budget", type=int, default=3)
    parser.add_argument("--session-timeout-seconds", type=int, default=1500)
    parser.add_argument("--wall-clock-budget-seconds", type=int, default=10800)
    parser.add_argument("--deadline-grace-seconds", type=int, default=180)
    args = parser.parse_args()

    if args.engineer_session_budget < 1 or args.engineer_session_budget > 8:
        parser.error("engineer-session-budget must be in [1, 8]")
    if args.audit_session_budget < 1 or args.audit_session_budget > 8:
        parser.error("audit-session-budget must be in [1, 8]")
    if args.session_timeout_seconds < MIN_SESSION_SECONDS:
        parser.error("session timeout is too small")
    if args.deadline_grace_seconds < MIN_SESSION_SECONDS:
        parser.error("deadline grace is too small")
    theoretical = (
        args.engineer_session_budget + args.audit_session_budget
    ) * args.session_timeout_seconds
    usable_wall = args.wall_clock_budget_seconds - args.deadline_grace_seconds
    if theoretical > usable_wall:
        parser.error(
            "reserved Engineer+Internal Expert session budgets exceed runner wall budget after grace"
        )

    workspace = Path.cwd().resolve()
    template_home = Path(os.environ.get("DSH_HOME", "")).resolve()
    if not template_home.is_dir():
        parser.error("DSH_HOME template is missing")

    base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    local_checkpoint = _prepare_engineer_checkpoint(args.checkpoints, workspace)
    _, local_patch = _workspace_paths(workspace)
    role_root = Path(
        tempfile.mkdtemp(
            prefix="qore-independent-audit-repair-v3-",
            dir=os.environ.get("RUNNER_TEMP") or None,
        )
    )

    attempts: list[dict[str, Any]] = []
    terminal_reason = "RUNNER_NOT_TERMINATED"
    final_rc = 70
    started = time.monotonic()
    engineer_sessions = 0
    audit_sessions = 0
    initial_patch_hash: str | None = None
    final_patch_hash: str | None = None
    final_repair_count = 0
    final_audit_pass_count = 0
    audit_started = False
    removed_transients: list[str] = []

    try:
        # Phase A: engineering gets its own bounded budget. It cannot consume the audit reserve.
        while engineer_sessions < args.engineer_session_budget:
            state = parse_checkpoint_file(args.checkpoints)
            if state.blocked:
                terminal_reason = "MATERIAL_BLOCKED_FROM_ENGINEERING_CHECKPOINT"
                final_rc = 2
                break
            if _engineering_complete(state):
                break

            timeout = _remaining_session_timeout(
                started=started,
                wall_seconds=args.wall_clock_budget_seconds,
                grace_seconds=args.deadline_grace_seconds,
                configured_session_seconds=args.session_timeout_seconds,
            )
            if timeout is None:
                terminal_reason = "ENGINEERING_DEADLINE_REACHED_WITH_RECOVERY_PRESERVED"
                final_rc = 72
                break

            engineer_sessions += 1
            before = state
            local_checkpoint.write_text(args.checkpoints.read_text(encoding="utf-8"), encoding="utf-8")
            engineer_home = _fresh_role_home(
                template_home, role_root / f"engineer-{engineer_sessions}"
            )
            rc, text, timed_out = _run_role(
                dsh_bin=args.dsh_bin,
                profile=args.profile,
                prompt=_engineer_role_prompt(
                    base_prompt=base_prompt,
                    host_checkpoint=args.checkpoints,
                ),
                timeout_seconds=timeout,
                role_home=engineer_home,
                cwd=workspace,
                permission_mode="workspace-write",
            )
            _append_output(
                args.output,
                role="ENGINEER",
                cycle=engineer_sessions,
                rc=rc,
                timed_out=timed_out,
                text=text,
            )
            try:
                state = _harvest_engineer_checkpoint(
                    args.checkpoints, local_checkpoint, before
                )
            except StateError as exc:
                terminal_reason = f"CORRUPT_ENGINEER_CHECKPOINT:{exc}"
                final_rc = 65
                break

            removed_transients.extend(_purge_untracked_transients(workspace))
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
                    "session": engineer_sessions,
                    "exit_code": rc,
                    "timed_out": timed_out,
                    "completed_lanes": state.completed,
                    "pending_lanes": state.pending,
                    "candidate_patch_sha256": patch_hash,
                    "changed_files": changed_files,
                }
            )
            if ENGINEERING_BLOCKED in text:
                terminal_reason = "ENGINEERING_BLOCKED"
                final_rc = 2
                break

        state = parse_checkpoint_file(args.checkpoints)
        if final_rc in {2, 65, 72}:
            pass
        elif not _engineering_complete(state):
            terminal_reason = "ENGINEERING_SESSION_BUDGET_EXHAUSTED_RECOVERABLY"
            final_rc = 70
        else:
            # Phase B: Internal Expert gets a distinct budget that Engineer cannot consume.
            removed_transients.extend(_purge_untracked_transients(workspace))
            initial_patch_hash, _ = _candidate_patch(workspace, local_patch)
            final_patch_hash = initial_patch_hash
            audit_started = True
            audit_workspace = role_root / "internal-expert-workspace"
            _create_audit_workspace(workspace, local_patch, audit_workspace)
            if _audit_patch_hash(audit_workspace) != initial_patch_hash:
                raise RunnerError("initial audit workspace patch binding mismatch")
            audit_home = _fresh_role_home(template_home, role_root / "internal-expert")

            while audit_sessions < args.audit_session_budget:
                timeout = _remaining_session_timeout(
                    started=started,
                    wall_seconds=args.wall_clock_budget_seconds,
                    grace_seconds=args.deadline_grace_seconds,
                    configured_session_seconds=args.session_timeout_seconds,
                )
                if timeout is None:
                    terminal_reason = "INTERNAL_EXPERT_DEADLINE_REACHED_WITH_RECOVERY_PRESERVED"
                    final_rc = 73
                    break

                audit_sessions += 1
                current_patch = role_root / f"audit-current-{audit_sessions}.patch"
                current_hash, current_changed = _candidate_patch(
                    audit_workspace, current_patch
                )
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
                _append_output(
                    args.output,
                    role="INTERNAL_EXPERT",
                    cycle=audit_sessions,
                    rc=rc,
                    timed_out=timed_out,
                    text=text,
                )
                _purge_untracked_transients(audit_workspace)
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
                removed_transients.extend(_purge_untracked_transients(workspace))
                canonical_hash, _ = _candidate_patch(workspace, local_patch)
                if canonical_hash != exported_hash:
                    raise RunnerError(
                        "canonical candidate differs from Internal Expert CLEAN patch"
                    )

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
                    handle.write(
                        "\n## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\n"
                        + FINAL_READY
                        + "\n"
                    )
                terminal_reason = "CANDIDATE_COMPLETE"
                final_rc = 0
                break
            else:
                terminal_reason = "INTERNAL_EXPERT_SESSION_BUDGET_EXHAUSTED_RECOVERABLY"
                final_rc = 71

    except (RunnerError, OSError, subprocess.SubprocessError, StateError) as exc:
        terminal_reason = f"RUNNER_ERROR:{type(exc).__name__}:{exc}"
        final_rc = 69
    finally:
        # Always leave a machine-readable terminal record before the outer job timeout.
        _write_metadata(
            args.metadata,
            terminal_reason=terminal_reason,
            final_rc=final_rc,
            started=started,
            attempts=attempts,
            engineer_sessions=engineer_sessions,
            audit_sessions=audit_sessions,
            engineer_budget=args.engineer_session_budget,
            audit_budget=args.audit_session_budget,
            initial_patch_hash=initial_patch_hash,
            final_patch_hash=final_patch_hash,
            final_repair_count=final_repair_count,
            final_audit_pass_count=final_audit_pass_count,
            audit_started=audit_started,
            wall_seconds=args.wall_clock_budget_seconds,
            grace_seconds=args.deadline_grace_seconds,
            removed_transients=sorted(set(removed_transients)),
        )
        shutil.rmtree(role_root, ignore_errors=True)

    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
