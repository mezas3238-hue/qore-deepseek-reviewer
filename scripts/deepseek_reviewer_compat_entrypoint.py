#!/usr/bin/env python3
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

import deepseek_reviewer_budgeted as budgeted

# Quality non-regression requires enough exploration capacity to reach an explicit
# evidence-complete stop. Keep the hard evidence/context/token guards unchanged;
# only raise the round ceiling above the initial seven-round pilot.
budgeted.MAX_EXPLORER_ROUNDS = max(budgeted.MAX_EXPLORER_ROUNDS, 12)

_EXPLORER_REDUNDANT_INSTRUCTION = (
    "First verify repo_state once. Then inspect every changed file completely using "
    "targeted line ranges, plus only the surrounding definitions/usages needed to "
    "falsify the requested invariants."
)
_EXPLORER_OPTIMIZED_INSTRUCTION = (
    "First verify repo_state once. The quality guard injects every changed file "
    "completely into the FINAL pass and also injects the exact BASE..HEAD patch for "
    "modified files. Do NOT spend explorer calls rereading changed-file content. "
    "Use explorer tools only for surrounding/reused definitions and usages, exact "
    "binding/CI evidence, and other evidence outside the mandatory changed-file bundle "
    "needed to falsify the requested invariants. Once those external dependencies are "
    "sufficient, stop calling tools and return EVIDENCE_COMPLETE with the strongest "
    "candidate finding or 'no material candidate found'."
)


def _optimized_explorer_messages(
    stage: str,
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
    """Preserve API compatibility and remove redundant explorer changed-file reads."""

    payload: dict[str, Any] = {
        "model": model,
        "messages": _optimized_explorer_messages(stage, messages),
        "stream": False,
        "max_tokens": max_tokens,
        "thinking": {"type": "enabled" if thinking else "disabled"},
    }
    if thinking:
        payload["reasoning_effort"] = "high"
    if tools:
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


if __name__ == "__main__":
    try:
        raise SystemExit(quality_guarded.main())
    except Exception as exc:  # noqa: BLE001
        quality_guarded.budgeted.write_usage_summary()
        print(f"ERROR: {type(exc).__name__}: {exc}", file=quality_guarded.os.sys.stderr)
        raise
