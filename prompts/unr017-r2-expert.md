# UNR-017 R2 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` and `prompts/shared/expert-common.md`.

Binding: repo `mezas3238-hue/qore-core`; PR #439; tracker #438; package `UNR017-ETAPAC-R2-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `ba11341c76b43436f3ef9f906a4cfe568614975c`; HEAD tree `cf76d9dcce2bfa7598fe11e8e5b2136643b261fb`; live GitHub synthetic merge `d8afcda7250cc6bcf96c1f94e494b4e4b5931461` with parents BASE+HEAD and tree `cf76d9dcce2bfa7598fe11e8e5b2136643b261fb`.

Frozen surface: exactly 3 added files / +426 -0: docs 49, source 175, tests 202. QORE CI #1393 (`32720035196`) SUCCESS: quality/Ruff/Mypy/Pytest all green.

Target: bounded D04 static futures deliverable-basket + contract-defined conversion-factor semantics. Reuse exact UMI-05 `FuturesContractTerms` and UMI-02 `EconomicIdentityId`; UNR-018 final-settlement algorithms stays separate.

R1 material finding: nested reflective corruption could pass because entry validation checked only wrappers. IA accepted MATERIAL and stopped the serial chain. R2 correction: exact UUID/Decimal checks; `logical_values()` revalidation; entry revalidates nested `EconomicIdentityId` + `FuturesConversionFactor`; parent revalidates basket IDs/evidence, exact `FuturesContractTerms`, each entry, PHYSICAL-only binding; explicit self-deliverable rejection; regression tests for corrupted factor/identity/terms/evidence and self-deliverable; docs state contract identity != eligible deliverable identity.

Adversarial focus: try to falsify R2, especially (1) any remaining reflective/nested corruption or subclass/type-confusion path; (2) A/B logical identity collision or omitted material basket/factor dimension; (3) canonical ordering/duplicate-identity defects; (4) valid-state rejection vs invalid-state acceptance around PHYSICAL/self-deliverable/Decimal canonicalization; (5) source/tests/docs contradictions or tautological tests; (6) accidental CTD, conversion-factor methodology, invoice/accrued, final-settlement, delivery-election, execution/settlement mutation, provider/market-data, risk/account, Production or real-capital authority.

Do not modify qore-core. If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`; otherwise report only minimal reproducible material findings with exact location/witness/correction.
