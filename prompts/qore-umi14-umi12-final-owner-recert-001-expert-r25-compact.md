# QORE UMI-12 final owner recertification — DeepSeek Expert R25

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `8dc8fa42bda811182b18e14916928b7a3143ef20`
- HEAD TREE `6234ca1ef822d8971ca8845e2d0d35d52f99bc01`
- current SYNTHETIC `3d70aaa4cc1334b4465dc80921ebef7fd1d619c9`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1537 / run `33011479208`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 696 source files
  - Pytest 4476 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff 65 ahead / 0 behind, 37 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

R24 was a consumed mechanical abort on this exact freeze: binding/tree checks succeeded, but the reviewer stopped before any DeepSeek API call because complete mandatory changed-file evidence exceeded the old 300k fuse. No semantic R24 review exists. Reviewer infrastructure now preserves the same complete-evidence/fail-closed contract with a bounded 400k mandatory changed-file floor; final evidence remains bounded separately and is never silently truncated.

## R23 adjudication and correction
R23 on prior HEAD `d2366381...` found a real HIGH false negative: synchronous `for fn in (eval,): fn("1+1")` scanned the iterable but bound `fn` as `_UNKNOWN`. That finding was ACCEPTED. The candidate now adds `test_universal_cross_asset_conformance_final_owner_r23_guards.py`, inheriting the R20C scanner and overriding only synchronous `ast.For` handling.

For a statically known non-empty sequence, the synchronous loop target receives the sequence semantic atoms, so both `(eval,)` and `(len, eval)` expose reachable dangerous execution while `(len,)` stays clean. Assignment-target execution and existing environment merge behavior are preserved.

R23's suggestion to propagate a plain tuple identically through `ast.AsyncFor` was independently REJECTED as overbroad: a tuple is not an async iterable and `async for fn in (eval,)` raises before target binding/body execution. Unknown asynchronous iterables remain `_UNKNOWN`; a real AsyncFor finding requires a constructible bounded async-iterable witness supported by the scanner contract/repository evidence.

## Bounded D04 contract
Current D04 universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not widen to hypothetical arbitrary filenames absent repository evidence.

Preserve exact discovery, absolute/relative import normalization, provider/runtime/network/execution exclusion, UMI-02 binding for 19 Program-D families, provider/listing identity != economic identity, anti-symbol-laundering, RATE/YIELD/SPREAD/PRICE/NAV/IV separation, NOTIONAL/QUANTITY/WEIGHT separation, generic/product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT current-state, SCF/Advanced-Payable, product/payoff authority boundaries, deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

## Prior hardening that remains binding
- valued module/class AnnAssign real order is RHS -> target/binding -> annotation;
- nested `global` skips intervening ordinary locals and uses exact global environment;
- module/declared-global delete may expose builtins; function-local delete remains locally unbound; class delete restores lexical parent where appropriate;
- class-body `global`/`nonlocal` is fail-closed in this bounded D04 scanner; function-level `global` remains modeled;
- methods/lambdas/comprehensions do not inherit residual class namespace incorrectly;
- executable Attribute/Subscript assignment-target expressions are scanned;
- R6-R19 aliases, builtins access paths, static string/container semantics, decorators/defaults, annotations, match/except and owner/import/directionality/UMI-02 regressions remain preserved.

## Adversarial focus
Try concrete current-contract witnesses around:
- synchronous `for` exact sequences: singleton/multi-element, mixed safe/dangerous elements, nested tuple/list/starred targets, empty sequences, loop `else`, repeated target/environment merge effects;
- iteration abstract-value precision: any accepted exact static sequence shape where a dangerous member is still lost or safe sequence becomes spuriously dangerous;
- `AsyncFor`: only real constructible async-iterable semantics; distinguish iterable-expression execution from yielded-target semantics and do not treat a plain tuple as async-yielding;
- loops with nested `global`/`nonlocal`, delete/unbinding, class/function/lambda/comprehension scopes;
- first comprehension iterable vs later iterables/filters/body scope;
- assignment target bases/slices and nested destructuring;
- AnnAssign module/class/function scope and postponed annotations;
- decorators/defaults; match/except/except*; branch/environment merges.
Do NOT demand whole-program arbitrary taint analysis. A finding needs a minimal executable/static witness within the bounded D04 scanner contract.

The final reviewer receives COMPLETE changed-file evidence, deterministic dependency slices, exact binding/CI evidence, and bounded planned evidence. Do not request changed files already guaranteed merely to replay them.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under real Python semantics, violated invariant/impact, smallest safe correction. Independently test/falsify the witness; do not assume this prompt or prior reviewers are correct.
If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
