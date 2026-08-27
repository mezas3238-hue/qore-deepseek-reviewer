# QORE UMI-12 final owner recertification — DeepSeek Expert R35

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE/main `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `009a95087f3c200464787dff15983861063dd68a`
- HEAD TREE `68ba68cf093e4cbb8298af5fee6128bc8e0d2944`
- SYNTHETIC `16a94bbb724c8943a289584235ed472dd125b234`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- diff: 82 ahead / 0 behind, 53 changed files, docs/tests only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject if live BASE/HEAD/synthetic differs.

## Exact Quality Gate
QORE CI #1553 / run `33027580818` / job `98372425600`: SUCCESS on this exact candidate.
- Ruff PASS
- Mypy PASS: 704 source files
- Pytest: 4538 passed, 6 historical PytestCollectionWarnings
- coverage TOTAL 47568 / 6234 missed / 87%

## R34 disposition — one HIGH accepted and corrected
R34 reviewed superseded HEAD `a0fe70056a23aa016b1bf254fef4bdd476c0a36f`, `plan_incomplete=false`, and published `HALLAZGOS: 1 / VALIDACIÓN NO OK`. R34 is consumed.

Accepted witness:
```python
flag = True
for *fns, tail in ((eval, len),):
    fns[:flag][0]("1+1")
```
R14 represents an exact stored bool as `bool-index` (`1`/`0`). R33 recognized exact environment slice bounds only when the single atom kind was `integer`, so a boolean alias degraded to UNKNOWN and hid a reachable `eval`.

## Current R34 correction
`_R34BoolAliasSliceScanner` extends `_R33ExactSliceScanner` and changes only exact environment-bound normalization:
- one `integer` atom -> exact int;
- one `bool-index` atom -> exact int 0/1;
- ambiguous or other values -> UNKNOWN.
It preserves receiver/lower/upper/step evaluation order and all R33 exact-slice behavior. It does not model generic truthiness, arbitrary `__index__`, generic iterables, or whole-program value inference.

R34 regressions cover:
- exact DeepSeek True-alias upper bound positive;
- False-alias upper bound safe exclusion;
- True-alias lower bound recovering dangerous suffix;
- True-alias step=1;
- False-alias step=0, with no fabricated later access/call;
- bool alias rebinding uses latest exact value;
- complete current D04 owner universe + unchanged historical oracle zero-marker.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider, Production, or real-capital readiness claim.

Prior accepted hardening remains binding: Python-real AnnAssign order; bounded global/nonlocal/delete/class/function semantics; executable assignment-target expressions; exact selected-slot sequence structure; arity-failure reachability; no ordinary-tuple AsyncFor broadening; ordered per-item exact iteration; exact starred-slice shape; left-to-right target execution/binding timing; starred sequence container is not itself callable-dangerous; exact static slicing; all prior alias/builtins/static-container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Use minimal constructible real-Python witnesses and report ACTUAL scanner result vs EXPECTED Python semantics. Focus especially on materially different residuals after R34:
- bool aliases in lower/upper/step in all combinations, including rebinding and chained slices;
- `True`/`False` aliases through reverse/negative-step, empty, out-of-range, and nested slices;
- exact bool and integer aliases interacting across chained slices such as `fns[:flag][::-step][i]`;
- receiver then lower then upper then step execution order, including dynamic calls in bounds;
- zero-step: earlier receiver/bounds execute as Python does, later indexing/iteration/body does not;
- failures in lower/upper expressions preventing later bound/step/body effects when real Python does;
- safe/dangerous/builtins elements retained or excluded by exact slices without cross-slot migration;
- sliced starred list direct call remains non-dangerous, while exact indexing/iteration/re-unpack may recover a dangerous element;
- aliases of sliced sequences, later rebinding, loops, comprehensions, multiple generators, filters and target-unpack failures;
- exact per-item correlation from R29-R31 must survive slicing;
- ambiguous receiver/bounds remain conservative and must not fabricate definite callability or reachability;
- safe negatives where eval/exec exists only in excluded/unreachable slots, and positives where runtime reaches it.

Do not reassert the exact R34 witness as a new finding unless a materially different semantic path remains broken. Do not demand generic `__index__`, arbitrary whole-program taint, generic iterable interpretation, provider functionality, Production readiness, or capital execution.

Each finding requires severity, exact file/symbol, minimal witness, ACTUAL scanner result, EXPECTED real-Python behavior, violated invariant/impact, and smallest bounded correction.

## Output contract
Independently falsify all assumptions. If evidence/binding is incomplete, do not certify.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
