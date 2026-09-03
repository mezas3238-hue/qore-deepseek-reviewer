#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from harness_large_batch_state import (
    StateError,
    parse_checkpoint_file,
    parse_checkpoint_text,
    write_initial,
)

START = "a" * 40
TREE = "b" * 40
PACKAGE = "PKG"


def cp(*lane_lines: str) -> str:
    return "\n".join(
        [
            "QORE_CHECKPOINT_BEGIN",
            "checkpoint_sequence: 1",
            *lane_lines,
            "PENDING NEXT ACTION: continue",
            "SAFE RESUME INSTRUCTION: inherit completed lanes",
            "QORE_CHECKPOINT_END",
            "",
        ]
    )


def bound_cp(*lane_lines: str, package: str = PACKAGE, start: str = START, tree: str = TREE) -> str:
    return cp(
        f"package_id: {package}",
        f"binding: START={start} TREE={tree}",
        *lane_lines,
    )


def annotated_bound_cp(annotation: str, *lane_lines: str) -> str:
    return cp(
        f"package_id: {PACKAGE}",
        f"binding: START={START} TREE={TREE} {annotation}",
        *lane_lines,
    )


class HarnessLargeBatchStateTests(unittest.TestCase):
    def test_delayed_lane_does_not_invalidate_completed_lanes(self) -> None:
        text = cp(
            "QORE_LANE_STATE lane=1 state=COMPLETED generation=1",
            "QORE_LANE_STATE lane=2 state=RUNNING generation=1",
            "QORE_LANE_STATE lane=3 state=COMPLETED generation=1",
            "QORE_LANE_STATE lane=4 state=COMPLETED generation=1",
            "QORE_LANE_STATE lane=5 state=COMPLETED generation=1",
            "QORE_LANE_STATE lane=6 state=COMPLETED generation=1",
        )
        state = parse_checkpoint_text(text)
        self.assertEqual(state.completed, [1, 3, 4, 5, 6])
        self.assertEqual(state.pending, [2])
        self.assertFalse(state.all_complete)

    def test_interrupted_lane_can_be_recovery_required(self) -> None:
        state = parse_checkpoint_text(
            cp("QORE_LANE_STATE lane=2 state=RECOVERY_REQUIRED generation=2")
        )
        self.assertEqual(state.pending, [1, 2, 3, 4, 5, 6])
        self.assertEqual(state.generations[2], 2)

    def test_completed_lane_cannot_regress(self) -> None:
        text = cp(
            "QORE_LANE_STATE lane=1 state=COMPLETED generation=1",
            "QORE_LANE_STATE lane=1 state=RUNNING generation=2",
        )
        with self.assertRaises(StateError):
            parse_checkpoint_text(text)

    def test_corrupt_checkpoint_fails_closed(self) -> None:
        with self.assertRaises(StateError):
            parse_checkpoint_text("QORE_CHECKPOINT_BEGIN\n")

    def test_generation_regression_fails_closed(self) -> None:
        text = cp(
            "QORE_LANE_STATE lane=2 state=RUNNING generation=3",
            "QORE_LANE_STATE lane=2 state=RECOVERY_REQUIRED generation=2",
        )
        with self.assertRaises(StateError):
            parse_checkpoint_text(text)

    def test_material_block_is_terminal_lane_state(self) -> None:
        state = parse_checkpoint_text(
            cp("QORE_LANE_STATE lane=4 state=MATERIAL_BLOCKED generation=1")
        )
        self.assertEqual(state.blocked, [4])
        self.assertNotIn(4, state.pending)

    def test_all_six_complete(self) -> None:
        state = parse_checkpoint_text(
            cp(
                *[
                    f"QORE_LANE_STATE lane={lane} state=COMPLETED generation=1"
                    for lane in range(1, 7)
                ]
            )
        )
        self.assertTrue(state.all_complete)
        self.assertEqual(state.pending, [])

    def test_initialization_is_non_destructive(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "journal.md"
            write_initial(path, PACKAGE, START, TREE)
            first = path.read_text(encoding="utf-8")
            self.assertIn("lane=6 state=NOT_STARTED", first)
            with self.assertRaises(StateError):
                write_initial(path, PACKAGE, START, TREE)

    def test_bound_production_journal_retains_package_start_tree(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "journal.md"
            write_initial(path, PACKAGE, START, TREE)
            state = parse_checkpoint_file(path)
            self.assertEqual(state.package_id, PACKAGE)
            self.assertEqual(state.start, START)
            self.assertEqual(state.tree, TREE)

    def test_verified_exact_binding_annotation_is_accepted(self) -> None:
        state = parse_checkpoint_text(
            annotated_bound_cp(
                "VERIFIED_EXACT",
                "QORE_LANE_STATE lane=1 state=COMPLETED generation=1",
            ),
            require_binding=True,
        )
        self.assertEqual(state.start, START)
        self.assertEqual(state.tree, TREE)
        self.assertEqual(state.completed, [1])

    def test_unchanged_binding_annotation_is_accepted(self) -> None:
        state = parse_checkpoint_text(
            annotated_bound_cp(
                "(unchanged)",
                "QORE_LANE_STATE lane=2 state=RUNNING generation=1",
            ),
            require_binding=True,
        )
        self.assertEqual(state.start, START)
        self.assertEqual(state.tree, TREE)
        self.assertEqual(state.generations[2], 1)

    def test_uppercase_unchanged_binding_annotation_from_run_33710144873_is_accepted(self) -> None:
        state = parse_checkpoint_text(
            annotated_bound_cp(
                "(UNCHANGED)",
                "QORE_LANE_STATE lane=1 state=COMPLETED generation=2",
            ),
            require_binding=True,
        )
        self.assertEqual(state.start, START)
        self.assertEqual(state.tree, TREE)
        self.assertEqual(state.completed, [1])
        self.assertEqual(state.generations[1], 2)

    def test_unknown_binding_annotation_fails_closed(self) -> None:
        with self.assertRaises(StateError):
            parse_checkpoint_text(
                annotated_bound_cp(
                    "TRUST_ME",
                    "QORE_LANE_STATE lane=1 state=RUNNING generation=1",
                ),
                require_binding=True,
            )

    def test_package_binding_change_fails_closed(self) -> None:
        text = bound_cp("QORE_LANE_STATE lane=1 state=COMPLETED generation=1")
        text += bound_cp(
            "QORE_LANE_STATE lane=2 state=RUNNING generation=2",
            package="OTHER",
        )
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)

    def test_start_binding_change_fails_closed(self) -> None:
        text = bound_cp("QORE_LANE_STATE lane=1 state=COMPLETED generation=1")
        text += bound_cp(
            "QORE_LANE_STATE lane=2 state=RUNNING generation=2",
            start="c" * 40,
        )
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)

    def test_tree_binding_change_fails_closed(self) -> None:
        text = bound_cp("QORE_LANE_STATE lane=1 state=COMPLETED generation=1")
        text += bound_cp(
            "QORE_LANE_STATE lane=2 state=RUNNING generation=2",
            tree="d" * 40,
        )
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)

    def test_required_binding_missing_fails_closed(self) -> None:
        with self.assertRaises(StateError):
            parse_checkpoint_text(
                cp("QORE_LANE_STATE lane=1 state=RUNNING generation=1"),
                require_binding=True,
            )

    def test_durable_lane_state_outside_checkpoint_fails_closed(self) -> None:
        text = bound_cp("QORE_LANE_STATE lane=1 state=COMPLETED generation=1")
        text += "QORE_LANE_STATE lane=2 state=RUNNING generation=2\n"
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)

    def test_binding_outside_checkpoint_fails_closed(self) -> None:
        text = bound_cp("QORE_LANE_STATE lane=1 state=COMPLETED generation=1")
        text += f"binding: START={START} TREE={TREE}\n"
        with self.assertRaises(StateError):
            parse_checkpoint_text(text, require_binding=True)


if __name__ == "__main__":
    unittest.main()
