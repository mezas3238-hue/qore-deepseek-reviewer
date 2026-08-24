# UNR-017 R6 — DeepSeek Coder (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/coder-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R6-DS-CODER-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `3d974e472531cee4625358093aa5eb16557ff5ec`; HEAD tree `ae0a51ae5df00a7730f97d20be0fcc0226601bdb`; synthetic `cdf74e48518cb7ec8738c452ba6b4de1b3864a57` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +818/-0 (docs 49, source 331, tests 438). QORE CI #1408 (`32731600152`) SUCCESS.

Actual Expert R6 result: `HALLAZGOS: NINGUNO / VALIDACIÓN OK`. IA ACCEPTED/PASS on this exact freeze. R6 closes the R5 inherited Decimal-determinism finding locally: UMI-05 remains untouched; `_futures_terms_logical_values()` preserves the exact 13-field futures material layout but replaces only multiplier/tick Decimal text with the context-independent compact canonicalizer. Prior R1-R5 deep-revalidation/exact-type/canonical-factor protections remain.

Independently falsify implementation/tests/docs. Focus on 13-field parity and optional tick paths; numerical equivalence vs textual drift; >28-digit A/B collisions; ambient Decimal context; fixed/scientific crossover and extreme exponents; hidden wrapper/leaf corruption or subclass leakage; ordering/duplicate/self-deliverable semantics; whether composition-local projection accidentally forks UMI-05 semantics beyond the two Decimal leaves. No CTD, conversion-factor methodology, invoice/accrued, final settlement/UNR-018, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.