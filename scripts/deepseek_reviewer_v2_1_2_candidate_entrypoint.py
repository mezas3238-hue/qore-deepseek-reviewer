#!/usr/bin/env python3
from __future__ import annotations

from typing import Any

import deepseek_reviewer_v2_1_1_entrypoint as stable
import deepseek_reviewer_v2_1_entrypoint as v21

# Benchmark-only candidate. It preserves the V2.1.1 model/evidence/fail-closed path
# while bounding the authoritative high-reasoning pass to reduce repeated length
# exhaustion and the large follow-on extractor prompt.
CANDIDATE_ANALYSIS_MAX_TOKENS = 14000
v21.ANALYSIS_MAX_TOKENS = CANDIDATE_ANALYSIS_MAX_TOKENS
v21.v13.FINAL_MAX_TOKENS = CANDIDATE_ANALYSIS_MAX_TOKENS

_stable_analysis_messages = v21._analysis_messages


def _candidate_analysis_messages(
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    prepared = _stable_analysis_messages(messages)
    if prepared and isinstance(prepared[0], dict):
        prepared[0]["content"] = str(prepared[0].get("content") or "") + (
            "\n\nV2.1.2 BENCHMARK COMPACT DISCIPLINE:\n"
            "Cover every requested material focus, but do not narrate line-by-line review. "
            "Maintain a compact internal checklist: contract, constructible witness, tests, "
            "determinism, authority boundary, and final materiality. Reuse supplied facts "
            "instead of re-deriving them repeatedly. Reject hypotheses not present in the "
            "exact evidence. Once every focus has an explicit resolved status, stop reasoning "
            "and support a concise final verdict. The smaller reasoning envelope does not "
            "authorize skipped focus areas, weaker evidence, or inferred PASS."
        )
    return prepared


v21._analysis_messages = _candidate_analysis_messages


def main() -> int:
    return stable.main()


if __name__ == "__main__":
    raise SystemExit(main())
