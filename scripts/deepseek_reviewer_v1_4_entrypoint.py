#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

import deepseek_reviewer_v1_3_entrypoint as v13

# V1.4 keeps the V1.3 evidence and fail-closed contracts intact. It only widens
# measured bottlenecks from BENCHMARK-V1.3-UNR018-CODER-01 and later exact review
# measurements: planner results must remain complete, and the final evidence fuse
# must fit the complete changed-file/dependency/baseline bundle plus bounded planned
# evidence without silent truncation. R22 measured 397,549 final evidence chars with
# 67,535 planned chars on a 35-file candidate; the budgets below preserve headroom
# for the existing bounded planner while keeping every fail-closed check intact.
v13.FINAL_MAX_TOKENS = max(v13.FINAL_MAX_TOKENS, 24000)
v13.MAX_PLANNED_TOOL_RESULT_CHARS = max(v13.MAX_PLANNED_TOOL_RESULT_CHARS, 80000)
v13.MAX_PLANNED_EVIDENCE_CHARS = max(v13.MAX_PLANNED_EVIDENCE_CHARS, 160000)
v13.MAX_FINAL_EVIDENCE_CHARS = max(v13.MAX_FINAL_EVIDENCE_CHARS, 520000)

_DIAGNOSTIC_PATH = Path("deepseek-plan-diagnostic.json")
_original_plan_additional_evidence = v13.plan_additional_evidence
_original_send_request = v13.budgeted.send_request


def _reason_markers(evidence: str, note: str, incomplete: bool) -> list[str]:
    markers: list[str] = []
    if "EVIDENCE_INCOMPLETE" in note:
        markers.append("planner_explicit_incomplete")
    if "## PLAN ERROR" in evidence:
        markers.append("plan_error")
    if "ERROR:" in evidence:
        markers.append("tool_error")
    if "## PLAN BUDGET" in evidence:
        markers.append("plan_bundle_budget")
    if "characters omitted by token budget" in evidence:
        markers.append("tool_token_clip")
    if "[truncated at" in evidence:
        markers.append("tool_char_clip")
    if incomplete and not markers:
        markers.append("incomplete_unclassified")
    return markers


def _planner_note_status(note: str) -> str:
    if "EVIDENCE_INCOMPLETE" in note:
        return "evidence_incomplete"
    if "EVIDENCE_COMPLETE" in note:
        return "evidence_complete"
    if note == "Batched evidence plan executed.":
        return "batched_tools"
    if note:
        return "other_nonempty"
    return "empty"


def plan_additional_evidence(prompt: str) -> tuple[str, str, bool]:
    evidence, note, incomplete = _original_plan_additional_evidence(prompt)
    diagnostic = {
        "plan_incomplete": incomplete,
        "planned_chars": len(evidence),
        "planner_note_chars": len(note),
        "planner_note_status": _planner_note_status(note),
        "reason_markers": _reason_markers(evidence, note, incomplete),
        "final_max_tokens": v13.FINAL_MAX_TOKENS,
        "max_planned_tool_result_chars": v13.MAX_PLANNED_TOOL_RESULT_CHARS,
        "max_planned_evidence_chars": v13.MAX_PLANNED_EVIDENCE_CHARS,
        "max_final_evidence_chars": v13.MAX_FINAL_EVIDENCE_CHARS,
    }
    _DIAGNOSTIC_PATH.write_text(
        json.dumps(diagnostic, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print("DeepSeek V1.4 plan diagnostic: " + json.dumps(diagnostic, sort_keys=True))
    return evidence, note, incomplete


v13.plan_additional_evidence = plan_additional_evidence


def send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    effective_messages = messages
    if stage == "final" and thinking and messages:
        effective_messages = copy.deepcopy(messages)
        first = effective_messages[0]
        first["content"] = str(first.get("content") or "") + (
            "\nYou MUST finish the independent analysis early enough to emit a visible final "
            "review within this response. Do not spend the entire output envelope on hidden "
            "reasoning. Preserve depth and fail closed if evidence is insufficient."
        )
    return _original_send_request(
        stage=stage,
        round_number=round_number,
        messages=effective_messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )


v13.budgeted.send_request = send_request


def _append_diagnostic_marker() -> None:
    if not _DIAGNOSTIC_PATH.is_file() or not v13.reviewer.OUTPUT.is_file():
        return
    diagnostic = json.loads(_DIAGNOSTIC_PATH.read_text(encoding="utf-8"))
    marker = (
        "<!-- QORE-DEEPSEEK-PLAN-DIAGNOSTIC "
        + json.dumps(diagnostic, sort_keys=True, separators=(",", ":"))
        + " -->"
    )
    review = v13.reviewer.OUTPUT.read_text(encoding="utf-8").rstrip()
    v13.reviewer.OUTPUT.write_text(review + "\n\n" + marker + "\n", encoding="utf-8")


def main() -> int:
    result = v13.main()
    _append_diagnostic_marker()
    return result


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        v13.budgeted.write_usage_summary()
        print(
            f"ERROR: {type(exc).__name__}: {exc}",
            file=v13.quality_guarded.os.sys.stderr,
        )
        raise
