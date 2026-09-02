# QORE TRADER LAB — HARNESS ENGINEER BATCH 005

Repository: `mezas3238-hue/qore-core`
Primary issue: #473 `QORE-TRADER-LAB-001`
Parents: #469, #470, #477
Parallel CIBO build: #479 / Harness Batch 004 — DO NOT EDIT CIBO FILES OR SHARED RESEARCH IMPLEMENTATIONS
Independent frozen audit PR: #478 — DO NOT MUTATE OR DEPEND ON ITS UNMERGED DOC CANDIDATE
EXACT START: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
EXACT START TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
Mode: Engineer / artifact-only / implementation

## EXECUTIVE AUTHORITY

Trader Lab construction starts NOW in parallel with both the 31-Trader implementation stream and CIBO.

Canonical path:

`31 TRADERS || CIBO || TRADER LAB -> EXACT VERSION QUALIFICATION -> DEMO A/B`

Trader Lab is not a later certification script. It is a first-class governed component that must exist before any Trader can be admitted to DEMO.

Hard admission law:

`NO VALID TRADER LAB PROMOTION EVIDENCE -> NO DEMO_ELIGIBLE -> NO DEMO ADMISSION`

Every VT-01..VT-31 must traverse the Lab individually. No cohort-level shortcut, no inherited qualification, no CIBO override, no Risk bypass.

## CONCURRENCY / NON-OVERLAP LAW

CIBO Batch 004 is concurrently allowed to edit broad `src/qore/infrastructure` surfaces. To prevent conflicting patches, THIS package may only create/use the isolated new Trader Lab package and its own tests/doc:

- `src/qore/infrastructure/trader_lab/`
- `tests/infrastructure/trader_lab/`
- `docs/architecture/QORE-TRADER-LAB-001.md`

Do not modify existing Research/OOS/Replay/Bootstrap/Risk/CIBO files. Reuse them by imports, protocols, composition, or exact evidence references. If a required semantic integration would need an existing shared file change, document it as REMAINS rather than editing it in this concurrent slice.

## MANDATORY REUSE — LSP BEFORE CODE

Use semantic LSP before design and edits. Locate definitions/references/implementations for the exact reusable foundation, including at minimum where present:

- `ResearchExecutionComposition`
- evaluation/strategy freeze and exact run/config binding
- `ResearchFrozenOosEvidence`
- `ResearchOosPerformanceEvidence`
- `ResearchSamplingFrame`
- `ResearchSerialDependenceDiagnostic`
- `ResearchBlockBootstrapPolicy`
- `ResearchBlockBootstrapDistribution`
- `ResearchResamplingEnvelope`
- market-event replay chronology / visibility semantics
- retained evidence / lineage fingerprints
- existing economic/performance/drawdown evidence
- existing Risk review/evidence seams
- existing CIBO contracts only as read-only architectural context; do not depend on unmerged Batch 004 output

Existing Core already provides deterministic frozen-OOS and circular-block bootstrap machinery. Do not create a parallel replay universe, OOS universe, RNG/resampling engine, identity system, Risk system, or CIBO system.

## PERMANENT LAWS

`CODE GREEN != DEMO_ELIGIBLE`
`BACKTEST PROFITABLE != DEMO_ELIGIBLE`
`MONTE_CARLO_PASS != PROFITABILITY_PROOF`
`CIBO_REVIEW != PROMOTION_AUTHORITY`
`TRADER_LAB != EXECUTION_AUTHORITY`
`TRADER_LAB != RISK_BYPASS`
`DEMO_ELIGIBLE != PROFITABLE`

No Production account, real capital, productive credentials, deposits/withdrawals, provider-native order construction, automatic corrective trading, hidden scheduler/thread/retry, online self-rewrite, self-promotion, or Production-readiness inference.

## REQUIRED LAB STATE MODEL

Support the exact governed candidate states, or semantically exact equivalents with no weakening:

- `DRAFT`
- `RESEARCH_READY`
- `REPLAY_QUALIFIED`
- `FAST_FORWARD_QUALIFIED`
- `OOS_QUALIFIED`
- `STRESS_QUALIFIED`
- `MONTE_CARLO_QUALIFIED`
- `RISK_REVIEWED`
- `CIBO_REVIEWED`
- `DEMO_ELIGIBLE`
- `REJECTED`
- `DEGRADED`
- `SUSPENDED`

Transitions must be explicit, deterministic, version/config bound, evidence-backed and fail closed. No inferred promotion from state names alone.

## SIX-LANE EXECUTION CONTRACT

All six lanes are mandatory. Use subagents/lane delegation where available. Append durable checkpoint evidence after every material decision and after every completed lane. Completed lanes MUST NOT be repeated after interruption.

### LANE 1 — Semantic LSP reuse map and bounded architecture

Before code, prove the exact reusable research/evidence surfaces and define the smallest new Trader Lab package architecture.

Required decisions:
- which exact frozen strategy/run/config identity becomes the candidate binding source;
- how stage evidence binds to exact candidate identity/version/config/fingerprint;
- how existing replay/OOS/bootstrap evidence is referenced without mutation or laundering;
- how CIBO and Risk reviews can later attach through typed evidence seams without this package inventing their implementations;
- how independent promotion remains separate from CIBO recommendation;
- how VT-01..VT-31 fit generically without methodology-family hardcoding.

No implementation until the lane closes with LSP evidence.

### LANE 2 — Candidate lifecycle + immutable stage evidence contracts

Implement the core immutable Lab candidate/lifecycle contracts in the new Trader Lab package.

Required material:
- exact Trader candidate identity/version/configuration/fingerprint binding;
- lifecycle state enum/value contract;
- stage type / stage evidence identity;
- immutable stage-evidence record with source provenance/fingerprint/time metadata supplied explicitly, never hidden clocks;
- deterministic transition request/result or pure transition boundary;
- explicit rejection/degradation/suspension evidence;
- exact prior-state -> next-state transition table;
- no ability to skip mandatory stages;
- changing candidate identity/version/config invalidates previous eligibility chain by construction;
- duplicate/conflicting stage evidence rejected;
- stale/mismatched candidate evidence rejected;
- no free-form prose can act as promotion authority.

The contract must be capable of carrying exact references to existing replay/OOS/resampling/economic/Risk/CIBO evidence without fabricating their conclusions.

### LANE 3 — Fast-Forward qualification boundary

Implement a bounded deterministic Fast-Forward qualification seam, not a second replay engine.

It must consume/point to existing chronological replay evidence and prove only the Lab-specific qualification properties:
- acceleration changes wall-clock execution speed only;
- market chronology/order remains exact;
- `available_at`/visibility semantics are preserved;
- no future candle/tick/event is available early;
- no hidden wall clock;
- identical candidate + evidence + schedule reproduces identical qualification evidence;
- no risk-relevant event may be skipped to gain speed.

If existing replay contracts do not expose enough material to certify one of these properties, fail closed / return insufficient evidence rather than reimplement replay.

### LANE 4 — Stress + Monte Carlo robustness orchestration

Implement Lab-level specification/evidence orchestration that REUSES existing deterministic research resampling machinery instead of inventing RNG.

At minimum support explicit, pre-registered experiment metadata for applicable robustness families:
- block/bootstrap sequence resampling where existing evidence supports it;
- start/sub-window perturbation only through explicit evidence references;
- cost/spread/slippage perturbation bounds as specification data, not hidden assumptions;
- parameter-neighborhood evaluation as separate candidate-neighbor evidence, never silent promotion of a neighbor;
- regime/dependence constraints where available;
- drawdown/tail/risk-of-ruin evidence references where separately supported.

Required anti-p-hacking laws:
- algorithm/family/version, seed or seed-set, simulation count and thresholds frozen before outcome inspection;
- no seed hunting;
- no post-hoc threshold replacement on the same experiment identity;
- no unfavorable simulation deletion;
- no global/random hidden RNG;
- same exact specification/evidence/seeds -> same identity/results;
- insufficient sample or unsupported dependence assumptions cannot produce `MONTE_CARLO_QUALIFIED`;
- Monte Carlo cannot manufacture edge or claim calibrated real-world probability by default.

Prefer composition around `ResearchBlockBootstrapPolicy`, `ResearchBlockBootstrapDistribution`, `ResearchResamplingEnvelope` and related exact types when semantically compatible.

### LANE 5 — Promotion gate + normal/adversarial tests + architecture doc

Implement the independent Lab promotion gate for an exact candidate.

`DEMO_ELIGIBLE` requires evidence-backed completion of:
`REPLAY -> FAST_FORWARD -> OOS -> STRESS -> MONTE_CARLO -> RISK_REVIEW -> CIBO_REVIEW -> INDEPENDENT_VALIDATION`.

Economic evaluation evidence must also be representable/required where #473 mandates it; do not fabricate metrics if the existing source evidence is insufficient.

CIBO may recommend; it cannot create `DEMO_ELIGIBLE`. Risk review cannot be skipped. Independent validation must be represented as a distinct final gate.

Adversarial tests must include at least:
- happy-path legal progression;
- every illegal stage skip;
- wrong candidate/version/config/fingerprint binding;
- duplicate or contradictory evidence;
- stage evidence from another run/candidate;
- stale/incomplete evidence -> fail closed;
- code/config mutation invalidates prior promotion binding;
- bool-vs-int / subclass laundering where exact runtime type matters;
- timezone-naive timestamps rejected where timestamps are used;
- deterministic canonical ordering and logical values;
- no hidden uuid4/clock/randomness;
- fast-forward lookahead/chronology violation rejected or cannot qualify;
- zero/negative/boolean simulation count rejected;
- seed substitution / post-hoc experiment mutation creates mismatch/new identity and cannot reuse qualification;
- insufficient-sample Monte Carlo cannot qualify;
- parameter-neighbor evidence cannot promote original candidate;
- CIBO recommendation cannot self-promote;
- missing Risk review blocks promotion;
- suspended/degraded/rejected candidate cannot become DEMO_ELIGIBLE without a valid restart/new chain;
- no Production/execution authority surfaces.

Create/update ONLY `docs/architecture/QORE-TRADER-LAB-001.md` for this slice.

### LANE 6 — LSP after + diff audit + FULL QG + durable handoff

Use semantic LSP after edits to prove dependency direction and no parallel/reverse-dependency leakage.

Run exactly:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No test weakening, unjustified skip/xfail, type-ignore suppression, linter silencing, or coverage exclusions.

Perform diff/blast-radius audit. Final durable checkpoint MUST include:
- WHAT DONE
- FOUND
- CLOSED
- REMAINS
- exact files changed
- exact FULL QG results
- LSP-before and LSP-after evidence
- uncertainties / integration seams needed after concurrent CIBO build
- PENDING NEXT ACTION
- SAFE RESUME INSTRUCTION

## DEFINITION OF DONE FOR BATCH 005

A bounded artifact exists, isolated from concurrent CIBO edits, showing that QORE has a real Trader Lab foundation that can:

1. bind an exact Trader candidate/version/configuration;
2. enforce the mandatory lifecycle and forbid stage skipping;
3. qualify Fast-Forward without creating lookahead or a parallel replay engine;
4. orchestrate Stress/Monte-Carlo robustness using existing deterministic evidence machinery;
5. require Risk + CIBO + independent validation before `DEMO_ELIGIBLE`;
6. support all VT-01..VT-31 generically;
7. produce immutable auditable promotion/rejection evidence;
8. pass semantic LSP and FULL QG;
9. resume after interruption without repeating completed lanes.

This package does not implement any concrete Trader methodology and does not authorize DEMO or Production by itself.
