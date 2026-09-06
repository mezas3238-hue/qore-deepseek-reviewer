# QORE PR #497 — cTrader DEMO operational runtime — External Expert R1

## PURPOSE

Perform one fresh independent falsification of the exact cTrader DEMO candidate.
Harness already produced the execution contracts/gateway family; Codex recovered
that work and completed the concrete Spotware Open API client, authenticated market
data, Protobuf transport, operational composition, symbol preflight and tests.
Do not restart the implementation and do not trust prior PASS claims. Search for a
material defect that could make the first DEMO operation unsafe, incorrect,
unreconcilable or falsely reported as ready.

## IMMUTABLE BINDING

- Repository: `mezas3238-hue/qore-core`
- PR: `#497`
- BASE: `514ca00f89fca8194eb57c954e78ba9b2e82b9b7`
- HEAD: `9c02ea4d92081372ef463fe516b785414fee3781`
- SYNTHETIC: `20e9b4f7fca4e68c235bf332b368d4f260d4dcef`
- QORE CI: run `34049932133`, job `101531581581`, SUCCESS
- QG: Ruff PASS; Mypy PASS on 870 files; Pytest 6583 PASS / 8 warnings;
  60878 statements / 8988 missed / 85% coverage.
- Delta: 19 files, +6715/-27.

Fail closed if any live binding differs.

## FIVE REQUIRED LANES

### L1 — Official SDK / connection / authentication / TLS

Verify the real API surface against Spotware OpenApiPy: DEMO endpoint and port,
reactor lifecycle, callbacks, message wrapping/extraction, error responses,
heartbeat behavior, reconnect semantics, app auth, token refresh, trade scope,
exact account selection and explicit `isLive=false`. Attack missing-field defaults,
event queue behavior, concurrency, timeout and disconnect races. TLS identity must
not silently degrade.

### L2 — Market data / symbol identity / native units

Falsify bid/ask and trendbar decoding, timestamps, relative prices, digits,
instrument identity, symbol enablement, min/max/step volume constraints and the
canonical quantity-to-cTrader-volume conversion. Check real protobuf field names,
enum values, optional/default semantics, stale or partial spot events and broker
metadata drift. No wrong symbol or volume may reach mutation.

### L3 — Order lifecycle / idempotency / outcomes

Attack MARKET/LIMIT creation, cancel/query, client message IDs, provider refs,
accepted/rejected/partial/filled/expired states, order-error events, unknown
outcomes, disconnects and repeated calls. Prove no blind resubmit can occur after
a possible effect and no nominal transport envelope can launder malformed native
evidence into acceptance.

### L4 — Fills / reconciliation / containment

Falsify live fills and queried historical deals, cumulative-volume reconstruction,
duplicate/out-of-order events, stable deal identity, completion semantics,
overfills, partial fills and repeated reconciliation. Search specifically for a
same deal producing different cumulative evidence across event and query paths,
or an incomplete order being reported complete. No corrective trading.

### L5 — Risk authority / runtime integration / secret hygiene

Trace the reachable call path from `ExecutionSubmission` through environment
authorization, pre-trade authorization, safety switch, gateway and provider.
Verify expired/foreign/mismatched authorization and account evidence fail closed;
CIBO/Trader/provider messages cannot mint Risk authority. Check repr/errors/logs,
token rotation, runbook claims, optional dependency compatibility, close behavior,
all callers/references and TEST/DEMO versus LIVE/Production separation.

## SEMANTIC LSP AND REASONING

Use all five independent reviewer lanes to terminal state. Semantic LSP evidence is
mandatory: definitions, references, implementations where applicable, hover/types,
reachable call sites and final recheck. HIGH baseline; MAX for auth/TLS, provider
units, unknown outcome/idempotency, fills/reconciliation, Risk authority and final
closure.

## VERDICT

Read-only review. Do not edit, commit, push or merge qore-core. No Production or
real-capital authorization. Report only material findings with deterministic
witness, exact location, violated invariant, reachable impact, root family and
bounded correction.

Clean ending exactly:

`HALLAZGOS: NINGUNO`

`VALIDACIÓN OK`
