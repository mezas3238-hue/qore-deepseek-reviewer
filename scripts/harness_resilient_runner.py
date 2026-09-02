#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import signal
import subprocess
import time
from pathlib import Path

from harness_large_batch_state import StateError, parse_checkpoint_file

READY = "CANDIDATE_READY_FOR_EXTERNAL_QG"
BLOCKED = "## ENGINEER VERDICT\nBLOCKED"
RESUME_COMPLETE = "## RESUME STATE\nCOMPLETE"


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


def _terminate_process_group(proc: subprocess.Popen[str]) -> None:
    """Terminate the whole DSH generation, including native subagent descendants."""
    if proc.poll() is not None:
        return
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        proc.wait(timeout=5)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except ProcessLookupError:
        return
    proc.wait(timeout=5)


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
        text = partial + (remainder or "")
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
    return (
        base_prompt
        + "\n\n# HOST-ENFORCED RECOVERY GENERATION\n"
        + f"recovery_generation={generation}\n"
        + f"previous_primary_exit={primary_exit}\n"
        + f"inherited_completed_lanes={completed}\n"
        + f"pending_or_recovery_lanes={pending}\n\n"
        + "This is a continuation of the SAME immutable package and SAME disposable workspace. "
        + "Completed lanes are certified carry-forward work: DO NOT relaunch, repeat, or reconstruct them. "
        + post_lane_instruction
        + "Before any new long operation append a checkpoint with QORE_LANE_STATE entries. "
        + "A wait/pause response is not a valid terminal response: continue until COMPLETE, MATERIAL_BLOCKED, or the host timeout.\n\n"
        + "# DURABLE CHECKPOINT TAIL\n"
        + _checkpoint_tail(checkpoints)
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

    base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    started = time.monotonic()
    previous_signature: tuple[object, ...] | None = None
    stagnant = 0
    attempts: list[dict[str, object]] = []
    terminal_reason = "GENERATIONS_EXHAUSTED"
    final_rc = 70
    last_valid = parse_checkpoint_file(args.checkpoints)

    for generation in range(1, args.max_generations + 1):
        before = parse_checkpoint_file(args.checkpoints)
        last_valid = before
        if before.blocked:
            terminal_reason = "MATERIAL_BLOCKED_FROM_CHECKPOINT"
            final_rc = 2
            break
        if generation == 1:
            prompt = base_prompt
        else:
            prompt = _recovery_prompt(
                base_prompt,
                generation=generation,
                checkpoints=args.checkpoints,
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

        try:
            after = parse_checkpoint_file(args.checkpoints)
        except StateError as exc:
            terminal_reason = f"CORRUPT_CHECKPOINT:{exc}"
            final_rc = 65
            attempts.append(
                {"generation": generation, "exit_code": rc, "checkpoint_error": str(exc)}
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

        attempts.append(
            {
                "generation": generation,
                "exit_code": rc,
                "checkpoint_count": after.checkpoint_count,
                "completed_lanes": after.completed,
                "pending_lanes": after.pending,
                "blocked_lanes": after.blocked,
                "candidate_ready_marker": READY in text,
                "resume_complete_marker": RESUME_COMPLETE in text,
            }
        )

        if after.blocked or BLOCKED in text:
            terminal_reason = "MATERIAL_BLOCKED"
            final_rc = 2
            break

        if after.all_complete and READY in text and RESUME_COMPLETE in text and rc == 0:
            terminal_reason = "CANDIDATE_COMPLETE"
            final_rc = 0
            break

        # Incomplete lanes are recoverable. So is a post-lane interruption: reaching six
        # COMPLETED lanes does not make unfinished synthesis/implementation/finalization expendable.
        if after.pending or after.all_complete:
            if stagnant > args.max_stagnant_generations:
                terminal_reason = "RECOVERY_STAGNATED"
                final_rc = 75
                break
            continue

        terminal_reason = "INVALID_TERMINAL_OUTPUT"
        final_rc = 76
        break

    try:
        final = parse_checkpoint_file(args.checkpoints)
    except StateError:
        # Corruption is already a fail-closed terminal condition. Preserve the last verified
        # durable snapshot in metadata rather than crashing before evidence can be uploaded.
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
    }
    args.metadata.write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(metadata, sort_keys=True))
    return final_rc


if __name__ == "__main__":
    raise SystemExit(main())
