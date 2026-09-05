#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import signal
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, call, patch

import harness_resilient_runner as runner
from harness_large_batch_state import parse_checkpoint_file, write_initial


START = "a" * 40
TREE = "b" * 40
PACKAGE = "HARNESS-ENGINEER-TEST"


def append_all_engineering_complete(path: Path) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write("QORE_CHECKPOINT_BEGIN\n")
        handle.write(f"package_id: {PACKAGE}\n")
        handle.write("checkpoint_sequence: 1\n")
        handle.write(f"binding: START={START} TREE={TREE}\n")
        handle.write("phase: ENGINEERING_COMPLETE_TEST\n")
        for lane in range(1, 7):
            handle.write(f"QORE_LANE_STATE lane={lane} state=COMPLETED generation=1\n")
            handle.write(
                f"QORE_SUBAGENT_STATE lane={lane} id=engineer-{lane} state=COMPLETED generation=1\n"
            )
        handle.write("PENDING NEXT ACTION: host validation\n")
        handle.write("SAFE RESUME INSTRUCTION: preserve engineering evidence\n")
        handle.write("QORE_CHECKPOINT_END\n")


class IndependentDualAgentRunnerTests(unittest.TestCase):
    def test_engineering_completion_does_not_require_internal_clean(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            journal = Path(tmp) / "journal.md"
            write_initial(journal, PACKAGE, START, TREE)
            append_all_engineering_complete(journal)
            state = parse_checkpoint_file(journal)
            self.assertTrue(runner._engineering_complete(state))
            self.assertFalse(state.all_complete)

    def test_host_alone_mints_final_clean_markers_bound_to_patch(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            journal = Path(tmp) / "journal.md"
            write_initial(journal, PACKAGE, START, TREE)
            append_all_engineering_complete(journal)
            digest = "c" * 64
            state = runner._append_host_clean_checkpoint(journal, digest, 2)
            self.assertTrue(state.all_complete)
            text = journal.read_text(encoding="utf-8")
            self.assertIn("HARNESS_INTERNAL_EXPERT_STATUS: CLEAN", text)
            self.assertIn("HARNESS_DUAL_ROLE_STATUS: ENGINEER_COMPLETE + INTERNAL_EXPERT_CLEAN", text)
            self.assertIn(f"candidate_patch_sha256={digest}", text)
            self.assertIn("engineer_transcript_shared_with_internal_expert=false", text)
            self.assertIn("internal_expert_transcript_shared_with_engineer=false", text)

    def test_internal_clean_requires_all_five_lanes_and_exact_hash(self) -> None:
        digest = "d" * 64
        result = {
            "schema": runner.INTERNAL_SCHEMA,
            "status": "CLEAN",
            "candidate_patch_sha256": digest,
            "lanes": {lane: "COMPLETED" for lane in runner.FIVE_LANES},
            "lsp_final_recheck": "COMPLETE",
            "material_findings": [],
            "residual_uncertainty": "NONE",
        }
        status, findings = runner._validate_internal_result(result, digest)
        self.assertEqual(status, "CLEAN")
        self.assertEqual(findings, [])
        result["lanes"]["IE-L4"] = "RUNNING"
        with self.assertRaisesRegex(runner.RunnerError, "incomplete lanes"):
            runner._validate_internal_result(result, digest)

    def test_internal_result_cannot_be_reused_for_mutated_patch(self) -> None:
        result = {
            "schema": runner.INTERNAL_SCHEMA,
            "status": "CLEAN",
            "candidate_patch_sha256": "e" * 64,
            "lanes": {lane: "COMPLETED" for lane in runner.FIVE_LANES},
            "lsp_final_recheck": "COMPLETE",
            "material_findings": [],
            "residual_uncertainty": "NONE",
        }
        with self.assertRaisesRegex(runner.RunnerError, "patch hash mismatch"):
            runner._validate_internal_result(result, "f" * 64)

    def test_material_findings_are_normalized_without_auditor_transcript(self) -> None:
        digest = "1" * 64
        result = {
            "schema": runner.INTERNAL_SCHEMA,
            "status": "MATERIAL_FINDINGS",
            "candidate_patch_sha256": digest,
            "lanes": {lane: "COMPLETED" for lane in runner.FIVE_LANES},
            "lsp_final_recheck": "COMPLETE",
            "material_findings": [
                {
                    "finding_id": "IE-001",
                    "severity": "MATERIAL",
                    "root_family": "RF-X",
                    "witness": "w",
                    "expected": "reject",
                    "observed": "accept",
                    "affected_paths": ["src/x.py"],
                    "violated_invariant": "X",
                    "reproduction": "pytest ...",
                    "private_reasoning": "must never cross boundary",
                }
            ],
            "residual_uncertainty": "NONE",
        }
        status, findings = runner._validate_internal_result(result, digest)
        self.assertEqual(status, "MATERIAL_FINDINGS")
        self.assertEqual(len(findings), 1)
        self.assertNotIn("private_reasoning", findings[0])
        self.assertEqual(findings[0]["finding_id"], "IE-001")

    def test_structured_result_parser_ignores_surrounding_audit_narrative(self) -> None:
        digest = "2" * 64
        payload = {
            "schema": runner.INTERNAL_SCHEMA,
            "status": "CLEAN",
            "candidate_patch_sha256": digest,
            "lanes": {lane: "COMPLETED" for lane in runner.FIVE_LANES},
            "lsp_final_recheck": "COMPLETE",
            "material_findings": [],
            "residual_uncertainty": "NONE",
        }
        text = (
            "private audit notes not shared across role boundary\n"
            + runner.RESULT_BEGIN
            + "\n```json\n"
            + json.dumps(payload)
            + "\n```\n"
            + runner.RESULT_END
        )
        parsed = runner._parse_internal_result(text)
        self.assertEqual(parsed["candidate_patch_sha256"], digest)

    def test_fresh_role_homes_do_not_share_sessions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            template = root / "template"
            (template / "profiles/headless").mkdir(parents=True)
            (template / "skills").mkdir()
            (template / "settings.yaml").write_text("x: y\n", encoding="utf-8")
            (template / "sessions").mkdir()
            (template / "sessions" / "old.jsonl").write_text("secret prior context\n", encoding="utf-8")
            a = runner._fresh_role_home(template, root / "engineer")
            b = runner._fresh_role_home(template, root / "auditor")
            self.assertNotEqual(a, b)
            self.assertFalse((a / "sessions/old.jsonl").exists())
            self.assertFalse((b / "sessions/old.jsonl").exists())
            (a / "sessions/new.jsonl").write_text("engineer context\n", encoding="utf-8")
            self.assertFalse((b / "sessions/new.jsonl").exists())

    def test_candidate_patch_round_trips_into_isolated_audit_workspace(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            repo = root / "repo"
            repo.mkdir()
            subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.invalid"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.name", "test"], cwd=repo, check=True)
            (repo / "a.txt").write_text("one\n", encoding="utf-8")
            subprocess.run(["git", "add", "a.txt"], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-qm", "base"], cwd=repo, check=True)
            (repo / "a.txt").write_text("two\n", encoding="utf-8")
            patch_path = root / "candidate.patch"
            digest, changed = runner._candidate_patch(repo, patch_path)
            self.assertEqual(changed, ["a.txt"])
            audit = root / "audit"
            runner._create_audit_workspace(repo, patch_path, audit)
            self.assertEqual(runner._audit_patch_hash(audit), digest)
            self.assertEqual((audit / "a.txt").read_text(encoding="utf-8"), "two\n")
            self.assertEqual((repo / "a.txt").read_text(encoding="utf-8"), "two\n")

    def test_auditor_mutation_changes_patch_hash_and_invalidates_clean(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            repo = root / "repo"
            repo.mkdir()
            subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.invalid"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.name", "test"], cwd=repo, check=True)
            (repo / "a.txt").write_text("base\n", encoding="utf-8")
            subprocess.run(["git", "add", "a.txt"], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-qm", "base"], cwd=repo, check=True)
            (repo / "a.txt").write_text("candidate\n", encoding="utf-8")
            patch_path = root / "candidate.patch"
            digest, _ = runner._candidate_patch(repo, patch_path)
            audit = root / "audit"
            runner._create_audit_workspace(repo, patch_path, audit)
            (audit / "a.txt").write_text("auditor illegally changed candidate\n", encoding="utf-8")
            self.assertNotEqual(runner._audit_patch_hash(audit), digest)

    def test_run_role_starts_process_in_new_os_session_and_role_home(self) -> None:
        proc = MagicMock()
        proc.communicate.return_value = ("done", None)
        proc.returncode = 0
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            home = root / "home"
            home.mkdir()
            with patch.object(runner.subprocess, "Popen", return_value=proc) as popen, patch.object(
                runner, "_process_group_exists", return_value=False
            ):
                rc, text, timed_out = runner._run_role(
                    dsh_bin=Path("/fake/dsh"),
                    profile="headless",
                    prompt="PROMPT",
                    timeout_seconds=60,
                    role_home=home,
                    cwd=root,
                    permission_mode="workspace-write",
                )
            self.assertEqual((rc, text, timed_out), (0, "done", False))
            self.assertTrue(popen.call_args.kwargs["start_new_session"])
            self.assertEqual(popen.call_args.kwargs["env"]["DSH_HOME"], str(home))

    def test_timeout_terminates_entire_role_process_group(self) -> None:
        proc = MagicMock()
        proc.pid = 4242
        proc.wait.side_effect = [subprocess.TimeoutExpired(cmd="dsh", timeout=5), 0]
        with (
            patch.object(runner, "_process_group_exists", side_effect=[True, True]),
            patch.object(runner.os, "killpg") as killpg,
        ):
            runner._terminate_process_group(proc)
        self.assertEqual(killpg.call_args_list, [call(4242, signal.SIGTERM), call(4242, signal.SIGKILL)])

    def test_prompts_do_not_cross_share_hidden_role_transcripts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            journal = root / "journal.md"
            write_initial(journal, PACKAGE, START, TREE)
            base = "# WORK PACKAGE\nobjective: fix X\n# IMMUTABLE EXECUTION BINDING\npackage_id=P\n"
            findings = [
                {
                    "affected_paths": ["src/x.py"],
                    "expected": "reject",
                    "finding_id": "IE-1",
                    "observed": "accept",
                    "reproduction": "probe",
                    "root_family": "RF-X",
                    "severity": "MATERIAL",
                    "violated_invariant": "X",
                    "witness": "w",
                }
            ]
            with patch.object(runner, "_reviewer_root", return_value=Path(__file__).resolve().parents[1]):
                engineer = runner._engineer_role_prompt(
                    base_prompt=base,
                    host_checkpoint=journal,
                    findings=findings,
                    patch_path=root / "candidate.patch",
                )
                auditor = runner._internal_expert_prompt(
                    base_prompt=base,
                    patch_hash="3" * 64,
                    changed_files=["src/x.py"],
                    start=START,
                    tree=TREE,
                )
            self.assertIn("VALIDATION_FINDINGS", engineer)
            self.assertNotIn("private audit transcript", engineer)
            self.assertNotIn("VALIDATION_FINDINGS", auditor)
            self.assertNotIn("engineer transcript", auditor.lower())


if __name__ == "__main__":
    unittest.main()
