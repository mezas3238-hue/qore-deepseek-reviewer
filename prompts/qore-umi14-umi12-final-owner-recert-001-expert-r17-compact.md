# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R17

Act as an independent adversarial expert reviewer. Do not self-certify and do not infer approval from green CI.

## Exact binding

- Repository: `mezas3238-hue/qore-core`
- PR: #461
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `ad556f18f8c148087a6030993ed279f1b8500fea`
- HEAD TREE: `4b25562ac4df27c57a24b8e0a789b95265e41466`
- SYNTHETIC: `15571a33ceedd3c3368907d069c46689066e6faf`
- Synthetic parents must be exactly `[BASE, HEAD]` and synthetic TREE must equal HEAD TREE.
- Compare: 56 ahead / 0 behind; 23 changed files; docs/tests only; `src/qore` delta = 0.
- Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is unchanged.
- QORE CI #1528 / run `32992689468` / job `98253940144`: SUCCESS.
  - Ruff: all checks passed.
  - Mypy: success, 689 source files.
  - Pytest: 4422 passed, 6 historical `PytestCollectionWarning` warnings.
  - Coverage: 87% (`47568` statements / `6234` missed).

If any live binding differs, fail closed and report the mismatch instead of reviewing another candidate.

## Scope

Issue #458 / parent #363. This is the final Program-D UMI-12 owner-universe falsification recertification. The candidate must remain test/doc-only. Do not infer provider support, valuation methodology, execution capability, Production readiness, or real-capital authority.

The complete current D04 owner convention is the bounded semantic/qualification surface already established by the candidate: current `*_semantics.py`, current `*_qualification.py` excluding `dataset_integrity_qualification`, plus the six frozen legacy owners. Do not demand an unbounded arbitrary naming universe such as `future_d04_owner.py` without repository evidence.

Older R4-R15 guard layers are historical regression evidence. The newest authoritative correction layer is:

`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r16_guards.py`

The complete candidate suite may rely on the newest layer to close later findings; do not require every historical helper to independently implement the newest semantics.

## R16 review provenance and independent adjudication

Expert R16 reviewed old HEAD `69b0557c952f41cb074fb061a0d01e5ff1ce2db0` and reported three HIGH findings. That review is provenance only after mutation. Independent adjudication produced the following result:

1. **R16 finding 1 rejected as false positive.** The claim that string `operator.itemgetter("getattr")` loses its slot token was inconsistent with the actual inherited R12/R15 encoding: itemgetter string helpers carry the `s:<key>` token consumed by R15 static selection. The exact regression remained green.
2. **R16 finding 2 rejected as false positive.** `operator.attrgetter("__call__")(eval)` is already propagated by inherited R12 semantics when R15 falls through to `super()`. The exact regression remained green.
3. **R16 finding 3 accepted as real.** Direct `builtins.__dict__.get("missing", eval)(...)` / `vars(builtins).get(...)` could lose the dangerous default on a statically absent builtins member.

Do not resurrect rejected findings 1 or 2 merely from R16 prose. A new finding requires a concrete witness that survives the COMPLETE current R16 suite on this exact HEAD.

## R16 authoritative correction

The R16 layer distinguishes an actually existing builtins member from a statically missing key. For direct `.get(key, default)` over a builtins namespace:

- existing member wins over the default;
- missing member returns the default;
- unknown/unresolved cases must not fabricate dangerous authority.

First reproduce/falsify these exact R16 witnesses against the COMPLETE current suite and R16 scanner.

Dangerous and MUST be marked:

```python
import builtins
builtins.__dict__.get("missing", eval)("1+1")
vars(builtins).get("also_missing", exec)("pass")
builtins.__dict__.get("eval", len)("1+1")
```

Safe and MUST remain unmarked:

```python
import builtins
builtins.__dict__.get("len", eval)("abc")
vars(builtins).get("str", exec)("abc")
```

Rejected-R16 regression witnesses that MUST remain detected by the complete current scanner:

```python
import builtins
import operator
operator.itemgetter("getattr")(builtins.__dict__)(builtins, "__import__")("math")
operator.attrgetter("__call__")(eval)("1+1")
```

Also preserve the R15 exact-selection/default regressions:

```python
{}.get("missing", eval)("1+1")
{"present": len}.get("present", eval)("x")
```

Expected: first dangerous; second safe.

## Adversarial focus

After the exact witnesses, search nearby **bounded static** variants. Do not demand arbitrary whole-program taint analysis.

### Builtins mapping/default semantics

Falsify:

- direct `builtins.__dict__.get` and `vars(builtins).get` with present safe member + dangerous default, present dangerous member + safe default, missing member + dangerous/safe default, and missing member with no default;
- `.get` must use a default only on a statically known miss; a present value must dominate the default;
- `.__getitem__` must not invent `.get`-style default behavior;
- assignment aliases of builtins mappings/methods and statically known lookup keys;
- `builtins`, `vars(builtins)`, `builtins.__dict__`, `getattr`, `vars`, `.get`, `.__getitem__`, `operator.getitem`, `operator.itemgetter`, `operator.attrgetter` chains.

### Exact container/accessor selection

Probe safe and dangerous selections through direct subscript/operator accessors, including nested bounded containers:

```python
[getattr][0](builtins, "eval")("1+1")
{"h": getattr}["h"](builtins, "eval")("1+1")
[[eval]][0][0]("1+1")
[{"ns": builtins}][0]["ns"].eval("1+1")
```

Probe safe co-presence:

```python
import builtins as b
import operator
operator.getitem({"ns": b, "eval": len}, "eval")("x")
operator.itemgetter("eval")({"ns": b, "eval": len})("x")
```

These should remain safe.

### Dict equality / last-write semantics

Probe:

```python
{0: eval, False: len}[0]("x")
{False: len, 0: eval}[False]("1+1")
{1: eval, True: len}[1]("x")
{"x": eval, "x": len}["x"]("x")
```

Respect Python last-write-wins and bool/int equality. Do not flag safe final selections merely because a dangerous value was previously co-present.

### Python lexical scope / class-body boundary

Explicitly falsify method lexical scope. In Python, method bodies do **not** close over class locals:

```python
class Safe:
    eval = lambda value: value

    def run(self):
        eval("1+1")
```

The unqualified `eval` inside `run` resolves through module globals/builtins, not the class attribute. If the scanner incorrectly carries class-local shadowing into method bodies and misses this call, that is a material bounded false negative. Also test the corresponding genuinely safe module/function-local shadowing negatives so the correction would not overflag legitimate lexical shadowing.

### Regression preservation

Preserve all accepted R6-R15 witnesses: builtins aliases, `__dict__`, `vars`, `.get`, `__getitem__`, callable `.__call__`, static aliases/f-strings, operator accessors, negative indices, builtins container extraction, boolean indices, helper identities, exact selected-slot semantics, and mapping defaults.

Also inspect the complete changed-file set for material regressions in:

- exact bounded D04 owner discovery under the frozen convention above;
- relative/absolute import normalization and generic/product directionality;
- provider/runtime/network authority exclusion;
- UMI-02 provider/listing-symbol vs economic-identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- Sukuk/Shari'ah, ILS/event-contract, securities-financing current-state, SCF/Advanced-Payable collision boundaries;
- determinism, immutability, secret-free evidence;
- preservation of the historical oracle and `src/qore` delta = 0.

Do not treat CI success as semantic proof. Do not broaden this bounded scanner into arbitrary whole-program execution/taint analysis. Do not demand that every older guard layer independently catch a witness if the authoritative R16 complete suite catches it.

## Output

If any material defect exists, report each with severity, exact file/symbol, constructible minimal witness, ACTUAL, EXPECTED, violated contract, impact, and smallest safe fix. End exactly with `HALLAZGOS: N / VALIDACIÓN NO OK`.

If no material defect survives independent falsification, state the evidence checked and end exactly with `HALLAZGOS: 0 / VALIDACIÓN OK`.
