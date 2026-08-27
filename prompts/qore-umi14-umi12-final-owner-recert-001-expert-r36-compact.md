# QORE DeepSeek Expert R36 — UMI-12 final owner recertification

Review PR #461 as an independent adversarial Expert. GitHub/live checked candidate binding is authoritative; workflow must independently reverify it.

Required frozen binding:
- BASE: `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD: `4c3ec355d14f6c8d6af8ecc1bd4044e6bb8d3a24`
- SYNTHETIC: `7a984d5b9f3cfa6a978b1ca1ddc42566c2ec7c49`
- HEAD/SYNTHETIC tree: `f49183f1be68cd12946da33f01d7982a5603a08b`
- synthetic parents must be exactly `[BASE, HEAD]`
- BASE→HEAD: 84 ahead, 0 behind, merge-base BASE, docs/tests only, `src/qore` delta=0.

Quality evidence only, not semantic proof: QORE CI #1555 / run `33029026302` is green: Ruff pass; Mypy 705 files pass; Pytest 4549 passed, 6 historical warnings; coverage 87%.

R35 is consumed. It reviewed old HEAD `009a95087f3c200464787dff15983861063dd68a` and found four valid HIGHs. Current HEAD corrects all four plus the Mypy import/export defect:
1. explicit and aliased `None` as exact slice omitted bound;
2. unary `+`/`-` over one exact integer/bool alias;
3. bounded definite-failure propagation for exact-sequence zero-step slice preserving Python evaluation order;
4. exact positional ordinary tuple/list assignment, including nested and exact one-star distribution.

Authoritative current scanner: `tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r35_guards.py::_R35SliceFailureAndAssignmentScanner`, inheriting R34/R33/... layers. Read the full inheritance chain and current changed-file evidence before verdict.

Adversarial objectives — try to falsify current bounded contract with minimal executable Python witnesses. Prioritize materially new residuals, not reformulations already covered:
- `None` literal/alias through tuple/list/nested exact assignment, rebinding, ambiguity, and safe inverse cases;
- unary alias signs for int/bool, nested unary signs, ambiguity, and execution side effects of operands;
- exact slice evaluation order `receiver -> lower -> upper -> step -> subscription` and definite zero-step failure through nested receivers, lower/upper/step, chained subscripts, non-slice keys, call functions/arguments, and earlier-side-effect/later-unreachable combinations;
- do not assume arbitrary custom objects reject zero slice step: prove exact-sequence conditions for any definite-failure claim;
- ordinary exact tuple/list assignment: no-star and one-star first/middle/last, empty star, nested exact destructuring, mismatch/unknown-length fallbacks, Attribute/Subscript target execution, sensitive binding fail-closed, RHS side effects/evaluation order;
- interactions with sync `for`/comprehensions and existing ordered target reachability; do not broaden to unsupported AsyncFor/general iterables unless the current contract actually does;
- rebinding, `del`, global/nonlocal/function/class scopes, branch/environment merges where materially relevant;
- selected-slot identity and dangerous/builtins preservation after slice or assignment;
- safe negatives: never mark calls that Python cannot reach after a proven failure;
- complete current D04 owner universe + unchanged historical full-closure oracle must remain marker-free.

Important constraints:
- This is a bounded static conformance scanner, not whole-program taint analysis.
- Do NOT demand generic iterable modeling, arbitrary `__index__`, arbitrary operator overloading, mutable-container taint, or generic exception-flow reconstruction unless a concrete current-contract witness proves a false negative/positive.
- Distinguish definite Python reachability from speculative possibilities.
- For each finding provide exact file/symbol, minimal witness, ACTUAL scanner markers, EXPECTED markers/behavior, violated invariant, and bounded correction.
- Independently validate every witness against real Python semantics before reporting.
- `src/qore` unchanged and CI green do not imply semantic correctness.

Final line must be exactly one of:
`HALLAZGOS: 0 / VALIDACIÓN OK`
or
`HALLAZGOS: N / VALIDACIÓN NO OK`
where N is the number of substantiated findings.
