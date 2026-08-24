# QORE / PROGRAM D / UMI-14 — UNR-015 R1 — DeepSeek Coder

You are **DeepSeek Coder**, the second external auditor in the strict serial QORE Full Closure chain.

This task is permitted only because DeepSeek Expert completed package `UNR015-ETAPAC-R1-DS-EXPERT-01` on the exact frozen binding and IA independently adjudicated the report as clean.

Do not trust green CI, the Expert conclusion, or the IA conclusion as semantic proof. Perform an independent repository-focused adversarial review.

## Immutable package

- Repository: `mezas3238-hue/qore-core`
- PR: `#399`
- Tracker: `#398`
- Target: `UMI13-UNR-015` — Contracts for Difference
- Package ID: `UNR015-ETAPAC-R1-DS-CODER-01`
- BASE: `59767ac2fccd1ee6db0a199800e55d6e0c6f0ba2`
- BASE TREE: `38ef8a4908aa63aab1da57cef557dc475f0a6a03`
- HEAD: `30abee953f679b3fcda7e119fab8c3a0573c1971`
- HEAD TREE: `717f8a8050160027bea313a6f6d6af81294167e4`
- SYNTHETIC: `4595046b78aaddc4249f96e9ed49f121d6acd93a`
- SYNTHETIC TREE: `717f8a8050160027bea313a6f6d6af81294167e4`
- synthetic ordered parents: BASE then HEAD
- QORE CI #1377: success, Ruff PASS, Mypy PASS, 3958 pytest PASS / 6 warnings

Exactly three additive qore-core files are authorized:
1. `src/qore/infrastructure/cfd_contract_qualification.py`
2. `tests/infrastructure/test_cfd_contract_qualification.py`
3. `docs/architecture/QORE-UMI14-CFD-CONTRACT-QUALIFICATION-001.md`

Frozen blobs:
- source: `4aefb2c68c4b16850b468fc74353f6d74b341610`
- tests: `be6f0cf8cf8edc7ed587670a05eb3698bf91121b`
- architecture: `ab63e68c7e2886b018844170efd38f89536fba80`

## Prior-stage evidence you must verify, not trust

DeepSeek Expert package `UNR015-ETAPAC-R1-DS-EXPERT-01` accepted this exact binding and reported `VALIDACIÓN OK / HALLAZGOS: NINGUNO`.

IA adjudication review `5005990361` independently accepted the Expert result and concluded that no qore-core mutation is required. It specifically judged the Expert note about imported wrapper validation error classes as non-material because failure remains fail-closed.

## Architecture to falsify

UNR-015 must remain bounded D04 qualification/composition only:
- no universal standalone CFD economic owner;
- reuse UMI-02 identity/family authority;
- reuse UMI-05 forward/fixing/settlement authority;
- reuse certified FX pair/quote authority for rolling spot;
- bounded forward-form price-determination binding only when economic vs fixing reference differ;
- bounded rolling-spot contract period + automatic rollover + party termination markers;
- a single price-determination binding has no ordinal precedence semantics.

It must not own D05 observation, D06 runtime time evaluation, D07 valuation/PnL, D08/D09 account/risk/margin, D10 execution, D11 settlement mutation, D22 legal/regulatory, provider capability, Production, or real capital.

## Required repository-focused review

1. Verify live PR metadata, exact BASE/HEAD/synthetic binding, tree equality, ordered parents, exact changed-file set and blobs, and exact CI evidence.
2. Read all three changed files completely and inspect every imported surrounding contract used in validation/logical projection.
3. Search for repository-level collisions or duplicate authorities: existing CFD, rolling-spot, price-determination, automatic-rollover, party-termination, FX quote, forward/fixing semantics. Show whether this lane duplicates or narrows certified owners.
4. Falsify the composition boundary with malformed/fabricated/corrupted imported child values, including exact types, nested UUIDs, Decimal, dates vs datetime, aware timestamps, enum/code wrappers, relationship endpoints/code/evidence, settlement convention, FX pair and tenor.
5. Independently challenge the correction `binding.ordinal is not None -> reject`. A finding requires a concrete valid bounded single-binding contract where an ordinal is materially required.
6. Independently challenge same-reference/no-binding and distinct-reference/exact-binding behavior. Look for valid in-scope states incorrectly rejected and invalid states accepted.
7. Independently challenge the absence of a universal complete-fixing-day coverage law. Do not invent D06 authority.
8. Challenge rolling-spot semantics: pair/quotation direction, contract period, CFD-vs-pair identity, auto-roll and termination markers, and whether any material bounded lifecycle distinction collapses.
9. Audit `logical_values()` for deterministic identity completeness and post-construction corruption resistance.
10. Audit tests for tautology, fixture symmetry, false confidence, missing regression oracle, or negative-space gaps. CI success alone is not enough.
11. Audit docs against actual source behavior and non-claims.
12. Search for hidden operational authority: network, file IO, wall clock, random UUID, retry/scheduler/thread/subprocess, provider credentials, order/settlement/risk/valuation behavior.

## Finding bar

For each material finding provide stable ID, severity, exact location, concrete valid witness or invalid accepted state, authority owner, minimal bounded correction, and whether HEAD mutation is required.

Do not report style, optional extra coverage, generic future functionality, or downstream capabilities as material defects.

## Required output

Begin exactly:

`REVISOR: DEEPSEEK CODER`

`PACKAGE ID: UNR015-ETAPAC-R1-DS-CODER-01`

`VINCULACIÓN ACEPTADA: SÍ/NO`

`RESULTADO GENERAL: VALIDACIÓN OK / HALLAZGOS`

Then provide binding verification, repository/code review, adversarial results, findings if any, negative-space assessment and final result.

If clean, explicitly write:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

Do not modify qore-core. Do not authorize Ready, merge, #398 closure, UMI-14/Program-D closure, Production or real capital.