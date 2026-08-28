# DeepSeek Expert R81 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, the exact frozen checkout, and raw executable evidence produced inside this run are authoritative. Do not inherit any prior CLEAN, failure, Claude conclusion, or Integration Authority assumption.

## Frozen Core binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `aa909351ce6e4d3f82b77bcfe318986e730eae87`
- HEAD tree: `47af2a690d56ed0d92e783a36f252901a7ce725f`
- SYNTHETIC: `ac9f79bf18a13bb03645cb2633ab3739a3b97aa7`
- Synthetic parents MUST be BASE then HEAD.
- Synthetic tree MUST equal HEAD tree.
- Historical oracle blob: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- R62K blob: `f5ed004442320e79a49641d7e4d059e938446a4a`
- Scope: 113 changed files, 182 commits ahead / 0 behind, docs/tests only, `src/qore` delta zero.

Exact-head QORE CI #1653 / run `33158173256` / job `98805881291` is SUCCESS on the frozen synthetic: CPython 3.12.14, Ruff `All checks passed!`, Mypy `Success: no issues found in 737 source files`, 4806 tests passed, the same six pre-existing PytestCollectionWarning instances, coverage TOTAL 47568 statements / 6234 missed = 87%.

## Consumed / invalidated review boundary

All prior DeepSeek and Claude reviews are historical evidence only. In particular, R80 Expert CLEAN certified old R62G HEAD `9a2924976ae7a0eeace45ef0bcafedf1b4555aba`, not this candidate. Core subsequently mutated through R62H/R62I/R62J/R62K hardening and documentation. No earlier CLEAN certifies HEAD `aa909351...`.

R62J correctly closed a late-module-authority false negative for deferred `globals()` bodies by enriching them with execution-authority states appearing after lexical definition. Its future-suffix model was then independently falsified for precision: authority existing only transiently after definition was retained even when rebound or removed before every point at which the callable could actually execute.

R62K is the bounded successor. It retains R62J as the conservative fallback, but for ordinary synchronous top-level callables whose reachability remains inside a direct-name alias model it uses only callable-observable module states: direct/alias invocation state plus final state while still reachable. Escapes, nested deferred uses, async functions, generators, and non-modelled uses remain conservative.

Review this correction from first principles. A CLEAN based only on regression tests is invalid.

## Priority 0 — mandatory R62K executable evidence

Reviewer v17 injects deterministic pre-model evidence and exposes exact frozen scanners as `scanner=r62j` and `scanner=r62k`. You MUST adjudicate the raw output. If mandatory probes are missing, error, use the wrong scanner/HEAD, or cannot be reconciled with the frozen checkout, return `MECHANICAL REVIEW FAILURE`; never return CLEAN on incomplete evidence.

### A. Exact accepted R62J precision defect

For a transient authority that is rebound before the only invocation:

```python
def run():
    return globals()["b"].eval("1+1")
import builtins as b
b = len
try:
    result = run()
except AttributeError:
    result = 3
```

require raw evidence that real CPython cannot reach `eval`, predecessor `scanner=r62j` retains the deferred-danger marker, and candidate `scanner=r62k` is clean.

For an uninvoked callable made unreachable before final state:

```python
def run():
    return globals()["b"].eval("1+1")
import builtins as b
run = len
b = len
result = 3
```

require the same predecessor/candidate precision differential. If R62K still marks these exact unobservable paths, classify a material bounded precision defect. If the correction achieves cleanliness by erasing reachable authority elsewhere, classify the corresponding false negative.

### B. Over-correction attacks — these MUST remain fail-closed

Adjudicate raw runtime/scanner evidence for:

- direct invocation while `b` is the `builtins` module;
- invocation through a tracked direct-name alias while dangerous;
- callable stored in a mapping/list/attribute and invoked after escape;
- callable invoked from another deferred function body;
- annotated-alias escape where a runtime annotation retains the callable under standalone Python semantics;
- final module state that remains dangerous while the callable is still reachable;
- async function and generator-backed callable paths, which are outside R62K's bounded immediate model and must retain the conservative R62J authority;
- nested callable bodies that must not be incorrectly attributed to their outer top-level owner.

A runtime-dangerous construction with candidate output `()` is `VALID / MATERIAL / HARNESS DEFECT`.

### C. Standalone annotation semantics are mandatory

R62K runtime witnesses deliberately execute with `compile(..., dont_inherit=True)`. The pytest module itself imports `annotations` from `__future__`, but the source under certification is a standalone Python program and must not inherit that compiler flag.

Verify that the annotated-alias witness is adjudicated under standalone semantics, not accidentally converted to string annotations by the test harness. Treat inherited compiler flags that alter witness behavior as a mechanical/harness defect.

## Required R62K implementation-path adjudication

Read the current code and trace actual MRO / `super()` routing. At minimum inspect:

- `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62k_guards.py`;
- R62J future-authority model;
- R62I module/parameter namespace selection;
- R62H local runtime-scope classification;
- R62G retained-namespace precision;
- R62E/R62D default retention;
- R12 expression/environment machinery.

Verify specifically:

- `_r62k_top_level_owner_calls` never assigns nested function/lambda bodies to a top-level owner;
- `_r62k_immediate_called_owners` distinguishes immediate evaluation from deferred function/lambda/generator bodies;
- owner bindings are updated correctly across definitions, direct aliases, imports, assignments, annotations, deletion, and rebinding;
- direct-name alias tracking cannot silently treat an escaping use as safe;
- `_r62k_escaped_owners` fails closed for containers, attributes, annotations, nested deferred calls, and other unmodelled uses;
- async/generator owners do not receive unsound synchronous precision;
- final state contributes only while a tracked binding still reaches the callable;
- a callable with no modeled invocation and no final reachability can legitimately have no observable module state;
- R62K does not rescan/re-evaluate callable bodies/defaults or invent hidden execution;
- R62K does not change owner/oracle code or `src/qore`.

## Same-statement / evaluation-order attack

Integration Authority explicitly challenged R62K with this adjacent witness:

```python
import builtins
b = len
def run():
    return globals()["b"].eval("1+1")
result = ((b := builtins), run())[1]
b = len
run = len
```

Real CPython executes `eval`. R62K's observable-state helper works at top-level statement granularity, so do not assume that helper alone catches it. Trace the inherited scanner: R12 has explicit `ast.NamedExpr` evaluation, marks a sensitive binding, assigns the target into the live environment, and therefore the overall candidate evidence is expected to remain non-empty.

Try to falsify that adjudication. Test left-to-right variants, call arguments, tuples/lists, nested expressions, and safe inverses. A constructible runtime-dangerous same-statement mutation with *all* candidate evidence empty is material. Do not demand a new R62 layer merely because the observable-state helper itself does not duplicate a marker already emitted by an inherited authoritative layer.

## Adjacent high-value falsification focus

Use the exploration round for omitted same-family attacks, including:

- alias chains followed by partial rebinding/deletion;
- multiple aliases where one survives to final dangerous state;
- aliases shadowed by imports/classes/functions;
- decorator/default/annotation evaluation that invokes an existing tracked callable;
- callable references inside keyword arguments, comprehensions, lambdas, generator expressions, containers, attributes, and subscripts;
- nested function references to the tracked callable before/after authority rebinding;
- callable return/storage paths that escape without an immediate invocation;
- `global` mutation and sensitive `NamedExpr` chronology;
- safe `len`/ordinary mapping inverses and impossible/unreachable authority states.

Only report constructible material defects. The contract is a bounded static falsification harness, not a general Python interpreter. Precision improvements must not weaken fail-closed detection outside the explicitly proven model.

## Prior mandatory matrices remain mandatory

Reviewer v17 inherits prior pre-model suites and routes the current-candidate side through exact `scanner=r62k`. Adjudicate them, including:

- R62G module/function/comprehension locals/vars/globals scope precision;
- R62E retained globals/locals/vars helper defaults and nested retention;
- R62D function/lambda/default-container/importlib/module-namespace default egress;
- R62C lambda return and computed importlib lookup/alias/rebinding/operator paths;
- R62B return egress, direct importlib, multi-star, failed-star keyword chronology and safe inverses;
- R62/R61/R60/R59/R57 scope/fallback regressions;
- safe `len`, missing-key, shadowed-helper, and ordinary-mapping inverses.

Do not accept a historical predecessor label as current evidence unless the current side is explicitly the exact R62K scanner loaded from HEAD `aa909351...`.

## Owner / oracle / recertification boundary

Reconfirm against the exact frozen candidate:

- no `src/qore` mutation;
- historical oracle blob remains exactly `249caa1504e2b62277a9389dc7e73bcabf12e7db`;
- complete owner + oracle surface is clean under the exact current scanner;
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

Distinguish false positive from false negative and explain materiality to this bounded recertification contract.

Do not authorize merge. Do not authorize Production or real capital.

Only if ALL mandatory probes were executed/adjudicated, exact frozen binding is valid, and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK

If any material finding survives, end with:

VALIDACIÓN NO OK
