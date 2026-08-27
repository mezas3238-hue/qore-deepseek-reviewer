#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import os
from typing import Any

import deepseek_reviewer_compact_budgeted as compact

budgeted = compact.budgeted

# Reviewer-infrastructure correction after Expert R66 was mechanically consumed.
# The previous guard treated every UTF-8 request byte as one prompt token even
# after DeepSeek had returned exact prompt-token usage for several same-model
# requests. That worst-case byte proxy can falsely block a healthy final pass.
# V2 keeps the exact post-call 100k hard check, but once real usage exists it
# calibrates the next preflight from the highest observed prompt-token density
# with a large safety multiplier and an explicit protocol reserve.
MIN_PROMPT_TOKENS_PER_REQUEST_BYTE = float(
    os.environ.get("DEEPSEEK_PREFLIGHT_MIN_PROMPT_TOKENS_PER_BYTE", "0.50")
)
PROMPT_DENSITY_SAFETY_FACTOR = float(
    os.environ.get("DEEPSEEK_PREFLIGHT_DENSITY_SAFETY_FACTOR", "2.50")
)

if not 0.0 < MIN_PROMPT_TOKENS_PER_REQUEST_BYTE <= 1.0:
    raise RuntimeError(
        "DEEPSEEK_PREFLIGHT_MIN_PROMPT_TOKENS_PER_BYTE must be in (0, 1]"
    )
if PROMPT_DENSITY_SAFETY_FACTOR < 1.0:
    raise RuntimeError("DEEPSEEK_PREFLIGHT_DENSITY_SAFETY_FACTOR must be >= 1")

# R66's prompt required executable evidence from the exact current R62 scanner,
# but the original probe exposed only r60/r61/final_owner. Add R62 without
# changing Core or executing adversarial source text.
compact._SCANNER_TARGETS["r62"] = (
    "test_universal_cross_asset_conformance_final_owner_r62_guards",
    "_r62_dynamic_execution_markers_from_source",
)
for _tool in budgeted.TOOLS:
    _function = _tool.get("function") or {}
    if _function.get("name") != "scanner_probe":
        continue
    _function["description"] = (
        "Run the exact frozen QORE static scanner on supplied source without "
        "executing that source. Use scanner=r60/r61/r62/final_owner and report "
        "the actual marker tuple from the checked-out HEAD."
    )
    _enum = (
        _function.get("parameters", {})
        .get("properties", {})
        .get("scanner", {})
        .get("enum", [])
    )
    if "r62" not in _enum:
        _enum.append("r62")

_observed_prompt_token_densities: list[float] = []


def _request_payload_bytes(
    *,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> int:
    """Return the exact UTF-8 size of the JSON body used by budgeted.send_request."""
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
    # Match deepseek_reviewer_budgeted.send_request exactly: json.dumps uses
    # ensure_ascii=True by default before UTF-8 encoding.
    return len(json.dumps(payload).encode("utf-8"))


def _calibrated_density() -> float:
    if not _observed_prompt_token_densities:
        # First request has no model-specific evidence yet. Retain the original
        # one-byte/one-token worst-case admission rule for that call.
        return 1.0
    observed_max = max(_observed_prompt_token_densities)
    return min(
        1.0,
        max(
            MIN_PROMPT_TOKENS_PER_REQUEST_BYTE,
            observed_max * PROMPT_DENSITY_SAFETY_FACTOR,
        ),
    )


def guarded_send_request_v2(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    request_bytes = _request_payload_bytes(
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    density = _calibrated_density()
    estimated_prompt_tokens = math.ceil(request_bytes * density)
    actual_prompt_so_far = budgeted.TOTALS["prompt_tokens"]
    projected = (
        actual_prompt_so_far
        + estimated_prompt_tokens
        + compact.PROTOCOL_TOKEN_RESERVE
    )

    if projected > compact.HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "compact DeepSeek calibrated preflight blocked model call at hard ceiling: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{actual_prompt_so_far} request_utf8_bytes={request_bytes} "
            f"density={density:.6f} estimated_prompt_tokens="
            f"{estimated_prompt_tokens} reserve={compact.PROTOCOL_TOKEN_RESERVE} "
            f"projected={projected} target={compact.TARGET_PREFLIGHT_UPPER_BOUND} "
            f"hard={compact.HARD_TOTAL_PROMPT_TOKENS}"
        )
    if projected > compact.TARGET_PREFLIGHT_UPPER_BOUND:
        print(
            "DeepSeek compact preflight advisory: preferred target exceeded by "
            "calibrated conservative estimate, but hard ceiling remains satisfied: "
            f"stage={stage} round={round_number} actual_prompt_so_far="
            f"{actual_prompt_so_far} request_utf8_bytes={request_bytes} "
            f"density={density:.6f} estimated_prompt_tokens="
            f"{estimated_prompt_tokens} reserve={compact.PROTOCOL_TOKEN_RESERVE} "
            f"projected={projected} target={compact.TARGET_PREFLIGHT_UPPER_BOUND} "
            f"hard={compact.HARD_TOTAL_PROMPT_TOKENS}"
        )

    before_prompt_tokens = budgeted.TOTALS["prompt_tokens"]
    result = compact._original_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )
    request_prompt_tokens = budgeted.TOTALS["prompt_tokens"] - before_prompt_tokens
    if request_bytes > 0 and request_prompt_tokens >= 0:
        actual_density = request_prompt_tokens / request_bytes
        _observed_prompt_token_densities.append(actual_density)
        print(
            "DeepSeek prompt-density calibration: "
            f"stage={stage} round={round_number} request_utf8_bytes={request_bytes} "
            f"actual_prompt_tokens={request_prompt_tokens} "
            f"actual_tokens_per_byte={actual_density:.6f}"
        )

    actual_total = budgeted.TOTALS["prompt_tokens"]
    if actual_total > compact.HARD_TOTAL_PROMPT_TOKENS:
        raise RuntimeError(
            "DeepSeek hard prompt-token ceiling breached after exact API accounting: "
            f"actual={actual_total} hard={compact.HARD_TOTAL_PROMPT_TOKENS}"
        )
    return result


budgeted.send_request = guarded_send_request_v2


if __name__ == "__main__":
    raise SystemExit(budgeted.main())
