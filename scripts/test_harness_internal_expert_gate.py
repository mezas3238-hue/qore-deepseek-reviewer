#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import tempfile
import unittest
from pathlib import Path

from harness_internal_expert_gate import GateError, validate


def checkpoint(patch_sha: str, *, novel: int = 24, benign: int = 12, cross: int = 12, delta: str = "NONE") -> str:
    return f"""QORE_CHECKPOINT_BEGIN
package_id: HARNESS-ENGINEER-TEST
checkpoint_sequence: 9
QORE_INTERNAL_EXPERT_EVIDENCE_BEGIN
internal_expert_protocol=BLIND_DIFFERENTIAL_FALSIFICATION_V2
candidate_patch_sha256={patch_sha}
independent_family_model=COMPLETE
engineer_rationale_seen_before_blind_model=false
novel_probe_count={novel}
benign_control_count={benign}
cross_interaction_probe_count={cross}
coverage_delta={delta}
material_findings=0
lsp_final_recheck=COMPLETE
QORE_INTERNAL_EXPERT_EVIDENCE_END
HARNESS_INTERNAL_EXPERT_STATUS: CLEAN
HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN
HARNESS_HANDOFF_TARGET: EXTERNAL_EXPERT_EXPECTED_PASS
PENDING NEXT ACTION: external qg
SAFE RESUME INSTRUCTION: preserve exact clean patch
QORE_CHECKPOINT_END
"""


class InternalExpertGateTests(unittest.TestCase):
    def _files(self, text_builder=checkpoint):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        patch = root / "candidate.patch"
        patch.write_text("diff --git a/a b/a\n+secure\n", encoding="utf-8")
        digest = hashlib.sha256(patch.read_bytes()).hexdigest()
        journal = root / "checkpoints.md"
        journal.write_text(text_builder(digest), encoding="utf-8")
        output = root / "gate.json"
        return temp, journal, patch, output, digest

    def test_valid_exact_patch_clean_passes(self) -> None:
        temp, journal, patch, output, digest = self._files()
        with temp:
            result = validate(journal, patch)
            self.assertTrue(result["host_verified"])
            self.assertEqual(result["candidate_patch_sha256"], digest)
            self.assertEqual(result["novel_probe_count"], 24)

    def test_stale_patch_hash_fails_closed(self) -> None:
        temp, journal, patch, output, digest = self._files()
        with temp:
            patch.write_text("mutated\n", encoding="utf-8")
            with self.assertRaises(GateError):
                validate(journal, patch)

    def test_low_novel_probe_count_fails_closed(self) -> None:
        temp, journal, patch, output, digest = self._files(lambda sha: checkpoint(sha, novel=23))
        with temp:
            with self.assertRaises(GateError):
                validate(journal, patch)

    def test_low_benign_control_count_fails_closed(self) -> None:
        temp, journal, patch, output, digest = self._files(lambda sha: checkpoint(sha, benign=11))
        with temp:
            with self.assertRaises(GateError):
                validate(journal, patch)

    def test_low_cross_interaction_count_fails_closed(self) -> None:
        temp, journal, patch, output, digest = self._files(lambda sha: checkpoint(sha, cross=11))
        with temp:
            with self.assertRaises(GateError):
                validate(journal, patch)

    def test_coverage_delta_blocks_clean(self) -> None:
        temp, journal, patch, output, digest = self._files(lambda sha: checkpoint(sha, delta="UNICODE_SEPARATOR_CLASS"))
        with temp:
            with self.assertRaises(GateError):
                validate(journal, patch)

    def test_missing_handoff_markers_fails_closed(self) -> None:
        def builder(sha: str) -> str:
            return checkpoint(sha).replace("HARNESS_HANDOFF_TARGET: EXTERNAL_EXPERT_EXPECTED_PASS\n", "")
        temp, journal, patch, output, digest = self._files(builder)
        with temp:
            with self.assertRaises(GateError):
                validate(journal, patch)


if __name__ == "__main__":
    unittest.main()
