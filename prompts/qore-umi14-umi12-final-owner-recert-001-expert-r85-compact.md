# DeepSeek Expert R85 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial Expert reviewer. Review the exact frozen QORE Core candidate from first principles. Do not inherit any prior CLEAN verdict, CI conclusion, reviewer conclusion, or Integration Authority conclusion. GitHub live state, exact checkout, CPython behavior, and evidence reproduced in this run are authoritative.

## Exact freeze

- Core: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE tree: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `cb5d264dac42f2bf3b6f12acb8da070efd7c8191`
- HEAD tree: `a77cfad738d1fc9d78c0af997e153266d36a3328`
- SYNTHETIC: `d49b82c64e4d9c866db8c1df40d707c50ebe4d22`
- Synthetic parents MUST be BASE then HEAD.
- Synthetic tree MUST equal HEAD tree.
- Target: `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r62n_guards.py`
- Target blob: `0df0138326bfcd3cc0fa8b9f0cc6d62f50658d11`
- Immutable historical oracle: `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- Oracle blob MUST remain `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- PR diff: 237 commits, 116 files, +25709/-28; `docs/` and `tests/` only; `src/qore` delta zero.
- Core HEAD contains only normal workflows `ci.yml` and `oanda-practice-market-feed.yml`; no temporary R62N repair workflow/script may survive.

Exact required check `quality` is SUCCESS on run `33243130875`, job `99082473229`: CPython 3.12.14; Ruff `All checks passed!`; Mypy `Success: no issues found in 740 source files`; Pytest 4846 passed, 7 warnings; coverage TOTAL 47568 statements / 6234 missed = 87%. CI is evidence, not architecture certification.

No historical DeepSeek or Claude review certifies this HEAD.

## Priority adversarial target

R62N is a test-only falsification harness, not semantic owner. The latest material class repaired was failed `from module import *` authority under `TryStar` / `except*` and partial `ExceptionGroup` subgroup routing. CPython can bind earlier star exports before a later missing export raises. The scanner must preserve the correct partial dangerous authority independently for each exception subgroup and through nested `finally`, outer handlers, and normal downstream state.

Try to construct NEW runtime-dangerous false negatives. At minimum challenge:

1. failed star `__all__=["b","missing"]`, `b=eval` — later dangerous call MUST mark;
2. failed star `__all__=["missing","b"]` — runtime is safe; conservative marking is permitted but must not hide an FN elsewhere;
3. successful unknown star introducing a dangerous alias;
4. nested failed-star + finally + outer handler;
5. dangerous finalbody call before safe rebind;
6. statically proven safe lambda/builtin rebind must stay clean when deterministically proven;
7. `except* AttributeError` failed-star handler dangerous call;
8. downstream dangerous successor after `except*`;
9. TryStar + nested finally + handler;
10. TryStar finalbody before safe rebind;
11. `ExceptionGroup("eg", [AttributeError(...), ValueError(...)])`: dangerous call in first `except*` subgroup must be marked at that exact call;
12. same for second subgroup;
13. safe successor inversions must not acquire material deterministic false positives.

Then broaden falsification across loops, break/continue/else, nested try/except/else/finally, ordinary handlers and `except*`, handler cleanup, imports with partial left-to-right binding, multiple context managers, assert/NamedExpr/AnnAssign, BoolOp/IfExp, comprehensions/generators, return/raise routing, builtins namespace derivations, `vars`, `getattr`, `__dict__`, `operator.getitem`/`itemgetter`/`attrgetter`, bound mapping methods, static strings/concatenation/f-strings, lexical shadowing/closures/globals, deferred functions/lambdas/defaults/annotations, and direct/indirect `eval`/`exec`/`__import__`/`importlib` routes inherited from predecessors.

For any dangerous witness, compare real CPython execution/reachability with the exact current scanner output. A constructible runtime-dangerous path producing `()` is a material HARNESS DEFECT.

## Known conservative fingerprints — challenge, do not silently normalize

The Integration Authority observed these conservative boundaries on this HEAD/family:

- unavailable ordinary import before a builtin alias may still mark;
- a `with` path whose `__exit__` raises may conservatively preserve an unreachable successor;
- statically short-circuited BoolOp / unselected IfExp bindings may conservatively mark;
- direct handler-target cleanup can retain conservative evidence;
- failed-star order where the missing export occurs before dangerous `b` may conservatively mark because arbitrary external module namespace/order is not executed by the harness.

Do not change expected results to obtain green. Report a precision issue as material only if it violates the recertification contract and has a bounded deterministic correction without executing/importing arbitrary external modules. More importantly, test whether any conservative abstraction masks a runtime-dangerous FN.

## Owner/oracle closure

Independently verify:

- oracle byte identity and target binding;
- `src/qore` delta zero;
- no temporary staging artifacts in the PR final tree;
- current explicit 35-module D04 owner/qualification universe and live discovery/manifest equality;
- all 19 Program-D families remain UMI-02-bound as declared;
- provider/listing identity remains separate from canonical economic identity;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- generic vs product qualification directionality;
- Sukuk vs Shari'ah, ILS vs event contracts, SFT static terms vs current operational state, SCF vs Advanced Payable boundaries;
- provider/runtime/network/dynamic-execution exclusion is not weakened;
- evidence remains deterministic, immutable and secret-free where the recertification contract requires it.

No provider readiness, valuation/execution readiness, Production readiness, real-money trading, real-capital authorization, or merge authorization may be inferred.

## Finding contract

For every surviving material finding give: stable ID/severity; exact file + symbol/MRO/super route; minimal constructible witness; real CPython result where applicable; exact current scanner output; violated invariant/impact; `VALID` or `INVALID`; owner class (`OWNER DEFECT`, `HARNESS DEFECT`, or `DOCUMENT-GOVERNANCE DEFECT`); smallest bounded correction.

Do not report style preferences. If exact binding/evidence is mechanically invalid, end `MECHANICAL REVIEW FAILURE`.

If any material semantic finding survives, end:

VALIDACIÓN NO OK

Only if the exact freeze is valid, adversarial families were actually examined, and no material finding survives, end literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
