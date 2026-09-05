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

from harness_large_batch_state import parse_checkpoint_file
from harness_resilient_runner import (
    MIN_SESSION_SECONDS,
    RunnerError,
    _append_host_clean_checkpoint,
    _append_output,
    _audit_patch_hash,
    _candidate_patch,
    _cost_window_remaining_seconds,
    _create_audit_workspace,
    _fresh_role_home,
    _internal_expert_prompt,
    _metadata_write,
    _parse_internal_result,
    _replace_workspace_candidate,
    _run_role,
    _validate_internal_result,
)

SCHEMA = "qore-internal-expert-direct-recovery-runner-v1"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dsh-bin", type=Path, required=True)
    parser.add_argument("--profile", default="headless")
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--expected-patch-sha256", required=True)
    parser.add_argument("--max-sessions", type=int, default=4)
    parser.add_argument("--session-timeout-seconds", type=int, default=2100)
    args = parser.parse_args()

    if args.max_sessions < 1 or args.max_sessions > 8:
        parser.error("max-sessions must be in [1, 8]")
    if args.session_timeout_seconds < MIN_SESSION_SECONDS:
        parser.error("session timeout is too small")
    if len(args.expected_patch_sha256) != 64:
        parser.error("expected patch sha256 must be 64 hex characters")

    workspace = Path.cwd().resolve()
    template_home = Path(os.environ.get("DSH_HOME", "")).resolve()
    if not template_home.is_dir():
        parser.error("DSH_HOME template is missing")

    args.output.write_text("", encoding="utf-8")
    recovery_dir = workspace / ".qore-harness-recovery"
    recovery_dir.mkdir(parents=True, exist_ok=True)
    canonical_patch = recovery_dir / "candidate.patch"

    initial_hash, initial_changed = _candidate_patch(workspace, canonical_patch)
    if initial_hash != args.expected_patch_sha256:
        raise SystemExit(
            f"recovered candidate hash mismatch: expected={args.expected_patch_sha256} actual={initial_hash}"
        )

    state = parse_checkpoint_file(args.checkpoints)
    role_root = Path(
        tempfile.mkdtemp(prefix="qore-internal-expert-recovery-", dir=os.environ.get("RUNNER_TEMP") or None)
    )
    audit_workspace = role_root / "audit-workspace"
    attempts: list[dict[str, object]] = []
    audit_sessions = 0
    final_hash: str | None = None
    final_repairs = 0
    final_passes = 0
    terminal_reason = "INTERNAL_EXPERT_RECOVERY_SESSION_BUDGET_EXHAUSTED"
    final_rc = 70
    started = time.monotonic()

    try:
        _create_audit_workspace(workspace, canonical_patch, audit_workspace)
        if _audit_patch_hash(audit_workspace) != initial_hash:
            raise RunnerError("initial isolated audit workspace does not match recovered candidate")
        audit_home = _fresh_role_home(template_home, role_root / "internal-expert")

        while audit_sessions < args.max_sessions:
            remaining = _cost_window_remaining_seconds()
            if remaining is not None and remaining < MIN_SESSION_SECONDS:
                terminal_reason = "COST_WINDOW_CUTOFF_21_25_AMERICA_ASUNCION"
                final_rc = 79
                break
            timeout = args.session_timeout_seconds
            if remaining is not None:
                timeout = max(MIN_SESSION_SECONDS, min(timeout, remaining))

            audit_sessions += 1
            current_patch = role_root / f"audit-current-{audit_sessions}.patch"
            current_hash, current_changed = _candidate_patch(audit_workspace, current_patch)
            rc, text, timed_out = _run_role(
                dsh_bin=args.dsh_bin,
                profile=args.profile,
                prompt=_internal_expert_prompt(
                    initial_hash=initial_hash,
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
                role="INTERNAL_EXPERT_RECOVERY",
                cycle=audit_sessions,
                rc=rc,
                timed_out=timed_out,
                text=text,
            )
            actual_after = _audit_patch_hash(audit_workspace)
            record: dict[str, object] = {
                "session": audit_sessions,
                "exit_code": rc,
                "timed_out": timed_out,
                "candidate_patch_sha256_before": current_hash,
                "candidate_patch_sha256_after": actual_after,
                "engineer_sessions": 0,
                "engineer_identity_known": False,
                "engineer_transcript_shared": False,
            }
            if rc != 0:
                record["status"] = "RECOVERY_REQUIRED"
                attempts.append(record)
                continue

            try:
                result = _parse_internal_result(text)
                status, audit_pass_count, repair_count = _validate_internal_result(
                    result,
                    initial_hash=initial_hash,
                    actual_final_hash=actual_after,
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
            if exported_hash != actual_after:
                raise RunnerError("final audit patch changed during export")
            _replace_workspace_candidate(workspace, final_patch)
            canonical_hash, _ = _candidate_patch(workspace, canonical_patch)
            if canonical_hash != exported_hash:
                raise RunnerError("canonical candidate differs from Internal Expert CLEAN patch")

            final_hash = canonical_hash
            final_repairs = repair_count
            final_passes = audit_pass_count
            final_state = _append_host_clean_checkpoint(
                args.checkpoints,
                initial_hash=initial_hash,
                final_hash=final_hash,
                audit_pass_count=audit_pass_count,
                repair_count=repair_count,
            )
            if not final_state.internal_expert_clean:
                raise RunnerError("host failed to persist Internal Expert CLEAN marker")
            with args.output.open("a", encoding="utf-8") as handle:
                handle.write(
                    "\n## RESUME STATE\nCOMPLETE\n"
                    "## RECOVERY VERDICT\nINTERNAL_WORK_COMPLETE_FOR_IA_ADJUDICATION\n"
                )
            terminal_reason = "CANDIDATE_COMPLETE"
            final_rc = 0
            break

    except (RunnerError, OSError, subprocess.SubprocessError) as exc:
        terminal_reason = f"RUNNER_ERROR:{type(exc).__name__}:{exc}"
        final_rc = 69
    finally:
        _metadata_write(
            args.metadata,
            {
                "schema": SCHEMA,
                "terminal_reason": terminal_reason,
                "exit_code": final_rc,
                "elapsed_seconds": int(time.monotonic() - started),
                "audit_recovery_only": True,
                "ia_authorized_recovered_candidate": True,
                "engineer_sessions": 0,
                "engineer_reentered_after_recovery_handoff": False,
                "internal_expert_knows_engineer_identity": False,
                "implementation_package_context_shared_with_internal_expert": False,
                "internal_expert_can_repair": True,
                "internal_expert_reaudits_after_repairs": True,
                "initial_candidate_patch_sha256": initial_hash,
                "initial_changed_files": initial_changed,
                "final_candidate_patch_sha256": final_hash,
                "final_internal_expert_repair_count": final_repairs,
                "final_internal_expert_audit_pass_count": final_passes,
                "internal_expert_sessions": audit_sessions,
                "attempts": attempts,
            },
        )
        shutil.rmtree(role_root, ignore_errors=True)

    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
