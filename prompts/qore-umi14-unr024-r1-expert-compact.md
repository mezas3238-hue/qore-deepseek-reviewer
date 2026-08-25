QORE UMI14 UNR-024 / PR #456 — EXPERT REVIEW R1

READ-ONLY independent adversarial validation of the complete frozen BASE→HEAD change. Review material correctness only; do not expand scope.

BINDING:
- BASE `5525e955307d3de715c0e22e2e51be1ad3283fa7`
- HEAD `2f9e0aa418375971006b183456bd133fdf0048a8`
- SYNTHETIC/HASH DE VERIFICACIÓN `b1e32987b8ac8bc4364f1239b4f39cf4899c9582`
- TREE `27a1ce363cef09b684d33e6d49287865334bf850`
- QORE CI #1461 full gate = OK; 4280 passed; total coverage 87%; new module 97%
- exactly 3 additive files / +1252 -0: `src/qore/infrastructure/product_composition_semantics.py`, `tests/infrastructure/test_product_composition_semantics.py`, `docs/architecture/QORE-UMI14-PRODUCT-COMPOSITION-SEMANTICS-024.md`.

Validate MATERIAL correctness:
1. Exact classes `BASKET|SPREAD|MULTI_LEG`; exact modes `ORDERED_CONTRACTUAL|UNORDERED_CANONICAL`; class must not imply ordering mode.
2. ORDERED: every leg has exact positive non-bool ordinal, unique and contiguous 1..N; caller order replaced by ordinal. UNORDERED: ordinal forbidden; caller order irrelevant; deterministic semantic canonicalization.
3. Root cannot self-reference; leg IDs unique. Semantic duplicate detection must ignore local leg id/evidence/ordinal and bind component identity+role+direction+normalized magnitude kind/value/unit. Same component identity remains allowed when economics materially differ.
4. Magnitude exact positive finite `Decimal`; `RATIO|WEIGHT` forbid unit; `QUANTITY` may be dimensionless or use exact `EconomicIdentityId`; no unit conversion. Decimal normalization must remain deterministic and bounded for extreme exponents.
5. Deep exact/recursive revalidation before `logical_values()`: wrappers, strings/codes, enums, tuple exactness, inner UUIDs, Decimal, optional direction/unit/ordinal; reject subclasses/raw primitives/bool-as-int and post-construction nested corruption.
6. Boundary ownership: exact UMI-05 derivative compositions remain UMI-05; UMI-09 higher-order relationships/features remain UMI-09; UNR-024 must not duplicate underlying family economics or create generic payoff/composition DSL.
7. No price/payoff/NAV/current spread/valuation, dynamic weights/rebalance, provider/network, routing/execution/settlement, Risk/accounts, Production or real-capital authority. Tests/docs must match implemented contract.

Each MATERIAL finding: exact location + constructible witness + expected + actual + violated contract + impact + minimum bounded correction. Reject style/speculation/non-reproducible concerns.

If clean finish exactly:
HALLAZGOS: NINGUNO
VALIDACIÓN OK
