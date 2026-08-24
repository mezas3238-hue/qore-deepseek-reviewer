# QORE DeepSeek Reviewer — Token Budget V1.9

## Status

Quality-preserving bounded completion-path follow-up derived from the legitimate UNR-019 Coder R1D run under V1.8.

## Measured V1.8 result

Package `UNR019-ETAPAC-R1D-DS-CODER-01` on frozen qore-core HEAD `b2fae639779bdf27c497929af1a545ae70a42649` produced:

- 3 API calls;
- 51,305 prompt tokens;
- 28,185 completion tokens;
- 28,000 reasoning tokens;
- 1,152 prompt-cache-hit tokens;
- 50,153 prompt-cache-miss tokens;
- zero observed balance delta at the available precision;
- `plan_incomplete=false`;
- no tool errors;
- no evidence clipping;
- correct fail-closed verdict.

The remaining blocker was completion-only: the 20k V4-Pro/high authoritative pass ended by `length`, then the official 8k Chat Prefix Completion continuation also ended by `length`, both without visible review content.

## V1.9 change

V1.9 preserves every V1.8 review-quality invariant:

- `deepseek-v4-pro`;
- thinking enabled and `reasoning_effort=high` for authoritative reasoning;
- complete changed-file evidence and exact modified-file patches;
- deterministic dependency slices;
- exact V1.7 planner tools;
- frozen binding and CI evidence;
- hard evidence budgets;
- fail-closed behavior;
- no Production or real-capital authority.

It changes only the length-truncated continuation policy:

1. The authoritative evidence pass remains capped at 20k output tokens.
2. If truncated by `length`, the same retained CoT continues through DeepSeek Chat Prefix Completion with an 8k cap.
3. If that first continuation is also truncated by `length`, V1.9 permits one final continuation of the same cumulative CoT with a 6k cap.
4. There is no open retry loop. The total high-reasoning output envelope is bounded at 34k tokens: 20k + 8k + 6k.
5. If the second continuation does not naturally stop with visible review content, validation remains `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.
6. Any partial visible prefix is preserved and reassembled only when the final continuation naturally stops.

No non-thinking model is allowed to invent or repair the technical verdict.

## Consumption target

For a surface comparable to UNR-019:

- prompt <= 75k tokens remains the tolerable ceiling;
- prompt <= 60k is preferred;
- normal API calls should be 3 when the first continuation closes, with an absolute V1.9 maximum of 4 if the second hop is required;
- high-reasoning output is hard-capped at 34k tokens;
- evidence planner must remain complete, error-free and unclipped.

## Acceptance criteria

A fresh unique Coder package on the unchanged UNR-019 freeze is the next legitimate benchmark. V1.9 is acceptable only if:

- binding and QORE CI remain exact;
- `plan_incomplete=false`;
- no `tool_error` or `tool_token_clip` occurs;
- the authoritative reasoning path reaches a natural stop with visible adjudicable review content;
- prompt remains <= 75k tokens;
- no incomplete or truncated reasoning can be promoted to PASS;
- findings, if any, still require a constructible accepted-state witness and bounded correction.

If the second prefix hop is also exhausted, V1.9 is not declared stable and no further continuation is automatically added.
