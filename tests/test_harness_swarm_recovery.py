from __future__ import annotations

import importlib.util
import pathlib

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "scripts" / "harness_swarm_recovery.py"
spec = importlib.util.spec_from_file_location("harness_swarm_recovery", MODULE_PATH)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

START = "5a158ef0fb2e21db95f2be0685373780bf1ab197"
TREE = "5e2b37b23b01fe23fd373d39b01573e9607a73ad"
PKG = "HARNESS-ENGINEER-QORE-DEMO-INTELLIGENCE-SLICE-001-BATCH-001"


def cp(seq: int, body: str) -> str:
    return (
        "QORE_CHECKPOINT_BEGIN\n"
        f"package_id: {PKG}\n"
        f"checkpoint_sequence: {seq}\n"
        f"binding: START={START} TREE={TREE}\n"
        f"{body}\n"
        "PENDING NEXT ACTION: continue bounded recovery\n"
        "SAFE RESUME INSTRUCTION: inherit completed lanes; do not repeat them\n"
        "QORE_CHECKPOINT_END\n"
    )


def classify(text: str, exit_code: int = 1):
    return mod.classify(
        checkpoint_text=text,
        primary_output="Lane 2 is still running. I'll pause here and resume automatically.",
        primary_exit_code=exit_code,
        expected_package_id=PKG,
        expected_start=START,
        expected_tree=TREE,
    )


def test_delayed_lane_recovers_only_lane_2() -> None:
    text = cp(0, "phase: HOST_INITIALIZED")
    for lane in (1, 3, 4, 5, 6):
        text += cp(lane, f"phase: LANE_{lane}\nlane {lane}: COMPLETED\nlane_state: COMPLETED")
    text += cp(7, "phase: LANE_2\nlane 2: RUNNING\nlane_state: RUNNING")
    snapshot = classify(text)
    assert snapshot.termination == mod.TerminationClass.RECOVERABLE
    assert snapshot.completed_lanes == (1, 3, 4, 5, 6)
    assert snapshot.pending_lanes == (2,)
    manifest = mod.recovery_manifest(snapshot)
    assert manifest["run_only_lanes"] == [2]
    assert manifest["prohibit_rerun_lanes"] == [1, 3, 4, 5, 6]
    assert manifest["full_qg_allowed"] is False


def test_nonzero_exit_with_durable_partial_progress_is_recoverable() -> None:
    text = cp(0, "phase: HOST_INITIALIZED") + cp(
        1, "phase: LANE_1\nlane 1: COMPLETED\nlane_state: COMPLETED"
    )
    snapshot = classify(text, exit_code=9)
    assert snapshot.termination == mod.TerminationClass.RECOVERABLE
    assert snapshot.primary_exit_code == 9


def test_completed_lane_cannot_regress() -> None:
    text = cp(0, "phase: HOST_INITIALIZED")
    text += cp(1, "phase: LANE_1\nlane 1: COMPLETED\nlane_state: COMPLETED")
    text += cp(2, "phase: RECOVERY\nlane 1: RUNNING\nlane_state: RUNNING")
    snapshot = classify(text)
    assert snapshot.termination == mod.TerminationClass.INVALID_STATE


def test_material_blocker_remains_terminal() -> None:
    text = cp(0, "phase: HOST_INITIALIZED") + cp(
        1, "phase: LANE_2\nlane 2: MATERIAL_BLOCKED\nlane_state: MATERIAL_BLOCKED"
    )
    snapshot = classify(text)
    assert snapshot.termination == mod.TerminationClass.MATERIAL_BLOCKED
    assert snapshot.blocked_lanes == (2,)


def test_corrupt_checkpoint_fails_closed() -> None:
    snapshot = classify("QORE_CHECKPOINT_BEGIN\npackage_id: bad\n")
    assert snapshot.termination == mod.TerminationClass.INVALID_STATE


def test_binding_change_fails_closed() -> None:
    text = cp(0, "phase: HOST_INITIALIZED")
    text += (
        "QORE_CHECKPOINT_BEGIN\n"
        f"package_id: {PKG}\n"
        "checkpoint_sequence: 1\n"
        f"binding: START={'0' * 40} TREE={TREE}\n"
        "lane 1: COMPLETED\n"
        "lane_state: COMPLETED\n"
        "QORE_CHECKPOINT_END\n"
    )
    snapshot = classify(text)
    assert snapshot.termination == mod.TerminationClass.INVALID_STATE


def test_all_six_complete_allows_full_qg() -> None:
    text = cp(0, "phase: HOST_INITIALIZED")
    for lane in range(1, 7):
        text += cp(lane, f"phase: LANE_{lane}\nlane {lane}: COMPLETED\nlane_state: COMPLETED")
    snapshot = classify(text, exit_code=0)
    assert snapshot.termination == mod.TerminationClass.COMPLETE
    assert snapshot.to_json()["full_qg_allowed"] is True


def test_second_interruption_remains_resumable_and_inherits_completed() -> None:
    text = cp(0, "phase: HOST_INITIALIZED")
    text += cp(1, "recovery_generation: 1\nlane 1: COMPLETED\nlane_state: COMPLETED")
    text += cp(2, "recovery_generation: 1\nlane 2: RECOVERY_REQUIRED\nlane_state: RECOVERY_REQUIRED")
    snapshot = classify(text, exit_code=1)
    assert snapshot.termination == mod.TerminationClass.RECOVERABLE
    manifest = mod.recovery_manifest(snapshot)
    assert manifest["recovery_generation"] == 2
    assert 1 in manifest["prohibit_rerun_lanes"]
    assert 2 in manifest["run_only_lanes"]
