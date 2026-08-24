# UNR-017 R5 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/expert-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R5-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `b4fb665abce67f50aa703476325b9f13044998ab`; HEAD tree `86d4ec5197535a67f1ea0d2f2ab63ad0e8d563dd`; synthetic `36e574a4f381437ae55969573dfbc702c4895dcc` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +685/-0 (docs 49, source 297, tests 339). QORE CI #1403 (`32727691093`) SUCCESS: Ruff/Mypy/Pytest green.

Scope: bounded D04 static futures deliverable basket + contract-defined conversion factor; exact UMI-05 `FuturesContractTerms` + UMI-02 `EconomicIdentityId`; UNR-018 final settlement remains separate.

History: R1 closed basket-local nested corruption; R2 closed deep reused futures-leaf corruption; R3/R4 closed UUID/Decimal subclass collisions. Final Claude review on R4 found one material residual: `_canonical_decimal()` used context-sensitive `Decimal.normalize()`, allowing >28-digit distinct exact factors to collide, the same stored factor to change logical projection under caller `localcontext`, and extreme exponents to expand fixed strings. IA reproduced and accepted it.

R5 only replaces `_canonical_decimal()` with the repository's certified sibling `as_tuple()`-based context-independent compact algorithm. New regressions require: high-precision factors do not collapse; ambient Decimal context cannot change logical material; `1E+1000000` remains compact. Docs state exact-tuple/context-independent compact canonicalization. No UMI-02/05 modification.

Adversarially falsify R5, especially Decimal edge cases: trailing zeros, tiny/huge exponents, high precision, context changes, scientific-vs-fixed equivalence, zero handling (while factor remains positive), collision/injectivity, ordering effects, resource growth, and any source/test/doc mismatch. Recheck prior exact-type/deep-revalidation guarantees only for regressions. No CTD, conversion-factor methodology, invoice/accrued, final settlement, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.
