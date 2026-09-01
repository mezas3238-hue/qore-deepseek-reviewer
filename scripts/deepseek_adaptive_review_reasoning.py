#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from typing import Any

VALID_MODES = {"expert", "coder"}
VALID_EFFORTS = {"high", "max"}

_CRITICAL_GROUPS = (
    (
        "security-boundary",
        re.compile(
            r"\b(?:credential|secret|password|token|authorization|userinfo|"
            r"bypass|fail[- ]closed|saniti[sz]|injection|security)\b",
            re.I,
        ),
    ),
    (
        "unicode-normalization",
        re.compile(
            r"\b(?:unicode|nfkc|nfkd|nfc|nfd|casefold|confusable|homoglyph|"
            r"normalization|bidi|zero[- ]width)\b",
            re.I,
        ),
    ),
    (
        "state-integrity",
        re.compile(
            r"\b(?:retained[- ]state|revalidation|recursive|re-entry|reentry|"
            r"immutab|aliasing|determinism|canonicali[sz])\b",
            re.I,
        ),
    ),
    (
        "authority-governance",
        re.compile(
            r"\b(?:authority boundary|production authority|risk bypass|provider neutrality|"
            r"contract ambiguity|trust boundary|privilege|authorization boundary)\b",
            re.I,
        ),
    ),
)

_EXPERT_GROUPS = (
    (
        "adversarial-falsification",
        re.compile(
            r"\b(?:adversarial|falsif|counterexample|constructible witness|"
            r"root[- ]cause|equivalence closure|false positive|material finding)\b",
            re.I,
        ),
    ),
    (
        "semantic-certification",
        re.compile(
            r"\b(?:certif|semantic proof|validation ok|hallazgos|clean verdict|"
            r"invariant|evidence insufficient|validation blocked)\b",
            re.I,
        ),
    ),
)

_CODER_GROUPS = (
    (
        "implementation-edge-cases",
        re.compile(
            r"\b(?:edge case|error path|exception|parser|validator|serialization|"
            r"deserialization|overflow|underflow|race|concurren|atomic|cas|"
            r"exact runtime type|type integrity)\b",
            re.I,
        ),
    ),
    (
        "implementation-regression",
        re.compile(
            r"\b(?:regression|test gap|coverage gap|call site|caller|dependency|"
            r"backward compat|api contract|projection|logical_values)\b",
            re.I,
        ),
    ),
)

_PRODUCTION_PATH = re.compile(r"(?:^|[\s\"'`])src/qore/", re.I)
_CONTRADICTION = re.compile(
    r"\b(?:contradiction|unexpectedly accepted|unexpectedly rejected|test failure|"
    r"assertionerror|traceback|material defect|bypass reproduced|mismatch)\b",
    re.I,
)


def _messages_text(messages: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for message in messages:
        if not isinstance(message, dict):
            continue
        role = message.get("role")
        # Never route effort from private model reasoning_content.
        if role not in {"system", "user", "tool", "assistant"}:
            continue
        content = message.get("content")
        if isinstance(content, str):
            parts.append(content)
        tool_calls = message.get("tool_calls")
        if isinstance(tool_calls, list):
            try:
                parts.append(json.dumps(tool_calls, ensure_ascii=False, sort_keys=True))
            except (TypeError, ValueError):
                pass
    return "\n".join(parts)


def select_reasoning_effort(
    *,
    mode: str,
    stage: str,
    messages: list[dict[str, Any]],
    thinking: bool,
) -> tuple[str | None, list[str]]:
    """Return provider reasoning effort and auditable trigger reasons.

    Non-thinking calls intentionally return ``None`` because reasoning effort has no
    semantic meaning there. Thinking calls use HIGH as the default and escalate to
    MAX only when the exact review evidence crosses a mode-specific materiality gate.
    """

    normalized_mode = mode.strip().lower()
    if normalized_mode not in VALID_MODES:
        raise RuntimeError(f"unsupported REVIEW_MODE for adaptive reasoning: {mode!r}")
    if not thinking:
        return None, ["thinking-disabled"]

    text = _messages_text(messages)
    reasons: list[str] = []
    critical_hits = 0
    for name, pattern in _CRITICAL_GROUPS:
        if pattern.search(text):
            critical_hits += 1
            reasons.append(name)

    if _CONTRADICTION.search(text):
        reasons.append("contradictory-or-failing-evidence")

    if normalized_mode == "expert":
        expert_hits = 0
        for name, pattern in _EXPERT_GROUPS:
            if pattern.search(text):
                expert_hits += 1
                reasons.append(name)

        # Expert is a red-team certifier. One critical semantic/security surface plus
        # an adversarial/certification signal is enough for MAX. Two independent
        # critical groups also justify MAX even if the prompt wording is terse.
        escalate = (
            "contradictory-or-failing-evidence" in reasons
            or critical_hits >= 2
            or (critical_hits >= 1 and expert_hits >= 1)
        )
    else:
        coder_hits = 0
        for name, pattern in _CODER_GROUPS:
            if pattern.search(text):
                coder_hits += 1
                reasons.append(name)
        production_changed = _PRODUCTION_PATH.search(text) is not None
        if production_changed:
            reasons.append("production-source-surface")

        # Coder focuses on implementation correctness. MAX requires actual production
        # code plus a high-risk/edge-case surface, or concrete contradictory evidence.
        escalate = (
            "contradictory-or-failing-evidence" in reasons
            or (production_changed and critical_hits >= 1)
            or (production_changed and coder_hits >= 2)
        )

    effort = "max" if escalate else "high"
    reasons.append(f"selected-{effort}")
    reasons.append(f"stage:{stage}")
    return effort, reasons


def _self_test() -> None:
    cases = [
        (
            "expert",
            "final-analysis",
            "Audit a Unicode NFKC credential bypass adversarially and prove root-cause closure.",
            "max",
        ),
        (
            "expert",
            "final-analysis",
            "Review a small documentation-only naming correction and certify consistency.",
            "high",
        ),
        (
            "coder",
            "final-analysis",
            "Changed src/qore/x.py validator; inspect Unicode normalization edge cases.",
            "max",
        ),
        (
            "coder",
            "final-analysis",
            "Changed docs/architecture/note.md wording only.",
            "high",
        ),
        (
            "coder",
            "final-analysis",
            "Traceback: assertionerror; unexpectedly accepted invalid retained state.",
            "max",
        ),
    ]
    for mode, stage, text, expected in cases:
        actual, _ = select_reasoning_effort(
            mode=mode,
            stage=stage,
            messages=[{"role": "user", "content": text}],
            thinking=True,
        )
        if actual != expected:
            raise RuntimeError(
                f"adaptive reasoning self-test failed: mode={mode} expected={expected} actual={actual}"
            )

    none_effort, _ = select_reasoning_effort(
        mode="expert",
        stage="explore",
        messages=[{"role": "user", "content": "Unicode security"}],
        thinking=False,
    )
    if none_effort is not None:
        raise RuntimeError("non-thinking adaptive reasoning call must return no effort")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        _self_test()
        print("QORE adaptive Expert/Coder reasoning policy: PASS")
        return 0
    parser.error("use --self-test")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
