# QORE DeepSeek Reviewer — Token Budget V1.8

## Status

Quality-preserving completion-path stabilization derived from the legitimate UNR-019 Coder R1C measurement under V1.7.

## Measured V1.7 result

Package `UNR019-ETAPAC-R1C-DS-CODER-01` on frozen qore-core HEAD `b2fae639779bdf27c497929af1a545ae70a42649` produced:

- 3 API calls;
- 37,493 prompt tokens;
- 20,218 completion tokens;
- 20,001 reasoning tokens;
- 256 prompt cache-hit tokens;
- zero observed balance delta at available precision;
- `plan_incomplete=false`;
- no tool errors;
- no clipping markers;
- exact planner tools active;
- final V4-Pro/high pass ended with `finish_reason=length` and no visible verdict;
- the conservative synthesis therefore returned `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.

V1.7 stabilized evidence acquisition and kept prompt consumption in the preferred/tolerable range. The remaining blocker is continuation of a max-token-truncated high-reasoning answer.

## V1.8 design

V1.8 keeps every V1.7 quality invariant:

- `deepseek-v4-pro`;
- thinking enabled with `reasoning_effort=high` for authoritative analysis;
- complete changed-file evidence;
- exact modified-file patches;
- deterministic dependency slices;
- frozen binding and CI evidence;
- exact planner tools and hard evidence budgets;
- fail-closed behavior;
- no Production or real-capital authority.

It changes only the path taken after a high-reasoning response ends with `finish_reason=length` and no complete visible verdict.

DeepSeek's official Chat Prefix Completion beta supports continuation of output truncated by `max_tokens` and accepts prior `reasoning_content` as CoT input when the final assistant message has `prefix=true`. V1.8 uses that mechanism once, with the original exact-evidence messages and the retained reasoning state, still on V4-Pro/high.

The continuation budget is 8,000 output tokens. If it reaches a natural `stop` with visible content, that content is the candidate review. If the continuation itself is length-truncated, empty, or unavailable, V1.8 publishes `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`. It does not ask a non-thinking pass to infer a clean verdict from truncated reasoning.

The planner-quality guard remains authoritative after continuation. A complete-looking answer cannot override incomplete evidence.

## Acceptance criteria

A fresh unique Coder package on the unchanged UNR-019 freeze is the next legitimate benchmark. V1.8 is acceptable only if:

- evidence planning remains complete and error-free;
- the high-reasoning continuation reaches an adjudicable visible verdict or fails closed;
- no non-thinking review substitutes for the authoritative reasoning path;
- prompt consumption remains within the established tolerable range;
- total completion/reasoning does not regress materially;
- no incomplete or truncated reasoning can become a clean PASS;
- QORE source and the serial review protocol remain unchanged.

If these properties fail, V1.8 is not declared stable and the diagnostic drives the next bounded correction.
