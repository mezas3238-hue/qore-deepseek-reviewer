# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R19

Act as an independent adversarial Expert reviewer. Falsify before certifying. CI success is necessary evidence, never semantic proof.

## Exact freeze — fail closed on any mismatch

- Repository: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `990ffd499c757420fd79fa2c3892a270496a8f56`
- HEAD TREE: `8204ecbd8aa4f94283c8788d3a8adef6acd16b67`
- SYNTHETIC: `31e864d70b4074ba54d635f7bc58954855729cc8`
- Synthetic parents must be exactly `[BASE, HEAD]`; synthetic TREE must equal HEAD TREE.
- Compare: `58 ahead / 0 behind`; `27 changed files`; candidate is docs/tests only; `src/qore` delta = `0`.
- Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is unchanged; blob at BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- Exact-head QORE CI `#1530`, run `32997995401`: SUCCESS (`quality` green).

If live GitHub differs, do not review another candidate: report the binding mismatch and fail closed.

## Scope and bounded owner convention

Issue `#458`, parent `#363`. This is final Program-D UMI-12 owner-universe falsification recertification, not provider/valuation/execution/Production certification.

Current bounded D04 owner convention is exactly:
- all current `*_semantics.py`;
- all current `*_qualification.py` except `dataset_integrity_qualification.py`;
- plus six legacy owners: `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`.

Do not demand hypothetical future names or arbitrary whole-program discovery without repository evidence changing this convention.

Newest authoritative hardening layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r18_guards.py`

R18 evidence note:
`docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R18-HARDENING.md`

Older R6–R17 layers are regression evidence. The complete suite may rely on later layers to close earlier scanner blind spots; do not require every historical helper to reimplement the newest semantics independently.

## Latest accepted finding and required R18 falsification

Expert R18 reviewed the previous HEAD and found a real bounded false negative: annotation-time dynamic execution. It was independently adjudicated, fixed, regression-tested, and produced the current HEAD above. R18 itself is provenance only after that mutation.

Independently falsify the R18 correction against real Python evaluation semantics.

Without `from __future__ import annotations`, these must be treated as executed annotation expressions and dangerous callable use must be detected:

```python
def f(x: eval("1+1")):
    return x

def g() -> exec("pass"):
    return None

x: eval("1+1") = 1

class C:
    x: eval("1+1") = 1
```

With:

```python
from __future__ import annotations
```

annotation expressions are deferred/stringized for this contract: do not invent executed `eval`/`exec` merely because the AST contains them.

Function-local annotated assignment annotations must not be indiscriminately treated as annotation-time execution when Python does not evaluate that local annotation expression.

Probe nearby bounded variants, especially:
- positional-only / positional-or-keyword / keyword-only / vararg / kwarg annotations;
- return annotations;
- module/class `AnnAssign`;
- nested functions/classes and class lexical-scope interaction;
- genuine module/function-local shadowing of `eval`/`exec`/`__import__`;
- decorators and default/kw-default expressions continuing to be scanned with their real evaluation scope/time;
- combinations with `from __future__ import annotations`.

A finding requires a constructible witness under the defined bounded static contract and correct Python semantics. Do not broaden this into arbitrary whole-program taint analysis.

## Preserve prior accepted closure families R6–R17

Adversarially probe for regressions in these bounded static families:

- builtins aliases, `builtins.__dict__`, `vars(builtins)` and derived namespace aliases;
- direct and bound `.get` / `__getitem__` semantics;
- `getattr`, `vars`, `operator.getitem`, `operator.itemgetter`, `operator.attrgetter`;
- dangerous callable `.__call__` and extraction of already-derived dangerous callables;
- constant-string aliases and statically resolvable f-strings;
- tuple/list/dict/container selection with exact selected-slot semantics;
- positive, negative and bool indices;
- duplicate bool/int/string mapping keys using Python last-write-wins/equality behavior;
- safe co-presence must remain safe when the selected member is safe;
- mapping `.get` default is selected only for a statically known miss; present safe member dominates dangerous default;
- class execution namespace is not a lexical closure for method/lambda/comprehension bodies;
- bound builtins mapping aliases preserve present/missing/dangerous member semantics.

Representative invariants to re-falsify:

```python
import builtins, operator
getter = builtins.__dict__.get
getter("len", eval)("abc")                 # safe
getter("missing", eval)("1+1")            # dangerous
getter("eval", len)("1+1")                # dangerous
builtins.__dict__.__getitem__("eval")("1") # dangerous
operator.attrgetter("__call__")(eval)("1") # dangerous
```

```python
{0: eval, False: len}[0]("x")
{False: len, 0: eval}[False]("1+1")
{1: eval, True: len}[1]("x")
{"x": eval, "x": len}["x"]("x")
```

Respect exact Python last-write-wins and bool/int key equality rather than token presence.

```python
class C:
    eval = lambda value: value
    def run(self):
        eval("1+1")                         # dangerous: method does not close over class namespace

class Safe:
    def run(self):
        eval = lambda value: value
        eval("x")                           # safe local shadow
```

## Whole-candidate invariants

Inspect all changed files plus only necessary local dependency slices. Try to falsify:

1. exact bounded D04 owner discovery and manifest consistency;
2. absolute/relative import normalization and generic/product directionality;
3. rejection of provider/SDK/runtime/network authority leakage and hidden direct/indirect dynamic execution;
4. UMI-02 provider/listing/native-symbol identity remaining distinct from canonical economic identity across all 19 Program-D families;
5. non-flattening: `RATE != YIELD != SPREAD != PRICE != NAV != IV`; `NOTIONAL != QUANTITY != WEIGHT`;
6. collision boundaries: Sukuk/Shari'ah; ILS/event-contract; securities-financing static terms/current state; SCF ICC-2017/Advanced Payable; generic composition/product-specific payoff authority;
7. deterministic, immutable, secret-free evidence;
8. historical oracle unchanged and `src/qore` delta `0`.

Do not infer provider support, operational support, valuation methodology, execution readiness, Production readiness, real-capital authority, or UMI-14 final PASS from this candidate.

## Reviewer discipline

- Reproduce/falsify before reporting.
- Prefer exact minimal witnesses over speculative prose.
- A syntactic possibility is not automatically a semantic defect.
- Do not require arbitrary unbounded interprocedural/whole-program analysis beyond the repository's bounded static scanner contract.
- Do not accept CI as proof.
- Do not rewrite the bounded owner convention without repository evidence.

## Output contract

For every surviving material defect report: severity; exact file/symbol; minimal constructible witness; ACTUAL; EXPECTED; violated contract; impact; smallest safe fix.

If any material finding survives independent falsification, end exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If none survives, summarize the evidence actually falsified and end exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
