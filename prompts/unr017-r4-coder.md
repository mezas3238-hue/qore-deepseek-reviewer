# UNR-017 R4 — DeepSeek Coder (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/coder-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439, tracker #438; package `UNR017-ETAPAC-R4-DS-CODER-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `c48763db5303fd3956c2bab42b5613bb0014fdb4`; HEAD tree `86ba5255aad5f258dc34ec562be1a89ae3c91fef`; synthetic `fe3c0db78d40e51437ddc156e083777b0adee725` with parents BASE+HEAD and identical tree. Frozen surface: exactly 3 added files, +644/-0 (docs 49, source 277, tests 318). QORE CI #1400 (`32723945958`) SUCCESS: Ruff/Mypy/Pytest green.

Expert R4: `HALLAZGOS: NINGUNO / VALIDACIÓN OK`. IA independently ACCEPTED Expert R4: exact primitive guards close the R3 subclass collision; deep nested revalidation, canonical ordering, duplicate/self-deliverable rejection and identity+factor materiality remain coherent; no authority expansion.

Target delta: static D04 futures deliverable basket + contract-defined conversion-factor material only. R4 specifically hardens reused primitive leaves at the UNR-017 boundary: exact UUID for economic identities/terms/evidence, exact Decimal for multiplier/tick, plus adversarial UUID/Decimal subclass regressions.

Independently falsify implementation/test/doc closure. Focus on any residual primitive/wrapper subclass leakage, reflective corruption after construction, logical A/B collisions, canonical ordering/duplicate semantics, optional tick/multiplier unit identity paths, valid-state rejection, exception-boundary inconsistencies that hide fail-open behavior, or source-test-doc mismatch. No CTD, conversion-factor methodology, invoice/accrued, final settlement/UNR-018, delivery election, execution/provider/market-data/Risk/account/Production/real-capital authority. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Otherwise report only material bounded findings with a concrete witness and minimal correction.