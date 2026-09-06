# QORE HARNESS ENGINEER — DEMO PROFITABILITY EVIDENCE / PNL ATTRIBUTION / A-B ANALYTICS

## PACKAGE

`HARNESS-ENGINEER-QORE-DEMO-PROFITABILITY-EVIDENCE-001`

## LIVE BINDING

- qore-core START: `1e08a355f4109f016ca47bc4b8957b92a1ae7948`
- qore-core TREE: `5b37d0750ca163665135f9c075b4d7c44a43be8e`
- Parent economic program: qore-core Issue #469
- Profitability evidence contract: qore-core Issue #472
- Execution/fill predecessor contract: qore-core Issue #471
- Trader cohort: qore-core Issue #493
- Risk authority: qore-core Issue #495
- CIBO adaptive cognition/attribution policy: qore-core Issue #492

GitHub live is the final source of truth. This candidate remains bound to the exact START/TREE above; do not silently rebase during this run.

## ROLE / EXECUTION MODE

You are Harness Engineer under the independent audit-repair policy.

- Artifact-only: NO push, NO commit, NO merge to qore-core.
- Produce one bounded candidate patch + metadata + evidence + durable checkpoints.
- Use exactly 6 non-duplicative lanes.
- Semantic LSP is mandatory before/after material implementation: definitions, references, implementations where applicable, hover/types, call sites, modified symbols, final recheck.
- Reasoning HIGH generally; use MAX for economic identity/attribution contradictions, chronology/lookahead, duplicate fill accounting, cost double-counting, A/B fairness, statistical insufficiency, and root-family closure.
- Reuse QORE's existing research/economic/PnL/equity/drawdown/statistics foundations. DO NOT build a second DEMO-only PnL engine.
- Run unchanged FULL QG before claiming ready.

## OBJECTIVE

Implement the economic evidence composition required by #472:

`DEMO INTENT/DECISION -> REAL PROVIDER FILL OBSERVATION -> RECONCILIATION -> NET ECONOMIC RESULT -> EQUITY/DRAWDOWN -> TRADER ATTRIBUTION -> CIBO/RISK ATTRIBUTION -> A/B ANALYTICS -> PROFITABILITY DISPOSITION EVIDENCE`

The implementation must remain provider-neutral above adapter/evidence boundaries and must consume real provider evidence when available without inventing missing costs or marks.

## NON-NEGOTIABLE ECONOMIC LAWS

- Fill evidence != profit by itself.
- Gross PnL != net PnL.
- Missing cost evidence must stay missing/qualified; never silently assume zero when that changes the economic claim.
- Spread/slippage must not be double counted when already expressed by actual requested/executed price differences.
- Duplicate fill/event evidence must not be counted twice.
- Partial fills must compose exactly once.
- Unrealized PnL may be included only from trustworthy valuation/account evidence with exact provenance.
- Same Trader version/config must be used in Benchmark A and B.
- No hindsight reassignment of trades or benchmark mode.
- No post-result threshold mutation without new experiment/version identity.
- Weak samples -> `INSUFFICIENT_EVIDENCE`, not optimistic profitability.
- CIBO/Risk attribution must not rewrite Trader economic facts.
- No Production/live-capital authority is created by positive DEMO PnL.

## PHASE A — RECONSTRUCT / REUSE EXISTING ECONOMIC FOUNDATIONS

Use LSP and repository inspection to locate/reuse at minimum where semantically applicable:

- `ResearchExecutionIntentEvidence`;
- `ResearchFillEvidence`;
- existing gross/net economic-result contracts;
- existing return observations;
- realized equity path / drawdown contracts;
- performance/statistics contracts;
- exact source/run/config/evaluator provenance primitives;
- portfolio/account valuation observations;
- reconciliation evidence;
- Trader identity/version/configuration evidence;
- CIBO management decision/journal/evidence identities;
- Risk authorization/rejection evidence;
- existing experiment/OOS/replay/lineage identity primitives;
- immutable/canonical evidence/fingerprint utilities.

Do not duplicate canonical money, PnL, drawdown, return, or performance-statistics models unless a verified semantic gap requires a minimal extension.

## PHASE B — ECONOMIC EVENT / ATTRIBUTION BINDING

Every economically material observation must bind, as applicable, to:

- exact Trader ID/version/config fingerprint;
- exact methodology/candidate identity if present;
- exact CIBO management mode/action identity or explicit no-CIBO management state;
- benchmark arm identity;
- exact Risk authorization/rejection/reduction identity;
- exact provider/account DEMO identity in sanitized form;
- instrument;
- originating decision/intent;
- provider order/receipt/fill identity;
- reconciliation identity/status;
- quantity/notional;
- fill price(s);
- valuation/source timestamps;
- cost/charge provenance;
- experiment/run identity;
- evidence version/fingerprint.

Mismatched Trader/version/config, benchmark mode, provider fill, Risk receipt, account, instrument, chronology, or experiment identity must fail closed.

## PHASE C — FILL TO ECONOMIC RESULT

Compose reconciled provider fill evidence into QORE's existing economic-result foundation.

Support as evidence permits:

- realized gross PnL;
- realized net PnL;
- requested-vs-filled execution degradation;
- spread/slippage effects through actual prices without double counting;
- commissions/fees;
- financing/funding/carry when provider evidence exists;
- multi-fill/partial-fill aggregation;
- closed lifecycle economic result;
- deterministic currency/unit handling using existing canonical money/currency contracts.

Do not fabricate conversion rates, fees, spread, carry, or mark values.

If a result cannot be economically closed because required evidence is missing, represent insufficiency explicitly rather than guessing.

## PHASE D — EQUITY / DRAWDOWN / PORTFOLIO PATH

Reuse existing account/portfolio/economic evidence to build a reproducible economic path.

Retain as evidence permits:

- balance evolution;
- realized equity path;
- unrealized equity only with trustworthy exact valuation/account source;
- drawdown path and realized max drawdown;
- exposure and concentration observations;
- per-Trader contribution;
- per-instrument contribution;
- CIBO-management contribution;
- Risk intervention contribution/counterfactual ledger references where available.

Chronology must be explicit. Reordered, duplicate, future, or stale observations must not silently alter the path.

## PHASE E — TRADER ATTRIBUTION

Provide exact-version attribution for the first cohort and future extensibility.

Required outputs/queries/evidence should support, where data permits:

- net PnL by Trader version/config;
- trade count / closed outcomes;
- expectancy per closed trade;
- profit factor;
- win/loss distribution;
- drawdown contribution;
- turnover/cost drag;
- performance by instrument;
- performance by regime only if regime evidence is contemporaneous/certified;
- sample size / observation horizon;
- abstention/opportunity context only when exact evidence exists.

No pooling across materially different Trader versions/configs under one label.

## PHASE F — RISK ATTRIBUTION

Integrate the Risk evidence family so DEMO can measure Risk value rather than merely enforce it.

Support, where exact outcomes permit:

- rejection frequency/reasons;
- quantity reductions;
- prevented policy breaches;
- avoided losers;
- rejected winners;
- opportunity cost;
- drawdown reduction attributable to Risk;
- over-conservative/false interventions where objectively measurable;
- relation to exact policy snapshot/version.

Counterfactual attribution must be explicitly labeled and must never be presented as actual realized PnL.

## PHASE G — CIBO ATTRIBUTION

Measure CIBO as a manager, not as an execution authority.

Retain exact CIBO management actions/decisions and their evidence so Benchmark B can attribute, as data permits:

- Trader selection/reduction/suspension effects;
- regime-fit management effects;
- concentration changes;
- avoided/foregone opportunities;
- incremental net PnL/risk-adjusted result relative to comparable Benchmark A evidence;
- cognitive/model routing cost/latency evidence where #492 provides it;
- false/neutral interventions;
- unresolved/insufficient attribution when causality cannot be supported.

Do not assign all Benchmark B PnL to CIBO. Preserve Trader/Risk/execution contributions separately.

## PHASE H — MANDATORY A/B BENCHMARK

Implement exact experiment identity for:

- `TRADERS_RISK_ONLY`
- `CIBO_MANAGED_TRADERS_RISK`

A/B fairness invariants:

- same exact eligible Trader versions/configurations;
- same initial capital/risk envelope when comparison requires it;
- same instruments/universe;
- same market-evidence policy;
- same observation horizon / predeclared comparison policy;
- same cost accounting policy;
- same Risk rules/policy snapshots;
- no retrospective Trader substitution;
- no cherry-picked intervals;
- no hindsight benchmark relabeling;
- any material deviation must create explicit evidence and invalidate naive comparison.

The architecture may support parallel or sequential experimental collection, but comparability claims must be evidence-based and versioned.

## PHASE I — ANALYTICS

Produce evidence-backed analytics only when sample semantics justify them.

Target metrics include:

- net PnL;
- expectancy per closed trade;
- profit factor;
- win/loss distribution;
- average win/loss;
- realized max drawdown;
- downside deviation where semantically supported;
- Sharpe/Sortino only with explicit sampling assumptions and sufficient data;
- MAE/MFE where exact path evidence exists;
- turnover;
- cost drag;
- exposure/concentration;
- performance by Trader/instrument/regime;
- Risk rejection/reduction distributions;
- execution/slippage degradation;
- sample size and observation horizon;
- no-trade/abstention quality only where the necessary counterfactual evidence is valid.

Do not force every metric to exist. Missing/insufficient evidence must be explicit.

## PHASE J — PROFITABILITY DISPOSITION

Support exactly these evidence-bounded program states from #469/#472:

- `INSUFFICIENT_EVIDENCE`
- `NO_REPRODUCIBLE_EDGE_OBSERVED`
- `TRADER_EDGE_OBSERVED_CIBO_VALUE_UNPROVEN`
- `TRADER_EDGE_AND_CIBO_VALUE_OBSERVED`

Threshold/evaluation policy must be explicit, versioned, and frozen before observing the target outcome when used as a promotion/economic decision gate.

No single profitable day/week or small trade sample may establish reproducible edge.

No DEMO disposition grants LIVE/Production authority.

## EXACT SIX LANES

Use exactly these six non-duplicative lanes:

1. **Architecture / economic contracts / LSP reuse** — map existing PnL, fill, money, equity/drawdown, statistics, experiment, Trader/CIBO/Risk evidence; identify minimal gaps only.
2. **Fill -> net economic result integrity** — partial fills, duplicates, costs, commissions, slippage, currency/unit semantics, chronology.
3. **Portfolio/equity/drawdown + Trader attribution** — exact version/config attribution, instrument/regime/sample semantics, no pooling laundering.
4. **Risk + CIBO attribution** — rejected/avoided/opportunity-cost evidence, management attribution, causal limitations, no authority/economic-fact laundering.
5. **A/B experiment/fairness/statistics** — benchmark identity, same versions/rules/evidence policy, insufficient-sample behavior, no hindsight/cherry-picking.
6. **Integration / adversarial regression / LSP final / FULL QG** — references/call-sites, property/metamorphic tests, closure argument, repository-wide QG.

## ADVERSARIAL ROOT FAMILIES

At minimum falsify:

- duplicate fill counted twice;
- incremental vs cumulative partial fill confusion;
- wrong Trader/version/config attribution;
- wrong benchmark arm attribution;
- mismatched Risk authorization;
- CIBO action after the fact relabeled as contemporaneous;
- chronology/lookahead violation;
- missing cost silently treated as zero in a profitability claim;
- spread/slippage/fee double counting;
- currency mismatch / invalid conversion evidence;
- non-finite/negative-impossible economic values where prohibited;
- reordered provider events;
- unbalanced/open lifecycle incorrectly treated as realized closed PnL;
- stale valuation used as current equity;
- unequal A/B cohorts;
- changed Risk rules between A/B arms;
- hidden parameter/config change;
- cherry-picked window;
- hindsight regime relabeling;
- statistically weak sample promoted to edge;
- counterfactual Risk result presented as realized result;
- CIBO contribution overstated without comparable evidence;
- DEMO profitability laundering into LIVE/Production authority.

## DURABLE CHECKPOINT LAW

Persist throughout:

- PHASE;
- exact START/TREE;
- lane statuses 1..6;
- findings/severity;
- architecture/reuse decisions;
- LSP evidence;
- changed files;
- focused/adversarial test results;
- statistical/economic assumptions;
- unresolved evidence limitations;
- exact next action;
- safe resume instructions.

Completed lanes are never discarded or restarted solely because of timeout/quota/transport interruption.

## FULL QUALITY GATE

Mandatory unchanged:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

No test weakening, unjustified skip/xfail, type-ignore concealment, lint suppression, coverage gaming, or strictness reduction.

## DELIVERABLE

Artifact-only candidate with:

- patch;
- metadata/exact baseline binding;
- changed-file manifest;
- 6/6 lane evidence;
- semantic LSP before/after evidence;
- focused/adversarial test evidence;
- FULL QG evidence;
- durable checkpoints;
- explicit economic/statistical assumptions;
- root-family closure argument.

## READY STANDARD

Return `CANDIDATE READY — DEMO ECONOMIC EVIDENCE / PNL / ATTRIBUTION / A-B FAMILY CLOSED` only if the implementation family is semantically closed and FULL QG passes.

The package can be implementation-ready before real provider fills exist, but no actual profitability conclusion may be emitted until sufficient real DEMO evidence is accumulated through the certified path.

## NON-CLAIMS

This package does not authorize:

- LIVE/Production;
- real capital;
- withdrawals/custody;
- fabricated provider fills or costs;
- profitability from insufficient evidence;
- CIBO/Risk economic credit without evidence;
- automatic transition to LIVE readiness.