# UNR-017 R2 — DeepSeek Coder (compact)

Apply `prompts/shared/qore-review-contract.md` + `prompts/shared/coder-common.md`.

Binding: `mezas3238-hue/qore-core` PR #439; package `UNR017-ETAPAC-R2-DS-CODER-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `ba11341c76b43436f3ef9f906a4cfe568614975c`; synthetic `d8afcda7250cc6bcf96c1f94e494b4e4b5931461`; HEAD tree `cf76d9dcce2bfa7598fe11e8e5b2136643b261fb`. Frozen delta: 3 added files, +426/-0; QORE CI #1393 green.

Target: bounded D04 futures deliverable-basket + contract-defined conversion-factor semantics; UNR-018 final settlement stays separate.

History: Expert R1 found nested reflective-corruption fail-open; IA accepted MATERIAL. R2 now exact-types/revalidates nested identity/factor, basket ID/evidence and `FuturesContractTerms`; adds corruption regressions + self-deliverable oracle/doc. Expert R2 returned `HALLAZGOS: NINGUNO / VALIDACIÓN OK`; IA independently ACCEPTED and authorized Coder R2.

Independently falsify implementation/tests/docs: remaining nested/type fail-open, logical collisions, canonical/duplicate defects, valid-state rejection, omitted materiality, doc/test mismatch, unnecessary correction scope, or authority leak into CTD/valuation/final settlement/execution/provider/Risk/Production. Do not modify qore-core.

If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`; otherwise only material bounded findings with concrete witness + minimal correction.