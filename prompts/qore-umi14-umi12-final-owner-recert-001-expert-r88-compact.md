# DeepSeek Expert R88 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout, CPython 3.12 behavior, and reproduced evidence are authoritative. Do not inherit R87, R86, R84 or Claude C3 verdicts.

## Exact corrected freeze
- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `7d16609795e99052db66281749aefe406172f870`, tree `a028e374934a0587e6988bba08e3b4a04b1feaca`.
- SYNTHETIC `d55cee13735d1c50bb63cf43fb34e97385b8d138`; parents MUST be BASE then HEAD; tree MUST equal HEAD tree.
- R62N target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`, blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Compare BASE→HEAD: 269 commits ahead, 0 behind, merge-base BASE; docs/tests-only recertification, `src/qore` delta zero.
- Required exact-head QORE CI is run `33256530716` / job `99111137157`. It MUST be completed SUCCESS before this review is adjudicated. Reviewer v19 MUST attach live GitHub Actions job metadata and raw log lines for the bound job, including exact checkout, Ruff, Mypy, Pytest and coverage. Fail mechanically if this authoritative evidence is missing, mismatched or not green.

## R87 mechanical failure and correction
R87 did not issue a semantic verdict because the exact CI log was not present in its authoritative evidence bundle. That is not a Core finding and does not authorize inheriting any semantic conclusion. The reviewer infrastructure has now been corrected and independently no-model probed: live GitHub job metadata plus raw log lines for run `33256530716` / job `99111137157` were fetched successfully and showed HEAD `7d166097...`, synthetic checkout `d55cee...`, `All checks passed!`, Mypy success on 740 source files, 4858 collected/passed tests, 7 warnings and TOTAL coverage 87%. Re-check the attached evidence yourself.

## Why older clean reviews are invalid
R86 Expert and R84 Coder were clean on old HEAD `858510a...`, but Claude C3 subsequently found a valid CRITICAL `R62N-F1` on that old freeze. Those verdicts are obsolete for this HEAD.

C3 witness:
```python
b = eval
try:
    try:
        raise ValueError("v")
    except* TypeError:
        pass
except ValueError:
    result = b("1+1")
```
CPython propagates the plain `ValueError` through the nonmatching `except* TypeError`; outer `except ValueError` executes and result is 2. The old scanner could fabricate normal flow and miss the dynamic call.

## Corrected model to falsify
A known plain exception entering `TryStar` is represented as a logical singleton member for `except*` matching. This must simultaneously preserve:
1. nonmatching plain exception propagation to outer ordinary/`except*` handlers;
2. exact matching by a current or later sibling `except*`;
3. sibling namespace sequencing;
4. `finally` observing the completed sibling chain;
5. bare re-raise semantics;
6. newly raised handler exception pending semantics;
7. mixed re-raised subgroup + new exception regrouping only after siblings execute;
8. no invented reachable `normal` successor when a plain exception remains unmatched.

Independent no-model evidence on exact HEAD `7d166097...`: a six-case adversarial matrix passed the exact C3 witness, its safe inverse, direct matching safe/danger `finally`, and second-sibling matching safe/danger; then the permanent R62N suite passed 38/38. Treat this only as evidence to attack, not certification.

Construct NEW dangerous/safe inversions around plain exceptions and ExceptionGroup/BaseExceptionGroup: matching/nonmatching star handlers, tuples, subclass relations, later siblings, outer ordinary handlers, outer `except*`, nested Try/TryStar, `else`/`finally`, explicit raise vs bare raise, pending new exceptions, subgroup remainder, nested groups, control flow, with, imports, BoolOp/IfExp, comprehensions, lexical/deferred scopes and direct/indirect eval/exec/__import__ routes. Compare actual CPython reachability/result to scanner markers. A constructible runtime-dangerous path with no call marker is material. A deterministic safe path marked dangerous is material when the contract requires exactness and a bounded sound correction exists.

## UMI final-owner closure
Independently verify bindings/blobs, no staging artifacts, `src/qore=0`, current complete D04 owner/qualification universe, all 19 Program-D families UMI-02-bound, provider/listing vs economic identity separation, RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening, generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT state/terms and SCF/Advanced-Payable collision boundaries, provider/runtime/network/dynamic-execution exclusions, deterministic immutable secret-free specimens, and historical full-closure oracle unchanged.

No provider support, execution, valuation methodology, operational readiness, Production or real-capital claim is authorized.

For every surviving material finding provide stable ID/severity, exact location, minimal witness, runtime result/scanner output, violated invariant, owner class and smallest bounded correction. If binding/CI is mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
