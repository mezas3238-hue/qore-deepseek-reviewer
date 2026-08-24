# UNR-016 R2 — DeepSeek Coder (compact)

Apply `prompts/shared/qore-review-contract.md` and `prompts/shared/coder-common.md`.

Binding: repo `mezas3238-hue/qore-core`; PR #401; tracker #400; package `UNR016-ETAPAC-R2-DS-CODER-01`; BASE `40280e0574ae0e7ac6c9ff37afb7bbe314c6368a`; HEAD `3e2939a0ff489695200af11c2c47042d9da1bcf9`; synthetic `222e3b8cef3a52c214343958fc10dc11e9a88887`.

Actual Expert R2 outcome: binding accepted; `HALLAZGOS: NINGUNO`; `VALIDACIÓN OK`. Expert independently closed R1 finding `DS-EXPERT-UNR016-R1-01`: root↔specified-security canonical `EconomicIdentityId` self-reference is rejected, same-ID/different-projection is rejected, distinct-ID nested fund remains valid.

IA adjudication: review `5006581453`; ACCEPTED/CLEAN; no R3 required; correction bounded and no authority expansion.

Target delta: independently inspect implementation/tests/docs for missed implementation defects or regressions, with mandatory focus on root/component separation bypasses, duplicate/canonical-order behavior, post-construction fail-closed revalidation, A/B logical identity collisions, and accidental NAV/holdings/valuation/execution/settlement/provider/legal/Production authority. Do not repeat Expert narrative.

Do not modify qore-core. If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`. Production closed; real capital unauthorized.