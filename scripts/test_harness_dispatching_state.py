#!/usr/bin/env python3
from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from harness_large_batch_state import _restore_recovery_journal, parse_checkpoint_text

START = "a" * 40
TREE = "b" * 40


def journal() -> str:
    return "\n".join([
        "QORE_CHECKPOINT_BEGIN",
        "package_id: PREDECESSOR",
        "checkpoint_sequence: 1",
        f"binding: START={START} TREE={TREE}",
        "QORE_LANE_STATE lane=1 state=DISPATCHING generation=1",
        "QORE_SUBAGENT_STATE lane=1 id=agent-1 state=DISPATCHING generation=1",
        "PENDING NEXT ACTION: collect lane 1",
        "SAFE RESUME INSTRUCTION: preserve exact binding",
        "QORE_CHECKPOINT_END",
        "",
    ])


class DispatchingStateTests(unittest.TestCase):
    def test_dispatching_is_valid_pending_state(self) -> None:
        state = parse_checkpoint_text(journal(), require_binding=True)
        self.assertEqual(state.lanes[1], "DISPATCHING")
        self.assertEqual(state.subagent_states[1], "DISPATCHING")
        self.assertIn(1, state.pending)
        self.assertFalse(state.all_complete)

    def test_dispatching_becomes_recovery_required_on_successor_import(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.md"
            destination = root / "destination.md"
            source.write_text(journal(), encoding="utf-8")
            with patch.dict(os.environ, {"RECOVERY_ARTIFACT_ID": "9971823948"}, clear=False):
                state = _restore_recovery_journal(
                    destination,
                    package_id="SUCCESSOR",
                    start=START,
                    tree=TREE,
                    source=source,
                )
            self.assertEqual(state.lanes[1], "RECOVERY_REQUIRED")
            self.assertEqual(state.subagent_states[1], "RECOVERY_REQUIRED")
            self.assertEqual(state.generations[1], 2)
            self.assertEqual(state.subagent_generations[1], 2)


if __name__ == "__main__":
    unittest.main()
