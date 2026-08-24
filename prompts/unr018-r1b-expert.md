# UNR-018 R1B — DeepSeek Expert revalidation

Independently falsify the exact frozen PR #441 candidate after the prior R1 reviewer-infrastructure incident. Source is unchanged; this is a fresh Expert package, not a duplicate dispatch.

## Frozen binding
- Tracker: qore-core #440
- Parent audit: #363
- BASE: `470db7333ab08024c002bd0f057b34b0ae30e5e3`
- HEAD: `b4fa5eda4117fedf9ca81a4eb7d0693d3165026b`
- HEAD tree: `3544dffee92f681496dffa7649c33bb772f132fe`
- synthetic: `87f8a704d19c43a1d6373794242a7b2fb76ad649`
- frozen surface: exactly 3 added files, +1120/-0 (doc 83, source 500, tests 537)
- QORE CI #1411 / run `32756157142`: Ruff, Mypy, Pytest success.

CI is evidence, not semantic proof.

## Scope
Bounded D04 static product-specific futures final-settlement rule declaration. Reuses UMI-05 `FuturesContractTerms` and UMI-02 identities. No calculation engine, market-data retrieval, valuation engine, settlement mutation, Risk/account, Production or real-capital authority.

## Prior R1 adjudication
The prior Expert report's sole finding claimed an accepted-state collision between `fixed_weight=None` and explicit `Decimal("0")`.
IA rejected that witness: every present `fixed_weight` is validated through `_exact_decimal(..., positive=True)`, so zero is invalid before logical projection or duplicate detection.
Do not repeat that finding unless you produce a distinct witness whose values actually survive all constructor/revalidation guards. Treat the prior adjudication as a falsifiable constraint, not as proof that the candidate is clean.

## Adversarial priorities
1. Genuine bounded specialization vs opaque algorithm/role strings: identify a concrete missing contractual dimension if materially insufficient.
2. Accepted-state logical A/B collisions only: optional fields, canonical ordering, duplicate bypass, same identity/role with distinct accepted windows/positive coefficients.
3. Decimal projection: >28 digits, ambient context, scientific/fixed crossover, extreme exponents, exact-type/subclass behavior.
4. Time semantics: timezone canonicalization, point/interval observations, exact datetime/date/int types, chronology.
5. Reflective corruption and primitive/wrapper subclass leakage across reused UMI-05 / UMI-02 leaves.
6. Verify the local futures projection preserves all 13 UMI-05 fields while avoiding ambient Decimal-context dependence.
7. Valid product states rejected by invented generic rules; invalid/ambiguous states accepted.
8. Source/tests/doc contradiction, tautological tests, missing adversarial coverage.
9. Authority expansion beyond static D04 rule declaration.

## Strict exclusions
Do not require or introduce algorithm execution, final settlement result calculation, market-data/provider mapping, D07 valuation methodology, CTD, conversion-factor methodology, invoice/accrued computation, delivery election, execution/settlement mutation, Risk/account, Production or real capital.

Report only material bounded findings. For each: severity, exact location, violated invariant, concrete reproducible accepted-state witness, expected vs actual, minimal bounded correction.

If evidence is insufficient, finish with `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA` rather than guessing.

If no material finding remains, finish exactly:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
