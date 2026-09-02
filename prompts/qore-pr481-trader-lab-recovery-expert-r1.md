# QORE PR #481 — DeepSeek Expert R1

Actúa como reviewer EXPERT independiente, adversarial y read-only del candidato congelado de QORE Core.

## Binding exacto

- Repository: `mezas3238-hue/qore-core`
- PR: `#481`
- BASE: `9672c4d999bd5d3e6db544f349243bc6abea0363`
- HEAD: `5d25445faf57fa83410b57faf5eaf1f437949129`
- HEAD TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- SYNTHETIC: `f7d05fc855607107b4129dec4330ca25bf89ee13`
- SYNTHETIC TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`
- Scope: 13 files, +4069/-0.
- Recovery provenance: Harness Batch 005 run `33687204702`, artifact `9870234891`, patch SHA256 `ec6ddd576f0c8e84f368355892b249caa5f02509a6c32a2cc3fa53c7a6d56511`; all six durable lanes completed. Workflow failure was only the known resilient-runner COMPLETE-marker parser defect (#48). Do not treat that mechanical workflow failure as a code finding.

The host binds an exact QORE CI run/job before invoking this review. Treat that QG as the authoritative candidate gate and independently inspect code semantics.

## Mandatory semantic-LSP review

Use semantic LSP materially, not grep-only: `hover`, `findReferences`, `goToDefinition`, `goToImplementation` where relevant. Verify reuse and reverse dependency radius.

## Falsification targets

1. Lifecycle is fail-closed, ordered and non-skippable; no stage-name or status laundering creates eligibility.
2. Every Trader candidate is individually bound by exact identity/version/config/fingerprint/evidence. No cohort inheritance or “first five” shortcut.
3. Code/config/candidate-version change invalidates prior qualification/eligibility evidence.
4. Fast-forward changes wall-clock speed only; it cannot reveal future events, reorder simulated chronology, or become a second inconsistent replay engine.
5. OOS, Stress, Monte Carlo, economic evidence, Risk review, CIBO review and independent validation prerequisites cannot be bypassed or inferred.
6. Monte Carlo/resampling is deterministic and pre-registered: no seed hunting, hidden retry-to-pass, post-result threshold mutation, deleted bad runs, global RNG, or OOS optimization.
7. Insufficient sample/evidence fails closed as insufficient evidence rather than PASS/profitability inference.
8. `MONTE_CARLO_PASS != PROFITABILITY_PROOF`; `DEMO_ELIGIBLE != profitable`.
9. Trader Lab cannot place orders, bypass Risk, admit directly to provider execution, grant Production authority or authorize real capital.
10. Existing Research/freeze/replay/OOS/bootstrap/resampling/economic contracts are reused where semantically exact; no duplicate semantic truth that can drift from canonical evidence.
11. Immutable dataclasses/value objects, exact runtime types (`bool != int`), nested recursive revalidation, timezone-aware explicit timestamps, deterministic ordering, no hidden clock/RNG/global mutable, sanitized evidence.
12. Reflective corruption/mismatched candidate evidence/duplicate stage evidence/out-of-order evidence/stale evidence must fail closed.
13. Tests must adversarially prove the gates, not only construct expected happy paths.

Hard laws:

`NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`
`CODE_GREEN != DEMO_ELIGIBLE`
`BACKTEST_PROFITABLE != DEMO_ELIGIBLE`
`MONTE_CARLO_PASS != PROFITABILITY_PROOF`
`CIBO_REVIEW != PROMOTION AUTHORITY`
`TRADER_LAB != EXECUTION AUTHORITY != RISK_BYPASS`
`DEMO_ELIGIBLE != PROFITABLE`
`DEMO EVIDENCE != PRODUCTION READY != REAL CAPITAL AUTHORIZED`

## Output

Report only reproducible findings tied to exact files/symbols/evidence. Classify MATERIAL vs MINOR. Do not mutate repository state.

If there is any material defect, finish with `VALIDACIÓN NO OK`.
If there is no material defect, finish exactly with:

`HALLAZGOS: NINGUNO`
`VALIDACIÓN OK`
