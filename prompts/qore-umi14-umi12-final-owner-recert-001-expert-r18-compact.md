# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R18

Act as an independent adversarial expert reviewer. Do not self-certify and do not infer semantic approval from green CI.

## Exact binding

- Repository: `mezas3238-hue/qore-core`
- PR: #461
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `c08ae8a97f93713edf4bf85442bb426c5e371166`
- HEAD TREE: `d565979478281d14d2f7672be3807bbcc9d58cf2`
- SYNTHETIC: `7188802f7b913a2eaa64b4641aa00ce90248aade`
- Synthetic parents must be exactly `[BASE, HEAD]` and synthetic TREE must equal HEAD TREE.
- Compare: 57 ahead / 0 behind; 25 changed files; docs/tests only; `src/qore` delta = 0.
- Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is unchanged.
- QORE CI #1529 / run `32996286996` / job `98266346426`: SUCCESS.
  - Ruff: all checks passed.
  - Mypy: success, 690 source files.
  - Pytest: 4429 passed, 6 historical `PytestCollectionWarning` warnings.
  - Coverage: 87% (`47568` statements / `6234` missed).

If any live binding differs, fail closed and report the mismatch instead of reviewing another candidate.

## Scope

Issue #458 / parent #363. This is final Program-D UMI-12 owner-universe falsification recertification. Candidate must remain test/doc-only. Do not infer provider support, valuation methodology, execution capability, Production readiness, or real-capital authority.

Current bounded D04 owner convention is: current `*_semantics.py`, current `*_qualification.py` excluding `dataset_integrity_qualification`, plus the six frozen legacy owners. Do not demand arbitrary owner naming such as `future_d04_owner.py` without repository evidence.

Older R4-R16 layers are regression evidence. Newest authoritative scanner is:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r17_guards.py`

The complete suite may rely on the newest layer to close later findings; do not require every historical helper to independently implement newest semantics.

## R17 provenance and accepted corrections

Expert R17 reviewed old HEAD `ad556f18f8c148087a6030993ed279f1b8500fea` and returned two findings. Independent adjudication accepted both as real. That review is provenance only after mutation.

### Accepted R17 finding 1 — class lexical scope

Python class namespaces are execution namespaces, not lexical closures for method bodies. Old scanner incorrectly let class-local `eval` shadow builtin `eval` inside a method.

Exact previously failing witness, now MUST be detected:

```python
class Safe:
    eval = lambda value: value

    def run(self):
        eval("1+1")
```

R17 separates class-body execution environment from the lexical parent used by method/lambda/comprehension bodies. First reproduce/falsify these categories:

Dangerous and MUST be marked:

```python
class C:
    eval = lambda value: value
    def run(self):
        eval("1+1")
```

```python
class C:
    __import__ = lambda value: value
    run = lambda self: __import__("math")
```

```python
class C:
    exec = lambda value: value
    values = [exec("pass") for _ in (0,)]
```

```python
class Outer:
    eval = lambda value: value
    class Inner:
        def run(self):
            eval("1+1")
```

Class header expressions also MUST be scanned:

```python
class DangerousBase(eval("object")):
    pass

class DangerousMeta(metaclass=exec("pass")):
    pass
```

Safe and MUST remain unmarked:

```python
class C:
    eval = lambda value: value
    eval("x")
```

```python
class C:
    def run(self):
        eval = lambda value: value
        eval("x")
```

Probe nearby bounded Python lexical-scope rules: nested functions inside methods, nested classes, class-body comprehensions/lambdas, decorators/defaults evaluated in class scope, and genuine module/function-local shadows. Do not demand arbitrary whole-program scope/data-flow analysis.

### Accepted R17 finding 2 — bound builtins `.get` present-member dominance

R16 fixed direct `.get`, but old bound `builtins-map:get` helper aliases still propagated a dangerous default for existing safe members.

Safe and MUST remain unmarked:

```python
import builtins
getter = builtins.__dict__.get
getter("len", eval)("abc")
```

```python
import builtins
import operator
getattr(builtins.__dict__, "get")("str", exec)("abc")
operator.attrgetter("get")(builtins.__dict__)("abs", eval)(1)
```

Dangerous and MUST be marked:

```python
import builtins
getter = builtins.__dict__.get
getter("missing", eval)("1+1")
getter("eval", len)("1+1")
```

Bound `__getitem__` dangerous members MUST remain dangerous:

```python
import builtins
getitem = builtins.__dict__.__getitem__
getitem("eval")("1+1")
getattr(builtins.__dict__, "__getitem__")("__import__")("math")
```

Check assignment aliases, `getattr`, `operator.attrgetter`, present-safe/missing/dangerous-existing keys, no-default `.get`, and `__getitem__` without inventing `.get` default semantics.

## Explicit annotation falsification probe

Independently determine whether Python annotation expressions create a material bounded blind spot in the scanner contract. Probe at minimum:

```python
def f(x: eval("1+1")):
    return x
```

```python
def f() -> exec("pass"):
    return None
```

```python
x: eval("1+1") = 1
```

Also distinguish behavior under:

```python
from __future__ import annotations
```

Do not report a finding merely because an AST expression exists: establish whether the recertification contract requires static rejection in that context and whether the witness represents dynamic execution under the relevant Python semantics. If a real bounded false negative exists, give exact witness and smallest safe fix. Avoid speculative policy broadening.

## Regression preservation R6–R16

Reproduce/falsify the previously accepted closure families, including:

- builtins aliases and `__dict__`/`vars` derivations;
- direct/bound `.get` and `__getitem__`;
- `getattr`, `vars`, `operator.getitem`, `operator.itemgetter`, `operator.attrgetter`;
- `eval.__call__` and dangerous callable extraction;
- static constant-string aliases/f-strings;
- positive/negative/bool indices;
- exact selected-slot semantics in tuple/list/mapping containers;
- duplicate bool/int/string mapping keys with Python last-write-wins;
- builtins namespace extraction from containers;
- helper identity preservation for `getattr`/`vars`;
- mapping `.get` default only on a statically known miss;
- safe co-presence must not become a false positive.

Representative required probes:

```python
{}.get("missing", eval)("1+1")
{"present": len}.get("present", eval)("x")
```
First dangerous; second safe.

```python
import builtins, operator
operator.itemgetter("getattr")(builtins.__dict__)(builtins, "__import__")("math")
operator.attrgetter("__call__")(eval)("1+1")
```
Both dangerous.

```python
{0: eval, False: len}[0]("x")
{False: len, 0: eval}[False]("1+1")
{1: eval, True: len}[1]("x")
{"x": eval, "x": len}["x"]("x")
```
Respect Python last-write-wins and bool/int equality.

```python
import builtins as b, operator
operator.getitem({"ns": b, "eval": len}, "eval")("x")
operator.itemgetter("eval")({"ns": b, "eval": len})("x")
```
Both safe.

## Whole candidate invariants

Inspect all changed files and necessary local dependency slices for material regressions in:

- exact bounded D04 owner discovery under the frozen convention;
- relative/absolute import normalization and generic/product directionality;
- provider/runtime/network authority exclusion;
- UMI-02 provider/listing-symbol vs economic-identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- Sukuk/Shari'ah, ILS/event-contract, securities-financing current-state, SCF/Advanced-Payable collision boundaries;
- determinism, immutability and secret-free evidence posture;
- unchanged historical oracle and `src/qore` delta = 0.

Do not treat CI success as semantic proof. Do not broaden the bounded scanner into arbitrary whole-program taint/execution analysis.

## Output

If any material defect exists, report each with severity, exact file/symbol, constructible minimal witness, ACTUAL, EXPECTED, violated contract, impact, and smallest safe fix. End exactly with `HALLAZGOS: N / VALIDACIÓN NO OK`.

If no material defect survives independent falsification, state evidence checked and end exactly with `HALLAZGOS: 0 / VALIDACIÓN OK`.
