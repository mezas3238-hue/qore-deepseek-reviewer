# DeepSeek Expert R66 — QORE UMI-12 final-owner recertification

Review FROM SCRATCH. Prior reviewer conclusions are non-authoritative evidence only. CI green is necessary, not semantic proof. Do not infer merge/readiness/Production authority.

## Exact frozen binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- issue: `#458`
- mode: `EXPERT`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE tree: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `6c9c667afb6f43c2e389a90742bbac4ccbab38ae`
- HEAD tree: `f71b6fc7e474e0b2f04f58af722baf746ca3944c`
- SYNTHETIC: `d3e3d40572f8c6958b21cb37cf92e59f73a9c2d2`
- SYNTHETIC tree: `f71b6fc7e474e0b2f04f58af722baf746ca3944c`
- ordered synthetic parents: BASE, then HEAD
- compare BASE...HEAD: ahead 147, behind 0, 98 changed files
- changed files: `docs/` + `tests/` only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is unchanged, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`

If live binding differs, STOP as MECHANICAL REVIEW FAILURE. Do not review another HEAD.

## Exact Quality Gate

QORE CI `#1618`, run `33120297115`, conclusion SUCCESS on exact HEAD above; checkout synthetic above.

Raw-log facts:
- CPython 3.12.14
- Ruff: all checks passed
- Mypy: no issues in 727 source files
- Pytest: 4705 passed
- warnings: 6 pre-existing PytestCollectionWarning
- coverage: 47568 statements / 6234 missed / 87%

## Current delta to falsify

Current correction is harness-only R62. Exact file:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62_guards.py`
Current blob: `628a025da20e8f507298cbbb8f8c4812c7749c93`.

R62 addresses dangerous callables escaping into a locally opaque call. Follow-up correction retains abstract values already produced while inherited argument scanning evaluates keyword expressions; it must NOT reevaluate keyword expressions. It now intends to catch computed keyword values such as:

```python
candidate=getattr(builtins, "eval")
candidate=builtins.__dict__["eval"]
**{"candidate": eval}
```

while preserving safe `len`, definite argument failure, exact starred expansion, mapping/accessor semantics, scope semantics and marker-free current owner/oracle surface.

Critical effective inheritance to reconstruct from source, not from this prompt alone:
R62 -> R61 -> R60 -> R59 -> R57 -> R56 -> R55 -> ... and the R39/R38/R35/R15/R12 machinery reached by `super()` where applicable. Confirm exact MRO and method ownership yourself.

## Mandatory evidence tools

Use repository evidence plus the executable evidence tools available in this reviewer: `read_file`, native `search_text`, repo/git state, `python_semantics_probe`, and `scanner_probe` for the exact frozen scanner surface. Do not infer Python behavior from memory when an executable probe can decide it.

If a mandatory probe cannot actually be executed or its exact source/result cannot be inspected, verdict must be `MECHANICAL REVIEW FAILURE`; do NOT print `VALIDACIÓN OK`.

## Mandatory high-value attacks

1. **Real CPython 3.12 multi-star grammar/runtime**. Execute equivalent probes:
```python
import ast
node = ast.parse("f(*a, *b)").body[0].value
print(len(node.args))
print([type(x).__name__ for x in node.args])
def f(*args): return args
print(f(*(1,), *(2,)))
```
Multiple starred positional segments are legal. Falsify scanner handling of more than one `ast.Starred`.

2. **R62 opaque dangerous escape**. Obtain actual scanner results for at least:
```python
def reveal(arguments, candidate):
    return {"x": candidate}.__getitem__(*arguments)
result = reveal(("x",), eval)("40+2")
```
Direct keyword `candidate=eval`; computed keyword `candidate=getattr(builtins,"eval")`; computed keyword `candidate=builtins.__dict__["eval"]`; `**{"candidate": eval}`; and safe `len` inverses.

3. **No double evaluation / order corruption**. Inspect the new capture stack and prove keyword expressions are recorded from the inherited evaluation, not rescanned. Attack side-effect/order-sensitive keyword expressions and nested opaque calls. Look for stale capture, recursive-call contamination, duplicate markers, or environment mutation twice.

4. **CPython 3.12 failure ordering**. Execute real probes, then compare scanner output:
- `f(*None, eval("1+1"))` or equivalent positional witness: determine exactly whether later positional expression executes.
- a failed starred positional expansion combined with a later keyword expression with observable side effect/danger: determine CPython 3.12 behavior exactly. Do NOT assume keyword and positional expressions share identical reachability rules.
- multiple-star variants with a failure in an earlier segment.

5. **Opaque/container return chains**. Try dangerous callable passed to a locally opaque function, stored in tuple/list/dict, recovered through static or unknown mapping/accessor selection, returned, then executed. Try both positional and computed-keyword ingress. Test false positives with `len` and definitively failing paths.

6. **Dynamic import/execution reachability**. Falsify at minimum:
- `importlib.import_module`
- imported alias of `import_module`
- `__import__`
- `builtins.__import__`
- `getattr(builtins, "__import__")`
- `vars(builtins)["eval"]`
- `builtins.__dict__["eval"]`
through direct, alias, opaque-argument and accessor paths where relevant.

7. **MRO/super regression**. Verify R62 does not accidentally bypass or weaken R61 unknown-starred mapping accessors, R60 exact starred helpers, R59/R57 Python-3.12 scope behavior, R56 call-scope handling, or lower exact mapping/selection/failure semantics. Use actual method definitions and executable probes.

8. **Owner/oracle integrity**. Verify exact current owner manifest/discovery surface, UMI-02 19-family binding, generic-vs-product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT static-vs-current-state, SCF/Advanced-Payable separation, provider/runtime/network exclusion, historical oracle byte preservation, and marker-free owner+oracle scan. Equal attention to false positives and false negatives; reject tautological/self-comparison evidence.

9. **Architecture boundary**. Confirm no `src/qore` change, no reviewer dependency in Core, no provider readiness, execution authority, valuation-methodology authority, Production readiness or real-capital authorization is introduced or inferred.

## Finding contract

For every candidate finding provide:
- ID, severity, materiality
- exact path/line/symbol
- minimal witness
- real CPython 3.12 result when semantics matter
- exact scanner result
- MRO/code path
- violated invariant and impact
- adjudication: `VALID`, `INVALID`, `NON-MATERIAL`, or `MECHANICAL REVIEW FAILURE`
- if VALID material: `OWNER DEFECT` or `HARNESS DEFECT`
- smallest bounded correction

Do not call a finding VALID solely because a static suspicion exists; reproduce it. Do not call CLEAN solely because current tests pass.

Only if every mandatory attack is actually discharged and no material finding survives, end literally:

HALLAZGOS: NINGUNO

VALIDACIÓN OK

Otherwise list findings and do not emit `VALIDACIÓN OK`.
