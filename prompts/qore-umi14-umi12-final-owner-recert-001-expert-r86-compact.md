# DeepSeek Expert R86 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout, CPython behavior, and reproduced evidence are authoritative. Do not inherit any prior CLEAN verdict.

## Exact freeze
- Core `mezas3238-hue/qore-core`, PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `858510a806eb20745924101bd506cfeac94daa7b`, tree `cb5cfafae7834f01ab29dbbe795c4d851493c4e7`
- SYNTHETIC `1b32727358ad697f6ea5f527e3fce039209f842d`; parents MUST be BASE then HEAD; tree MUST equal HEAD tree.
- R62N target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`, blob `e6f0753df44b2f1777859b12fb5a840e13e296ba`.
- Immutable oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Diff: 252 commits ahead, 0 behind, 116 files, docs/tests only, `src/qore` delta zero.
- Exact required `quality` run `33252669215`, job `99100940207`: Ruff PASS; Mypy PASS on 740 files; Pytest 4854 passed, 7 warnings; TOTAL 47568 statements / 6234 missed = 87%.

Additional independent no-model evidence on this freeze/family: isolated permanent R62N suite 34/34 PASS; clean mixed-pending matrix 10/10 PASS; canonical broad matrix has no new material failure and only documented conservative fingerprints; exact UMI final-owner/full-closure audit 14/14 PASS with oracle intact and src/qore=0. Treat this as evidence to falsify, not as certification.

## Priority falsification
The repaired R62N semantics must match CPython for sequential `except*` handlers: sibling handlers share namespace effects; `finally` observes the completed handler chain; newly raised handler exceptions remain pending while later siblings execute; bare `raise` repropagates the active subgroup; mixed re-raised subgroup + new exception is regrouped only after all sibling handlers and must preserve the final namespace and outer `except`/`except*` type routing.

Construct NEW dangerous/safe inversions around those rules, including handler order, three siblings, mixed pending exceptions, outer ordinary handlers, outer `except*`, nested finally, nested TryStar, subgroup remainder, explicit raise vs bare raise, BaseExceptionGroup/ExceptionGroup routing, partial star imports, loops/control flow, imports, with, BoolOp/IfExp, comprehensions, returns, lexical/deferred scopes, namespace derivations and direct/indirect eval/exec/__import__ routes. Compare real CPython reachability/result to exact scanner markers. A constructible runtime-dangerous path producing no call marker is material. A deterministic safe path marked dangerous is material only if the contract requires exactness and a bounded sound correction exists.

Known conservative fingerprints that are not automatically defects: unavailable import before builtin alias; with-exit raise preserving unreachable successor; statically short-circuited BoolOp/unselected IfExp binding evidence; handler-target cleanup; unknown external star-import ordering/typing. Challenge whether they mask FNs.

## UMI closure
Independently verify exact blobs/bindings, no staging artifacts, src/qore=0, explicit/live 35-owner D04 universe, all 19 Program-D families UMI-02-bound, provider/listing vs economic identity separation, anti-flattening of RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT, generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT state/terms and SCF/Advanced-Payable boundaries, and provider/runtime/network/dynamic-execution exclusions. No Production/provider/valuation/execution/real-capital readiness may be inferred.

For every surviving material finding provide stable ID/severity, exact location, minimal witness, runtime result/scanner output, violated invariant, VALID/INVALID, owner class and smallest bounded correction. If binding is mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
