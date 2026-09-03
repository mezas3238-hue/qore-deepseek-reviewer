#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import signal
import subprocess
import time
from pathlib import Path

from harness_large_batch_state import Snapshot, StateError, parse_checkpoint_file

READY = "CANDIDATE_READY_FOR_EXTERNAL_QG"
BLOCKED = "## ENGINEER VERDICT\nBLOCKED"
RESUME_STATE_HEADER = "## RESUME STATE"
RESUME_COMPLETE_VALUE = "COMPLETE"
AGENT_RECOVERY_DIR = ".qore-harness-recovery"
WORK_PACKAGE_MARKER = "# WORK PACKAGE"
CHECKPOINT_BEGIN = "QORE_CHECKPOINT_BEGIN"
CHECKPOINT_END = "QORE_CHECKPOINT_END"


def _has_exact_section_value(text: str, header: str, value: str) -> bool:
    """Recognize one exact terminal value while tolerating harmless Markdown inline code."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    for index, raw in enumerate(lines):
        if raw.strip() != header:
            continue
        cursor = index + 1
        while cursor < len(lines) and not lines[cursor].strip():
            cursor += 1
        if cursor >= len(lines):
            return False
        candidate = lines[cursor].strip()
        if candidate == value or candidate == f"`{value}`":
            return True
    return False


def _resume_complete(text: str) -> bool:
    return _has_exact_section_value(text, RESUME_STATE_HEADER, RESUME_COMPLETE_VALUE)


def _append_generation_output(
    output_path: Path,
    *,
    generation: int,
    text: str,
    rc: int,
    timed_out: bool,
) -> None:
    with output_path.open("a", encoding="utf-8") as handle:
        handle.write(f"\n\n<!-- QORE_RECOVERY_GENERATION {generation} BEGIN -->\n")
        handle.write(text)
        if text and not text.endswith("\n"):
            handle.write("\n")
        if timed_out:
            handle.write(
                f"Harness recovery generation {generation} reached its bounded timeout; "
                "the isolated process group was terminated before recovery continued.\n"
            )
        handle.write(
            f"<!-- QORE_RECOVERY_GENERATION {generation} END rc={rc} "
            f"timed_out={str(timed_out).lower()} -->\n"
        )


def _process_group_exists(pgid: int) -> bool:
    try:
        os.killpg(pgid, 0)
    except ProcessLookupError:
        return False
    return True


def _terminate_process_group(proc: subprocess.Popen[str]) -> None:
    """Terminate the whole DSH generation, including native subagent descendants."""
    pgid = proc.pid
    if not _process_group_exists(pgid):
        return
    try:
        os.killpg(pgid, signal.SIGTERM)
    except ProcessLookupError:
        return

    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass

    if _process_group_exists(pgid):
        try:
            os.killpg(pgid, signal.SIGKILL)
        except ProcessLookupError:
            return
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Harness generation process group did not terminate") from exc


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
    except ValueError:
        return False
    return True


def _workspace_recovery_paths(workspace_root: Path) -> tuple[Path, Path, Path]:
    recovery_dir = workspace_root / AGENT_RECOVERY_DIR
    return (
        recovery_dir / "checkpoints.md",
        recovery_dir / "candidate.patch",
        recovery_dir / "agent.coverage",
    )


def _atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    temporary.write_text(text, encoding="utf-8")
    temporary.replace(path)


def _snapshot_binding(snapshot: Snapshot) -> tuple[str | None, str | None, str | None]:
    return snapshot.package_id, snapshot.start, snapshot.tree


def _prepare_agent_checkpoint(
    host_checkpoint: Path,
    agent_checkpoint: Path,
) -> Snapshot:
    host = parse_checkpoint_file(host_checkpoint)
    _atomic_write(agent_checkpoint, host_checkpoint.read_text(encoding="utf-8"))
    return host


def _harvest_agent_checkpoint(
    *,
    host_checkpoint: Path,
    agent_checkpoint: Path,
    expected: Snapshot,
) -> Snapshot:
    """Validate sandbox-written state before atomically publishing it to the host journal."""
    candidate = parse_checkpoint_file(agent_checkpoint)
    if _snapshot_binding(candidate) != _snapshot_binding(expected):
        raise StateError("agent checkpoint immutable package/START/TREE binding mismatch")
    if candidate.checkpoint_count < expected.checkpoint_count:
        raise StateError("agent checkpoint count regressed")
    _atomic_write(host_checkpoint, agent_checkpoint.read_text(encoding="utf-8"))
    return candidate


def _localize_durable_prompt_paths(
    prompt: str,
    *,
    agent_checkpoint: Path,
    agent_patch: Path,
) -> str:
    """Replace host-only durable targets with paths writable by workspace-write DSH."""
    localized: list[str] = []
    for raw in prompt.splitlines():
        stripped = raw.strip()
        indentation = raw[: len(raw) - len(raw.lstrip())]
        if stripped.startswith("checkpoint_path="):
            localized.append(f"{indentation}checkpoint_path={agent_checkpoint}")
        elif stripped.startswith("recovery_patch_path="):
            localized.append(f"{indentation}recovery_patch_path={agent_patch}")
        else:
            localized.append(raw)
    suffix = "\n" if prompt.endswith("\n") else ""
    return "\n".join(localized) + suffix


def _localize_coverage_env(env: dict[str, str]) -> None:
    if env.get("DSH_PERMISSION_MODE") != "workspace-write":
        return
    coverage = env.get("COVERAGE_FILE")
    if not coverage:
        return
    workspace_root = Path.cwd().resolve()
    coverage_path = Path(coverage)
    if _is_within(coverage_path, workspace_root):
        return
    _, _, agent_coverage = _workspace_recovery_paths(workspace_root)
    agent_coverage.parent.mkdir(parents=True, exist_ok=True)
    env["COVERAGE_FILE"] = str(agent_coverage)


def _run_once(
    *,
    dsh_bin: Path,
    profile: str,
    prompt: str,
    timeout_seconds: int,
    output_path: Path,
    generation: int,
) -> tuple[int, str]:
    env = os.environ.copy()
    _localize_coverage_env(env)
    proc = subprocess.Popen(
        [str(dsh_bin), "--profile", profile, prompt],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    timed_out = False
    try:
        text, _ = proc.communicate(timeout=timeout_seconds)
        rc = int(proc.returncode or 0)
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        partial = exc.stdout if isinstance(exc.stdout, str) else ""
        _terminate_process_group(proc)
        remainder, _ = proc.communicate()
        text = remainder or partial
        rc = 124

    _append_generation_output(
        output_path,
        generation=generation,
        text=text or "",
        rc=rc,
        timed_out=timed_out,
    )
    return rc, text or ""


def _checkpoint_tail(path: Path, limit: int = 14000) -> str:
    text = path.read_text(encoding="utf-8")
    return text[-limit:]


def _latest_complete_checkpoint(path: Path) -> str:
    """Return the latest complete durable checkpoint without replaying older journal prose."""
    text = path.read_text(encoding="utf-8")
    end = text.rfind(CHECKPOINT_END)
    if end < 0:
        return _checkpoint_tail(path)
    end += len(CHECKPOINT_END)
    begin = text.rfind(CHECKPOINT_BEGIN, 0, end)
    if begin < 0:
        return _checkpoint_tail(path)
    return text[begin:end]


def _recovery_static_context(base_prompt: str) -> str:
    """Keep package-specific immutable context while dropping repeated generic Harness prose."""
    marker = base_prompt.find(WORK_PACKAGE_MARKER)
    if marker < 0:
        return base_prompt
    return base_prompt[marker:]


def _recovery_prompt(
    base_prompt: str,
    *,
    generation: int,
    checkpoints: Path,
    completed: list[int],
    pending: list[int],
    primary_exit: int,
) -> str:
    post_lane_instruction = (
        "All six lanes are already durable COMPLETED carry-forward evidence. Do not relaunch any lane. "
        "Resume only the unfinished post-lane synthesis, implementation, validation, LSP-after, "
        "Root-Family Exhaustion, diff audit, and final report gates. "
        if not pending
        else
        "Run only pending/recovery-required lanes, then synthesize all six using inherited evidence. "
        "If a pending lane was merely delayed, consume its result if available; otherwise relaunch only that lane. "
    )
    compact_contract = (
        "# HARNESS COMPACT RECOVERY CONTRACT\n"
        "This generation is a continuation of the SAME immutable six-lane package. "
        "EFFICIENCY != REDUCED COVERAGE. COMPACTION != EVIDENCE LOSS. "
        "DEDUPLICATION != WITNESS LOSS. SMART STOP != EARLY PASS. "
        "Reuse the bound SHARED_EVIDENCE_MAP and CAUSAL_FAMILY_LEDGER from durable evidence. "
        "Do not repeat broad discovery or completed-lane narrative unless a concrete contradiction, "
        "unusable evidence, or binding change requires a bounded re-check. "
        "Semantic LSP-before/after obligations, HIGH/MAX reasoning, adversarial/property coverage, "
        "Root-Family Exhaustion, all six logical lanes, durable checkpoints, full synthesis and the "
        "external FULL QG contract remain mandatory.\n\n"
    )
    return (
        compact_contract
        + _recovery_static_context(base_prompt)
        + "\n\n# HOST-ENFORCED RECOVERY GENERATION\n"
        + f"recovery_generation={generation}\n"
        + f"previous_primary_exit={primary_exit}\n"
        + f"inherited_completed_lanes={completed}\n"
        + f"pending_or_recovery_lanes={pending}\n\n"
        + "Completed lanes are certified carry-forward work: DO NOT relaunch, repeat, or reconstruct them. "
        + post_lane_instruction
        + "Before any new long operation append a checkpoint with QORE_LANE_STATE entries and refresh the compact "
        + "SHARED_EVIDENCE_MAP SNAPSHOT / CAUSAL_FAMILY_LEDGER SNAPSHOT when material state changes. "
        + "A wait/pause response is not a valid terminal response: continue until COMPLETE, MATERIAL_BLOCKED, or the host timeout.\n\n"
        + "# COMPACT DURABLE RESUME CONTEXT — LATEST COMPLETE CHECKPOINT\n"
        + _latest_complete_checkpoint(checkpoints)
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dsh-bin", type=Path, required=True)
    parser.add_argument("--profile", default="headless")
    parser.add_argument("--prompt-file", type=Path, required=True)
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--max-generations", type=int, default=4)
    parser.add_argument("--generation-timeout-seconds", type=int, default=2100)
    parser.add_argument("--max-stagnant-generations", type=int, default=1)
    args = parser.parse_args()

    if args.max_generations < 1 or args.max_generations > 8:
        parser.error("max-generations must be in [1, 8]")
    if args.generation_timeout_seconds < 60:
        parser.error("generation timeout is too small")

    raw_base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    started = time.monotonic()
    previous_signature: tuple[object, ...] | None = None
    stagnant = 0
    attempts: list[dict[str, object]] = []
    terminal_reason = "GENERATIONS_EXHAUSTED"
    final_rc = 70
    last_valid = parse_checkpoint_file(args.checkpoints)

    workspace_root = Path.cwd().resolve()
    sandbox_localized = os.environ.get("DSH_PERMISSION_MODE") == "workspace-write"
    recovery_dir: Path | None = None
    agent_checkpoint = args.checkpoints
    base_prompt = raw_base_prompt

    if sandbox_localized:
        agent_checkpoint, agent_patch, _ = _workspace_recovery_paths(workspace_root)
        recovery_dir = agent_checkpoint.parent
        _prepare_agent_checkpoint(args.checkpoints, agent_checkpoint)
        base_prompt = _localize_durable_prompt_paths(
            raw_base_prompt,
            agent_checkpoint=Path(AGENT_RECOVERY_DIR) / agent_checkpoint.name,
            agent_patch=Path(AGENT_RECOVERY_DIR) / agent_patch.name,
        )

    try:
        for generation in range(1, args.max_generations + 1):
            before = parse_checkpoint_file(args.checkpoints)
            last_valid = before
            if before.blocked:
                terminal_reason = "MATERIAL_BLOCKED_FROM_CHECKPOINT"
                final_rc = 2
                break

            if sandbox_localized:
                _prepare_agent_checkpoint(args.checkpoints, agent_checkpoint)

            if generation == 1:
                prompt = base_prompt
            else:
                prompt = _recovery_prompt(
                    base_prompt,
                    generation=generation,
                    checkpoints=agent_checkpoint if sandbox_localized else args.checkpoints,
                    completed=before.completed,
                    pending=before.pending,
                    primary_exit=int(attempts[-1]["exit_code"]),
                )

            rc, text = _run_once(
                dsh_bin=args.dsh_bin,
                profile=args.profile,
                prompt=prompt,
                timeout_seconds=args.generation_timeout_seconds,
                output_path=args.output,
                generation=generation,
            )

            if sandbox_localized:
                try:
                    _harvest_agent_checkpoint(
                        host_checkpoint=args.checkpoints,
                        agent_checkpoint=agent_checkpoint,
                        expected=before,
                    )
                except StateError as exc:
                    terminal_reason = f"CHECKPOINT_PUBLICATION_FAILED:{exc}"
                    final_rc = 66
                    attempts.append(
                        {
                            "generation": generation,
                            "exit_code": rc,
                            "checkpoint_error": str(exc),
                            "checkpoint_publication_failed": True,
                            "prompt_chars": len(prompt),
                        }
                    )
                    with args.output.open("a", encoding="utf-8") as handle:
                        handle.write(
                            "\n\n<!-- QORE_UNPUBLISHED_AGENT_CHECKPOINT BEGIN -->\n"
                        )
                        if agent_checkpoint.is_file():
                            handle.write(agent_checkpoint.read_text(encoding="utf-8"))
                        handle.write(
                            "\n<!-- QORE_UNPUBLISHED_AGENT_CHECKPOINT END -->\n"
                        )
                    break

            try:
                after = parse_checkpoint_file(args.checkpoints)
            except StateError as exc:
                terminal_reason = f"CORRUPT_CHECKPOINT:{exc}"
                final_rc = 65
                attempts.append(
                    {
                        "generation": generation,
                        "exit_code": rc,
                        "checkpoint_error": str(exc),
                        "prompt_chars": len(prompt),
                    }
                )
                break

            last_valid = after
            signature = (
                after.checkpoint_count,
                tuple(after.completed),
                tuple(after.pending),
                tuple(after.blocked),
            )
            if signature == previous_signature:
                stagnant += 1
            else:
                stagnant = 0
            previous_signature = signature

            resume_complete_marker = _resume_complete(text)
            attempts.append(
                {
                    "generation": generation,
                    "exit_code": rc,
                    "checkpoint_count": after.checkpoint_count,
                    "completed_lanes": after.completed,
                    "pending_lanes": after.pending,
                    "blocked_lanes": after.blocked,
                    "candidate_ready_marker": READY in text,
                    "resume_complete_marker": resume_complete_marker,
                    "sandbox_checkpoint_localized": sandbox_localized,
                    "prompt_chars": len(prompt),
                    "recovery_context_mode": "full-initial" if generation == 1 else "compact-latest-checkpoint",
                }
            )

            if after.blocked or BLOCKED in text:
                terminal_reason = "MATERIAL_BLOCKED"
                final_rc = 2
                break

            if after.all_complete and READY in text and resume_complete_marker and rc == 0:
                terminal_reason = "CANDIDATE_COMPLETE"
                final_rc = 0
                break

            if after.pending or after.all_complete:
                if stagnant > args.max_stagnant_generations:
                    terminal_reason = "RECOVERY_STAGNATED"
                    final_rc = 75
                    break
                continue

            terminal_reason = "INVALID_TERMINAL_OUTPUT"
            final_rc = 76
            break
    finally:
        if recovery_dir is not None:
            shutil.rmtree(recovery_dir, ignore_errors=True)

    try:
        final = parse_checkpoint_file(args.checkpoints)
    except StateError:
        final = last_valid

    metadata = {
        "schema": "qore-harness-resilient-runner-v1",
        "terminal_reason": terminal_reason,
        "exit_code": final_rc,
        "elapsed_seconds": int(time.monotonic() - started),
        "max_generations": args.max_generations,
        "attempts": attempts,
        "completed_lanes": final.completed,
        "pending_lanes": final.pending,
        "blocked_lanes": final.blocked,
        "checkpoint_count": final.checkpoint_count,
        "all_complete": final.all_complete,
        "recovery_generations_used": max(0, len(attempts) - 1),
        "sandbox_checkpoint_localized": sandbox_localized,
        "recovery_context_policy": "compact-latest-complete-checkpoint",
    }
    args.metadata.write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(metadata, sort_keys=True))
    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
