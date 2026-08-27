# QORE DeepSeek Expert R49 — UMI-12 final owner recertification

You are the independent adversarial Expert reviewer for QORE Core PR #461. Review the exact frozen candidate below. Do not infer approval from prior rounds, CI, documentation, or the fact that earlier findings were corrected. Find reproducible semantic false negatives, false positives that invalidate the claimed guard, broken evaluation-order modeling, identity/alias mistakes, owner-universe omissions, or integrity regressions.

## Exact binding — reject review if any live value differs

Repository: `mezas3238-hue/qore-core`
PR: `#461`
Base/main: `ebd0adf000874797653df92ea1c08a892cce6c8c`
Base TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
Candidate HEAD: `728fcb965066f30d26a63b4cc462ca3a88703e0a`
Candidate TREE: `f8122cfc9b585b7918fe2a52043794645e932b8f`
Synthetic merge: `deea4157fa420f9774f1f2ce80a07580ee218fca`
Synthetic TREE: `f8122cfc9b585b7918fe2a52043794645e932b8f`
Synthetic parent 1: `ebd0adf000874797653df92ea1c08a892cce6c8c`
Synthetic parent 2: `728fcb965066f30d26a63b4cc462ca3a88703e0a`
Compare: `108 ahead / 0 behind`; merge-base is exact BASE.
Changed scope: docs/tests only; `src/qore` delta is zero.
Historical full-closure oracle blob at BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`.

QORE CI exact candidate: run `33068281560` / QORE CI #1579, SUCCESS:
- `ruff check .` — clean
- `mypy src tests` — `Success: no issues found in 714 source files`
- `pytest --cov=src/qore --cov-report=term-missing` — `4613 passed, 6 warnings`
- coverage TOTAL `47568 / 6234 / 87%`

These facts are evidence only, not a semantic verdict.

## R48 finding that must be independently re-falsified

R48 found one valid defect on old HEAD `9d57c413422e9bc17ef926c4f3887c787362a8d6`: a conservatively merged abstract identity such as `{helper:vars, unknown}` could satisfy membership-based `_contains_kind(..., "helper", "vars")`, be promoted incorrectly to exact `vars`, then recover exact builtins namespace / `Ellipsis`, manufacture a definite unary failure, and suppress a later `eval` that is reachable in real Python.

The successor correction is additive in:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r48_guards.py`
with documentation in:
`docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R48-HARDENING.md`.

R48 introduces `_r48_exact_builtins_namespace(value)` requiring exact equality to `_BUILTINS_NAMESPACE`, and an authoritative `.get` / `.__getitem__` call path that evaluates the real abstract receiver and arguments before choosing mapping/sequence/exact-builtins semantics. Mixed builtins-like values return unknown rather than being coerced to exact identity. One test expectation was subsequently corrected because the scanner legitimately records a sensitive `binding:8`; this does not relax the required reachable `call:12` marker.

Do not merely confirm those tests. Attempt to break the successor.

## Required adversarial focus

1. **Exact versus merged helper identity**
   - `vars`, `getattr`, `getitem`, `itemgetter`, `attrgetter`, builtins namespace, dangerous callable.
   - branch merges where one arm is exact helper/builtins and another is unknown, lambda, user object, mapping, sequence, or dangerous callable.
   - ensure a set containing an exact atom plus `unknown` is never silently treated as exact when Python execution remains ambiguous.

2. **Control-flow and alias propagation**
   - `if`/`else`, nested branches, `IfExp`, aliases of aliases, assignment expressions, function-local bindings, parameters, imported aliases, lexical shadowing.
   - branch order and conservative environment merges.
   - exact imported `from builtins import vars as v` must retain intended exact semantics, while merged or shadowed `v` must not.

3. **Receiver/container precedence**
   - direct `builtins.__dict__`, `vars(builtins)`, aliases, real dict/list/tuple literals, mapping selected slots, sequence selected slots.
   - collisions where a merged value carries both container metadata and builtins/helper metadata.
   - `.get` versus `.__getitem__`, missing keys/defaults, key evaluation, starred arguments, unknown positional shape.

4. **Evaluation order and failure semantics**
   - function expression, receiver, positional args, starred args, keywords, later dangerous calls.
   - a real definite failure may suppress later expressions; an abstract ambiguity must not be upgraded to definite failure.
   - earlier reachable `eval`/`exec`/`__import__` must remain marked even if a later receiver/key/unary operation fails.

5. **Unary and key edge cases across R41/R45/R47/R48**
   - `Ellipsis`, `None`, bool (`True`/`False`, unary plus/minus), integer, signed integer, float, complex, bytes/string distinctions.
   - operator `getitem`/`itemgetter` parity and direct subscript parity.
   - safe co-present dangerous values must not create flattened false positives; real dangerous selection must not be lost.

6. **Fallback-chain soundness**
   - inspect whether returning `super()` from R48 on non-attribute calls can re-enter older membership-based identity heuristics in a way that recreates the same class of defect through `vars(...)`, `getattr(...)`, `operator.getitem(...)`, `operator.itemgetter(...)`, `operator.attrgetter(...)`, aliases, or nesting.
   - look for paths not covered by R48's authoritative `.get` / `.__getitem__` override.

7. **Owner/oracle integrity and scope**
   - current owner/qualification universe must remain complete and deterministic.
   - provider/runtime/network modules must not become part of the semantic owner claim.
   - historical full-closure oracle must remain byte-identical as bound above.
   - no inference of provider support, operational readiness, Production authorization, trading authorization, or real-capital readiness.

## Finding standard

Report only concrete, reproducible findings against this exact HEAD. For each finding provide:
- severity;
- exact file/function/path;
- minimal Python witness or repository witness;
- real Python semantics;
- scanner/guard result and why it differs;
- whether it is false negative, invalidating false positive, owner-integrity defect, or other contract breach;
- bounded correction direction without writing code.

Do not report style preferences, hypothetical unsupported syntax with no relevance to the claimed guard, or issues already impossible on this exact HEAD.

If and only if no valid findings remain, the final line must be exactly:

`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise the final line must be:

`HALLAZGOS: N / VALIDACIÓN NO OK`

where N is the number of valid findings you report.