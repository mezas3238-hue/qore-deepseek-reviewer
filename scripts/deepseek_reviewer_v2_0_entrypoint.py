#!/usr/bin/env python3
from __future__ import annotations

import copy
from typing import Any

import deepseek_reviewer_v1_7_entrypoint as v17

v16 = v17.v16
v15 = v17.v15
v13 = v17.v13
budgeted = v13.budgeted

# V2.0 keeps the stable V1.7 evidence path unchanged: complete changed files,
# deterministic dependency slices, one-shot planner, exact read-only tools and every
# fail-closed gate. V1.8/V1.9 multi-hop prefix continuation is intentionally not
# inherited because measured prompt consumption grew from 37k to 97k while still
# failing to emit a verdict.
#
# The authoritative reviewer remains deepseek-v4-pro with thinking enabled and
# reasoning_effort=high. It receives one larger bounded output envelope once. If that
# single response is truncated or has no visible verdict, the harness blocks locally
# and performs no fallback API call.
FINAL_SINGLE_PASS_MAX_TOKENS = 48000
VISIBLE_RESERVE_TOKENS = 4000
v13.FINAL_MAX_TOKENS = FINAL_SINGLE_PASS_MAX_TOKENS

_v17_send_request = budgeted.send_request
_base_send_request = v16._base_send_request
_final_failed_reason = ""


def _choice(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        return {}
    value = choices[0]
    return value if isinstance(value, dict) else {}


def _message(response: dict[str, Any]) -> dict[str, Any]:
    value = _choice(response).get("message") or {}
    return value if isinstance(value, dict) else {}


def _blocked_response(model: str, reason: str) -> dict[str, Any]:
    return {
        "model": model,
        "choices": [
            {
                "finish_reason": "stop",
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": (
                        "EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA\n\n" + reason
                    ),
                },
            }
        ],
    }


def _single_pass_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared = copy.deepcopy(messages)
    if prepared and isinstance(prepared[0], dict):
        prepared[0]["content"] = str(prepared[0].get("content") or "") + (
            "\n\nV2.0 SINGLE-PASS OUTPUT CONTRACT:\n"
            "Preserve the full adversarial review depth and inspect all supplied evidence. "
            f"The total output envelope is {FINAL_SINGLE_PASS_MAX_TOKENS} tokens. Complete "
            "hidden reasoning early enough to reserve at least "
            f"{VISIBLE_RESERVE_TOKENS} tokens for the visible self-contained verdict. "
            "Do not intentionally consume the entire envelope as hidden reasoning. "
            "A concise visible verdict is mandatory: material findings with constructible "
            "witnesses, or HALLAZGOS: NINGUNO / VALIDACIÓN OK."
        )
    return prepared


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
    global _final_failed_reason

    if stage == "final" and thinking:
        response = _base_send_request(
            stage=stage,
            round_number=round_number,
            messages=_single_pass_messages(messages),
            thinking=True,
            tools=False,
            max_tokens=FINAL_SINGLE_PASS_MAX_TOKENS,
            model=model,
        )
        choice = _choice(response)
        message = _message(response)
        finish_reason = str(choice.get("finish_reason") or "")
        reasoning = str(message.get("reasoning_content") or "")
        visible = str(message.get("content") or "").strip()
        truncated = finish_reason == "length"

        v15._merge_diagnostic(
            v2_0_single_pass=True,
            v2_0_final_max_tokens=FINAL_SINGLE_PASS_MAX_TOKENS,
            v2_0_visible_reserve_tokens=VISIBLE_RESERVE_TOKENS,
            v2_0_finish_reason=finish_reason,
            v2_0_reasoning_chars=len(reasoning),
            v2_0_visible_chars=len(visible),
            v2_0_no_api_fallback=True,
        )

        if truncated or not visible:
            _final_failed_reason = (
                "V2.0 single deepseek-v4-pro/high pass did not reach a complete visible "
                "verdict inside its bounded output envelope. No second API review or CoT "
                "continuation was issued."
            )
            # V1.3 will request final-fallback when content is empty. Route that stage to
            # a local deterministic blocked response rather than another DeepSeek call.
            message["content"] = ""
        return response

    if stage == "final-fallback" and _final_failed_reason:
        return _blocked_response(model, _final_failed_reason)

    return _v17_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )


budgeted.send_request = send_request


def main() -> int:
    return v17.main()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        budgeted.write_usage_summary()
        print(
            f"ERROR: {type(exc).__name__}: {exc}",
            file=v13.quality_guarded.os.sys.stderr,
        )
        raise
