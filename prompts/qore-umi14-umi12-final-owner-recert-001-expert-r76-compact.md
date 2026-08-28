# DeepSeek Expert R76 — QORE UMI14 / UMI12 Final Owner Recertification

You are an independent adversarial Expert reviewer. GitHub live state, exact checkout, and raw executable evidence generated inside this run are authoritative. Do not inherit R75's CLEAN conclusion.

## Frozen binding

- Core repo: `mezas3238-hue/qore-core`
- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `b0377ee6962c38c4189f566677669027d76fed60`
- HEAD tree: `3151a458a845a87deb6367336471f451a50dfacce`
- SYNTHETIC: `17128a9c0ad0d7fdf055c276f6df3ee9ac2a547e`
- Synthetic parents MUST be BASE then HEAD; synthetic tree MUST equal HEAD tree.
- Historical oracle blob: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- Changed scope: 104 docs/tests paths, `src/qore` delta zero.

Exact-head QORE CI #1630 / run `33127571375` / job `98709243249` is SUCCESS: CPython 3.12.14, Ruff clean, Mypy 730 source files, 4746 tests passed, six pre-existing warnings, coverage 47568/6234 = 87%.

## Consumed-review boundary

R75 executed and published `HALLAZGOS: NINGUNO / VALIDACIÓN OK` on this same HEAD. Integration Authority does NOT accept that verdict by authority. Independent post-review falsification identified an adjacent stored-default surface that R75's mandatory matrix never executed. R75 is consumed evidence, not certification until this surface is discharged.

No Core mutation has occurred since R75. R76 must adjudicate the new evidence plus ensure the prior R62D mandatory suite still holds.

## Priority 0 — mandatory module-namespace default probes

Reviewer v12 executes these probes BEFORE model finalization. They are mandatory. Do not infer results from code or tests: quote/adjudicate the raw runtime and exact scanner outputs.

### A. `globals()` stored in function default

Runtime witness:

```python
import builtins
def hold(namespace=globals()):
    return None
result = hold.__defaults__[0]["builtins"].eval("1+1")
print(result)
```

### B. `globals()` stored in lambda default

```python
import builtins
hold = lambda namespace=globals(): None
result = hold.__defaults__[0]["builtins"].eval("1+1")
print(result)
```

### C. module `vars()` stored in function default

```python
import builtins
def hold(namespace=vars()):
    return None
result = hold.__defaults__[0]["builtins"].eval("1+1")
print(result)
```

### D. module `vars()` stored in lambda default

```python
import builtins
hold = lambda namespace=vars(): None
result = hold.__defaults__[0]["builtins"].eval("1+1")
print(result)
```

For every witness require:

1. real CPython 3.12 runtime result;
2. exact `scanner=r62c` output;
3. exact `scanner=r62d` output.

If runtime executes `eval` and returns `2` while R62D emits `()`, classify `VALID / MATERIAL / HARNESS DEFECT`. A later outer failure cannot erase already executed dangerous behavior.

## Why this is a distinct falsification target

Read and verify the actual current code rather than trusting this description:

- R12 `_IMPLICIT_BINDINGS` models `builtins`, `__builtins__`, `eval`, `exec`, `__import__`, `getattr`, and `vars`, but does not model the builtin `globals` helper.
- R55 module-scope `vars()` produces `_r55_module_vars_value()`, which encodes only a structural selected-slot for `s:__builtins__` rather than the complete current module namespace.
- R62D `_is_sensitive_default_value` marks inherited sensitive values or a top-level `importlib` atom. Verify whether a structural selected-slot containing builtins is recognized as sensitive when the *mapping itself* is stored.
- CPython stores the actual mapping object in `__defaults__`; importing `builtins` before defining the callable makes the key `"builtins"` reachable from that retained mapping even when the function/lambda body never uses the parameter.

The defect, if reproduced, is not merely unknown static precision: the scanner explicitly claims fail-closed dynamic-execution falsification and the runtime witness executes `eval` through a statically bounded retained capability.

## Required implementation-path adjudication

If the witnesses fail closed, identify the exact current methods/atoms that cause containment.

If they escape, identify the exact responsible path, including:

- Name/call evaluation of `globals` and/or module `vars()`;
- `_r55_module_vars_value` structural representation;
- inherited `_is_sensitive_value` behavior;
- R62D default capture by AST-node identity;
- why the stored mapping is or is not recognized as sensitive;
- why subsequent `__defaults__` extraction is invisible after the function/lambda name becomes unknown.

Do not invent an MRO from filenames; trace actual class declarations and `super()` routing.

## Bounded correction contract if material

Recommend the smallest compositional correction. Do not rewrite the scanner or introduce arbitrary execution. A valid correction should preserve one-pass default evaluation and may, for example, model module-namespace helpers/capability metadata or recognize an already-modeled mapping that retains builtins authority when stored as a default. It must include predecessor reproduction, function+lambda witnesses, `globals` and `vars`, safe/bounded negatives as appropriate, nested-frame integrity, owner/oracle cleanliness, and all prior R62D regressions.

Do not require `globals()`/module-`vars()` capture to remain clean merely because the immediate sample accesses `len`: retaining the whole module namespace itself exposes builtins/eval through `__defaults__` and is therefore capability-sensitive if the runtime witness proves that reachability.

## Prior R62D matrix remains mandatory

Adjudicate the injected v11/v12 evidence proving the already-certified categories remain unchanged: direct/computed `eval` defaults, keyword-only defaults, container defaults, `importlib.import_module`, `importlib` namespace defaults, safe `len`, R62C/R62B importlib/builtins/operator/opaque-call regressions, multi-star behavior, failed-star keyword chronology, and safe inverses.

If any mandatory pre-model probe is missing, errors, uses the wrong scanner, or cannot be adjudicated, return `MECHANICAL REVIEW FAILURE`.

## Architecture boundary

Reconfirm no `src/qore` mutation, oracle integrity, owner/oracle scanner cleanliness, 19 Program-D/UMI-02 binding surface, and no provider/Production/real-capital authorization claim. Do not authorize merge.

## Finding contract

For every material finding give: stable ID, severity, exact file+symbol/path, minimal witness, real CPython result, exact R62C result, exact R62D result, actual MRO/method route, violated invariant/impact, `VALID` or `INVALID`, `OWNER DEFECT` or `HARNESS DEFECT`, and smallest bounded correction.

Only if ALL mandatory probes—including the four new module-namespace stored-default witnesses—were executed/adjudicated and no material finding survives, end literally:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`

If any material finding survives, end with `VALIDACIÓN NO OK`.
