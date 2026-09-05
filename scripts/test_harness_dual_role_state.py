#!/usr/bin/env python3
from __future__ import annotations

import unittest

from harness_large_batch_state import StateError, parse_checkpoint_text

START = "a" * 40
TREE = "b" * 40
PACKAGE = "HARNESS-ENGINEER-QORE-TEST-ONE-SHOT-001"


def checkpoint(*extra: str, package: str = PACKAGE) -> str:
    lines = [
        "QORE_CHECKPOINT_BEGIN",
        f"package_id: {package}",
        f"binding: START={START} TREE={TREE}",
    ]
    for lane in range(1, 7):
        lines.append(f"QORE_LANE_STATE lane={lane} state=COMPLETED generation=1")
        lines.append(
            f"QORE_SUBAGENT_STATE lane={lane} id=agent-{lane} state=COMPLETED generation=1"
        )
    lines.extend(extra)
    lines.extend(
        [
            "PENDING NEXT ACTION: external QG",
            "SAFE RESUME INSTRUCTION: preserve exact candidate",
            "QORE_CHECKPOINT_END",
            "",
        ]
    )
    return "\n".join(lines)


class HarnessDualRoleStateTests(unittest.TestCase):
    def test_engineer_package_is_not_complete_without_internal_expert_clean(self) -> None:
        state = parse_checkpoint_text(checkpoint(), require_binding=True)
        self.assertTrue(state.dual_role_required)
        self.assertTrue(state.all_subagents_complete)
        self.assertFalse(state.internal_expert_clean)
        self.assertFalse(state.dual_role_gate_passed)
        self.assertFalse(state.all_complete)

    def test_only_internal_expert_clean_marker_is_not_enough(self) -> None:
        state = parse_checkpoint_text(
            checkpoint("HARNESS_INTERNAL_EXPERT_STATUS: CLEAN"),
            require_binding=True,
        )
        self.assertTrue(state.internal_expert_clean)
        self.assertFalse(state.dual_role_complete)
        self.assertFalse(state.all_complete)

    def test_only_dual_role_marker_is_not_enough(self) -> None:
        state = parse_checkpoint_text(
            checkpoint(
                "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN"
            ),
            require_binding=True,
        )
        self.assertFalse(state.internal_expert_clean)
        self.assertTrue(state.dual_role_complete)
        self.assertFalse(state.all_complete)

    def test_engineer_package_completes_only_with_both_exact_markers(self) -> None:
        state = parse_checkpoint_text(
            checkpoint(
                "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN",
                "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN",
            ),
            require_binding=True,
        )
        self.assertTrue(state.dual_role_gate_passed)
        self.assertTrue(state.all_complete)
        payload = state.as_dict()
        self.assertTrue(payload["dual_role_required"])
        self.assertTrue(payload["internal_expert_clean"])
        self.assertTrue(payload["dual_role_complete"])
        self.assertTrue(payload["dual_role_gate_passed"])

    def test_invalid_internal_expert_status_fails_closed(self) -> None:
        with self.assertRaises(StateError):
            parse_checkpoint_text(
                checkpoint("HARNESS_INTERNAL_EXPERT_STATUS: PASSISH"),
                require_binding=True,
            )

    def test_invalid_dual_role_status_fails_closed(self) -> None:
        with self.assertRaises(StateError):
            parse_checkpoint_text(
                checkpoint("HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE"),
                require_binding=True,
            )

    def test_dual_role_state_outside_checkpoint_fails_closed(self) -> None:
        text = checkpoint(
            "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN",
            "HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN",
        )
        text += "HARNESS_INTERNAL_EXPERT_STATUS: CLEAN\n"
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)

    def test_non_engineer_fixture_packages_retain_generic_state_semantics(self) -> None:
        state = parse_checkpoint_text(checkpoint(package="PKG"), require_binding=True)
        self.assertFalse(state.dual_role_required)
        self.assertTrue(state.all_subagents_complete)
        self.assertTrue(state.all_complete)


if __name__ == "__main__":
    unittest.main()
