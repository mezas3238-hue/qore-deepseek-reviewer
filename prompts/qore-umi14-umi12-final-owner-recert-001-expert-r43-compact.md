# QORE DeepSeek Expert R43 — compact differential review

Independent adversarial Expert review of PR #461 on the exact frozen candidate below. R42 is consumed and semantically inconclusive: it hit the final-evidence safety fuse before validation. Do not rerun or treat R42 as approval/finding.

## Exact frozen binding
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `d186fc91b084067e944cb4b9940f08629cc9bb7d`
- HEAD TREE `453ea23312cd351f361960b60e4b95b2116b4de4`
- SYNTHETIC `db128c4eb87bd69fca26a931c787e51efb904f88`
- synthetic TREE equals HEAD TREE; parents exactly `[BASE, HEAD]`
- compare 98 ahead / 0 behind; 65 changed files, all `docs/`/`tests/`; `src/qore delta=0`
- historical oracle blob unchanged: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- exact-head QORE CI #1569 / `33059633184`: Ruff OK; Mypy OK in 710 source files; Pytest 4592 passed, 6 historical warnings; coverage 87%.

## Evidence partition — mandatory compactness
Do NOT collect or require the full contents of all 65 changed files. That caused R42's evidence fuse and is unnecessary for this differential gate. Treat the green full regression suite and immutable prior layers as regression evidence, not semantic proof. Inspect completely only the current authoritative delta and fetch inherited slices only when needed to falsify a concrete path:

1. `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r41_guards.py`
2. `docs/audits/UMI14-UMI12-R41-HARDENING.md`
3. immediate helper slices actually referenced by R41 from R38/R39/R40/R35/R15/R12.
4. the unchanged oracle only by blob/binding unless a concrete R41 interaction requires source.

Do not spend evidence budget re-reading unrelated historical R4–R37 layers. Their regressions execute in #1569; inspect a historical slice only for a concrete inheritance question raised by R41.

## Why R41 exists
R41 Expert on prior HEAD found two valid defects:
- exact starred `float`/`complex`/`Ellipsis` were not definite failures and allowed later unreachable dynamic calls;
- numerically equal mapping keys (`bool`/`int`/`float`/zero-imaginary complex) did not share last-write-wins selection.

Current R41 introduces exact float/complex/Ellipsis atoms, mapping-only normalized numeric key tokens, and exact itemgetter descriptors. Initial candidate CI #1568 caught a self-regression: `operator.itemgetter(1.0)` had been normalized to integer too early and incorrectly became a sequence index. Current HEAD preserves float/complex itemgetter type with `vf:`/`vc:` and normalizes only when applying to a mapping. Integer/bool sequence indexing remains valid.

## Adversarial falsification priorities
Use minimal real-Python witnesses and compare exact scanner markers.

A. Star evaluation: `*float`, `*complex`, `*Ellipsis`, aliases, unary +/- aliases, tuple/list composites; ensure definite failure suppresses only later expressions. `bytes`/`str`/exact sequences are iterable and must not be classified as definite failure.

B. Numeric mapping equality: `False/0/0.0/-0.0/0j`, `True/1/1.0/(1+0j)`, signed integral floats, non-integral floats, non-real complex. Verify last-write-wins in both dangerous→safe and safe→dangerous order. Float/complex keys must never become sequence indices merely because numerically integral.

C. Accessor parity: direct subscript, mapping `.get`, `.__getitem__`, `operator.getitem`, `operator.itemgetter`; construction-then-application aliases. Exact selected safe slot must not inherit co-present `eval/exec/__import__`.

D. Itemgetter type preservation: `itemgetter(1.0)` on a list must model Python's invalid list index (not select position 1); `itemgetter(1)`/`itemgetter(True)` may index. Applying `itemgetter(1.0)` to a mapping with key `1` must use numeric key equality.

E. Builtins namespace: non-string numeric keys are definite misses for `builtins.__dict__.get`; do not confuse a normal mapping container containing `builtins` with the builtins namespace itself.

F. NaN: only report a defect if there is a concrete reproducible false positive/negative under the current bounded model. Do not require arbitrary object-identity modeling.

Also check that the R41 owner/oracle regression remains marker-free and no production/readiness claim is introduced. Do not infer Program-D PASS, provider readiness, Production readiness, authorization, or real-capital readiness.

Report every material reproducible defect with file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded fix. If evidence is sufficient and no material defect survives, final line exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
If defects survive, final line exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`
If genuinely blocked, explain the exact missing evidence; do not request the unrelated full 65-file surface.