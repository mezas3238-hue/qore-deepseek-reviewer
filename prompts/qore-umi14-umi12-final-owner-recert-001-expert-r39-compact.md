# QORE DeepSeek Expert R39 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R38 is consumed and found five valid harness defects on prior HEAD `aca5cd25a70ec5f9f88b93adedd35e8244befe56`; do not credit R38 as approval for this candidate.

Frozen binding:
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `f2b1a972b943cdbda80174ac461534922ab3e8de`
- SYNTHETIC `a6cd2178c235ba0a5925de73b378eff5edb39022`
- HEAD/SYNTHETIC TREE `c13bca05faf69c76e61d2a93e2586bdfcaedc8f9`
- synthetic parents exactly `[BASE, HEAD]`
- 91 ahead / 0 behind / merge-base BASE / 59 changed files / docs+tests only / `src/qore` delta=0.

Quality evidence only: QORE CI #1562 run `33034621876` green: Ruff pass; Mypy 707 files pass; Pytest 4566 passed with 6 historical collection warnings; coverage 87%.

R38 findings independently adjudicated VALID and corrected additively in:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r38_guards.py::_R38ArgumentExpansionAndMappingScanner`.
Historical R4-R37 layers remain unchanged.

R38 corrections to falsify:
1. Exact `ast.Starred` positional arguments are expanded when the starred value is an exact modeled sequence; unknown expansion must degrade without inventing positions or double-scanning side effects.
2. Tuple/list/dict expression evaluation preserves Python order and definite `_FAILURE_VALUE` stops later unreachable elements; already-evaluated dangerous calls before a later failure remain marked.
3. Exact `None` mapping keys are selectable, including duplicate-key last-write-wins; safe exact selection must not inherit dangerous co-presence.
4. `builtins.__dict__.get` with an exact non-string key known absent from the builtins namespace selects the supplied default, while supported exact string keys retain prior member semantics.
5. `.get` on an exact sequence fails at attribute lookup before evaluating call arguments; exact `.__getitem__` behavior remains available and precise.

High-signal adversarial priorities:
- multiple/interleaved `*args`; starred exact tuple/list aliases; nested starred sequences; unknown starred values; side effects/failures inside starred expressions; positional+keyword evaluation order;
- composite tuple/list/dict failures in keys and values, nested composites, duplicate keys, starred collection elements where currently modeled; earlier reachable vs later unreachable `eval`/`exec`;
- mapping keys `None`, bool/int/string aliases, duplicate/equal-key interactions under real Python semantics (`False == 0`, `True == 1`) where the current exact-key contract claims precision;
- `.get` default evaluation: Python evaluates supplied arguments before `dict.get` selection, but attribute lookup precedes arguments; preserve reachable argument-side markers while selecting the correct returned callable;
- `builtins.__dict__.get`: exact present string, exact absent string, exact non-string, aliases, safe/dangerous defaults; do not generalize absence when key identity is unknown;
- exact sequence `.get` vs `.__getitem__`, receiver evaluation order, argument side effects, outer call reachability;
- interactions with R35/R37 slice-failure, unary exact indices, selected-slot identity, rebinding, comprehension/assignment reachability;
- current D04 owner universe and historical oracle `test_universal_cross_asset_conformance_full_closure.py` must remain marker-free; oracle blob is unchanged from BASE.

Constraints:
- bounded static conformance scanner, not whole-program Python interpretation or taint analysis.
- Do not demand arbitrary iterable expansion, arbitrary descriptors/operator overloads/custom `__index__`, generic exception-flow, or mutable-container modeling without a concrete in-contract witness.
- Validate every witness independently against real Python semantics.
- CI green and `src/qore` unchanged are not semantic proof.
- Each finding: exact file/symbol, minimal witness, ACTUAL markers, EXPECTED markers/behavior, violated invariant, bounded correction.
- Keep review concise and high-signal; omit redundant history.

Final line exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
or
`HALLAZGOS: N / VALIDACIÓN NO OK`
