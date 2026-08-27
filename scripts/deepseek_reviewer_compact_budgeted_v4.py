#!/usr/bin/env python3
from __future__ import annotations

import os
from typing import Any

import deepseek_reviewer_compact_budgeted_v3 as v3

budgeted = v3.budgeted

# R68 measured the post-round control precisely: cumulative prompt input was
# 30,850 after exploration round 4, still below v3's 35k soft stop, so round 5
# was admitted and pushed the cumulative input to 48,590. The calibrated final
# preflight then correctly blocked at a conservative 101,980 projected tokens.
#
# Keep every hard guarantee from v2/v3 (2.5x calibrated request-density
# estimate, 8,192 protocol reserve, exact post-call 100k ceiling) and reserve
# the final falsification pass by ending exploration once a completed round has
# reached 30k. A pre-request guard below is a second line of defence: if main's
# loop control is ever changed or bypassed, it returns a synthetic no-tool
# explorer stop message instead of spending another API request.
EXPLORATION_FINAL_RESERVE_STOP = int(
    os.environ.get("DEEPSEEK_EXPLORATION_FINAL_RESERVE_STOP", "30000")
)

if EXPLORATION_FINAL_RESERVE_STOP <= 0:
    raise RuntimeError("DEEPSEEK_EXPLORATION_FINAL_RESERVE_STOP must be positive")
if EXPLORATION_FINAL_RESERVE_STOP >= v3.EXPLORATION_STOP_PROMPT_TOKENS:
    raise RuntimeError(
        "DEEPSEEK_EXPLORATION_FINAL_RESERVE_STOP must be below the v3 soft stop"
    )

# v3's exhaustion function reads this module global at call time, so lowering
# it here changes only reviewer budgeting and leaves Core untouched.
v3.EXPLORATION_STOP_PROMPT_TOKENS = EXPLORATION_FINAL_RESERVE_STOP

_guarded_send_request_v3 = budgeted.send_request


def guarded_send_request_v4(
    *,
    stage: str,
    round_number: int,
    messages: list[dict[str, Any]],
    thinking: bool,
    tools: bool,
    max_tokens: int,
    model: str,
) -> dict[str, Any]:
    if (
        stage == "explore"
        and budgeted.TOTALS["prompt_tokens"] >= EXPLORATION_FINAL_RESERVE_STOP
    ):
        print(
            "DeepSeek exploration stopped before API request to preserve final-pass "
            f"budget: round={round_number} actual_prompt_so_far="
            f"{budgeted.TOTALS['prompt_tokens']} stop="
            f"{EXPLORATION_FINAL_RESERVE_STOP}"
        )
        return {
            "model": model,
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": (
                            "Exploration stopped by reviewer final-pass reserve; use the "
                            "raw evidence already collected and perform the final "
                            "independent falsification pass."
                        ),
                    }
                }
            ],
        }

    return _guarded_send_request_v3(
        stage=stage,
        round_number=round_number,
        messages=messages,
        thinking=thinking,
        tools=tools,
        max_tokens=max_tokens,
        model=model,
    )


budgeted.send_request = guarded_send_request_v4


if __name__ == "__main__":
    raise SystemExit(budgeted.main())
