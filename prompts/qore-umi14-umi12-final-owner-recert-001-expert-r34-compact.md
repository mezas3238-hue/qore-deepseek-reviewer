# QORE UMI-12 final owner recertification — DeepSeek Expert R34

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact live binding
- qore-core PR #461
- BASE/main `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `a0fe70056a23aa016b1bf254fef4bdd476c0a36f`
- HEAD TREE `500ce7a052e8912b6613109e3961452945311464`
- SYNTHETIC `70db6cb83d80b25e5f347c4a66b986523cf1db5f`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- diff: 81 ahead / 0 behind, 51 files, docs/tests only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged

## Exact Quality Gate
QORE CI #1552 / run `33026605314` / job `98369325762`: SUCCESS on exact HEAD/synthetic above.
- Ruff PASS
- Mypy PASS: 703 source files
- Pytest: 4531 passed, 6 historical PytestCollectionWarnings
- coverage: TOTAL 47568 / 6234 missed / 87%
Reject if live BASE/HEAD/synthetic differs.

## R33 disposition — one HIGH accepted and corrected
R33 reviewed superseded HEAD `3c0267926f6064c2c236c9b692722e89d1f484c6` and published `HALLAZGOS: 1 / VALIDACIÓN NO OK`, with `plan_incomplete=false`. R33 is consumed and cannot certify this HEAD.

Accepted witness:
```python
for *fns, tail in ((eval, len),):
    fns[:][0]("1+1")
```
Real Python binds `fns=[eval]`; `fns[:]` preserves the element; `[0]` recovers `eval`; the call executes dynamic code. R31 exact starred-sequence metadata was lost because inherited subscript handling did not model `ast.Slice`.

## Current R33 correction
New bounded layer `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r33_guards.py` defines `_R33ExactSliceScanner`, extending `_R31OrderedBindingScanner`.

For `ast.Subscript` with `ast.Slice`, it:
- evaluates receiver first;
- scans lower, upper, and step expressions in Python evaluation order so their dynamic execution remains observable;
- acts only on exact `container-kind=sequence` with exact `sequence-length`;
- accepts omitted bounds, literal int/bool bounds, unary +/- int/bool literals, and a single exact integer value already retained in the bounded environment;
- applies Python `range(length)[slice(lower, upper, step)]` semantics, including negative bounds and negative step;
- rebuilds the sliced sequence from exact selected slots using the existing R31 sequence representation, recalculating selected-slot / dangerous-index / builtins-index metadata;
- returns UNKNOWN for non-exact bounds/shape;
- returns UNKNOWN for `step == 0` (Python raises before any subsequent element access/call);
- does not flatten contained semantic atoms into top-level container callability.

Current R33 regression surface includes:
- full slice `[:]` recovering `eval`;
- bounded safe slice excluding `eval`;
- bounded dangerous slice selecting `eval`;
- negative-step reindexing;
- bool-as-index slice semantics;
- exact integer local alias used as bound;
- dynamic bound execution observed without pretending the bound is exact;
- zero-step slice not fabricating contained callable execution;
- complete current D04 owner universe + unchanged historical oracle zero-marker.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider, Production, or real-capital readiness claim.

Prior accepted hardening remains binding: Python-real AnnAssign order; bounded global/nonlocal/delete/class/function semantics; executable assignment-target expressions; exact selected-slot sequence structure; arity-failure reachability; no ordinary-tuple AsyncFor broadening; ordered per-item exact iteration; exact starred-slice shape; left-to-right target execution/binding timing; starred sequence container is not itself callable-dangerous; all R6-R33 alias/builtins/static-container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Use minimal constructible real-Python witnesses. Report ACTUAL scanner result versus EXPECTED runtime semantics. Aggressively test the new slice layer and interactions:
- full, empty, bounded, out-of-range, negative-index, negative-step and reverse slices;
- nested/chained slices such as `fns[:][::-1][i]`;
- exact int/bool bounds and unary signed bounds;
- exact local aliases for lower/upper/step, including rebinding before use;
- dynamic lower/upper/step expressions: their side effects/dynamic calls must be scanned in Python order, while uncertain slice shape remains conservative;
- `step=0`: bound expressions execute, slice raises ValueError, and no later index/iteration/call may be fabricated;
- safe/dangerous/builtins elements moving through slices: selected elements remain recoverable, excluded elements must not contaminate the result;
- a sliced starred sequence called directly must remain non-dangerous (it is still a list), while indexing/iteration/re-unpacking after the slice may recover a dangerous element;
- slices followed by aliases, nested unpacking, loops, comprehensions, later generators and target failures;
- prefix/suffix/starred correlation from R29-R31 must survive slicing without migrating values across slots;
- Python evaluation order: receiver before slice bounds; lower then upper then step; failure in an earlier bound prevents later-bound/body effects as real Python does;
- ambiguous receiver or nonexact bound must not fabricate definite reachability, callability, or exact slots;
- safe negatives where eval/exec is only in excluded/unreachable positions and positives where runtime actually reaches it.

Do not demand arbitrary whole-program taint, generic iterable interpretation, provider functionality, Production readiness, or capital execution. A finding requires severity, exact file/symbol, minimal witness, ACTUAL scanner result, EXPECTED real-Python result, violated invariant/impact, and smallest bounded correction.

## Output contract
Independently falsify every assumption. If any required evidence/binding is incomplete, do not certify.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
