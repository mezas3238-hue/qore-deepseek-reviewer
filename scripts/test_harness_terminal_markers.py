#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from harness_large_batch_state import parse_checkpoint_file, write_initial
from harness_resilient_runner import _append_host_clean_checkpoint

START = "a" * 40
TREE = "b" * 40
PACKAGE = "HARNESS-ENGINEER-TERMINAL-TEST"


def append_engineering_complete(path: Path) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write("QORE_CHECKPOINT_BEGIN\n")
        handle.write(f"package_id: {PACKAGE}\n")
        handle.write("checkpoint_sequence: 1\n")
        handle.write(f"binding: START={START} TREE={TREE}\n")
        for lane in range(1, 7):
            handle.write(f"QORE_LANE_STATE lane={lane} state=COMPLETED generation=1\n")
            handle.write(
                f"QORE_SUBAGENT_STATE lane={lane} id=agent-{lane} state=COMPLETED generation=1\n"
            )
        handle.write("PENDING NEXT ACTION: host validation\n")
        handle.write("SAFE RESUME INSTRUCTION: preserve engineering evidence\n")
        handle.write("QORE_CHECKPOINT_END\n")


class HarnessTerminalMarkerTests(unittest.TestCase):
    def test_engineering_alone_is_not_terminal_clean(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "journal.md"
            write_initial(path, PACKAGE, START, TREE)
            append_engineering_complete(path)
            state = parse_checkpoint_file(path)
            self.assertFalse(state.all_complete)
            self.assertFalse(state.internal_expert_clean)

    def test_host_mints_terminal_clean_only_after_exact_audit(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "journal.md"
            write_initial(path, PACKAGE, START, TREE)
            append_engineering_complete(path)
            digest = "c" * 64
            state = _append_host_clean_checkpoint(path, digest, 1)
            self.assertTrue(state.all_complete)
            text = path.read_text(encoding="utf-8")
            self.assertIn("HARNESS_INTERNAL_EXPERT_STATUS: CLEAN", text)
            self.assertIn(f"candidate_patch_sha256={digest}", text)


if __name__ == "__main__":
    unittest.main()
