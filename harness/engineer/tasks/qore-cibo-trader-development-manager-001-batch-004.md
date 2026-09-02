# QORE CIBO — HARNESS ENGINEER BATCH 004

Repository: `mezas3238-hue/qore-core`
Primary issue: #479 `QORE-CIBO-TRADER-DEVELOPMENT-MANAGER-001`
Parents: #469, #470, #473, #474, #367, #477
Independent frozen PR: #478 — DO NOT MUTATE OR DEPEND ON ITS UNMERGED DOC CANDIDATE
EXACT START: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
EXACT START TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
Mode: Engineer / artifact-only / implementation

## EXECUTIVE AUTHORITY

CIBO construction starts now in parallel with the 31-Trader and Trader-Lab streams.

Canonical path:

`31 TRADERS || CIBO || TRADER LAB -> EXACT VERSION QUALIFICATION -> DEMO A/B`

This package is the FIRST bounded implementation slice of CIBO as Trader Development Director + Trader Manager. Do not attempt all Program J.

## HARD LAWS

`CIBO ROADMAP != CIBO IMPLEMENTED`
`CIBO IMPLEMENTED != CIBO CERTIFIED`
`CIBO RECOMMENDATION != PROMOTION AUTHORITY`
`CIBO MANAGEMENT != EXECUTION AUTHORITY`
`CIBO MANAGEMENT != RISK BYPASS`
`NO CIBO CAPABILITY PROFILE + NO VALID LAB PROMOTION EVIDENCE -> NO CIBO DEMO TEAM ADMISSION`
`TRADER VOICE != FORMAL SIGNAL`
`FREE-FORM CIBO DIALOGUE != FORMAL MANAGEMENT AUTHORITY`

No Production account, real capital, productive credentials, provider-native order construction, deposits/withdrawals, Risk bypass, automatic corrective trading, or Production-readiness inference.

## MANDATORY REUSE — LSP FIRST

Before design or edits, use semantic LSP to inspect exact symbols, callers and dependency direction for at least:

- `src/qore/modules/cibo/contracts.py`
- `src/qore/modules/cibo/module.py`
- `src/qore/governance/cibo_executive_dialogue.py`
- `src/qore/governance/cibo_widget.py`
- `src/qore/infrastructure/cibo_supervised_runtime.py`
- `src/qore/infrastructure/cibo_operational_supervision_evidence.py`
- `ResearchDecisionEvaluatorProtocol`
- `ResearchStrategyState`
- research evaluator identity / run binding / execution trace / composition
- existing performance/economic/equity/drawdown evidence contracts
- existing Risk/Policy evidence seams
- any existing Trader identity/version/configuration symbols

Do not create parallel identity, evidence, Risk, execution, replay or research universes. Do not introduce concrete model/provider dependencies into Core/Domain contracts.

## SIX-LANE EXECUTION CONTRACT

All six lanes are mandatory. Use subagents/lane delegation where available. Write a durable checkpoint after each material finding/decision and after every completed lane. A completed lane MUST NOT be repeated after interruption.

### LANE 1 — Semantic LSP reuse map + exact contract placement

Produce the exact reusable-symbol/dependency map and decide the smallest correct placement for new contracts.

Required decisions:
- what belongs in `qore.modules.cibo` versus `qore.infrastructure`;
- which existing identity/version/config/evidence types can be reused exactly;
- how CIBO references Lab/research evidence without owning or mutating it;
- how freshness/insufficient-evidence is represented without fabricating quantitative data;
- how A/B experiment identity remains outside execution authority.

No code until this lane closes with evidence.

### LANE 2 — Trader Capability Profile foundation

Implement immutable, provider-neutral capability-profile contracts for an exact Trader candidate/version/configuration.

The profile must be able to retain, directly or through exact reusable types/references:
- exact Trader identity/version;
- methodology/version/config fingerprint;
- specialty/intended role;
- qualified instruments/markets/timeframes;
- required inputs/lookback;
- formal action semantics where already defined;
- lifecycle/holding/frequency characteristics where defined;
- certified Lab evidence references (Replay, Fast-Forward, OOS, Stress, Monte Carlo, Economic, Risk);
- favorable/weak/degraded regime evidence refs where available;
- economic/risk metrics ONLY when backed by explicit certified evidence;
- cost/spread/slippage sensitivity refs;
- correlation/dependence evidence refs;
- Risk envelope/constraints refs;
- abstain/reduce/suspend/return-to-Lab conditions;
- promotion/certification state;
- evidence freshness/provenance;
- explicit limitations / insufficient-evidence state.

Required invariants:
- exact runtime types where QORE contracts require them; bool must not launder as int;
- immutable tuples/canonical deterministic order;
- no hidden clock, uuid4, random global state or mutable globals;
- no secrets in repr/logical_values/evidence;
- profile cannot manufacture `DEMO_ELIGIBLE`;
- code/config/version mismatch must fail closed;
- stale/missing required evidence cannot be represented as current certainty.

Use existing canonical IDs/value objects whenever semantically exact. If no exact Trader identity contract exists, introduce the smallest bounded provider-neutral identity needed by this slice and document why reuse was impossible.

### LANE 3 — CIBO Trader Development Director review

Implement a deterministic evidence-bound CIBO development-review boundary that consumes an exact Capability Profile plus certified Lab/Risk evidence references and produces a recommendation with explicit reasons/evidence.

Required recommendation semantics must support bounded equivalents of:
- continue curriculum / more evidence required;
- retrain / return to Lab;
- recommend promotion for independent gate consideration;
- recommend rejection;
- recommend suspension/degradation review.

Hard rule: recommendation MUST NOT mutate candidate state or create promotion authority.

Required fail-closed cases:
- missing/mismatched Trader identity/version/config;
- stale profile when current evidence is required;
- missing mandatory Lab stage evidence;
- contradictory/mismatched evidence refs;
- attempted promotion laundering;
- unsupported quantitative claims.

### LANE 4 — CIBO Trader Manager MVP

Implement deterministic DEMO-team management contracts/policy foundation with management states/actions equivalent to:
- `ELIGIBLE`
- `SELECTED`
- `REDUCED`
- `SUSPENDED`
- `BLOCKED`

Required behavior:
- only an exact version with valid `DEMO_ELIGIBLE` evidence may be selectable;
- suspended/blocked/ineligible Trader cannot be selected;
- reduction/suspension/selection retain exact reasons/evidence;
- concentration/correlation conclusions may be made only from explicit certified evidence; missing evidence -> insufficient/no conclusion, not invention;
- management output has no provider-native order/execution fields;
- management output cannot bypass Risk;
- management decision must bind exact experiment arm/version where A/B evidence is involved;
- preserve `TRADERS_RISK_ONLY` vs `CIBO_MANAGED_TRADERS_RISK` and reject version/config mismatch between arms.

Design for VT-01..VT-31 generically. Do not hard-code only five Traders or methodology-family switches that prevent catalog expansion.

### LANE 5 — Normal + adversarial tests + architecture docs

Add exhaustive tests for new material, including at minimum:
- valid exact capability profile;
- wrong identity/version/config binding;
- immutable/canonical ordering;
- exact runtime type/subclass/bool-vs-int laundering where relevant;
- duplicate evidence/identity rejection where semantics require uniqueness;
- stale/missing evidence fail closed;
- fabricated metric/evidence-free quantitative claim impossible or rejected;
- recommendation cannot self-promote;
- non-DEMO-eligible cannot be selected;
- suspended/blocked cannot be selected;
- CIBO output contains no provider-native execution authority;
- Risk bypass impossible by contract;
- A/B exact-version mismatch rejected;
- no hidden time/randomness;
- logical_values/provenance sanitization;
- deterministic replay/equality for identical inputs.

Update/add one bounded architecture document for this slice. Do not edit unrelated roadmap material.

### LANE 6 — LSP after + diff audit + FULL QG + durable handoff

Run semantic LSP after edits and prove no reverse dependency/provider leakage.

Run FULL QG exactly:

```text
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

No test weakening, no unjustified skip/xfail, no `type: ignore` to hide defects, no linter suppression, no coverage exclusion tricks.

Perform diff/blast-radius audit and write final durable checkpoint containing:
- WHAT DONE
- FOUND
- CLOSED
- REMAINS
- exact files changed
- exact QG results
- LSP-before/LSP-after evidence summary
- known uncertainties
- PENDING NEXT ACTION
- SAFE RESUME INSTRUCTION

## CHANGE BUDGET / POSTURE

This is a bounded foundation slice, not a mega-refactor.

Prefer new focused CIBO files/tests over invasive edits to unrelated research/risk modules. Existing modules may be minimally amended only where semantic reuse requires it.

Do not modify PR #478 branch/candidate. Do not merge or push qore-core. Artifact-only output is required for Integration Authority materialization and adjudication.

## DEFINITION OF DONE

A bounded artifact exists with code + tests + architecture evidence showing that QORE can:

1. represent an exact evidence-backed Trader Capability Profile;
2. have CIBO issue a non-authoritative Trader Development recommendation;
3. have CIBO issue deterministic DEMO team-management decisions only for eligible exact Trader versions;
4. preserve Risk/execution/Production authority separation;
5. support the 31-Trader catalog generically;
6. pass LSP-before/after and FULL QG;
7. resume from durable checkpoints without repeating completed lanes.
