# QORE DeepSeek Expert R44 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. Review only the exact frozen candidate below.

R41 on an earlier HEAD found two valid harness defects, both corrected on the current candidate. R42 and R43 are consumed and semantically inconclusive: both stopped before final reasoning because the mandatory complete evidence bundle measured 528,547 characters, above the historical 520k final-evidence fuse. They are neither approval nor findings. Reviewer infrastructure now preserves the same complete-evidence and fail-closed contracts while using a measured 560k final-evidence fuse; no QORE Core content changed for this infrastructure correction.

## Frozen binding
- PR `#461`
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `d186fc91b084067e944cb4b9940f08629cc9bb7d`
- HEAD TREE `453ea23312cd351f361960b60e4b95b2116b4de4`
- SYNTHETIC `db128c4eb87bd69fca26a931c787e51efb904f88`
- synthetic TREE equals HEAD TREE; parents exactly `[BASE, HEAD]`
- compare 98 ahead / 0 behind / merge-base BASE / 65 changed files
- changed paths only `docs/` and `tests/`; `src/qore delta=0`
- historical oracle blob unchanged at BASE/HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- QORE CI #1569 / run `33059633184`: Ruff OK; Mypy OK in 710 source files; Pytest 4592 passed, 6 historical warnings; coverage 87%

## Current authoritative hardening
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r41_guards.py::_R41NumericStarAndMappingScanner`

R41-F1 correction: exact float, complex, and Ellipsis values have distinct scalar representations and are definitely non-iterable for `*` expansion. Later unreachable arguments/elements must not be scanned; earlier reachable effects remain. Iterable `bytes` must not be misclassified.

R41-F2 correction: Python numeric mapping-key equality/last-write-wins is modeled across bool/int/float/zero-imaginary complex equivalents, while non-integral float and non-real complex keys remain exact. Numeric normalization is mapping-only.

QORE CI #1568 exposed and rejected an intermediate self-regression where `operator.itemgetter(1.0)` was normalized too early to integer and became a valid sequence index. Current HEAD fixes that by preserving float/complex itemgetter key type (`vf:` / `vc:`) until the receiver is known; mapping application may normalize numeric equality, sequence application must preserve invalid float/complex index semantics.

## Adversarial priorities
Falsify rather than rubber-stamp. Use real Python semantics and minimal constructible witnesses.

1. Evaluation order and starred failure: literals/aliases/unary +/- for float, complex, Ellipsis; tuple/list composites; earlier side effects retained, later unreachable dynamic calls suppressed; strings/bytes/exact sequences remain iterable.
2. Numeric mapping equality and last-write-wins: `False/0/0.0/-0.0/0j`, `True/1/1.0/(1+0j)`, signed integral floats, non-integral floats, non-real complex, duplicate-key order in both dangerous-to-safe and safe-to-dangerous directions.
3. Selection parity across direct subscript, mapping `.get`, `.__getitem__`, `operator.getitem`, and `operator.itemgetter`; safe exact selected slots must not inherit co-present `eval`, `exec`, or `__import__`.
4. Itemgetter type preservation: `itemgetter(1.0)` and complex numeric keys must not become list/tuple indices; integer and bool indices retain Python sequence behavior. Mapping keys may use numeric equality only after receiver type is known.
5. Builtins namespace exact non-string misses/defaults versus ordinary mappings containing a builtins module value; explicit container kind must win over flattened semantic atoms.
6. NaN/non-reflexive numeric keys: report only concrete material scanner mismatches; do not require arbitrary object-identity modeling absent a constructible witness.
7. Inherited interactions with R35/R37/R38/R39/R40: unknown starred positional shape must not fabricate positions, failure propagation must preserve Python order, sequence `.get` must fail before args, exact container selection must remain precise.
8. Current owner/oracle surface and scope claims: no dynamic execution marker on the complete owner/oracle regression, no provider/runtime/network authority introduced, no Production or real-capital claim.

Inspect the complete deterministic changed-file evidence and required dependency slices supplied by the harness. Green CI is evidence, not semantic proof.

Report every material reproducible defect with exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded correction.

If evidence is sufficient and no material defect survives, conclude exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

If findings survive, conclude exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If genuinely missing evidence remains, fail closed and identify it; do not infer PASS.