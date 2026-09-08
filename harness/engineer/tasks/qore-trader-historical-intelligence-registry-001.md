# HARNESS ENGINEER — QORE TRADER HISTORICAL INTELLIGENCE REGISTRY 001

## Package intent

Build the durable longitudinal memory of every QORE Trader without restarting or duplicating the already implemented Trader Lab / CIBO capability work.

Target repository: `mezas3238-hue/qore-core`
Target candidate binding:
- expected START: `c283c9d793ca04b7477d32f5cd0969de9a304195`
- expected TREE: `6d9a3728ddfbc2161171af1315c59ff1f0adf3d6`
- active PR: `#500`

GitHub is the single source of truth. Re-verify the exact bound candidate before analysis. This package is **artifact-only**: do not push, commit, merge, alter PR state, trigger Production/LIVE, or mutate real capital/account authority.

## Executive objective

Implement a provider-neutral, deterministic, append-only **Trader Historical Intelligence Registry** that preserves the complete technical/scientific biography of each exact Trader version and derives current capability views from certified historical evidence.

This is not another one-off report and must not replace existing `CiboTraderCapabilityProfile`, Trader Lab evidence, dossiers, Risk evidence, or CIBO review. It must compose them.

Canonical law:

`TRADER HISTORY IS APPEND-ONLY`

`CURRENT CAPABILITY = PROJECTION OF CERTIFIED HISTORICAL EVIDENCE`

`HYPOTHESIS != OBSERVATION != CERTIFIED FACT`

`NEW TRADER VERSION != MUTATION OF OLD HISTORY`

`INSUFFICIENT SAMPLE != POSITIVE EVIDENCE`

`FAILED GATE != END OF RESEARCH`

## Existing foundations to reuse, not rebuild

Inspect and reuse where semantically exact:
- `src/qore/infrastructure/cibo_trader_capability_profile.py`
- `src/qore/infrastructure/cibo_trader_development_review.py`
- `src/qore/infrastructure/cibo_trader_manager.py`
- `src/qore/infrastructure/trader_lab/**`
- existing Research/Replay/Fast-Forward/OOS/Stress/Monte-Carlo/Economic/Risk evidence identities and lineage/fingerprint contracts
- first-cohort research dossiers, characterization, failure analysis, hypotheses and holdout governance
- `ResearchDecisionEvaluatorIdentity`
- existing evidence refs / exact SHA/config identities where semantically exact

Do not create parallel definitions when canonical types already exist.

## Functional contract

### 1. Longitudinal Trader identity and version history

Represent a Trader history that can contain many exact immutable Trader versions over time. Every retained study/result must bind at minimum:
- exact Trader identity/version;
- software revision/SHA where applicable;
- methodology family/version;
- exact configuration fingerprint;
- study identity/version;
- evidence/dataset/partition identity;
- market/instrument and timeframe scope;
- explicit timezone-aware timestamps;
- provenance / producer identity;
- stage/kind of study;
- evidence classification and sufficiency state.

A new code/config/methodology identity creates a new historical version; it must never overwrite or relabel evidence belonging to an older version.

### 2. Append-only study ledger

Provide immutable records for longitudinal studies, including at minimum semantic support for:
- REPLAY/BACKTEST;
- FAST_FORWARD;
- WALK_FORWARD/OOS;
- STRESS/ADVERSARIAL;
- MONTE_CARLO;
- ECONOMIC_EVALUATION;
- RISK_REVIEW;
- CIBO_REVIEW;
- INDEPENDENT_VALIDATION;
- DEMO observation/certification when evidence later exists;
- CHARACTERIZATION;
- FAILURE_ANALYSIS;
- HYPOTHESIS;
- HYPOTHESIS_FALSIFICATION / confirmation;
- RETURN_TO_LAB / remediation history.

Do not invent evidence for stages not actually completed.

Records must be reproducible, canonically ordered and immutable. Duplicate logical identities with contradictory payloads must fail closed. Exact replay of the same immutable record may be idempotent only if byte/logical content is semantically identical.

### 3. Evidence epistemic status

A central requirement is to prevent CIBO or downstream code from laundering weak observations into facts.

Model a clear typed distinction equivalent to:
- OBSERVED / DESCRIPTIVE;
- INFERRED / DIAGNOSTIC;
- HYPOTHESIS;
- FALSIFIED;
- CERTIFIED;
- INSUFFICIENT_EVIDENCE;
- STALE / SUPERSEDED where applicable without deleting historical truth.

Exact naming may follow existing repository conventions, but semantics must be explicit and fail closed.

Quantitative claims such as expectancy, profit factor, win rate, drawdown, MAE/MFE, risk-of-ruin, cost sensitivity, regime edge or market superiority may not enter a current certified projection unless backed by compatible retained evidence and sufficient-sample status.

### 4. Historical dimensions and capability intelligence

The history must be able to retain and later query/project evidence by at least:
- market/instrument;
- timeframe;
- BUY vs SELL / side where applicable;
- session/time bucket when evidence supports it;
- market regime / volatility / trend-range condition when explicitly evidenced;
- entry/setup/fill funnel;
- exit reason / stop / target / timeout where applicable;
- sample size/trade count;
- expectancy;
- win rate;
- payoff / win-loss distribution;
- profit factor;
- drawdown / tail drawdown;
- MAE/MFE;
- duration / holding profile;
- turnover / spread / slippage / cost drag;
- parameter-neighborhood robustness / fragility;
- Monte-Carlo robustness / risk-of-ruin when statistically valid;
- favorable conditions;
- weak/degraded/adverse conditions;
- abstention/reduction/suspension/return-to-Lab conditions;
- known limitations and missing evidence.

Do not require every study to populate every field. Missing evidence remains explicit missing/insufficient evidence, never zero or optimism.

### 5. Current capability projection

Implement a deterministic projection from the append-only history to a **current evidence-backed Trader capability view**.

The projection must:
- select only evidence compatible with the exact requested Trader version/config;
- preserve market/timeframe/regime specificity rather than blindly pooling incompatible evidence;
- retain contradictions rather than silently choose the favorable result;
- surface `INSUFFICIENT_EVIDENCE` for sparse samples;
- distinguish current certified knowledge from exploratory/descriptive findings;
- preserve evidence refs for every material conclusion;
- be deterministic for identical history;
- never create `DEMO_ELIGIBLE`, execution authority, Risk bypass or Production authority.

Where semantically appropriate, provide an adapter/projection seam into existing `CiboTraderCapabilityProfile` rather than replacing it. CIBO may consume the projection but must not mutate history.

### 6. Study lineage and hypothesis lifecycle

Retain a traceable chain:

`study evidence -> finding -> diagnosis -> hypothesis -> change proposal -> new Trader version -> fresh holdout -> confirmation/falsification`

Consumed OOS/holdout evidence cannot be relabeled as fresh validation for a modified Trader version. Retain which evidence/partition was consumed by which study/version.

A hypothesis is never promoted to certified capability merely because a later code change adopted it.

### 7. First cohort integration

The architecture must support VT-01..VT-31 generically, not hard-code the initial five.

Provide an integration path for current first-cohort evidence (`VT-01`, `VT-08`, `VT-09`, `VT-17`, `VT-31`) so completed Trader Lab characterization/failure-analysis/dossier outputs can be converted into historical study records **without fabricating final conclusions before the six-market program is complete**.

The current running economic test is not itself part of this Harness execution. Do not fetch live secrets, mutate cTrader, or depend on terminal run artifacts for tests. Use deterministic fixtures/examples representing the canonical schemas.

### 8. Query/read model expectations

Provide deterministic read/query capabilities sufficient to answer questions such as:
- What studies have been performed on VT-08 vX?
- In which markets has evidence been favorable, adverse or insufficient?
- Under what regimes/sessions/sides is the Trader historically strongest or weakest?
- What is the current evidence-backed expectancy/risk view, and from which evidence?
- What failures have been diagnosed and which hypotheses resulted?
- Which hypotheses were falsified/confirmed?
- How did v2 differ in evidence from v1?
- What evidence is stale, contradicted, sparse or missing?
- Which holdouts have already been consumed?

Queries must never infer unsupported rankings such as “best market” from incomparable sample sizes or incompatible study designs. A ranking/recommendation requires explicit comparability and sufficiency semantics; otherwise return insufficient/indeterminate.

## Six mandatory Harness lanes

Use exactly six non-duplicative lanes with durable checkpoints:

1. **Architecture / canonical contracts / identity** — map existing contracts, layering, exact types, version identity, append-only aggregate.
2. **Evidence lineage / epistemic status / sufficiency** — provenance, study identity, claim backing, sparse sample, contradiction, stale/superseded semantics.
3. **Trader Lab integration / dossiers / failure + hypothesis lifecycle** — conversion seams, OOS/holdout consumption, no hindsight laundering.
4. **Capability projection / CIBO integration** — deterministic current view, market/regime specificity, evidence refs, no authority widening.
5. **Adversarial/property/metamorphic validation** — replay determinism, ordering, duplicates, identity mismatch, corruption, exact runtime types, version isolation.
6. **Integration impact / reachable paths / regressions / closure** — LSP references/call sites, compatibility with VT-01..VT-31, docs, FULL QG and root-family closure.

Exactly 6/6 lane completion is required.

## Semantic LSP requirement

Use semantic LSP before and after implementation. Retain evidence for modified symbols and relevant canonical types using, as applicable:
- goToDefinition;
- findReferences;
- goToImplementation;
- hover;
- call-site review;
- final reference recheck.

Missing meaningful LSP evidence blocks candidate readiness.

## Root-family exhaustion

Reasoning HIGH generally; MAX for identity/version lineage, append-only semantics, OOS/holdout reuse, contradiction/sufficiency semantics, epistemic classification, capability projection and closure.

Do not fix only one witness. Exhaust neighboring causal classes, including:
- same study id / different payload;
- same evidence reused across versions;
- version/config mismatch laundering;
- timestamp chronology and timezone edge cases;
- duplicate/reordered ingestion;
- mutable nested payload corruption;
- bool-as-int and float-as-Decimal laundering;
- unsupported quantitative claims;
- sparse sample presented as strong evidence;
- contradictory market/regime evidence;
- stale evidence presented as current;
- hypothesis presented as observation/certification;
- consumed holdout presented as fresh;
- current projection changing past history;
- inability to reconstruct deterministic projection after replay;
- CIBO or manager accidentally gaining promotion/execution/Risk authority.

## Required adversarial tests

At minimum prove:
- append-only history cannot delete/overwrite old version evidence;
- identical idempotent replay is deterministic;
- contradictory duplicate fails closed;
- old-version evidence cannot certify new version;
- config mismatch fails closed;
- unsupported metric without evidence ref fails closed;
- insufficient sample cannot become certified favorable capability;
- contradictory evidence remains visible/indeterminate;
- OOS/holdout consumption prevents fresh-validation laundering;
- hypothesis cannot become certified fact by constructor/state transition;
- exact runtime types reject bool/int and float/Decimal laundering where applicable;
- timezone-naive timestamps fail closed;
- canonical ordering is deterministic;
- CIBO projection cannot manufacture DEMO eligibility;
- no provider-native order/execution/custody fields;
- no Production/live-capital authority;
- all 31 Trader identities can be represented without methodology switch hard-coding.

## Documentation

Add or update bounded architecture documentation describing:
- ownership boundary between Trader Lab, Trader Historical Intelligence, CIBO Capability Profile and Trader Manager;
- append-only laws;
- epistemic/sufficiency semantics;
- study/version lineage;
- current-view derivation;
- authority prohibitions.

## Quality Gate

During development focused tests are allowed. Candidate certification requires full:

```bash
ruff check .
mypy src tests
pytest --cov=src/qore --cov-report=term-missing
```

Do not weaken tests, strictness or coverage; no `type: ignore`, hidden skip/xfail, unjustified noqa, fabricated evidence, or post-hoc threshold manipulation.

## Deliverable

Artifact-only candidate containing:
- exact patch;
- changed-file list and stats;
- START/TREE binding;
- six-lane evidence;
- LSP evidence;
- normal/adversarial/property test evidence;
- FULL QG evidence;
- internal independent expert falsification result;
- root-family closure argument;
- explicit limitations/non-scope.

Terminal result must be one of:
- `CANDIDATE READY — ROOT FAMILY EXHAUSTED`
- `BLOCKED / FURTHER MATERIAL FAMILY FOUND`

No direct qore-core push/commit/merge.