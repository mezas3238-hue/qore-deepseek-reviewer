# QORE DEMO PROFITABILITY — HARNESS ENGINEER BATCH 001

Package intent: implement Issue #470 as the first large bounded construction batch under #469.

Repository: `mezas3238-hue/qore-core`
Issue: #470 — QORE-DEMO-INTELLIGENCE-SLICE-001
Parent: #469
Related: #468, #290
EXACT START: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
EXACT START TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
Mode: Engineer / artifact-only

## EXECUTIVE OBJECTIVE

Build the first concrete economic-intelligence cohort for QORE DEMO profitability validation:

`canonical bounded market evidence -> concrete specialized Traders -> CIBO Trader Manager MVP -> downstream existing Risk/OrderIntent seam`

This batch MUST produce implementation + tests + architecture documentation. It MUST NOT execute provider orders, use real capital, use Production credentials, bypass Risk, or claim profitability.

## CONTINUITY / DO NOT REBUILD

The live reconstruction in #469 is authoritative context for this batch. Existing foundations are intentionally reusable and MUST be inspected before changing them:

- `src/qore/infrastructure/research_evaluator_protocols.py`
- `src/qore/infrastructure/research_evaluator_identity.py`
- `src/qore/infrastructure/research_strategy_state.py`
- `src/qore/infrastructure/research_producer_admission.py`
- `src/qore/infrastructure/research_execution_composition.py`
- `src/qore/infrastructure/research_specialist_boundary.py`
- `src/qore/modules/trader/contracts.py`
- `src/qore/modules/trader/module.py`
- `src/qore/modules/cibo/contracts.py`
- `src/qore/infrastructure/cibo_supervised_runtime.py`
- `src/qore/infrastructure/real_market_decision_runtime.py`
- `src/qore/infrastructure/order_intent.py`
- `src/qore/infrastructure/pretrade_safety.py`
- existing temporal/OOS/replay/economic evidence machinery.

Do not create parallel Research, Risk, execution, reconciliation, or market-data universes. Adapt minimally where a verified contract gap requires it.

## SIX-LANE ENGINEERING CONTRACT — EXACTLY SIX LOGICAL LANES

Run exactly six logical subagent lanes. They may investigate concurrently if stable; if recovery is required, checkpoint completed lanes and run only missing lanes. Every lane must write concrete findings to durable memory before the primary session proceeds.

### Lane 1 — Architecture / reuse / dependency graph

Determine the smallest implementation surface for #470. Map existing protocols, state/fingerprint contracts, decision types, canonical OHLC/replay observation representation, and CIBO supervision. Identify accidental duplicate-authority risks and exact extension points. Use semantic LSP on materially relevant symbols/callers.

### Lane 2 — Concrete Trader methodology design

Design and falsify three explicit deterministic hypotheses:
1. trend/momentum;
2. mean reversion;
3. breakout/volatility.

They are hypotheses to test, not assumed profitable. Prefer transparent bounded price-bar rules over opaque ML/LLM prediction. Establish exact lookback, configuration, BUY/SELL/ABSTAIN semantics, reasons, state transitions and behavior on insufficient/flat/ambiguous evidence. Confirm compatibility with existing research evaluator/state identities and no lookahead.

### Lane 3 — CIBO Trader Manager design

Design a deterministic, evidence-backed MVP manager that can classify trader participation as ELIGIBLE/SELECTED/REDUCED/SUSPENDED/BLOCKED (or a causally equivalent minimal closed enum if architecture proves a better representation). It must consume explicit trader/performance/risk evidence, have deterministic ordering/tie-breaking, fail closed on ambiguity, and produce reason/provenance evidence. It must never grant execution authority or bypass Risk. Operational use remains subject to existing DEMO CIBO supervision.

### Lane 4 — Adversarial / temporal / anti-overfit testing

Build a comprehensive matrix covering at least: insufficient/exact lookback, flat markets, ties, duplicate/reordered observations, future/lookahead injection, stale evidence, identity/config mismatch, non-finite/extreme Decimal where applicable, strict runtime types/bool laundering, deterministic replay, silent parameter drift, OOS leakage, contradictory manager evidence, missing performance evidence, suspended-trader selection attempt, deterministic tie-break, A/B identity separation, secret hygiene and no Production/direct provider authority.

### Lane 5 — Integration / impact / LSP

Trace exact call/reference impact for changed and consumed symbols. Prove the implementation plugs into existing Research/Trader/CIBO/OrderIntent seams without reverse dependencies or authority inversion. Perform semantic LSP before and after edits with actual definition/reference/hover evidence. Identify any required minimal compatibility adapter but do not broaden scope to cTrader execution (#471).

### Lane 6 — Maintainability / docs / root-family exhaustion

Audit naming, duplication, deterministic canonicalization, immutable contracts, safe reason/evidence material, documentation, and residual causal-family gaps. Ensure new architecture docs clearly state these strategies are experimental hypotheses, DEMO/research scoped, no profitability claim, no Production authority, and explain A/B identities.

## IMPLEMENTATION REQUIREMENTS

### Concrete trader producers

Implement all three trader methodologies as concrete deterministic producers compatible with the existing research producer/evaluator shell where semantically correct.

Each must retain or expose:
- concrete trader/methodology identity;
- schema/version/software revision identity;
- immutable configuration and deterministic fingerprint/identity;
- bounded supported instrument/timeframe semantics, initially FX/M5 where useful;
- exact required lookback;
- deterministic state transition;
- BUY / SELL / ABSTAIN (or existing FunctionalDecision-equivalent explicit abstention) with reasons;
- no implicit clock;
- no default randomness;
- no global mutable state;
- no lookahead;
- no provider IO;
- no execution authority;
- no Risk bypass.

Use exact Decimal/canonical primitives where financially meaningful; reject non-finite values. Do not use floats for economic decision thresholds unless an existing contract makes that semantically required and justified.

### CIBO Trader Manager MVP

Implement explicit immutable manager inputs/evidence/actions and a deterministic manager policy. Minimum semantics:
- exact trader identity/version binding;
- performance/evidence freshness or explicit insufficient-evidence state;
- selection/suspension/reduction semantics;
- bounded participation recommendation, not execution authority;
- deterministic ranking/tie-breaking;
- no selection of suspended/blocked trader;
- fail closed on contradictory/missing material evidence;
- explicit reason codes;
- provenance suitable for later A/B attribution;
- no free-form secret-bearing metadata.

Do not make an LLM call a prerequisite for determinism in this MVP. CIBO intelligence may evolve later, but the profitability experiment needs reproducible manager behavior first.

### A/B experiment identity

Introduce exact identities:
- `TRADERS_RISK_ONLY`
- `CIBO_MANAGED_TRADERS_RISK`

or exact existing-style canonical values with those meanings. Outputs used downstream must retain the mode identity so #472 can compare cohorts without hindsight relabeling.

## TEST QUALITY

Add normal and adversarial tests. Do not test only constructors. Tests must prove behavior and causal boundaries. Include deterministic repetition and retained-state revalidation where nested retained material exists.

Do not weaken existing tests, add unjustified skips/xfail, `type: ignore` to conceal defects, linter suppressions, or coverage exclusions.

## DOCUMENTATION

Create/update architecture documentation for #470 describing:
- reused foundations;
- exact new components;
- three methodology hypotheses and limitations;
- CIBO manager authority boundary;
- A/B mode semantics;
- downstream #471/#472 interfaces;
- explicit non-claims.

## QUALITY GATE

After edits, run focused tests during development, then canonical FULL QG:

`ruff check .`
`mypy src tests`
`pytest --cov=src/qore --cov-report=term-missing`

The host external deterministic gate is authoritative if the workflow owns final FULL QG, but the primary engineer must still report what it ran locally/focused and preserve all findings.

## DURABLE MEMORY — MANDATORY

Write incremental durable checkpoints:
1. exact binding + baseline inspection;
2. after each of six logical lane conclusions;
3. after synthesis/design decision;
4. after implementation;
5. after focused validation/LSP-after;
6. after root-family exhaustion;
7. immediately before final disposition.

Each checkpoint must contain concrete evidence/findings, adjudication, unresolved uncertainty, `PENDING NEXT ACTION`, and `SAFE RESUME INSTRUCTION`. If interrupted, a successor MUST continue from the last checkpoint and MUST NOT restart completed lanes/probes/LSP.

Also preserve the recovery patch snapshot continuously after meaningful edits.

## REQUIRED FINAL REPORT

Report:
- exact START/TREE/read-only publication binding;
- six-lane evidence summary;
- LSP-before/LSP-after evidence;
- changed files and diff size;
- methodologies implemented and exact behavior;
- CIBO manager semantics;
- adversarial coverage;
- focused/full QG results available;
- all material findings and their disposition;
- residual blockers for #471/#472;
- durable checkpoint count;
- `RESUME STATE: COMPLETE` or exact interrupted next action;
- final verdict exactly one of `CANDIDATE READY`, `MATERIAL FINDING(S)`, or `VALIDATION BLOCKED`.

Artifact-only: do not push to qore-core. Produce a deterministic patch artifact for later controlled materialization.
