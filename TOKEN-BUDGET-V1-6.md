# QORE DeepSeek Reviewer — Token Budget V1.6

## Status

Quality-preserving completion-path optimization derived from the legitimate UNR-019 Expert R1B measurement under V1.5.

## Measured V1.5 result

Package `UNR019-ETAPAC-R1B-DS-EXPERT-01` on frozen qore-core HEAD `b2fae639779bdf27c497929af1a545ae70a42649` produced:

- 3 API calls;
- 31,081 prompt tokens;
- 41,334 completion tokens;
- 40,001 reasoning tokens;
- 72,415 billed input+output tokens;
- zero observed balance delta at the available precision;
- `plan_incomplete=false`;
- no planner/tool error;
- no planned extra evidence;
- a full 40k Pro/high reasoning exhaustion followed by a non-thinking fallback.

The original prompt-amplification problem is materially reduced: prompt tokens are in the preferred range. The remaining waste is the completion path: the authoritative Pro/high call spends its complete envelope without visible output and V1.3 then resends the complete evidence bundle for presentation.

## V1.6 design

V1.6 keeps all quality and authority invariants from V1.5:

- `deepseek-v4-pro`;
- thinking enabled for the authoritative evidence analysis;
- `reasoning_effort=high`;
- complete changed-file evidence;
- exact modified-file patches;
- deterministic dependency slices;
- frozen binding and CI evidence;
- one-shot evidence planner;
- fail-closed behavior for incomplete evidence;
- no Production or real-capital authority.

It changes only how a length-exhausted high-reasoning pass is completed:

1. The exact-evidence analysis remains V4-Pro/high and is bounded to 20k output tokens.
2. If it produces visible review content, that content is used directly.
3. If it consumes the analysis envelope with no visible content, the existing fallback becomes a presentation-only synthesis pass.
4. The synthesis receives the exact target-review prompt plus the retained `reasoning_content` from the same V4-Pro/high evidence pass. It does **not** receive the complete evidence bundle again.
5. The synthesis is explicitly forbidden to invent new findings or repair uncertainty by assumption. Uncertain or incomplete retained analysis must become `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.
6. The existing planner-quality guard remains authoritative after synthesis.

This is not a replacement of high reasoning with non-thinking review. The non-thinking call only converts retained high-reasoning analysis into the publishable verdict when the API has left `content` empty.

## Why this preserves quality

The authoritative analysis still sees all exact evidence and still runs V4-Pro/high. V1.6 removes redundant **presentation-time re-reading**, not evidence or adversarial analysis. The serial QORE review chain remains unchanged: DeepSeek result -> independent IA adjudication -> later reviewer gates.

A proposed DeepSeek finding is never trusted merely because it consumed many reasoning tokens. UNR-019 R1B itself demonstrated this: its only material finding was rejected by IA because the exact source re-runs aggregate semantic duplicate checks via `logical_values() -> self.__post_init__()`.

## Acceptance criteria

The next legitimate Coder package is the benchmark. V1.6 is acceptable only if:

- exact binding and evidence remain complete;
- planner remains complete with no tool errors;
- output is technically adjudicable;
- no evidence-incomplete state is converted to PASS;
- prompt consumption remains at or below the established tolerable range;
- completion/reasoning consumption falls materially below the V1.5 41,334 / 40,001 figures;
- no full evidence bundle is retransmitted solely to render a final answer.

If those properties do not hold, V1.6 is not declared stable and the diagnostic drives the next bounded correction.
