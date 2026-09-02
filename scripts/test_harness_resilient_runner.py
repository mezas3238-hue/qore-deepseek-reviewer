#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import harness_resilient_runner as runner
from harness_large_batch_state import write_initial


def append_checkpoint(path: Path, seq: int, states: dict[int, str], generation: int) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write("QORE_CHECKPOINT_BEGIN\n")
        handle.write(f"checkpoint_sequence: {seq}\n")
        handle.write(f"phase: TEST_GENERATION_{generation}\n")
        for lane, state in states.items():
            handle.write(
                f"QORE_LANE_STATE lane={lane} state={state} generation={generation}\n"
            )
        handle.write("PENDING NEXT ACTION: continue pending lanes\n")
        handle.write("SAFE RESUME INSTRUCTION: never repeat completed lanes\n")
        handle.write("QORE_CHECKPOINT_END\n")


class HarnessResilientRunnerTests(unittest.TestCase):
    def _invoke(self, fake_run_once, checkpoints: Path, root: Path) -> tuple[int, dict[str, object]]:
        prompt = root / "prompt.md"
        prompt.write_text("BASE PROMPT", encoding="utf-8")
        output = root / "out.md"
        metadata = root / "meta.json"
        argv = [
            "harness_resilient_runner.py",
            "--dsh-bin",
            str(root / "fake-dsh"),
            "--prompt-file",
            str(prompt),
            "--checkpoints",
            str(checkpoints),
            "--output",
            str(output),
            "--metadata",
            str(metadata),
            "--max-generations",
            "4",
            "--generation-timeout-seconds",
            "60",
        ]
        with patch.object(sys, "argv", argv), patch.object(runner, "_run_once", side_effect=fake_run_once):
            rc = runner.main()
        return rc, json.loads(metadata.read_text(encoding="utf-8"))

    def test_one_delayed_lane_recovers_without_repeating_completed_lanes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)
            append_checkpoint(
                checkpoints,
                1,
                {1: "COMPLETED", 2: "RUNNING", 3: "COMPLETED", 4: "COMPLETED", 5: "COMPLETED", 6: "COMPLETED"},
                1,
            )
            calls: list[str] = []

            def fake(**kwargs):
                calls.append(kwargs["prompt"])
                if len(calls) == 1:
                    return 1, "Lane 2 is still running. I'll pause here."
                append_checkpoint(checkpoints, 2, {2: "COMPLETED"}, 2)
                return 0, "## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n"

            rc, meta = self._invoke(fake, checkpoints, root)
            self.assertEqual(rc, 0)
            self.assertEqual(meta["terminal_reason"], "CANDIDATE_COMPLETE")
            self.assertEqual(meta["recovery_generations_used"], 1)
            self.assertIn("inherited_completed_lanes=[1, 3, 4, 5, 6]", calls[1])
            self.assertIn("pending_or_recovery_lanes=[2]", calls[1])

    def test_nonzero_exit_with_progress_is_recoverable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)
            count = 0

            def fake(**_kwargs):
                nonlocal count
                count += 1
                if count == 1:
                    append_checkpoint(checkpoints, 1, {1: "COMPLETED", 2: "RECOVERY_REQUIRED"}, 1)
                    return 17, "interrupted"
                append_checkpoint(
                    checkpoints,
                    2,
                    {2: "COMPLETED", 3: "COMPLETED", 4: "COMPLETED", 5: "COMPLETED", 6: "COMPLETED"},
                    2,
                )
                return 0, "## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n"

            rc, meta = self._invoke(fake, checkpoints, root)
            self.assertEqual(rc, 0)
            self.assertEqual(len(meta["attempts"]), 2)

    def test_corrupt_checkpoint_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)

            def fake(**_kwargs):
                with checkpoints.open("a", encoding="utf-8") as handle:
                    handle.write("QORE_CHECKPOINT_BEGIN\n")
                return 1, "partial"

            prompt = root / "prompt.md"
            prompt.write_text("BASE", encoding="utf-8")
            output = root / "out.md"
            metadata = root / "meta.json"
            argv = [
                "harness_resilient_runner.py", "--dsh-bin", str(root / "fake"),
                "--prompt-file", str(prompt), "--checkpoints", str(checkpoints),
                "--output", str(output), "--metadata", str(metadata),
                "--generation-timeout-seconds", "60",
            ]
            with patch.object(sys, "argv", argv), patch.object(runner, "_run_once", side_effect=fake):
                rc = runner.main()
            self.assertEqual(rc, 65)
            meta = json.loads(metadata.read_text(encoding="utf-8"))
            self.assertTrue(str(meta["terminal_reason"]).startswith("CORRUPT_CHECKPOINT:"))


if __name__ == "__main__":
    unittest.main()
