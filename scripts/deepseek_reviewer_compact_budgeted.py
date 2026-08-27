#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from typing import Any

import deepseek_reviewer_budgeted as budgeted

# Compact-review policy: 60k-80k cumulative prompt input is the preferred
# operating target when sufficient, while 100k is the actual hard ceiling.
# Preflight uses a deliberately conservative UTF-8 request-size upper bound;
# exceeding the preferred target is advisory, but exceeding the hard ceiling
# blocks the call. Actual API prompt usage is checked again after every call.
HARD_TOTAL_PROMPT_TOKENS = int(
    os.environ.get("DEEPSEEK_MAX_TOTAL_PROMPT_TOKENS", "100000")
)
TARGET_PREFLIGHT_UPPER_BOUND = int(
    os.environ.get("DEEPSEEK_TARGET_TOTAL_PROMPT_TOKENS", "80000")
)
PROTOCOL_TOKEN_RESERVE = int(
    os.environ.get("DEEPSEEK_PROMPT_PROTOCOL_TOKEN_RESERVE", "8192")
)

if TARGET_PREFLIGHT_UPPER_BOUND > HARD_TOTAL_PROMPT_TOKENS:
    raise RuntimeError(
        "DEEPSEEK_TARGET_TOTAL_PROMPT_TOKENS must not exceed the hard prompt-token ceiling"
    )
if PROTOCOL_TOKEN_RESERVE <= 0:
    raise RuntimeError("DEEPSEEK_PROMPT_PROTOCOL_TOKEN_RESERVE must be positive")

# Keep retrieval bounded enough that the final falsification pass normally lands
# in the preferred 60k-80k cumulative input range rather than merely below 100k.
budgeted.MAX_EXPLORER_ROUNDS = int(os.environ.get("DEEPSEEK_MAX_EXPLORER_ROUNDS", "4"))
budgeted.MAX_TOOL_CALLS_PER_ROUND = int(
    os.environ.get("DEEPSEEK_MAX_TOOL_CALLS_PER_ROUND", "6")
)
budgeted.MAX_EXPLORATION_CONTEXT_CHARS = int(
    os.environ.get("DEEPSEEK_MAX_EXPLORATION_CONTEXT_CHARS", "40000")
)
budgeted.MAX_TOOL_TEXT = int(os.environ.get("DEEPSEEK_MAX_TOOL_TEXT", "5000"))
budgeted.MAX_EVIDENCE_CHARS = int(os.environ.get("DEEPSEEK_MAX_EVIDENCE_CHARS", "32000"))
budgeted.EXPLORATION_PROMPT_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_PROMPT_TOKEN_BUDGET", "30000")
)
budgeted.EXPLORATION_CACHE_MISS_BUDGET = int(
    os.environ.get("DEEPSEEK_EXPLORATION_CACHE_MISS_TOKEN_BUDGET", "25000")
)
budgeted.EXPLORER_MAX_TOKENS = int(
    os.environ.get("DEEPSEEK_EXPLORER_MAX_TOKENS", "1800")
)


def compact_clip(text: str, limit: int | None = None) -> str:
    actual_limit = budgeted.MAX_TOOL_TEXT if limit is None else limit
    if len(text) <= actual_limit:
        return text
    head = max(1, (actual_limit * 3) // 4)
    tail = max(1, actual_limit - head)
    omitted = len(text) - head - tail
    return (
        text[:head]
        + f"\n...[{omitted} characters omitted by compact input budget]...\n"
        + text[-tail:]
    )


budgeted.compact_clip = compact_clip
budgeted.reviewer.clip = compact_clip
_original_send_request = budgeted.send_request


def _request_payload_upper_bound(
    *,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> int:
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
        "max_tokens": max_tokens,
        "thinking": {"type": "enabled" if thinking else "disabled"},
    }
    if thinking:
        payload["reasoning_effort"] = "high"
    if tools:
        payload["tools"] = budgeted.TOOLS
        payload["tool_choice"] = "auto"

    # DeepSeek tokenization is server-side. UTF-8 request bytes are deliberately
    # used as a conservative preflight proxy: one input token cannot require
    # more independent budget units than one request byte for the JSON text we
    # send, while the explicit reserve covers chat/protocol framing not present
    # in the serialized request body.
    return len(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    )


def guarded_send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    request_upper_bound = _request_payload_upper_bound(
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    projected = (
        budgeted.TOTALS["prompt_tokens"]
        + request_upper_bound
        + PROTOCOL_TOKEN_RESERVE
    )
    if projected > HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "compact DeepSeek preflight blocked model call at hard ceiling: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{budgeted.TOTALS['prompt_tokens']} request_utf8_bytes="
            f"{request_upper_bound} reserve={PROTOCOL_TOKEN_RESERVE} "
            f"projected_upper_bound={projected} target="
            f"{TARGET_PREFLIGHT_UPPER_BOUND} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )
    if projected > TARGET_PREFLIGHT_UPPER_BOUND:
        print(
            "DeepSeek compact preflight advisory: preferred target exceeded by "
            "conservative upper bound, but hard ceiling remains satisfied: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{budgeted.TOTALS['prompt_tokens']} request_utf8_bytes="
            f"{request_upper_bound} reserve={PROTOCOL_TOKEN_RESERVE} "
            f"projected_upper_bound={projected} target="
            f"{TARGET_PREFLIGHT_UPPER_BOUND} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )

    result = _original_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    actual = budgeted.TOTALS["prompt_tokens"]
    if actual > HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "DeepSeek hard prompt-token ceiling breached despite conservative preflight: "
            f"actual={actual} hard={HARD_TOTAL_PROMPT_TOKENS}"
        )
    return result


budgeted.send_request = guarded_send_request


if __name__ == "__main__":
    raise SystemExit(budgeted.main())
