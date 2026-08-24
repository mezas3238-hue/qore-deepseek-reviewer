#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import urllib.error
import urllib.request
from typing import Any

import deepseek_reviewer_v1_8_entrypoint as v18

v17 = v18.v17
v16 = v18.v16
v15 = v18.v15
v13 = v18.v13
budgeted = v18.budgeted
reviewer = v18.reviewer

# V1.9 keeps V1.8's exact evidence path and V4-Pro/high authoritative reasoning.
# The measured UNR-019 R1D run proved that one 8k prefix continuation can still
# terminate by length with no visible verdict. V1.9 permits one additional and
# final 6k continuation of the SAME retained CoT. There is no open retry loop:
# authoritative analysis is capped at 20k + 8k + 6k output tokens. If the second
# continuation still does not naturally stop with a visible verdict, validation
# remains fail-closed.
FIRST_PREFIX_MAX_TOKENS = v18.PREFIX_CONTINUATION_MAX_TOKENS
SECOND_PREFIX_MAX_TOKENS = 6000
PREFIX_HOP_BUDGETS = (FIRST_PREFIX_MAX_TOKENS, SECOND_PREFIX_MAX_TOKENS)


def _choice(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        return {}
    value = choices[0]
    return value if isinstance(value, dict) else {}


def _message(response: dict[str, Any]) -> dict[str, Any]:
    value = _choice(response).get("message") or {}
    return value if isinstance(value, dict) else {}


def _prefix_request(
    *,
    model: str,
    reasoning_prefix: str,
    visible_prefix: str,
    max_tokens: int,
    hop: int,
) -> tuple[dict[str, Any] | None, str | None]:
    messages = copy.deepcopy(v18._last_final_messages)
    messages.append(
        {
            "role": "assistant",
            "content": visible_prefix,
            "reasoning_content": reasoning_prefix,
            "prefix": True,
        }
    )
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "max_tokens": max_tokens,
        "thinking": {"type": "enabled"},
        "reasoning_effort": "high",
    }
    request = urllib.request.Request(
        v18.BETA_CHAT_URL,
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
            v1_9_bounded_multi_hop=True,
            v1_9_failed_hop=hop,
            v1_9_prefix_http_error=exc.code,
        )
        return None, f"V1.9 prefix continuation hop {hop} HTTP {exc.code}: {detail}"

    budgeted.record_usage("final-prefix", hop, result)
    return result, None


def _multi_hop_prefix_continue(model: str) -> dict[str, Any]:
    reasoning_prefix = v16._last_final_reasoning
    if not reasoning_prefix or not v18._last_final_messages:
        return v18._blocked_response(
            model,
            "V1.9 had no retained high-reasoning state to continue.",
        )

    visible_prefix = ""
    v15._merge_diagnostic(
        v1_9_bounded_multi_hop=True,
        v1_9_max_hops=len(PREFIX_HOP_BUDGETS),
        v1_9_hop_1_max_tokens=PREFIX_HOP_BUDGETS[0],
        v1_9_hop_2_max_tokens=PREFIX_HOP_BUDGETS[1],
        v1_9_total_reasoning_envelope=(
            v16.FINAL_ANALYSIS_MAX_TOKENS + sum(PREFIX_HOP_BUDGETS)
        ),
    )

    for hop, max_tokens in enumerate(PREFIX_HOP_BUDGETS, start=1):
        result, error = _prefix_request(
            model=model,
            reasoning_prefix=reasoning_prefix,
            visible_prefix=visible_prefix,
            max_tokens=max_tokens,
            hop=hop,
        )
        if result is None:
            return v18._blocked_response(model, error or "V1.9 prefix continuation failed.")

        choice = _choice(result)
        message = _message(result)
        finish_reason = str(choice.get("finish_reason") or "")
        visible_segment = str(message.get("content") or "")
        reasoning_segment = str(message.get("reasoning_content") or "")
        reasoning_prefix += reasoning_segment
        visible_prefix += visible_segment

        if hop == 1:
            v15._merge_diagnostic(
                v1_9_hop_1_finish_reason=finish_reason,
                v1_9_hop_1_reasoning_chars=len(reasoning_segment),
                v1_9_hop_1_visible_chars=len(visible_segment),
            )
        else:
            v15._merge_diagnostic(
                v1_9_hop_2_finish_reason=finish_reason,
                v1_9_hop_2_reasoning_chars=len(reasoning_segment),
                v1_9_hop_2_visible_chars=len(visible_segment),
            )

        if finish_reason == "stop":
            if not visible_prefix.strip():
                return v18._blocked_response(
                    model,
                    f"V1.9 prefix continuation hop {hop} stopped without a visible verdict.",
                )
            # Chat Prefix Completion returns only the continuation after the supplied
            # prefix. Reassemble any partial visible content from an earlier hop so
            # the downstream guard receives one complete self-contained review.
            message["content"] = visible_prefix
            v15._merge_diagnostic(
                v1_9_completed_hop=hop,
                v1_9_total_retained_reasoning_chars=len(reasoning_prefix),
                v1_9_total_visible_chars=len(visible_prefix),
            )
            return result

        if finish_reason != "length":
            return v18._blocked_response(
                model,
                f"V1.9 prefix continuation hop {hop} ended with unsupported finish_reason={finish_reason!r}.",
            )

    v15._merge_diagnostic(
        v1_9_exhausted_hops=True,
        v1_9_total_retained_reasoning_chars=len(reasoning_prefix),
        v1_9_total_visible_chars=len(visible_prefix),
    )
    return v18._blocked_response(
        model,
        "V1.9 exhausted its two bounded high-reasoning prefix continuations without a complete visible verdict.",
    )


# V1.8's send_request resolves this module-global function at call time. Replacing
# it preserves the exact planner, evidence, final-call and quality-guard behavior;
# only the length-truncated continuation policy changes.
v18._prefix_continue = _multi_hop_prefix_continue


def main() -> int:
    return v18.main()


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
