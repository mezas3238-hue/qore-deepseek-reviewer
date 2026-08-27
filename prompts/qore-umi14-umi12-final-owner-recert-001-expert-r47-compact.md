# QORE DeepSeek Expert R47 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. Review only the exact frozen candidate below. Green CI and prior reviews are evidence, never semantic proof.

R45 on the preceding HEAD found one valid bounded defect: exact Python builtin `Ellipsis` identities (bare `Ellipsis`, `from builtins import Ellipsis`, `builtins.Ellipsis`) could still degrade to unknown around unary `+/-`, allowing later unreachable dynamic arguments to be scanned. The current frozen candidate adds the R45 successor layer and regressions for those identities while preserving lexical shadowing and the existing fail-closed builtins-namespace binding policy.

R46 targeted this same exact HEAD but produced no semantic review: it failed before the model call because mandatory complete changed-file evidence exceeded the old workflow budget `DEEPSEEK_MAX_MANDATORY_CHANGED_CHARS=500000`. It spent USD 0 and published no review. Reviewer infrastructure now raises both complete mandatory-changed and final-evidence budgets explicitly to 600000 characters. Evidence must remain complete; no file, dependency, or required evidence may be truncated or skipped. R46 is consumed and must not be rerun.

## Frozen binding
- PR `#461`
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `470932ec73542836537a1332ec76c4eddd52f122`
- HEAD TREE `d6eb70f381ac592704d2d96c3e9c492db144a354`
- SYNTHETIC `8b33af4c6fcc89b3e7d161c89300acc7eae44d38`
- SYNTHETIC TREE `d6eb70f381ac592704d2d96c3e9c492db144a354`
- synthetic parents exactly `[BASE, HEAD]`
- compare `103 ahead / 0 behind`; merge-base exactly BASE; 69 changed files
- all changed paths are under `docs/` or `tests/`; `src/qore delta=0`
- historical oracle blob unchanged on BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- QORE CI #1574 / run `33063663928`: SUCCESS; Ruff OK; Mypy OK in 712 source files; Pytest 4603 passed, 6 historical warnings; coverage 87%

## Current authoritative successor
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r45_guards.py::_R45BuiltinEllipsisAliasScanner`

Adversarial priorities:
1. Falsify exact builtin Ellipsis unary/star family: `f(*-Ellipsis, eval(...))`, `+Ellipsis`, imported aliases, `builtins.Ellipsis`, local aliases derived from the exact singleton, tuple/list starred composites, and earlier reachable side effects before failure.
2. Verify lexical shadowing: parameters, module/function/class bindings named `Ellipsis` must dominate the implicit builtin exactly when Python would. Do not force a shadowed name to the singleton.
3. Verify builtins namespace alias propagation does not confuse containers containing `builtins` with the namespace itself. Preserve container-first selected-slot semantics.
4. Check exact lookup parity for `"Ellipsis"`: subscript, `.get`, `.__getitem__`, `getattr`, `operator.getitem`, `itemgetter`, `attrgetter`, including present-member dominance and default evaluation order.
5. Verify unary evaluation order/exact-once behavior. Known unary failure must suppress only later unreachable effects; unknown operands must remain unknown, not definite Ellipsis failures.
6. Preserve R41 numeric/ellipsis distinctions: float/complex/Ellipsis non-iterability, iterable bytes, numeric mapping equality/last-write-wins, operator parity, and no float-to-sequence-index fabrication.
7. Preserve R39/R40 starred positional-shape rules: definite non-iterable stops later evaluation; genuinely unknown expansion must not invent positional slots or defaults.
8. Preserve selected-slot safe negatives across mapping/sequence/operator accessors, None/numeric keys, builtins defaults, and mapping/container-vs-builtins priority.
9. Existing sensitive builtins namespace rebinding remains fail-closed; do not weaken that policy to make an alias witness pass.
10. Full current owner/oracle surface must remain marker-free. No provider/runtime/network authority, Production readiness, or real-capital authorization may be inferred.
11. Inspect complete changed-file evidence and necessary local dependency slices. If an inherited material defect survives, report the newest authoritative path exposing it.

For each material reproducible defect provide exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded correction.

If evidence is sufficient and no material defect survives, conclude exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

If findings survive, conclude exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If genuinely missing evidence remains, fail closed and identify it; do not infer PASS.
