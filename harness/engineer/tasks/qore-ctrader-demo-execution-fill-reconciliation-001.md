# QORE HARNESS ENGINEER — cTrader DEMO EXECUTION / FILLS / RECONCILIATION

## PACKAGE

`HARNESS-ENGINEER-QORE-CTRADER-DEMO-EXECUTION-001`

## LIVE BINDING

- qore-core START: `1e08a355f4109f016ca47bc4b8957b92a1ae7948`
- qore-core TREE: `5b37d0750ca163665135f9c075b4d7c44a43be8e`
- Parent economic program: qore-core Issue #469
- Execution contract: qore-core Issue #471
- cTrader runtime/data foundation: qore-core Issues #290 and #494
- Risk authority integration target: qore-core Issue #495

GitHub live is the final source of truth. This artifact-only candidate remains bound to the exact START/TREE above; do not silently rebase the candidate if qore-core main advances during this run.

## ROLE / EXECUTION MODE

You are Harness Engineer operating under the independent audit-repair policy.

- Artifact-only: NO push, NO commit, NO merge to qore-core.
- Produce one bounded candidate patch + metadata + evidence + durable checkpoints.
- Use exactly 6 non-duplicative lanes.
- Semantic LSP evidence is mandatory before and after material changes: definitions, references, implementations when applicable, hover/types, call sites, modified symbols, and final recheck.
- Reasoning HIGH generally; use MAX for side-effect ambiguity, idempotency, reconciliation, authority boundaries, security/secret handling, provider-state contradictions, and root-family closure.
- Root-family exhaustion is mandatory for mutating-attempt ambiguity, duplicate/late/out-of-order provider events, DEMO/LIVE segregation, idempotency, reconciliation, and no-corrective-trading families.
- Run unchanged FULL QG before claiming ready.

## OBJECTIVE

Implement the concrete cTrader DEMO execution gateway required by #471 behind QORE's existing TEST/DEMO execution and Risk boundaries.

Target path:

`AUTHORIZED QORE ORDER INTENT -> SafetyGuardedTestExecutionBoundary -> AuthorizedTestExecutionAdapter -> cTrader DEMO gateway -> provider receipt/fill observation -> canonical reconciliation evidence`

This package MUST compose the existing `TestExecutionGatewayBoundary`; it MUST NOT create an alternate execution architecture.

## NON-NEGOTIABLE AUTHORITY / ENVIRONMENT LAWS

- DEMO account only.
- LIVE/Production/ambiguous account classification -> fail closed.
- No real-capital authorization.
- No withdrawal/custody authority.
- No Trader or CIBO direct provider order authority.
- Risk authorization must remain non-bypassable.
- Provider-native SDK/session/credentials stay outside canonical Core/domain contracts.
- Provider acknowledgement != fill.
- Timeout/disconnect/transport exception after a mutating attempt != proof that no external effect occurred.
- No blind retry/resubmit on ambiguous mutation outcome.
- No automatic corrective trading.
- Cancel != liquidation authority.

## PHASE A — RECONSTRUCT AND REUSE EXISTING EXECUTION SURFACES

Use LSP and repository inspection to locate and reuse semantically valid existing components, including where applicable:

- `OrderIntent` and execution-intent identity;
- `PreTradeAuthorization` / current Risk authorization seams;
- `MarketTestEnvironmentAuthorization`;
- `MarketTestSafetyPolicy`;
- `SafetyGuardedTestExecutionBoundary`;
- `AuthorizedTestExecutionAdapter`;
- `TestExecutionGatewayBoundary`;
- `ControlledExecutionRuntime`;
- execution receipt / fill / reconciliation contracts;
- kill/containment seams;
- account/environment/provider binding contracts;
- provider capability/instrument catalog bindings;
- existing cTrader read-only runtime conventions and secret-sanitization patterns;
- existing external-attempt / unknown-outcome / reconciliation foundations where implemented.

Do not duplicate existing canonical identities, status enums, safety switches, or reconciliation engines when safe composition is possible.

## PHASE B — cTrader DEMO EXECUTION ADAPTER

Implement the concrete provider-specific adapter outside canonical Core authority.

Required input binding includes, as applicable:

- exact QORE execution intent ID;
- exact Risk authorization ID/receipt;
- exact DEMO account/environment binding;
- exact canonical instrument + provider symbol/native ID mapping;
- order side/direction;
- authorized quantity/volume with exact unit mapping;
- order form supported by the bounded DEMO slice;
- exact client/idempotency/correlation identity;
- required market/account/provider capability evidence;
- explicit submission instant where deterministic contracts require caller-supplied time.

The adapter must reject mismatched or stale authorization, wrong account, wrong environment, wrong symbol, wrong quantity, unsupported capability, invalid provider mapping, or stale/ambiguous required state.

Provider-specific objects/messages may exist only in infrastructure/runtime adapter layers.

## PHASE C — ORDER / PROVIDER STATUS MAPPING

Retain explicit distinctions for provider behavior that is actually observable, including when supported:

- requested;
- locally blocked before provider mutation;
- mutating attempt started;
- provider accepted/acknowledged;
- provider rejected;
- partially filled;
- filled;
- cancelled;
- expired if surfaced;
- outcome unknown / reconciliation required;
- reconciled.

Do not collapse acknowledgement into fill.
Do not fabricate unsupported provider states.
Do not infer a provider-native order ID when none has been evidenced.

## PHASE D — IDEMPOTENCY / EXACT INTENT IDENTITY

Close duplicate/equivalence/conflict families.

At minimum prove:

- same exact intent/idempotency key cannot create two QORE-authorized submissions;
- exact duplicate requests have explicit deterministic treatment;
- same idempotency key with materially different payload is rejected as conflict;
- stale Risk authorization cannot be replayed after material intent/account/policy mutation;
- duplicate provider receipt/event does not produce duplicate canonical effects;
- reconnect/recovery does not blindly resubmit an unresolved prior mutation;
- provider-native client/request IDs, if used, are evidence and not sole QORE authority.

## PHASE E — EXTERNAL MUTATION ATTEMPT / UNKNOWN OUTCOME

Audit and close the side-effect uncertainty interval around order submission.

Required semantic distinction:

`NOT ATTEMPTED -> ATTEMPT STARTED -> DEFINITIVE PROVIDER OUTCOME | OUTCOME UNKNOWN -> RECONCILIATION REQUIRED -> RESOLVED/CONTAINED`

If transport/session failure occurs after the mutation may have crossed the external side-effect boundary:

- classify as unknown/indeterminate when evidence cannot prove otherwise;
- contain affected intent/account scope as required;
- preserve Risk capacity conservatively according to composed Risk semantics;
- prohibit blind resubmit;
- require reconciliation.

If durable pre-wire attempt evidence cannot be fully implemented within the bounded package because an external durable store is required, implement the exact provider-neutral port/contract + deterministic reference semantics and clearly return the remaining operational durability blocker rather than falsely claiming closure.

## PHASE F — FILLS

Implement/compose provider observations so QORE can retain trustworthy fill evidence.

Requirements as provider surface permits:

- exact originating intent/submission correlation;
- exact DEMO account fingerprint/sanitized identity;
- provider order/reference identity when actually observed;
- instrument;
- side;
- fill quantity;
- fill price;
- fill timestamp/provider timestamp provenance;
- partial vs complete fill semantics;
- cumulative vs incremental provider quantity semantics explicitly handled;
- duplicate/out-of-order/late fill events idempotently reconciled;
- commissions/fees may be retained only if provider evidence actually supplies them and the canonical contract supports it;
- no invented slippage/cost fields.

## PHASE G — RECONCILIATION

Compose existing canonical reconciliation rather than creating a second model.

At minimum reconcile:

- requested quantity/order intent;
- provider accepted/rejected state;
- partial/complete fills;
- provider order lifecycle when evidenced;
- position/account state where available and semantically required;
- QORE idempotency/correlation identity.

Required outcomes must preserve discrepancy/ambiguity explicitly.

`NOT FOUND` may prove no external effect only if provider evidence/query scope is demonstrably complete enough for that conclusion.

No reconciliation code may auto-place a corrective order.

## PHASE H — DEMO/LIVE SECRET AND ACCOUNT SAFETY

Prove fail-closed behavior for:

- LIVE account;
- ambiguous environment;
- account mismatch;
- provider/server mismatch;
- missing DEMO authorization;
- productive credential class where separable;
- stale/disconnected provider state;
- raw secret/token exposure in repr/errors/log/evidence;
- raw private account identifiers where sanitized/fingerprinted representation is required.

Runtime credentials must be injected through the existing secure boundary; do not hard-code or log them.

## PHASE I — FAILURE / RECOVERY FAMILY

Adversarially cover at minimum:

1. local validation failure before provider attempt;
2. timeout before definitive provider result;
3. disconnect after potential wire send;
4. malformed/partial provider response after possible effect;
5. definitive provider reject;
6. partial fill followed by disconnect;
7. duplicate provider event;
8. out-of-order fill/order events;
9. late provider event after local containment;
10. process/recovery seam with unresolved attempt;
11. stale account/provider state;
12. Risk authorization invalidated after evaluation;
13. wrong symbol/volume mapping;
14. quantity precision/step edge cases;
15. duplicate/equivalent/conflicting idempotency requests;
16. cancel/replace ambiguity if the bounded implementation exposes those operations;
17. no automatic corrective trading;
18. no LIVE/Production path.

## PHASE J — OPERATIONAL PROBE SUPPORT

The implementation must provide an explicitly invoked, secret-safe cTrader DEMO execution probe/run path that can later produce sanitized real provider evidence.

CI/mocks certify implementation only.

Actual #471 operational closure still requires authorized cTrader DEMO trading credentials/account and real sanitized provider order/receipt/fill/reconciliation evidence.

Do not attempt a real provider trade inside Harness unless the runtime already has explicitly authorized DEMO-only credentials and the package/governance permits it. Absence of credentials is an operational blocker, not permission to fabricate evidence.

## EXACT SIX LANES

Use exactly these six non-duplicative lanes and persist checkpoints for each:

1. **Architecture / authority / existing execution composition** — LSP map of canonical execution, Risk, account, safety and reconciliation seams; no duplicate architecture.
2. **cTrader native execution adapter** — account/symbol/volume/order mapping, DEMO-only provider messages, capability and secret boundaries.
3. **Idempotency + mutation-attempt ambiguity** — duplicate/conflict identity, attempt lifecycle, timeout/disconnect/no-blind-retry family.
4. **Provider lifecycle + fills** — accepted/rejected/partial/filled/cancelled observations, duplicate/out-of-order/late event handling.
5. **Reconciliation + containment/recovery** — discrepancy resolution, provider-state search, Risk-capacity/kill composition, no corrective trading.
6. **Integration / adversarial regression / LSP final / FULL QG** — references/call-sites, focused + property/metamorphic tests, full repository quality gate, closure argument.

No lane may simply repeat another lane's repository sweep.

## DURABLE CHECKPOINT LAW

Throughout execution write durable state sufficient to resume without restarting:

- PHASE;
- exact START/TREE;
- lane statuses 1..6;
- findings and severity;
- architecture decisions;
- LSP evidence;
- changed files;
- tests executed/results;
- external blockers/credentials not available;
- unresolved uncertainty;
- exact next action;
- safe-resume instruction.

A timeout/quota/transport failure is not permission to discard completed lanes.

## TEST / ROOT-FAMILY REQUIREMENTS

Use normal + boundary + adversarial + property/metamorphic coverage where appropriate.

Mandatory classes include:

- DEMO/LIVE separation;
- exact account/symbol/quantity binding;
- Risk authorization binding;
- idempotency duplicate/equivalence/conflict;
- provider reject;
- partial fill;
- duplicate/out-of-order/late provider events;
- stale/disconnected provider state;
- unknown mutating outcome;
- reconciliation mismatch;
- sanitized evidence;
- no secret leakage;
- no corrective trading;
- no authority escalation from Trader/CIBO;
- deterministic canonicalization/replay where applicable.

## FULL QUALITY GATE

Mandatory unchanged:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No test weakening, unjustified skip/xfail, hidden `type: ignore`, lint suppression, coverage exclusion, or strictness reduction.

## DELIVERABLE

Artifact-only candidate containing:

- patch;
- metadata and exact baseline binding;
- changed-file manifest;
- 6/6 lane evidence;
- semantic LSP before/after evidence;
- focused/adversarial test evidence;
- FULL QG evidence;
- durable checkpoints;
- root-family closure argument;
- explicit operational credential/evidence blocker if real cTrader DEMO write evidence cannot be produced in this run.

## READY STANDARD

Return `CANDIDATE READY — CTRADER DEMO EXECUTION/FILLS/RECONCILIATION FAMILY CLOSED` only if the implementation family is semantically closed and FULL QG passes.

If real DEMO credentials/evidence are absent, distinguish clearly:

`IMPLEMENTATION CANDIDATE READY / OPERATIONAL REAL-DEMO WRITE CERTIFICATION PENDING`

Do not call #471 operationally closed from mocks/CI alone.

## NON-CLAIMS

This package does not authorize:

- LIVE or Production;
- real capital;
- unrestricted instruments/accounts/quantities;
- withdrawals/custody;
- Risk bypass;
- Trader/CIBO direct provider authority;
- automatic corrective trading;
- profitability claims.