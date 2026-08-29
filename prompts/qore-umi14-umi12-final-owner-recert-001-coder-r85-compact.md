# DeepSeek Coder R85 — QORE UMI14 / UMI12 final owner recertification

Act as an independent adversarial code reviewer. Do not inherit any Expert/Claude verdict. Verify live bindings and reason from CPython 3.12 semantics and the exact frozen code.

## Exact freeze
- Core PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `7d16609795e99052db66281749aefe406172f870`, tree `a028e374934a0587e6988bba08e3b4a04b1feaca`.
- SYNTHETIC `d55cee13735d1c50bb63cf43fb34e97385b8d138`, parents BASE then HEAD, same tree as HEAD.
- R62N blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable full-closure oracle blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- 269 ahead / 0 behind / merge-base BASE / no `src/qore` delta.
- Exact QORE CI run `33256530716`, job `99111137157` must be completed SUCCESS; independently inspect it.

## Regression under review
Claude C3 invalidated old HEAD `858510a...` with a CRITICAL: a plain known `ValueError` entering `TryStar` could be mistaken for an empty group, fabricate a normal successor, and miss an outer dangerous call when no `except*` matched.

The corrected scanner treats a known plain exception as a logical singleton for star-handler routing, while retaining actual ExceptionGroup/BaseExceptionGroup member handling. On exact HEAD, independent no-model evidence passed the C3 witness + safe inverse + direct/later sibling matching + safe/danger finally (6/6), then permanent R62N 38/38.

## Code-level attack priorities
Read the exact helper/flow code and construct counterexamples rather than trusting tests. Attack:
- plain built-in exception vs ExceptionGroup/BaseExceptionGroup distinction;
- subtype/supertype and tuple handler matching;
- plain exception matched by first/later/no sibling;
- nested TryStar and ordinary Try boundaries;
- outer ordinary `except` and outer `except*` routing;
- pending explicit exceptions raised by handlers;
- bare re-raise of matched subgroup/plain exception;
- mixed pending exceptions and final namespace state;
- `finally`/`else`, returns/break/continue where legal;
- unknown exception type, aliases and shadowing;
- calls reached through eval/exec/__import__ aliases and namespace mutation;
- conservative fallbacks that can hide a real false negative.

Compare real CPython runtime/reachability with scanner markers. Do not treat a generic conservative marker as harmless if it masks a constructible false negative elsewhere. Do not demand unsupported precision merely for cosmetic false positives.

Also inspect the final-owner UMI harness for stale hard-coded universe, missing live-owner discovery, identity/provider laundering, anti-flattening gaps, cross-family collisions, forbidden provider/runtime/network imports, mutable/nondeterministic specimen material, staging files, and any production-source mutation. Preserve `src/qore=0` and the immutable oracle.

No provider, execution, valuation-methodology, Production or real-capital readiness inference.

For any material defect give exact witness/output/location and smallest bounded repair. If binding/CI invalid: `MECHANICAL REVIEW FAILURE`. If a material defect survives: `VALIDACIÓN NO OK`. Otherwise finish literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
