# DeepSeek Expert R84 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. Review the exact frozen QORE Core candidate from first principles. GitHub live state, exact checkout, real CPython behavior, and evidence you reproduce inside THIS run are authoritative. Do not inherit prior CLEAN verdicts or Integration Authority conclusions.

## Exact frozen Core binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE tree: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `e87778368efc8887b50c1be94bae7381842ac3a6`
- HEAD tree: `d9244c559cb70e7e89cbdf17849fa3538ecb6d1a`
- SYNTHETIC: `c5bf01d6a227d0edde36ed8f1a5f560d28960bd1`
- Synthetic parents MUST be BASE then HEAD.
- Synthetic tree MUST equal HEAD tree.
- Historical oracle file: `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- Historical oracle blob MUST remain `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Current R62N target blob: `def192e2a753ca924b3aa66e9fd711b5c58b6d17`.
- Scope: 216 commits ahead / 0 behind; 116 changed files; docs/tests only; `src/qore` delta zero.

Exact frozen QORE CI run `33225820637`, job `99029262593` is SUCCESS on this PR freeze: CPython 3.12.14; Ruff `All checks passed!`; Mypy `Success: no issues found in 740 source files`; 4843 tests passed; 7 warnings; coverage TOTAL 47568 statements / 6234 missed = 87%.

No prior external review certifies this HEAD. All reviews bound to earlier HEADs are historical only.

## Why R84 exists

The latest Integration Authority adversarial work found and repaired material control-flow false negatives in R62N, including:

- reachable bindings after imports/loops;
- assertion-message reachability and static truthiness;
- exception routing and partial `from builtins import ...` binding before failure;
- `with` body exception suppression by `__exit__`;
- failed-star import ordering, where `from module import *` may bind an earlier dangerous export before a later `AttributeError`.

The failed-star repair is the final Core mutation before this freeze. Do not assume it is sound because regressions pass. Try to break it.

## Priority 0 — reproduce failed-star semantics

Construct a synthetic module in `sys.modules` with a dangerous export `b = builtins.eval` and explicit `__all__` ordering. Under real CPython 3.12, verify at least:

1. `__all__ = ["b", "missing"]`: star import binds `b` before failing on `missing`; after a matching handler, a later `b("1+1")` executes dynamic code. Current R62N MUST return non-empty evidence.
2. `__all__ = ["missing", "b"]`: failure happens before `b` can bind. Runtime is safe. The current scanner may conservatively mark this because arbitrary module/star-import namespace and availability are intentionally not executed by the static harness. Do not classify conservative marking by itself as a material defect unless you can show it violates a required owner/oracle qualification contract or can be made deterministic without importing/executing external modules.
3. Star imports that introduce a new dangerous name not previously present.
4. Existing dangerous names overwritten before/after a star import, including partial failure.
5. Multiple star imports, nested try/except, finally, and later rebinding/deletion.

A constructible runtime-dangerous path with current R62N output `()` is a material HARNESS DEFECT.

## Mandatory R62N control-flow falsification

Inspect actual implementation and MRO/super routing in the current files, not layer numbers alone. Exercise the exact current scanner against real CPython semantics for:

- `for` and `while`: zero/one/multiple iterations, state changes on later iterations, break/continue/else, exception exits;
- `try`/`except`/`else`/`finally`, tuple handlers, handler order, bare except, `except*`, nested/partial ExceptionGroups;
- handler target lifetime/cleanup after handler completion;
- imports with left-to-right partial binding before ImportError/AttributeError;
- `with` and multiple context managers: context-expression failure, `__enter__` failure, body raise, `__exit__` suppression, `__exit__` raise, partial entry;
- `assert`: statically true/false tests, NamedExpr tests, message evaluation only when assertion fails, calls/bindings inside test and message;
- Boolean short-circuit and conditional expressions, especially dangerous bindings in selected/unselected branches;
- comprehensions/generator expressions: zero iteration, filters, multiple generators, exception paths and deferred execution;
- return/break/continue/raise routing and no impossible successor-state resurrection;
- dangerous builtins namespace/callable derivations through `builtins.__dict__`, `vars`, `getattr`, `__getitem__`, `operator.getitem`, `itemgetter`, `attrgetter`, aliases and static keys;
- direct/indirect `eval`, `exec`, `__import__`, `importlib` routes already covered by predecessor layers;
- late module authority, deferred functions/lambdas/defaults/annotations, globals/locals/vars and alias/escape chronology inherited from R62K and earlier layers.

Use minimal safe inverses beside dangerous witnesses. Distinguish false negatives from conservative false positives.

## Known conservative observations — attack, do not blindly accept

Integration Authority's final matrix on exact HEAD found no new material FN but observed these conservative marks:

- an ordinary import where an unavailable module appears before `builtins as b` is marked, because the static harness does not execute arbitrary imports to prove module absence;
- a `with` path where `__exit__` itself raises and therefore a later successor is unreachable may still be conservatively marked;
- statically short-circuited BoolOp / unselected IfExp bindings may be conservatively marked;
- direct-source handler-target cleanup can retain conservative call evidence in a later safe path;
- failed-star safe inverse is conservatively marked because external star namespace/order is not resolved by executing the module.

Do not simply repeat this adjudication. Try to construct a bounded deterministic correction or, more importantly, determine whether any of these conservative abstractions masks a runtime-dangerous FALSE NEGATIVE elsewhere. Report a precision issue as material only if it matters to this recertification contract and can be bounded without environment-dependent import execution.

## Regression / owner / oracle closure

Independently verify:

- historical oracle blob is exactly unchanged;
- no `src/qore` file changed;
- no temporary repair workflow is part of the PR diff;
- current owner/oracle scan has not been narrowed;
- explicit current D04 owner/qualification universe remains coherent (35 modules) and discovery/manifest equality still holds;
- all 19 Program-D families remain bound through UMI-02 as declared;
- provider/listing identity remains separate from economic identity;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening remains enforced;
- generic/product qualification directionality remains enforced;
- Sukuk/Shari'ah, ILS/event-contract, SFT static-contract/current-state, and SCF/Advanced-Payable boundaries remain distinct;
- provider/runtime/network/dynamic-execution exclusions have not been weakened.

No provider support, valuation/execution readiness, Production readiness, real-money trading, real-capital authorization, or merge authorization may be inferred.

## Finding contract

For every surviving material finding provide:

- stable ID and severity;
- exact file + symbol/method route;
- minimal constructible witness;
- real CPython result where applicable;
- exact current scanner output and predecessor output if useful;
- actual MRO / super route involved;
- violated invariant and impact;
- `VALID` or `INVALID`;
- `OWNER DEFECT`, `HARNESS DEFECT`, or `DOCUMENT-GOVERNANCE DEFECT`;
- smallest bounded correction.

Do not report style preferences. Do not authorize merge or Production.

If binding/evidence is mechanically invalid or incomplete such that semantic review cannot be trusted, end with `MECHANICAL REVIEW FAILURE`.

If any material semantic finding survives, end with:

VALIDACIÓN NO OK

Only if the exact frozen binding is valid, mandatory adversarial families were actually examined, and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
