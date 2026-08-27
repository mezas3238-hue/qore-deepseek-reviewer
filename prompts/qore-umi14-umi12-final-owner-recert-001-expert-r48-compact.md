# QORE DeepSeek Expert R48 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. Review only the exact frozen candidate below. Green CI and prior reviews are evidence, never semantic proof.

R47 reviewed the preceding frozen HEAD `470932ec73542836537a1332ec76c4eddd52f122` and returned `HALLAZGOS: 2 / VALIDACIÓN NO OK`. Both findings were independently reproduced against real Python semantics and accepted as valid:

1. R45's unary override lost exact `bool-index` semantics, so `[eval][-False]("1+1")` failed to select and mark the real index-0 dangerous callable.
2. R45's syntactic builtins namespace predicate recognized literal `vars(...)` but not an imported exact helper alias such as `from builtins import vars as v`; consequently `v(builtins).get("Ellipsis")` could lose the exact Ellipsis singleton, scan past the definite unary failure, and mark a later unreachable argument.

The current candidate adds only an R47 successor test-harness layer plus bounded documentation. R47 is consumed and does not certify this mutated HEAD.

## Frozen binding
- PR `#461`
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `9d57c413422e9bc17ef926c4f3887c787362a8d6`
- HEAD TREE `547a19500eb734407050e147e6b67093d97b4a66`
- SYNTHETIC `f85b8c3b92f50ce55370715a93e9a441a6f4ed31`
- SYNTHETIC TREE `547a19500eb734407050e147e6b67093d97b4a66`
- synthetic parents exactly `[BASE, HEAD]`
- compare `105 ahead / 0 behind`; merge-base exactly BASE; 71 changed files
- all changed paths are under `docs/` or `tests/`; `src/qore delta=0`
- historical oracle blob unchanged on BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- main remains BASE and is protected; required check context `quality`
- QORE CI #1576 / run `33066174564`: SUCCESS; Ruff all checks passed; Mypy no issues in 713 source files; Pytest 4608 passed with 6 historical collection warnings; coverage 87% (`47568` statements / `6234` missed)

Reviewer infrastructure preserves complete mandatory changed-file evidence and fail-closed behavior. The workflow explicitly permits up to 600000 characters for mandatory changed evidence and final evidence; no changed file or required evidence may be truncated or skipped.

## Current authoritative successor
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r47_guards.py::_R47BooleanUnaryAndBuiltinsLookupScanner`

It subclasses R45 and is intentionally bounded:
- unary `+/-` scans its operand once, propagates prior definite failure and exact Ellipsis failure;
- it preserves inherited exact float/complex handling, then uses the already-established R35 exact scalar semantics so `integer` and `bool-index` remain exact and unary `None` becomes definite failure;
- the R47 static builtins predicate first preserves all R45 forms, then recognizes an exact abstract `vars` helper alias applied to a statically known builtins namespace;
- direct `.get` / `.__getitem__` on that bounded namespace evaluates receiver and arguments through the existing scanner before exact builtins-member selection, preserving starred argument expansion and earlier side effects;
- explicit containers remain containers; no arbitrary object is promoted to the builtins namespace;
- existing fail-closed builtins rebinding policy remains intact.

Companion document:
`docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R47-HARDENING.md`

## Adversarial priorities
Falsify independently with minimal constructible witnesses and real Python semantics.

1. Unary bool-index parity: `-False`, `+False`, `-True`, `+True`, aliases, sequence indices, mapping numeric equality, and safe/dangerous selected-slot inverses. Verify Python's bool/int equality without fabricating float-to-sequence-index behavior.
2. Unary evaluation order: earlier reachable dynamic effects remain marked; exact `None`/Ellipsis unary failure suppresses only later unreachable effects; unknown operands remain unknown.
3. `vars` aliases: `from builtins import vars as v`, local aliases derived from the exact helper, direct `vars`, and safe negatives where `vars` is lexically shadowed. Do not force a shadowed or unknown helper to builtin identity.
4. Builtins Ellipsis lookup parity after `vars`: `.get`, `.__getitem__`, subscript, `getattr`, `operator.getitem`, `itemgetter`, `attrgetter`; direct and starred exact key arguments; present-member dominance and default-expression evaluation order.
5. Container-vs-builtins separation: list/dict/tuple containers containing builtins are not themselves the builtins namespace. Preserve selected-slot semantics before namespace routing.
6. Preserve R45 lexical `Ellipsis` shadowing and exact builtin identities. Parameter/local/module bindings named `Ellipsis` must dominate implicit builtins exactly when Python would.
7. Preserve R41 distinctions: exact float/complex/Ellipsis non-iterability, iterable bytes, numeric mapping equality/last-write-wins, itemgetter type preservation, and no float sequence-index fabrication.
8. Preserve R39/R40 starred positional-shape rules: definitely non-iterable expansion stops later evaluation; genuinely unknown expansion must not invent positional slots/default selection.
9. Existing sensitive builtins namespace rebinding remains fail-closed. Do not weaken that policy to make an alias witness pass.
10. Full current owner/oracle surface must remain marker-free. No provider/runtime/network authority, Production readiness, or real-capital authorization may be inferred.
11. Inspect complete changed-file evidence and necessary dependency slices. If any inherited material defect survives, report the newest authoritative path that exposes it.

For each material reproducible defect provide exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded correction.

If evidence is sufficient and no material defect survives, conclude exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

If findings survive, conclude exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If genuinely missing evidence remains, fail closed and identify it; do not infer PASS.
