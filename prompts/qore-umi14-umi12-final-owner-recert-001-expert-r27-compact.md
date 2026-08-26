# QORE UMI-12 final owner recertification — DeepSeek Expert R27

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `2271599cb342e0a227530609342ff026977321c4`
- HEAD TREE `5cedee0998a4103eba4e537f9738c07e62dee5f2`
- current SYNTHETIC `54b0a39b25c0572792f92c86d2b2d61f230f18f4`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1538 / run `33013213295`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 697 source files
  - Pytest 4484 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff 66 ahead / 0 behind, 39 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R26 mechanical disposition
R26 on this exact same frozen candidate is CONSUMED and provides NO semantic certification. Its binding/tree/evidence preparation succeeded (`changed_files=39`, `total_chars=351238`, `plan_incomplete=false`), and the planner request completed, but the final semantic HTTP response terminated mid chunked transfer with Python `http.client.IncompleteRead: IncompleteRead(13 bytes read)`. The workflow failed closed, skipped final HEAD revalidation/publication, published no R26 review, and observed USD balance delta 0. Do not infer any semantic result from R26 and do not reuse/re-run its package.

R27 is a fresh unique Expert package over the unchanged qore-core freeze. Treat the prior transport failure as external/mechanical only; independently perform the full semantic falsification now.

## R25 adjudication and correction
R25 on prior HEAD `8dc8fa42...` returned three material findings. All three were independently adjudicated against real Python semantics and ACCEPTED.

1. **Comprehension multi-element false negative.** `[fn("1+1") for fn in (len, eval)]` was missed because the inherited R19 iteration helper only propagated a static sequence of length exactly one.
2. **Divergent exact sequence-length false negative.** A synchronous loop over an `IfExp` whose alternative exact sequences had different positive lengths degraded to `_UNKNOWN`, losing a reachable dangerous member.
3. **Structured-unpacking false positive.** `for fn, safe in ((len, eval),): fn("safe")` copied a flattened union containing `eval` to both targets, even though Python binds `fn = len` and the call is safe.

The current candidate adds `test_universal_cross_asset_conformance_final_owner_r25_guards.py` plus the R25 hardening document. The R25 scanner remains bounded and inherits the prior R23/R20C chain.

### Current R25 iteration model
- `_r25_sequence_lengths` retains all exact `sequence-length` alternatives.
- `_r25_iterated_value` requires an exact static sequence, enumerates all reachable non-empty static positions across length alternatives, selects each recorded `selected-slot`, and merges those selected values. It does not require one unique length.
- `_assign_iterated_target` distributes an iterated exact sequence structurally when a unique structural length is known:
  - positional tuple/list targets receive the exact selected slot;
  - nested unpacking recurses;
  - one-starred-target unpacking preserves exact prefix/suffix positions and conservatively merges the starred middle;
  - ambiguous/unmodelled target structure falls back conservatively to inherited assignment.
- `_scan_comprehension` preserves the R20 class-body/lexical-scope handling but uses R25 exact iteration and structural assignment for every generator.
- synchronous `ast.For` uses the same exact iteration/structural assignment.
- `ast.AsyncFor` is deliberately not broadened: a plain tuple is not an async iterable and must not be treated as if it yielded target values.

Fixed witnesses include dangerous/safe multi-element comprehensions, dangerous/safe divergent `IfExp` sequence alternatives, safe exact unpacking, dangerous selected-slot unpacking, nested structural unpacking, and complete owner+oracle zero-marker recertification.

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
- R6-R20C aliases, builtins access paths, static string/container semantics, decorators/defaults, annotations, match/except and owner/import/directionality/UMI-02 regressions remain preserved.

## Adversarial focus
Try concrete current-contract witnesses around the new exact sequence/target model, especially:
- comprehensions with multiple generators, filters, nested exact sequences, empty/non-empty alternatives, and mixed safe/dangerous selected slots;
- `for` with exact tuple/list literals, conditional sequence alternatives, repeated values, nested structural values, safe/dangerous co-presence, and loop `else` merge behavior;
- tuple/list destructuring with nested targets, one starred target in first/middle/last position, zero-length starred middle, and values whose exact structural length disagrees with target arity;
- structural iteration when alternative abstract values have different lengths: ensure reachable dangerous slots are not lost while safe selected positions are not polluted by unrelated slots;
- nested selected-slot metadata: prove selection is by Python binding position rather than flattened semantic union;
- assignment target executable bases/slices and destructuring side effects;
- class/function/global/nonlocal/delete scope interactions inside loops/comprehensions;
- first comprehension iterable evaluation scope vs generator-target scope and later iterables/filters/body;
- `AsyncFor`: only real constructible async-iterable semantics; do not infer yielded values from an ordinary tuple;
- safe negatives: no false positive merely because a non-selected slot contains `eval`/`exec`/`__import__`.

Do NOT demand arbitrary whole-program taint analysis or generic iterable interpretation. A finding needs a minimal executable/static witness within the bounded D04 scanner contract and must distinguish exact Python execution/binding semantics from conservative unknown cases.

The final reviewer receives COMPLETE changed-file evidence, deterministic dependency slices, exact binding/CI evidence, and bounded planned evidence. Do not request changed files already guaranteed merely to replay them.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under real Python semantics, violated invariant/impact, smallest safe correction. Independently test/falsify the witness; do not assume this prompt or prior reviewers are correct.
If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
