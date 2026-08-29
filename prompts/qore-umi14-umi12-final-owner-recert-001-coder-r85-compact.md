# DeepSeek Coder R85 — QORE UMI14 / UMI12 exact-freeze breakage review

Act as an independent adversarial code reviewer. Do not inherit Expert R89, R88, Claude, CI, or Integration Authority conclusions. Verify live bindings and reason from CPython 3.12 semantics and the exact frozen code.

## Exact freeze
- Core `mezas3238-hue/qore-core`, PR #461.
- BASE `ebd0adf000874797653df92ea1c08a892cce6c8c`, tree `08ce942dd944a2c02a1aa9971dbfbe011def919d`.
- HEAD `476a93cdd08a064d0b99a139cd1b49287b937f21`, tree `5e2b37b23b01fe23fd373d39b01573e9607a73ad`.
- SYNTHETIC `871def531b0f1222e6a1e61252af700f4ed204e3`, parents BASE then HEAD, same tree as HEAD.
- R62G blob `bcc95c5b8c57cee26f0a5680dba5fd1399e08ef0`.
- R62N blob `4e70b47730cf3b67ea9be65a95490ada23651a36`.
- Immutable full-closure oracle blob `249caa1504e2b62277a9389dc7e73bcabf12e7db`.
- 277 ahead / 0 behind / merge-base BASE / docs+tests only / no `src/qore` delta.
- Native exact-head QORE CI run `33260165867`, job `99120615940` MUST be completed SUCCESS; independently inspect raw evidence.

## Regression under review
DeepSeek Expert R88 invalidated the prior freeze with a real deterministic R62G false positive: explicitly imported `builtins` is a module, not a mapping, so `builtins["eval"](...)` fails before dynamic execution. The current scanner distinguishes exact builtins-module values from real builtins mappings and propagates that distinction through relevant value/container transport.

Required boundary:
- safe module mapping misuse (`[]`, `.get`, `.__getitem__`, operator.getitem/itemgetter on the builtins module) must not invent an executed dangerous `call:`;
- real mappings such as `builtins.__dict__`, `vars(builtins)`, and mapping-valued `__builtins__` must remain detected;
- valid attribute routes such as `builtins.eval` and `getattr(builtins, "eval")` must remain detected;
- alias `binding:` provenance is not itself an execution claim.

Attack the implementation, not just permanent tests. Construct CPython witnesses for direct and nested tuple/list/container transport, unpacking, branch/BoolOp/IfExp/NamedExpr joins, assignment aliases, custom objects, shadowing/deletion/rebinding, comprehensions/deferred scopes, getattr/attrgetter, `.get`, `.__getitem__`, operator.getitem/itemgetter, `__dict__`, vars, globals/locals mappings, `__builtins__` module-vs-dict contexts, and direct/indirect eval/exec/__import__ calls. Find any place where abstract value aggregation launders module identity, suppresses a real mapping danger, or invents an unreachable call.

Also re-falsify current R62N TryStar/exception flow: plain exceptions, matching/nonmatching siblings, pending handler exceptions, bare re-raise, subgroup remainder, outer ordinary/star handlers, `else`/`finally`, and no invented normal successor. R62G changes must not regress R62N.

Inspect the final-owner UMI harness for stale hard-coded universe, missing live-owner discovery, identity/provider laundering, anti-flattening gaps, cross-family collisions, forbidden provider/runtime/network imports, mutable/nondeterministic specimen material, staging files, and any production-source mutation. Preserve `src/qore=0` and immutable oracle.

No provider support, execution, valuation-methodology, operational readiness, Production or real-capital inference.

For any material defect give stable ID/severity, exact witness/output/location and smallest bounded repair. If binding/CI invalid: `MECHANICAL REVIEW FAILURE`. If a material defect survives: `VALIDACIÓN NO OK`. Otherwise finish literally:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
