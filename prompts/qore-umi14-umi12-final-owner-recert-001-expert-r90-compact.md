# DeepSeek Expert R90 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout, CPython 3.12 behavior, and reproduced evidence are authoritative. Do not inherit any R89 or earlier Expert/Coder/Claude verdict.

## Exact frozen Core candidate
- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `476a93cdd08a064d0b99a139cd1b49287b937f21`, tree `5e2b37b23b01fe23fd373d39b01573e9607a73ad`.
- SYNTHETIC `871def531b0f1222e6a1e61252af700f4ed204e3`; parents MUST be BASE then HEAD; tree MUST equal HEAD tree.
- R62G target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`, blob `bcc95c5b8c57cee26f0a5680dba5fd1399e08ef0`.
- R62N target `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`, blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Compare BASE→HEAD: 277 commits ahead, 0 behind, merge-base BASE; docs/tests-only recertification, `src/qore` delta zero.
- Required native exact-head QORE CI is run `33260165867` / job `99120615940`. It MUST be completed SUCCESS and its live metadata/raw logs must bind to this exact freeze.

## R89 adjudication: do not inherit its verdict or its mislabeled evidence
R89 ended `VALIDACIÓN NO OK` on the witness `import builtins; builtins["eval"]("1+1")`, but its evidence key `scanner_r62g_imported_builtins_dict` was mechanically routed through `scanner=r62k`, not the exact R62G scanner. Reviewer infrastructure was subsequently corrected so the R62G evidence matrix invokes the exact R62G scanner. A no-model routing probe on the exact Core HEAD now demonstrates:
- exact R62G + safe imported-module subscript → `scanner=r62g`, `()`;
- CPython rejects the witness before evaluation because the module is not subscriptable;
- exact R62G + `builtins.__dict__["eval"](...)` → `scanner=r62g`, non-empty `call:` marker.

Treat the above only as a routing correction to falsify independently, not as approval. If the exact R62G implementation still has a material FP/FN, report it. Do not use evidence produced by a different successor scanner as if it were R62G.

## Required adversarial scope
Aggressively falsify the R62G module-vs-mapping value distinction: direct and transported `builtins` module values, tuple/list selection, aliases, branches/unions, `.get`, `.__getitem__`, `operator.getitem`, `operator.itemgetter`, attributes, `__dict__`, `vars(builtins)`, `getattr`, genuine `__builtins__` mappings, and side-effect ordering. Safe runtime failures must not be mislabeled as executed dynamic calls; genuinely executable `eval`/`exec`/`__import__` routes must remain detected.

Independently re-falsify R62N TryStar/ExceptionGroup/plain-exception behavior: sibling handlers, newly raised handler exceptions, pending exceptions, bare re-raise/subgroups, mixed bare re-raise plus new exception, finally shared namespace, routing into outer ordinary `except` and `except*`, and simple exceptions inside TryStar. Compare against CPython semantics; no historical approval transfers.

Also verify bindings/blobs, no staging artifacts, `src/qore=0`, current complete D04 owner/qualification universe, all 19 Program-D families UMI-02-bound, provider/listing vs economic identity separation, anti-flattening invariants, generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT state/terms and SCF/Advanced-Payable collision boundaries, provider/runtime/network/dynamic-execution exclusions, deterministic immutable secret-free specimens, and historical full-closure oracle unchanged.

No provider support, execution, valuation methodology, operational readiness, Production or real-capital claim is authorized.

For every surviving material finding provide stable ID/severity, exact location, minimal witness, runtime result/scanner output, violated invariant, owner class and smallest bounded correction. If binding/CI is mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
