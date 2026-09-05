#!/usr/bin/env python3
from __future__ import annotations

from harness_large_batch_state import parse_checkpoint_file
import harness_resilient_runner as core


def _blind_engineer_role_prompt(*, base_prompt: str, host_checkpoint):
    role = (
        core._reviewer_root()
        / "harness/engineer/prompts/qore-harness-engineer-independent-v1.md"
    ).read_text(encoding="utf-8")
    snapshot = parse_checkpoint_file(host_checkpoint)
    return (
        role
        + "\n\n# BOUNDED PACKAGE CONTEXT\n"
        + core._extract_package_context(base_prompt)
        + "\n\n# HOST ENGINEERING STATE\n"
        + f"package_id={snapshot.package_id}\n"
        + f"expected_start={snapshot.start}\n"
        + f"expected_tree={snapshot.tree}\n"
        + f"completed_engineering_lanes={snapshot.completed}\n"
        + f"pending_engineering_lanes={snapshot.pending}\n"
        + f"checkpoint_path={core.AGENT_RECOVERY_DIR}/checkpoints.md\n"
        + f"recovery_patch_path={core.AGENT_RECOVERY_DIR}/candidate.patch\n"
        + "\nComplete engineering independently. When all six engineering lanes are complete, emit ENGINEERING_READY_FOR_HOST_HANDOFF and hand the exact candidate to the deterministic host. No downstream process information is available in this role.\n"
    )


def main() -> int:
    # Hard override for the V2 route: implementation never learns that an auditor exists.
    core._engineer_role_prompt = _blind_engineer_role_prompt
    return core.main()


if __name__ == "__main__":
    raise SystemExit(main())
