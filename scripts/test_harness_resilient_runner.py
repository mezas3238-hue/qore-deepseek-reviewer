#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, call, patch

import harness_resilient_runner as runner
from harness_large_batch_state import StateError, parse_checkpoint_file, write_initial


def append_checkpoint(path: Path, seq: int, states: dict[int, str], generation: int) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write("QORE_CHECKPOINT_BEGIN\n")
        handle.write(f"checkpoint_sequence: {seq}\n")
        handle.write(f"phase: TEST_GENERATION_{generation}\n")
        for lane, state in states.items():
            handle.write(f"QORE_LANE_STATE lane={lane} state={state} generation={generation}\n")
            handle.write(
                f"QORE_SUBAGENT_STATE lane={lane} id=agent-{lane} "
                f"state={state} generation={generation}\n"
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
            "harness_resilient_runner.py", "--dsh-bin", str(root / "fake-dsh"),
            "--prompt-file", str(prompt), "--checkpoints", str(checkpoints),
            "--output", str(output), "--metadata", str(metadata),
            "--max-generations", "4", "--generation-timeout-seconds", "60",
        ]
        with patch.object(sys, "argv", argv), patch.object(runner, "_run_once", side_effect=fake_run_once):
            rc = runner.main()
        return rc, json.loads(metadata.read_text(encoding="utf-8"))

    def test_one_delayed_lane_recovers_without_repeating_completed_lanes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)
            append_checkpoint(checkpoints, 1, {1: "COMPLETED", 2: "RUNNING", 3: "COMPLETED", 4: "COMPLETED", 5: "COMPLETED", 6: "COMPLETED"}, 1)
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
                append_checkpoint(checkpoints, 2, {2: "COMPLETED", 3: "COMPLETED", 4: "COMPLETED", 5: "COMPLETED", 6: "COMPLETED"}, 2)
                return 0, "## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n"

            rc, meta = self._invoke(fake, checkpoints, root)
            self.assertEqual(rc, 0)
            self.assertEqual(len(meta["attempts"]), 2)

    def test_post_lane_interruption_recovers_without_relaunching_any_lane(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)
            calls: list[str] = []

            def fake(**kwargs):
                calls.append(kwargs["prompt"])
                if len(calls) == 1:
                    append_checkpoint(
                        checkpoints,
                        1,
                        {lane: "COMPLETED" for lane in range(1, 7)},
                        1,
                    )
                    return 31, "all lanes complete; interrupted before synthesis"
                return 0, "## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n"

            rc, meta = self._invoke(fake, checkpoints, root)
            self.assertEqual(rc, 0)
            self.assertEqual(meta["recovery_generations_used"], 1)
            self.assertIn("inherited_completed_lanes=[1, 2, 3, 4, 5, 6]", calls[1])
            self.assertIn("pending_or_recovery_lanes=[]", calls[1])
            self.assertIn("Do not relaunch any lane", calls[1])
            self.assertIn("previous_primary_exit=31", calls[1])

    def test_second_interruption_remains_resumable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkpoints = root / "journal.md"
            write_initial(checkpoints, "PKG", "a" * 40, "b" * 40)
            count = 0
            prompts: list[str] = []

            def fake(**kwargs):
                nonlocal count
                count += 1
                prompts.append(kwargs["prompt"])
                if count == 1:
                    append_checkpoint(checkpoints, 1, {1: "COMPLETED", 2: "RECOVERY_REQUIRED"}, 1)
                    return 9, "first interruption"
                if count == 2:
                    append_checkpoint(checkpoints, 2, {2: "COMPLETED", 3: "RECOVERY_REQUIRED"}, 2)
                    return 23, "second interruption"
                append_checkpoint(checkpoints, 3, {3: "COMPLETED", 4: "COMPLETED", 5: "COMPLETED", 6: "COMPLETED"}, 3)
                return 0, "## RESUME STATE\nCOMPLETE\n## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n"

            rc, meta = self._invoke(fake, checkpoints, root)
            self.assertEqual(rc, 0)
            self.assertEqual(meta["recovery_generations_used"], 2)
            self.assertIn("inherited_completed_lanes=[1]", prompts[1])
            self.assertIn("inherited_completed_lanes=[1, 2]", prompts[2])
            self.assertIn("pending_or_recovery_lanes=[3, 4, 5, 6]", prompts[2])

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

    def test_timeout_terminates_entire_generation_process_group(self) -> None:
        proc = MagicMock()
        proc.pid = 4242
        proc.wait.side_effect = [subprocess.TimeoutExpired(cmd="dsh", timeout=5), 0]
        with (
            patch.object(runner, "_process_group_exists", side_effect=[True, True]),
            patch.object(runner.os, "killpg") as killpg,
        ):
            runner._terminate_process_group(proc)
        self.assertEqual(
            killpg.call_args_list,
            [call(4242, signal.SIGTERM), call(4242, signal.SIGKILL)],
        )

    def test_parent_exit_does_not_leave_surviving_subagent_group(self) -> None:
        proc = MagicMock()
        proc.pid = 4343
        proc.wait.side_effect = [0, 0]
        with (
            patch.object(runner, "_process_group_exists", side_effect=[True, True]),
            patch.object(runner.os, "killpg") as killpg,
        ):
            runner._terminate_process_group(proc)
        self.assertEqual(
            killpg.call_args_list,
            [call(4343, signal.SIGTERM), call(4343, signal.SIGKILL)],
        )

    def test_run_once_starts_isolated_session(self) -> None:
        proc = MagicMock()
        proc.communicate.return_value = ("done", None)
        proc.returncode = 0
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "out.md"
            with patch.object(runner.subprocess, "Popen", return_value=proc) as popen:
                rc, text = runner._run_once(
                    dsh_bin=Path("/fake/dsh"),
                    profile="headless",
                    prompt="PROMPT",
                    timeout_seconds=60,
                    output_path=output,
                    generation=1,
                )
            self.assertEqual((rc, text), (0, "done"))
            self.assertTrue(popen.call_args.kwargs["start_new_session"])

    def test_workspace_checkpoint_harvest_advances_host_state(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            host = root / "host" / "journal.md"
            host.parent.mkdir()
            write_initial(host, "PKG", "a" * 40, "b" * 40)
            agent = root / "workspace" / runner.AGENT_RECOVERY_DIR / "checkpoints.md"
            expected = runner._prepare_agent_checkpoint(host, agent)
            append_checkpoint(agent, 1, {1: "COMPLETED", 2: "RECOVERY_REQUIRED"}, 1)

            harvested = runner._harvest_agent_checkpoint(
                host_checkpoint=host,
                agent_checkpoint=agent,
                expected=expected,
            )

            self.assertEqual(harvested.completed, [1])
            self.assertEqual(harvested.pending, [2, 3, 4, 5, 6])
            self.assertEqual(parse_checkpoint_file(host), harvested)

    def test_cross_package_workspace_checkpoint_is_rejected_without_erasing_host(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            host = root / "host.md"
            write_initial(host, "PKG", "a" * 40, "b" * 40)
            original = host.read_text(encoding="utf-8")
            agent = root / "workspace" / runner.AGENT_RECOVERY_DIR / "checkpoints.md"
            agent.parent.mkdir(parents=True)
            write_initial(agent, "OTHER", "a" * 40, "b" * 40)
            expected = parse_checkpoint_file(host)

            with self.assertRaisesRegex(StateError, "binding mismatch"):
                runner._harvest_agent_checkpoint(
                    host_checkpoint=host,
                    agent_checkpoint=agent,
                    expected=expected,
                )

            self.assertEqual(host.read_text(encoding="utf-8"), original)

    def test_durable_prompt_paths_are_localized_into_workspace(self) -> None:
        prompt = (
            "# DURABLE RECOVERY TARGETS\n"
            "checkpoint_path=/home/runner/work/_temp/harness-engineer-checkpoints.md\n"
            "recovery_patch_path=/home/runner/work/_temp/harness-engineer-candidate.patch\n"
        )
        localized = runner._localize_durable_prompt_paths(
            prompt,
            agent_checkpoint=Path(runner.AGENT_RECOVERY_DIR) / "checkpoints.md",
            agent_patch=Path(runner.AGENT_RECOVERY_DIR) / "candidate.patch",
        )
        self.assertIn(
            f"checkpoint_path={runner.AGENT_RECOVERY_DIR}/checkpoints.md",
            localized,
        )
        self.assertIn(
            f"recovery_patch_path={runner.AGENT_RECOVERY_DIR}/candidate.patch",
            localized,
        )
        self.assertNotIn("/home/runner/work/_temp/harness-engineer-checkpoints.md", localized)

    def test_workspace_write_main_harvests_progress_instead_of_stagnating(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            workspace = root / "workspace"
            workspace.mkdir()
            host = root / "host" / "journal.md"
            host.parent.mkdir()
            write_initial(host, "PKG", "a" * 40, "b" * 40)
            prompt = root / "prompt.md"
            prompt.write_text(
                "# DURABLE RECOVERY TARGETS\n"
                f"checkpoint_path={host}\n"
                f"recovery_patch_path={root / 'host' / 'candidate.patch'}\n",
                encoding="utf-8",
            )
            output = root / "out.md"
            metadata = root / "meta.json"
            argv = [
                "harness_resilient_runner.py",
                "--dsh-bin",
                str(root / "fake-dsh"),
                "--prompt-file",
                str(prompt),
                "--checkpoints",
                str(host),
                "--output",
                str(output),
                "--metadata",
                str(metadata),
                "--max-generations",
                "2",
                "--generation-timeout-seconds",
                "60",
            ]
            previous = Path.cwd()

            def fake(**kwargs):
                checkpoint_line = next(
                    line
                    for line in kwargs["prompt"].splitlines()
                    if line.strip().startswith("checkpoint_path=")
                )
                localized = Path(checkpoint_line.split("=", 1)[1])
                self.assertFalse(localized.is_absolute())
                append_checkpoint(
                    localized,
                    1,
                    {lane: "COMPLETED" for lane in range(1, 7)},
                    1,
                )
                return (
                    0,
                    "## RESUME STATE\nCOMPLETE\n"
                    "## ENGINEER VERDICT\nCANDIDATE_READY_FOR_EXTERNAL_QG\n",
                )

            try:
                os.chdir(workspace)
                with (
                    patch.dict(
                        os.environ,
                        {"DSH_PERMISSION_MODE": "workspace-write"},
                        clear=False,
                    ),
                    patch.object(sys, "argv", argv),
                    patch.object(runner, "_run_once", side_effect=fake),
                ):
                    rc = runner.main()
            finally:
                os.chdir(previous)

            self.assertEqual(rc, 0)
            state = parse_checkpoint_file(host)
            self.assertTrue(state.all_complete)
            meta = json.loads(metadata.read_text(encoding="utf-8"))
            self.assertEqual(meta["terminal_reason"], "CANDIDATE_COMPLETE")
            self.assertTrue(meta["sandbox_checkpoint_localized"])
            self.assertFalse((workspace / runner.AGENT_RECOVERY_DIR).exists())

    def test_workspace_write_redirects_external_coverage_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            workspace = Path(tmp)
            previous = Path.cwd()
            proc = MagicMock()
            proc.communicate.return_value = ("done", None)
            proc.returncode = 0
            try:
                os.chdir(workspace)
                with (
                    patch.dict(
                        os.environ,
                        {
                            "DSH_PERMISSION_MODE": "workspace-write",
                            "COVERAGE_FILE": "/home/runner/work/_temp/qore.coverage",
                        },
                        clear=False,
                    ),
                    patch.object(runner.subprocess, "Popen", return_value=proc) as popen,
                ):
                    runner._run_once(
                        dsh_bin=Path("/fake/dsh"),
                        profile="headless",
                        prompt="PROMPT",
                        timeout_seconds=60,
                        output_path=workspace / "out.md",
                        generation=1,
                    )
            finally:
                os.chdir(previous)

            coverage_file = Path(popen.call_args.kwargs["env"]["COVERAGE_FILE"])
            self.assertTrue(runner._is_within(coverage_file, workspace))
            self.assertEqual(coverage_file.name, "agent.coverage")


if __name__ == "__main__":
    unittest.main()
