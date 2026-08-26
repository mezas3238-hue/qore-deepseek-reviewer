# QORE UMI-12 final owner recertification — DeepSeek Expert R21

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `9f5807ef1df86df1802eb2ad87542bf2e3cf4a62`
- HEAD TREE `e76b60991320c9937bcf5cd3d1942a5463a18509`
- SYNTHETIC `7c77f15be3db8c123bd108c4dc6d36babe181ae2`
- synthetic parents exactly `[BASE, HEAD]`
- synthetic TREE == HEAD TREE
- exact-head QORE CI #1533 / run `33006816484`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 693 source files
  - Pytest 4461 passed / 6 historical PytestCollectionWarning
  - coverage 87% / 47568 statements / 6234 missed
- diff 61 ahead / 0 behind, 31 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live binding differs.

## Bounded D04 contract
Current D04 universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not widen to hypothetical arbitrary filenames absent repository evidence.

Preserve exact discovery, absolute/relative import normalization, provider/runtime/network/execution exclusion, UMI-02 binding for 19 Program-D families, provider/listing identity != economic identity, anti-symbol-laundering, RATE/YIELD/SPREAD/PRICE/NAV/IV separation, NOTIONAL/QUANTITY/WEIGHT separation, generic/product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT current-state, SCF/Advanced-Payable, product/payoff authority boundaries, deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

## R20 adjudication and correction
R20 returned three findings on prior HEAD. Independent adjudication:
- H1 REJECTED false positive. For a valued module/class `AnnAssign`, Python order is RHS -> assignment target/binding -> annotation. `eval: eval("safe") = lambda value: value` is a correct safe negative because RHS binds `eval` before annotation evaluation. Do NOT reverse this order.
- H2 ACCEPTED: nested `global` declarations could inherit a same-named enclosing local. R20 hardening now maintains module/global state separately and nested `global` resolves module state, while preserving an active enclosing global-path value when the enclosing function itself declared that name global.
- H3 ACCEPTED: residual class lexical context could leak into lambda/comprehension nested inside a method. R20 now distinguishes actual class-body execution from function-body execution: methods exclude class locals; lambdas/comprehensions/functions/classes nested inside a method inherit method lexical state; lambdas/comprehensions directly in class body retain class lexical-parent behavior.

Independent falsification also found and fixed executable assignment-target blind spots. R20 now scans Attribute/Subscript target expressions in ordinary/annotated assignment, `for`/`async for`, comprehensions, `with`/`async with` targets, and `del`, while preserving safe literal targets.

## Adversarial focus
Try concrete bounded witnesses around:
- nested `global` across two+ function levels, module reassignment, safe active-global state, class/function nesting;
- `nonlocal` vs local/global distinction and closure correctness;
- lambda/comprehension/class/function definitions inside methods vs directly in class bodies;
- first comprehension iterable vs later iterables/filters/body scope;
- executable assignment target bases/slices, nested tuple/list/starred targets, target evaluation order vs RHS/annotation;
- AnnAssign with/without value, module/class/function scope, future annotations;
- decorators/defaults and nested scope interaction;
- match/except/except* regressions from R19;
- branch/environment merges only where real Python semantics give a bounded static witness.
Do NOT demand arbitrary whole-program taint analysis. A finding needs a current-contract witness and real Python behavior.

## Preserve R6-R19 regressions
Builtins aliases/`__dict__`/`vars`/`getattr`/`.get`/`__getitem__`; `eval/exec/__import__.__call__`; static aliases/strings/f-strings; operator getitem/itemgetter/attrgetter; negative/bool indices; duplicate bool/int dict last-write-wins; exact selected-slot semantics and safe co-presence; builtins extraction/aliases; method bodies not closing over class locals; present builtins `.get` member dominating dangerous default; missing member using default; function/return/module/class annotations; postponed annotations; function-local annotation safe behavior; decorators/defaults; owner/import/directionality/UMI-02 guards.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under Python semantics, violated invariant/impact, smallest safe correction.
If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.