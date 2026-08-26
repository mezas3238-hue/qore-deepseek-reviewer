# QORE UMI-12 final owner recertification — DeepSeek Expert R28

Independent adversarial Expert review. CI green is evidence, not semantic proof. Falsify the exact candidate before certifying it.

## Exact binding
- qore-core PR #461
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `134ffe6d2d740d3334167fb60eb90ed73ccfdbcc`
- HEAD TREE `fc2a84e5e1dd155726b0929757fa497e9f647cd5`
- current SYNTHETIC `1d074c3a2230247c8131b458f5a2d2d067ba8b37`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- exact-head QORE CI #1543 / run `33016881788`: SUCCESS
  - Ruff PASS
  - Mypy PASS / 698 source files
  - Pytest 4494 passed / 6 historical PytestCollectionWarnings
  - coverage 87% / 47568 statements / 6234 missed
- diff 71 ahead / 0 behind, 41 files, tests/docs only
- `src/qore` delta = 0
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged
Reject the package if live BASE/HEAD/current synthetic binding differs.

## R27 semantic disposition
R27 reviewed prior HEAD `2271599cb342e0a227530609342ff026977321c4` and returned exactly two HIGH findings, both independently adjudicated against real Python semantics and ACCEPTED. R27 therefore provides no certification for the current HEAD.

### Accepted R27 finding 1 — executable iteration targets
Witness:
```python
bucket = {}
for bucket["fn"] in (eval,):
    bucket["fn"]("1+1")
```
Python assigns `eval` into the subscript and executes it. R25 dropped `Attribute`/`Subscript` target values. The current candidate adds bounded fail-closed treatment: if an exact iterated value is sensitive and the target is `ast.Attribute`/`ast.Subscript`, emit a binding marker rather than claiming the container slot was safely modeled. No arbitrary container taint analysis is claimed.

### Accepted R27 finding 2 — unreachable loop/comprehension bodies after certain unpack failure
Witnesses:
```python
for fn, safe in (eval,):
    fn("1+1")
```
```python
for fn, safe in ((eval,),):
    fn("1+1")
```
Real Python raises before the body (`TypeError` for non-iterable scalar, `ValueError` for exact arity mismatch). R25 flattened the dangerous value onto names and fabricated a call. The current candidate adds exact target reachability for tuple/list destructuring: statically certain non-iterable or incompatible exact arity makes the body/element unreachable; compatible exact structural targets preserve selected-slot semantics; ambiguous cases remain conservative.

## Current R27 hardening layer
Current file: `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r27_guards.py`.

The scanner inherits the R25 exact sequence model and adds:
- `_r27_definitely_non_iterable` for bounded known abstract kinds that cannot be unpacked;
- `_r27_target_reachability(target, value) -> bool | None` for exact tuple/list target feasibility;
- exact arity compatibility for ordinary destructuring;
- one-starred-target minimum arity compatibility;
- recursive nested-target reachability using selected-slot metadata;
- synchronous `for`: if target binding is statically impossible, do not scan the body; otherwise scan assignment-target execution and assign structurally;
- comprehensions: if any generator target binding is statically impossible, later filters/generators/element are unreachable;
- sensitive `Attribute`/`Subscript` iteration targets fail closed with a binding marker; executable base/slice expressions remain scanned;
- ambiguous/unmodelled cases do not acquire a claim of arbitrary whole-program or container taint completeness.

Regression witnesses include:
- dangerous subscript target -> binding marker;
- dangerous attribute target -> binding marker;
- scalar unpacking failure -> no body marker;
- exact arity mismatch -> no body marker;
- nested exact arity mismatch -> no body marker;
- direct `eval(...)` in an unreachable loop body -> no marker;
- comprehension unpacking failure -> no element marker;
- compatible dangerous selected slot -> call marker;
- safe selected slot with dangerous sibling -> no marker;
- complete owner + historical oracle surface -> zero markers.

QG #1539-#1542 failed only on formatting/import-order mechanics in the newly added R27 guard. Those failures never reached Mypy/Pytest. The current HEAD contains the formatting-only corrections and QG #1543 is fully green. Do not treat those prior mechanical failures as semantic evidence either way.

## Bounded D04 contract
Current D04 universe is exactly: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not widen to hypothetical owner filenames absent repository evidence.

Preserve exact discovery, absolute/relative import normalization, provider/runtime/network/execution exclusion, UMI-02 binding for 19 Program-D families, provider/listing identity != economic identity, anti-symbol-laundering, RATE/YIELD/SPREAD/PRICE/NAV/IV separation, NOTIONAL/QUANTITY/WEIGHT separation, generic/product directionality, Sukuk/Shari'ah, ILS/event-contract, SFT current-state, SCF/Advanced-Payable, product/payoff authority boundaries, deterministic immutable secret-free evidence. No provider/Production/real-capital readiness claim.

## Prior hardening that remains binding
- valued module/class AnnAssign real order is RHS -> target/binding -> annotation;
- nested `global` skips intervening ordinary locals and uses exact global environment;
- module/declared-global delete may expose builtins; function-local delete remains locally unbound; class delete restores lexical parent where appropriate;
- class-body `global`/`nonlocal` is fail-closed in this bounded D04 scanner; function-level `global` remains modeled;
- methods/lambdas/comprehensions do not inherit residual class namespace incorrectly;
- executable Attribute/Subscript assignment-target expressions are scanned;
- R6-R25 aliases, builtins access paths, static string/container semantics, decorators/defaults, annotations, match/except and owner/import/directionality/UMI-02 regressions remain preserved.

## Adversarial focus for R28
Try concrete executable/static witnesses against the new reachability layer, especially:
- loop target mismatch where iterable has multiple possible exact sequence lengths, including a mix of compatible and incompatible alternatives; do not erase a reachable dangerous branch merely because another branch would fail unpacking;
- nested destructuring where outer arity is compatible but an inner selected slot is incompatible/non-iterable;
- one starred target first/middle/last, exact zero-length star capture, nested starred targets, and exact minimum-arity failure;
- `for ... else`: remember Python loop `else` may execute after normal iterator exhaustion, including zero iterations, but not when target unpacking raises; check whether the current early-return treatment incorrectly suppresses reachable `else` code;
- comprehensions with several generators: distinguish a statically impossible target in one generator from a branch/alternative that can still produce valid iterations;
- iterables containing both values that unpack successfully and values that fail later: earlier successful iterations can execute the body before a later unpacking exception; do not classify the whole loop unreachable merely because some possible element is incompatible;
- target base/slice expressions that themselves execute or have dangerous references even when the subsequent binding/unpacking fails; Python evaluates assignment-target expressions at the correct point;
- nested `Attribute`/`Subscript` inside tuple/list targets: verify sensitive values fail closed without inventing arbitrary container taint;
- safe negatives: no marker solely because an unselected sibling contains `eval`/`exec`/`__import__`;
- class/function/global/nonlocal/delete scope interactions inside the corrected loops/comprehensions;
- first comprehension iterable evaluation scope vs generator target/body scope;
- `AsyncFor`: only constructible async-iterable semantics; do not infer yielded values from ordinary tuples.

Do NOT demand arbitrary whole-program taint analysis, arbitrary mutable-container tracking, or generic iterable interpretation. A material finding needs a minimal witness inside the bounded D04 scanner contract and must distinguish real Python execution/reachability from conservative unknown cases.

The final reviewer receives COMPLETE changed-file evidence, deterministic dependency slices, exact binding/CI evidence, and bounded planned evidence. Do not request changed files already guaranteed merely to replay them.

## Output
For each material finding give severity, exact file/symbol, minimal witness, ACTUAL, EXPECTED under real Python semantics, violated invariant/impact, and smallest safe correction. Independently falsify the witness; do not assume this prompt, current tests, or prior reviewers are correct.
If clean end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
Otherwise end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
Never authorize merge, Program-D final PASS, Production, provider readiness, or real capital.
