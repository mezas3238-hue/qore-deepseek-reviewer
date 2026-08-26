# QORE UMI-12 final owner recertification — DeepSeek Expert R30

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify this exact corrected candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `4258cfe1222b8de42f807d388d507d9368db4fb7`
- HEAD TREE `1d999dc9568f4b150916cea95f70cd31501c6741`
- SYNTHETIC `2b1cecd1ba605e54a985d63245aaad9e32304f61`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1546 / run `33021332579` / job `98352152429`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 700 source files
  - Pytest 4509 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff: 76 ahead / 0 behind, 45 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R29 disposition — both HIGH accepted and corrected
R29 reviewed superseded HEAD `4166d59a2d0b4691f254fb133a6cd6425069e5d4`. It is consumed and cannot certify this HEAD.

### R29-H1 ACCEPTED — divergent per-item lengths lost sensitive starred Subscript
Witness:
```python
bucket = {}
for *bucket["items"], tail in ((eval, len), (eval, len, str)):
    bucket["items"][0]("1+1")
```
R28 merged exact item alternatives before target assignment, lost single-length structure, and bypassed the fail-closed sensitive `Attribute`/`Subscript` starred-target rule.

Current R29 hardening preserves exact per-item structure before the legacy merge. `_r29_common_exact_iteration_prefix` exposes statically common exact sequence positions without flattening slot/length correlation; `_probe_exact_iteration_prefix` evaluates reachable items in execution order and routes each reachable exact item through existing R28 recursive target assignment. Dangerous starred `Attribute`/`Subscript` receives `binding` without arbitrary container taint.

A mandatory safe counterexample protects correlation:
```python
bucket = {}
for *bucket["items"], tail in ((len, eval), (len, str, exec)):
    pass
```
Expected no marker: dangerous values are tails, not starred values.

### R29-H2 ACCEPTED — first-item definite unpack failure fabricated reachable body
Witness:
```python
for fn, safe in ((eval, len, str), (eval, len)):
    fn("1+1")
```
Python fails target unpacking on the first item before body, second item, or `else` can run. R28 collapsed item order and produced a false positive.

Current R29 hardening probes exact item positions in execution order before collapse:
- exact empty iterable skips body and retains `else`;
- definite failure at first reachable item stops before body/later items/`else`;
- later definite failure admits only the already reachable prefix and no `else`;
- otherwise inherited R28 remains the conservative environment model.
The same first-item failure guard applies to comprehensions before their element/body becomes reachable.

Current regressions include both R29 witnesses, divergent-star correlation negative, first-item failure with body/else, exact-empty loop/else, first-generator comprehension failure, divergent-star comprehension binding, and complete owner+historical-oracle zero-marker recertification.

## Bounded D04 contract
Universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owners.

Preserve exact owner discovery/import normalization; provider/runtime/network/execution exclusion; UMI-02 binding for all 19 Program-D families; provider/listing identity != economic identity; anti-symbol-laundering; RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT separation; generic/product directionality; Sukuk/Shari'ah; ILS/event-contract; SFT current-state; SCF/Advanced-Payable; deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

Prior hardening remains binding: Python-real AnnAssign order; exact global/nonlocal/delete/class/function semantics within the bounded scanner; executable assignment-target expressions; exact selected-slot sequence structure; structured arity failures; ordinary tuple not broadened to AsyncFor; R6-R29 alias/builtins/static-string/container/decorator/default/annotation/match/except/owner/import/directionality/UMI-02 regressions.

## Adversarial focus
Aggressively falsify the R29 correction with minimal real-Python witnesses, especially:
- exact iterable item order versus merged abstract alternatives;
- divergent per-item sequence lengths with one-star targets first/middle/last and nested targets;
- preserve slot/length correlation: do not migrate dangerous tail values into starred values;
- sensitive `Attribute`/`Subscript` below starred targets across multiple exact item shapes;
- first-item and later-item definite unpack failures; body and `for ... else` reachability must match Python;
- comprehensions, including first generator and multiple generators: a definite earlier failure must not fabricate later filters/generators/elements;
- nested unpack failures at several depths and exact left-to-right target-expression execution;
- exact empty sequences, zero-length starred middles, and safe post-failure dangerous slots;
- ambiguous alternatives must remain conservative, but definite failure must not be turned into reachability;
- interactions with globals/nonlocals/delete/class/function scopes only where actually reachable.

Do not broaden this bounded static contract into arbitrary whole-program taint or generic iterable interpretation. A finding requires a constructible minimal witness, ACTUAL scanner result, EXPECTED under real Python execution/binding semantics, violated invariant/impact, and smallest safe correction.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED, impact, and smallest safe correction. Independently falsify each witness; do not assume this prompt or prior reviewers are correct.

If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
