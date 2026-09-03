# QORE CIBO FUNCTIONAL EXECUTIVE SYSTEM — BATCH 007

## Package

`HARNESS-ENGINEER-QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001-BATCH-007`

## Authority / roadmap

Canonical master roadmap: qore-core #303, amendment `QORE MASTER ROADMAP AMENDMENT — CIBO FIXED EXECUTION ROUTE`.

Functional program: qore-core #483 `QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001`.

Cognitive superarchitecture: #482 — SEPARATE TRACK. This batch MUST NOT reimplement or fold Cognitive Batch 006 into the functional layer.

Trader qualification system: #473 / PR #481 — SEPARATE TRACK. Trader Lab is consumed by CIBO Functions; it is not CIBO.

Trader functional foundation: #479 / PR #480 — now CF-03/CF-04 inside #483.

## Mission

Implement the complete governed **functional foundation** for CIBO — WHAT CIBO DOES — across CF-01..CF-20 from #483.

This is a large bounded functional batch, not a documentation-only design pass. Produce provider-neutral source contracts/orchestration, normal + adversarial tests, integration tests and architecture evidence for every CF domain.

Where a function depends on evidence producers not yet certified (Trader Lab, DEMO fills, #472 economics, market-data producers, future Cognitive persistence), implement the exact typed functional seam and fail-closed evidence requirements. Do NOT fabricate operational capability, market facts, PnL, production authority or persistence that does not exist.

Canonical separation:

`CIBO COGNITIVE SUPERARCHITECTURE = HOW CIBO THINKS`

`CIBO FUNCTIONS = WHAT CIBO DOES`

`CIBO TRADER = ONE FUNCTIONAL DOMAIN`

`FUNCTIONAL OUTPUT != EXECUTION AUTHORITY`

## Immutable start and mandatory predecessor correction

Start qore-core exactly at:

- START `576803fbda76970a4bbfe2287b5f9ca101d0f6c3`
- TREE `11f35844670551ac4ab5be322272a3221e6b1c4b`

This START contains the original PR #480 CIBO Trader foundation but NOT the admitted correction.

BEFORE functional implementation, restore the completed Harness correction artifact exactly:

- predecessor package: `HARNESS-ENGINEER-QORE-CIBO-TRADER-DEVELOPMENT-MANAGER-001-CORRECTION-001`
- predecessor run: `33696037771`
- predecessor artifact: `9873172256`
- exact correction patch SHA256: `e192d33a32d473f241fd0ea839cd31c141464e1af2434a3d1e3d443729bdfa32`
- retained patch archive: `harness/engineer/recovery/qore-cibo-trader-manager-correction001.patch.gz.b64`

Mandatory restore procedure from qore-core workspace:

1. Verify HEAD/TREE equal START/TREE above.
2. Decode the retained file from reviewer checkout (`../..`):
   `base64 -d ../../harness/engineer/recovery/qore-cibo-trader-manager-correction001.patch.gz.b64 | gzip -dc > /tmp/cibo-trader-manager-correction001.patch`
3. Verify SHA256 exactly equals `e192d33a32d473f241fd0ea839cd31c141464e1af2434a3d1e3d443729bdfa32`.
4. `git apply --check` then `git apply` the correction.
5. Verify the correction changes exactly the 5 known files and reproduces the corrected CF-03/CF-04 baseline.
6. Do NOT relaunch or redo the previous Trader Manager correction lanes. Reuse them as completed predecessor evidence.

The final Batch 007 patch will therefore include the retained correction plus all new functional work, creating one coherent #483 candidate lineage.

## Functional domains — ALL REQUIRED

### CF-01 Financial World Monitoring
Typed intake/monitoring state over authorized canonical evidence. Identify material change, anomaly, contradiction, regime shift, stale evidence and evidence gaps. No invented market facts and no hidden polling/network code.

### CF-02 Market Intelligence Mesh
Provider-neutral specialist faculty inputs/results for Equity, Fixed Income/Rates, FX, Futures, Options, Volatility, Commodities, Synthetic/Cross-Asset, Macro/Regime and Liquidity/Microstructure. Specialists may observe/reason/opine; no authority laundering.

### CF-03 CIBO Trader Director / Trader Manager
Reuse corrected #479/#480 foundation. Exact VT/version/config binding, DEMO eligibility, select/reduce/suspend/block, correlation/concentration evidence, fail closed.

### CF-04 Trader Development Director / Trader Academy
Reuse corrected development review and add functional academy/curriculum/experiment-request seams as needed. Loop:
`OBSERVE -> DIAGNOSE -> HYPOTHESIS -> DESIGN EXPERIMENT -> TRADER LAB -> MEASURE -> ACCEPT/REJECT LESSON -> NEW EXACT VERSION -> REQUALIFY`.
No silent mutation/self-promotion.

### CF-05 Opportunity / Profit Search
Typed opportunity hypotheses/search results across certified markets/Traders/regimes/cross-asset evidence. Distinguish hypothesis, evidence sufficiency, validation state and recommendation. `IDEA != EDGE`.

### CF-06 Portfolio / Allocation Intelligence
Evidence-bound portfolio participation/allocation recommendations over diversification, exposure, correlation/dependence, concentration, regime fit, Trader overlap and risk/capital efficiency. Recommendation only; Risk remains authority.

### CF-07 Economic / Profitability Intelligence
Typed economic assessment using exact evidence when available: gross/net PnL, expectancy, drawdown, costs/spread/slippage/carry, risk-adjusted metrics only when justified, Trader/version/instrument/regime/CIBO attribution. Explicit `INSUFFICIENT_EVIDENCE`.

### CF-08 Profit / Trade Outcome Journal
Functional immutable outcome-record contract containing exact Trader/version/config, instrument/market/regime, originating decision/signal refs, CIBO mode/action, Risk decision ref, DEMO fill/reconciliation refs, evidenced economics, stop/target lifecycle, MFE/MAE/exposure where supported. Persistence belongs to Cognitive memory architecture; this batch owns functional record semantics, not a duplicate memory store.

### CF-09 Stop-Loss / Failure Intelligence
Evidence-bound loss/stop diagnosis classifications including risk containment, entry quality, noise, regime change, volatility expansion, late signal, lifecycle mismatch, instrument mismatch, stop methodology, concentration/correlation, execution/cost degradation and `INSUFFICIENT_EVIDENCE`. Output research hypothesis, never auto-parameter mutation.

### CF-10 Quantitative Intelligence
Typed request/result orchestration for deterministic math/stat tools: probability/statistics, time series, distributions, dependence/correlation, portfolio math, option/volatility analytics, Monte Carlo/bootstrap, hypothesis tests, regime/anomaly, robustness/overfit/cost analysis. No hidden RNG/provider/model and no prose substitution for exact computation.

### CF-11 Research Director / Scientific Experimentation
Typed research question, hypothesis, data requirement, experiment plan, stage request/result lineage following:
`OBSERVATION -> HYPOTHESIS -> FORMALIZATION -> DATA -> EXPERIMENT -> REPLAY/BACKTEST -> ADVERSARIAL -> OOS -> STRESS -> MONTE CARLO -> ECONOMIC -> TRADER LAB -> DEMO`.
No research self-promotion.

### CF-12 Risk-Aware Executive Recommendation
Typed composition of functional recommendation + explicit Risk evidence/context. CIBO can recommend/abstain/escalate; cannot create Risk decision or bypass Risk.

### CF-13 Core / Operational Health Awareness
Typed QORE health snapshot/assessment over capability availability/degradation, stale/missing inputs, reconciliation gaps, evidence-pipeline health and blockers. May escalate/request work, not silently repair certified code/config.

### CF-14 Executive Planner / QORE Direction
Typed CEO objective -> goals/subgoals/dependencies/work/research requests/priorities/replan evidence. Functional planning outputs consume Cognitive planning substrate later; no direct code/config/governance mutation.

### CF-15 CEO Dialogue / Voice
Reuse existing CIBO executive dialogue semantics where fit. Functional dialogue result can explain, ask, doubt, compare, opine and state unknowns. Free-form dialogue never grants command/execution authority.

### CF-16 Trader Voice / Council Interaction
Reuse #475 semantics where present. Consume governed Trader observations/reasoning/opinions; CIBO may agree/disagree/challenge/request evidence/route to research. `TRADER VOICE != FORMAL SIGNAL`.

### CF-17 Executive / Decision Journal
Functional immutable decision-episode record with world/Core state refs, hypotheses/alternatives, uncertainty, consulted specialists/Traders, evidence refs, recommendation/decision, expected result, risk assumptions, later actual result, counterfactual and lessons. Do not duplicate Cognitive persistence.

### CF-18 CIBO Self-Evaluation / A-B Contribution
Exact fair A/B contract:
- `TRADERS_RISK_ONLY`
- `CIBO_MANAGED_TRADERS_RISK`
Same exact Trader versions/configs/comparable evidence windows. Assess contribution to net PnL/expectancy, drawdown, selection, concentration, degradation response, risk/capital efficiency and discipline when evidence is sufficient. No hindsight substitution/cherry-picking.

### CF-19 Learning from Governed Experience
Typed accepted/rejected lesson result from validated outcomes, with provenance/confidence/evidence and explicit applicability. It may feed Cognitive memory later but cannot silently rewrite CIBO or Trader code/config.

### CF-20 Functional Coordination
Implement one coherent functional coordinator/faculty bus seam so Markets/Traders/Portfolio/Economics/Quant/Research/Core Health/Dialogue do not become isolated pseudo-CIBOs. Preserve disagreements and exact evidence/attribution. Coordinator emits typed recommendations/requests/abstentions only.

## Six-lane execution

Use six logical lanes with durable checkpoints and semantic LSP before/after.

### Lane 1 — Markets + opportunity
Own CF-01, CF-02, CF-05. Map existing UMI/market evidence contracts before adding new types. Implement specialist mesh + monitoring/opportunity semantics and adversarial evidence/freshness tests.

### Lane 2 — Traders + Academy + Trader Voice
Own CF-03, CF-04, CF-16. First restore the exact predecessor correction. Reuse existing #479/#475/#473 seams. Add academy/curriculum/experiment request integration without duplicating Trader Lab.

### Lane 3 — Portfolio + economics + journals + failure + self-evaluation + learning
Own CF-06, CF-07, CF-08, CF-09, CF-17, CF-18, CF-19. Reuse #472 economic evidence where semantically exact. No invented economics or persistence.

### Lane 4 — Quant + research + Risk-aware recommendation
Own CF-10, CF-11, CF-12. Reuse deterministic Research/Replay/OOS/robustness and Risk/Policy boundaries. No hidden RNG or Risk authority.

### Lane 5 — Core health + executive direction + CEO voice
Own CF-13, CF-14, CF-15. Reuse existing CIBO module/dialogue and operational supervision evidence. No silent code/config mutation.

### Lane 6 — Functional coordinator + integration/adversarial/docs/QG
Own CF-20 and cross-domain integration. Prove one CIBO functional system, not 20 disconnected mini-systems. Audit every CF-01..CF-20 row and all authority boundaries. Run post-stabilization LSP, focused + full tests, docs and diff audit.

## Mandatory semantic LSP

Before implementation, use hover/findReferences/goToDefinition/goToImplementation where supported on relevant existing symbols, including at minimum:

- CIBO module/contracts and executive dialogue;
- `CiboTraderManager`, `CiboManagementDecision`, `CiboDevelopmentReview`, capability profile/evidence types;
- Trader Voice contracts from #475 where present;
- Research evaluator/run/replay/OOS/robustness/Monte-Carlo evidence lineages;
- economic evidence / reconciliation / DEMO evidence from #472 where present;
- Risk/Policy recommendation/decision boundaries;
- operational supervision/health evidence;
- UMI/economic identity and market evidence types relevant to functional monitoring.

Grep-only discovery is insufficient.

## Cross-cutting invariants

- provider-neutral Core contracts; no model/provider SDK leakage;
- `@dataclass(frozen=True, slots=True)` where value contracts apply;
- Result/Success/Failure and typed errors at trust boundaries;
- exact runtime types where required; `bool != int`; no subclass laundering;
- timezone-aware explicit timestamps; no hidden now/today/uuid4;
- deterministic ordering/canonicalization and logical values;
- recursive revalidation where nested material crosses a trust boundary;
- sanitized refs/metadata; no secrets in repr/logical_values/evidence;
- no hidden retry/sleep/scheduler/thread/global RNG/global mutable state;
- no automatic corrective trading;
- no Production, real capital, productive credentials, deposits/withdrawals;
- no provider-native order construction;
- no Risk bypass;
- uncertainty/missing evidence -> fail closed or `INSUFFICIENT_EVIDENCE`;
- CIBO opinion/dialogue/reasoning != formal action authority;
- Trader opinion/voice != formal signal;
- functional journal semantics != Cognitive persistence implementation;
- Functional layer may consume #482 interfaces later but MUST NOT recreate Cognitive Kernel/Memory/Council/Reasoning modes here.

## Required adversarial matrix

At minimum prove:

1. wrong Trader/version/config/evidence binding fails closed;
2. stale/missing/contradictory evidence cannot become opportunity/portfolio/trader/economic certainty;
3. fabricated PnL/metric without evidence is rejected;
4. unsupported specialist opinion cannot become formal signal/order;
5. functional coordinator cannot convert dialogue/opinion into execution authority;
6. Risk-aware recommendation cannot become Risk decision;
7. research hypothesis cannot become DEMO_ELIGIBLE;
8. Academy cannot silently mutate certified Trader version;
9. A/B mismatched versions/windows rejected;
10. self-evaluation cannot cherry-pick/retroactively substitute Traders;
11. stop/failure classification supports `INSUFFICIENT_EVIDENCE` and no post-hoc certainty;
12. quant request contains no hidden provider/RNG/retry-to-pass behavior;
13. Core-health degradation does not trigger hidden corrective trading or code mutation;
14. CEO dialogue cannot grant provider/order authority;
15. journal records cannot invent absent fills/PnL/MFE/MAE;
16. functional output has exact provenance/evidence/freshness where semantically required;
17. repeated identical input yields deterministic equal result/logical material;
18. malformed nested types return typed Failure rather than raw AttributeError/TypeError;
19. no secrets leak through logical_values/repr/evidence refs;
20. every CF-01..CF-20 has executable test coverage and is represented in the integration matrix.

## Functional coverage ledger

Create/update `docs/architecture/QORE-CIBO-FUNCTIONAL-EXECUTIVE-SYSTEM-001.md` with a table for CF-01..CF-20 containing:

- owned contract/module;
- reused authoritative dependency;
- inputs;
- outputs;
- authority level;
- evidence/freshness requirements;
- implementation status;
- tests;
- current external dependency/blocker if any.

No row may be silently omitted. `EVIDENCE_DEPENDENT_SEAM` is acceptable only when an external certified producer genuinely does not yet exist; the typed seam and fail-closed tests must still exist.

## Integration acceptance

Candidate is not ready unless:

- corrected CF-03/CF-04 predecessor patch is exactly present;
- CF-01..CF-20 ledger is complete;
- every CF domain has concrete executable source semantics/tests, or a concrete fail-closed evidence-dependent seam where operational evidence is externally unavailable;
- one integration test demonstrates a coherent path such as:
  `authorized evidence -> monitoring/specialists -> hypothesis/opportunity -> research/risk-aware/trader/portfolio functional reasoning -> typed recommendation/abstention -> journal/self-evaluation material`,
  while proving no direct execution authority;
- no Cognitive Batch 006 code is duplicated;
- no Trader Lab implementation is duplicated;
- no Production/real-capital authority is introduced.

## Quality gate

Run repeatedly while stabilizing, then canonical FULL QG:

`ruff check .`

`mypy src tests`

`pytest --cov=src/qore --cov-report=term-missing`

Also `git diff --check` and focused CIBO functional suites.

No weakening tests, skips/xfail, hidden `type: ignore`, lint suppression or coverage gaming.

## Durable memory / interruption law

Use append-only durable checkpoints. Every checkpoint must record:

- PHASE;
- exact START/TREE and correction patch hash;
- lanes completed/pending;
- findings/decisions/evidence;
- changed files/tests;
- CF coverage rows completed/pending;
- what remains;
- exact pending next action;
- SAFE RESUME instruction.

Completed lane != rerun after interruption. A pending lane does not invalidate completed lanes. Preserve candidate patch after every coherent implementation increment.

When complete emit literally:

`## RESUME STATE`
`COMPLETE`

and:

`CANDIDATE_READY_FOR_EXTERNAL_QG`

## Final verdict requirement

Harness must state whether the complete CF-01..CF-20 functional foundation is candidate-ready, list any genuinely external evidence-dependent seams, and provide a root-family exhaustion argument that no known authority-laundering path remains in the changed functional family.
