#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

import harness_resilient_runner as runner


class HarnessIndependentAuditRepairRunnerTests(unittest.TestCase):
    def _clean_result(
        self,
        *,
        initial_hash: str,
        final_hash: str,
        audit_pass_count: int = 1,
        repair_count: int = 0,
        repaired_findings: list[dict[str, object]] | None = None,
    ) -> dict[str, object]:
        return {
            "schema": runner.INTERNAL_SCHEMA,
            "status": "CLEAN",
            "initial_candidate_patch_sha256": initial_hash,
            "final_candidate_patch_sha256": final_hash,
            "audit_pass_count": audit_pass_count,
            "repair_count": repair_count,
            "repaired_findings": repaired_findings or [],
            "lanes": {lane: "COMPLETED" for lane in runner.FIVE_LANES},
            "lsp_final_recheck": "COMPLETE",
            "last_full_audit_material_findings": 0,
            "residual_uncertainty": "NONE",
        }

    def test_clean_unchanged_candidate_is_valid_internal_completion(self) -> None:
        digest = "a" * 64
        status, passes, repairs = runner._validate_internal_result(
            self._clean_result(initial_hash=digest, final_hash=digest),
            initial_hash=digest,
            actual_final_hash=digest,
        )
        self.assertEqual((status, passes, repairs), ("CLEAN", 1, 0))

    def test_internal_expert_may_repair_then_clean_after_full_reaudit(self) -> None:
        before = "a" * 64
        after = "b" * 64
        repaired = [
            {
                "finding_id": "IE-1",
                "root_family": "RF-X",
                "witness": "counterexample",
                "violated_invariant": "invariant",
                "repair_summary": "closed causal class",
                "affected_paths": ["src/qore/example.py"],
            }
        ]
        status, passes, repairs = runner._validate_internal_result(
            self._clean_result(
                initial_hash=before,
                final_hash=after,
                audit_pass_count=2,
                repair_count=1,
                repaired_findings=repaired,
            ),
            initial_hash=before,
            actual_final_hash=after,
        )
        self.assertEqual((status, passes, repairs), ("CLEAN", 2, 1))

    def test_changed_candidate_without_repair_accounting_fails_closed(self) -> None:
        before = "a" * 64
        after = "b" * 64
        with self.assertRaisesRegex(runner.RunnerError, "without repair accounting"):
            runner._validate_internal_result(
                self._clean_result(initial_hash=before, final_hash=after),
                initial_hash=before,
                actual_final_hash=after,
            )

    def test_repair_without_post_repair_full_audit_fails_closed(self) -> None:
        before = "a" * 64
        after = "b" * 64
        repaired = [
            {
                "finding_id": "IE-1",
                "root_family": "RF-X",
                "witness": "x",
                "violated_invariant": "y",
                "repair_summary": "z",
                "affected_paths": ["src/qore/example.py"],
            }
        ]
        with self.assertRaisesRegex(runner.RunnerError, "without full re-audit"):
            runner._validate_internal_result(
                self._clean_result(
                    initial_hash=before,
                    final_hash=after,
                    audit_pass_count=1,
                    repair_count=1,
                    repaired_findings=repaired,
                ),
                initial_hash=before,
                actual_final_hash=after,
            )

    def test_internal_expert_prompt_contains_no_implementation_package_context(self) -> None:
        prompt = runner._internal_expert_prompt(
            initial_hash="a" * 64,
            current_hash="a" * 64,
            changed_files=["src/qore/example.py"],
            start="b" * 40,
            tree="c" * 40,
            audit_session=1,
        )
        self.assertNotIn("package_id=", prompt)
        self.assertNotIn("VALIDATION_FINDINGS", prompt)
        self.assertIn("candidate author", prompt.lower())
        self.assertIn("Do not assume anything about who authored", prompt)

    def test_final_auditor_patch_replaces_engineer_candidate_mechanically(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            repo = root / "repo"
            repo.mkdir()
            subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.invalid"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.name", "QORE Test"], cwd=repo, check=True)
            (repo / "a.txt").write_text("base\n", encoding="utf-8")
            subprocess.run(["git", "add", "a.txt"], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-qm", "base"], cwd=repo, check=True)

            expert = root / "expert"
            subprocess.run(["git", "clone", "-q", str(repo), str(expert)], check=True)
            (expert / "a.txt").write_text("expert-fixed\n", encoding="utf-8")
            patch = root / "expert.patch"
            patch.write_text(
                subprocess.run(
                    ["git", "diff", "--binary", "HEAD", "--"],
                    cwd=expert,
                    check=True,
                    text=True,
                    stdout=subprocess.PIPE,
                ).stdout,
                encoding="utf-8",
            )

            (repo / "a.txt").write_text("engineer-version\n", encoding="utf-8")
            recovery = repo / runner.AGENT_RECOVERY_DIR
            recovery.mkdir()
            (recovery / "checkpoints.md").write_text("preserve\n", encoding="utf-8")

            runner._replace_workspace_candidate(repo, patch)

            self.assertEqual((repo / "a.txt").read_text(encoding="utf-8"), "expert-fixed\n")
            self.assertEqual(
                (recovery / "checkpoints.md").read_text(encoding="utf-8"),
                "preserve\n",
            )


if __name__ == "__main__":
    unittest.main()
