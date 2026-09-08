# HARNESS ENGINEER — QORE CIBO TRADER-TEAM LAB SEMANTIC CLOSURE 001

## Binding

Target repo: `mezas3238-hue/qore-core`
Target PR: `#501`
Expected START/HEAD: `f5b8b27b82087615040d76e27598ca7514ccd4d3`
Expected TREE: `6c14b10a462e774409291695cc5a77a165123435`
Parent/base: PR #500 HEAD `c283c9d793ca04b7477d32f5cd0969de9a304195`
Artifact-only. Do not push/merge qore-core.

## Mission

Audit-repair PR #501 as one causal family. Preserve the good architecture but close all semantic defects so CIBO can safely be studied as a market reader + exact five-Trader selector without lookahead, identity laundering, authority laundering, fake metrics, or invalid market/regime semantics.

## Mandatory six lanes

L1 — Market/world-model semantics and exact contracts.
L2 — Five-Trader identity/version/config/methodology/history binding and temporal provenance.
L3 — Suitability/meta-selection/operating-envelope fail-closed semantics.
L4 — Replay/WF/OOS chronology, anti-lookahead, oracle separation, policy/methodology freeze.
L5 — Counterfactual science, characterization, regret/calibration/drawdown/tail/baseline metric correctness.
L6 — Integration/reachable paths/tests/regressions/authority boundaries/FULL QG.

Exactly 6/6 lanes, semantic LSP, HIGH/MAX where needed, Root-Family Exhaustion. Internal Expert must independently falsify the repaired candidate.

## Known material findings to reproduce and close

### F1 — Wrong market-regime type
`CiboMarketState.regime_hypothesis` currently uses `CiboRegimeKind`. Existing `CiboRegimeKind` is trader-relative `FAVORABLE/WEAK/DEGRADED`, not a market-state taxonomy. Do not model CIBO's market understanding with that type. Reuse the canonical Cognitive World Model / MarketTraderContext regime reference or introduce only the minimal exact market-state contract required by the existing architecture. Keep market state separate from trader suitability. Add tests proving trend/range/transition/etc cannot be laundered into trader-relative favorable/weak/degraded semantics.

### F2 — Suitability bypass
`select_cibo_specialist()` computes all five `CiboSuitabilityAssessment`s but eligibility ignores their dispositions. Current focused tests can select VT-08 while `market_evidence.status == EVIDENCE_DEPENDENT`; existing `assess_market_trader_suitability()` treats non-SUFFICIENT market evidence as `INSUFFICIENT_EVIDENCE`. A positive selection must not survive insufficient/contradictory/degraded/unsupported suitability. Close the authority seam without letting CIBO manufacture `SUFFICIENT` market evidence. If external market certification is required, represent/revalidate it exactly.

### F3 — Replay/OOS lookahead through team/history/profile
Team formation checks history only against `formed_at`; shadow/selection does not prove `team.formed_at`, every `historical_intelligence.as_of`, and every capability-profile freshness timestamp are <= the episode `information_cutoff`. In historical replay/OOS, future history/profile knowledge must be structurally impossible. Design the decision-time binding so every evidence source consumed at t is `as_of <= t`, including re-entry validation after reflective corruption.

### F4 — Capability Profile identity laundering
`CiboLabTraderMember` currently binds `CiboTraderCapabilityProfile` to `DemoTradingTraderIdentity` primarily by config fingerprint. Config equality is not exact identity/version proof. Find and reuse the canonical mapping/binding between the research evaluator identity and the exact Demo Trader identity/version where available; otherwise introduce a minimal explicit evidence-backed binding contract. Wrong Trader/same-config and wrong-version/same-config must fail closed.

### F5 — Favorable-but-nonpositive selection / NONE dominance
`TraderOperatingEnvelope(FAVORABLE, expected_return<=0)` is currently legal and `_history_score` can select it. Define the exact economic/utility semantics. If `expected_return` is the selection score, FAVORABLE must not make a non-positive net expectation selectable; `NONE` must dominate where the evidence-backed utility is non-positive. Do not invent profitability. Add zero/negative/tie tests and explicit insufficient-evidence handling.

### F6 — Characterization metric semantic defects
Current implementation has at least these defects:
- bucket key includes `selected`, so `selection_stability` inside the bucket is tautologically ~1 and switching ~0;
- `max_drawdown_contribution` and `tail_risk` are just `min(single selected returns)`, not actual drawdown/tail metrics;
- no abstentions maps `abstention_quality` to numeric 0 instead of unsupported/None;
- `cibo-dynamic` baseline considers any alternative with a score, ignoring `alternative.eligible`;
- verify whether `cumulative_return` is truly cumulative/compounded or rename to an exact additive metric.
Repair names/formulas/contracts. Metrics must never claim more than what is computed. Add property/metamorphic tests and multi-record switching/drawdown/tail fixtures.

### F7 — Market-reading label laundering
`CiboMarketReadingAssessment.correct` and `regime_changed_after_decision` are caller-supplied booleans and can contradict predicted/realized regime/evidence, thereby changing failure diagnosis and calibration. Derive canonical conclusions from evidence or require an externally certified assessment whose invariants recompute these fields. Add contradictory-label tests.

### F8 — Methodology freeze not actually bound
`CiboWalkForwardPlan.methodology_version` is retained but `run_walk_forward()` only validates `decision.policy.version`; methodology/model identity is not bound to decision records. Add exact CIBO market-reader/meta-selection methodology/model identity and fingerprint to decision/freeze records and revalidate across Replay → Train/Research → Walk-Forward → Untouched OOS → Stress → Calibration → Economic Evaluation. Any material policy/model change creates a new version and cannot reuse holdout evidence.

### F9 — Strengthen exact types/provenance while in family
Audit neighboring exact-type/fingerprint/provenance invariants, including 64-hex validation of counterfactual output fingerprints, outcome provenance typing, market evidence freshness, team/decision timestamps, duplicate outputs, wrong identity/config/methodology, and post-decision oracle isolation. Do not broaden scope beyond this causal family.

## Preserve

- PR #501 stacked-base architecture; PR #500 remains untouched.
- research-only boundary;
- no orders, broker writes, Risk mutation, DEMO/LIVE/Production authority;
- exact five shadow outputs and post-decision oracle separation;
- consume-only Historical Intelligence seam; do not invent a competing registry;
- append-only decision memory contract;
- use existing Trader evaluators and canonical market snapshot evidence identity.

## Required adversarial closure

At minimum prove:
- market taxonomy != trader-relative suitability taxonomy;
- non-SUFFICIENT / contradictory / degraded suitability cannot select;
- history/profile/team data newer than episode cutoff cannot enter replay/OOS;
- wrong Trader/profile binding fails despite matching config;
- negative/zero favorable score cannot beat NONE;
- selection stability detects actual switching across chronological records;
- drawdown/tail metrics match exact declared formulas and are not single-return aliases;
- no-abstention quality is unsupported, not fabricated zero;
- baseline does not bypass eligibility;
- caller cannot lie about market-reading correctness/regime change;
- CIBO methodology/model version laundering across holdout fails;
- oracle/future outcomes cannot enter decision-time types or paths;
- exact same frozen inputs deterministically replay;
- all five abstain => NONE;
- all five unsuitable/insufficient => NONE;
- research-only records cannot gain Risk/DEMO authority.

## Quality Gate

Run complete:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No type ignore, strictness reduction, hidden skips/xfails, coverage exclusion, test weakening, or fabricated evidence.

## Deliverable

Artifact-only candidate patch + metadata + hashes + exact changed files + six-lane evidence + semantic LSP evidence + internal Expert falsification + Root-Family Exhaustion closure + FULL QG. Final status must be either `CANDIDATE READY — ROOT FAMILY EXHAUSTED` or `BLOCKED / FURTHER MATERIAL FAMILY FOUND`.