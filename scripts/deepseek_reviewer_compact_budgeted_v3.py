#!/usr/bin/env python3
from __future__ import annotations

import os

import deepseek_reviewer_compact_budgeted_v2 as v2

budgeted = v2.budgeted

# R67 proved the calibrated request estimator behaves coherently, but also
# exposed a separate control-flow issue: the 45k exploration budget is checked
# only after a completed round. A round can therefore start below 45k and push
# cumulative exploration well past it, consuming capacity needed by the final
# falsification pass. Reserve that capacity by stopping exploration after the
# first completed round that reaches a lower soft stop. The hard 100k post-call
# accounting and the v2 2.5x calibrated-density preflight remain unchanged.
EXPLORATION_STOP_PROMPT_TOKENS = int(
    os.environ.get("DEEPSEEK_EXPLORATION_STOP_PROMPT_TOKENS", "35000")
)

if EXPLORATION_STOP_PROMPT_TOKENS <= 0:
    raise RuntimeError("DEEPSEEK_EXPLORATION_STOP_PROMPT_TOKENS must be positive")
if EXPLORATION_STOP_PROMPT_TOKENS >= budgeted.EXPLORATION_PROMPT_BUDGET:
    raise RuntimeError(
        "DEEPSEEK_EXPLORATION_STOP_PROMPT_TOKENS must remain below the inherited exploration budget"
    )
if (
    EXPLORATION_STOP_PROMPT_TOKENS
    + v2.compact.PROTOCOL_TOKEN_RESERVE
    >= v2.compact.HARD_TOTAL_PROMPT_TOKENS
):
    raise RuntimeError("exploration stop must leave explicit capacity for final review")


def exploration_budget_exhausted_v3() -> bool:
    return (
        budgeted.TOTALS["prompt_tokens"] >= EXPLORATION_STOP_PROMPT_TOKENS
        or budgeted.TOTALS["prompt_cache_miss_tokens"]
        >= budgeted.EXPLORATION_CACHE_MISS_BUDGET
    )


budgeted.exploration_budget_exhausted = exploration_budget_exhausted_v3


if __name__ == "__main__":
    raise SystemExit(budgeted.main())
