# DeepSeek Expert R80 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, the exact checkout, and raw executable evidence generated inside this run are authoritative. Do not inherit any prior CLEAN, failure, or Claude conclusion.

## Frozen Core binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `9a2924976ae7a0eeace45ef0bcafedf1b4555aba`
- HEAD tree: `9a7170e40adce26eb9b72cb99a48cf063d59d26c`
- SYNTHETIC: `97eba1c06124c25aef059849c0b01acfc398009d`
- Synthetic parents MUST be BASE then HEAD and synthetic tree MUST equal HEAD tree.
- Historical oracle blob: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- R62G blob: `d298e5ac1c7d2696db7edad543d61a79e3dcdff7`
- Scope: 108 changed files, 167 commits ahead / 0 behind, docs/tests only, `src/qore` delta zero.

Exact-head QORE CI #1638 / run `33135982210` / job `98735946410` is SUCCESS: CPython 3.12.14, Ruff `All checks passed!`, Mypy `Success: no issues found in 733 source files`, 4776 tests passed, six pre-existing PytestCollectionWarning instances, coverage TOTAL 47568 statements / 6234 missed = 87%.

## Consumed / invalidated review boundary

R78 Expert and R79 Coder were genuine CLEAN reviews on old R62F HEAD `e5e0aa141831293ca0877e78c120fb8947042c5f`. They are NON-CERTIFYING because Core subsequently mutated.

Independent Claude review of that old R62F freeze found a material precision defect, reported as `QORE-R62E-SCOPE-001`: nested zero-argument `locals()` / `vars()` could be treated as if they exposed module `__builtins__`, producing a static marker although real CPython function locals raise `KeyError` before dynamic execution.

Integration Authority independently adjudicated the underlying finding VALID/MATERIAL but refined both cause and correction:

- R62E retains a namespace-sensitive abstract value for zero-argument namespace helpers; that retention is needed for real callable-default escapes and must not simply become UNKNOWN in nested scopes.
- The direct false positive becomes actionable in R62F, which decorates zero-argument helper results with module selected slots regardless of runtime scope.
- R62G is the successor: nested non-module `locals()` / `vars()` return R62E's retained sensitive namespace WITHOUT invented module selected slots; module `locals()` / `vars()` keep R62F selected slots; `globals()` remains module-scoped from any function scope.

Because Core changed, R78, R79, and the old Claude report are evidence/history only. Review R62G from first principles.

## Priority 0 — mandatory R62G executable evidence

Reviewer v16 injects a deterministic pre-model matrix and exposes the exact candidate scanner as `scanner=r62g`. You MUST adjudicate raw outputs. If mandatory evidence is missing, errors, uses the wrong candidate scanner, or cannot be reconciled with the frozen checkout, return `MECHANICAL REVIEW FAILURE`; never CLEAN incomplete evidence.

### A. Exact accepted precision finding differential

For each of these non-module witnesses:

```python
def run():
    return vars()["__builtins__"].eval("1+1")
result = run()
```

```python
def run():
    return locals()["__builtins__"].eval("1+1")
result = run()
```

and equivalent function-comprehension forms, require:

1. CPython runtime demonstrates the construction cannot reach `eval` (KeyError for missing `__builtins__` in local namespace);
2. predecessor exact `scanner=r62f` demonstrates the old conservative marker;
3. candidate exact `scanner=r62g` returns `()`.

If R62G still marks the impossible direct nested path, classify a material precision regression. If it becomes clean by losing necessary sensitivity elsewhere, classify the corresponding false negative.

### B. Over-correction attacks — these MUST remain fail-closed

Adjudicate raw runtime + `scanner=r62g` for at least:

- nested `globals()["__builtins__"]...eval(...)`;
- module zero-argument `vars()` with an imported `builtins` slot;
- module zero-argument `locals()` with an imported `builtins` slot;
- CPython-3.12 module list/set/dict comprehension namespace access;
- nested callable default retaining `vars()` where the containing function imports `builtins` and later `hold.__defaults__[0]["builtins"].eval(...)` reaches execution;
- same retained-default witness using `locals()`.

The retained-default cases are critical: do NOT accept a fix that returns generic UNKNOWN in nested scopes and therefore erases a real stored capability.

### C. R62F direct surfaces remain mandatory on R62G

Recheck through exact `scanner=r62g`:

- `globals()["builtins"].eval(...)`;
- `locals()["builtins"].eval(...)` at module scope;
- `vars()["builtins"].eval(...)` at module scope;
- `globals()["__builtins__"]["eval"](...)` under the harness-relevant exec context;
- `builtins.__dict__["globals"]...`;
- `.get("globals")` and `.__getitem__("globals")`;
- `vars(builtins)["globals"]...`;
- `getattr(builtins,"globals")...`;
- `from builtins import globals as ...`;
- `from builtins import __dict__ as ...`;
- `operator.getitem(builtins.__dict__, "globals")...`;
- safe missing-key, safe len, lexical shadowing, and `vars(safe)` inverses.

A runtime-dangerous witness with candidate output `()` is `VALID / MATERIAL / HARNESS DEFECT`.

## Required implementation-path adjudication

Read the current code; do not infer by layer number. At minimum inspect:

- `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62g_guards.py`;
- R62F selected-slot layer;
- R62E retained-namespace/default layer;
- R57/R56/R55 runtime-scope classification;
- R15 selected-slot mapping extraction;
- R12 helper/dangerous/builtins expression and call machinery.

Trace the actual MRO and `super()` routing. Verify specifically:

- R62G uses inherited `_r56_call_scope_stack` at the moment `_evaluate_special_call` is called;
- module/function/generator/comprehension scope classification is the intended CPython 3.12 behavior;
- R59 inherits directly from R57 and intentionally does not inherit R58;
- no later layer invalidates that runtime-scope signal before R62G consumes it;
- nested `locals()` / `vars()` retain sensitivity for defaults without gaining module selected slots;
- `globals()` is not mistakenly scoped like locals/vars;
- no arbitrary mapping or unknown value gains selected builtins authority;
- no hidden second evaluation or duplicated marker path is introduced.

## CPython 3.12 comprehension falsification

Attack PEP 709 scope interactions, not just simple functions:

- module list/set/dict comprehensions using `vars()`/`locals()` should reflect containing module scope under CPython 3.12;
- function list/set/dict comprehensions should reflect containing function scope and must not invent module builtins;
- generator-expression bodies remain a nested runtime scope;
- nested comprehensions and callable defaults inside a containing function should not cross-contaminate the scope stack.

Use constructible runtime witnesses. If source/runtime context matters, name the context explicitly.

## Prior mandatory matrices remain mandatory

The inherited pre-model suites must still cover and be adjudicated for the current candidate, including:

- R62E retained globals/locals/vars helper defaults and nested retention;
- R62D function/lambda/default-container/importlib/module-namespace default egress;
- R62C lambda return and computed importlib lookup/alias/rebinding/operator paths;
- R62B return egress, direct importlib, multi-star, failed-star keyword chronology and safe inverses;
- R62/R61/R60/R59/R57 scope/fallback regressions;
- safe `len` and ordinary-mapping inverses.

Do not accept historical predecessor labels as current candidate evidence unless the current side is explicitly `scanner=r62g`.

## Adjacent falsification focus

Use the bounded exploration round for high-value same-family attacks omitted by the literal regression suite, for example:

- class body `locals()` / `vars()` and class-body defaults;
- generator-expression locals/vars under module and function callers;
- nested function inside module comprehension and vice versa;
- alias/rebinding of `locals`, `vars`, `globals` before/after nested scope entry;
- keyword-only defaults and nested containers carrying retained namespace values;
- returned/stored retained namespace values outside defaults where direct selected-slot authority should not be invented;
- shadowed helper names with compatible callable shapes;
- `vars()` on explicit safe arguments versus zero-arg `vars()`;
- ordinary mappings containing keys named `builtins`, `__builtins__`, `eval`, `globals`, `locals`, or `vars`.

Only report constructible material defects. Do not demand unbounded Python interpretation from a bounded static falsification harness.

## Owner / oracle / recertification boundary

Reconfirm against the exact frozen candidate:

- no `src/qore` mutation;
- historical oracle byte identity;
- complete owner + oracle surface clean under exact current scanner;
- 35 current D04 owner/qualification modules and exact discovery/manifest equality;
- all 19 Program-D families bind through UMI-02;
- provider/listing identity remains separate from economic identity;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- generic/product qualification directionality;
- Sukuk/Shari'ah separation;
- ILS/event-contract separation;
- SFT static contractual vs current-state authority;
- SCF/Advanced-Payable directionality;
- provider/runtime/network/dynamic-execution exclusions remain effective.

No provider support, valuation/execution readiness, Production readiness, real-money trading, or real-capital authorization may be inferred.

## Finding contract

For every surviving material finding provide:

- stable ID;
- severity;
- exact file + symbol/method route;
- minimal constructible witness;
- real CPython result where applicable;
- exact predecessor/candidate scanner output where applicable;
- actual MRO / `super()` route;
- violated invariant and impact;
- `VALID` or `INVALID`;
- `OWNER DEFECT`, `HARNESS DEFECT`, or `DOCUMENT-GOVERNANCE DEFECT`;
- smallest bounded correction.

Distinguish false positive from false negative and explain why it is material to this bounded recertification contract.

Do not authorize merge. Do not authorize Production or real capital.

Only if ALL mandatory probes were executed/adjudicated, exact frozen binding is valid, and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK

If any material finding survives, end with:

VALIDACIÓN NO OK
