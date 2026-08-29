# DeepSeek Coder R93 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Coder reviewer. Inspect the exact implementation,
tests and architecture evidence. Do not inherit Expert R92's clean verdict as proof;
reproduce code-level claims against the frozen checkout.

## Exact frozen Core candidate

- Core `mezas3238-hue/qore-core`, PR #461, still OPEN/DRAFT.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree
  `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `476a93cdd08a064d0b99a139cd1b49287b937f21`, tree
  `5e2b37b23b01fe23fd373d39b01573e9607a73ad`.
- SYNTHETIC `871def531b0f1222e6a1e61252af700f4ed204e3`; parents MUST be
  BASE then HEAD and its tree MUST equal the HEAD tree.
- Compare BASE→HEAD: 277 commits ahead, 0 behind, merge-base BASE;
  docs/tests-only recertification and `src/qore` delta zero.
- R62G blob `bcc95c5b8c57cee26f0a5680dba5fd1399e08ef0` at
  `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`.
- R62N blob `4e70b47730cf3b67ea9be65a95490ada23651a36` at
  `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`.
- Historical oracle
  `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
  MUST remain blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Required native exact-head QORE CI is run `33260165867` / job `99120615940`.
  It MUST remain completed SUCCESS and bind to the exact freeze (`ruff`, `mypy`,
  `4862 passed`, coverage `87%`).

## Completed prior gate, not transferable approval

Fresh Expert R92 run `33269245726` / job `99144638627` completed SUCCESS and
published `HALLAZGOS: NINGUNO` / `VALIDACIÓN OK` on the exact HEAD. Independent
adjudication revalidated the freeze and closed only the Expert stage. Perform a
fresh Coder analysis.

R90's claimed R62G false positive was independently falsified as a reviewer
runtime-context error, not a Core mutation. The exact direct callable and evidence
builder produce identical results. Two historical sources are context-sensitive:
they fail under `python -c` where `__main__.__builtins__` is a module, but execute
`eval` in an ordinarily imported module where `__builtins__` is a dict. Reviewer
commit `986daf1e5ae8da261ed3f8201f96ef4fbd55693b` now emits both contexts; free probe
`33268987310` / `99143953465` passed with
`R62G_EVIDENCE_ROUTING_AND_CONTEXT_OK`.

The unambiguous exact R62G regression matrix requires:

- `import builtins; builtins['eval'](...)` → `()` because the receiver is a module;
- `builtins.__dict__['eval'](...)` → non-empty `call:` marker;
- an explicitly assigned mapping `__builtins__ = {'eval': eval}` → non-empty
  binding/call markers.

Independently verify the code realizes this distinction. A context-sensitive source
that can execute in an imported owner module is not a false positive merely because
it fails in `__main__`.

## Required code-review scope

1. Audit R62G's AST/value-domain implementation and predecessor integration:
   imports, aliases, container selection, branches/unions, attribute and subscript
   access, `.get`, `.__getitem__`, `operator.getitem`/`itemgetter`, `__dict__`,
   `vars`, `getattr`, genuine mappings, side-effect ordering and fail-closed escapes.
   Look for constructible false positives and false negatives, state leakage,
   mutable/cache dependence, label/callable mismatches and tests that pass for the
   wrong reason.
2. Audit R62N's TryStar/ExceptionGroup/plain-exception state machine: sibling
   handlers, pending/new exceptions, subgroup and bare re-raise behavior, mixed
   outcomes, finally state, nested ordinary `except`/`except*`, simple exceptions,
   ordering and namespace merges. Compare implementation paths to CPython 3.12.
3. Audit guard/test quality across the final D04 owner universe: exact discovery,
   all 19 Program-D families bound by UMI-02, provider/listing vs economic identity,
   anti-flattening, generic/product directionality, Sukuk/Shari'ah, ILS/event, SFT
   state/terms, SCF/Advanced-Payable boundaries, provider/runtime/network/dynamic
   execution exclusions, deterministic immutable secret-free specimens.
4. Verify no staging artifacts, no `src/qore` change, and no historical-oracle
   mutation. Green CI is necessary but not semantic proof.

No provider support, execution, valuation methodology, operational readiness,
Production or real-capital claim is authorized.

For every surviving material defect provide stable ID/severity, exact file/symbol,
minimal accepted-state witness, actual versus required behavior, invariant/owner,
and smallest bounded correction with regression. If binding/CI is invalid end
`MECHANICAL REVIEW FAILURE`. If any material defect survives end
`VALIDACIÓN NO OK`. Only if none survives end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
