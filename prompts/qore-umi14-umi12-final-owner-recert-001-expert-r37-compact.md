# QORE DeepSeek Expert R37 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R36 is consumed and produced no semantic review: its model workflow failed before any DeepSeek API call because complete mandatory changed-file evidence exceeded the old 400k effective cap. Reviewer infrastructure now explicitly permits 500k mandatory changed-file chars. Do not treat R36 as semantic evidence.

Frozen candidate binding:
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `4c3ec355d14f6c8d6af8ecc1bd4044e6bb8d3a24`
- SYNTHETIC `7a984d5b9f3cfa6a978b1ca1ddc42566c2ec7c49`
- HEAD/SYNTHETIC TREE `f49183f1be68cd12946da33f01d7982a5603a08b`
- synthetic parents exactly `[BASE, HEAD]`
- 84 ahead / 0 behind / merge-base BASE / 55 changed files / docs+tests only / `src/qore` delta=0.

Quality evidence only: QORE CI #1555 run `33029026302` green: Ruff pass; Mypy 705 files pass; Pytest 4549 passed with 6 historical collection warnings; coverage 87%.

R35 semantic context: old HEAD `009a95087f3c200464787dff15983861063dd68a` had four accepted HIGHs. Current HEAD corrects them:
1. explicit/aliased `None` as exact omitted slice component;
2. unary `+`/`-` over exact integer/bool aliases;
3. bounded definite-failure propagation for exact sequence slicing and Python component evaluation order;
4. exact ordinary tuple/list target assignment including nested and one-star positional distribution.
The final tiny HEAD commit fixes only a Mypy export-path defect in the R35 guard; no semantic weakening was intended.

Authoritative current layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r35_guards.py::_R35SliceFailureAndAssignmentScanner`.
Read the full inheritance chain and all mandatory changed-file evidence.

Falsification priorities:
- exact `None` through aliases, exact tuple/list/nested assignment, rebinding, ambiguity, safe inverses;
- unary signs on exact int/bool aliases, nested unary operators, ambiguous operands, operand side effects;
- exact slice order `receiver -> lower -> upper -> step -> subscription`, especially nested failed slices, chained subscripts, lower/upper/step failure, non-slice key failure, call function/argument contexts, and earlier-executed/later-unreachable expressions;
- only claim zero-step definite failure when the current scanner has proved an exact built-in sequence contract; do not generalize to arbitrary custom `__getitem__`/`__index__` semantics;
- ordinary exact tuple/list assignment: no-star; star first/middle/last; empty star; nested structures; mismatch/unknown-length fallback; target Attribute/Subscript evaluation; sensitive fail-closed binding; RHS evaluation and body reachability;
- interactions with existing sync `for` and comprehensions/ordered target reachability;
- selected-slot identity and dangerous/builtins propagation after slicing/destructuring;
- environment merge, rebinding, delete, function/class/global/nonlocal only where a concrete bounded witness exists;
- safe negatives: do not report markers for Python-unreachable dynamic calls after a proven exception;
- current D04 owner universe and unchanged historical full-closure oracle must remain marker-free.

Constraints:
- bounded static conformance scanner, not whole-program taint.
- Do not demand arbitrary iterable modeling, arbitrary operator overloads, mutable-container taint, generic exception-flow, or arbitrary `__index__` unless a concrete current-contract witness materially proves an error.
- Independently validate each witness against real Python semantics.
- Each finding: exact file/symbol, minimal witness, ACTUAL markers, EXPECTED markers/behavior, violated invariant, bounded correction.
- CI green and `src/qore` unchanged are not semantic proof.

Final line exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
or
`HALLAZGOS: N / VALIDACIÓN NO OK`
