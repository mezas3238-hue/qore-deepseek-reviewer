#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

import harness_recovery_snapshot as snapshotter


def _git(root: Path, *args: str) -> str:
    return subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout


class HarnessRecoverySnapshotTests(unittest.TestCase):
    def test_snapshot_excludes_internal_recovery_staging(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            root.mkdir()
            _git(root, "init")
            _git(root, "config", "user.name", "QORE Test")
            _git(root, "config", "user.email", "qore-test@example.invalid")

            tracked = root / "tracked.txt"
            tracked.write_text("before\n", encoding="utf-8")
            recovery = root / snapshotter.AGENT_RECOVERY_DIR
            recovery.mkdir()
            tracked_recovery = recovery / "tracked.txt"
            tracked_recovery.write_text("recovery-before\n", encoding="utf-8")
            _git(root, "add", "tracked.txt", f"{snapshotter.AGENT_RECOVERY_DIR}/tracked.txt")
            _git(root, "commit", "-m", "baseline")

            tracked.write_text("after\n", encoding="utf-8")
            tracked_recovery.write_text("recovery-after\n", encoding="utf-8")
            (root / "wanted.txt").write_text("wanted\n", encoding="utf-8")
            (recovery / "candidate.patch").write_text("internal candidate\n", encoding="utf-8")
            (recovery / "checkpoints.md").write_text("internal checkpoint\n", encoding="utf-8")

            output = Path(tmp) / "candidate.patch"
            snapshotter.snapshot(root, output)
            patch = output.read_text(encoding="utf-8")

            self.assertIn("tracked.txt", patch)
            self.assertIn("wanted.txt", patch)
            self.assertNotIn(snapshotter.AGENT_RECOVERY_DIR, patch)
            self.assertNotIn("internal candidate", patch)
            self.assertNotIn("internal checkpoint", patch)
            self.assertNotIn("recovery-after", patch)


if __name__ == "__main__":
    unittest.main()
