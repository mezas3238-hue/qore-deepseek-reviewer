#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import urllib.error
import urllib.request
from typing import Any

import deepseek_reviewer_v1_7_entrypoint as v17

v16 = v17.v16
v15 = v17.v15
v13 = v17.v13
budgeted = v13.budgeted
reviewer = v13.reviewer

# V1.8 keeps the V1.7 evidence planner/tools and V4-Pro/high authoritative pass.
# The remaining measured failure is completion-only: the 20k Pro/high pass ends
# with finish_reason=length and no visible verdict. DeepSeek's official Chat Prefix
# Completion beta explicitly supports continuing max_tokens-truncated responses and
# accepts reasoning_content as the prior CoT when prefix=True.
#
# V1.8 therefore continues the SAME high-reasoning response once. It does not use a
# non-thinking model to infer a verdict from truncated analysis. If the continuation
# still does not naturally stop with visible content, validation remains fail-closed.
PREFIX_CONTINUATION_MAX_TOKENS = 8000
BETA_CHAT_URL = "https://api.deepseek.com/beta/chat/completions"

_original_send_request = budgeted.send_request
_last_final_messages: list[dict[str, Any]] = []


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
                        "EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA\n\n"
                        + reason
                    ),
                },
            }
        ],
    }


def _prefix_continue(model: str) -> dict[str, Any]:
    reasoning = v16._last_final_reasoning
    if not reasoning or not _last_final_messages:
        return _blocked_response(
            model,
            "V1.8 had no retained high-reasoning state to continue.",
        )

    messages = copy.deepcopy(_last_final_messages)
    messages.append(
        {
            "role": "assistant",
            "content": "",
            "reasoning_content": reasoning,
            "prefix": True,
        }
    )
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "max_tokens": PREFIX_CONTINUATION_MAX_TOKENS,
        "thinking": {"type": "enabled"},
        "reasoning_effort": "high",
    }
    request = urllib.request.Request(
        BETA_CHAT_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {reviewer.API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if len(detail) > 1200:
            detail = detail[:1200] + "...[diagnostic bounded]"
        v15._merge_diagnostic(
            v1_8_prefix_continuation=True,
            v1_8_prefix_http_error=exc.code,
        )
        return _blocked_response(
            model,
            f"V1.8 prefix continuation HTTP {exc.code}: {detail}",
        )

    budgeted.record_usage("final-prefix", 1, result)
    choice = _choice(result)
    message = _message(result)
    finish_reason = str(choice.get("finish_reason") or "")
    visible = str(message.get("content") or "").strip()
    continued_reasoning = str(message.get("reasoning_content") or "")
    v15._merge_diagnostic(
        v1_8_prefix_continuation=True,
        v1_8_prefix_max_tokens=PREFIX_CONTINUATION_MAX_TOKENS,
        v1_8_prefix_finish_reason=finish_reason,
        v1_8_prefix_reasoning_chars=len(continued_reasoning),
        v1_8_prefix_visible_chars=len(visible),
    )

    if finish_reason != "stop" or not visible:
        return _blocked_response(
            model,
            "V1.8 high-reasoning prefix continuation did not reach a complete visible verdict.",
        )
    return result


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
    global _last_final_messages

    if stage == "final" and thinking:
        _last_final_messages = copy.deepcopy(messages)
        return _original_send_request(
            stage=stage,
            round_number=round_number,
            messages=messages,
            thinking=thinking,
            tools=tools,
            max_tokens=max_tokens,
            model=model,
        )

    if stage == "final-fallback" and v16._last_final_finish_reason == "length":
        return _prefix_continue(model)

    return _original_send_request(
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
