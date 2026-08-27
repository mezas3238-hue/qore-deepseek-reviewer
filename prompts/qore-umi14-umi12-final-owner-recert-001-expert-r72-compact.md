# DeepSeek Expert R72 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, the exact frozen checkout, and raw executable evidence from this run are authoritative. Do not inherit R70 or R71 verdicts.

## Frozen candidate

- Core repo: `mezas3238-hue/qore-core`
- PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `7da433d6880b781908cc0ed14f66cd2790dc0d98`
- HEAD tree `db48f72967402ab2325aece0d9283866fb4dbd85`
- SYNTHETIC `b85777bc72fd4d66c57a50b11a0238c2c1d252c0`
- synthetic parents must be BASE then HEAD and tree must equal HEAD tree
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- oracle blob expected unchanged: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- no intended `src/qore` delta

## Exact-head QG

QORE CI #1621 / run `33124236848` is the exact current-head gate: CPython 3.12.14, Ruff clean, Mypy clean over 728 files, 4718 tests passed, six pre-existing PytestCollectionWarning entries, 87% `src/qore` coverage. Verify/reason independently; CI green is not semantic proof.

## Reviewer-history boundary

R70 reviewed an older Core HEAD and produced evidence that led to R62B; it is consumed and cannot certify this candidate. R71 is also consumed: binding succeeded but reviewer v6 mechanically blocked publication because the explorer failed to call the mandatory tool. R71 produced no semantic review and must not be treated as CLEAN or as a Core defect.

Reviewer v7 now executes the mandatory CPython/R62B matrix deterministically BEFORE the first model call and injects its raw output into this review context. That PRE-EXECUTED MANDATORY EVIDENCE is primary evidence. Do not request the same suite again unless you need to inspect the cached output.

## Highest-priority falsification

Adjudicate every pre-executed dangerous/safe pair. In particular, do not miss these newly added attacks:

1. `(lambda: eval)()("1+1")` versus safe `(lambda: len)()("abc")`.
2. `getattr(importlib, "import_module")("math")` versus safe computed importlib attribute.
3. `importlib.__dict__["import_module"]("math")`.
4. `vars(importlib)["import_module"]("math")`.

For each dangerous path, if real CPython executes the dynamic code/import and `scanner=r62b` returns an empty tuple, classify `VALID / MATERIAL / HARNESS DEFECT`. Do not dismiss it because R62B was intentionally bounded; the final-owner harness contract is to fail closed on real dynamic execution/import reachable in current owner/oracle source.

## Mandatory R62B regression matrix

Explicitly adjudicate, from the pre-executed raw results:

- legal multiple-star AST/runtime and scanner behavior;
- failed-star chronology: later POSITIONAL expression not executed; KEYWORD VALUE expression executed by CPython 3.12;
- `candidate=eval("1+1")` after failed star must mark the nested execution;
- bare `candidate=eval` after failed star may stay clean because no dangerous call/binding escapes;
- safe keyword execution after failed star remains clean;
- direct `return eval` and computed dangerous return fail closed; `return len` inverse remains clean;
- direct `importlib.import_module`, module alias/rebound callable, and from-import alias fail closed;
- successful opaque-call dangerous positional/direct keyword/computed keyword/`**mapping` escapes remain marked;
- safe direct/computed `len` inverses stay clean;
- `getattr(builtins,"__import__")`, `vars(builtins)["eval"]`, and `builtins.__dict__["eval"]` remain marked.

A marker may be `call:N`, `binding:N`, `dangerous-escape:N`, or another explicit fail-closed marker. The material question is whether executable dangerous behavior can pass with no marker.

## Actual code/MRO discipline

Read actual class declarations and relevant methods; do not infer inheritance by R-number. Verify the relevant current path from R62B downward. Historical warning to verify, not blindly repeat: R59 intentionally resumes from R57 rather than inheriting R58. For every finding, cite the actual path/method responsible.

## Broader PR closure

After the executable correction attacks, spend remaining evidence budget on material falsification of:

- exact D04 owner/qualification universe and frozen manifest;
- all 19 Program-D family bindings to UMI-02 identity;
- provider/listing identity vs economic identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- generic/product qualification directionality;
- Sukuk/Shari'ah, ILS/event-contract, SFT static/current-state, SCF/Advanced-Payable separation;
- provider/runtime/network/dynamic execution exclusion;
- historical oracle integrity;
- changed-file audit proving no `src/qore` mutation;
- no Production/provider-readiness/real-capital authorization claim.

## Finding contract

Each material finding must include: stable ID; severity/materiality; exact path/line/symbol; minimal witness; real CPython result where relevant; exact R62B scanner result; actual verified MRO/code path; violated invariant/impact; classification `VALID` or `INVALID`; `OWNER DEFECT` or `HARNESS DEFECT`; smallest bounded correction.

Conservative fail-closed incompleteness is not automatically a defect. Conversely, a real dangerous action that executes with an empty scanner result is material even if a containing call later fails.

## Failure/CLEAN contract

If binding/evidence is unavailable or mandatory evidence cannot be adjudicated, return `MECHANICAL REVIEW FAILURE`; never manufacture CLEAN.

Only if every mandatory attack is adjudicated and no material finding survives, end literally:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

If any material finding survives, list it and end `VALIDACIÓN NO OK`.

Do not authorize merge, Program-D PASS, provider readiness, Production readiness, Production execution, or real capital. Integration Authority is final.
