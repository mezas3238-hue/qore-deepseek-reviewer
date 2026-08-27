# QORE DeepSeek Expert R42 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R41 is consumed and reported two valid harness defects on prior HEAD `a364498e3000f318ae67db0c3e3786714a346ac6`; do not credit R41 as approval for this candidate. A first R41 correction candidate then exposed an additional self-regression in QORE CI #1568; that candidate is also stale. Review only the exact frozen binding below.

## Frozen binding

- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `d186fc91b084067e944cb4b9940f08629cc9bb7d`
- HEAD TREE: `453ea23312cd351f361960b60e4b95b2116b4de4`
- synthetic: `db128c4eb87bd69fca26a931c787e51efb904f88`
- synthetic TREE: `453ea23312cd351f361960b60e4b95b2116b4de4`
- synthetic parents: BASE then HEAD exactly
- compare: 98 ahead / 0 behind / merge-base BASE / 65 changed files
- scope: changed paths only under `docs/` and `tests/`; `src/qore delta=0`
- historical oracle blob at BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- QORE CI #1569 / run `33059633184`: Ruff OK; Mypy OK (`710 source files`); Pytest `4592 passed`, 6 historical warnings; coverage total 87%

## R41 findings and candidate corrections

R41-F1 was VALID: exact starred `float`, `complex`, and `Ellipsis` values are definitely non-iterable, but the prior generic exact-non-string representation also covered iterable `bytes`. New authoritative layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r41_guards.py::_R41NumericStarAndMappingScanner`.
It gives float/complex/Ellipsis distinct exact kinds and classifies only those scalar kinds as definitely non-iterable; `bytes` remains outside that classification. Starred call/tuple/list evaluation must stop only later unreachable expressions while preserving already evaluated side effects.

R41-F2 was VALID: numerically equal mapping keys such as `True`, `1`, `1.0`, and zero-imaginary complex equivalents must collide and obey Python last-write-wins. R41 now normalizes numeric keys for mapping selection while retaining deterministic exact tokens for non-integral float/non-real complex values and deliberately assigning no equality token to NaN.

The initial R41 correction candidate normalized `operator.itemgetter(1.0)` too early to `i:1`, which incorrectly made a float a valid sequence index. QORE CI #1568 caught this in `test_r41_float_keys_do_not_become_sequence_indices`. Current HEAD fixes that by preserving exact itemgetter numeric key type in descriptor prefixes (`vf:` / `vc:`) and normalizing only after the eventual receiver is known to be a mapping. Integer/bool itemgetter sequence indexing remains valid.

## Adversarial priorities

Falsify, do not rubber-stamp. Focus especially on:

1. Python evaluation order and definite starred failure for direct literals and aliases of float, complex, Ellipsis; verify later arguments/elements are unreachable but earlier evaluated dynamic calls remain marked. Distinguish iterable constants (`str`, `bytes`, tuples/lists) from non-iterable scalar constants.
2. Numeric mapping equality/hash/last-write-wins across bool/int/float/zero-imaginary complex values, including `0`, `False`, `0.0`, `-0.0`, `0j`, signed values, exactly integral finite floats, and safe inverses. Look for stale selected-slot metadata or co-present dangerous-value pollution.
3. Non-integral floats and non-real complex mapping keys: direct subscript, `.get`, `.__getitem__`, `operator.getitem`, and `operator.itemgetter` must agree on exact selected value where modeled.
4. Itemgetter key-type preservation: `itemgetter(1.0)` must not act as sequence index; `itemgetter(1)` and `itemgetter(True)` may index sequences under Python semantics. Mapping application may normalize equivalent numeric keys. Check aliases/nested accessors and construction-then-application paths.
5. NaN/non-reflexive key behavior: current harness intentionally emits no numeric equality token for NaN. Falsify whether this can create a material false positive/negative in the modeled exact paths; do not demand arbitrary object-identity modeling without a reproducible witness.
6. Builtins namespace `.get` and `__getitem__`: exact non-string numeric keys must not be confused with mapping container selection; dangerous defaults are evaluated according to Python order and returned only on definite miss.
7. Interactions with R35/R37/R38/R39/R40: unknown positional star shape must not fabricate argument positions; exact container kind must take precedence over flattened builtins atoms; sequence `.get` must fail before args; direct subscript/accessor paths must preserve failure and selection semantics.
8. Current owner universe completeness, provider/runtime/network exclusion, historical oracle preservation, and all prior authoritative regression layers. The changed candidate is docs/tests-only and makes no production semantics change.

Inspect the actual exact-head source, not this summary alone. Report every material reproducible defect with exact file/symbol, minimal Python witness, actual scanner behavior, expected behavior, violated invariant, and bounded correction.

Do not infer provider support, operational readiness, Production readiness, production authorization, real-capital readiness, or Program-D PASS from green CI.

If no material finding survives adversarial falsification, final line must be exactly:

`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise final line must be exactly:

`HALLAZGOS: N / VALIDACIÓN NO OK`
