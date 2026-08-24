#!/usr/bin/env python3
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

import deepseek_reviewer_budgeted as budgeted

# Five evidence-gathering rounds plus one explicit closure round are enough for
# surrounding/reused definitions while the quality guard injects the complete
# changed-file surface into the final pass. Never allow an environment override
# to silently expand this optimized ceiling.
budgeted.MAX_EXPLORER_ROUNDS = max(2, min(budgeted.MAX_EXPLORER_ROUNDS, 6))
_EXPLORER_CLOSURE_ROUND = budgeted.MAX_EXPLORER_ROUNDS

# The previous 7k final cap was repeatedly consumed entirely by reasoning,
# producing no visible review and forcing a second full-prompt fallback. Give the
# reasoned pass enough answer headroom so the fallback becomes exceptional.
budgeted.FINAL_MAX_TOKENS = max(budgeted.FINAL_MAX_TOKENS, 10000)

_EXPLORER_REDUNDANT_INSTRUCTION = (
    "First verify repo_state once. Then inspect every changed file completely using "
    "targeted line ranges, plus only the surrounding definitions/usages needed to "
    "falsify the requested invariants."
)
_EXPLORER_OPTIMIZED_INSTRUCTION = (
    "First verify repo_state once. The quality guard injects every changed file "
    "completely into the FINAL pass, injects the exact BASE..HEAD patch for modified "
    "files, and deterministically injects complete local qore.infrastructure modules "
    "imported by changed Python files. Do NOT spend explorer calls rereading changed "
    "files or those imported local dependency modules. Use explorer tools only for "
    "binding/CI evidence and additional surrounding definitions/usages not already in "
    "that mandatory bundle. Batch independent reads/searches. Once that extra evidence "
    "is sufficient, stop calling tools and return EVIDENCE_COMPLETE with the strongest "
    "candidate finding or 'no material candidate found'."
)
_EXPLORER_CLOSURE_INSTRUCTION = (
    "EXPLORATION CLOSURE. Do not call tools. The FINAL pass will deterministically receive "
    "all complete changed files, exact modified-file patches, and complete local "
    "qore.infrastructure modules imported by changed Python files. Based on those "
    "guarantees plus evidence already collected, return a compact note beginning exactly "
    "with EVIDENCE_COMPLETE if no additional surrounding evidence is missing; otherwise "
    "begin exactly with EVIDENCE_INCOMPLETE and name only evidence outside that mandatory "
    "bundle. Do not infer unseen facts."
)


def _optimized_explorer_messages(
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if stage != "explore" or not messages:
        return messages

    optimized = [dict(message) for message in messages]
    first = dict(optimized[0])
    content = str(first.get("content") or "")
    if _EXPLORER_REDUNDANT_INSTRUCTION not in content:
        raise RuntimeError(
            "explorer system prompt changed; refuse to apply token optimization silently"
        )
    first["content"] = content.replace(
        _EXPLORER_REDUNDANT_INSTRUCTION,
        _EXPLORER_OPTIMIZED_INSTRUCTION,
        1,
    )
    optimized[0] = first

    if round_number >= _EXPLORER_CLOSURE_ROUND:
        optimized.append({"role": "user", "content": _EXPLORER_CLOSURE_INSTRUCTION})
    return optimized


def compat_send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    """Preserve API compatibility while bounding redundant review-token use."""

    closure_round = stage == "explore" and round_number >= _EXPLORER_CLOSURE_ROUND
    effective_tools = tools and not closure_round
    effective_max_tokens = 700 if closure_round else max_tokens

    payload: dict[str, Any] = {
        "model": model,
        "messages": _optimized_explorer_messages(stage, round_number, messages),
        "stream": False,
        "max_tokens": effective_max_tokens,
        "thinking": {"type": "enabled" if thinking else "disabled"},
    }
    if thinking:
        payload["reasoning_effort"] = "high"
    if effective_tools:
        payload["tools"] = budgeted.TOOLS
        payload["tool_choice"] = "auto"

    def send(body: dict[str, Any]) -> dict[str, Any]:
        request = urllib.request.Request(
            budgeted.reviewer.API_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {budgeted.reviewer.API_KEY}",
            },
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.loads(response.read().decode("utf-8"))

    try:
        result = send(payload)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if exc.code != 400:
            raise RuntimeError(f"DeepSeek HTTP {exc.code}: {detail}") from exc

        fallback = dict(payload)
        fallback.pop("thinking", None)
        fallback.pop("reasoning_effort", None)
        print(
            f"DeepSeek {stage}#{round_number} returned HTTP 400 with thinking controls; "
            "retrying the same request without those optional controls."
        )
        try:
            result = send(fallback)
        except urllib.error.HTTPError as second:
            detail2 = second.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"DeepSeek HTTP {second.code} after compatibility fallback: {detail2}"
            ) from second

    budgeted.record_usage(stage, round_number, result)
    return result


budgeted.send_request = compat_send_request

import deepseek_reviewer_quality_guarded as quality_guarded  # noqa: E402

# Explicit incomplete closure must fail closed just like context/token exhaustion.
if "EVIDENCE_INCOMPLETE" not in quality_guarded.BUDGET_INCOMPLETE_MARKERS:
    quality_guarded.BUDGET_INCOMPLETE_MARKERS = (
        *quality_guarded.BUDGET_INCOMPLETE_MARKERS,
        "EVIDENCE_INCOMPLETE",
    )


if __name__ == "__main__":
    try:
        raise SystemExit(quality_guarded.main())
    except Exception as exc:  # noqa: BLE001
        quality_guarded.budgeted.write_usage_summary()
        print(f"ERROR: {type(exc).__name__}: {exc}", file=quality_guarded.os.sys.stderr)
        raise
