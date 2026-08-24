#!/usr/bin/env python3
from __future__ import annotations

import ast
import copy
import json
import os
import subprocess
from typing import Any

import deepseek_reviewer_budgeted as budgeted

reviewer = budgeted.reviewer
MAX_MANDATORY_CHANGED_CHARS = int(
    os.environ.get("DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS", "140000")
)
MAX_MANDATORY_DEPENDENCY_CHARS = int(
    os.environ.get("DEEPSEEK_MAX_MANDATORY_DEPENDENCY_CHARS", "140000")
)
MAX_MANDATORY_DEPENDENCY_FILES = int(
    os.environ.get("DEEPSEEK_MAX_MANDATORY_DEPENDENCY_FILES", "4")
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
            "git command failed while building mandatory review evidence: "
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


def changed_rows() -> list[tuple[str, str]]:
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

    parsed: list[tuple[str, str]] = []
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
        parsed.append((status, path))
    return parsed


def build_mandatory_changed_evidence() -> tuple[str, int]:
    blocks = [
        "# MANDATORY COMPLETE CHANGED-FILE EVIDENCE\n",
        "These snapshots are injected by the harness, not selected by the model.\n",
        "They must be inspected completely by the final reviewer.\n",
    ]
    changed_count = 0

    for status, path in changed_rows():
        status_code = status[:1]
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

    return "".join(blocks), changed_count


def local_infrastructure_dependency_paths() -> tuple[str, ...]:
    changed = {path for _, path in changed_rows()}
    dependencies: set[str] = set()

    for status, path in changed_rows():
        if status[:1] == "D" or not path.endswith(".py"):
            continue
        content = raw_git("show", f"{reviewer.EXPECTED_HEAD}:{path}")
        try:
            tree = ast.parse(content, filename=path)
        except SyntaxError as exc:
            raise RuntimeError(
                f"cannot parse changed Python file {path!r} for dependency evidence"
            ) from exc

        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom) or node.module is None:
                continue
            if not node.module.startswith("qore.infrastructure."):
                continue
            relative = node.module.removeprefix("qore.").replace(".", "/") + ".py"
            dependency_path = f"src/qore/{relative}"
            if dependency_path not in changed:
                dependencies.add(dependency_path)

    ordered = tuple(sorted(dependencies))
    if len(ordered) > MAX_MANDATORY_DEPENDENCY_FILES:
        raise RuntimeError(
            "mandatory local dependency evidence requires "
            f"{len(ordered)} files, exceeding "
            f"DEEPSEEK_MAX_MANDATORY_DEPENDENCY_FILES={MAX_MANDATORY_DEPENDENCY_FILES}; "
            "split the review surface or explicitly raise the quality budget"
        )
    return ordered


def build_mandatory_dependency_evidence() -> tuple[str, int]:
    paths = local_infrastructure_dependency_paths()
    if not paths:
        return "", 0

    blocks = [
        "\n# MANDATORY LOCAL DEPENDENCY EVIDENCE\n",
        "These exact HEAD snapshots are imported by changed Python files and are injected "
        "deterministically so composition/revalidation invariants never depend on the model "
        "remembering to fetch local GitHub evidence.\n",
    ]

    for index, path in enumerate(paths, start=1):
        try:
            content = raw_git("show", f"{reviewer.EXPECTED_HEAD}:{path}")
        except RuntimeError as exc:
            raise RuntimeError(
                f"required local dependency {path!r} is unavailable at frozen HEAD"
            ) from exc
        if "\x00" in content or "\ufffd" in content:
            raise RuntimeError(
                f"dependency file {path!r} is not safely representable as UTF-8 text"
            )
        blocks.append(
            f"\n## LOCAL DEPENDENCY {index}\n"
            f"PATH: {path}\n"
            f"REF: {reviewer.EXPECTED_HEAD}\n"
            f"LINES: {len(content.splitlines())}\n"
            "CONTENT (complete):\n"
            f"{numbered_text(content)}\n"
        )
        current_chars = sum(len(item) for item in blocks)
        if current_chars > MAX_MANDATORY_DEPENDENCY_CHARS:
            raise RuntimeError(
                "mandatory local dependency evidence exceeds "
                f"DEEPSEEK_MAX_MANDATORY_DEPENDENCY_CHARS="
                f"{MAX_MANDATORY_DEPENDENCY_CHARS}; split the review surface or explicitly "
                "raise the quality budget. Dependencies will not be truncated."
            )

    return "".join(blocks), len(paths)


def clean_verdict_markers(final: str) -> set[str]:
    return {
        line.strip().strip("*` ")
        for line in final.splitlines()
        if line.strip()
    }


def main() -> int:
    mandatory_changed, changed_count = build_mandatory_changed_evidence()
    mandatory_dependencies, dependency_count = build_mandatory_dependency_evidence()
    mandatory_evidence = mandatory_changed + mandatory_dependencies
    print(
        "Quality guard prepared mandatory evidence: "
        f"changed_files={changed_count}, dependencies={dependency_count}, "
        f"chars={len(mandatory_evidence)}."
    )

    original_send_request = budgeted.send_request
    original_append_evidence = budgeted.append_evidence
    quality_state: dict[str, Any] = {
        "budget_incomplete": False,
        "evidence_truncated": False,
    }

    def guarded_append_evidence(
        evidence: list[str],
        *,
        name: str,
        arguments: dict[str, Any],
        result: str,
    ) -> None:
        current = sum(len(item) for item in evidence)
        prospective_block = (
            f"\n## TOOL {name}\n"
            f"ARGS: {json.dumps(arguments, sort_keys=True)}\n"
            f"{budgeted.compact_clip(result)}\n"
        )
        remaining = budgeted.MAX_EVIDENCE_CHARS - current
        if remaining <= 0 or len(prospective_block) > remaining:
            quality_state["evidence_truncated"] = True
        original_append_evidence(
            evidence,
            name=name,
            arguments=arguments,
            result=result,
        )

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
            if quality_state["evidence_truncated"]:
                incomplete = True
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
                    + "changed-file and local-dependency evidence appended to the user message "
                    + "is complete and must be inspected in full. If any other surrounding "
                    + "definition/evidence required to certify a requested invariant is absent, "
                    + "do not infer it. Return EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA "
                    + "rather than a clean verdict. A token/context/evidence budget stop can "
                    + "never by itself support HALLAZGOS: NINGUNO / VALIDACIÓN OK.\n"
                )
            if guarded_messages and isinstance(guarded_messages[-1], dict):
                guarded_messages[-1]["content"] = (
                    str(guarded_messages[-1].get("content") or "")
                    + "\n\n"
                    + mandatory_evidence
                )
            kwargs["messages"] = guarded_messages

        return original_send_request(**kwargs)

    budgeted.append_evidence = guarded_append_evidence
    budgeted.send_request = guarded_send_request
    try:
        returncode = budgeted.main()
    finally:
        budgeted.append_evidence = original_append_evidence
        budgeted.send_request = original_send_request

    if quality_state["budget_incomplete"]:
        final = reviewer.OUTPUT.read_text(encoding="utf-8") if reviewer.OUTPUT.is_file() else ""
        markers = clean_verdict_markers(final)
        if "VALIDACIÓN OK" in markers or "HALLAZGOS: NINGUNO" in markers:
            reviewer.OUTPUT.write_text(
                "EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA\n\n"
                "Quality guard rejected the model's clean verdict because exploration ended "
                "without certified-complete surrounding evidence. No clean conclusion is "
                "published from missing evidence; this is a deterministic fail-closed review "
                "result, not an infrastructure failure.\n",
                encoding="utf-8",
            )
            print(
                "Quality guard replaced an unsupported clean verdict with deterministic "
                "VALIDACIÓN BLOQUEADA output."
            )

    return returncode


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {type(exc).__name__}: {exc}", file=os.sys.stderr)
        raise
