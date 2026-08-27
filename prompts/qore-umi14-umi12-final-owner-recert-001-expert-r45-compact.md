# QORE DeepSeek Expert R45 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. Review only the exact frozen candidate below. Do not infer semantic validity from green CI or prior reviews.

R44 on the immediately preceding HEAD found one valid bounded harness defect: unary `+/-` applied to exact Ellipsis could degrade to unknown, so a later dynamic argument after `*-...`/`*+...` was scanned even though Python raises `TypeError` first. The current candidate adds an R44 successor layer that closes that finding. R44 is consumed and does not certify this mutated HEAD.

## Frozen binding
- PR `#461`
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `243d598439c011e1aa65a78832f8d26dfda82932`
- HEAD TREE `50658cfd2df6ad9bf628c577c14a27120892a1bb`
- SYNTHETIC `c18527dd2e4d57f4bb3fc6d61a67290d691a72f1`
- SYNTHETIC TREE `50658cfd2df6ad9bf628c577c14a27120892a1bb`
- synthetic parents exactly `[BASE, HEAD]`
- compare `100 ahead / 0 behind`; merge-base exactly BASE; 67 changed files
- all changed paths are under `docs/` or `tests/`; `src/qore delta=0`
- historical oracle blob unchanged: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- QORE CI #1571 / run `33062270964`: Ruff OK; Mypy OK in 711 source files; Pytest 4597 passed, 6 historical warnings; coverage 87%

Reviewer infrastructure preserves complete mandatory changed-file evidence and fail-closed behavior. The final-evidence safety fuse is 560k characters, raised monotonically from the historical 520k fuse after measured complete evidence exceeded it; evidence must not be truncated or skipped.

## Current authoritative successor
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r44_guards.py::_R44UnaryEllipsisFailureScanner`

It subclasses R41 and changes only exact unary-Ellipsis failure semantics:
- direct `-...` and `+...` return the existing definite-failure value;
- names already bound to exact Ellipsis do the same under unary `+/-`;
- later call arguments and tuple/list elements after that definite failure must remain unreachable;
- earlier reachable dynamic execution remains visible;
- R41 float/complex unary behavior and iterable `bytes` starred behavior remain inherited unchanged.

The companion document is `docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R44-HARDENING.md`.

## Adversarial priorities
Falsify, do not rubber-stamp. Use real Python semantics and minimal constructible witnesses.

1. R44 exact witness and variants: `f(*-..., eval(...))`, `f(*+..., exec(...))`, exact Ellipsis aliases, tuple/list starred composites, and earlier reachable side effects before the unary-Ellipsis failure.
2. Unary evaluation order: ensure the operand itself is evaluated exactly once before failure; test only bounded static cases supported by the scanner. Look for cases where a definite unary failure incorrectly suppresses an earlier/reachable effect or fails to suppress a later one.
3. Preserve R41 non-iterability distinctions: float/complex/Ellipsis are non-iterable; `bytes`, strings, tuples/lists and other exact supported sequences must not be turned into definite failures.
4. Preserve R41 numeric mapping equality/last-write-wins and itemgetter type preservation across direct subscript, `.get`, `.__getitem__`, `operator.getitem`, `operator.itemgetter`; numeric mapping normalization must not fabricate sequence indices.
5. Preserve R39/R40/R41 starred positional-shape and failure-order semantics: definitely non-iterable expansion stops later evaluation; genuinely unknown expansion must not invent argument positions.
6. Preserve exact container-vs-builtins priority and builtins default semantics, including None/numeric keys and safe selected-slot negatives.
7. Full current owner/oracle regression must remain marker-free; do not accept provider/runtime/network authority, Production readiness, or real-capital claims.
8. Inspect the complete changed-file evidence and required dependency slices. If an inherited defect remains material, report it even if outside the newest file; identify the newest authoritative path that exposes it.

For every material reproducible defect provide exact file/symbol, minimal witness, ACTUAL, EXPECTED, violated invariant, impact, and bounded correction.

If evidence is sufficient and no material defect survives, conclude exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`

If findings survive, conclude exactly:
`HALLAZGOS: N / VALIDACIÓN NO OK`

If genuinely missing evidence remains, fail closed and identify it; do not infer PASS.
