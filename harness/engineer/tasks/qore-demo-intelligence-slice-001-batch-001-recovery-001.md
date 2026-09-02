# QORE DEMO PROFITABILITY — HARNESS ENGINEER BATCH 001 RECOVERY 001

Repository: `mezas3238-hue/qore-core`
Issue: #470 — QORE-DEMO-INTELLIGENCE-SLICE-001
Parent: #469
Related: #468, #290, #473, #474
EXACT START: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
EXACT START TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
Mode: Engineer / artifact-only

## RECOVERY PROVENANCE — BINDING

This is a recovery continuation of the original package `HARNESS-ENGINEER-QORE-DEMO-INTELLIGENCE-SLICE-001-BATCH-001`.

Source failed run: `33646160981`
Source artifact id: `9853630087`
Source artifact digest: `sha256:98b6dddc66125bd45903964daae22cb3ef33f2dd070d5174e0b7911c5e44f358`
Last durable checkpoint sequence: `7`
Recovered phase: `LANE_3_CONSUMED (CIBO Trader Manager design)`
Recovered pending action: `await lane 2 (methodology design), then synthesize all six.`
Recovered safe resume: `lanes 1,3,4,5,6 consumed. Await lane 2 only; then synthesize and implement.`

The original artifact contained an empty candidate patch, so no implementation was materialized. The durable research/checkpoint evidence below is the authoritative carry-forward work.

## HARD RECOVERY LAW

`COMPLETED LANE != REPEATABLE WORK`

Do NOT relaunch or repeat lanes 1, 3, 4, 5, or 6.

This recovery has six logical lanes in the synthesis, but only ONE native subagent lane is allowed to run: Lane 2. The other five lanes are inherited durable evidence and must be consumed as completed carry-forward work.

If Lane 2 is interrupted, use the resilient runner/checkpoint state and recover only Lane 2. Never restart the whole batch.

## EXECUTIVE OBJECTIVE

Complete Issue #470 as the first concrete economic-intelligence cohort for QORE DEMO profitability validation:

`canonical bounded market evidence -> concrete specialized Traders -> CIBO Trader Manager MVP -> downstream existing Risk/OrderIntent seam`

This batch MUST produce implementation + tests + architecture documentation. It MUST NOT execute provider orders, use real capital, use Production credentials, bypass Risk, claim profitability, implement the Trader Lab, or implement provider execution.

# INHERITED COMPLETED LANES — DO NOT RELAUNCH

## Lane 1 — Architecture / reuse / dependency graph — COMPLETED

Carry-forward findings:
- `ResearchDecisionEvaluatorProtocol.evaluate -> (ResearchStrategyState, tuple[FunctionalDecision, ...])`.
- `create_initial_state(strategy_binding, start_policy)` is the canonical state initialization path.
- `ResearchStrategyState` exact content permits `None/bool/int/float/str/UUID/datetime/tuple/Mapping`; do not place raw `Decimal` in retained state content.
- Evaluator family regex is lowercase dotted; schema version is `v\d+`; evaluator software revision must equal run software revision.
- `ResearchSpecialistEvaluatorProtocol.evaluate(source_decision) -> ResearchAnalysisSpecification`; specialist kind starts `virtual-trader.*`.
- `OhlcSnapshot` prices are float while financial thresholds should remain exact Decimal; convert market float to `Decimal(str(x))` at the methodology boundary where comparison with Decimal thresholds is required.
- `FunctionalDecision` outcomes available: APPROVED / REJECTED / BLOCKED / DEGRADED.
- Existing CIBO supervision is TEST/DEMO scoped and wraps the real-market decision boundary.
- Implementation should be additive. No existing signature change is required.
- Concrete producers must not create `OrderIntent`, call execution gateways, authorize orders, import provider/native execution boundaries, use `uuid4`, implicit wall clock, randomness, or global mutable state.
- Recommended evaluator families: `qore.trader.trend`, `qore.trader.meanreversion`, `qore.trader.breakout`.
- Recommended specialist kinds: `virtual-trader.trend-momentum`, `virtual-trader.mean-reversion`, `virtual-trader.breakout-volatility`.

## Lane 3 — CIBO Trader Manager design — COMPLETED

Carry-forward design:
- Closed participation enum: `ELIGIBLE`, `SELECTED`, `REDUCED`, `SUSPENDED`, `BLOCKED`.
- Exact trader version binding must retain trader id, evaluator family, schema version, software revision, and configuration fingerprint where introduced.
- Performance evidence should be immutable, typed, freshness-aware, sample-count-aware, and reference exact evidence.
- Risk evidence should use closed classification semantics such as CLEAR / FLAGGED / VIOLATION and retain `as_of` plus evidence reference.
- Manager policy must have exact mode, selection count >= 1, ranking metric code, freshness bound, minimum samples, violation floor, selection threshold, reduced weight in `(0,1)`, and deterministic invariants.
- Ordered fail-closed evaluation stages are mandatory.
- Deterministic ranking tie-break recommendation: `(-metric_value, family, schema_version, software_revision, trader_id)` or causally equivalent canonical stable key.
- Provenance must retain benchmark mode, policy fingerprint, manager schema/revision, evaluated_at supplied explicitly by caller, and evidence refs.
- CIBO recommendation is not execution authority and cannot bypass Risk.

## Lane 4 — Adversarial / temporal / anti-overfit testing — COMPLETED

Carry-forward requirements:
- Producer uses only prior state plus newly visible observations. No access to future dataset material.
- No `datetime.now`, `date.today`, `uuid4`, global RNG, hidden RNG, sleeps, schedulers, threads, hidden retries.
- Reject invalid lookback and negative/non-finite Decimal thresholds.
- Do not store raw Decimal in ResearchStrategyState content; canonical string encoding if state needs exact threshold/value material.
- Flat market / zero variance / zero range / insufficient evidence => ABSTAIN/fail closed.
- First signal only after exact required lookback is satisfied.
- Rolling window must be bounded and deterministic.
- Duplicate/reordered/conflicting observations must fail closed or be deterministically rejected according to existing observation semantics; never silently normalize away material chronology conflicts.
- Exact deterministic repetition: same candidate + config + evidence => same decisions/state/provenance.
- Manager ties require canonical stable tie-break.
- Manager cannot select suspended/blocked trader.
- Contradictory or stale material performance/risk evidence fails closed.
- Secret hygiene must match pretrade safety sensitive-marker expectations.
- Manager output must not contain `OrderIntent` or `AuthorizedOrderIntent`.
- A/B mode identity must be retained exactly and must not be relabeled after outcome observation.
- `verify_trace_reproducibility` or existing equivalent deterministic replay check should pass where composable.

## Lane 5 — Integration / impact / semantic LSP — COMPLETED

Carry-forward findings:
- LSP definition/reference checks on consumed core symbols passed before original implementation attempt.
- Import direction remains infrastructure -> modules where already established; never create reverse dependency Core/Domain/Governance -> concrete infrastructure/provider.
- Concrete producers must not import execution/provider/real-market authorization modules.
- Minimal shared trader signal abstraction is acceptable only if needed: BUY / SELL / ABSTAIN plus exact benchmark participation/mode.
- No existing symbol signature changes are required.
- Recovery implementation must still run semantic LSP AFTER edits and record definition/reference/hover evidence on new/consumed symbols.

## Lane 6 — Maintainability / docs / root-family exhaustion — COMPLETED

Carry-forward recommendations:
- Preferred implementation files, adjusted only if repository structure proves a more canonical fit:
  - `research_trend_momentum_producer.py`
  - `research_mean_reversion_producer.py`
  - `research_breakout_volatility_producer.py`
  - `cibo_trader_manager.py`
  - shared deterministic trader producer helper only if it removes real duplication.
- Exact benchmark values should carry the meanings:
  - `TRADERS_RISK_ONLY`
  - `CIBO_MANAGED_TRADERS_RISK`
- Reuse canonical cjson/sha256/fingerprint/state helpers; do not invent parallel canonicalization.
- Decimal -> canonical string, never Decimal -> float for thresholds/configuration.
- Exact runtime types and recursive revalidation for nested retained evidence where applicable; `bool != int`.
- Docs must state strategies are experimental deterministic hypotheses, DEMO/research scoped, not profitable by assertion, and have no Production/provider execution authority.
- Root families explicitly OUT OF SCOPE for this batch: cTrader execution #471, provider-fill/PnL analytics #472, Trader Lab/promotion #473/#474, broad market-data redesign, Production authority, calibration/OOS promotion machinery.

# ONLY MISSING RESEARCH LANE

## Lane 2 — Concrete Trader methodology design — RUN THIS ONE NATIVE SUBAGENT ONLY

Design and falsify three transparent deterministic hypotheses compatible with the inherited architecture:

1. Trend/Momentum.
2. Mean Reversion.
3. Breakout/Volatility.

For each establish and justify:
- exact immutable configuration fields and validation;
- exact required lookback;
- exact BUY / SELL / ABSTAIN semantics;
- exact reason codes/evidence;
- state transition requirements;
- insufficient/flat/ambiguous behavior;
- no lookahead proof;
- deterministic handling of equal values/ties;
- bounded arithmetic and non-finite rejection;
- compatibility with canonical `OhlcSnapshot`, Research evaluator identity/state, and specialist-analysis boundary.

Prefer simple falsifiable rules over opaque ML/LLM prediction. Do not optimize parameters, use OOS evidence for calibration, self-select windows, or claim edge.

Suggested starting hypotheses to investigate, not blindly accept:
- Trend/Momentum: compare short and long bounded price summaries plus minimum movement/strength threshold; BUY if upward condition is unambiguous, SELL if downward, otherwise ABSTAIN.
- Mean Reversion: compare current close to deterministic bounded equilibrium plus deviation threshold; BUY below equilibrium, SELL above, otherwise ABSTAIN; refuse zero/invalid dispersion if dispersion is used.
- Breakout/Volatility: compare current close against a prior-window high/low range with explicit breakout margin and optional minimum prior range; BUY above valid upper breakout, SELL below valid lower breakout, otherwise ABSTAIN. The current bar must not be included in the historical high/low used to define its own breakout threshold.

Lane 2 must challenge these starting forms and choose the smallest semantically sound rule set.

# SYNTHESIS + IMPLEMENTATION AFTER LANE 2

After Lane 2 reaches COMPLETED, synthesize all six logical lanes using the inherited evidence above. Then implement the bounded candidate.

## Concrete trader requirements

Each methodology must expose/retain:
- exact trader/methodology identity;
- schema/version/software revision;
- immutable configuration and deterministic fingerprint;
- explicit supported evidence assumptions, initially canonical OHLC / M5-compatible where useful without provider coupling;
- exact required lookback;
- deterministic state transition;
- BUY / SELL / ABSTAIN semantics mapped to existing decision contracts without pretending SELL is a risk rejection unless the architecture requires a separate exact side contract;
- no implicit clock/randomness/global mutable state/lookahead/provider IO/execution authority/Risk bypass.

Important semantic warning: inherited lane 1 originally considered mapping BUY->APPROVED, SELL->REJECTED, ABSTAIN->BLOCKED. Do NOT adopt that mechanically if `FunctionalDecision.outcome` semantically represents authorization/status rather than trade side. Independently inspect the exact contract and introduce the smallest explicit side/signal representation if required. Preserve semantic truth over convenience.

## CIBO Trader Manager MVP

Implement immutable, exact, deterministic manager inputs/policy/result/provenance consistent with inherited Lane 3. It may select/reduce/suspend/block/recommend bounded participation. It must not execute orders or grant Risk authorization.

## A/B identity

Retain exact mode meanings:
- `TRADERS_RISK_ONLY`
- `CIBO_MANAGED_TRADERS_RISK`

Same trader identity/version/configuration must remain comparable across modes. No hindsight relabeling.

## Compatibility with #473/#474

This batch does NOT implement Trader Lab or Capability Profiles. However, new trader identity/version/config fingerprint and manager provenance must be sufficiently exact that later #473/#474 can bind a `DEMO_ELIGIBLE` exact version without redesigning identity semantics.

# TESTS — NORMAL + ADVERSARIAL

Implement behavior tests, not constructor-only tests. Cover inherited Lane 4 matrix and Lane 2-specific falsifications. Include at minimum:
- insufficient and exact lookback boundary;
- BUY, SELL, ABSTAIN for all three methodologies;
- flat market;
- equal/tie boundaries;
- deterministic repeated evaluation;
- invalid config types including bool laundering where relevant;
- non-finite/negative thresholds;
- current-bar breakout lookahead prevention;
- reordered/duplicate chronology rejection if consumed boundary requires ordered unique evidence;
- exact identity/config mismatch failures;
- CIBO stale/missing/contradictory evidence;
- suspended/blocked trader never selected;
- deterministic manager tie-break;
- A/B mode identity retained;
- secret-like material rejected/sanitized according to existing evidence contracts;
- no provider/execution/Production authority imports or outputs.

No test weakening, skips/xfail, type-ignore hiding, linter suppression, or coverage exclusion.

# LSP + QUALITY GATE

Inherited LSP-before evidence may be reused. After implementation, semantic LSP-after is mandatory on new/consumed symbols, including definition/reference/hover evidence.

Run focused tests during implementation, then canonical FULL QG:

`ruff check .`
`mypy src tests`
`pytest --cov=src/qore --cov-report=term-missing`

FULL QG is forbidden until Lane 2 is COMPLETED and all six logical lanes are present in synthesis.

# DURABLE MEMORY — RECOVERY MANDATORY

Start by writing a recovery checkpoint that explicitly imports:
- source run/artifact/digest;
- checkpoint sequence 7;
- inherited completed lanes `[1,3,4,5,6]`;
- pending lane `[2]`;
- exact START/TREE.

Then append durable checkpoints:
1. recovery binding imported;
2. Lane 2 started/checkpointed/completed;
3. six-lane synthesis;
4. implementation;
5. focused tests + LSP-after;
6. FULL QG;
7. root-family exhaustion;
8. final disposition.

Every checkpoint must contain concrete findings, adjudication, unresolved uncertainty, `PENDING NEXT ACTION`, and `SAFE RESUME INSTRUCTION`.

# REQUIRED FINAL REPORT

Report:
- exact START/TREE and recovery provenance;
- inherited completed lanes and the fact they were NOT rerun;
- Lane 2 methodology findings;
- six-lane synthesis;
- LSP-after evidence;
- changed files/diff size;
- exact methodology behavior;
- CIBO manager semantics;
- adversarial coverage;
- focused/FULL QG results;
- material findings and dispositions;
- residual blockers for #471/#472/#473;
- durable checkpoint count;
- `RESUME STATE: COMPLETE` or exact interrupted next action;
- final verdict exactly one of `CANDIDATE READY`, `MATERIAL FINDING(S)`, or `VALIDATION BLOCKED`.

Artifact-only: do not push to qore-core. Produce deterministic candidate patch and durable recovery evidence for controlled materialization.
