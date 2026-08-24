# DeepSeek reviewer token budget V2.1

## Purpose

V2.1 addresses the last measured UNR-019 reviewer bottleneck without reducing evidence quality or substituting the reviewer model.

V2.0 proved that prompt amplification is solved: the legitimate Coder R1F used 17,997 prompt tokens over two API calls, with a complete/error-free evidence plan. However, `deepseek-v4-pro/high` consumed the full 48,000-token output envelope as hidden reasoning and emitted no visible verdict.

## Design

The evidence path remains the V1.7/V2.0 path:

- complete exact changed-file content;
- exact patches for modified/type-changed files;
- deterministic dependency slices;
- exact read-only planner tools;
- binding/CI evidence;
- fail-closed quality guards.

The reviewing model remains `deepseek-v4-pro`.

V2.1 separates substantive analysis from verdict emission:

1. one authoritative `deepseek-v4-pro/high` analysis over the full evidence, capped at 20,000 output tokens;
2. if that pass naturally emits a complete visible verdict, publish it directly and do not call again;
3. otherwise, one same-model `deepseek-v4-pro` non-thinking extraction call receives only the retained high-reasoning analysis plus a bounded target reminder, capped at 3,200 tokens;
4. the extractor is not allowed to introduce new findings or infer a clean verdict from absence. It must block when the retained analysis does not explicitly support a complete conclusion;
5. no CoT continuation, no full-evidence fallback and no Flash substitution.

## Quality invariant

The high-reasoning pass remains the authoritative technical analysis. The non-thinking pass is a bounded verdict formatter/extractor only.

A finding is publishable only when the retained analysis supports a concrete constructible accepted-state witness, expected/actual behavior, impact and bounded correction.

A clean verdict is publishable only when the retained analysis supports sufficient coverage of the requested review focus and contains no unresolved material defect or missing evidence.

Ambiguity, incomplete analysis, missing evidence, extractor truncation or internal conflict results in `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.

## Budget target

For a review surface comparable to UNR-019:

- prompt target remains <=75,000 total tokens;
- preferred prompt remains 25,000-60,000 where comparable;
- high-reasoning output is capped at 20,000 tokens;
- verdict extraction is capped at 3,200 tokens;
- normal API calls are 3: planner + high analysis + extraction;
- if the high pass emits a natural visible verdict, normal API calls reduce to 2.

V2.1 is not considered stabilized until a legitimate review produces an adjudicable result with the evidence path complete and total consumption inside the established tolerable range.
