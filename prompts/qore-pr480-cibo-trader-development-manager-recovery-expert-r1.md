# QORE PR #480 — DeepSeek Expert R1

Actúa como reviewer EXPERT independiente, adversarial y read-only del candidato congelado de QORE Core.

## Binding exacto

- Repository: `mezas3238-hue/qore-core`
- PR: `#480`
- BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
- HEAD: `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- HEAD TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- SYNTHETIC: `3e203d32d05bd33cc509fd8aef82b9a42729dd90`
- SYNTHETIC TREE: `11f35844670551ac4ab5be322272a3221e6b1c4b`
- Scope: 7 files, +2523/-0.
- Recovery provenance: Harness Batch 004 run `33686478316`, artifact `9870038198`, patch SHA256 `b3f945dd940b209557854b94a534ebc34ae4c85a2243cfc324e5bafec4ec3fdd`; all six durable lanes completed. Workflow failure was only the known resilient-runner COMPLETE-marker parser defect (#48). Do not treat that mechanical workflow failure as a code finding.

The host binds an exact QORE CI run/job before invoking this review. Treat that QG as the authoritative candidate gate and independently inspect code semantics.

## Mandatory semantic-LSP review

Use semantic LSP materially, not grep-only: `hover`, `findReferences`, `goToDefinition`, `goToImplementation` where relevant. Verify reuse and reverse dependency radius.

## Falsification targets

1. Exact Trader identity/version/config binding cannot be laundered or ambiguously reused.
2. Capability Profile cannot fabricate quantitative metrics or treat stale/missing/contradictory evidence as certified/current.
3. `CIBO RECOMMENDATION != PROMOTION AUTHORITY`: no recommendation can manufacture `DEMO_ELIGIBLE`.
4. Non-DEMO-eligible, stale, rejected, degraded, suspended or blocked Trader cannot be selected.
5. Managed CIBO/Risk path cannot bypass Risk or synthesize Risk evidence.
6. A/B identity is exact: same Trader version/config; no retrospective substitution or cherry-picking seam.
7. Missing/ambiguous correlation/concentration evidence cannot yield fabricated conclusions.
8. No provider-native order construction, execution authority, account/capital mutation, deposit/withdrawal, Production authority or real-capital authorization.
9. Infrastructure placement does not create reverse dependency or duplicate an already exact contract. Inspect especially reuse/new-type claims around evaluator identity, evidence refs, config fingerprints, `Result`, `InfrastructureError`.
10. Dataclasses/value objects are actually immutable/deterministic; exact runtime types hold (`bool != int`, subclass laundering rejected where required); no hidden clock/RNG/global mutable state; no secrets in repr/logical values/evidence.
11. `logical_values()` / nested evidence revalidation cannot accept reflectively corrupted or type-laundered nested material.
12. Tests are adversarial enough and do not merely assert happy-path construction.

Hard laws:

`CIBO RECOMMENDATION != PROMOTION AUTHORITY`
`CIBO MANAGEMENT != EXECUTION AUTHORITY`
`CIBO MANAGEMENT != RISK BYPASS`
`DEMO_ELIGIBLE != PROFITABLE`
`DEMO EVIDENCE != PRODUCTION READY != REAL CAPITAL AUTHORIZED`

## Output

Report only reproducible findings tied to exact files/symbols/evidence. Classify MATERIAL vs MINOR. Do not mutate repository state.

If there is any material defect, finish with `VALIDACIÓN NO OK`.
If there is no material defect, finish exactly with:

`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`
