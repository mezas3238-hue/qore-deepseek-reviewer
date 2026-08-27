# QORE DeepSeek Expert R40 — UMI-12 final owner recertification

Independent adversarial Expert review of PR #461. R39 is consumed and found three valid harness defects on prior HEAD `f2b1a972b943cdbda80174ac461534922ab3e8de`; do not credit R39 as approval for this candidate.

Frozen binding:
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- HEAD `6d8196508690f3bfef49d47ef592e74dc3b42cc2`
- SYNTHETIC `236fb2ec907d967a46a2a5f4e08ae55f41df4dba`
- HEAD/SYNTHETIC TREE `230dd399d0da7f96d14eda375a45d1acb7244b1d`
- synthetic parents exactly `[BASE, HEAD]`
- 93 ahead / 0 behind / merge-base BASE / 61 changed files / docs+tests only / `src/qore` delta=0.

Quality evidence only: QORE CI #1564 run `33054006975` green: Ruff all checks passed; Mypy no issues in 708 source files; Pytest 4573 passed with 6 historical collection warnings; coverage 87%.

R39 findings independently adjudicated VALID and corrected additively in:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r39_guards.py::_R39StarredFailureAndContainerScanner`.
Historical R4-R38 layers remain unchanged.

R39 corrections to falsify:
1. Starred expansion now distinguishes exact modeled sequences, definitely non-iterable values, and genuinely unknown positional shape. Definite non-iterability must stop later evaluation; unknown expansion must not invent positional arity for `.get`/`.__getitem__`.
2. Exact container kind now takes precedence over flattened embedded `builtins`: sequence/mapping selection must return the selected value before any builtins-namespace interpretation.
3. Exact non-string `ast.Constant` keys (bounded: float/bytes/complex and peers represented by the new exact-non-string atom) are known misses for `builtins.__dict__.get`, while unsupported key identity on ordinary mappings must degrade to unknown rather than falsely select a default.

High-signal adversarial priorities:
- multiple/interleaved `*args`; exact tuple/list aliases; nested starred values; definitely non-iterable literals/aliases; unknown iterables; side effects and definite failures inside starred expressions; positional/keyword source-order evaluation; never fabricate a positional arity from unknown expansion;
- explicit sequence/mapping containing `builtins`, dangerous callables, helpers, or mixed values; direct subscript, `.__getitem__`, `.get`, `operator.getitem`, itemgetter; selected safe value must not inherit dangerous/builtins co-presence and selected builtins must preserve its later attribute semantics;
- builtins namespace `.get` with exact present strings, exact absent strings, exact int/bool/None/float/bytes/complex/Ellipsis-like constants, aliases, safe/dangerous defaults, and unknown/nonliteral keys; do not generalize absence when key identity/type is not statically justified;
- normal mappings with unsupported key classes: do not choose defaults merely because exact selection metadata is unavailable. Distinguish “known absent” from “cannot model equality/hash semantics”;
- Python equal-key interactions where already inside the bounded key contract, especially `False == 0`, `True == 1`, and numeric aliases. Do not demand arbitrary user-defined `__eq__`, `__hash__`, descriptors, or mutable-container interpretation without a concrete in-contract witness;
- R37/R38 failure ordering: receiver/attribute lookup before arguments, arguments in real source order, definite failure stopping later expressions, reachable dangerous calls before later failure retained;
- R35 unary/slice/index exactness and R38 None-key duplicate last-write-wins interactions;
- current D04 owner universe and historical oracle `test_universal_cross_asset_conformance_full_closure.py` must remain marker-free; oracle blob remains `249caa1504e2b62277a9389dc7e73bcabf12e7db`, identical to BASE.

Constraints:
- bounded static conformance scanner, not whole-program Python interpretation or taint analysis;
- do not demand arbitrary iterable expansion, custom `__iter__`/`__index__`, arbitrary mapping equality/hash, descriptors/operator overloads, generic exception-flow, or mutable-container modeling without a concrete witness already inside the scanner's declared exact model;
- validate every proposed witness independently against real Python evaluation order and result semantics;
- CI green and `src/qore` unchanged are evidence, not semantic proof;
- each finding must provide exact file/symbol, minimal witness, ACTUAL markers, EXPECTED markers/behavior, violated invariant, and bounded correction;
- keep review concise and high-signal; omit redundant history.

Final line exactly:
`HALLAZGOS: 0 / VALIDACIÓN OK`
or
`HALLAZGOS: N / VALIDACIÓN NO OK`
