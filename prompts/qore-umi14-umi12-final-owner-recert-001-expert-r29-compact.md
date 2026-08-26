# QORE UMI-12 final owner recertification — DeepSeek Expert R29

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `4166d59a2d0b4691f254fb133a6cd6425069e5d4`
- HEAD TREE `e325c8caa880b926a75d8474cd11f46c0bc6f030`
- current SYNTHETIC `ccb3b4700ada2a2d46e2193341b5b5836aeee3ee`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1544 / run `33019187851`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 699 source files
  - Pytest 4501 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff 72 ahead / 0 behind, 43 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R28 adjudication and correction
R28 on prior HEAD `134ffe6d2d740d3334167fb60eb90ed73ccfdbcc` returned three HIGH findings. They were independently adjudicated against real Python assignment/unpacking semantics before mutation.

1. **R28-H1 REJECTED as stated.** Witness:
   ```python
   for fn, safe in ((eval,) if False else (eval, exec)):
       fn("1+1")
   ```
   With the `False` branch, the iterable is `(eval, exec)`. Each loop item is a builtin function object. Python attempts `fn, safe = eval` on the first item and raises `TypeError` before the body. The prior zero-marker result is correct. R29 must not reassert this exact witness as reachable. A materially different witness is welcome only if its *per-item* value is actually unpackable and a dangerous body path really executes.

2. **R28-H2 ACCEPTED.** Sensitive `Attribute`/`Subscript` below one `Starred` target bypassed R27 because R25 delegated the starred collected value directly to the base `_assign_target`. Current R28 hardening preserves exact prefix/suffix slot selection but routes the starred target value recursively through `_assign_iterated_target`, so sensitive starred `Attribute`/`Subscript` targets fail closed with a bounded `binding` marker. No arbitrary container taint was added.

3. **R28-H3 ACCEPTED.** R27's whole-target reachability could return before scanning target expressions that Python executes before a later nested unpack failure. Current R28 hardening adds ordered target-execution reachability for synchronous `for` and comprehensions: after a compatible outer unpack, child targets are traversed in Python store order; expressions before the first statically definite nested failure are scanned, expressions after it and the body remain unreachable; immediate arity/non-iterable failure occurs before child stores; ambiguous structure remains conservative.

Current regressions include:
- exact rejected H1 witness -> no marker;
- `for *bucket["items"], tail in ((eval, len),): ...` -> fail-closed `binding`;
- prefix `bucket[eval(...)]` before later nested arity failure -> call marker;
- inverse ordering where failure occurs before later `bucket[eval(...)]` -> no marker;
- equivalent comprehension ordering;
- compatible starred-name safe selected-slot negative;
- complete owner + historical oracle zero-marker recertification.

## Bounded D04 contract
Current D04 universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not widen to hypothetical arbitrary filenames absent repository evidence.

Preserve exact discovery, absolute/relative import normalization, provider/runtime/network/execution exclusion, UMI-02 binding for 19 Program-D families, provider/listing identity != economic identity, anti-symbol-laundering, RATE/YIELD/SPREAD/PRICE/NAV/IV separation, NOTIONAL/QUANTITY/WEIGHT separation, generic/product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT current-state, SCF/Advanced-Payable, product/payoff authority boundaries, deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

## Prior hardening remains binding
- valued module/class AnnAssign real order is RHS -> target/binding -> annotation;
- nested `global` skips intervening ordinary locals and uses exact global environment;
- module/declared-global delete may expose builtins; function-local delete remains locally unbound; class delete restores lexical parent where appropriate;
- class-body `global`/`nonlocal` is fail-closed in this bounded D04 scanner; function-level `global` remains modeled;
- methods/lambdas/comprehensions do not inherit residual class namespace incorrectly;
- executable Attribute/Subscript assignment-target expressions are scanned;
- exact sequence iteration preserves selected-slot structure; structured arity failures do not fabricate reachable bodies;
- `AsyncFor` is not broadened from ordinary tuple semantics;
- R6-R27 aliases, builtins paths, static string/container semantics, decorators/defaults, annotations, match/except, owner/import/directionality/UMI-02 regressions remain preserved.

## Adversarial focus
Use minimal concrete witnesses within the bounded D04 scanner contract. In particular try to falsify the new R28 layer around:
- genuinely reachable alternative sequence shapes: distinguish **iterable-level length alternatives** from the **per-item unpackability** required by a loop target; if claiming a reachable body, prove Python actually enters it;
- alternatives where per-item values have different exact structural lengths, including one compatible and one incompatible branch; dangerous reachable slots must not be lost, but an incompatible scalar item must not fabricate body execution;
- one-starred targets in first/middle/last position, zero-length starred middle, nested starred targets, and `Attribute`/`Subscript` under the star with safe/dangerous selected values;
- nested unpacking failures at multiple depths and exact left-to-right target-expression execution: expressions before the first actual failure must be scanned; expressions after it must not be invented;
- targets mixing Name/Tuple/List/Starred/Attribute/Subscript and nested selected-slot metadata;
- comprehensions: first iterable evaluated in outer scope, generator target/body/filter in comprehension scope; multiple generators where an earlier/later target fails;
- ambiguous alternatives: do not turn uncertainty into definite unreachability; also do not turn a statically definite failure into a reachable body;
- loop `else` and environment merges only where consistent with Python execution;
- global/nonlocal/delete/class/function interactions inside reachable loop/comprehension targets;
- safe negatives where a non-selected or post-failure slot contains `eval`/`exec`/`__import__`.

Do NOT demand arbitrary whole-program taint analysis, generic iterable interpretation, or Production/provider functionality. A finding requires a minimal constructible witness, ACTUAL scanner result, real Python execution/binding semantics, and a bounded smallest correction.

The final reviewer receives complete changed-file evidence, deterministic dependency slices, exact binding/CI evidence, and bounded planned evidence. Do not request changed files already guaranteed merely to replay them.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under real Python semantics, violated invariant/impact, and smallest safe correction. Independently test/falsify the witness; do not assume this prompt, R28, or prior reviewers are correct.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
