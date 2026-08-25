#!/usr/bin/env python3
from __future__ import annotations

import copy
import re
from typing import Any

import deepseek_reviewer_v2_1_1_entrypoint as stable
import deepseek_reviewer_v2_1_entrypoint as v21

# Benchmark-only partitioned candidate. Ordinary review routing remains V2.1.1.
# The complete changed-file package is split deterministically by file role so each
# high-reasoning call receives a smaller coherent surface. A final same-model,
# non-thinking integrator may only expose conclusions already supported by both
# retained high-reasoning surface analyses.
SURFACE_MAX_TOKENS = 7000
SYNTHESIS_MAX_TOKENS = 2400
v21.v13.FINAL_MAX_TOKENS = SURFACE_MAX_TOKENS * 2

_stable_send_request = v21.send_request
_base_send_request = v21._base_send_request


def _choice(response: dict[str, Any]) -> dict[str, Any]:
    choices = response.get("choices") or []
    if not choices:
        return {}
    value = choices[0]
    return value if isinstance(value, dict) else {}


def _message(response: dict[str, Any]) -> dict[str, Any]:
    value = _choice(response).get("message") or {}
    return value if isinstance(value, dict) else {}


def _blocked(model: str, reason: str) -> dict[str, Any]:
    return v21._blocked_response(model, reason)


def _changed_blocks(section: str) -> list[str]:
    stripped = section.lstrip("\n")
    if not stripped:
        return []
    return [
        block
        for block in re.split(r"(?=^## CHANGED FILE \d+\n)", stripped, flags=re.M)
        if block.startswith("## CHANGED FILE ")
    ]


def _path_from_block(block: str) -> str:
    match = re.search(r"^PATH: (.+)$", block, flags=re.M)
    return match.group(1).strip() if match else ""


def _partition_user_content(text: str) -> tuple[str, str]:
    mandatory_marker = "# MANDATORY COMPLETE CHANGED-FILE EVIDENCE"
    mandatory_at = text.find(mandatory_marker)
    if mandatory_at < 0:
        raise ValueError("mandatory changed-file evidence marker missing")

    first_changed = text.find("\n## CHANGED FILE ", mandatory_at)
    if first_changed < 0:
        raise ValueError("changed-file blocks missing")

    tail_candidates = [
        position
        for marker in (
            "\n# MANDATORY LOCAL DEPENDENCY SEMANTIC SLICES",
            "\n# DETERMINISTIC BINDING / CI EVIDENCE",
        )
        if (position := text.find(marker, first_changed)) >= 0
    ]
    if not tail_candidates:
        raise ValueError("shared evidence boundary missing")
    tail_at = min(tail_candidates)

    common_prefix = text[:first_changed]
    blocks = _changed_blocks(text[first_changed:tail_at])
    if not blocks:
        raise ValueError("no changed-file blocks parsed")

    implementation: list[str] = []
    verification: list[str] = []
    for block in blocks:
        path = _path_from_block(block)
        if not path:
            raise ValueError("changed-file block lacks PATH")
        if path.startswith("src/"):
            implementation.append(block)
        else:
            verification.append(block)

    if not implementation or not verification:
        raise ValueError("partition requires both implementation and verification files")

    tail = text[tail_at:]
    dependency_marker = "# MANDATORY LOCAL DEPENDENCY SEMANTIC SLICES"
    binding_marker = "# DETERMINISTIC BINDING / CI EVIDENCE"
    dependency_at = tail.find(dependency_marker)
    binding_at = tail.find(binding_marker)
    if binding_at < 0:
        raise ValueError("binding evidence marker missing")

    if 0 <= dependency_at < binding_at:
        dependencies = tail[dependency_at:binding_at]
        shared = tail[binding_at:]
    else:
        dependencies = ""
        shared = tail[binding_at:]

    implementation_user = (
        common_prefix
        + "\n"
        + "\n".join(implementation)
        + "\n"
        + dependencies
        + shared
    )
    verification_user = (
        common_prefix
        + "\n"
        + "\n".join(verification)
        + "\n"
        + shared
    )
    return implementation_user, verification_user


def _surface_messages(
    messages: list[dict[str, Any]],
    *,
    surface: str,
    user_content: str,
) -> list[dict[str, Any]]:
    prepared = copy.deepcopy(messages)
    if len(prepared) < 2:
        raise ValueError("final review messages missing system/user pair")

    if surface == "implementation":
        instruction = (
            "\n\nPARTITIONED HIGH REVIEW — IMPLEMENTATION SURFACE:\n"
            "You receive the complete changed production source files, exact local dependency "
            "slices, and shared binding/check material assigned to this surface. Resolve: "
            "contract invariants, Decimal canonicalization, exact nested types, trigger shape, "
            "determinism, duplicate rules, and authority boundaries. Do not spend reasoning on "
            "test-file style or documentation prose that is assigned to the other surface. "
            "By roughly 5,500 reasoning tokens, write an explicit retained checklist headed "
            "SURFACE_STATUS IMPLEMENTATION with each assigned focus marked OK, DEFECT, or "
            "MISSING plus one-line support. Produce that status before any optional extra "
            "reasoning. A DEFECT requires a constructible witness. MISSING must stay fail-closed."
        )
    else:
        instruction = (
            "\n\nPARTITIONED HIGH REVIEW — VERIFICATION SURFACE:\n"
            "You receive the complete changed tests/documentation and shared binding/check "
            "material assigned to this surface. Resolve: regression coverage for extreme "
            "positive/negative Decimal exponents, adversarial exact-type/corruption cases, "
            "SINGLE/HYBRID coverage, deterministic ordering checks, documentation/code-scope "
            "consistency, and absence of operational authority claims. Do not re-review source "
            "implementation line-by-line; that is assigned to the implementation surface. "
            "By roughly 5,500 reasoning tokens, write an explicit retained checklist headed "
            "SURFACE_STATUS VERIFICATION with each assigned focus marked OK, DEFECT, or "
            "MISSING plus one-line support. Produce that status before any optional extra "
            "reasoning. A DEFECT requires a concrete test/doc contradiction. MISSING must "
            "stay fail-closed."
        )

    prepared[0]["content"] = str(prepared[0].get("content") or "") + instruction
    prepared[-1]["content"] = user_content
    return prepared


def _surface_result(
    *,
    label: str,
    response: dict[str, Any],
) -> tuple[str, str, str]:
    choice = _choice(response)
    message = _message(response)
    finish = str(choice.get("finish_reason") or "")
    reasoning = str(message.get("reasoning_content") or "")
    visible = str(message.get("content") or "").strip()
    v21.v15._merge_diagnostic(
        **{
            f"v2_1_2_{label}_finish_reason": finish,
            f"v2_1_2_{label}_reasoning_chars": len(reasoning),
            f"v2_1_2_{label}_visible_chars": len(visible),
        }
    )
    return finish, reasoning, visible


def _synthesis_messages(
    *,
    original_messages: list[dict[str, Any]],
    implementation: tuple[str, str, str],
    verification: tuple[str, str, str],
) -> list[dict[str, Any]]:
    target = str(original_messages[-1].get("content") or "")
    mandatory_at = target.find("# MANDATORY COMPLETE CHANGED-FILE EVIDENCE")
    if mandatory_at >= 0:
        target = target[:mandatory_at]
    target = target[:14000]

    system = (
        "You are the same-model verdict integrator for two completed DeepSeek V4-Pro/high "
        "QORE review surfaces. Thinking is disabled intentionally. You are NOT a third "
        "reviewer and may not invent facts. The implementation surface is authoritative only "
        "for its assigned source/dependency material; the verification surface is authoritative "
        "only for its assigned tests/documentation. A clean result is allowed only when BOTH "
        "retained analyses contain their required SURFACE_STATUS checklist and every assigned "
        "focus is resolved OK with no material contradiction, DEFECT, or MISSING. A surface "
        "ending by length is not automatically invalid if its required SURFACE_STATUS was "
        "already completed; otherwise fail closed. Findings require exact location, concrete "
        "witness, expected/actual behavior, material impact, and bounded correction. Do not "
        "treat absence of a finding as proof. If clean, end exactly with HALLAZGOS: NINGUNO "
        "and VALIDACIÓN OK."
    )

    impl_finish, impl_reasoning, impl_visible = implementation
    ver_finish, ver_reasoning, ver_visible = verification
    user = (
        f"PACKAGE: {v21.v13.reviewer.PACKAGE_ID}\n"
        f"BASE: {v21.v13.reviewer.EXPECTED_BASE}\n"
        f"HEAD: {v21.v13.reviewer.EXPECTED_HEAD}\n"
        f"SYNTHETIC: {v21.v13.reviewer.EXPECTED_SYNTHETIC}\n\n"
        "TARGET REVIEW / SHARED INSTRUCTIONS:\n"
        + target
        + "\n\nIMPLEMENTATION SURFACE\n"
        + f"FINISH_REASON: {impl_finish}\nVISIBLE:\n{impl_visible or '[none]'}\n"
        + "RETAINED ANALYSIS:\n"
        + (impl_reasoning or "[none]")
        + "\n\nVERIFICATION SURFACE\n"
        + f"FINISH_REASON: {ver_finish}\nVISIBLE:\n{ver_visible or '[none]'}\n"
        + "RETAINED ANALYSIS:\n"
        + (ver_reasoning or "[none]")
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


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
        try:
            implementation_user, verification_user = _partition_user_content(
                str(messages[-1].get("content") or "")
            )
        except Exception as exc:  # noqa: BLE001
            return _blocked(model, f"Partitioned review preparation failed: {type(exc).__name__}: {exc}")

        implementation_response = _base_send_request(
            stage="final-surface-implementation",
            round_number=1,
            messages=_surface_messages(
                messages,
                surface="implementation",
                user_content=implementation_user,
            ),
            thinking=True,
            tools=False,
            max_tokens=SURFACE_MAX_TOKENS,
            model=model,
        )
        verification_response = _base_send_request(
            stage="final-surface-verification",
            round_number=1,
            messages=_surface_messages(
                messages,
                surface="verification",
                user_content=verification_user,
            ),
            thinking=True,
            tools=False,
            max_tokens=SURFACE_MAX_TOKENS,
            model=model,
        )

        implementation_result = _surface_result(
            label="implementation", response=implementation_response
        )
        verification_result = _surface_result(
            label="verification", response=verification_response
        )
        if not any(implementation_result[1:]) or not any(verification_result[1:]):
            return _blocked(model, "One partitioned high-reasoning surface returned no retained analysis.")

        synthesis = _base_send_request(
            stage="verdict-synthesis",
            round_number=1,
            messages=_synthesis_messages(
                original_messages=messages,
                implementation=implementation_result,
                verification=verification_result,
            ),
            thinking=False,
            tools=False,
            max_tokens=SYNTHESIS_MAX_TOKENS,
            model=model,
        )
        synth_choice = _choice(synthesis)
        synth_message = _message(synthesis)
        synth_finish = str(synth_choice.get("finish_reason") or "")
        synth_visible = str(synth_message.get("content") or "").strip()
        v21.v15._merge_diagnostic(
            v2_1_2_partitioned=True,
            v2_1_2_surface_max_tokens=SURFACE_MAX_TOKENS,
            v2_1_2_synthesis_max_tokens=SYNTHESIS_MAX_TOKENS,
            v2_1_2_synthesis_finish_reason=synth_finish,
            v2_1_2_synthesis_visible_chars=len(synth_visible),
        )
        if synth_finish != "stop" or not synth_visible:
            return _blocked(model, "Partitioned same-model synthesis did not produce a complete verdict.")
        return synthesis

    if stage == "final-fallback":
        return _blocked(model, "Partitioned candidate does not permit a second full-package fallback.")

    return _stable_send_request(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )


v21.budgeted.send_request = send_request


def main() -> int:
    return stable.main()


if __name__ == "__main__":
    raise SystemExit(main())
