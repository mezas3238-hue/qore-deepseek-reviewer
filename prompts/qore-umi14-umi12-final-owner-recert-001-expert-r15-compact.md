# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R15

Act as an independent adversarial expert reviewer. Do not self-certify and do not infer approval from green CI.

## Exact binding

- Repository: `mezas3238-hue/qore-core`
- PR: #461
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `d9e75395ef3898ab72cca29036e266a2084cfff8`
- HEAD TREE: `7bc24500666fadc5875a39c5771b5cff29c47d90`
- SYNTHETIC: `04eb02d8a6f01d79eb6d7fcf982a550c508739de`
- Synthetic parents must be exactly `[BASE, HEAD]` and synthetic TREE must equal HEAD TREE.
- Compare: 43 ahead / 0 behind; 19 changed files; docs/tests only; `src/qore` delta = 0.
- QORE CI #1519 / run `32971450652` / job `98185913387`: SUCCESS.
  - Ruff: all checks passed.
  - Mypy: success, 687 source files.
  - Pytest: 4410 passed, 6 historical warnings.
  - Coverage: 87% (`47568` statements / `6234` miss).

If any live binding differs, fail closed and report the mismatch instead of reviewing another candidate.

## Scope

Issue #458 / parent #363. This is the final Program-D UMI-12 owner-universe falsification recertification. The candidate must remain test/doc-only. Do not infer provider support, valuation methodology, execution capability, Production readiness, or real-capital authority.

Historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` must remain unchanged. `dataset_integrity_qualification.py` is research/data qualification and is not D04 owner material.

The complete current D04 owner convention is the frozen semantic/qualification surface already established by the candidate; do not demand an unbounded naming convention such as arbitrary `future_d04_owner.py`. Review material actual/constructible defects in the bounded contract.

## R14 accepted findings and new authoritative fix

R14 review `5030439987` on old HEAD `ec284efb4575975a4575ac3e744fc7212136995f` found three real defects. HEAD mutated, so R14 is provenance only. The new authoritative layer is:

`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r14_guards.py`

It subclasses R13 and adds bounded metadata/propagation for builtins container extraction, accessor aliases, and boolean static indices. Older R12/R13 layers are historical regression evidence; the complete suite may rely on R14 to close later findings and need not make every older helper textually equivalent.

First reproduce/falsify these exact R14 witnesses against the COMPLETE candidate suite and R14 scanner:

```python
import builtins as b
[b][0].eval("1+1")
```

```python
import builtins as b
import operator
operator.getitem([b], 0).eval("1+1")
operator.itemgetter(0)([b]).__import__("math")
{"ns": b}["ns"].exec("pass")
```

```python
import builtins
a = getattr(builtins.__dict__, "get")
a("eval")("1+1")
b = getattr(vars(builtins), "__getitem__")
b("__import__")("math")
```

```python
import builtins
import operator
c = operator.attrgetter("get")(builtins.__dict__)
c("exec")("pass")
```

```python
import operator
[len, eval][True]("1+1")
operator.itemgetter(True)([len, eval])("1+1")
operator.getitem([len, eval], True)("1+1")
[eval, len][False]("1+1")
```

Safe negatives must remain unmarked, including safe selected positions and ordinary mappings/accessors despite co-present dangerous spelling:

```python
import builtins as b
import operator
[len, b][0]("x")
operator.itemgetter(-1)([b, len])("x")
operator.getitem([b, len], -1)("x")
[eval, len][True]("x")
operator.itemgetter(False)([len, eval])("x")
mapping = {"eval": len}
getter = getattr(mapping, "get")
getter("eval")("x")
```

## Adversarial focus

After exact witnesses, search nearby bounded static variants rather than demanding arbitrary whole-program taint analysis. In particular falsify:

- tuple/list/dict builtins extraction by positive, negative, boolean, string and integer keys where statically determined;
- `operator.getitem` / `operator.itemgetter` selection preserving exact selected-position semantics, including safe co-presence;
- `getattr` / `operator.attrgetter` aliases of `get` and `__getitem__` over `builtins.__dict__` and `vars(builtins)`;
- alias assignment of the resulting builtins mapping helper and subsequent `eval`/`exec`/`__import__` key lookup;
- chained but statically bounded equivalents such as `operator.itemgetter("ns")({"ns": builtins})` followed by dangerous attribute access;
- boolean-key semantics in mappings only where Python equality/hash semantics make the lookup statically equivalent; avoid blanket bool-as-int treatment outside index/key interpretation;
- previously accepted R6-R13 witnesses (builtins aliases, `__dict__`, `vars`, `.get`, `__getitem__`, callable `.__call__`, constant/f-string keys, operator accessors, negative indices) for regression;
- false positives: selecting a safe member from a container that also contains builtins/eval must remain safe.

Also inspect the complete changed-file set for material regressions in owner discovery, relative/absolute import normalization, provider/runtime/network exclusion, UMI-02 provider-symbol separation, generic/product directionality, SFT current-state authority separation, semantic collision/non-conflation, determinism/immutability/secret-free evidence, and preservation of the historical oracle.

Do not treat CI success as semantic proof. Do not require every historical scanner helper to independently catch a witness if the authoritative complete suite catches it. Do not broaden D04 ownership to arbitrary filenames outside the established convention without repository evidence.

## Output

If any material defect exists, report each with severity, exact file/symbol, constructible minimal witness, ACTUAL, EXPECTED, violated contract, impact, and smallest safe fix. End exactly with `HALLAZGOS: N / VALIDACIÓN NO OK`.

If no material defect survives independent falsification, state the evidence checked and end exactly with `HALLAZGOS: 0 / VALIDACIÓN OK`.
