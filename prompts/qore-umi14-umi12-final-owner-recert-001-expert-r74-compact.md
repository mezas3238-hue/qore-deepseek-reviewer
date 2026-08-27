# DeepSeek Expert R74 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, the exact frozen checkout, and raw executable evidence generated inside this run are authoritative. Do not inherit prior reviewer verdicts or assume CI implies semantic correctness.

## Frozen candidate binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `efd2933c143900ed4f48369e0c6923cac0d728ee`
- HEAD tree: `ac43d8342667fd71c8a70b6263c9d91c10bb3b3c`
- SYNTHETIC: `a3eee060f1e2ebf9c18f0a27e2753bb9fcd55547`
- Synthetic ordered parents MUST be BASE then HEAD.
- Synthetic tree MUST equal HEAD tree.
- Historical oracle: `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- Historical oracle blob expected unchanged: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- Intended candidate delta remains tests/docs only; no `src/qore` mutation.

## Exact-head Quality Gate

QORE CI #1625 / run `33125664161` completed SUCCESS for this exact current HEAD/synthetic:

- CPython 3.12.14
- Ruff clean
- Mypy clean over 729 source files
- 4731 tests passed
- six pre-existing PytestCollectionWarning entries
- `src/qore` coverage 47568 statements / 6234 missed / 87%

Use this as necessary evidence, never as semantic proof.

## Consumed-review boundary

R70 through R73 are consumed and MUST NOT certify this HEAD.

- R70 reviewed an older candidate and contributed evidence leading to R62B.
- R71 and R72 were mechanical failures and published no semantic review.
- R73 reviewed the old R62B HEAD. Its deterministic pre-model matrix exposed four real R62B false negatives, but its model finalization failed mechanically and it published no review. Those four defects were independently adjudicated and corrected by R62C. R73 itself is not certification.

The current candidate is R62C. Your task is to falsify R62C independently.

## Pre-executed exact R62C evidence

Reviewer v9 executes a deterministic CPython/scanner matrix BEFORE the model call and injects the raw output into this context. The scanner entries MUST identify `scanner=r62c`. Treat this raw evidence as primary evidence and explicitly adjudicate it.

If the matrix is missing, still targets r62b, errors, or cannot be adjudicated, return `MECHANICAL REVIEW FAILURE`; never manufacture CLEAN.

## Mandatory R62C attacks

Explicitly adjudicate every item below.

### A. The four former R62B escapes MUST now fail closed

Compare real CPython behavior with exact `scanner=r62c` output for:

1. `(lambda: eval)()("1+1")`
2. `getattr(importlib, "import_module")("math")`
3. `importlib.__dict__["import_module"]("math")`
4. `vars(importlib)["import_module"]("math")`

For each dangerous path, a real executed dynamic action with scanner output `()` is `VALID / MATERIAL / HARNESS DEFECT`. Any explicit fail-closed marker such as `binding:N`, `call:N`, or `dangerous-escape:N` is acceptable if the path is actually contained.

### B. R62C successor forms

Falsify the correction beyond the four literal witnesses:

- computed lambda body: `lambda: getattr(builtins, "eval")`;
- importlib module alias plus dangerous callable rebinding;
- `vars(importlib)` namespace alias -> subscript -> callable rebinding;
- `importlib.__dict__.get("import_module")`;
- `operator.getitem(importlib.__dict__, "import_module")`;
- `operator.itemgetter("import_module")(vars(importlib))`;
- `operator.attrgetter("import_module")(importlib)`;
- safe computed importlib inverses (`util` via getattr / `__dict__` / vars);
- safe lambda `len` inverse.

Dangerous forms must fail closed. Safe inverses must not become blanket false positives.

### C. R62B inherited chronology and egress regressions

Verify R62C preserves the prior closures:

- legal multiple positional starred segments under real CPython;
- after a definitely failing `*None`, later positional expression is not evaluated;
- after that same failed star, keyword value expressions are evaluated by CPython 3.12;
- nested `candidate=eval("1+1")` after failed star must therefore be marked;
- bare `candidate=eval` after failed star may remain clean when no dynamic action/binding escapes;
- direct `return eval` and computed `return getattr(builtins,"eval")` fail closed;
- safe `return len` stays clean;
- successful opaque-call positional/direct-keyword/computed-keyword/`**mapping` dangerous callable escapes remain marked;
- multiple-star dangerous value escape remains marked;
- safe direct/computed `len` inverses remain clean.

A containing call that later raises does not erase dangerous code already executed during expression evaluation.

### D. Builtins/dynamic import execution surface

At minimum falsify:

- `getattr(builtins, "__import__")`;
- `vars(builtins)["eval"]`;
- `builtins.__dict__["eval"]`;
- direct/static `importlib.import_module`;
- static module/from-import aliases;
- bounded container/callable-return chains that can expose dangerous callables.

Do not require a particular marker spelling; require fail-closed behavior.

## Actual MRO / implementation path

Read the actual class declarations and responsible methods. Do NOT infer inheritance from filenames or R numbers. Reconstruct the current R62C path far enough to justify every scanner claim. Historical warning to verify rather than blindly repeat: R59 intentionally resumes from R57 instead of inheriting R58.

For every material finding identify the actual method/path responsible.

## Broader owner-universe recertification

After the current-correction attacks, use remaining evidence budget to materially falsify the PR contract:

- exact live D04 owner/qualification discovery vs frozen manifest;
- all 19 Program-D family bindings to UMI-02 identity;
- provider/listing identity vs economic identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- generic/product qualification directionality;
- Sukuk vs Shari'ah separation;
- ILS vs event-contract separation;
- SFT static semantics vs current-state authority separation;
- SCF vs Advanced-Payable separation;
- provider/runtime/network/dynamic-execution exclusion;
- historical full-closure oracle integrity;
- changed-file audit confirming no `src/qore` mutation;
- no Production/provider-readiness/real-capital authorization claim.

Prioritize executable falsification and current R62C behavior over broad prose review.

## Finding contract

For each material finding provide:

1. stable finding ID;
2. severity/materiality;
3. exact path + line/symbol;
4. minimal reproducible witness;
5. real CPython result when semantics matter;
6. exact R62C scanner result;
7. verified actual MRO/code path;
8. violated invariant and impact;
9. classification `VALID` or `INVALID`;
10. `OWNER DEFECT` or `HARNESS DEFECT`;
11. smallest bounded correction.

Conservative fail-closed incompleteness is not automatically a defect. Conversely, real executed dangerous behavior with no fail-closed marker is material even if a later outer operation fails.

## Mechanical/CLEAN contract

If exact binding, raw mandatory evidence, scanner target, or required adjudication cannot be completed, return `MECHANICAL REVIEW FAILURE` and state the precise blocker.

Only if ALL mandatory attacks above have been executed/adjudicated and no material finding survives, end literally with:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

If any material finding survives, list it/them and end with `VALIDACIÓN NO OK`.

Do not authorize merge, Program-D PASS, provider readiness, Production readiness, Production execution, or real capital. Integration Authority remains final.
