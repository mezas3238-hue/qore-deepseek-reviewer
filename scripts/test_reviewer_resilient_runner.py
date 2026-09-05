#!/usr/bin/env python3
from __future__ import annotations

import tempfile
from pathlib import Path

from reviewer_resilient_runner import _host_blocked_report, _recovery_prompt, terminal_disposition


def test_pass_requires_complete_and_no_findings() -> None:
    text = """## RESUME STATE
COMPLETE

## VERDICT
HALLAZGOS: NINGUNO
VALIDACIÓN OK
"""
    assert terminal_disposition(text) == "PASS"


def test_pass_without_complete_is_not_terminal() -> None:
    text = """Status: lanes are still executing.
## VERDICT
HALLAZGOS: NINGUNO
VALIDACIÓN OK
"""
    assert terminal_disposition(text) is None


def test_material_finding_is_terminal_when_complete() -> None:
    text = """## RESUME STATE
COMPLETE

## VERDICT
VALIDACIÓN NO OK
"""
    assert terminal_disposition(text) == "MATERIAL_FINDINGS"


def test_explicit_blocked_is_terminal() -> None:
    text = """## RESUME STATE
INTERRUPTED — CONTINUE FROM: L4

## VERDICT
VALIDATION BLOCKED
missing_lane=L4
"""
    assert terminal_disposition(text) == "BLOCKED"


def test_interim_progress_never_becomes_terminal() -> None:
    text = """Status: all four lanes are still executing. Awaiting lane results.
## RESUME STATE
INTERRUPTED — CONTINUE FROM: collect L1,L2,L4,L5
"""
    assert terminal_disposition(text) is None


def test_recovery_prompt_carries_only_latest_complete_checkpoint() -> None:
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "cp.md"
        path.write_text(
            """QORE_CHECKPOINT_BEGIN
checkpoint_sequence: 1
completed: L3
PENDING NEXT ACTION: collect L1
SAFE RESUME INSTRUCTION: preserve L3
QORE_CHECKPOINT_END
QORE_CHECKPOINT_BEGIN
checkpoint_sequence: 2
completed: L3,L1
PENDING NEXT ACTION: collect L2
SAFE RESUME INSTRUCTION: preserve L3,L1
QORE_CHECKPOINT_END
""",
            encoding="utf-8",
        )
        prompt = _recovery_prompt("BASE", generation=2, prior_rc=1, checkpoints=path)
        assert "checkpoint_sequence: 2" in prompt
        assert "checkpoint_sequence: 1" not in prompt
        assert "LANE LAUNCHED != LANE COMPLETED" in prompt
        assert "MUST NOT be relaunched" in prompt


def test_host_blocked_is_contractual_terminal() -> None:
    report = _host_blocked_report(reason="X", generations=4, checkpoint="cp")
    assert terminal_disposition(report) == "BLOCKED"
    assert "VALIDATION BLOCKED" in report
    assert "reason: X" in report


def main() -> None:
    tests = [name for name in globals() if name.startswith("test_")]
    for name in tests:
        globals()[name]()
    print(f"reviewer resilient runner tests passed: {len(tests)}")


if __name__ == "__main__":
    main()
