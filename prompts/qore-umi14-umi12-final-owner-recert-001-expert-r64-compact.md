# QORE UMI-14 / UMI-12 final owner-universe recertification — DeepSeek Expert R64

## Exact frozen binding

- Repository: `mezas3238-hue/qore-core`
- PR `#461`; issue `#458`; mode `EXPERT`
- Base `ebd0adf000874797653df92ea1c08a892cce6c8c`; tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- Head `ae0e43ca40a10b3ff71c3dcd9b93b885a1c54e9c`; tree `f6ef09487ea4dbfdf3198de51d723db31c4df15e`
- Synthetic `54f0b4b803449e9821a2f51a0f62288e08817d6c`; tree `f6ef09487ea4dbfdf3198de51d723db31c4df15e`
- Ordered synthetic parents: Base, Head
- QORE CI `#1614`, run `33115457033`, `SUCCESS`
- CPython 3.12.14; Ruff green; Mypy green over 726 files; Pytest `4694 passed`; exactly 6 pre-existing PytestCollectionWarnings; coverage 87%
- Base -> Head: `143 ahead`, `0 behind`; 96 changed files under `docs/` and `tests/`; `src/qore` delta = 0
- Historical oracle blob `249caa1504e2b62277a9389dc7e73bcabf12e7db` unchanged in Base and Head
- R61 file blob `96e3e3f6ae5f67b49f67bf06a50e0d72907db086`

Abort as mechanical-invalid on any mismatch. Review no other HEAD.

QORE Core is independent of DeepSeek/reviewer infrastructure. You are read-only. Never propose reviewer-specific dependencies inside Core.

## Why R64 exists

The prior Expert R63 package is CONSUMED and is NOT authority. It made a materially false Python claim while supposedly testing an explicit adversarial requirement: it stated that Python AST permits at most one starred positional argument per `Call` and that multiple starred segments are invalid syntax. That is false in CPython 3.12: calls such as `f(*a, *b)` are valid and the AST contains multiple `ast.Starred` arguments. Coder R63 is also consumed because it ran after the invalid Expert and did not independently prove the mandatory attack surface.

Do not repeat, rely on, or inherit either R63 verdict.

## Mission

Falsify R61 and the current UMI-12 owner-universe recertification FROM SCRATCH. Evidence > assumptions. Every Python grammar/ordering claim used to dismiss a witness must be empirically checked under Python 3.12 or directly proven from exact code.

### Mandatory prerequisite: prove multi-star grammar before any verdict

Run real Python and report the actual outputs of equivalent checks for:

```python
import ast
node = ast.parse("f(*a, *b)").body[0].value
print(type(node).__name__)
print(len(node.args))
print([type(arg).__name__ for arg in node.args])

def f(*args):
    return args
print(f(*(1,), *(2,)))
```

A correct review must acknowledge that multiple starred positional segments in one call are legal and represented as multiple `ast.Starred` nodes. If your environment contradicts this, provide exact interpreter version and raw output and classify the package MECHANICAL-INVALID rather than guessing.

## Mandatory R61 attacks — execute scanner AND real Python where meaningful

Inspect exact implementations of R61, R60, R59, R57, R56, R41, R39, R38, R35, R15, R12 and reconstruct actual MRO/method ownership.

At minimum execute/adjudicate all of these classes:

1. Prior MC-1 witnesses:
   - `builtins.__dict__.get(*arguments)` -> later `reveal(("eval", None))("1+1")`
   - `builtins.__dict__.__getitem__(*arguments)` -> later `reveal(("eval",))("2+2")`
   Unknown positional shape must fail closed.

2. Exact multiple-star dangerous mapping get:
```python
import builtins
builtins.__dict__.get(*("eval",), *(None,))("1+1")
```
Scanner must detect reachable dangerous callable.

3. Exact multiple-star safe inverse:
```python
import builtins
builtins.__dict__.get(*("len",), *(None,))("abc")
```
Scanner must remain clean.

4. Exact multiple-star `__getitem__` dangerous:
```python
import builtins
builtins.__dict__.__getitem__(*(), *("eval",))("1+1")
```
Verify real Python arity/result and scanner behavior.

5. Multiple unknown starred segments:
```python
import builtins
def reveal(a, b):
    return builtins.__dict__.get(*a, *b)
reveal(("eval",), (None,))("1+1")
```
Verify fail-closed behavior and whether `_r39_has_unknown_positional_shape` survives flattening of more than one unknown segment.

6. Mixed exact + unknown starred segments for `.get` and `.__getitem__`, in both orders. Determine whether dangerous reachability can be lost, and whether safe cases are spuriously marked.

7. Definite failure ordering with multiple stars. Use a side-effect witness, not prose. For example construct a later expression whose evaluation can be observed and verify whether `*None` prevents reaching it under CPython 3.12. Scanner must agree with runtime ordering.

8. Nested starred tuple/list expressions where legal, aliases, helper-produced sequences, and multiple stars whose expanded arity is invalid. Distinguish call-argument evaluation from callee arity failure.

9. R60 regressions: `getattr`, `operator.getitem`, `itemgetter`, `attrgetter`, safe inverses, unknown star, and `getattr(*None, eval(...))`.

10. Dynamic execution/import guards: `importlib.import_module`, direct alias from importlib, `__import__`, `builtins.__import__`, `getattr(builtins,"__import__")`, `vars(builtins)["eval"]`, `builtins.__dict__["eval"]`. Identify the exact guard; never claim `ast.Import` alone catches dynamic calls.

## Required broader checks

- Owner/qualification universe completeness from live tree and exact manifest equality; naming/suffix escapes and stale allowlists.
- Authority directionality: generic/product, provider/listing vs economic identity, SCF/Advanced-Payable, Sukuk/Shari'ah, ILS/event-contract, SFT static/current-state.
- CPython 3.12 scope semantics where relevant: module/function/class/lambda/default/comprehension/generator, locals/vars, MRO/super.
- False positives and false negatives with equal rigor.
- Historical oracle byte preservation and anti-self-comparison / anti-tautology / no skip/xfail/noqa/type-ignore/coverage weakening.
- Distinguish HARNESS DEFECT, OWNER DEFECT, MECHANICAL REVIEW FAILURE, NON-MATERIAL.

## Evidence discipline

Do NOT dismiss a required witness based on remembered Python grammar. Execute it.
Do NOT say a shape is invalid syntax without `ast.parse`/interpreter evidence.
Do NOT infer scanner behavior from test names; call the actual final scanner entrypoint or trace exact implementation.
Do NOT use R63 conclusions as evidence of correctness.

For every material finding provide severity, classification, exact path/symbol, minimal witness, real CPython result, scanner result, expected result, root cause, why existing tests miss it, and bounded correction ownership.

If and only if every mandatory witness was actually checked and no material defect survives independent falsification, finish exactly:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`
