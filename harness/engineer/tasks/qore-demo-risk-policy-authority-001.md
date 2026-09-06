# QORE HARNESS ENGINEER — DEMO RISK / POLICY AUTHORITY + POLICY INTELLIGENCE + GOVERNED COGNITION

## PACKAGE

`HARNESS-ENGINEER-QORE-DEMO-RISK-POLICY-AUTHORITY-001`

## LIVE BINDING

- qore-core START: `1e08a355f4109f016ca47bc4b8957b92a1ae7948`
- qore-core TREE: `5b37d0750ca163665135f9c075b4d7c44a43be8e`
- Program: qore-core Issue #469
- Risk contract: qore-core Issue #495
- Trader cohort: qore-core Issue #493
- cTrader multi-timeframe: qore-core Issue #494
- Existing canonical policy foundation: `docs/architecture/QORE-ACCOUNT-PROP-POLICY-001.md`

GitHub live source wins if any historical note conflicts, but this artifact-only candidate remains bound to the exact START/TREE above.

## ROLE / EXECUTION MODE

You are Harness Engineer operating under the independent audit-repair policy.

- Artifact-only: NO push, NO commit, NO merge to qore-core.
- Produce one bounded candidate patch + metadata + evidence + durable checkpoints.
- Use exactly 6 non-duplicative lanes.
- Semantic LSP evidence is mandatory: definitions, references, implementations where applicable, hover/types, call sites, modified symbols, final recheck.
- Reasoning HIGH generally; use MAX for concurrency, account-policy ambiguity, authority-boundary contradictions, security/fail-closed semantics and root-family closure.
- Root-family exhaustion is mandatory for authority, concurrency/reservation, policy-ingestion, stale-state, and cognition-to-authority laundering families.
- Run unchanged FULL QG before claiming ready.

## OBJECTIVE

Implement the DEMO Risk/Policy authority required by the first end-to-end profitability program:

`QUALIFIED TRADER INTENT -> CIBO MANAGEMENT/RECOMMENDATION -> NON-BYPASSABLE RISK -> DEMO EXECUTION`

Risk must protect both account and portfolio under QORE internal limits and external account/provider/prop-firm rules.

The implementation must be extensible toward later bounded LIVE readiness without creating Production authority now.

## NON-NEGOTIABLE SOVEREIGNTY

Separate two planes:

### A. Risk Deterministic Authority

Only this plane may issue formal risk decisions/authorizations.

Required formal outcomes, or an equally exact typed set preserving these semantics:

- `ALLOW`
- `REDUCE`
- `REJECT`
- `FREEZE_TRADER`
- `CONTAIN_ACCOUNT`
- `KILL`

### B. Risk Cognitive Analyst

May interpret, explain, compare, challenge and reason over evidence.
It MUST NOT:

- issue formal execution authority;
- override a deterministic Risk rejection;
- mint or mutate account-policy truth;
- convert LLM prose into effective policy without deterministic admission;
- activate Production/LIVE authority.

Hard laws:

`COGNITIVE OPINION != RISK AUTHORITY`

`CIBO CONFIDENCE != RISK OVERRIDE`

`TRADER EDGE != RISK BYPASS`

`LLM POLICY EXTRACTION != EFFECTIVE POLICY`

## PHASE A — RECONSTRUCT / REUSE EXISTING RISK-RELATED SURFACES

Before editing, use LSP and repository inspection to map/reuse at minimum when semantically applicable:

- `src/qore/infrastructure/account_policy.py`
- `docs/architecture/QORE-ACCOUNT-PROP-POLICY-001.md`
- `src/qore/infrastructure/client_execution_agent.py`
- `src/qore/infrastructure/client_position_lifecycle.py`
- `src/qore/infrastructure/proprietary_accounts.py`
- existing controlled-execution / operational-safety / kill-switch / containment seams
- account observed-state / client-account contracts
- portfolio/risk read-model contracts
- distributed-state doctrine and any existing hosting/writer lease or fencing primitives
- existing CIBO reasoning transport/runtime patterns only where useful as implementation precedent, without coupling Risk sovereignty to CIBO.

Do not build duplicate competing kill switches, money/drawdown primitives, policy identities, execution authority, or writer/concurrency primitives when existing semantics can be safely composed.

## PHASE B — DETERMINISTIC RISK DECISION INPUT

Design exact immutable/provider-neutral input/evidence contracts sufficient to evaluate a Trader intent against policy and current state.

Bind as applicable:

- DEMO environment/account identity;
- exact Trader identity/version/config fingerprint;
- exact intent id/digest;
- instrument;
- side/direction;
- requested quantity/notional;
- stop-loss or bounded loss-at-stop assumptions where methodology/risk policy requires them;
- current/open positions;
- per-Trader exposure;
- per-instrument exposure;
- correlated/group exposure when configured/evidenced;
- portfolio heat;
- account balance/equity/margin/drawdown/daily-loss observed state;
- exact immutable account-policy snapshot id/version/effective interval;
- internal QORE risk policy/version;
- market/account evidence freshness and provenance;
- current reservations/committed capacity;
- containment/kill state.

Missing, stale, ambiguous, wrong-account, wrong-version or mismatched mandatory state must fail closed for new risk admission.

No implicit wall clock where a caller-supplied evaluation instant is required for deterministic replay.

## PHASE C — RISK BUDGETS / PORTFOLIO HEAT

Implement deterministic risk-capacity semantics beyond isolated trade checks.

Support at minimum configurable/provider-neutral limits/budgets for:

- per trade;
- per Trader;
- per instrument;
- correlated/group exposure where a configured/evidenced grouping exists;
- total portfolio heat;
- account-level available risk capacity.

Internal QORE constraints may be stricter than external account/provider limits, never looser.

`EFFECTIVE LIMIT = SAFEST APPLICABLE BOUND`

Implement internal safety buffer semantics explicitly so QORE can stop admitting new risk before reaching an external breach threshold.

Do not invent universal percentage defaults as canonical truth. Configuration must be explicit/versioned/tested.

## PHASE D — STRESS-BEFORE-ADMIT

When exact bounded-loss inputs permit, deterministically calculate the post-stop/post-loss state before admitting an intent.

An intent must not pass merely because current state is inside limits when its bounded adverse outcome would immediately breach effective policy.

Tests must cover boundary equality, one-unit/basis-point around limits, rounding/precision, zero/negative/invalid values, currency compatibility where relevant, and fail-closed behavior when loss semantics cannot be safely determined.

## PHASE E — ATOMIC / EQUIVALENTLY SAFE RISK CAPACITY RESERVATION

Close the scarce-capacity concurrency family.

Required lifecycle:

`RESERVE -> COMMIT -> RELEASE / EXPIRE`

or an architecturally equivalent exact model.

Requirements:

- concurrent intents cannot double-spend the same remaining capacity;
- reservation is scoped/bound to exact account + intent + policy + state/config fingerprints;
- monotonic generation/fencing or equivalent stale-writer protection where needed;
- stale reservation/generation cannot be committed;
- repeated commit/release follows explicit idempotency semantics;
- failed/aborted downstream execution releases capacity where policy requires;
- no negative/free capacity fabrication through races or duplicate release;
- deterministic replay surface must preserve admitted event/result history without pretending an in-memory simulation proves distributed atomicity.

If durable atomic storage/transactional infrastructure is outside the current repo boundary, implement the exact port/contract plus a deterministic reference implementation and fail-closed integration seam; document the remaining external durability requirement rather than falsely claiming distributed atomicity.

## PHASE F — IMMUTABLE RISK AUTHORIZATION / RECEIPT

An `ALLOW` or `REDUCE` must create a typed immutable authorization/receipt bound at minimum to:

- authorization id;
- account/environment reference;
- Trader id/version/config fingerprint;
- intent id/digest;
- instrument/direction;
- requested vs authorized quantity/notional;
- stop/loss assumptions where relevant;
- exact external account-policy snapshot id/version;
- exact internal risk-policy/config fingerprint;
- exact account/portfolio state fingerprint;
- required market-evidence/freshness fingerprint;
- reservation id/generation;
- issued/evaluated timestamp;
- explicit validity/freshness semantics;
- reason codes and evidence references.

Material mutation after authorization must invalidate reuse and require a new Risk decision.

Do NOT invent one universal arbitrary TTL. Validity must derive from explicit evidence/state/timeframe/policy semantics.

Execution integration must be designed so a downstream DEMO execution boundary can validate exact Risk authorization rather than trust free-form CIBO/Trader output.

## PHASE G — EXTERNAL ACCOUNT / PROP-FIRM POLICY INTELLIGENCE

Build the missing provider-neutral policy acquisition/admission layer around existing `AccountPropPolicySnapshot`.

Required conceptual chain:

`AUTHORITATIVE SOURCE OBSERVATION -> CANDIDATE NORMALIZED RULES -> DETERMINISTIC VALIDATION/ADMISSION -> IMMUTABLE AccountPropPolicySnapshot -> RISK ENFORCEMENT`

Implement source identity/provenance/version/fingerprint contracts and adapter ports capable of representing authoritative source observations without embedding provider credentials or firm-specific SDK objects into canonical Core contracts.

Authority ranking/eligibility must support, when available:

1. official provider/platform API/account metadata;
2. official account/program metadata;
3. official versioned rule document/terms;
4. official firm website content;
5. unresolved if authoritative evidence is insufficient.

Third-party blogs/forums/social sources MUST NOT be accepted as authoritative policy truth.

Do not hardcode claims about any named prop firm unless the repository already contains authoritative current evidence. This package is primarily the universal adapter/admission capability.

## PHASE H — PROP-FIRM / EXTERNAL RULE FAMILIES

Canonical policy representation/admission/enforcement must be extensible enough to capture material rule families such as, when applicable:

- max daily loss;
- exact daily reset/timezone semantics;
- max overall drawdown;
- static vs trailing drawdown;
- balance vs equity/open-PnL inclusion semantics;
- max quantity/lots/contracts/notional/exposure;
- instrument allow/deny rules;
- session/trading-hour restrictions;
- overnight/weekend holding restrictions;
- news/event restrictions;
- mandatory stop-loss rules;
- concentration limits;
- max loss by trade/day/session;
- evaluation/verification/funded phase rules;
- consistency rules/minimum trading days where operationally relevant;
- automation/EA/copy restrictions where operationally relevant;
- mandatory close-before-time rules;
- payout constraints only where they affect trading/account protection eligibility.

Avoid a giant firm-specific enum. Preserve provider-neutral canonical rule identity + typed parameters/semantics + source provenance.

Unknown/ambiguous mandatory semantics must block affected new trading.

## PHASE I — POLICY CHANGE DETECTION / VERSIONING

Implement exact source/policy fingerprint/version semantics.

On material authoritative policy change:

`POLICY_CHANGED -> PRIOR SNAPSHOT STALE -> NEW TRADING BLOCKED UNTIL REVALIDATED`

No silent continued trading under obsolete policy.

Test:

- source version change;
- semantic rule change with same superficial label;
- effective/expiry boundaries;
- account/program/phase mismatch;
- changed reset timezone;
- changed drawdown mode;
- unchanged equivalent content deterministic identity behavior.

## PHASE J — DEGRADATION / CONTAINMENT / RECOVERY

Provide deterministic governance for:

`NORMAL -> REDUCED_CAPACITY -> FREEZE_TRADER -> CONTAIN_ACCOUNT -> KILL`

Reuse existing kill/containment seams where semantically correct.

Requirements:

- CIBO/Trader cannot self-reactivate a frozen/contained scope;
- recovery requires explicit evidence/state/policy and governed transition;
- stale pre-freeze authorizations cannot resurrect exposure;
- provider failure / ambiguous execution containment remains non-bypassable;
- no hidden corrective trading.

## PHASE K — RISK COUNTERFACTUAL / ATTRIBUTION LEDGER

Retain immutable, provenance-bound events/records sufficient for later #469 economic evaluation of Risk value, including when data becomes available:

- rejected winners;
- avoided losers;
- reductions and resulting economic delta;
- prevented policy breaches;
- drawdown reduction attributable to Risk;
- opportunity cost;
- rejection/reduction reason distribution;
- false/over-conservative intervention evidence.

Do not fabricate future outcome evidence at decision time. Create contracts that can link later realized outcomes back to exact prior Risk decisions.

The same exact Risk policy/config must be usable in both #469 A/B arms:

- `TRADERS_RISK_ONLY`
- `CIBO_MANAGED_TRADERS_RISK`

No Benchmark-B policy relaxation.

## PHASE L — GOVERNED RISK COGNITIVE ANALYST

Implement a Risk-specific cognitive plane separate from formal Risk authority.

### Default route

- model: `gpt-5.6-terra`
- reasoning effort: `medium`

### Escalation

- ordinary monitoring, explanation, clear policy interpretation/normalization -> Terra / medium;
- materially ambiguous rule or portfolio interpretation -> Terra / high;
- contradictory authoritative sources / difficult material ambiguity -> GPT-5.6 Sol / high;
- exceptional unresolved ambiguity with serious account-breach consequences -> GPT-5.6 Sol / max for analysis only; deterministic Risk remains fail-closed until resolved.

Model/effort routing must use explicit typed situational signals, never prompt keyword heuristics.

After the hard situation resolves, route must de-escalate; do not stick in high/max.

Possible cognitive capabilities:

- Policy Interpreter;
- Risk Explainer;
- Portfolio Risk Analyst;
- Policy Change Analyst;
- account/portfolio state explanation;
- dialogue with CIBO/CEO/Traders.

Voice/text transport must not itself determine model/effort.

### LLM policy extraction hard boundary

LLM-extracted natural-language policy is only `CANDIDATE_POLICY_RULE` (or exact equivalent).

It becomes effective only after deterministic admission against authoritative source identity/version/fingerprint and canonical semantics.

Ambiguous mandatory rule -> fail closed.

### Cognitive provenance

Every material cognitive call/result must be bound to an immutable receipt including at minimum:

- provider;
- exact model;
- exact effort;
- request/evidence digest;
- source/policy refs;
- routing reason/situation fingerprint;
- configuration/schema fingerprint;
- provider response reference if available;
- admitted output digest;
- completion timestamp.

No hidden chain-of-thought persistence. Retain admitted conclusion, evidence refs, uncertainty/limitations and receipt only.

Replay must not silently make a new provider call to replace retained admitted evidence.

Use existing safe OpenAI transport/secret patterns as precedent if appropriate; do not require a live API key for deterministic unit certification. Fake/injected transport tests are required. A real provider probe is a separate operational step unless credentials are securely present.

## PHASE M — SECURITY / PRIVACY

No API keys, passwords, bearer tokens, raw account login numbers, client civil identity or sensitive provider credentials in:

- logs;
- repr;
- public evidence;
- error messages;
- cognitive prompts where not strictly required;
- durable policy/source records.

Use opaque/fingerprinted references where appropriate.

## REQUIRED ADVERSARIAL / ROOT-FAMILY TESTING

Exhaust at minimum:

1. concurrent double-spend of remaining risk capacity;
2. stale reservation and stale fencing generation;
3. duplicate release/commit/idempotency races;
4. Trader identity/version/config swap after authorization;
5. intent/quantity/price/stop mutation after authorization;
6. account/policy snapshot substitution;
7. effective/expiry transition race;
8. external source/policy change while an authorization exists;
9. static/trailing drawdown confusion;
10. balance/equity/open-PnL inclusion ambiguity;
11. daily reset timezone/boundary errors;
12. risk concentration/correlation undercount;
13. stale market/account/position state;
14. missing stop/loss-at-stop where mandatory;
15. precision/rounding limit boundaries;
16. CIBO/Trader direct bypass attempt;
17. cognitive-output laundering into formal policy/authority;
18. untrusted/third-party policy source admission attempt;
19. conflicting authoritative policy sources;
20. kill/contain/recovery lifecycle races;
21. previous authorization reuse after freeze/policy change;
22. A/B Risk-policy/config asymmetry;
23. deterministic replay/id stability;
24. secret/account-identifier leakage.

## EXACT SIX LANES

Harness MUST use exactly six substantive, non-duplicative lanes and record durable evidence for all 6/6:

### L1 — Architecture / contracts / sovereignty / runtime types
Map authority boundaries, existing exact types, Risk-to-Execution seams, Trader/CIBO non-bypassability and type/replay invariants.

### L2 — Account + prop-firm policy intelligence
Map existing account-policy contracts; implement authoritative-source observations, candidate-rule admission, normalized rule families, source provenance, policy change/version handling and fail-closed ambiguity.

### L3 — Risk math / budgets / portfolio heat / stress
Implement per-trade/Trader/instrument/group/account budgets, effective-limit composition, safety buffers, bounded adverse-state checks, concentration and numeric/property edge cases.

### L4 — Atomic capacity / authorization lifecycle / concurrency
Reservation/commit/release/expiry, stale-generation fencing, idempotency, authorization fingerprints, mutation invalidation, concurrent adversarial tests.

### L5 — Cognitive Risk / model routing / provenance / security
Terra-medium default, escalation policy, typed routing, candidate-policy-only LLM boundary, receipts/replay, secret safety and adversarial ambiguity handling.

### L6 — Integration / call sites / kill-containment / regression / FULL QG
Use semantic LSP across all changed symbols and reachable paths; compose with existing controlled execution, client execution/account state, kill/containment; add e2e deterministic tests; run FULL QG.

Missing 6/6 evidence is BLOCKED.

## SEMANTIC LSP REQUIRED EVIDENCE

For changed/critical symbols record evidence of:

- goToDefinition;
- findReferences;
- goToImplementation when applicable;
- hover/exact types;
- call sites;
- post-change reference recheck.

Do not rely on grep alone for semantic closure.

## FULL QUALITY GATE

Mandatory unchanged commands:

```bash
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No weakening, skips, xfails, type-ignore hiding, coverage exclusion, strictness reduction or unrelated suppressions.

## DURABLE CHECKPOINTS / INTERRUPTION RECOVERY

Write durable progress after every substantive lane and before/after long QG execution. Record:

- what was inspected;
- findings/root families;
- decisions;
- files/symbols modified;
- tests run/results;
- remaining work;
- candidate patch digest/status.

If interrupted/resumed, continue from durable state and recovery patch; do not restart completed discovery blindly.

## OUTPUT

Return only an artifact candidate satisfying Harness policy, with:

- patch;
- exact START/TREE binding;
- changed-files and diff budget evidence;
- 6/6 lane evidence;
- semantic LSP evidence;
- adversarial/root-family closure report;
- FULL QG evidence;
- immutable candidate metadata/digests;
- any genuinely external operational blockers explicitly separated from code correctness.

## NON-CLAIMS

This candidate MUST NOT claim or create:

- LIVE/Production readiness;
- real-capital authority;
- withdrawal/custody authority;
- provider credentials;
- automatic acceptance of unsupported current prop-firm rules;
- direct LLM/CIBO/Trader Risk authority;
- bypass of DEMO execution/fill/reconciliation/economic-evidence gates.

## READY RESULT

Only claim:

`CANDIDATE READY — DEMO RISK/POLICY ROOT FAMILIES EXHAUSTED`

when the exact candidate satisfies the authority, policy-intelligence, capacity/concurrency, cognition, security, integration and FULL QG contracts above. Otherwise return BLOCKED with the precise remaining material family and durable state.