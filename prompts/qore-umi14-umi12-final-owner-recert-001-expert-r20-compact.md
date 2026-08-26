# QORE UMI-12 final owner recertification — DeepSeek Expert R20

You are the independent adversarial Expert reviewer. CI green is evidence, never semantic proof. Falsify before certifying.

## Exact immutable binding
- qore-core PR: #461
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `3bbf8964df92dc112bf4279ebced67d9e94b8a87`
- HEAD TREE: `69e209c9d672d0291cf542f69607b0d460f2b0fa`
- SYNTHETIC: `5f4680f7d1722bd50d8c237288803b7640486d92`
- synthetic parents MUST be exactly `[BASE, HEAD]`
- synthetic TREE MUST equal HEAD TREE
- exact-head QORE CI #1531 / run `33004782926`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 692 source files
  - Pytest 4452 passed / 6 historical PytestCollectionWarning
  - coverage 87% / TOTAL 47568 stmts, 6234 missed
- diff: 59 ahead / 0 behind, 29 changed files, docs/tests only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged

Reject the package if live binding differs.

## Contract / bounded owner universe
D04 owner discovery is the current repository convention, not arbitrary future naming:
- all current `*_semantics.py`;
- all current `*_qualification.py` except `dataset_integrity_qualification.py`;
- plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`.
Do NOT require indefinite `*.py` classification or hypothetical `future_d04_owner.py` absent repository evidence changing this convention.

The candidate must preserve: exact owner discovery; absolute/relative import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; no provider symbol laundering; RATE != YIELD != SPREAD != PRICE != NAV != IV; NOTIONAL != QUANTITY != WEIGHT; generic owners remain generic; product qualifications retain specific material; Sukuk != Shari'ah cross-family ownership; ILS != event-contract semantics; SFT terms != current position/risk/collateral state; SCF ICC-2017 vs Advanced Payable non-collision; product composition does not absorb specific payoff authority; deterministic/immutable/secret-free evidence; no production/provider-readiness claim.

## Latest accepted finding and R19 correction to falsify
R19B found a real HIGH in R18 `AnnAssign` ordering: `eval: eval("1+1")` was hidden because the scanner bound the target before scanning the annotation. Python semantics are now modeled as:
- module/class `AnnAssign` without future annotations: evaluate VALUE first when present, bind target only when value exists, then evaluate annotation;
- annotation-only `name: annotation` does NOT bind `name`;
- function-local variable annotations are not evaluated;
- `from __future__ import annotations` postpones annotation execution.

R19 also hardens bounded execution-context gaps independently found during adjudication:
- `global` declarations must preserve module/builtin lookup rather than be treated as local shadowing;
- comprehensions use their own scope, while the leftmost iterable executes in the enclosing scope; later iterables/filters/body execute in comprehension scope;
- lambda defaults execute at lambda creation; lambda body remains deferred and uses lambda-local parameter shadowing;
- `match` subject, guards and case bodies are scanned without treating pattern names as pre-existing locals outside their case semantics;
- `except` / `except*` matching type expressions execute and must be scanned; handler binding is scoped to the handler path.

Attempt to construct accepted-invalid and rejected-safe witnesses around these exact semantics, including nested class/function interaction, decorators/default arguments, annotation shadowing, named expressions and branch merges. Stay bounded to concrete static Python semantics; do NOT demand whole-program arbitrary taint/alias analysis.

## Regression invariants that MUST remain closed
Preserve representative R6–R18 behavior, especially:
- builtins aliases, `__dict__`, `vars`, `getattr`, `.get`, `__getitem__`;
- `eval/exec/__import__.__call__` and equivalent callable extraction;
- direct/static aliases, constant strings and static f-strings;
- `operator.getitem`, `itemgetter`, `attrgetter`;
- negative and bool indices;
- duplicate bool/int dict keys obey Python last-write-wins;
- exact selected-slot semantics with safe co-presence negatives;
- builtins namespace extraction through containers and bound mapping aliases;
- class lexical scope: method bodies do not close over class locals; class-body evaluation still uses class execution environment;
- present builtins `.get` member dominates dangerous default; missing member uses default;
- function argument/return annotations, module/class `AnnAssign`, postponed annotations, function-local annotation safe behavior;
- decorators/defaults continue to execute regardless of postponed annotations where Python does so.

## Review method
Inspect every changed file completely using harness-provided evidence and necessary repository reads. Try to falsify the newest R19 scanner and the complete owner/oracle scan. A finding is material only with a concrete current-contract witness and real Python semantics. Distinguish false negative from false positive. Do not recommend widening the owner convention without repository evidence.

## Output contract
For every material finding provide:
1. severity;
2. exact file/symbol;
3. minimal reproducible witness;
4. ACTUAL scanner/suite behavior;
5. EXPECTED behavior under real Python semantics and this bounded contract;
6. violated invariant/impact;
7. smallest safe correction.

If no material finding survives falsification, say exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize Production, provider readiness, real capital, Program-D final PASS, or merge.