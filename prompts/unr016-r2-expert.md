# QORE / PROGRAM D / UMI-14 — UNR-016 R2 — DeepSeek Expert

You are **DeepSeek Expert**, first external auditor in the serial QORE Full Closure chain for the corrected R2 candidate.

## Immutable binding

- Repository: `mezas3238-hue/qore-core`
- PR: `#401`
- Tracker: `#400`
- Target: `UMI13-UNR-016` — bounded US-style Unit Investment Trust qualification
- Package ID: `UNR016-ETAPAC-R2-DS-EXPERT-01`
- BASE: `40280e0574ae0e7ac6c9ff37afb7bbe314c6368a`
- BASE TREE: `717f8a8050160027bea313a6f6d6af81294167e4`
- HEAD: `3e2939a0ff489695200af11c2c47042d9da1bcf9`
- HEAD TREE: `67079bee6d5e86378d277113cbfad8c8b688c472`
- SYNTHETIC: `222e3b8cef3a52c214343958fc10dc11e9a88887`
- SYNTHETIC TREE: `67079bee6d5e86378d277113cbfad8c8b688c472`
- ordered synthetic parents: BASE then HEAD

Exactly four additive qore-core files are authorized:
1. `src/qore/infrastructure/uit_contract_qualification.py` — blob `2281cb7ad77981265b5c991eb3ed2315dd1b06e1`
2. `tests/infrastructure/test_uit_contract_qualification.py` — blob `7444a4c820873b37f7dabb3c1d8e28532b0c75b9`
3. `tests/infrastructure/test_uit_contract_qualification_r2.py` — blob `e8dc76b04791e6e57947d8464353895c6dc49642`
4. `docs/architecture/QORE-UMI14-UIT-CONTRACT-QUALIFICATION-001.md` — blob `a675fa8c8e03c5596d92516959d85e3f4ba25889`

QORE CI #1386 is green on the exact frozen candidate: Ruff PASS, Mypy PASS on 657 source files, Pytest 4014 PASS / 6 warnings, global coverage 87%, UIT owner 97%. Verify independently; CI is evidence, not semantic proof.

## R1 accepted finding and required R2 correction

R1 DeepSeek Expert found `DS-EXPERT-UNR016-R1-01`, independently adjudicated by IA as material: the qualifier rejected duplicate component IDs but allowed a specified-security component whose canonical UMI-02 `EconomicIdentityId` equaled the root `fund_identity.identity_id`, permitting self-reference.

R2 claims the minimal bounded correction:
- exact root identity reused as a specified security must be rejected;
- same canonical root `EconomicIdentityId` with a different family/evidence projection must still be rejected;
- a nested fund/security with a distinct canonical UMI-02 identity must remain valid;
- duplicate-component and deterministic caller-order laws remain intact;
- no new semantic/downstream authority is introduced.

Do not trust that claim. Falsify it.

## Authorized D04 scope

This is a bounded US-style UIT qualifier rooted on complete UMI-02 `EconomicIdentity`.

It may retain only static qualification material proved for this bounded form:
- complete fund economic identity;
- type-encoded redeemable-security semantic;
- type-encoded undivided-interest semantic;
- one or more contractually specified complete security identities;
- local evidence references;
- optional static contractual termination date.

It must preserve ETF+UIT coexistence and non-ETF UIT representability without modifying global `FundVehicleKind` or requiring a new universal fund taxonomy.

It must not own current NAV/valuation, current holdings/positions, quantity/weight/allocation unless universally proved, redemption execution, liquidation, settlement mutation, listing/provider support, legal/regulatory eligibility, Production or real capital.

## Mandatory adversarial falsification

Read all four files completely plus relevant imported UMI-02/UMI-06/UMI-09/UMI-10 definitions and live PR/CI metadata. Attempt concrete falsification rather than confirming prose.

1. **R1 finding closure** — construct the exact self-reference witness and same-ID/different-projection witness; both must now fail closed. Construct a distinct-ID nested fund witness; it must remain valid. Identify any bypass through ordering, evidence differences, fabricated state or post-construction mutation.
2. **Over-correction check** — prove or falsify that the new root/component guard rejects only canonical identity equality, not valid fund-of-funds or other distinct-ID specified securities.
3. **Owner/taxonomy collision** — determine whether this silently creates a second fund owner, narrows UMI-06, or should instead modify `FundVehicleKind`. Provide a concrete collision if so.
4. **ETF + UIT / non-ETF UIT** — attempt valid specimens of both; identify any hidden dependency that makes one unrepresentable.
5. **Specified-security completeness** — try to find a material static D04 distinction missing from the component carrier. Distinguish contractual specified security from current holding/quantity/weight/valuation.
6. **Ordering law** — components are canonicalized by economic identity ID because caller tuple order is treated as noise. Falsify with a valid bounded UIT where order itself changes contractual obligations and cannot be represented otherwise.
7. **Duplicates** — duplicate component economic identity IDs are rejected even with distinct local evidence. Try to show a valid bounded contract requiring the same economic identity multiple times as distinct static components, and explain what D04 material distinguishes them.
8. **Termination date** — verify optional exact `date` is sufficient for proved static termination material and does not invent runtime/lifecycle authority. Show a concrete missing static dimension if material.
9. **Exact type / malformed state** — attack UUID subclasses, nested UUID corruption, fabricated objects, corrupted `EconomicIdentity`, family wrappers, local evidence refs, components, tuple state, root/component ID state, and post-construction corruption. Every local `logical_values()` should fail closed after corruption.
10. **Imported wrapper validation** — assess whether invoking imported `IdentityFamilyCode.__post_init__` can leak a native imported exception class. This is acceptable only if state remains fail-closed and there is no stronger local error-contract requirement.
11. **Logical identity collisions** — construct concrete A/B specimens across qualification ID, complete root identity/evidence, specified component identity/evidence/family/construction, component set, termination date, and local evidence. No material retained distinction may collapse; caller order alone should not split identity.
12. **Negative authority** — inspect AST/source for hidden wall clock/random/network/I/O/NAV/current holdings/execution/settlement/provider/legal authority.
13. **Tests/docs/source correspondence** — identify tautological tests, missing material regression oracles, stale R1 claims or documentation overclaims.
14. **Coverage misses** — coverage percentage alone is not a finding. Inspect remaining defensive branches semantically and report only concrete reachable material defects.

## Finding bar

For every material finding provide stable ID `DS-EXPERT-UNR016-R2-XX`, severity, exact location, concrete valid rejected/invalid accepted A-B witness, correct departmental owner, minimal bounded correction, and whether HEAD mutation is required. Do not report style preferences or downstream optional features.

## Required output

Begin exactly:

`REVISOR: DEEPSEEK EXPERT`

`PACKAGE ID: UNR016-ETAPAC-R2-DS-EXPERT-01`

`VINCULACIÓN ACEPTADA: SÍ/NO`

`RESULTADO GENERAL: VALIDACIÓN OK / HALLAZGOS`

Then give binding evidence, files/imported definitions inspected, explicit R1-finding closure result, adversarial results, findings if any, authority/negative-space assessment and final result.

If clean, explicitly write:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

Do not modify qore-core. Do not authorize Ready, merge, #400 closure, UMI-14/Program-D closure, Production or real capital.