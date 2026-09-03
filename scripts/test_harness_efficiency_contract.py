#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import harness_resilient_runner as runner


class HarnessEfficiencyContractTests(unittest.TestCase):
    def test_recovery_static_context_drops_generic_preamble_but_keeps_package_binding(self) -> None:
        prompt = (
            "GENERIC_DISCOVERY_BLOAT\n"
            "# WORK PACKAGE\n"
            "task=bounded-correction\n"
            "# IMMUTABLE EXECUTION BINDING\n"
            f"expected_start={'a' * 40}\n"
            f"expected_tree={'b' * 40}\n"
            "# ALLOWED REPOSITORY PATH SCOPES\n"
            "- src/qore/example.py\n"
        )
        compact = runner._recovery_static_context(prompt)
        self.assertNotIn("GENERIC_DISCOVERY_BLOAT", compact)
        self.assertIn("# WORK PACKAGE", compact)
        self.assertIn("task=bounded-correction", compact)
        self.assertIn(f"expected_start={'a' * 40}", compact)
        self.assertIn(f"expected_tree={'b' * 40}", compact)
        self.assertIn("src/qore/example.py", compact)

    def test_latest_complete_checkpoint_avoids_replaying_older_narrative(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            journal = Path(tmp) / "journal.md"
            journal.write_text(
                "QORE_CHECKPOINT_BEGIN\n"
                "checkpoint_sequence: 1\n"
                "evidence: OLD_REPEATED_DISCOVERY\n"
                "QORE_LANE_STATE lane=1 state=COMPLETED generation=1\n"
                "PENDING NEXT ACTION: lane 2\n"
                "SAFE RESUME INSTRUCTION: keep lane 1\n"
                "QORE_CHECKPOINT_END\n"
                "QORE_CHECKPOINT_BEGIN\n"
                "checkpoint_sequence: 2\n"
                "SHARED_EVIDENCE_MAP SNAPSHOT: map-v2\n"
                "CAUSAL_FAMILY_LEDGER SNAPSHOT: family-v2\n"
                "QORE_LANE_STATE lane=1 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=2 state=RECOVERY_REQUIRED generation=1\n"
                "PENDING NEXT ACTION: finish lane 2\n"
                "SAFE RESUME INSTRUCTION: never repeat lane 1\n"
                "QORE_CHECKPOINT_END\n",
                encoding="utf-8",
            )
            latest = runner._latest_complete_checkpoint(journal)
        self.assertNotIn("OLD_REPEATED_DISCOVERY", latest)
        self.assertIn("SHARED_EVIDENCE_MAP SNAPSHOT: map-v2", latest)
        self.assertIn("CAUSAL_FAMILY_LEDGER SNAPSHOT: family-v2", latest)
        self.assertIn("PENDING NEXT ACTION: finish lane 2", latest)

    def test_recovery_prompt_preserves_quality_laws_and_six_lane_carry_forward(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            journal = Path(tmp) / "journal.md"
            journal.write_text(
                "QORE_CHECKPOINT_BEGIN\n"
                "checkpoint_sequence: 9\n"
                "SHARED_EVIDENCE_MAP SNAPSHOT: stable-map\n"
                "CAUSAL_FAMILY_LEDGER SNAPSHOT: stable-ledger\n"
                "QORE_LANE_STATE lane=1 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=2 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=3 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=4 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=5 state=COMPLETED generation=1\n"
                "QORE_LANE_STATE lane=6 state=RECOVERY_REQUIRED generation=1\n"
                "PENDING NEXT ACTION: finish lane 6\n"
                "SAFE RESUME INSTRUCTION: lanes 1-5 are immutable carry-forward\n"
                "QORE_CHECKPOINT_END\n",
                encoding="utf-8",
            )
            base = (
                "GENERIC_DISCOVERY_BLOAT\n"
                "# WORK PACKAGE\n"
                "task=correction\n"
                "# IMMUTABLE EXECUTION BINDING\n"
                f"expected_start={'a' * 40}\n"
                f"expected_tree={'b' * 40}\n"
            )
            prompt = runner._recovery_prompt(
                base,
                generation=2,
                checkpoints=journal,
                completed=[1, 2, 3, 4, 5],
                pending=[6],
                primary_exit=124,
            )
        self.assertNotIn("GENERIC_DISCOVERY_BLOAT", prompt)
        self.assertIn("SHARED_EVIDENCE_MAP", prompt)
        self.assertIn("CAUSAL_FAMILY_LEDGER", prompt)
        self.assertIn("EFFICIENCY != REDUCED COVERAGE", prompt)
        self.assertIn("COMPACTION != EVIDENCE LOSS", prompt)
        self.assertIn("DEDUPLICATION != WITNESS LOSS", prompt)
        self.assertIn("SMART STOP != EARLY PASS", prompt)
        self.assertIn("Semantic LSP-before/after", prompt)
        self.assertIn("HIGH/MAX", prompt)
        self.assertIn("Root-Family Exhaustion", prompt)
        self.assertIn("all six logical lanes", prompt)
        self.assertIn("inherited_completed_lanes=[1, 2, 3, 4, 5]", prompt)
        self.assertIn("pending_or_recovery_lanes=[6]", prompt)
        self.assertIn("PENDING NEXT ACTION: finish lane 6", prompt)

    def test_all_completed_lanes_are_never_relaunched(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            journal = Path(tmp) / "journal.md"
            journal.write_text(
                "QORE_CHECKPOINT_BEGIN\n"
                "checkpoint_sequence: 12\n"
                "SHARED_EVIDENCE_MAP SNAPSHOT: stable-map\n"
                "CAUSAL_FAMILY_LEDGER SNAPSHOT: stable-ledger\n"
                "PENDING NEXT ACTION: final synthesis\n"
                "SAFE RESUME INSTRUCTION: never relaunch any lane\n"
                "QORE_CHECKPOINT_END\n",
                encoding="utf-8",
            )
            prompt = runner._recovery_prompt(
                "# WORK PACKAGE\ntask=finalize\n",
                generation=3,
                checkpoints=journal,
                completed=[1, 2, 3, 4, 5, 6],
                pending=[],
                primary_exit=31,
            )
        self.assertIn("Do not relaunch any lane", prompt)
        self.assertIn("Resume only the unfinished post-lane synthesis", prompt)
        self.assertIn("full synthesis", prompt)


if __name__ == "__main__":
    unittest.main()
