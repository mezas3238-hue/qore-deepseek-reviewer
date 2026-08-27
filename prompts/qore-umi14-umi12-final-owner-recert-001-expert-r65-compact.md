# QORE UMI-14 / UMI-12 final owner-universe recertification — DeepSeek Expert R65

## Frozen target — verify first

Repository `mezas3238-hue/qore-core`, PR `#461`, issue `#458`, EXPERT.

- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `ae0e43ca40a10b3ff71c3dcd9b93b885a1c54e9c`
- HEAD TREE `f6ef09487ea4dbfdf3198de51d723db31c4df15e`
- SYNTHETIC `54f0b4b803449e9821a2f51a0f62288e08817d6c`
- SYNTHETIC TREE `f6ef09487ea4dbfdf3198de51d723db31c4df15e`
- ordered parents: BASE, HEAD
- QORE CI #1614 / run `33115457033`: SUCCESS; CPython 3.12.14; Ruff green; Mypy green over 726 files; Pytest `4694 passed`; 6 pre-existing PytestCollectionWarnings; coverage 87%
- Base→Head: 143 ahead / 0 behind; 96 files, docs/tests only; `src/qore delta=0`
- historical oracle blob `249caa1504e2b62277a9389dc7e73bcabf12e7db` unchanged
- R61 blob `96e3e3f6ae5f67b49f67bf06a50e0d72907db086`

Abort MECHANICAL-INVALID on any binding mismatch.

R63 and R64 are CONSUMED and are not authority. R63 incorrectly claimed multiple starred positional segments in one Python call were invalid. R64 correctly refused approval because the old connector could not provide executable evidence. The connector has now been repaired. Review FROM SCRATCH.

QORE Core is independent of all reviewer infrastructure. You are a read-only observer. Never propose DeepSeek-specific code in Core.

## Mandatory evidence protocol

You now have `read_file`, native-Git `search_text`, `python_semantics_probe`, and `scanner_probe` tools. USE THEM. Do not infer required runtime/scanner outcomes from names, comments, or previous reviews.

Before any CLEAN verdict, the RAW EVIDENCE BUNDLE must contain all of the following categories:

### A. Real CPython multi-star proof

Call `python_semantics_probe` in `ast` mode on `f(*a, *b)` and establish that one Call has two `ast.Starred` positional arguments.

Call it in `run` mode on:

```python
def f(*args):
    return args
print(f(*(1,), *(2,)))
```

Report the exact output. Any claim that multiple stars are invalid is a review failure.

### B. Exact scanner source

Use `read_file` to inspect at minimum the operative portions of:

- `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r61_guards.py`
- `..._r60_guards.py`
- `..._r39_guards.py`
- `..._r38_guards.py`
- `..._r41_guards.py`

Trace actual MRO/method ownership sufficiently to determine which `_scan_call_arguments` and mapping selection logic R61 uses. Do not infer from filenames.

### C. Mandatory exact R61 scanner probes

Use `scanner_probe(scanner="r61", source=...)` for EACH of these classes and report actual marker tuples:

1. Prior MC-1 unknown get:
```python
import builtins
def reveal(arguments):
    return builtins.__dict__.get(*arguments)
reveal(("eval", None))("1+1")
```

2. Prior MC-1 unknown getitem:
```python
import builtins
def reveal(arguments):
    return builtins.__dict__.__getitem__(*arguments)
reveal(("eval",))("2+2")
```

3. Exact multi-star dangerous get:
```python
import builtins
builtins.__dict__.get(*("eval",), *(None,))("1+1")
```

4. Exact multi-star safe get:
```python
import builtins
builtins.__dict__.get(*("len",), *(None,))("abc")
```

5. Exact multi-star dangerous getitem:
```python
import builtins
builtins.__dict__.__getitem__(*(), *("eval",))("1+1")
```

6. Two unknown stars:
```python
import builtins
def reveal(a, b):
    return builtins.__dict__.get(*a, *b)
reveal(("eval",), (None,))("1+1")
```

7. Mixed exact then unknown:
```python
import builtins
def reveal(arguments):
    return builtins.__dict__.get(*("eval",), *arguments)
reveal((None,))("1+1")
```

8. Mixed unknown then exact:
```python
import builtins
def reveal(arguments):
    return builtins.__dict__.get(*arguments, *(None,))
reveal(("eval",))("1+1")
```

9. R60 generic regression:
```python
def reveal(arguments):
    return getattr(*arguments)
```

10. Definite failure before dangerous later expression:
```python
import builtins
builtins.__dict__.get(*None, eval("1+1"))("x")
```

Probe additional variants if any result is surprising.

### D. Real CPython ordering/arity checks

Use `python_semantics_probe(mode="run")` for safe witnesses needed to establish actual evaluation order and multiple-star arity. A side-effect witness must demonstrate whether a later expression runs after `*None`. Do not rely on remembered evaluation semantics.

### E. Dynamic execution/import guard evidence

Use `scanner_probe(scanner="final_owner", ...)` or exact source inspection to test/identify the real guard for representative forms:

- `importlib.import_module(...)`
- `from importlib import import_module; import_module(...)`
- `__import__(...)`
- `getattr(builtins, "__import__")(... )`
- `vars(builtins)["eval"](... )`
- `builtins.__dict__["eval"](... )`

Do not claim `ast.Import` alone detects dynamic calls.

## Broader falsification

Independently inspect owner/qualification discovery and exact manifest equality; look for naming/suffix escapes, omissions, stale allowlists, self-comparison, symmetric oracle fixtures, skips/xfails/noqa/type-ignore/coverage weakening. Attack authority directionality: generic/product qualification, provider/listing vs economic identity, SCF/Advanced-Payable, Sukuk/Shari'ah, ILS/event-contract, SFT static/current-state. `src/qore delta=0` is scope, not semantic proof.

Seek false positives and false negatives equally. Unknown state must not silently prove safety where dangerous reachability remains, but fail-closed logic must not invent execution after a definite CPython failure.

## Finding format

For every surviving material finding: severity; OWNER DEFECT / HARNESS DEFECT / MECHANICAL REVIEW FAILURE; exact path/symbol; minimal witness; raw CPython result where applicable; raw scanner result; expected behavior; root cause; why current tests miss it; bounded correction layer.

If mandatory evidence is unavailable, classify MECHANICAL REVIEW FAILURE and do NOT emit VALIDACIÓN OK.

If and only if the binding is exact, all mandatory evidence categories were actually collected, and no material finding survives, finish exactly:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
