# QORE DeepSeek Expert R38 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R37 is consumed and found 3 valid defects on the previous HEAD; do not reuse or credit its verdict for this candidate.

Frozen binding:
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `aca5cd25a70ec5f9f88b93adedd35e8244befe56`
- SYNTHETIC `c862b030c6bb48743d937f35e0f7ca7fa70572bd`
- HEAD/SYNTHETIC TREE `5d2f9d3b1cd69da0dd69479e8ac9ff426acc4d0b`
- synthetic parents exactly `[BASE, HEAD]`
- 87 ahead / 0 behind / merge-base BASE / 57 changed files / docs+tests only / `src/qore` delta=0.

Quality evidence only: QORE CI #1558 run `33033121498` green: Ruff pass; Mypy 706 files pass; Pytest 4558 passed, 6 historical collection warnings; coverage 87%.

R37 adjudication and correction:
- H1 VALID: a definite failure in an earlier call argument must make later arguments unreachable. New layer stops after `_FAILURE_VALUE` for ordinary calls and `.get` / `.__getitem__`, while preserving dangerous calls evaluated before a later failure.
- H2 VALID: exact unary `+`/`-` aliases must survive direct non-slice indexing and `operator.getitem` / `operator.itemgetter` without double-scanning operands.
- H3 VALID: a statically known container with an unselectable exact key must not inherit `dangerous` merely from co-presence; exact supported keys must still select precise slots.

Authoritative new layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r37_guards.py::_R37CallFailureAndIndexScanner`.
It inherits R35; all historical R4-R35 layers remain unchanged. Read the inheritance chain needed to falsify behavior, but prioritize high-signal evidence over repetitive history.

Falsification priorities:
1. H1 boundaries: callable evaluation before args; positional/keyword/starred ordering; earlier reachable vs later unreachable dynamic calls; `.get` and `.__getitem__`; no duplicate scanning/markers.
2. H2 boundaries: direct Subscript, `operator.getitem`, `operator.itemgetter`; nested unary signs; bool/int aliases; ambiguous operands; operand side effects; safe inverse selections.
3. H3 boundaries: mapping/sequence static container kinds; supported exact keys/indices vs unselectable keys; safe selected slots vs dangerous selected slots; builtins special handling must not regress.
4. Interactions with R35 slice definite-failure semantics, exact target assignment, selected-slot identity, rebinding and fail-closed reachability.
5. Current D04 owner universe and historical oracle `test_universal_cross_asset_conformance_full_closure.py` must remain marker-free; oracle blob is unchanged from BASE.

Constraints:
- This is a bounded static conformance scanner, not whole-program taint or arbitrary Python execution modeling.
- Do not demand arbitrary iterable/operator-overload/custom `__index__`/generic exception-flow modeling without a concrete current-contract witness.
- Independently validate every witness against real Python semantics.
- CI green and `src/qore` unchanged are not semantic proof.
- Each finding must include exact file/symbol, minimal witness, ACTUAL markers, EXPECTED markers/behavior, violated invariant, and bounded correction.
- Keep the review concise; omit redundant history and restatement.

Final line exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
or
`HALLAZGOS: N / VALIDACIÓN NO OK`
