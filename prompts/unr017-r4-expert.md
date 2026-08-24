# UNR-017 R4 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/expert-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R4-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `c48763db5303fd3956c2bab42b5613bb0014fdb4`; HEAD tree `86ba5255aad5f258dc34ec562be1a89ae3c91fef`; synthetic `fe3c0db78d40e51437ddc156e083777b0adee725` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +644/-0: docs 49, source 277, tests 318. QORE CI #1400 (`32723945958`) SUCCESS: Ruff/Mypy/Pytest green.

Scope: bounded D04 static futures deliverable basket + contract-defined conversion factor; reuse UMI-05 `FuturesContractTerms` + UMI-02 `EconomicIdentityId`; UNR-018 final settlement remains separate.

History: R1 closed basket-local nested corruption; R2 closed deep `FuturesContractTerms` leaf corruption. R3 late Expert found a concrete UUID-subclass logical collision because reused UMI-02/05 primitive validators accept subclasses. IA accepted MATERIAL. R4 adds exact primitive UUID/Decimal guards only at the UNR-017 composition boundary, reuses the hardened identity validator for entries/composed terms, and adds adversarial regressions for colliding UUID plus multiplier/tick Decimal subclasses. No UMI-02/05 modification.

Falsify R4: seek remaining wrapper/primitive subclass leakage (including evidence/identity/unit/value leaves), A/B logical collisions, transitive corruption, invalid accepted/valid rejected states, canonical ordering/duplicates defects, docs/source/test mismatch, or authority expansion. No CTD, conversion-factor methodology, invoice/accrued, final settlement, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.