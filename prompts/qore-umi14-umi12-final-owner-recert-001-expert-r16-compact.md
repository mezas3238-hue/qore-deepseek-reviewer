# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R16

Act as an independent adversarial expert reviewer. Do not self-certify and do not infer approval from green CI.

## Exact binding

- Repository: `mezas3238-hue/qore-core`
- PR: #461
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `69b0557c952f41cb074fb061a0d01e5ff1ce2db0`
- HEAD TREE: `825014292bb40c26a4f33ee0ae811c872a8460ef`
- SYNTHETIC: `aad6dd4c4632992085454165bebfaf8a91aae98c`
- Synthetic parents must be exactly `[BASE, HEAD]` and synthetic TREE must equal HEAD TREE.
- Compare: 48 ahead / 0 behind; 21 changed files; docs/tests only; `src/qore` delta = 0.
- Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` is unchanged.
- QORE CI #1524 / run `32977532336` / job `98205821850`: SUCCESS.
  - Ruff: all checks passed.
  - Mypy: success, 688 source files.
  - Pytest: 4418 passed, 6 historical `PytestCollectionWarning` warnings.
  - Coverage: 87% (`47568` statements / `6234` missed).

If any live binding differs, fail closed and report the mismatch instead of reviewing another candidate.

## Scope

Issue #458 / parent #363. This is the final Program-D UMI-12 owner-universe falsification recertification. The candidate must remain test/doc-only. Do not infer provider support, valuation methodology, execution capability, Production readiness, or real-capital authority.

The complete current D04 owner convention is the bounded semantic/qualification surface already established by the candidate: current `*_semantics.py`, current `*_qualification.py` excluding `dataset_integrity_qualification`, plus the six frozen legacy owners. Do not demand an unbounded arbitrary naming universe such as `future_d04_owner.py` without repository evidence.

Older R4-R14 guard layers are historical regression evidence. The new authoritative layer is:

`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r15_guards.py`

The complete candidate suite may rely on the newest layer to close later findings; do not require every historical helper to independently implement the newest semantics.

## R15 accepted findings and authoritative correction

R15 on old HEAD `d9e75395ef3898ab72cca29036e266a2084cfff8` found three real defects. That certification is provenance only after mutation:

1. `.get` / `.__getitem__` over a statically modeled mapping could lose exact selected `builtins` identity.
2. builtins `getattr` / `vars` helper identity could be lost through mapping/operator extraction.
3. equivalent boolean/integer dictionary keys could retain stale dangerous metadata instead of Python last-write-wins semantics.

The R15 correction introduces exact `selected-slot` metadata and central bounded static selection semantics across direct subscript, mapping methods, `operator.getitem`, and `operator.itemgetter`. During Quality Gate, an additional real defect was exposed and fixed: a statically missing mapping `.get(key, default)` must propagate its default; a present key must still select the present value.

First reproduce/falsify these exact R15 witnesses against the COMPLETE candidate suite and R15 scanner:

```python
import builtins as b
{"ns": b}.get("ns").eval("1+1")
{"ns": b}.__getitem__("ns").exec("pass")
{"ns": b}["ns"].__import__("math")
```

```python
import builtins
import operator
builtins.__dict__.get("getattr")(builtins, "eval")("1+1")
operator.getitem(vars(builtins), "vars")(builtins)["exec"]("pass")
operator.itemgetter("getattr")(builtins.__dict__)(builtins, "__import__")("math")
operator.attrgetter("vars")(builtins)(builtins)["eval"]("1+1")
```

```python
import builtins
getter = builtins.__dict__.get
getter("getattr")(builtins, "eval")("1+1")
item = vars(builtins).__getitem__
item("vars")(builtins)["__import__"]("math")
```

```python
{False: eval, 0: len}[False]("x")
{True: eval, 1: len}.get(True)("x")
```

The preceding two are SAFE and must remain unmarked because the later equivalent key wins.

```python
{0: len, False: eval}[0]("1+1")
{1: len, True: eval}.get(1)("1+1")
```

The preceding two are DANGEROUS and must be marked because `False`/`True` overwrite the equal integer key.

Quality-Gate regression that must be preserved:

```python
{}.get("missing", eval)("1+1")
{"present": len}.get("present", eval)("x")
```

Expected: the first call is dangerous through the default; the second is safe because the present mapping value wins.

## Adversarial focus

After exact witnesses, search nearby bounded static variants rather than demanding arbitrary whole-program taint analysis. In particular falsify:

- `.get` hit/miss/default behavior on statically modeled dicts, including no-default misses and present-key precedence over a dangerous default;
- `.__getitem__` misses: do not fabricate a `.get`-style default and do not turn an unknown miss into false dangerous authority;
- duplicate static dict keys under Python equality/hash semantics: `False == 0`, `True == 1`, reversed write order, and distinction from string keys like `"0"`/`"1"`;
- exact selected-slot propagation for list/tuple/dict values containing safe callables, dangerous callables, `builtins`, helper identities, and ordinary unknown values;
- positive, negative and boolean sequence indices through direct subscript, `operator.getitem`, and `operator.itemgetter`;
- string/integer mapping keys through direct subscript, `.get`, `.__getitem__`, `operator.getitem`, and `operator.itemgetter`;
- `builtins`, `vars(builtins)`, `builtins.__dict__`, `getattr`, `vars`, `.get`, `.__getitem__`, `operator.getitem`, `operator.itemgetter`, and `operator.attrgetter` helper chains and assignment aliases;
- safe co-presence: selecting `len` or another safe/unknown member must not become dangerous merely because another slot contains `eval` or `builtins`;
- mapping default values: safe present value must dominate dangerous default; dangerous default must be propagated only on a statically known miss;
- nested but bounded containers/accessors where the exact selected slot is statically known;
- all previously accepted R6-R14 witnesses for regression: builtins aliases, `__dict__`, `vars`, `.get`, `__getitem__`, callable `.__call__`, static aliases/f-strings, operator accessors, negative indices, builtins container extraction, boolean indices;
- lexical shadowing and ordinary mapping/accessor negatives must remain unmarked.

Also inspect the complete changed-file set for material regressions in:

- exact bounded D04 owner discovery;
- relative/absolute import normalization and generic/product directionality;
- provider/runtime/network authority exclusion;
- UMI-02 provider/listing-symbol vs economic-identity separation;
- RATE/YIELD/SPREAD/PRICE/NAV/IV/NOTIONAL/QUANTITY/WEIGHT anti-flattening;
- Sukuk/Shari'ah, ILS/event-contract, securities-financing current-state, SCF/Advanced-Payable collision boundaries;
- determinism, immutability, secret-free evidence;
- preservation of the historical oracle and `src/qore` delta = 0.

Do not treat CI success as semantic proof. Do not broaden this bounded scanner into arbitrary whole-program execution/taint analysis. Do not demand that every older guard layer independently catch a witness if the authoritative R15 complete suite catches it.

## Output

If any material defect exists, report each with severity, exact file/symbol, constructible minimal witness, ACTUAL, EXPECTED, violated contract, impact, and smallest safe fix. End exactly with `HALLAZGOS: N / VALIDACIÓN NO OK`.

If no material defect survives independent falsification, state the evidence checked and end exactly with `HALLAZGOS: 0 / VALIDACIÓN OK`.
