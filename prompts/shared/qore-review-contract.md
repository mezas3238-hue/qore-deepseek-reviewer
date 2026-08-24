# QORE DeepSeek Shared Review Contract

Apply this contract to every DeepSeek review package unless the package explicitly narrows a rule.

- GitHub is the source of truth. Read the live PR, exact frozen HEAD, changed files, relevant imported definitions, and CI metadata.
- Verify the immutable binding before semantic review. If repo/PR/package/BASE/HEAD/synthetic do not match, stop with binding rejected.
- CI green is evidence, not semantic proof.
- Review only the authorized bounded scope. Do not invent downstream features or broaden departmental authority.
- Prefer concrete falsification: invalid accepted state, valid rejected state, A/B logical-identity collision, owner collision, authority leak, malformed-state acceptance, or missing material invariant.
- Exact-type, deterministic, immutable, fail-closed and secret-free rules remain mandatory where applicable.
- No wall-clock/random/network/I/O/retry/scheduler/thread side effects may be invented in static contracts.
- Do not authorize Production, real capital, Ready, merge, tracker closure, or broader program closure.
- Findings must be material and bounded. Ignore style preferences, optional refactors, coverage percentage alone, and downstream feature requests.
- For each material finding return: stable ID, severity, exact location, concrete witness, why it belongs in scope, minimal bounded correction, and whether HEAD must mutate.
- If clean, explicitly conclude `HALLAZGOS: NINGUNO` and `VALIDACIÓN OK`.
