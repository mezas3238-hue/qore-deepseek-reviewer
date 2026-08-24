# UNR-018 R1 — DeepSeek Expert

Independently falsify the exact frozen PR #441 candidate for UMI13-UNR-018.

## Binding
- Tracker: qore-core #440
- Parent audit: #363
- BASE: `470db7333ab08024c002bd0f057b34b0ae30e5e3`
- HEAD: `b4fa5eda4117fedf9ca81a4eb7d0693d3165026b`
- HEAD tree: `3544dffee92f681496dffa7649c33bb772f132fe`
- synthetic: `87f8a704d19c43a1d6373794242a7b2fb76ad649`
- frozen surface: exactly 3 added files, +1120/-0 (doc 83, source 500, tests 537)
- QORE CI #1411 / run `32756157142`: Ruff, Mypy, Pytest success.

CI is evidence, not semantic proof.

## Candidate claim
Bounded D04 static product-specific futures final-settlement **rule declaration**. It reuses UMI-05 `FuturesContractTerms` and UMI-02 identities. No calculation engine is authorized.

Candidate rule material: rule ID, full futures terms, algorithm code, explicit final-settlement date, canonical input declarations (identity + role + optional observation window + optional fixed contractual coefficient), optional rounding rule, evidence ref.

## Adversarial priorities
1. Decide whether this is genuine bounded final-settlement semantic specialization or merely moves UNR-018 behind an opaque algorithm/role string. Give a concrete missing contractual dimension/witness if insufficient.
2. Look for omitted material dimensions needed to distinguish real product-specific final-settlement rules without crossing into executable calculation/valuation authority: observation basis, input/output quote semantics, sampling/fixing conventions, weighting/rounding, dates/times, provenance, etc.
3. Attack logical A/B collisions, especially optional `None` vs present fields, total canonical ordering, duplicate bypass and same identity/role with distinct windows/coefficients.
4. Attack Decimal projection: >28-digit values, ambient `localcontext`, fixed/scientific crossover, extreme exponents and subclasses.
5. Attack timezone canonicalization, point vs interval observations, datetime/date/int/bool subclasses and chronology assumptions.
6. Attack reflective corruption and primitive/wrapper subclass leakage across all reused UMI-05 / UMI-02 leaves.
7. Verify the local futures projection preserves all 13 UMI-05 fields and changes only multiplier/tick Decimal text canonicalization.
8. Look for valid product states rejected by invented generic rules, and invalid/ambiguous states accepted.
9. Check source/tests/doc consistency and non-tautological tests.
10. Check authority boundaries.

## Strict exclusions
Do not require or introduce:
- execution of the algorithm / `calculate()` / a final settlement result;
- market-data retrieval/provider mapping;
- D07 valuation engine or pricing methodology authority;
- CTD selection;
- conversion-factor methodology;
- invoice/accrued computation;
- delivery election;
- execution or settlement mutation;
- Risk/account, Production or real capital.

Report only material bounded findings. For each: severity, exact location, violated invariant, concrete reproducible witness, expected vs actual, minimal bounded correction.

If evidence is insufficient because of a harness evidence budget, return `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`; never infer a clean verdict from missing evidence.

If no material finding remains, finish exactly:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
