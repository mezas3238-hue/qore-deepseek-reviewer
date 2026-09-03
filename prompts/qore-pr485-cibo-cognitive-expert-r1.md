# QORE PR #485 — CIBO Cognitive Superarchitecture — DeepSeek Expert R1

Actúa como reviewer EXPERT independiente, adversarial y estrictamente read-only del candidato congelado de QORE Core. No asumas que Harness, IA previa ni tests verdes implican corrección semántica.

## BINDING EXACTO

- Repository: `mezas3238-hue/qore-core`
- PR: `#485`
- Stacked BASE / PR #480 HEAD: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- HEAD: `5b69d036fd669b1f88f6dcd2fa915c93d9bc7805`
- HEAD TREE: `1911588b3be0632eeaf96e6e503ee0eb6ef96443`
- SYNTHETIC: `c7c081abe6322d9743d021d143a55eb8b7d5a56c`
- SYNTHETIC TREE MUST equal HEAD TREE.
- Exact diff vs stacked BASE: 16 files, +4725/-0.
- Harness correction run: `33760443704`; job `100665148922`; artifact `9896355933`.
- Exact candidate patch SHA256: `4b3072fc60e4dae42d8de5ebdf041f78e19da08cd4e31dffb15c9c157b4dca63`.
- Materialization verified that exact patch on the exact BASE and produced this HEAD/TREE without semantic edits.
- External canonical FULL QG on the exact BASE+patch tree: Ruff PASS; Mypy PASS (761 source files); Pytest 5010/5010 PASS; 7 pre-existing warnings; coverage 87% (49642 statements / 6575 missed); deterministic candidate gate PASS; diff check PASS.

This PR is deliberately stacked on PR #480 because the immutable Harness START is PR #480 HEAD. Review only the 16-file Cognitive delta; do not treat the already-existing #480 predecessor as a new Cognitive finding unless the Cognitive code creates a material interaction with it.

## TARGET / HISTORICAL RESIDUAL

CIBO Cognitive implements the cognitive superarchitecture under #482: attention, world model, planning, reasoning/tool/faculty orchestration, replay/audit and evaluation boundaries. Earlier IA found a cross-cutting exact-runtime-type residual: trust-bearing UUID/enums/datetimes/value records could use permissive `isinstance` semantics and permit subclass laundering.

The current candidate claims to close that family with exact runtime checks, recursive revalidation, deterministic canonicalization and adversarial subclass tests.

Hard laws:
`INTELLIGENCE != AUTHORITY`
`REASONING != EXECUTION`
`OPINION != FORMAL SIGNAL`
`MODEL PROVIDER != CIBO SEMANTICS`
`BOOL != INT`
`SUBCLASS COMPATIBILITY != TRUST-BEARING IDENTITY`

## MANDATORY FALSIFICATION TARGETS

1. **Exact runtime closure:** malicious UUID, enum, datetime, numeric/value-object subclasses cannot pass trust-bearing identity, authority, evidence or deterministic semantic boundaries where exact type is required.
2. **Recursive revalidation:** frozen nested values reflectively corrupted after construction are revalidated when consumed; no shallow trust of retained nested UUIDs, refs, evidence, contradictions, tasks, world-model records, tool results or evaluation dimensions.
3. **Constructor bypass:** `object.__new__`, `object.__setattr__`, subclassing and deserialize-like reconstruction cannot bypass a promised gate without later consumer revalidation.
4. **Sequence normalization:** public functions that intentionally accept `Sequence` must exact-check every trust-bearing element and normalize deterministically. Reject `str`/bytes or other accidental sequence shapes where they could alter semantics or evade validation.
5. **Identity binding:** snapshot/episode/plan/task/tool/evaluation IDs remain exact and bound to the correct object/version/reference; swapping identities or cross-binding evidence must fail closed.
6. **World model:** contradictions, references, staleness and resolved-reference behavior remain deterministic and do not convert uncertainty into certainty.
7. **Attention/routing:** ranking and route decisions preserve evidence ordering, deterministic ties and abstention. No severity/type laundering or hidden authority increase.
8. **Planning:** goal/task graph validation, dependency acyclicity, completion evidence and revision semantics cannot be bypassed through malformed nested state.
9. **Tool/faculty orchestration:** tool/faculty outputs are opinions/contributions, not execution authority; result/request bindings cannot be swapped; no provider-native authority leaks.
10. **Replay/audit:** replay fingerprints bind exact logical material and detect retained-state corruption; no hidden `now`, random, retry, scheduler, thread or mutable-global semantic effects.
11. **Evaluation:** status is derived from exact validated dimensions/evidence/contradictions; caller cannot directly assert a more favorable status than the retained evidence supports.
12. **Secret hygiene:** no credentials/tokens/secrets can enter repr, logical values, evidence refs, error strings or replay material.
13. **Authority firewall:** no Cognitive object grants order execution, Risk bypass, Production activation, custody, withdrawal or real-capital authority.
14. **Root-family exhaustion:** use LSP to inspect neighboring builders/constructors/re-entry paths; do not review only the named corrected lines.
15. **Tests prove behavior:** identify fixtures that merely mirror the implementation; construct adversarial witnesses where possible.

## MANDATORY SEMANTIC LSP

Use semantic LSP materially: hover, references, definitions and implementations on the exact-type helpers and each trust-bearing construction/consumption path. Grep-only review is insufficient.

## REVIEW DISCIPLINE

- Read-only; no repository edits.
- Distinguish intentional polymorphism/API container convenience from trust-bearing type identity.
- Report only reproducible findings on this exact HEAD.
- Deduplicate common-root findings.
- Classify MATERIAL vs MINOR.
- A green QG is evidence, not proof of semantic correctness.

## REQUIRED OUTPUT

Provide binding verification, semantic-LSP evidence, adversarial witnesses, exact-type/subclass-laundering closure adjudication, root-family exhaustion, then findings.

If any material defect remains, finish with:
`VALIDACIÓN NO OK`

If no material defect remains, finish exactly with:
`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`
