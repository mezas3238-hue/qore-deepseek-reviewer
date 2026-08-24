# UNR-017 R1 — DeepSeek Expert (compact)

Apply `prompts/shared/qore-review-contract.md` and `prompts/shared/expert-common.md`.

Binding: repo `mezas3238-hue/qore-core`; PR #439; tracker #438; package `UNR017-ETAPAC-R1-DS-EXPERT-01`; BASE `72716234db4638fd4293dcaf4c66e36e28cf8541`; HEAD `eb98fed1c91df96b64032d592197f02599385573`; HEAD tree `d80e7a7ac676f8f28c2e3dea9d630f7fb8319e8c`; synthetic `899e0258b601eb92afcedd956df00a10f6810376` = SHA1(BASE+'\n'+HEAD+'\n'+HEAD_TREE).

Frozen surface: exactly 3 added files / +370 -0: docs 47, source 167, tests 156. QORE CI run #1389 (`32717039038`) SUCCESS: Ruff/Mypy/Pytest all green.

Target: bounded D04 futures deliverable-basket / conversion-factor semantics. Reuse certified UMI-05 `FuturesContractTerms` and UMI-02 `EconomicIdentityId`; no generic futures duplication.

Adversarial focus only: (1) conversion factor must be contractual identity material, finite/positive and not valuation methodology; (2) duplicate deliverable identities, canonical ordering and A/B logical identity collisions; (3) PHYSICAL-only basket binding and self-deliverable rejection; (4) exact/nested-state fail-closed behavior including reflective corruption; (5) source/tests/docs consistency; (6) no CTD selection, invoice/accrued calculation, final-settlement algorithm (UNR-018), delivery election, execution, settlement mutation, provider/market-data, risk/account, Production or real-capital authority.

Do not modify qore-core. If clean: `HALLAZGOS: NINGUNO` + `VALIDACIÓN OK`; otherwise give minimal reproducible material findings.