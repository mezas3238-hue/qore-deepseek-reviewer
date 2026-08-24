# DeepSeek reviewer token policy V2.0

## Objective

Reduce reviewer consumption without reducing review quality or weakening fail-closed behavior.

V2.0 is based on the measured UNR-019 sequence. V1.7 stabilized exact evidence acquisition at 37,493 prompt tokens but its 20k final pass truncated. V1.8/V1.9 attempted Chat Prefix Completion; V1.9 reached 97,179 prompt tokens and still did not emit a visible verdict. Replaying context is therefore rejected as the optimization direction.

## Invariants retained

- `deepseek-v4-pro` remains the authoritative final model.
- Thinking remains enabled with `reasoning_effort=high`.
- Every changed file is supplied completely.
- Modified/type-changed files retain exact BASE..HEAD patch evidence.
- Deterministic local dependency slices remain enabled.
- The one-shot evidence planner and V1.7 exact read-only tools remain enabled.
- Missing, clipped or errored required evidence remains fail-closed.
- CI is evidence, never semantic proof.
- No Production, credential, execution or real-capital authority is added.

## V2.0 completion policy

The final review gets one authoritative Pro/high call with a 48,000-token output envelope.

The final system instruction explicitly requires the reviewer to preserve adversarial depth while reserving at least 4,000 tokens for its visible self-contained verdict. The reviewer must not intentionally spend the complete envelope on hidden reasoning.

There is no API fallback, no Chat Prefix Completion and no second reviewer call. If the single authoritative response ends by `length` or emits no visible verdict, V2.0 returns `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA` locally. This consumes zero additional API tokens.

## Expected request count

Normal path:

1. one non-thinking evidence-plan call;
2. one Pro/high authoritative final call.

Expected API calls: 2.

## Consumption acceptance

For a review surface comparable to UNR-019:

- preferred prompt consumption: <= 40,000 tokens total;
- tolerable prompt consumption: <= 75,000 tokens total;
- no clean PASS may depend on missing evidence;
- a run that cannot emit an adjudicable visible verdict is not stable regardless of token count.

V2.0 is accepted as stable only after a legitimate frozen review produces an adjudicable result while keeping the evidence path complete and prompt consumption within the tolerable range.
