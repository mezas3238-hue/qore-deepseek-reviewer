# DeepSeek Expert R89 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout, CPython 3.12 behavior, and reproduced evidence are authoritative. Do not inherit R88, R87, R86, Coder, or Claude verdicts.

## Exact candidate freeze
- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `1f3b3ebd4503932a72a54760201f3d8f12c837f5`, tree `52058e73da5a6c17c39285d2820665ac632a6055`.
- SYNTHETIC `1bafcb0f4328522763263c9034f05eaf950cc8aa`; parents MUST be BASE then HEAD; tree MUST equal HEAD tree.
- R62G target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`, blob `c65f64ef6e922812e2242890281c1610477e645b`.
- R62N target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`, blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Compare BASE→HEAD: 272 commits ahead, 0 behind, merge-base BASE; docs/tests-only recertification, `src/qore` delta zero.
- Required exact-head QORE CI is run `33258694413` / job `99116776968`. It MUST be completed SUCCESS before this review is adjudicated. The reviewer infrastructure must attach live job metadata and raw log evidence for synthetic checkout, Ruff, Mypy and full Pytest+coverage. Fail mechanically if the bound job is not exact and green.

## Why R88 invalidated the previous freeze
R88 was mechanically valid on old HEAD `7d166097...` and found `R88-FP-R62G-01`: `import builtins; builtins["eval"](...)` was marked dangerous although CPython rejects subscripting the builtins module before dynamic execution. That old freeze is obsolete.

Independent CPython 3.12 adjudication also established an important boundary that R88's prose overgeneralized:
- `import builtins; builtins["eval"](...)` => `TypeError`, safe mapping misuse.
- `builtins.get(...)` / `builtins.__getitem__(...)` => `AttributeError`, safe mapping misuse.
- operator.getitem/itemgetter applied to the builtins MODULE likewise fail before eval.
- `__builtins__["eval"](...)` in the actual exec/import module contexts used by these tests => `__builtins__` is a dict and result is 2; this MUST remain dangerous.
- `builtins.__dict__["eval"](...)` and `vars(builtins)["eval"](...)` => result 2; MUST remain dangerous.
- `builtins.eval(...)` and `getattr(builtins, "eval")(...)` are valid module attribute access and MUST remain dangerous.

## Corrected R62G model to falsify
The current R62G scanner introduces an explicit builtins-module abstract kind, distinct from a builtins mapping. Explicit `import builtins` and aliases preserve module identity. Mapping-only operations on the module (`[]`, `.get`, `.__getitem__`, operator.getitem/itemgetter) must not invent dangerous calls. Real mappings (`builtins.__dict__`, `vars(builtins)`, module `__builtins__`, selected namespace mappings) must remain fail-closed. Direct/getattr attribute access on the module must remain dangerous. Unbound bare `builtins` must not be treated as implicitly imported.

Attack this distinction with NEW safe/danger inversions: import aliases, assignment aliases, branch joins, tuple/list/container transport, attributes then mapping conversions, direct and aliased operator helpers, `.get`, `.__getitem__`, itemgetter, getattr/attrgetter, vars, `__dict__`, globals/locals selected slots, functions/classes/comprehensions/defaults, shadowing/deletion/rebinding, BoolOp/IfExp/NamedExpr, with/for/try/TryStar, and direct/indirect eval/exec/__import__. Compare actual CPython reachability/result with both R62G and current final R62N scanner output. A constructible runtime-dangerous path with no call marker is material. A deterministic safe path marked dangerous is material when exactness applies and a bounded sound correction exists.

Do not weaken the fail-closed boundary merely to remove conservative signals when runtime type/state is genuinely ambiguous. Distinguish deterministic safe module misuse from a union that may be a real mapping.

## Preserve R62N and final-owner closure
Independently verify the repaired R62N exception/TryStar model remains sound: plain exceptions, matching/nonmatching `except*`, sibling sequencing, bare re-raise, pending new exceptions, regrouping after siblings, outer ordinary/star handlers, finally, and no invented normal successor for unmatched exception flow.

Also verify bindings/blobs, no staging artifacts, `src/qore=0`, current complete D04 owner/qualification universe, all 19 Program-D families UMI-02-bound, provider/listing vs economic identity separation, RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening, generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT state/terms and SCF/Advanced-Payable collision boundaries, provider/runtime/network/dynamic-execution exclusions, deterministic immutable secret-free specimens, and historical full-closure oracle unchanged.

No provider support, execution, valuation methodology, operational readiness, Production or real-capital claim is authorized.

For every surviving material finding provide stable ID/severity, exact location, minimal witness, runtime result/scanner output, violated invariant, owner class and smallest bounded correction. If binding/CI is mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
