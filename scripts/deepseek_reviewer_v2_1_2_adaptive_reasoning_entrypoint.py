#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import pathlib
from typing import Any

import deepseek_adaptive_review_reasoning as reasoning_policy
import deepseek_reviewer_v2_1_1_entrypoint as stable
import deepseek_transport

# Preserve every V2.1.1 evidence, freeze, budget and fail-closed contract. This layer
# changes provider reasoning effort on the authoritative thinking request and adds one
# explicit, audited transport-only retry for incomplete/broken response bodies.
v21 = stable.v21
v20 = stable.v20
budgeted = v20.v13.budgeted
reviewer = budgeted.reviewer

REASONING_AUDIT = pathlib.Path(
    os.environ.get(
        "DEEPSEEK_REASONING_AUDIT",
        str(
            pathlib.Path(os.environ.get("GITHUB_WORKSPACE", "."))
            / "deepseek-reasoning-effort.jsonl"
        ),
    )
).resolve()


def _append_reasoning_audit(
    *,
    stage: str,
    round_number: int,
    thinking: bool,
    model: str,
    effort: str | None,
    reasons: list[str],
) -> None:
    REASONING_AUDIT.parent.mkdir(parents=True, exist_ok=True)
    row = {
        "schema": "qore-deepseek-review-reasoning-v1",
        "package_id": reviewer.PACKAGE_ID,
        "review_mode": reviewer.MODE,
        "stage": stage,
        "round": round_number,
        "thinking": thinking,
        "model": model,
        "reasoning_effort": effort,
        "reasons": reasons,
    }
    with REASONING_AUDIT.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, sort_keys=True) + "\n")


def _adaptive_base_send_request(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    effort, reasons = reasoning_policy.select_reasoning_effort(
        mode=reviewer.MODE,
        stage=stage,
        messages=messages,
        thinking=thinking,
    )

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
        "max_tokens": max_tokens,
        "thinking": {"type": "enabled" if thinking else "disabled"},
    }
    if effort is not None:
        payload["reasoning_effort"] = effort
    if tools:
        payload["tools"] = budgeted.TOOLS
        payload["tool_choice"] = "auto"

    result, transport_retries = deepseek_transport.post_json_with_bounded_transport_retry(
        api_url=reviewer.API_URL,
        api_key=reviewer.API_KEY,
        payload=payload,
        timeout=300,
    )
    if transport_retries:
        reasons = [*reasons, f"transport-retry-recovered:{transport_retries}"]

    budgeted.record_usage(stage, round_number, result)
    _append_reasoning_audit(
        stage=stage,
        round_number=round_number,
        thinking=thinking,
        model=model,
        effort=effort,
        reasons=reasons,
    )
    print(
        "QORE adaptive review reasoning "
        f"mode={reviewer.MODE} stage={stage} effort={effort or 'none'} "
        f"reasons={','.join(reasons)}"
    )
    return result


# V2.1's authoritative final analysis and bounded extractor resolve this module-global
# sender at runtime. Replacing it here preserves all upstream token/freeze contracts.
v21._base_send_request = _adaptive_base_send_request


def main() -> int:
    return stable.main()


if __name__ == "__main__":
    raise SystemExit(main())
