#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import signal
import subprocess
import time
from pathlib import Path

CHECKPOINT_BEGIN = "QORE_CHECKPOINT_BEGIN"
CHECKPOINT_END = "QORE_CHECKPOINT_END"
RESUME_HEADER = "## RESUME STATE"
VERDICT_HEADER = "## VERDICT"
MIN_GENERATION_SECONDS = 60

PASS_MARKERS = ("VALIDACIÓN OK", "VALIDACION OK")
FAIL_MARKERS = ("VALIDACIÓN NO OK", "VALIDACION NO OK")
BLOCKED_MARKERS = ("VALIDATION BLOCKED", "EVIDENCIA INSUFICIENTE")
INTERIM_MARKERS = (
    "still executing",
    "awaiting lane results",
    "lanes are still executing",
    "subagents are still executing",
)


def _normalized(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _section(text: str, header: str) -> str:
    lines = _normalized(text).split("\n")
    for index, raw in enumerate(lines):
        if raw.strip() != header:
            continue
        collected: list[str] = []
        for candidate in lines[index + 1 :]:
            if candidate.strip().startswith("## "):
                break
            collected.append(candidate)
        return "\n".join(collected).strip()
    return ""


def _resume_state(text: str) -> str:
    section = _section(text, RESUME_HEADER)
    if not section:
        return ""
    first = next((line.strip().strip("`") for line in section.splitlines() if line.strip()), "")
    return first


def _verdict(text: str) -> str | None:
    verdict = _section(text, VERDICT_HEADER)
    if not verdict:
        return None
    upper = verdict.upper()
    if any(marker in upper for marker in BLOCKED_MARKERS):
        return "BLOCKED"
    if any(marker in upper for marker in FAIL_MARKERS):
        return "MATERIAL_FINDINGS"
    if any(marker in upper for marker in PASS_MARKERS):
        return "PASS"
    return None


def terminal_disposition(text: str) -> str | None:
    """Return a contractual terminal state, never an interim progress state."""
    state = _resume_state(text).upper()
    verdict = _verdict(text)
    lower = text.lower()
    if verdict is None:
        return None
    if any(marker in lower for marker in INTERIM_MARKERS) and state != "COMPLETE":
        return None
    if verdict == "BLOCKED":
        return "BLOCKED"
    if state != "COMPLETE":
        return None
    if verdict == "PASS":
        body = _section(text, VERDICT_HEADER).upper()
        if "HALLAZGOS: NINGUNO" not in body:
            return None
    return verdict


def _latest_complete_checkpoint(path: Path) -> str:
    if not path.exists():
        return ""
    text = path.read_text(encoding="utf-8")
    end = text.rfind(CHECKPOINT_END)
    if end < 0:
        return text[-14000:]
    end += len(CHECKPOINT_END)
    begin = text.rfind(CHECKPOINT_BEGIN, 0, end)
    if begin < 0:
        return text[max(0, end - 14000) : end]
    return text[begin:end]


def _checkpoint_signature(path: Path) -> str:
    if not path.exists():
        return "missing"
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _process_group_exists(pgid: int) -> bool:
    try:
        os.killpg(pgid, 0)
    except ProcessLookupError:
        return False
    return True


def _terminate_group(proc: subprocess.Popen[str]) -> None:
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
            pass
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass


def _run_generation(
    *, dsh_bin: Path, profile: str, prompt: str, timeout_seconds: int
) -> tuple[int, str, bool]:
    proc = subprocess.Popen(
        [str(dsh_bin), "--profile", profile, prompt],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=os.environ.copy(),
        start_new_session=True,
    )
    timed_out = False
    try:
        output, _ = proc.communicate(timeout=timeout_seconds)
        rc = int(proc.returncode or 0)
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        partial = exc.stdout if isinstance(exc.stdout, str) else ""
        _terminate_group(proc)
        remainder, _ = proc.communicate()
        output = (partial or "") + (remainder or "")
        rc = 124
    return rc, output or "", timed_out


def _recovery_prompt(
    base_prompt: str,
    *, generation: int,
    prior_rc: int,
    checkpoints: Path,
) -> str:
    latest = _latest_complete_checkpoint(checkpoints)
    return (
        base_prompt
        + "\n\n# HOST-ENFORCED REVIEWER RECOVERY\n"
        + f"recovery_generation={generation}\n"
        + f"previous_primary_exit={prior_rc}\n\n"
        + "This is the SAME immutable frozen review. Do not restart completed work. "
        + "Load the latest durable checkpoint below. Any lane with durable terminal evidence is carry-forward and MUST NOT be relaunched. "
        + "Any launched lane that lacks a durable terminal result is RECOVERY_REQUIRED and only that missing unit may be relaunched. "
        + "LANE LAUNCHED != LANE COMPLETED. The primary reviewer MUST synchronously collect every launched lane before returning. "
        + "Never return an interim message such as 'still executing' or 'awaiting lane results'. "
        + "Finish with exactly one contractual terminal disposition: PASS, material findings, or VALIDATION BLOCKED. "
        + "If native subagent collection cannot complete after bounded attempts, emit VALIDATION BLOCKED with the exact missing lane; do not crash or infer PASS.\n\n"
        + "# LATEST COMPLETE DURABLE CHECKPOINT\n"
        + latest
    )


def _append_journal(path: Path, *, generation: int, rc: int, timed_out: bool, text: str) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(f"\n<!-- QORE_REVIEW_GENERATION {generation} BEGIN -->\n")
        handle.write(text)
        if text and not text.endswith("\n"):
            handle.write("\n")
        handle.write(
            f"<!-- QORE_REVIEW_GENERATION {generation} END rc={rc} timed_out={str(timed_out).lower()} -->\n"
        )


def _host_blocked_report(*, reason: str, generations: int, checkpoint: str) -> str:
    return f"""# QORE DEEPSEEK REVIEWER — HOST RECOVERY TERMINAL

## SUBAGENT SWARM
Host recovery could not obtain terminal evidence for every mandatory lane. No semantic PASS is inferred.

## LSP EVIDENCE
Preserved in durable checkpoints/artifacts from completed generations; no new claim is manufactured by the host.

## DURABLE JOURNAL SUMMARY
Generations attempted: {generations}
Terminal infrastructure reason: {reason}

## RESUME STATE
COMPLETE

## VERDICT
VALIDATION BLOCKED
reason: {reason}

<!-- latest durable checkpoint
{checkpoint}
-->
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dsh-bin", type=Path, required=True)
    parser.add_argument("--profile", default="headless")
    parser.add_argument("--prompt-file", type=Path, required=True)
    parser.add_argument("--checkpoints", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--journal-output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--max-generations", type=int, default=4)
    parser.add_argument("--generation-timeout-seconds", type=int, default=1800)
    parser.add_argument("--max-stagnant-generations", type=int, default=2)
    args = parser.parse_args()

    if not 1 <= args.max_generations <= 8:
        parser.error("max-generations must be in [1,8]")
    if args.generation_timeout_seconds < MIN_GENERATION_SECONDS:
        parser.error("generation timeout is too small")

    base_prompt = args.prompt_file.read_text(encoding="utf-8")
    args.output.write_text("", encoding="utf-8")
    args.journal_output.write_text("", encoding="utf-8")
    attempts: list[dict[str, object]] = []
    prior_rc = 0
    prior_signature = _checkpoint_signature(args.checkpoints)
    stagnant = 0
    started = time.monotonic()

    for generation in range(1, args.max_generations + 1):
        prompt = (
            base_prompt
            if generation == 1
            else _recovery_prompt(
                base_prompt,
                generation=generation,
                prior_rc=prior_rc,
                checkpoints=args.checkpoints,
            )
        )
        before = _checkpoint_signature(args.checkpoints)
        rc, text, timed_out = _run_generation(
            dsh_bin=args.dsh_bin,
            profile=args.profile,
            prompt=prompt,
            timeout_seconds=args.generation_timeout_seconds,
        )
        _append_journal(
            args.journal_output,
            generation=generation,
            rc=rc,
            timed_out=timed_out,
            text=text,
        )
        after = _checkpoint_signature(args.checkpoints)
        disposition = terminal_disposition(text)
        progressed = after != before or after != prior_signature
        stagnant = 0 if progressed else stagnant + 1
        attempts.append(
            {
                "generation": generation,
                "exit_code": rc,
                "timed_out": timed_out,
                "checkpoint_progress": progressed,
                "terminal_disposition": disposition,
            }
        )

        if disposition is not None:
            args.output.write_text(text, encoding="utf-8")
            args.metadata.write_text(
                json.dumps(
                    {
                        "schema": "qore-reviewer-resilience-v1",
                        "terminal": True,
                        "terminal_disposition": disposition,
                        "generations": generation,
                        "attempts": attempts,
                        "elapsed_seconds": int(time.monotonic() - started),
                    },
                    indent=2,
                    sort_keys=True,
                ),
                encoding="utf-8",
            )
            return 0

        prior_rc = rc
        prior_signature = after
        if stagnant > args.max_stagnant_generations:
            reason = "REVIEWER_CHECKPOINT_STAGNATION"
            report = _host_blocked_report(
                reason=reason,
                generations=generation,
                checkpoint=_latest_complete_checkpoint(args.checkpoints),
            )
            args.output.write_text(report, encoding="utf-8")
            args.metadata.write_text(
                json.dumps(
                    {
                        "schema": "qore-reviewer-resilience-v1",
                        "terminal": True,
                        "terminal_disposition": "BLOCKED",
                        "reason": reason,
                        "generations": generation,
                        "attempts": attempts,
                        "elapsed_seconds": int(time.monotonic() - started),
                    },
                    indent=2,
                    sort_keys=True,
                ),
                encoding="utf-8",
            )
            return 0

    reason = "REVIEWER_RECOVERY_GENERATIONS_EXHAUSTED"
    report = _host_blocked_report(
        reason=reason,
        generations=args.max_generations,
        checkpoint=_latest_complete_checkpoint(args.checkpoints),
    )
    args.output.write_text(report, encoding="utf-8")
    args.metadata.write_text(
        json.dumps(
            {
                "schema": "qore-reviewer-resilience-v1",
                "terminal": True,
                "terminal_disposition": "BLOCKED",
                "reason": reason,
                "generations": args.max_generations,
                "attempts": attempts,
                "elapsed_seconds": int(time.monotonic() - started),
            },
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
