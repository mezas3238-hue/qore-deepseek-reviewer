# UNR-018 R1C — DeepSeek Coder

Independently review exact frozen qore-core PR #441 as code-level adversarial reviewer.

Binding:
- BASE `470db7333ab08024c002bd0f057b34b0ae30e5e3`
- HEAD `b4fa5eda4117fedf9ca81a4eb7d0693d3165026b`
- HEAD tree `3544dffee92f681496dffa7649c33bb772f132fe`
- synthetic `87f8a704d19c43a1d6373794242a7b2fb76ad649`
- exactly 3 added files, +1120/-0
- CI #1411 green: Ruff/Mypy/Pytest.

Expert R1B on this exact HEAD: `HALLAZGOS: NINGUNO / VALIDACIÓN OK`; IA: PASS.
Coder R1B was INCONCLUSIVE only because its evidence bundle lacked reused definitions; IA accepted the fail-closed result and found no candidate defect.

MANDATORY EXPLORER EVIDENCE BEFORE CLOSURE:
1. Read the relevant definitions in `src/qore/infrastructure/derivative_contract_semantics.py`: `FuturesContractTerms.__post_init__`, `FuturesContractTerms.logical_values`, `DerivativeContractMonth`, `DerivativeTermsId`, `DerivativeEvidenceRef`, `DerivativeContractMultiplier`, `DerivativeTickValue`, and their logical/validation methods used by the candidate.
2. Read `EconomicIdentityId.__post_init__` and `EconomicIdentityId.logical_values` in `src/qore/infrastructure/universal_instrument_identity.py`.
3. Batch those reads/searches early; the quality guard already injects the 3 changed files completely, so do not reread changed-file content during explorer.
4. Do not declare EVIDENCE_COMPLETE until those reused definitions are present. If they cannot be collected, return EVIDENCE_INCOMPLETE.

Prior R1 proposed `None` vs `fixed_weight=0` collision. IA rejected it because every present `fixed_weight` is validated through `_exact_decimal(..., positive=True)`. Do not repeat that claim unless a witness actually survives construction/revalidation.

Focus on material code defects only:
- accepted-state A/B logical collisions, ordering/duplicates;
- optional window/weight/rounding presence semantics;
- Decimal precision/context/extreme exponents;
- datetime/timezone/point-window chronology and exact types;
- reflective corruption and reused UMI-05/UMI-02 leaves;
- exact 13-field UMI-05 parity with only multiplier/tick Decimal text locally canonicalized;
- concrete missing static contractual material without demanding an executable engine;
- non-tautological tests and authority boundaries.

Strict exclusions: no calculate/compute engine, observed values, market-data/provider capability, D07 valuation engine, CTD, conversion-factor methodology, invoice/accrued computation, delivery election, execution/settlement mutation, Risk/account, Production or real capital.

Report only material bounded findings with valid witness and minimal correction. If clean, finish exactly:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
