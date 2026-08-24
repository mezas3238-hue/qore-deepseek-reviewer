# UNR-017 R5 — DeepSeek Coder (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/coder-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R5-DS-CODER-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `b4fb665abce67f50aa703476325b9f13044998ab`; HEAD tree `86d4ec5197535a67f1ea0d2f2ab63ad0e8d563dd`; synthetic `36e574a4f381437ae55969573dfbc702c4895dcc` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +685/-0 (docs 49, source 297, tests 339). QORE CI #1403 (`32727691093`) SUCCESS.

Expert R5 result: `HALLAZGOS: NINGUNO / VALIDACIÓN OK`; IA disposition: PASS.

Target delta: Claude R4 found context-sensitive `Decimal.normalize()` causing high-precision A/B collapse, caller-context-dependent logical material, and extreme fixed-format expansion. R5 replaces only `_canonical_decimal()` with the sibling-certified `as_tuple()` algorithm: trim trailing zeros with exponent compensation, exact tuple reconstruction, deterministic fixed/compact selection. Regressions cover >28-digit non-collapse, `localcontext(prec=5)` invariance, and `1E+1000000` compactness. Prior R1-R4 deep-revalidation/exact-type protections remain unchanged.

Independently falsify closure, especially Decimal injectivity across equivalent/different encodings, context independence, fixed/scientific crossover collisions, extreme exponents/resource expansion, ordering effects, source-test-doc mismatch, regression of R1-R4 guards, or authority expansion. No CTD, conversion-factor methodology, invoice/accrued, final settlement/UNR-018, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.
