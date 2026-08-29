# DeepSeek Expert R89 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout, CPython 3.12 behavior, and reproduced evidence are authoritative. Do not inherit R88 or any earlier Expert/Coder/Claude verdict.

## Exact corrected freeze
- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `476a93cdd08a064d0b99a139cd1b49287b937f21`, tree `5e2b37b23b01fe23fd373d39b01573e9607a73ad`.
- HEAD is an intentional no-op commit over `558b3868620375df917891c4202eae695d1c9eba`; parent tree and HEAD tree are byte-identical. It exists only to obtain the native protected `quality` check after the prior cleanup commit was authored by GitHub Actions and produced `action_required` without jobs.
- SYNTHETIC `871def531b0f1222e6a1e61252af700f4ed204e3`; parents MUST be BASE then HEAD; tree MUST equal HEAD tree.
- R62G target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`, blob `bcc95c5b8c57cee26f0a5680dba5fd1399e08ef0`.
- R62N target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`, blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Compare BASE→HEAD: 277 commits ahead, 0 behind, merge-base BASE; docs/tests-only recertification, `src/qore` delta zero.
- Required native exact-head QORE CI is run `33260165867` / job `99120615940`. It MUST be completed SUCCESS before this review is adjudicated. Attach live GitHub Actions job metadata and raw log lines for exact checkout, Ruff, Mypy, Pytest and coverage. Fail mechanically if authoritative evidence is missing, mismatched or not green.

## R88 material finding and bounded correction
R88 was not clean. Its surviving material finding was a deterministic R62G false positive: an explicitly imported Python `builtins` object is a module, not a mapping. Forms such as `import builtins; builtins["eval"]("1+1")` fail before dynamic execution and must not receive a `call:` marker.

The correction deliberately does NOT generalize this to `__builtins__` or real mappings. `builtins.__dict__`, `vars(builtins)`, and module/exec contexts where `__builtins__` is mapping-like remain fail-closed and must preserve dangerous-call detection.

The repair also closes transported module values, including tuple/list selection and aliases, so these module-mapping misuse routes do not invent execution while true mapping routes still do:
- `(builtins,)[0]["eval"](...)`
- `[builtins][0]["eval"](...)`
- `holder=(builtins,); b=holder[0]; b["eval"](...)`
- `.get` / `.__getitem__`
- `operator.getitem` / `operator.itemgetter`

Do not treat `binding:` provenance as equivalent to executed `call:`. Binding an actual builtins-module value to an alias is factual provenance; a safe module-mapping misuse is a material FP only if the scanner claims the unreachable dangerous call (or otherwise violates the documented guard contract). Conversely, any executable mapping route without detection is material.

Independent no-model exact-tree evidence to attack rather than trust:
- exact R62G + R62N targeted run passed 51 tests / 1 warning on the byte-identical tree;
- six safe module-misuse cases produced no `call:` marker and CPython raised TypeError/AttributeError;
- six real mapping cases executed to result 2 and produced `call:` markers;
- full exact-tree QG independently ran Ruff and Mypy green, with Pytest/coverage additionally required to be green in the authoritative native run above.

Falsify the type/value distinction aggressively: direct and transported module values, nested containers, unpacking, aliases, if/boolean unions, comprehension/deferred scopes, attributes, `__dict__`, `vars`, `getattr`, `operator` helpers, real dict/mapping carriers, `__builtins__` module-vs-dict contexts, custom objects, exception/control-flow sequencing, and direct/indirect eval/exec/__import__ routes. Compare actual CPython reachability/result with scanner markers. A constructible runtime-dangerous path missed by the scanner is material. A deterministic safe path claimed as executed danger is material when a bounded sound correction exists.

## Preserve R62N and UMI closure
Independently re-falsify R62N exception/TryStar semantics, especially nonmatching plain exceptions, sibling sequencing, newly raised handler exceptions, outer ordinary handlers, outer `except*`, `else`/`finally`, bare re-raise and subgroup remainder. R62G repair must not regress these behaviors.

Also verify bindings/blobs, no staging artifacts, `src/qore=0`, current complete D04 owner/qualification universe, all 19 Program-D families UMI-02-bound, provider/listing vs economic identity separation, RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening, generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT state/terms and SCF/Advanced-Payable collision boundaries, provider/runtime/network/dynamic-execution exclusions, deterministic immutable secret-free specimens, and historical full-closure oracle unchanged.

No provider support, execution, valuation methodology, operational readiness, Production or real-capital claim is authorized.

For every surviving material finding provide stable ID/severity, exact location, minimal witness, runtime result/scanner output, violated invariant, owner class and smallest bounded correction. If binding/CI is mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
