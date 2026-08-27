# QORE DeepSeek Expert R46 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. Review only the exact frozen candidate below. Green CI and prior reviews are evidence, never semantic proof.

R45 on the immediately preceding frozen HEAD found one valid bounded harness defect: the literal `...` unary failure was closed, but exact Python builtin `Ellipsis` identities such as bare `Ellipsis`, `from builtins import Ellipsis`, and `builtins.Ellipsis` could still degrade to unknown and allow unreachable later dynamic arguments to be scanned. The current candidate adds an R45 successor layer for those exact builtin identities. R45 is consumed and does not certify this mutated HEAD.

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
- QORE CI #1574 / run `33063663928`: Ruff OK; Mypy OK in 712 source files; Pytest 4603 passed, 6 historical warnings; coverage 87% (`47568` statements / `6234` missed)

Reviewer infrastructure preserves complete mandatory changed-file evidence and fail-closed behavior. The stable final-evidence safety floor is 560k characters; no changed file or mandatory evidence may be truncated or skipped.

## Current authoritative successor
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r45_guards.py::_R45BuiltinEllipsisAliasScanner`

It subclasses R44 and is intentionally bounded:
- bare Name `Ellipsis` is exact only when no lexical binding shadows that name;
- `from builtins import Ellipsis [as alias]` binds the exact singleton identity;
- `builtins.Ellipsis` and actual builtins-namespace aliases resolve exact Ellipsis;
- already-bounded static builtins lookup/accessor forms preserve the exact identity: direct namespace subscript, `.get`, `.__getitem__`, `getattr`, `operator.getitem`, `operator.itemgetter`, `operator.attrgetter`;
- unary `+/-` scans its operand once, propagates prior definite failure, converts exact Ellipsis to the inherited definite-failure value, and retains inherited exact float/complex/integer semantics;
- lexical shadowing of the spelling `Ellipsis` must remain normal Python shadowing, not be forced to the builtin singleton;
- existing fail-closed policy that marks rebinding of the builtins namespace remains intact. A first QG candidate contained an unnecessary `module_alias = builtins_alias` synthetic witness and correctly produced a binding marker; the test was corrected, not the guard. Final QG #1574 is authoritative.

Companion document:
`docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R45-HARDENING.md`

## Adversarial priorities
Falsify independently using real Python semantics and minimal constructible witnesses.

1. Exact R45 family: `f(*-Ellipsis, eval(...))`, `+Ellipsis`, imported aliases, `builtins.Ellipsis`, exact local aliases derived from that singleton, tuple/list starred composites, and earlier reachable side effects before the failure.
2. Lexical shadowing: module/local/parameter bindings named `Ellipsis` must dominate the implicit builtin exactly when Python would; do not fabricate singleton identity after a real lexical binding.
3. Builtins namespace identity vs containers: a list/dict containing `builtins` is not itself the builtins namespace. Preserve R39/R41 container-first selection and avoid false namespace routing.
4. Static lookup parity for exact `"Ellipsis"`: direct subscript, `.get`, `.__getitem__`, `getattr`, `operator.getitem`, `itemgetter`, `attrgetter`. Check present-member dominance and that dangerous defaults are evaluated as expressions but not selected when the member is definitely present.
5. Unary evaluation order and exact-once behavior: a prior reachable effect must remain marked; a definite unary failure must suppress only later unreachable effects. Unknown operands must not be promoted to definite Ellipsis failure.
6. Preserve R41 distinctions: float/complex/Ellipsis non-iterability, iterable `bytes`, exact numeric mapping equality/last-write-wins, itemgetter type preservation, and no float-to-sequence-index fabrication.
7. Preserve R39/R40 starred positional-shape rules: definitely non-iterable expansion stops later evaluation; genuinely unknown expansion must not invent positional slots/default selection.
8. Preserve selected-slot safe negatives across mapping/sequence/operator accessors, None/numeric keys, builtins defaults, and container-vs-builtins priority.
9. Existing sensitive builtins namespace rebinding must remain fail-closed. Do not classify that policy marker as an R45 defect merely because a synthetic alias is semantically possible; instead test whether R45 accidentally suppresses or fabricates it.
10. Full current owner/oracle surface must remain marker-free. No provider/runtime/network authority, Production readiness, or real-capital authorization may be inferred.
11. Inspect complete changed-file evidence and necessary dependency slices. If an inherited material defect survives, report the newest authoritative path that exposes it.

For every material reproducible defect provide exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded correction.

If evidence is sufficient and no material defect survives, conclude exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

If findings survive, conclude exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If genuinely missing evidence remains, fail closed and identify it; do not infer PASS.
