# QORE UMI14 / UMI12 final owner-universe recertification — DeepSeek Expert R4

Role: independent adversarial EXPERT reviewer. Review the exact frozen qore-core candidate only. Do not infer approval from CI or prior reviews. Use the available completion budget adaptively; stop naturally when coverage is sufficient rather than trying to consume the ceiling.

## Immutable binding
- PR: #461
- Issue: #458 `QORE-UMI14-CORR-UMI12-001 — Final cross-asset owner-universe recertification`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `9f6b904556dbded2d606c7298470f2f0b0cc84e1`
- SYNTHETIC: `d10c941568b1cf5385daeca2f11ae5b3bbe14205`
- TREE: `9f21b3434c0f3302a1b871f60cdf2c3db98574db`
- QORE CI: #1488 / run `32925721002` / job `98048097082` SUCCESS
  - Ruff: all checks passed
  - Mypy: 681 source files, no issues
  - Pytest: 4369 passed, 6 historical warnings
  - Coverage: 87%
- Diff BASE→HEAD: 3 files, +1005/-28, 12 commits ahead/0 behind, `src/ delta = 0`

Changed files only:
1. `docs/architecture/QORE-UMI-12-FINAL-OWNER-UNIVERSE-RECERTIFICATION-001.md`
2. `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_guards.py`
3. `tests/infrastructure/test_universal_cross_asset_conformance_full_closure_guards.py`
Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is intentionally unchanged.

## Contract to falsify
#458 requires final CURRENT D04 owner/qualification recertification: complete current semantic-owner surface from source/tests/docs; all 19 Program-D families bind through UMI-02 without provider/listing-symbol laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT remain semantically distinct; generic/product ownership directionality remains correct; Sukuk/Shari'ah and ILS/event-contract owners remain distinct; SFT contractual terms do not become current Position/Risk/Collateral-state authority; SCF/Advanced-Payable direction remains correct; provider/SDK/runtime/network/execution authority is statically excluded; evidence deterministic/immutable/secret-free. No provider support, valuation/execution, Production or real-capital claim.

Current D04 discovery is deliberately bounded to established `*_semantics.py`, `*_qualification.py`, plus six audited legacy owners. `dataset_integrity_qualification` is explicitly non-D04. Do not broaden #458 into an allowlist of every arbitrary infrastructure module unless you can prove a current D04 source/architecture convention requiring that.

## Prior rounds — independently reverify, do not defer
Expert R1 accepted/fixed:
1. future `*_qualification.py` owners were not fail-closed discovered;
2. dynamic import/code-execution escaped ordinary import scans;
3. SFT current-state guard was exact-name-only.

Expert R2 adjudication:
- ACCEPTED/FIXED H1: `builtins.eval/exec/__import__`, direct builtins aliases, `getattr`, `__builtins__` lookup shapes escaped scanner.
- ACCEPTED/FIXED H2: relative imports were not normalized before reverse-dependency checks.
- REJECTED H3 as outside bounded #458 contract: arbitrary non-conventional `future_d04_owner.py` does not make every infrastructure file a D04 candidate.
- ACCEPTED/FIXED H4: symbol-laundering test was tautological; exact `EconomicIdentity` dataclass field surface is now frozen.

Expert R3 accepted/fixed:
1. dangerous callable rebinding escaped call-site scanning: e.g. `f = eval; f(...)` and `import builtins; f = builtins.eval; f(...)`. Final scanner now propagates dangerous bindings through `Assign`, `AnnAssign`, `NamedExpr`, including direct/transitive aliases plus builtins/getattr/__builtins__ sources, with fixed synthetic regression witnesses.
2. historical provider/runtime exclusion helpers ignored `from . import provider_runtime` because `ImportFrom.module is None`. Final recertification now independently resolves relative imports across every current D04 owner and the unchanged oracle, then applies provider/runtime/network exclusions; fixed regression covers `from . import provider_runtime` and `from . import execution_boundary`.

Implementation note: first R3-hardening CI #1487 had Ruff+Mypy green but one new synthetic regression assertion was overbroad because the resolver also returns the base package `qore.infrastructure`. The assertion was narrowed to the two concrete forbidden resolved imports without weakening the actual final guard. Authoritative CI #1488 on HEAD `9f6b904...` is fully green.

## Adversarial focus
Try to construct accepted-invalid witnesses, especially:
- dynamic execution/import indirection after R3: direct/transitive callable aliases, annotated assignment, named expressions, tuple/list assignment shapes, builtins aliases, direct imported aliases, `getattr`, `__builtins__`, and other simple AST-equivalent rebindings; distinguish a real bounded bypass from a demand for full arbitrary Python data-flow analysis;
- whether alias propagation can miss a constructible simple binding/call form or produce false confidence due to AST walk/order/fixed-point behavior;
- relative import normalization for both `from .x import Y` and `from . import X`, including provider/runtime/network exclusions, generic→product reverse dependencies and collision/directionality checks;
- whether the final normalized provider/runtime guard genuinely closes the historical-helper bypass for all current owners and oracle;
- exact `EconomicIdentity` schema anti-laundering under the current UMI-02 contract;
- current 35-owner set under actual D04 suffix/legacy conventions and the bounded rationale rejecting R2-H3;
- SFT static contractual terms vs current account/balance/exposure/inventory/position/Risk/state authority;
- generic/product directionality; rainbow option composition; Sukuk/Shari'ah; ILS/event contracts; SCF/Advanced Payable;
- historical carry-forward oracle unchanged, no facsimile semantic owners or operational helper authority;
- deterministic/immutable/secret-free posture and `src/ delta = 0`.

Do not demand provider/valuation/execution/Production capability excluded by #458.

## Required output
Every material finding must include: severity; file/symbol; minimal constructible witness/reproduction; ACTUAL; EXPECTED; violated #458/architecture contract; impact; smallest safe fix. Distinguish candidate defects from speculative future hardening. A clean review still requires concrete coverage, not absence of findings.

End with exactly one:
- `HALLAZGOS: NINGUNO / VALIDACIÓN OK`
- `HALLAZGOS: <n> / VALIDACIÓN NO OK`
- `EVIDENCIA INSUFICIENTE / VALIDACIÓN BLOQUEADA`
