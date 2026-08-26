# QORE UMI-12 final owner recertification — DeepSeek Expert R31

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE/main `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `85742a8f6f5e31238b446e1daa74438dfb9c7026`
- HEAD TREE `2fa9c194af80f70ac187485f7532ecfe194212cb`
- SYNTHETIC `61fd56ee2c83f1c89613e84ba9015c552548b55a`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-candidate QORE CI #1548 / run `33023026893` / job `98357755108`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 701 source files
  - Pytest 4516 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff: 77 ahead / 0 behind, 47 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R30 disposition — both HIGH accepted and corrected
R30 reviewed superseded HEAD `4258cfe1222b8de42f807d388d507d9368db4fb7`. It is consumed and cannot certify this HEAD.

### R30-H1 ACCEPTED — later comprehension unpack failure leaked a dangerous later item
Witness:
```python
values = [fn("1+1") for fn, safe in ((len, str), (eval, len, str))]
```
Real Python evaluates the first item safely, then the second item fails arity-2 unpacking before the element; `eval` is never called. R29 detected the later failure but delegated back to the collapsed inherited iterable model, which merged the incompatible later item into `fn`.

Current R30 hardening uses ordered exact per-item iteration instead of collapsing a structurally exact sequence. A definite target failure terminates the loop/comprehension path before later items, filters, generators, elements, or `else`. The same rule propagates through later comprehension generators.

### R30-H2 ACCEPTED — starred Name capture lost list shape and tail/slot correlation
Witness:
```python
for *safe, tail in ((len, eval), (len, str, exec)):
    for fn in safe:
        fn("1+1")
```
Real Python binds `safe=[len]` and then `safe=[len, str]`; `eval`/`exec` are tails only. The old collapsed fallback flattened whole items and leaked tail danger into `safe`.

Current R30 hardening materializes a one-star exact capture as an abstract sequence value with exact length and per-index selected-slot metadata. Prefix/suffix targets receive only their exact slots. Thus a starred Name behaves as the sequence Python actually creates, while a sensitive starred `Attribute`/`Subscript` still fails closed when the real starred slice contains a dangerous value.

Current R30 regressions include:
- exact R30-H1 -> no marker;
- exact R30-H2 -> no marker;
- positive dangerous callable genuinely inside the starred slice -> call marker;
- later-generator later-item unpack failure aborts the whole comprehension;
- positive later-generator dangerous prefix remains reachable;
- R29 sensitive starred-Subscript binding remains preserved;
- complete owner + unchanged historical oracle remain zero-marker.

## Bounded implementation shape
`_R30OrderedPerItemIterationScanner` extends R29.
- `_r30_exact_iteration_items` only treats a sequence with one exact outer length and exact selected positions as enumerably exact; ambiguous/divergent outer shapes fall back conservatively.
- `_r30_sequence_value` builds sequence metadata for starred captures (`container-kind`, exact `sequence-length`, selected slots, dangerous/builtins index metadata plus semantic atoms).
- exact synchronous `for` items execute in source iteration order, updating one loop environment per reachable item; definite target failure stops before `else`.
- exact comprehensions recurse generator-by-generator and item-by-item; a definite failure in any generator propagates outward and stops the comprehension path.
- ambiguous/non-exact iteration keeps the inherited conservative model.
No AsyncFor broadening and no arbitrary container/whole-program taint.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve exact owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

Prior accepted hardening remains binding: Python-real AnnAssign order; exact bounded global/nonlocal/delete/class/function semantics; executable assignment-target expressions; selected-slot sequence structure; arity-failure reachability; ordinary tuple not broadened to AsyncFor; all R6-R30 alias/builtins/static-container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Use minimal constructible real-Python witnesses. Aggressively test:
- exact per-item sequential environment versus prior merged alternatives, including mutations/rebindings from an earlier reachable item affecting a later body;
- definite failure at item 1, middle, or final item and exact `for ... else` semantics;
- one-star targets in first/middle/last positions, empty starred slices, nested starred targets, and star captures later indexed/iterated/called;
- ensure dangerous fixed prefix/suffix values never migrate into a starred Name, and dangerous values genuinely in the starred slice remain detectable;
- sensitive `Attribute`/`Subscript` below stars, including safe/dangerous alternatives and nested exact targets;
- multiple comprehension generators: first/later exact empty iterable, definite failure after a reachable prefix, failure in a later generator across multiple outer items, filters before/after nested generators, and element/key/value reachability;
- comprehension scope/class lexical behavior: first iterable outer scope, target/filter/later generators/element child scope, no residual class namespace leakage;
- exact left-to-right target-expression execution around nested unpack failures;
- ambiguous outer sequence shapes: do not claim exact enumeration when shape is uncertain; remain conservative without fabricating definite reachability or unreachability;
- safe negatives where `eval`/`exec` only occur in unreachable later items or fixed suffix slots, plus positives where they are genuinely reached.

Do not demand arbitrary whole-program taint analysis, generic iterable interpretation, provider functionality, Production readiness, or capital execution. A finding requires severity, exact file/symbol, minimal witness, ACTUAL scanner result, EXPECTED under real Python semantics, violated invariant/impact, and smallest bounded correction.

## Output
Independently falsify every witness; do not assume this prompt, R30, or prior reviews are correct.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
