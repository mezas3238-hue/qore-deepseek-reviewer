# QORE DeepSeek Expert R41 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R40 is consumed and found two valid harness defects on prior HEAD `6d8196508690f3bfef49d47ef592e74dc3b42cc2`; do not credit R40 as approval for this candidate.

## Frozen binding

- PR: `#461`
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE: `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD: `a364498e3000f318ae67db0c3e3786714a346ac6`
- HEAD TREE: `6a504ef82c3222e09eedb96c5cf2089bab2b939b`
- synthetic: `474ef6e442ce4fdd724f2f4da10cab3fd61de375`
- synthetic TREE: `6a504ef82c3222e09eedb96c5cf2089bab2b939b`
- synthetic parents: BASE then HEAD exactly
- compare: 95 ahead / 0 behind / merge-base BASE / 63 changed files
- scope: changed paths only under `docs/` and `tests/`; `src/qore delta=0`
- historical oracle blob at BASE and HEAD: `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- QORE CI #1566 / run `33057298732`: Ruff OK; Mypy OK (`709 source files`); Pytest `4581 passed`, 6 historical warnings; coverage total 87%

## R40 findings and candidate corrections

R40-F1 was VALID: definite `*None` / `*bool` expansion raised before later call expressions but R39 treated those atoms as unknown. New authoritative layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r40_guards.py::_R40StarredAndNoneOperatorScanner`.
It locally extends definite non-iterability with `none` and `bool-index`, preserving prior reachable side effects and applying the same failure reachability to starred tuple/list composites. R27-R39 are unchanged.

R40-F2 was VALID: R38 `n:none` mapping-key precision did not reach inherited `operator.getitem` / `operator.itemgetter`. R40 routes exact known-container operator selection through R38 `_r38_selected_slots` / `_r38_selection_tokens`, constructs itemgetter tokens with `_r38_key_tokens`, and decodes `n:none`. Safe selected slots must not inherit co-present dangerous values.

R40 regressions include exact DeepSeek witnesses, safe inverses, signed sequence parity, prior-side-effect preservation, composite starred failure, and full current owner/oracle marker-free scan.

## Adversarial priorities

Falsify, do not rubber-stamp. Focus especially on:

1. Python evaluation order for positional, starred, keyword and composite expressions; definite failure must stop only later unreachable evaluation while preserving prior reachable markers.
2. `*None`, `*False`, `*True`, aliases, nested tuple/list expansion, and interactions with R35/R38 exact sequence metadata. Look for any remaining definite non-iterable scalar that is wrongly modeled, but distinguish iterable constants (e.g. strings/bytes) from non-iterables.
3. `operator.getitem` and `operator.itemgetter` exact selection parity across `None`, bool/int, signed indices, strings, duplicate mapping keys and safe co-present dangerous values.
4. `n:none` propagation through construction then application of itemgetter; aliases and nested operator accessors; no false negative for selected `eval`/`exec`/`__import__`, no false positive for selected safe values.
5. Interaction with R37/R38/R39 direct subscript, `.get`, `.__getitem__`, builtins namespace behavior, failure propagation and unknown positional shape.
6. Current owner universe completeness, provider/runtime/network exclusion, historical oracle preservation, and all prior authoritative regression layers.

Do not infer provider support, operational readiness, Production readiness, production authorization, real-capital readiness, or Program-D PASS from green CI.

Report every material reproducible defect with exact file/symbol, minimal witness, actual vs expected behavior, violated invariant and bounded correction. If no material finding survives adversarial falsification, final line must be exactly:

`HALLAZGOS: 0 / VALIDACIÓN OK`

Otherwise final line must be exactly:

`HALLAZGOS: N / VALIDACIÓN NO OK`
