# DeepSeek Coder R84 — QORE UMI14 / UMI12 exact-freeze breakage review

Act as an independent adversarial Coder reviewer. Review and actively try to break the exact frozen QORE Core candidate from first principles. Do not inherit the Expert R86 verdict, historical reviewer conclusions, CI conclusions, or Integration Authority conclusions. GitHub live state, exact checkout, CPython behavior, and evidence reproduced by you are authoritative.

## Exact freeze

- Core: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE tree: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `858510a806eb20745924101bd506cfeac94daa7b`
- SYNTHETIC: `1b32727358ad697f6ea5f527e3fce039209f842d`
- Synthetic parents MUST be BASE then HEAD; synthetic tree MUST equal HEAD tree.
- Target: `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`
- Immutable historical oracle: `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- Oracle blob MUST remain `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- PR scope remains docs/tests only; `src/qore` delta MUST be zero.
- No temporary repair/probe workflow or patcher may survive in the Core freeze.

Exact required `quality` on QORE CI #1728: workflow run `33252669215`, job `99100858936`, SUCCESS on the frozen candidate: Ruff PASS; Mypy PASS with 740 source files; Pytest 4854 passed / 7 warnings; coverage 87%. CI is evidence, not semantic certification.

DeepSeek Expert R86 review `5058095115` reported `HALLAZGOS: NINGUNO / VALIDACIÓN OK` on this exact freeze. Treat that only as evidence that another reviewer ran; DO NOT inherit its verdict.

## Priority breakage target: R62N exception-flow semantics

The latest repair models CPython `except*` execution as a sequential handler chain and models regrouping after the complete chain. Independently falsify it. In particular construct executable witnesses for:

1. `except*` handler 1 rebinding a dangerous alias and handler 2 observing that binding;
2. handler 1 safe rebind and handler 2 dangerous call staying safe where CPython is safe;
3. bare re-raise of a matched subgroup plus a newly raised exception in another handler, in BOTH handler orders;
4. the combined/re-grouped exception reaching an outer ordinary `except ExceptionGroup` with the correct post-handler namespace;
5. the combined/re-grouped exception reaching outer `except* TypeError`, `except* ValueError`, and sibling subgroup routing without losing dangerous authority;
6. `finally` executing only after the completed `except*` chain, including dangerous-before-safe and safe-before-danger inversions;
7. failed `from module import *` partial left-to-right authority inside `TryStar`, including multiple subgroups and nested finalizers;
8. a failed star where dangerous export binds before a later missing export MUST not become a false negative;
9. the inverse missing-before-dangerous ordering may be conservatively marked, but that conservatism must not mask a different runtime-dangerous false negative;
10. nested `TryStar` + ordinary `try/except/finally`, successor state, and return/raise routing.

For every suspected issue compare actual CPython execution/reachability with exact scanner output. A constructible runtime-dangerous path producing no finding is a material HARNESS DEFECT. A deterministic false positive is material only when it violates the recertification contract and has a bounded correction without executing/importing arbitrary external modules.

Then broaden breakage attempts across loops/break/continue/else, nested handlers, handler target cleanup, partial imports, multiple context managers, `assert`, NamedExpr, AnnAssign, BoolOp/IfExp, comprehensions/generators, return/raise, builtins-derived namespaces, `vars`, `getattr`, `__dict__`, mapping methods, static string derivation, lexical shadowing, closures/globals, deferred functions/lambdas/defaults/annotations, and direct/indirect `eval`/`exec`/`__import__`/`importlib` routes inherited from predecessors.

Known conservative fingerprints may be challenged but must not be silently normalized: unavailable ordinary import before builtin alias; `with` exit raising with an unreachable successor; statically short-circuited BoolOp/IfExp; handler-target cleanup; failed-star external namespace/order uncertainty.

## Owner / oracle / architecture closure

Independently verify:

- exact BASE/HEAD/SYNTHETIC binding and synthetic topology;
- oracle byte identity and target binding;
- `src/qore` delta zero and no staging/probe artifacts;
- current explicit 35-module D04 owner/qualification universe and live discovery equality;
- all 19 Program-D families remain UMI-02-bound as declared;
- provider/listing identity remains distinct from canonical economic identity;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- qualification directionality and collision guards (Sukuk/Shari'ah, ILS/event-contract, SFT terms/current state, SCF/Advanced Payable);
- provider/runtime/network/dynamic-execution exclusion remains fail-closed;
- deterministic, immutable, secret-free evidence where required.

No provider readiness, valuation/execution readiness, Production readiness, real-money trading, real-capital authorization, or merge authorization may be inferred.

## Finding contract

For every surviving material finding give stable ID/severity, exact file/symbol, minimal executable witness, actual CPython result, exact scanner result, violated invariant/impact, `VALID` or `INVALID`, owner class (`OWNER DEFECT`, `HARNESS DEFECT`, or `DOCUMENT-GOVERNANCE DEFECT`), and smallest bounded correction.

Do not report style preferences. If exact binding/evidence is mechanically invalid, end `MECHANICAL REVIEW FAILURE`.

If any material semantic finding survives, end:

VALIDACIÓN NO OK

Only if the exact freeze is valid, the adversarial families were actually challenged, and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
