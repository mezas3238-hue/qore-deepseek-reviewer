# UNR-017 R6 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/expert-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R6-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `3d974e472531cee4625358093aa5eb16557ff5ec`; HEAD tree `ae0a51ae5df00a7730f97d20be0fcc0226601bdb`; synthetic `cdf74e48518cb7ec8738c452ba6b4de1b3864a57` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +818/-0 (docs 49, source 331, tests 438). QORE CI #1408 (`32731600152`) SUCCESS: Ruff/Mypy/Pytest green.

Scope: bounded D04 static futures deliverable basket + contract-defined conversion factor. Reuses exact UMI-05 `FuturesContractTerms` + UMI-02 `EconomicIdentityId`; UNR-018 final settlement remains separate.

History relevant to R6 only: R5 fixed conversion-factor Decimal canonicalization. R5 Coder then exposed that composed UMI-05 `multiplier`/optional `tick_value` logical strings still use ambient-context `Decimal.normalize()`. IA accepted this as material because #438 requires the emitted basket material itself to be deterministic. R6 leaves UMI-05 untouched and adds a composition-local `_futures_terms_logical_values()` that preserves the exact 13-field UMI-05 futures layout/validators while replacing only multiplier/tick Decimal text with the certified context-independent compact `_canonical_decimal()`.

Regressions prove: semantic field-layout parity with UMI-05 for normal values (allowing canonical Decimal text to differ while preserving exact numeric value/unit identity); high-precision multiplier A/B no-collapse; multiplier+tick invariance under `localcontext`; compact extreme exponents. All R1-R5 fail-closed/type/subclass regressions remain.

Adversarially falsify R6, especially:
- exact 13-field structural parity with `FuturesContractTerms.logical_values()`; no omitted/reordered/material field;
- high-precision multiplier/tick A/B collisions;
- ambient Decimal-context dependence anywhere in emitted basket material;
- extreme-exponent expansion/resource risk;
- semantic drift between local projection and UMI-05 validity/identity fields;
- residual reflective/subclass/type leakage from prior rounds;
- valid-state rejection, canonical ordering/duplicates/self-deliverable;
- docs/source/test mismatch or accidental authority duplication/expansion.

No CTD selection, conversion-factor methodology, invoice/accrued, final settlement, delivery election, execution/settlement mutation, provider/market-data, Risk/account, Production or real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.