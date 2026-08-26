#!/usr/bin/env python3
from __future__ import annotations

import copy
import os
from typing import Any

import deepseek_reviewer_v2_0_entrypoint as v20

v17 = v20.v17
v15 = v20.v15
v13 = v20.v13
budgeted = v20.budgeted

# V2.1 keeps the complete V1.7 evidence path and the same deepseek-v4-pro model.
# The reviewer now enforces one adaptive completion budget across *all* model calls
# in a review package. Prompt/input tokens are metered separately and do not consume
# this output budget. Completion usage includes hidden reasoning plus visible output.
#
# Policy:
# - 100k completion tokens is a hard ceiling, never a consumption target.
# - exploration/planning may use only the budget that remains after preserving a
#   mandatory verdict reserve;
# - the authoritative high-reasoning pass may use all remaining pre-reserve budget;
# - if that pass does not emit a complete visible verdict, the same-model non-thinking
#   extractor may use the preserved reserve to publish findings/verdict;
# - no legacy continuation or second full-evidence review is allowed.
#
# DeepSeek V4-Pro currently supports an output ceiling above this package budget, so
# the harness -- not the provider maximum -- is the controlling limit.
TOTAL_COMPLETION_BUDGET = int(
    os.environ.get("DEEPSEEK_TOTAL_COMPLETION_TOKEN_BUDGET", "100000")
)
VERDICT_RESERVE_TOKENS = int(
    os.environ.get("DEEPSEEK_VERDICT_RESERVE_TOKENS", "12000")
)
ANALYSIS_MAX_TOKENS = max(0, TOTAL_COMPLETION_BUDGET - VERDICT_RESERVE_TOKENS)
EXTRACT_MAX_TOKENS = VERDICT_RESERVE_TOKENS
v13.FINAL_MAX_TOKENS = ANALYSIS_MAX_TOKENS

if TOTAL_COMPLETION_BUDGET <= 0:
    raise RuntimeError("DEEPSEEK_TOTAL_COMPLETION_TOKEN_BUDGET must be positive")
if VERDICT_RESERVE_TOKENS <= 0:
    raise RuntimeError("DEEPSEEK_VERDICT_RESERVE_TOKENS must be positive")
if VERDICT_RESERVE_TOKENS >= TOTAL_COMPLETION_BUDGET:
    raise RuntimeError(
        "DEEPSEEK_VERDICT_RESERVE_TOKENS must be smaller than total completion budget"
    )

_base_send_request = v20._base_send_request
_v17_send_request = v17.budgeted.send_request


def _choice(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        return {}
    value = choices[0]
    return value if isinstance(value, dict) else {}


def _message(response: dict[str, Any]) -> dict[str, Any]:
    value = _choice(response).get("message") or {}
    return value if isinstance(value, dict) else {}


def _completion_used() -> int:
    value = budgeted.TOTALS.get("completion_tokens", 0)
    return int(value) if isinstance(value, (int, float)) else 0


def _completion_remaining() -> int:
    return max(0, TOTAL_COMPLETION_BUDGET - _completion_used())


def _pre_verdict_allowance(requested: int) -> int:
    return max(
        0,
        min(
            requested,
            _completion_remaining() - VERDICT_RESERVE_TOKENS,
        ),
    )


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


def _analysis_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    prepared = copy.deepcopy(messages)
    if prepared and isinstance(prepared[0], dict):
        prepared[0]["content"] = str(prepared[0].get("content") or "") + (
            "\n\nV2.1 AUTHORITATIVE ANALYSIS CONTRACT:\n"
            "This is the sole high-reasoning engineering analysis. Inspect the complete "
            "supplied evidence and adversarially resolve every requested review focus. "
            "Use hidden reasoning efficiently as an audit record: for each material focus, "
            "establish whether a constructible accepted-state witness exists, whether the "
            "invariant holds, and whether evidence is sufficient. Do not expand into "
            "speculative architecture outside the frozen lane. If evidence is missing, "
            "state that explicitly in the analysis rather than inferring. A later same-model "
            "non-thinking step may only FORMAT conclusions actually supported here; it may "
            "not add findings or manufacture PASS. The package has a hard adaptive total "
            "completion budget; finish naturally as soon as coverage is sufficient rather "
            "than trying to consume the available ceiling."
        )
    return prepared


def _extract_messages(
    *,
    reasoning: str,
    visible: str,
    finish_reason: str,
) -> list[dict[str, Any]]:
    target = v13.reviewer.PROMPT_PATH.read_text(encoding="utf-8")[:12000]

    system = (
        "You are the verdict extractor for a completed DeepSeek V4-Pro/high QORE review "
        "analysis. Thinking is disabled intentionally: you are NOT a second reviewer. "
        "You may only expose conclusions supported by the supplied retained analysis. "
        "Do not invent evidence, witnesses, locations, invariants, or a clean conclusion. "
        "A material finding may be published only when the retained analysis establishes "
        "a concrete constructible accepted-state witness, expected/actual behavior, impact, "
        "and bounded correction. A clean verdict may be published only when the retained "
        "analysis explicitly supports sufficient coverage of the requested focus areas and "
        "contains no unresolved material defect or missing evidence. If the analysis is "
        "truncated before that support is established, ambiguous, internally conflicting, "
        "or incomplete, return EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA. "
        "Never convert mere absence of a finding into PASS. Keep output concise. If clean, "
        "end exactly with HALLAZGOS: NINGUNO and VALIDACIÓN OK."
    )
    user = (
        f"PACKAGE: {v13.reviewer.PACKAGE_ID}\n"
        f"BASE: {v13.reviewer.EXPECTED_BASE}\n"
        f"HEAD: {v13.reviewer.EXPECTED_HEAD}\n"
        f"SYNTHETIC: {v13.reviewer.EXPECTED_SYNTHETIC}\n"
        f"HIGH_ANALYSIS_FINISH_REASON: {finish_reason}\n\n"
        "TARGET REVIEW PROMPT (bounded, no evidence bundle):\n"
        + target
        + "\n\nHIGH-REASONING VISIBLE CONTENT (may be empty/partial):\n"
        + (visible or "[none]")
        + "\n\nRETAINED HIGH-REASONING ANALYSIS:\n"
        + reasoning
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


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
    if stage == "final" and thinking:
        analysis_tokens = _pre_verdict_allowance(ANALYSIS_MAX_TOKENS)
        v15._merge_diagnostic(
            v2_1_total_completion_budget=TOTAL_COMPLETION_BUDGET,
            v2_1_verdict_reserve_tokens=VERDICT_RESERVE_TOKENS,
            v2_1_completion_used_before_analysis=_completion_used(),
            v2_1_analysis_available_tokens=analysis_tokens,
        )
        if analysis_tokens <= 0:
            return _blocked_response(
                model,
                "The package exhausted its pre-verdict completion allowance before the "
                "authoritative analysis could run; the reserved verdict budget cannot be "
                "repurposed into a fabricated review.",
            )

        analysis = _base_send_request(
            stage="final-analysis",
            round_number=round_number,
            messages=_analysis_messages(messages),
            thinking=True,
            tools=False,
            max_tokens=analysis_tokens,
            model=model,
        )
        analysis_choice = _choice(analysis)
        analysis_message = _message(analysis)
        finish_reason = str(analysis_choice.get("finish_reason") or "")
        reasoning = str(analysis_message.get("reasoning_content") or "")
        visible = str(analysis_message.get("content") or "").strip()

        v15._merge_diagnostic(
            v2_1_split_analysis=True,
            v2_1_analysis_max_tokens=analysis_tokens,
            v2_1_analysis_finish_reason=finish_reason,
            v2_1_analysis_reasoning_chars=len(reasoning),
            v2_1_analysis_visible_chars=len(visible),
            v2_1_extract_max_tokens=min(EXTRACT_MAX_TOKENS, _completion_remaining()),
            v2_1_completion_used_after_analysis=_completion_used(),
            v2_1_completion_remaining_after_analysis=_completion_remaining(),
            v2_1_same_model_extractor=True,
            v2_1_flash_substitution=False,
            v2_1_cot_continuation=False,
        )

        if finish_reason == "stop" and visible:
            return analysis

        if not reasoning and not visible:
            return _blocked_response(
                model,
                "V2.1 high-reasoning analysis returned no retained analysis to adjudicate.",
            )

        extract_tokens = min(EXTRACT_MAX_TOKENS, _completion_remaining())
        if extract_tokens <= 0:
            return _blocked_response(
                model,
                "The authoritative analysis consumed the package completion ceiling before "
                "a complete verdict could be emitted.",
            )
        extracted = _base_send_request(
            stage="verdict-extract",
            round_number=1,
            messages=_extract_messages(
                reasoning=reasoning,
                visible=visible,
                finish_reason=finish_reason,
            ),
            thinking=False,
            tools=False,
            max_tokens=extract_tokens,
            model=model,
        )
        extract_choice = _choice(extracted)
        extract_message = _message(extracted)
        extract_finish = str(extract_choice.get("finish_reason") or "")
        extract_visible = str(extract_message.get("content") or "").strip()
        v15._merge_diagnostic(
            v2_1_extract_finish_reason=extract_finish,
            v2_1_extract_visible_chars=len(extract_visible),
            v2_1_completion_used_final=_completion_used(),
            v2_1_completion_remaining_final=_completion_remaining(),
        )
        if _completion_used() > TOTAL_COMPLETION_BUDGET:
            return _blocked_response(
                model,
                "Provider-reported completion usage exceeded the hard package ceiling; "
                "validation is blocked rather than treating an over-budget result as PASS.",
            )
        if extract_finish != "stop" or not extract_visible:
            return _blocked_response(
                model,
                "V2.1 same-model verdict extraction did not produce a complete bounded verdict.",
            )
        return extracted

    if stage == "final-fallback":
        return _blocked_response(
            model,
            "V2.1 does not permit a legacy full-evidence fallback after verdict extraction.",
        )

    allowed_tokens = _pre_verdict_allowance(max_tokens)
    if allowed_tokens <= 0:
        return _blocked_response(
            model,
            "Pre-verdict completion allowance is exhausted; preserving the mandatory "
            "verdict reserve for the authoritative final stage.",
        )
    return _v17_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=allowed_tokens,
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
