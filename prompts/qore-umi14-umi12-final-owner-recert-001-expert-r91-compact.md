# DeepSeek Expert R91 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. GitHub live state, exact checkout,
CPython 3.12 behavior in the relevant execution context, and reproduced evidence are
authoritative. Do not inherit any R90 or earlier Expert/Coder/Claude verdict.

## Exact frozen Core candidate

- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree
  `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `476a93cdd08a064d0b99a139cd1b49287b937f21`, tree
  `5e2b37b23b01fe23fd373d39b01573e9607a73ad`.
- SYNTHETIC `871def531b0f1222e6a1e61252af700f4ed204e3`; parents MUST be
  BASE then HEAD; tree MUST equal HEAD tree.
- R62G target
  `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`,
  blob `bcc95c5b8c57cee26f0a5680dba5fd1399e08ef0`.
- R62N target
  `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`,
  blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable oracle
  `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`,
  blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Compare BASE→HEAD: 277 commits ahead, 0 behind, merge-base BASE;
  docs/tests-only recertification and `src/qore` delta zero.
- Required native exact-head QORE CI is run `33260165867` / job
  `99120615940`. It MUST remain completed SUCCESS and its live metadata/raw logs
  must bind to this exact freeze (`4862 passed`, coverage `87%`).

## R90 adjudication and corrected reviewer evidence

R90 finding `R90-R62G-FP-001` is not inherited. Independent A/B reproduction found:

1. The full evidence builder callable is
   `deepseek_reviewer_compact_budgeted_v16._extended_r62g_probe_suite`.
2. Its R62G route and the direct route both resolve to the v20 exact wrapper
   `deepseek_reviewer_compact_budgeted_v20._scanner_r62g_exact`, which invokes
   scanner target
   `test_universal_cross_asset_conformance_final_owner_r62g_guards._r62g_dynamic_execution_markers_from_source`.
3. For byte-identical inputs, direct output equals evidence-builder output. There is
   no retained/precomputed scanner result and no callable cache.
4. R90 compared two context-sensitive sources under `python -I -B -c`, where
   `__builtins__` in `__main__` is a module, against a guard protecting ordinary
   imported owner modules, where `__builtins__` is a dict. The sources therefore
   fail with `TypeError` in the first context but execute `eval` and return `2` in
   the imported-module context:
   - `direct_dunder_builtins`, source SHA-256
     `1a35eda900da0191a4a9501607d5f3e0001b420516c0b69e32ae402004705146`,
     direct/builder exact R62G `('call:1',)`;
   - `imported_builtins_dict`, source SHA-256
     `f90e837e5244f5a15a65c44de660221d6dfcda8852e02651e73125a5c9f64947`,
     direct/builder exact R62G `('call:2',)`.

Reviewer-infrastructure commit
`986daf1e5ae8da261ed3f8201f96ef4fbd55693b` makes both CPython contexts explicit
in the mandatory evidence and adds a permanent direct-vs-builder guard. Its free
probe run `33268987310` / job `99143953465` completed SUCCESS with marker
`R62G_EVIDENCE_ROUTING_AND_CONTEXT_OK` on the exact Core HEAD.

The unambiguous regression matrix now requires:

- imported `builtins` module subscript, source SHA-256
  `13ffc45e873472df793f78bce32b14c59726ba7ac6ba5c5b13d0827a215e8420`
  → exact R62G `()`;
- `builtins.__dict__['eval'](...)`, source SHA-256
  `1b4dc6a20402ab5ec8230307065dd8b43965395f608cfa4cee856069db5538c3`
  → non-empty `call:` marker;
- explicit genuine `__builtins__` mapping, source SHA-256
  `f9912b1881bf618779af01bccb98894cff0c22b1abde73edc9aaaea758681ad2`
  → non-empty binding/call markers.

Independently falsify these facts. Do not infer a false positive merely because a
context-sensitive source fails in `__main__` if it executes in the imported owner
module context. Conversely, report any constructible source whose receiver is
provably the `builtins` module in all relevant contexts but exact R62G still emits
an executed-call marker.

## Required adversarial scope

Aggressively falsify the R62G module-vs-mapping value distinction: direct and
transported `builtins` module values, tuple/list selection, aliases,
branches/unions, `.get`, `.__getitem__`, `operator.getitem`,
`operator.itemgetter`, attributes, `__dict__`, `vars(builtins)`, `getattr`,
genuine `__builtins__` mappings, execution context, and side-effect ordering.
Safe runtime failures must not be mislabeled as executed calls; genuinely
executable `eval`/`exec`/`__import__` routes must remain detected.

Independently re-falsify R62N TryStar/ExceptionGroup/plain-exception behavior:
sibling handlers, newly raised handler exceptions, pending exceptions, bare
re-raise/subgroups, mixed bare re-raise plus new exception, finally shared
namespace, routing into outer ordinary `except` and `except*`, and simple
exceptions inside TryStar. Compare against CPython semantics; no historical
approval transfers.

Also verify bindings/blobs, no staging artifacts, `src/qore=0`, current complete
D04 owner/qualification universe, all 19 Program-D families UMI-02-bound,
provider/listing vs economic identity separation, anti-flattening invariants,
generic/product qualification directionality, Sukuk/Shari'ah, ILS/event, SFT
state/terms and SCF/Advanced-Payable collision boundaries,
provider/runtime/network/dynamic-execution exclusions, deterministic immutable
secret-free specimens, and historical full-closure oracle unchanged.

No provider support, execution, valuation methodology, operational readiness,
Production or real-capital claim is authorized.

For every surviving material finding provide stable ID/severity, exact location,
minimal witness, execution contexts, runtime result/scanner output, violated
invariant, owner class and smallest bounded correction. If binding/CI is
mechanically invalid end `MECHANICAL REVIEW FAILURE`. If a material semantic
finding survives end `VALIDACIÓN NO OK`. Only if no material finding survives end
literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
