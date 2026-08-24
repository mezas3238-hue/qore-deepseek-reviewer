#!/usr/bin/env python3
from __future__ import annotations

from typing import Any

import deepseek_reviewer_v1_5_entrypoint as v15

v13 = v15.v13

# V1.6 keeps the V1.5 evidence planner, exact frozen evidence, deepseek-v4-pro,
# thinking enabled and reasoning_effort=high. It changes only the completion path
# measured on UNR-019 R1B: Pro/high consumed the full 40k output envelope as hidden
# reasoning and then V1.3 resent the entire evidence bundle in a non-thinking fallback.
#
# The authoritative analysis remains Pro/high. If that analysis exhausts its bounded
# envelope without visible content, the fallback is only a presentation/synthesis pass
# over the same model's retained analysis plus the exact target prompt; it is not a
# second independent review and does not resend the complete evidence bundle.
FINAL_ANALYSIS_MAX_TOKENS = 20000
FINAL_SYNTHESIS_MAX_TOKENS = 6000
v13.FINAL_MAX_TOKENS = FINAL_ANALYSIS_MAX_TOKENS

_original_send_request = v13.budgeted.send_request
_last_final_reasoning = ""
_last_final_finish_reason = ""


def _choice(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        return {}
    choice = choices[0]
    return choice if isinstance(choice, dict) else {}


def _message(response: dict[str, Any]) -> dict[str, Any]:
    choice = _choice(response)
    message = choice.get("message") or {}
    return message if isinstance(message, dict) else {}


def _synthesis_messages() -> list[dict[str, Any]]:
    target = v13.reviewer.PROMPT_PATH.read_text(encoding="utf-8")
    return [
        {
            "role": "system",
            "content": (
                "You are the FINAL PRESENTATION pass for an independent QORE Core review. "
                "The same DeepSeek V4-Pro/high reviewer already inspected the complete exact "
                "evidence and produced the analysis below. Do not perform a new review, do not "
                "invent findings, and do not broaden authority. Convert only that retained "
                "analysis into a concise self-contained verdict matching TARGET REVIEW. If the "
                "analysis is uncertain, incomplete, contradictory, or lacks a reproducible "
                "accepted-state witness for a proposed defect, return EVIDENCIA INSUFICIENTE / "
                "VALIDACIÓN BLOQUEADA rather than repairing the reasoning by assumption. Preserve "
                "material findings exactly enough for independent adjudication. If the retained "
                "analysis establishes no material finding, conclude exactly with HALLAZGOS: "
                "NINGUNO and VALIDACIÓN OK."
            ),
        },
        {
            "role": "user",
            "content": (
                "TARGET REVIEW:\n"
                + target
                + "\n\nRETAINED V4-PRO/HIGH ANALYSIS FROM THE EXACT EVIDENCE PASS:\n"
                + _last_final_reasoning
            ),
        },
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
    global _last_final_finish_reason, _last_final_reasoning

    if stage == "final-fallback" and _last_final_reasoning:
        v15._merge_diagnostic(
            v1_6_reasoned_synthesis=True,
            v1_6_analysis_max_tokens=FINAL_ANALYSIS_MAX_TOKENS,
            v1_6_synthesis_max_tokens=FINAL_SYNTHESIS_MAX_TOKENS,
            v1_6_analysis_finish_reason=_last_final_finish_reason,
            v1_6_retained_reasoning_chars=len(_last_final_reasoning),
        )
        return _original_send_request(
            stage=stage,
            round_number=round_number,
            messages=_synthesis_messages(),
            thinking=False,
            tools=False,
            max_tokens=FINAL_SYNTHESIS_MAX_TOKENS,
            model=model,
        )

    effective_max_tokens = (
        FINAL_ANALYSIS_MAX_TOKENS if stage == "final" and thinking else max_tokens
    )
    response = _original_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=effective_max_tokens,
        model=model,
    )

    if stage == "final" and thinking:
        choice = _choice(response)
        message = _message(response)
        _last_final_reasoning = str(message.get("reasoning_content") or "")
        _last_final_finish_reason = str(choice.get("finish_reason") or "")
        v15._merge_diagnostic(
            v1_6_reasoned_synthesis=True,
            v1_6_analysis_max_tokens=FINAL_ANALYSIS_MAX_TOKENS,
            v1_6_synthesis_max_tokens=FINAL_SYNTHESIS_MAX_TOKENS,
            v1_6_analysis_finish_reason=_last_final_finish_reason,
            v1_6_retained_reasoning_chars=len(_last_final_reasoning),
        )
    return response


v13.budgeted.send_request = send_request


def main() -> int:
    return v15.main()


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
