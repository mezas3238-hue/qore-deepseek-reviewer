#!/usr/bin/env python3
from __future__ import annotations

import copy
import os
import pathlib
import subprocess
from typing import Any

import deepseek_reviewer_budgeted as budgeted

reviewer = budgeted.reviewer
MAX_MANDATORY_CHANGED_CHARS = int(
    os.environ.get("DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS", "140000")
)

BUDGET_INCOMPLETE_MARKERS = (
    "Exploration stopped by harness token budget.",
    "Exploration stopped before the next API call because the serialized context reached",
)


def raw_git(*args: str) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=reviewer.ROOT,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
        env=os.environ.copy(),
    )
    if proc.returncode != 0:
        raise RuntimeError(
            "git command failed while building mandatory changed-file evidence: "
            + " ".join(args)
            + "\n"
            + proc.stdout
        )
    return proc.stdout


def numbered_text(text: str) -> str:
    lines = text.splitlines()
    if not lines:
        return "[empty file]"
    return "\n".join(f"{index}: {line}" for index, line in enumerate(lines, start=1))


def build_mandatory_changed_evidence() -> tuple[str, int]:
    status_text = raw_git(
        "diff",
        "--name-status",
        "--no-renames",
        reviewer.EXPECTED_BASE,
        reviewer.EXPECTED_HEAD,
    )
    rows = [line for line in status_text.splitlines() if line.strip()]
    if not rows:
        raise RuntimeError("frozen BASE..HEAD contains no changed files")

    blocks = [
        "# MANDATORY COMPLETE CHANGED-FILE EVIDENCE\n",
        "These snapshots are injected by the harness, not selected by the model.\n",
        "They must be inspected completely by the final reviewer.\n",
    ]
    changed_count = 0

    for row in rows:
        fields = row.split("\t")
        if len(fields) != 2:
            raise RuntimeError(f"unexpected --name-status row: {row!r}")
        status, path = fields
        status_code = status[:1]
        if status_code not in {"A", "M", "D", "T"}:
            raise RuntimeError(
                f"unsupported changed-file status {status!r} for {path!r}; "
                "review must fail closed rather than omit evidence"
            )

        ref = reviewer.EXPECTED_BASE if status_code == "D" else reviewer.EXPECTED_HEAD
        content = raw_git("show", f"{ref}:{path}")
        if "\x00" in content or "\ufffd" in content:
            raise RuntimeError(
                f"changed file {path!r} is not safely representable as UTF-8 text; "
                "review must fail closed rather than omit evidence"
            )

        block = (
            f"\n## CHANGED FILE {changed_count + 1}\n"
            f"STATUS: {status}\n"
            f"PATH: {path}\n"
            f"REF: {ref}\n"
            f"LINES: {len(content.splitlines())}\n"
            "CONTENT (complete):\n"
            f"{numbered_text(content)}\n"
        )

        if status_code in {"M", "T"}:
            patch = raw_git(
                "diff",
                "--no-ext-diff",
                "--unified=3",
                reviewer.EXPECTED_BASE,
                reviewer.EXPECTED_HEAD,
                "--",
                path,
            )
            block += "PATCH (exact BASE..HEAD):\n" + patch + "\n"

        blocks.append(block)
        changed_count += 1

        current_chars = sum(len(item) for item in blocks)
        if current_chars > MAX_MANDATORY_CHANGED_CHARS:
            raise RuntimeError(
                "mandatory complete changed-file evidence exceeds "
                f"DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS={MAX_MANDATORY_CHANGED_CHARS}; "
                "split the review surface or explicitly raise the quality budget. "
                "The harness will not truncate changed files to save tokens."
            )

    evidence = "".join(blocks)
    return evidence, changed_count


def main() -> int:
    mandatory_evidence, changed_count = build_mandatory_changed_evidence()
    print(
        "Quality guard prepared complete changed-file evidence: "
        f"files={changed_count}, chars={len(mandatory_evidence)}."
    )

    original_send_request = budgeted.send_request
    quality_state: dict[str, Any] = {"budget_incomplete": False}

    def guarded_send_request(**kwargs: Any) -> dict[str, Any]:
        stage = str(kwargs.get("stage") or "")
        messages = kwargs.get("messages")
        if stage.startswith("final") and isinstance(messages, list):
            guarded_messages = copy.deepcopy(messages)
            combined = "\n".join(
                str(message.get("content") or "")
                for message in guarded_messages
                if isinstance(message, dict)
            )
            incomplete = any(marker in combined for marker in BUDGET_INCOMPLETE_MARKERS)
            if (
                budgeted.TOTALS["api_calls"] >= budgeted.MAX_EXPLORER_ROUNDS
                and "EVIDENCE_COMPLETE" not in combined
                and "No separate explorer note; use raw evidence." in combined
            ):
                incomplete = True
            if incomplete:
                quality_state["budget_incomplete"] = True

            if guarded_messages and isinstance(guarded_messages[0], dict):
                guarded_messages[0]["content"] = (
                    str(guarded_messages[0].get("content") or "")
                    + "\n\nQUALITY NON-REGRESSION RULE:\n"
                    + "Token reduction may NEVER justify a weaker review. The mandatory "
                    + "changed-file evidence appended to the user message is complete and "
                    + "must be inspected in full. If any surrounding definition/evidence "
                    + "required to certify a requested invariant is absent, do not infer it. "
                    + "Return EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA rather than a "
                    + "clean verdict. A token/context budget stop can never by itself support "
                    + "HALLAZGOS: NINGUNO / VALIDACIÓN OK.\n"
                )
            if guarded_messages and isinstance(guarded_messages[-1], dict):
                guarded_messages[-1]["content"] = (
                    str(guarded_messages[-1].get("content") or "")
                    + "\n\n"
                    + mandatory_evidence
                )
            kwargs["messages"] = guarded_messages

        return original_send_request(**kwargs)

    budgeted.send_request = guarded_send_request
    try:
        returncode = budgeted.main()
    finally:
        budgeted.send_request = original_send_request

    if quality_state["budget_incomplete"]:
        final = reviewer.OUTPUT.read_text(encoding="utf-8") if reviewer.OUTPUT.is_file() else ""
        if "VALIDACIÓN OK" in final or "HALLAZGOS: NINGUNO" in final:
            try:
                reviewer.OUTPUT.unlink()
            except FileNotFoundError:
                pass
            raise RuntimeError(
                "quality guard rejected a clean verdict after exploration budget/context "
                "exhaustion; increase evidence budget or narrow the review surface"
            )

    return returncode


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {type(exc).__name__}: {exc}", file=os.sys.stderr)
        raise
