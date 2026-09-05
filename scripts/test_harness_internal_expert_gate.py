#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import tempfile
import unittest
from pathlib import Path

from harness_internal_expert_gate import GateError, validate


def checkpoint(
    initial_sha: str,
    final_sha: str,
    *,
    passes: int = 1,
    repairs: int = 0,
    knows_engineer: str = "false",
    transcript_shared: str = "false",
    engineer_reentered: str = "false",
) -> str:
    return f"""QORE_CHECKPOINT_BEGIN
package_id: HARNESS-ENGINEER-TEST
checkpoint_sequence: 9
phase: HOST_INDEPENDENT_INTERNAL_EXPERT_AUDIT_REPAIR_CLEAN
binding: START={'a' * 40} TREE={'b' * 40}
evidence: policy=QORE-HARNESS-INDEPENDENT-AUDIT-REPAIR-POLICY-V2
evidence: initial_candidate_patch_sha256={initial_sha}
evidence: final_candidate_patch_sha256={final_sha}
evidence: internal_expert_audit_pass_count={passes}
evidence: internal_expert_repair_count={repairs}
evidence: internal_expert_knows_engineer_identity={knows_engineer}
evidence: engineer_transcript_shared_with_internal_expert={transcript_shared}
evidence: engineer_reentered_after_audit_handoff={engineer_reentered}
evidence: internal_expert_audit_repair_authority=true
HARNESS_INTERNAL_EXPERT_STATUS: CLEAN
HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN
PENDING NEXT ACTION: external qg
SAFE RESUME INSTRUCTION: preserve exact clean patch
QORE_CHECKPOINT_END
"""


class InternalExpertAuditRepairGateTests(unittest.TestCase):
    def _files(self, *, initial_equals_final: bool = True, passes: int = 1, repairs: int = 0):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        patch = root / "candidate.patch"
        patch.write_text("diff --git a/a b/a\n+secure\n", encoding="utf-8")
        final_digest = hashlib.sha256(patch.read_bytes()).hexdigest()
        initial_digest = final_digest if initial_equals_final else "a" * 64
        journal = root / "checkpoints.md"
        journal.write_text(
            checkpoint(initial_digest, final_digest, passes=passes, repairs=repairs),
            encoding="utf-8",
        )
        return temp, journal, patch, initial_digest, final_digest

    def test_clean_unchanged_candidate_passes(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files()
        with temp:
            result = validate(journal, patch)
            self.assertTrue(result["host_verified"])
            self.assertFalse(result["internal_expert_repaired_candidate"])
            self.assertEqual(result["final_candidate_patch_sha256"], final_digest)

    def test_repaired_candidate_requires_post_repair_reaudit(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files(
            initial_equals_final=False,
            passes=2,
            repairs=1,
        )
        with temp:
            result = validate(journal, patch)
            self.assertTrue(result["internal_expert_repaired_candidate"])
            self.assertEqual(result["internal_expert_audit_pass_count"], 2)
            self.assertEqual(result["internal_expert_repair_count"], 1)

    def test_repaired_candidate_without_reaudit_fails_closed(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files(
            initial_equals_final=False,
            passes=1,
            repairs=1,
        )
        with temp:
            with self.assertRaisesRegex(GateError, "post-repair full re-audit"):
                validate(journal, patch)

    def test_repaired_candidate_without_repair_count_fails_closed(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files(
            initial_equals_final=False,
            passes=2,
            repairs=0,
        )
        with temp:
            with self.assertRaisesRegex(GateError, "no Internal Expert repair"):
                validate(journal, patch)

    def test_stale_final_patch_hash_fails_closed(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files()
        with temp:
            patch.write_text("mutated\n", encoding="utf-8")
            with self.assertRaisesRegex(GateError, "stale"):
                validate(journal, patch)

    def test_engineer_identity_leak_fails_closed(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files()
        with temp:
            journal.write_text(
                checkpoint(
                    initial_digest,
                    final_digest,
                    knows_engineer="true",
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(GateError, "identity isolation"):
                validate(journal, patch)

    def test_engineer_reentry_after_audit_handoff_fails_closed(self) -> None:
        temp, journal, patch, initial_digest, final_digest = self._files()
        with temp:
            journal.write_text(
                checkpoint(
                    initial_digest,
                    final_digest,
                    engineer_reentered="true",
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(GateError, "re-entered"):
                validate(journal, patch)


if __name__ == "__main__":
    unittest.main()
