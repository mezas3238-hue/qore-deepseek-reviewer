# QORE UMI-12 final owner recertification — DeepSeek Expert R32

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE/main `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `3c0267926f6064c2c236c9b692722e89d1f484c6`
- HEAD TREE `f9cbce81293fbaae4c4f731d6d84ecbecacac5a0`
- SYNTHETIC `73fd045a6c117c64d7761e9d1e83356c36b67c89`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-candidate QORE CI #1550 / run `33024830341` / job `98363626714`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 702 source files
  - Pytest 4523 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff: 80 ahead / 0 behind, 49 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R31 disposition — both findings accepted and corrected
R31 reviewed superseded HEAD `85742a8f6f5e31238b446e1daa74438dfb9c7026`. It is consumed and cannot certify this HEAD. R31 also reported `plan_incomplete=true` because one planner `git_show` request used an invalid ref; therefore it was never eligible to certify even hypothetically.

### R31-H1 ACCEPTED — prior sensitive starred target binding erased by later nested unpack failure
Witness:
```python
bucket = {}
for *bucket["items"], (fn, safe) in ((eval, (1,)),):
    pass
```
Real Python completes the outer extended unpack, then performs target stores left-to-right. `bucket["items"] = [eval]` is reached before unpacking `(fn, safe)` from `(1,)` fails. R30 deferred binding markers until later assignment; the later failure erased the already-reachable sensitive binding.

Current R31 hardening emits the fail-closed `binding` marker when an `Attribute`/`Subscript` target is actually reached with a sensitive value during ordered target traversal. Outer arity failure still stops before child targets; a later nested failure cannot erase earlier target execution/binding. Same rule applies inside comprehensions.

### R31-H2 ACCEPTED — starred Name sequence container was falsely promoted to callable danger
Witness:
```python
for *fns, tail in ((eval, len),):
    fns("1+1")
```
Real Python binds `fns=[eval]`; calling the list raises `TypeError` and never invokes `eval`. R30 preserved sequence metadata but also flattened element semantic atoms into the container value, fabricating a dangerous call on `fns`.

Current R31 hardening represents starred captures as sequence metadata only:
- `container-kind=sequence`;
- exact `sequence-length`;
- per-index `selected-slot` metadata;
- `dangerous-index` / `builtins-index` metadata for direct sensitive elements.
Contained semantic atoms are not promoted to top-level callability. Exact selection and iteration still recover dangerous elements. Sensitive starred `Attribute`/`Subscript` targets remain fail-closed by recognizing direct sensitive-index metadata.

Current R31 regressions include:
- sensitive starred `Subscript` binding survives a later nested unpack failure;
- same ordering in a comprehension;
- direct call of starred Name sequence is non-dangerous;
- selecting a dangerous element from that sequence produces a dynamic-call marker;
- iterating that sequence and calling a dangerous element produces a dynamic-call marker;
- ordinary sensitive starred `Subscript` binding remains fail-closed;
- complete current D04 owner universe plus unchanged historical oracle remain zero-marker.

## Bounded implementation shape
`_R31OrderedBindingScanner` extends `_R30OrderedPerItemIterationScanner`.
- `_scan_reachable_target_execution` handles `Attribute`/`Subscript` target execution and emits binding exactly when the sensitive target is reached.
- `_assign_iterated_target` specializes exact one-star structural targets, assigning fixed prefix/suffix slots and representing the starred slice via `_r31_sequence_value`.
- `_r31_sequence_value` stores sequence shape and per-index sensitivity without flattening contained callable semantics to the container itself.
- `_is_sensitive_value` additionally recognizes direct `dangerous-index` / `builtins-index` metadata for fail-closed sensitive container targets.
No AsyncFor broadening, no generic mutable-container taint, and no arbitrary whole-program taint.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve exact owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

Prior accepted hardening remains binding: Python-real AnnAssign order; exact bounded global/nonlocal/delete/class/function semantics; executable assignment-target expressions; selected-slot sequence structure; arity-failure reachability; ordinary tuple not broadened to AsyncFor; ordered per-item exact iteration; exact starred-slice shape; all R6-R31 alias/builtins/static-container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Use minimal constructible real-Python witnesses. Aggressively test:
- left-to-right target execution where an earlier sensitive `Attribute`/`Subscript` target is reached and a later nested target fails;
- the inverse: failure before a later sensitive target must not fabricate a binding;
- nested starred targets in first/middle/last position and failures before/inside/after the starred slice;
- starred Name containers called directly, indexed, sliced, iterated, unpacked again, rebound, or passed through exact local aliases;
- ensure dangerous contents are recoverable through exact indexing/iteration without making the list/tuple container itself callable-dangerous;
- safe/dangerous alternatives with exact per-item correlation; prevent dangerous suffix/prefix values from migrating into the starred slice;
- exact one-star assignment into `Attribute`/`Subscript`, including empty slice, multiple dangerous elements, and builtins danger;
- multiple comprehension generators, filters, and later-generator failures after earlier reachable bindings;
- comprehension scope/class lexical behavior: first iterable outer scope, target/filter/later generators/element child scope, no class namespace leakage;
- exact `for ... else` behavior after successful iteration, empty iterable, or abrupt target failure;
- ambiguous outer sequence shape must remain conservative without fabricating definite reachability/unreachability;
- safe negatives where `eval`/`exec` exist only in unreachable/fixed suffix slots and positives where they are actually reached.

Do not demand arbitrary whole-program taint analysis, generic iterable interpretation, provider functionality, Production readiness, or capital execution. A finding requires severity, exact file/symbol, minimal witness, ACTUAL scanner result, EXPECTED under real Python semantics, violated invariant/impact, and smallest bounded correction.

## Output
Independently falsify every witness; do not assume this prompt, R31, or prior reviews are correct.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
