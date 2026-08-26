# QORE UMI-12 final owner recertification — DeepSeek Expert R23

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `d2366381a630b67222328dc30878f60ec3e8e772`
- HEAD TREE `a5c7090db86ef52ef82d42e1bc695663d8492fce`
- SYNTHETIC `9b7e90c4054386e2989e6d622a98c892396a4f48`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1536 / run `33008132587`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 695 source files
  - Pytest 4471 passed / 6 historical PytestCollectionWarning
  - coverage 87% / 47568 statements / 6234 missed
- diff 64 ahead / 0 behind, 35 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/SYNTHETIC differs.

## R22 mechanical provenance
R22 is consumed and is NOT semantic certification. It made one planner/model call, then blocked before authoritative final analysis because complete evidence measured 397,549 chars against the old 320,000 final-evidence fuse. Its planner requested 67,535 extra chars and one result was clipped. No changed-file evidence was truncated and no semantic verdict was produced.

Reviewer infrastructure was therefore widened mechanically, without changing qore-core, model, authority, or fail-closed behavior: planned-result hard gate 80k chars, planned bundle 160k chars, final evidence 520k chars. Do not treat this infrastructure change as a QORE finding or candidate mutation.

### Planner discipline for R23
The guaranteed final bundle already contains the COMPLETE exact content of every changed file, exact modified-file patches, bounded direct local dependency slices, frozen PR/binding/CI evidence, and the target prompt. Do not request changed files, PR metadata, check-runs, or already-guaranteed dependency definitions again. Request an additional tool only if a specific material invariant truly requires evidence outside that guaranteed bundle. For the bounded scanner/Python-semantic falsification below, the guaranteed bundle should normally be sufficient; if so answer `EVIDENCE_COMPLETE` and make no tool calls. Never manufacture PASS from missing evidence.

## Bounded D04 contract
Current D04 universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not widen to hypothetical arbitrary filenames absent repository evidence.

Preserve exact discovery, absolute/relative import normalization, provider/runtime/network/execution exclusion, UMI-02 binding for 19 Program-D families, provider/listing identity != economic identity, anti-symbol-laundering, RATE/YIELD/SPREAD/PRICE/NAV/IV separation, NOTIONAL/QUANTITY/WEIGHT separation, generic/product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT current-state, SCF/Advanced-Payable, product/payoff authority boundaries, deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

## Latest adjudicated hardening
R20 H1 remains REJECTED: valued module/class `AnnAssign` order is RHS -> target/binding -> annotation; do not reverse it. R20 H2/H3 were real and fixed: nested `global` cannot close over same-named enclosing locals; method lambdas/comprehensions cannot inherit residual class locals. R20 also scans executable Attribute/Subscript expressions in assignment, annotated assignment, for/comprehension, with, and del targets.

R20B closes a deeper global/unbinding path: active function-global declarations carry the exact abstract global environment, nested `global` skips intervening ordinary locals, module/declared-global deletion may expose a builtin, function-local deletion stays locally unbound, and class deletion restores its lexical parent where Python semantics require it.

R20C closes class-body outer-scope mutation fail-closed. Python permits class-body `global`/`nonlocal`, but current D04 semantic owner classes have no repository-evidenced need to mutate module globals or enclosing cells during class execution. The scanner rejects class-body `global` or `nonlocal`; function-level `global` remains modeled. The complete current owner+historical-oracle scan is clean under this bounded rule.

## Adversarial focus
Try concrete current-contract witnesses around:
- nested `global` through two+ function levels with intervening locals, module reassignment/deletion, builtin fallback, safe active-global state, and combinations of `global` with nested classes/functions;
- `nonlocal` vs local/global lookup and deletion semantics, but do not demand arbitrary whole-program closure analysis;
- module/function/class deletion and subsequent lookup semantics;
- class-body `global`/`nonlocal` fail-closed: find a repository-valid safe negative proving it overbroad, or an actual bypass still missed;
- lambdas/comprehensions/classes/functions inside methods vs directly in class bodies;
- first comprehension iterable vs later iterables/filters/body scope;
- executable assignment target bases/slices, nested tuple/list/starred targets, and target execution order relative to RHS/annotation;
- AnnAssign with/without value, module/class/function scope, and future annotations;
- decorators/defaults; match/except/except*; branch/environment merges only where real Python behavior gives a bounded witness.

Do NOT demand arbitrary whole-program taint analysis. A finding requires a minimal executable/static witness within the bounded D04 scanner contract, independently checked against real Python semantics.

## Preserve R6-R19 regressions
Builtins aliases/`__dict__`/`vars`/`getattr`/`.get`/`__getitem__`; `eval/exec/__import__.__call__`; static aliases/strings/f-strings; operator getitem/itemgetter/attrgetter; negative/bool indices; duplicate bool/int dict last-write-wins; exact selected-slot semantics and safe co-presence; present builtins `.get` member dominating dangerous default; missing member using default; class lexical-scope rules; function/return/module/class annotations; postponed annotations; function-local annotation safe behavior; decorators/defaults; owner/import/directionality/UMI-02 guards.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under real Python semantics, violated invariant/impact, and smallest safe correction. Independently falsify every witness; do not assume this prompt or prior reviewers are correct.
If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
