# UNR-018 R1B — DeepSeek Coder

Independently review exact frozen qore-core PR #441 as code-level adversarial reviewer.

Binding:
- BASE `470db7333ab08024c002bd0f057b34b0ae30e5e3`
- HEAD `b4fa5eda4117fedf9ca81a4eb7d0693d3165026b`
- HEAD tree `3544dffee92f681496dffa7649c33bb772f132fe`
- synthetic `87f8a704d19c43a1d6373794242a7b2fb76ad649`
- exactly 3 added files, +1120/-0
- CI #1411 green: Ruff/Mypy/Pytest.

Expert R1B on this exact HEAD: `HALLAZGOS: NINGUNO / VALIDACIÓN OK`; IA adjudication: PASS.

Prior R1 proposed `None` vs `fixed_weight=0` collision. IA rejected it: every present `fixed_weight` is validated with `_exact_decimal(..., positive=True)`, so zero is not an accepted state. Do not repeat that claim unless you produce a witness that actually survives construction/revalidation.

Focus on concrete code defects only:
1. valid accepted-state A/B logical collisions, ordering or duplicate errors;
2. optional window/weight/rounding presence semantics;
3. Decimal precision/context/extreme-exponent behavior;
4. datetime/timezone/point-window chronology and exact-type leakage;
5. reflective corruption and reused UMI-05/UMI-02 nested leaves;
6. exact 13-field UMI-05 projection parity, changing only multiplier/tick Decimal text;
7. missing static contractual material that can be shown by a concrete product-state witness without demanding a calculation engine;
8. tests that fail to exercise a claimed invariant;
9. accidental authority expansion.

Strict exclusions: no calculate/compute engine, observed values, market-data/provider capability, D07 valuation engine, CTD, conversion-factor methodology, invoice/accrued computation, delivery election, execution/settlement mutation, Risk/account, Production or real capital.

Report only material bounded findings with exact location, valid reproducible witness, expected/actual behavior and minimal correction. If evidence is insufficient, return `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`.

If clean, finish exactly:
HALLAZGOS: NINGUNO
VALIDACIÓN OK
