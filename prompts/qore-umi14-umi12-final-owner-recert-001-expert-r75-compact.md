# DeepSeek Expert R75 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, the exact frozen checkout, and raw executable evidence generated inside this run are authoritative. Do not inherit prior reviewer verdicts and do not treat green CI as semantic proof.

## Frozen candidate binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `b0377ee6962c38c4189f566677669027d76fed60`
- HEAD tree: `3151a458a845a87deb6367336471f451a50dfacce`
- SYNTHETIC: `17128a9c0ad0d7fdf055c276f6df3ee9ac2a547e`
- Synthetic ordered parents MUST be BASE then HEAD.
- Synthetic tree MUST equal HEAD tree.
- Historical oracle: `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py`
- Historical oracle blob expected unchanged: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- Changed-file scope: 104 paths, docs/tests only; `src/qore` delta MUST remain zero.

## Exact-head Quality Gate

QORE CI #1630 / run `33127571375` / job `98709243249` completed SUCCESS for this exact HEAD/synthetic:

- CPython 3.12.14
- Ruff: all checks passed
- Mypy: no issues in 730 source files
- Pytest: 4746 passed
- same six pre-existing PytestCollectionWarning entries
- `src/qore` coverage: 47568 statements / 6234 missed / 87%

Use this as regression evidence only.

## Consumed-review boundary

R74 is consumed and MUST NOT certify this HEAD. R74 was a real published CLEAN review of older R62C HEAD `efd2933c...`, but Integration Authority independently found a material callable-default escape outside R74's matrix. Subsequent R62D Core mutations invalidated R74 for certification purposes.

The current candidate is R62D. Your task is to falsify R62D independently.

## Mandatory pre-model evidence

Reviewer v11 executes the deterministic R62D CPython/scanner matrix BEFORE the model call. Execute/adjudicate that evidence first. Scanner outputs for the successor MUST identify `scanner=r62d`; predecessor comparison outputs MUST identify `scanner=r62c`.

If the matrix is missing, targets the wrong scanner, errors, or any mandatory witness is not actually executed, return `MECHANICAL REVIEW FAILURE`. Do not manufacture CLEAN from test names or prose.

## Priority A — prove the R74-discovered callable-default defect is genuinely closed

Compare real CPython 3.12 behavior, predecessor R62C output, and successor R62D output for all of these:

1. function positional default `def reveal(candidate=eval): ...` followed by omitted-argument escape and execution;
2. function keyword-only default `def reveal(*, candidate=eval): ...`;
3. lambda positional default `(lambda candidate=eval: candidate)()("1+1")`;
4. lambda keyword-only default `(lambda *, candidate=eval: candidate)()("1+1")`;
5. computed defaults via `getattr(builtins, "eval")` for function and lambda;
6. safe `len` inverses for function and lambda;
7. container default carrying `eval`, e.g. `(eval,)`, followed by exact extraction and execution;
8. function and lambda defaults carrying `importlib.import_module` followed by loading `math`;
9. function default storing the `importlib` namespace itself while the body may ignore the parameter, then `function.__defaults__[0].import_module("math")`;
10. lambda default storing the `importlib` namespace itself, then `lambda.__defaults__[0].import_module("math")`.

For the two namespace-default witnesses, require real runtime output `math`, predecessor R62C `()`, and an explicit R62D fail-closed marker. A runtime-executable dangerous path with R62D `()` is `VALID / MATERIAL / HARNESS DEFECT`.

## Priority B — implementation correctness of the R62D capture mechanism

Read the actual R62D class and inherited methods. Prove, do not assume:

- defaults are evaluated exactly once by the inherited scanner;
- R62D captures the `_Value` already returned for the exact AST default node by identity;
- R62D does not rescan/re-evaluate default expressions;
- nested function/lambda scans use an independent capture frame;
- capture frames pop in `finally`, including failure/exception paths;
- no stale captured value leaks across repeated scans;
- computed dangerous values and safe inverses do not cross-contaminate;
- the new `importlib`-namespace-as-stored-default sensitivity is bounded to stored defaults and does not blanket-mark ordinary safe use.

A duplicate evaluation, capture-stack leak, or safe-negative regression that changes real Python reachability is material.

## Priority C — inherited R62C/R62B regressions must remain authoritative

Execute/adjudicate, not merely cite:

- `(lambda: eval)()("1+1")` and computed lambda-return `getattr(builtins,"eval")`;
- `getattr(importlib,"import_module")`, `importlib.__dict__["import_module"]`, `vars(importlib)["import_module"]`;
- `importlib.__dict__.get("import_module")`;
- `operator.getitem`, `operator.itemgetter`, `operator.attrgetter` importlib accessors;
- direct/static `importlib.import_module` and `from importlib import import_module` alias;
- `getattr(builtins,"__import__")`, `vars(builtins)["eval"]`, `builtins.__dict__["eval"]`;
- opaque-call positional/direct-keyword/computed-keyword/`**mapping` dangerous callable egress;
- legal multiple positional starred segments under real CPython;
- multiple-star dangerous-value egress;
- safe direct/computed `len` inverses.

## Priority D — CPython 3.12 failed-star chronology

Use executable probes. Do not infer evaluation order from source appearance.

Explicitly distinguish:

- a later positional expression after definitely failing `*None`;
- a later keyword value expression after that failed starred positional expansion;
- bare dangerous callable value `candidate=eval` versus executed nested expression `candidate=eval("1+1")`;
- marker retention for a dangerous action that already executed even if the containing call later fails.

If runtime executes a dangerous keyword value and the scanner emits no fail-closed marker, classify it material unless actual inherited semantics prove a different bounded contract. Explain with raw runtime and scanner outputs.

## Priority E — actual MRO / super routing

Reconstruct inheritance from actual class declarations and responsible methods, not filenames or R numbers. Trace R62D through R62C/R62B and far enough down the current chain to justify default scanning, lambda/function scope, call arguments, failure ordering, importlib/builtins helpers, and marker emission. Historical inheritance resets must be verified from code, not repeated from old reviews.

Every finding must name the actual method/path responsible.

## Priority F — owner/oracle and architecture closure

Only after the executable R62D attacks, materially falsify:

- exact live D04 owner/qualification discovery vs frozen manifest;
- all 19 Program-D family bindings to UMI-02 identity;
- provider/listing identity vs economic identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- generic/product qualification directionality;
- Sukuk vs Shari'ah;
- ILS vs event-contract;
- SFT static semantics vs current-state authority;
- SCF vs Advanced-Payable;
- provider/runtime/network/dynamic-execution exclusion;
- historical full-closure oracle byte integrity;
- changed-file audit proving no `src/qore` mutation;
- no Production/provider-readiness/Production-execution/real-capital authorization claim.

## Finding contract

For each material finding provide:

1. stable finding ID;
2. severity/materiality;
3. exact path + line/symbol;
4. minimal reproducible witness;
5. real CPython 3.12 result when semantics matter;
6. exact R62C predecessor result when relevant;
7. exact R62D successor result;
8. verified actual MRO/code path;
9. violated invariant and impact;
10. classification `VALID` or `INVALID`;
11. `OWNER DEFECT` or `HARNESS DEFECT`;
12. smallest bounded correction.

Conservative fail-closed incompleteness is not automatically a defect. Real executed dangerous behavior with no fail-closed marker is material even when an outer operation later fails.

## Mechanical / CLEAN contract

If exact binding, raw mandatory evidence, scanner identity, executable probes, or required adjudication cannot be completed, return `MECHANICAL REVIEW FAILURE` with the precise blocker.

Only if ALL mandatory attacks above were actually executed/adjudicated and no material finding survives, end literally with:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

If any material finding survives, list it/them and end with `VALIDACIÓN NO OK`.

Do not authorize merge, Program-D PASS, provider readiness, Production readiness, Production execution, or real capital. Integration Authority remains final.
