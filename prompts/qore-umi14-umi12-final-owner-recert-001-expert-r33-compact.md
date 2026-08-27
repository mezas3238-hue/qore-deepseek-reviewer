# QORE UMI-12 final owner recertification — DeepSeek Expert R33

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact live binding
- qore-core PR #461
- BASE/main `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `3c0267926f6064c2c236c9b692722e89d1f484c6`
- HEAD TREE `f9cbce81293fbaae4c4f731d6d84ecbecacac5a0`
- LIVE SYNTHETIC `aaed2457d5fbdfbe65aa838d46433f47290ed2e5`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- qore-core diff: 80 ahead / 0 behind, 49 files, docs/tests only; `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged

## Exact-head Quality Gate
QORE CI #1551 / run `33025775433` / job `98366601682`: SUCCESS on exact HEAD `3c0267926f6064c2c236c9b692722e89d1f484c6`, tree `f9cbce81293fbaae4c4f731d6d84ecbecacac5a0`.
- Ruff PASS
- Mypy PASS: 702 source files
- Pytest: 4523 passed, 6 historical PytestCollectionWarnings
- coverage: TOTAL 47568 / 6234 missed / 87%
The PR merge ref was regenerated after this run; synthetic identity changed without changing BASE, HEAD, or TREE. R33 must bind to the current live synthetic above and reject any live BASE/HEAD/synthetic mismatch.

## R32 disposition — CONSUMED MECHANICALLY, NO MODEL REVIEW
Package `QORE-UMI14-UMI12-FINAL-OWNER-RECERT-001-DS-EXPERT-R32` is consumed and must not be reused. Its auto-dispatch succeeded, but model workflow #117 failed before DeepSeek invocation because `refs/pull/461/merge` temporarily did not exist during git fetch. Live PR API binding had passed, exact HEAD checkout had passed, semantic reviewer/publish/final-head steps were skipped, and no semantic review was published. The PR was closed/reopened without changing HEAD to regenerate the merge ref. The live merge ref now exists and resolves to the synthetic bound above.

## R31 disposition — both findings accepted and corrected
R31 reviewed superseded HEAD `85742a8f6f5e31238b446e1daa74438dfb9c7026`; it cannot certify current HEAD. Both semantic findings were accepted.

### R31-H1 — earlier sensitive target binding survives later nested unpack failure
Witness:
```python
bucket = {}
for *bucket["items"], (fn, safe) in ((eval, (1,)),):
    pass
```
Real Python reaches `bucket["items"] = [eval]` before later `(fn, safe)` unpack fails. Current R31 hardening emits the fail-closed binding marker when the sensitive Attribute/Subscript target is actually reached during ordered target traversal; a later failure cannot erase it. Failure before the target must still emit nothing.

### R31-H2 — starred sequence container is not itself callable-dangerous
Witness:
```python
for *fns, tail in ((eval, len),):
    fns("1+1")
```
Real Python binds `fns=[eval]`; direct list call raises TypeError and does not invoke eval. Current R31 hardening represents the starred capture as exact sequence metadata (`container-kind`, exact length, per-index selected slots and sensitive-index metadata) without promoting contained semantic atoms to top-level callability. Exact indexing/iteration/unpacking must still recover dangerous elements.

## Current bounded implementation
`_R31OrderedBindingScanner` extends `_R30OrderedPerItemIterationScanner`.
- ordered exact per-item iteration preserves item/slot/length correlation;
- `_scan_reachable_target_execution` models reachable target execution and sensitive Attribute/Subscript binding timing;
- `_assign_iterated_target` specializes exact one-star structural targets with fixed prefix/suffix plus starred slice;
- `_r31_sequence_value` preserves starred slice shape and per-index sensitivity without flattening callability;
- `_is_sensitive_value` recognizes direct sensitive-index metadata for fail-closed sensitive container targets;
- same ordered semantics apply to comprehensions and later generators;
- no AsyncFor broadening, no generic mutable-container taint, no arbitrary whole-program taint.

Current R31 regressions cover: binding before later nested failure; inverse failure-before-target negative; comprehension equivalent; direct starred-list call negative; dangerous index selection positive; iterating dangerous starred element positive; sensitive starred Subscript binding; complete current D04 owner universe and unchanged historical oracle zero-marker.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider, Production, or real-capital readiness claim.

Prior accepted hardening remains binding: Python-real AnnAssign order; exact bounded global/nonlocal/delete/class/function semantics; executable assignment-target expressions; selected-slot sequence structure; arity-failure reachability; ordinary tuple not broadened to AsyncFor; ordered per-item exact iteration; exact starred-slice shape; all R6-R31 alias/builtins/static-container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Use minimal constructible real-Python witnesses and report ACTUAL scanner result versus EXPECTED runtime semantics. Aggressively test:
- earlier reached sensitive target followed by later nested failure, and the inverse ordering;
- nested starred targets first/middle/last, empty/multi-element slice, multiple dangerous/builtins elements;
- starred Name sequence direct call vs index/slice/iteration/re-unpack/alias/rebinding;
- exact indexing including negative indices and safe/dangerous positions;
- prefix/suffix values must not migrate into starred slice and vice versa;
- multiple exact outer items where an earlier item fails and prevents later items, or succeeds before a later item fails;
- comprehension first iterable scope, target/filter/later generators/element child scope, multiple generators, and target failure ordering;
- `for ... else` reachability after normal exhaustion versus abrupt target failure;
- ambiguous/nonexact shapes must remain conservative without fabricating reachability or danger;
- safe negatives where eval/exec is structurally unreachable, and positives where runtime actually reaches it.

Do not demand arbitrary whole-program taint analysis, generic iterable interpretation, provider functionality, Production readiness, or capital execution. Each finding requires severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant/impact, and smallest bounded correction.

## Output contract
Independently falsify all assumptions. If any required evidence/binding is incomplete, do not certify.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
