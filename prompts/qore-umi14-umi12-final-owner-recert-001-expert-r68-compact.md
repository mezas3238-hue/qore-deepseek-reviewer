# DeepSeek Expert R68 — QORE UMI-12 final-owner recertification

Review FROM SCRATCH. Prior reviewer conclusions are non-authoritative evidence only. CI green is necessary, not semantic proof. Do not infer merge, provider readiness, execution authority, Production readiness, or real-capital authority.

## Exact frozen binding
- Core: `mezas3238-hue/qore-core`
- PR `#461`; issue `#458`; mode `EXPERT`
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `6c9c667afb6f43c2e389a90742bbac4ccbab38ae`
- HEAD tree `f71b6fc7e474e0b2f04f58af722baf746ca3944c`
- SYNTHETIC `d3e3d40572f8c6958b21cb37cf92e59f73a9c2d2`
- SYNTHETIC tree `f71b6fc7e474e0b2f04f58af722baf746ca3944c`
- ordered synthetic parents: BASE, then HEAD
- compare: ahead 147, behind 0, merge-base BASE, 98 changed files
- changed paths are `docs/` + `tests/` only; `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged, blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`

If any live binding differs, STOP as `MECHANICAL REVIEW FAILURE` and do not review another HEAD.

## Exact Quality Gate
QORE CI `#1618`, run `33120297115`, SUCCESS on exact HEAD; synthetic checkout above.
Raw logs: CPython 3.12.14; Ruff clean; Mypy clean in 727 source files; Pytest 4705 passed; 6 pre-existing PytestCollectionWarning; coverage 47568 statements / 6234 missed / 87%.

## Current correction under falsification
Harness-only R62:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62_guards.py`
blob `628a025da20e8f507298cbbb8f8c4812c7749c93`.

R62 must fail closed when a dangerous callable escapes into a locally opaque call, including computed keyword ingress, without reevaluating keyword expressions or weakening inherited mapping/starred/scope/failure semantics. Reconstruct exact MRO and method ownership; do not trust historical summaries.

## Evidence discipline and priority
Use `repo_state`, `read_file`, native `search_text`, `python_semantics_probe`, and exact `scanner_probe` including `scanner=r62`. Execute the highest-value mandatory probes in the FIRST TWO exploration rounds. Do not spend early rounds narrating history or reading unrelated hardening documents. If a mandatory executable probe is unavailable, return `MECHANICAL REVIEW FAILURE`, never `VALIDACIÓN OK`.

### Round-priority A — executable semantics + exact R62 scanner
1. Prove real CPython multi-star grammar/runtime with equivalents of:
```python
import ast
n = ast.parse("f(*a, *b)").body[0].value
print(len(n.args), [type(x).__name__ for x in n.args])
def f(*args): return args
print(f(*(1,), *(2,)))
```
Then compare R62 scanner results for dangerous and safe multi-star forms.

2. Obtain exact `scanner=r62` results for opaque dangerous-callable escape via:
- positional `eval`;
- direct keyword `candidate=eval`;
- computed keyword `candidate=getattr(builtins, "eval")`;
- computed keyword `candidate=builtins.__dict__["eval"]`;
- `**{"candidate": eval}`;
- corresponding safe `len` inverses.
At least one witness must store/select/return the candidate and then call it.

3. Failure ordering: use real CPython 3.12 probes and R62 scanner probes for an earlier failing starred positional expansion plus later positional/keyword expressions. Do not assume positional and keyword evaluation reachability are identical.

### Round-priority B — implementation falsification
4. Inspect R62 capture-stack implementation and inherited `_scan_call_arguments`. Prove captured keyword abstract values are the values already produced by inherited evaluation, not reevaluated syntax. Attack nested opaque calls, recursion/nesting, duplicate markers, stale capture, exception/failure cleanup, and repeated scans for state leakage.

5. Trace actual `super()`/MRO from R62 through R61/R60 and the effective lower machinery (including R59/R57/R56 and R41/R39/etc where actually reached). Verify R62 does not bypass:
- R61 unknown-starred mapping accessors;
- R60 exact starred helper expansion;
- Python-3.12 scope behavior;
- mapping/getitem/getattr selection semantics;
- definite-failure ordering.

6. Falsify dynamic execution/import reachability through direct/alias/opaque/accessor paths: `__import__`, `builtins.__import__`, `getattr(builtins,"__import__")`, `vars(builtins)["eval"]`, `builtins.__dict__["eval"]`, and `importlib.import_module` where statically relevant. Do not execute unsafe import witnesses; use scanner evidence.

### Closure invariants
7. Verify exact owner manifest/discovery and UMI-02 binding for all 19 families; owner/oracle surface marker-free; historical oracle unchanged; no tautological/self-comparison evidence. Spot-check semantic separations: provider/listing vs economic identity; rate/yield/spread/price/NAV/IV; notional/quantity/weight; generic/product qualification; Sukuk/Shari'ah; ILS/event-contract; SFT terms/current state; SCF/Advanced-Payable; composition/payoff authority.

8. Confirm architecture boundary: no `src/qore` delta, no reviewer dependency in Core, no provider/runtime/network authority introduced, and no provider/execution/valuation/Production/real-capital claim.

Give equal attention to false positives and false negatives.

## Finding contract
For each candidate finding provide: ID/severity/materiality; exact path/line/symbol; minimal witness; CPython 3.12 result when semantics matter; exact scanner result; MRO/code path; violated invariant/impact; classification `VALID`, `INVALID`, `NON-MATERIAL`, or `MECHANICAL REVIEW FAILURE`; if VALID material, `OWNER DEFECT` or `HARNESS DEFECT`; smallest bounded correction.

A static suspicion is not enough: reproduce it. CI green is not enough: falsify it.

Only if all mandatory probes are actually discharged and no material finding survives, end literally:

HALLAZGOS: NINGUNO

VALIDACIÓN OK
