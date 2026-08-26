# QORE UMI-14 / UMI-12 final owner-universe recertification — Expert R19B

Independent adversarial Expert review. This is the mechanical retry of R19 only: R19 never reached DeepSeek because the local complete-changed-evidence guard aborted above its 240000-character input cap; API spend was zero and no PR review was published. The reviewer harness cap was raised to 300000 so the same complete 27-file surface is preserved without truncation. Do not treat R19's harness failure as semantic evidence.

## Exact freeze — fail closed on mismatch

Repository `mezas3238-hue/qore-core`, PR `#461`.

- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`
- BASE TREE `08ce942dd944a2c02a1aa9971dbfbe011def919d`
- HEAD `990ffd499c757420fd79fa2c3892a270496a8f56`
- HEAD TREE `8204ecbd8aa4f94283c8788d3a8adef6acd16b67`
- SYNTHETIC `31e864d70b4074ba54d635f7bc58954855729cc8`
- synthetic parents exactly `[BASE, HEAD]`; synthetic TREE == HEAD TREE
- `58 ahead / 0 behind`, `27 changed files`, docs/tests only, `src/qore` delta `0`
- historical oracle `tests/infrastructure/test_universal_cross_asset_conformance_full_closure.py` unchanged; BASE/HEAD blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`
- exact-head QORE CI `#1530`, run `32997995401`: SUCCESS

If any live binding differs, stop and report the mismatch; never review another HEAD under this package.

## Bounded contract

Issue `#458`, parent `#363`. This recertifies the current Program-D UMI-12 owner-universe harness; it does not certify provider support, valuation, execution, operations, Production, or real capital.

D04 convention is bounded to: all current `*_semantics.py`; all current `*_qualification.py` except `dataset_integrity_qualification.py`; plus legacy owners `fixed_income_economics`, `rate_term_structure`, `universal_instrument_identity`, `universal_instrument_identity_graph`, `universal_market_topology`, `universal_valuation_observation`. Do not invent hypothetical owner names or require arbitrary whole-program discovery without repository evidence changing this convention.

Newest authoritative layer:
`tests/infrastructure/test_universal_cross_asset_conformance_final_owner_r18_guards.py`

R18 evidence:
`docs/architecture/QORE-UMI-12-FINAL-OWNER-RECERTIFICATION-R18-HARDENING.md`

Older R6–R17 layers are regression evidence; later layers may close earlier helper blind spots.

## Primary falsification: R18 annotation semantics

R18 fixed a real false negative for annotation-time dynamic execution. Falsify the fix against Python semantics.

Without `from __future__ import annotations`, dangerous calls in function parameter annotations, return annotations, module `AnnAssign`, and class `AnnAssign` must be caught, e.g. `def f(x: eval("1+1")): ...`, `def f() -> exec("pass"): ...`, `x: eval("1+1") = 1`, and a class-level equivalent.

With `from __future__ import annotations`, do not invent executed annotation calls merely from AST presence. Function-local annotated-assignment annotation expressions likewise must not be indiscriminately treated as annotation-time execution when Python does not evaluate them.

Probe bounded nearby variants: positional-only, normal, keyword-only, vararg and kwarg annotations; returns; module/class `AnnAssign`; nested class/function scope interactions; genuine module/function-local shadowing; decorators and positional/keyword defaults continuing to use their real evaluation scope/time; future-annotations combinations.

## Preserve R6–R17 closure

Attempt concrete regressions across:
- builtins aliases, `builtins.__dict__`, `vars(builtins)`, nested namespace derivations;
- `getattr`, `vars`, direct/bound `.get`, `__getitem__`, callable `.__call__`;
- `operator.getitem`, `operator.itemgetter`, `operator.attrgetter`;
- constant-string aliases and statically resolvable f-strings;
- tuple/list/dict/container exact selected-slot semantics;
- positive/negative/bool indices;
- duplicate bool/int/string dict keys with Python equality + last-write-wins;
- safe co-presence remaining safe when the selected member is safe;
- `.get` default selected only on statically known miss; present member dominates default;
- class body namespace not acting as lexical closure for method/lambda/comprehension bodies;
- bound builtins mapping aliases preserving present/missing/dangerous-member semantics.

Representative probes include:
`getter = builtins.__dict__.get`; `getter("len", eval)("abc")` must stay safe; `getter("missing", eval)("1+1")` and `getter("eval", len)("1+1")` dangerous; `operator.attrgetter("__call__")(eval)("1")` dangerous. Recheck dict collisions such as `{0: eval, False: len}[0]`, `{False: len, 0: eval}[False]`, `{1: eval, True: len}[1]`, and duplicate string keys according to actual Python selection.

For class scope, a class attribute named `eval` must not falsely shadow bare `eval` inside a method; a genuine local `eval = lambda ...` inside the method should shadow it.

Do not turn the scanner into unbounded arbitrary taint analysis. Findings require constructible witnesses under the current bounded static contract.

## Whole-candidate falsification

Inspect every changed file supplied completely by the harness plus only necessary dependency slices. Try to break:
1. exact bounded owner discovery/manifest;
2. absolute/relative import normalization and generic/product directionality;
3. provider/SDK/runtime/network authority exclusions and hidden direct/indirect dynamic execution;
4. UMI-02 provider/listing/native-symbol identity separation from canonical economic identity across all 19 Program-D families;
5. anti-flattening: RATE/YIELD/SPREAD/PRICE/NAV/IV and NOTIONAL/QUANTITY/WEIGHT remain distinct;
6. collision boundaries: Sukuk/Shari'ah; ILS/event-contract; securities-financing static/current state; SCF ICC-2017/Advanced Payable; generic composition/product-specific payoff authority;
7. deterministic, immutable, secret-free evidence;
8. historical oracle unchanged and `src/qore` delta zero.

CI is not semantic proof. Do not broaden certification beyond this scope.

## Output

For each surviving material defect: severity; exact file/symbol; minimal constructible witness; ACTUAL; EXPECTED; violated contract; impact; smallest safe fix.

If defects survive, end exactly `HALLAZGOS: N / VALIDACIÓN NO OK`.
If none survive, summarize concrete falsification performed and end exactly `HALLAZGOS: 0 / VALIDACIÓN OK`.
