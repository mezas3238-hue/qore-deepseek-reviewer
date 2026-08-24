# UNR-017 R3 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/expert-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R3-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `92829f26750a71b3e9377a08a737b761dc391bfb`; HEAD tree `7487e0eb36a4f4adfff98cdf8a93fb3bbdc8a2ca`; synthetic `b94009e2112e010f5e5abf9862909b2ace410eb8` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +533/-0 (docs 49, source 250, tests 234). QORE CI #1396 (`32722231295`) SUCCESS: Ruff/Mypy/Pytest green.

Scope: bounded D04 static futures deliverable basket + contract-defined conversion factor; exact UMI-05 `FuturesContractTerms` + UMI-02 `EconomicIdentityId`; UNR-018 final settlement remains separate.

History: R1 fixed basket-local nested corruption. R2 later Expert + Coder independently found one material residual: `FuturesContractTerms.__post_init__()` did not revalidate nested leaves, allowing reflective corruption into UNR-017 logical material. R3 adds `_revalidate_futures_terms()` in the new composer only: canonical revalidation of terms ID, three identities, contract month, multiplier + unit identity, evidence, optional tick + value identity; exact wrapper checks at composition boundary. New regressions cover corrupted nested futures identity, terms ID, evidence and multiplier. Docs now state this exact boundary.

Adversarially falsify R3, especially residual transitive corruption (multiplier unit identity, contract month, optional tick/value identity), subclass/type leakage, valid-state rejection, A/B logical collisions, canonical ordering/duplicates, docs-source-test mismatch, or authority expansion. No CTD, conversion-factor methodology, invoice/accrued, final settlement, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with concrete witness and minimal correction.