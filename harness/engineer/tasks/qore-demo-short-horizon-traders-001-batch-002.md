# QORE DEMO PROFITABILITY — HARNESS ENGINEER BATCH 002

Repository: `mezas3238-hue/qore-core`
Issue: #470 — QORE-DEMO-INTELLIGENCE-SLICE-001 — short-horizon intraday Traders + CIBO Trader Manager MVP
Parent: #469
Related: #290, #471, #472, #473, #475
EXACT START: `5a158ef0fb2e21db95f2be0685373780bf1ab197`
EXACT START TREE: `5e2b37b23b01fe23fd373d39b01573e9607a73ad`
Mode: Engineer / artifact-only

## EXECUTIVE CONTEXT

This is a NEW bounded implementation batch after an executive correction of the first DEMO economic experiment.

The previous recovered candidate in qore-core PR #476 is CLOSED WITHOUT MERGE and is **not authoritative methodology**. It contained generic Trend/Momentum, Mean Reversion, and Breakout/Volatility producers. The executive determined that a first DEMO cohort without explicit short position lifecycle could accumulate economic evidence too slowly.

Do NOT treat #476 as the candidate to continue. Do NOT reconstruct its three old methodologies. You may inspect any locally available historical branch/diff only as non-authoritative evidence for provider-neutral contracts or CIBO patterns, and only reuse material that survives an explicit reuse audit against this package. Revalidate everything reused.

Harness infrastructure incident #42 is fixed and merged in reviewer main (`5d49c2fdb3283caceca5c088bb771ec521a2fe6c`). The runner now publishes/harvests durable checkpoints through a workspace-writable sandbox path. Use durable checkpoints aggressively.

## MASTER OBJECTIVE

Build the first QORE economic-intelligence cohort intentionally suited to **fast but scientifically valid DEMO evidence accumulation**:

`CANONICAL CLOSED M5 EVIDENCE -> SHORT-HORIZON SPECIALIZED TRADERS -> CIBO MANAGER -> EXISTING RISK/POLICY SEAM`

This batch does NOT place provider orders and does NOT implement cTrader execution. It produces the provider-neutral intelligence/lifecycle candidate, tests, evidence and documentation required before Trader Lab and later DEMO execution.

Fundamental laws:

`FAST DEMO != LOWER QUALITY`

`FAST DEMO = SHORT CLOSED-TRADE HORIZON + ADEQUATE OPPORTUNITY DENSITY + SAME SCIENTIFIC GATES`

`HIGH SIGNAL COUNT != EDGE`

`NO FORCED TRADES`

`NO POST-HOC FREQUENCY TUNING`

`TRADER DECISION != EXECUTION AUTHORITY`

`CIBO MANAGEMENT != RISK BYPASS`

No Production account, real capital, productive credential, deposit/withdrawal, productive order, provider-native execution authority, Risk bypass or profitability assertion.

# SIX-LANE EXECUTION CONTRACT

Run exactly six logical lanes. Prefer one native subagent per lane so research/design work is parallelized, but preserve a single coordinator and one synthesis. Each lane must write concrete durable findings as they are discovered. A lane reaching COMPLETED is carry-forward work and must never be repeated after interruption.

Before long operations, append checkpoints containing:
- package/START/TREE binding;
- lane state;
- WHAT WAS DONE;
- WHAT WAS FOUND;
- WHAT WAS CLOSED;
- WHAT REMAINS;
- evidence/symbols/files examined;
- uncertainties;
- PENDING NEXT ACTION;
- SAFE RESUME INSTRUCTION.

## Lane 1 — Architecture / reuse / semantic dependency audit

Use semantic LSP before implementation. Inspect exact live definitions/references for existing QORE research, lineage, strategy-freeze, temporal/OOS, CIBO, Risk and decision seams.

At minimum inspect and adjudicate reuse of:
- `ResearchDecisionEvaluatorProtocol`;
- `ResearchStrategyState`;
- `ResearchRunStrategyBinding` and frozen configuration manifest/content digest;
- evaluator identities/revisions;
- producer admission/replay/execution composition;
- `OhlcSnapshot` / canonical replay observation flow;
- specialist analysis boundary where applicable;
- existing CIBO supervision/governance seams;
- existing Risk/policy/OrderIntent boundary only as downstream authority boundary, never as Trader code.

Explicitly inspect whether historical PR #476 patterns for shared Trader signal identity/config fingerprint or CIBO manager can be safely reused. Do not import old methodology semantics merely for convenience.

Required finding: the new Trader runtime/configuration MUST be exactly bound to the frozen `ResearchRunStrategyBinding.manifest` schema + parameters/content, not merely software revision. A runtime-config A operating under frozen manifest B is a material provenance defect and must fail closed before producing a decision.

Confirm provider-neutral dependency direction and exact location for any new lifecycle/target-exposure contract. Do not create a parallel identity, evidence, Risk or execution universe.

## Lane 2 — Four short-horizon methodologies + deterministic position lifecycle

Design and falsify FOUR materially different deterministic intraday hypotheses over canonical closed M5 evidence.

All four must have an explicit position lifecycle and hard configuration invariant:

`1 <= max_holding_bars <= 12`

On M5 this bounds intended holding horizon to at most 60 minutes. No open lifecycle may remain unresolved beyond the frozen maximum. At the exact expiry boundary the Trader must deterministically recommend exit/flat (or semantically equivalent provider-neutral target state), unless it already exited earlier.

### Trader A — Intraday Impulse / Micro-Momentum

Purpose: capture short directional bursts, NOT long-term trend following.

Investigate the smallest falsifiable rule based only on recent closed M5 bars. Candidate concepts may include recent directional displacement/impulse, close location, sequential confirmation, or short bounded summaries, but do not blindly adopt a moving-average trend system.

Required:
- explicit entry-long / entry-short / abstain conditions;
- explicit invalidation;
- explicit exit/flat conditions;
- exact max-holding expiry;
- bounded recent lookback;
- fail closed on ambiguous/flat/insufficient evidence.

### Trader B — Pullback / Short-Horizon Mean Reversion

Purpose: exploit short local displacement toward a prior local reference.

Required:
- reference/equilibrium from legally prior evidence where methodology requires prior-only material;
- current bar must not contaminate its own prior reference;
- explicit displacement threshold;
- entry, target/reference exit, invalidation and time expiry;
- bounded local lookback;
- fail closed when reference/dispersion/range is unusable if such measures are part of the selected rule.

### Trader C — Range Rotation

Purpose: trade short bounded range rotation and be materially distinct from directional impulse and breakout.

Required:
- prior-only range qualification;
- deterministic range-quality/width rule;
- long-side thesis near lower range region and short-side thesis near upper range region under exact frozen thresholds;
- exit toward neutral/reference/target, invalidation on range failure, and time expiry;
- ABSTAIN on unstable/too-narrow/ambiguous range.

### Trader D — Volatility Compression / Breakout

Purpose: capture short volatility expansion after prior compression/range evidence.

Required:
- compression/range threshold built only from prior legally visible bars;
- current close may confirm breakout but cannot define its own threshold;
- explicit long/short confirmation;
- false-break/invalidation exit;
- explicit time expiry;
- bounded lookbacks and no lookahead.

### Shared lifecycle semantics

Independently inspect existing decision semantics. Do NOT mechanically encode trade side as `APPROVED/REJECTED/BLOCKED` if those statuses mean authorization rather than side.

Introduce/reuse the smallest provider-neutral contract necessary to express deterministic Trader intent/lifecycle, for example semantically equivalent states/actions such as:
- ENTER_LONG;
- ENTER_SHORT;
- HOLD_LONG;
- HOLD_SHORT;
- EXIT_TO_FLAT;
- ABSTAIN/NO_CHANGE.

Naming may differ if existing QORE semantics provide a better canonical shape. Preserve semantic truth.

Retain exactly:
- Trader/methodology id;
- evaluator family/schema/software revision;
- exact frozen config fingerprint/binding;
- exact evidence/lookback identity;
- current lifecycle state;
- exact entry-decision identity when in a position;
- holding-bars count;
- max-holding-bars;
- invalidation reason;
- exit reason;
- cooldown/re-entry state if methodology uses it;
- deterministic reason/evidence material.

No hidden scheduler/clock. Holding duration is derived from canonical evaluation/bar progression, not wall-clock calls.

## Lane 3 — CIBO Trader Manager + A/B + attribution

Design/reuse the deterministic CIBO Trader Manager for the revised four-Trader cohort.

CIBO management may classify/recommend states such as:
- ELIGIBLE;
- SELECTED;
- REDUCED;
- SUSPENDED;
- BLOCKED.

It must preserve exact Trader/version/config/lifecycle attribution and consume explicit provenance-backed performance/Risk evidence only when available. It cannot invent performance, infer DEMO eligibility from code quality, authorize execution or bypass Risk.

Preserve exact A/B experiment identity:
- `TRADERS_RISK_ONLY`;
- `CIBO_MANAGED_TRADERS_RISK`.

Same exact frozen Trader versions/configurations must remain comparable across A/B arms. No retrospective swapping/relabeling.

Ensure future #475 Trader Voice/Reasoning can attach advisory opinions without becoming formal authority. Voice is OUT OF SCOPE here; this manager must remain deterministic policy for this issue.

## Lane 4 — Temporal / adversarial / lifecycle / fast-DEMO testability

Design an adversarial matrix that proves short horizon does not weaken methodology quality.

Must include at minimum:
- insufficient lookback;
- exact first-valid lookback;
- flat market;
- exact threshold ties;
- duplicate/reordered/conflicting observations;
- future/lookahead injection;
- non-finite values;
- bool-vs-int laundering where exact int required;
- wrong runtime subclasses where exact types matter;
- frozen manifest vs runtime config mismatch;
- stale/ambiguous retained evidence;
- deterministic replay equivalence;
- exact entry transition;
- exact hold transition;
- invalidation exit;
- target/reference exit where defined;
- expiry at exactly `max_holding_bars`;
- prohibition on surviving beyond max holding;
- re-entry/cooldown boundaries if used;
- no forced trade under insufficient evidence;
- no hidden clock/random/global mutable/sleep/thread/retry;
- no provider/native execution authority;
- secret hygiene in reasons/evidence;
- CIBO cannot select suspended/blocked/ineligible Trader;
- deterministic CIBO tie-break and contradictory evidence fail-closed.

### Opportunity-density suitability

The fast-DEMO program has a **suitability** target, not a profitability shortcut.

Retain enough evidence for later Trader Lab to calculate qualified entry opportunity density. The initial pre-registered program target is:

`average >= 1 qualified entry opportunity per 288 M5 bars per qualified instrument`

Do NOT tune methodology parameters inside this batch to hit that number and do NOT force signals. The implementation may expose deterministic counters/evidence hooks only if that naturally belongs in the architecture; otherwise document how #473 should calculate it from retained decisions.

Failure to meet density later means `DEMO_EVIDENCE_TOO_SLOW` / experiment-unsuitable, not economic failure.

Also identify high-frequency churn/cost sensitivity as a separate risk: more signals can make net economics worse after spread/commission/slippage. Do not claim edge from signal density.

## Lane 5 — Integration / semantic LSP / exact binding / downstream seams

Use semantic LSP to trace the exact symbols consumed and new references created.

Confirm:
- additive implementation where possible;
- no unnecessary existing signature changes;
- frozen config exact binding is enforced recursively enough to prevent state/config laundering;
- deterministic state survives replay;
- no reverse dependency from Core/Domain/Governance to concrete infrastructure/provider;
- Trader outputs stop before execution authority;
- CIBO output stops before Risk authority;
- existing Risk/policy and later #471 execution can consume the provider-neutral result without bypassing boundaries;
- exact instrument/trader/experiment attribution can later flow to #472 profitability evidence.

Mandatory LSP-after: definitions, references and hover/type evidence on new lifecycle contract, all four producers, CIBO manager, and key reused research/freeze symbols.

## Lane 6 — Maintainability / docs / root-family exhaustion

Audit design for maintainability and economic experiment completeness.

Root-family exhaustion must explicitly cover:
- entry semantics;
- exit semantics;
- lifecycle expiry;
- invalidation;
- cooldown/re-entry if any;
- signal density evidence;
- churn/cost sensitivity;
- instrument attribution;
- Trader attribution;
- CIBO A/B attribution;
- future #473 capability-profile binding;
- future #475 advisory voice separation;
- future #471 DEMO execution boundary;
- future #472 fill/PnL evidence;
- Production prohibition.

Documentation must clearly state:
- all methodologies are experimental hypotheses;
- M5/short-horizon design is chosen to accelerate evidence accumulation, not to guarantee profitability;
- max holding <=12 bars is an experiment design constraint;
- opportunity density is suitability, not edge;
- code/test green is not DEMO_ELIGIBLE;
- no Production or real-capital authority.

# SYNTHESIS AND IMPLEMENTATION

After all six lanes are durable COMPLETED, synthesize once and implement the bounded candidate.

Prefer shared immutable contracts/helpers only when they remove real duplication without hiding methodology-specific semantics.

Expected files may include provider-neutral shared Trader lifecycle/signal contracts, four concrete producer modules, CIBO manager, focused tests and architecture docs. Let LSP/reuse audit determine exact placement.

## Determinism and data laws

- `@dataclass(frozen=True, slots=True)` where applicable;
- exact runtime types where required; `bool != int`;
- recursive revalidation of retained nested material where appropriate;
- immutable sanitized metadata/evidence;
- deterministic ordering/canonicalization;
- no secrets in repr/logs/evidence/logical values;
- no implicit `datetime.now()`, `date.today()`, `uuid4()` in deterministic contracts;
- no global RNG/mutable state;
- no hidden retries/sleeps/schedulers/threads;
- no provider-native identity laundering;
- no hidden execution/Risk/Production authority.

## Arithmetic

Use exact `Decimal` for financial configuration/threshold arithmetic where appropriate. Existing market snapshots may carry floats; convert only at the methodology boundary using deterministic representation such as `Decimal(str(value))` where required. Avoid float epsilon decision rules. Reject non-finite material fail closed.

# TESTS

Implement behavior tests, not constructor-only tests.

Run focused tests continuously. Add normal + adversarial coverage for all four methodologies, lifecycle, exact config binding, CIBO and A/B attribution.

No weakening, skips/xfail to hide defects, linter suppression, artificial coverage exclusion, or `type: ignore` used to hide defects.

# FULL QORE QUALITY GATE

Only after six-lane synthesis, implementation, focused tests, LSP-after and root-family exhaustion:

`ruff check .`
`mypy src tests`
`pytest --cov=src/qore --cov-report=term-missing`

If any defect is found, fix it in the same disposable workspace, rerun relevant focused tests and FULL QG.

# REQUIRED DURABLE CHECKPOINTS

At minimum append checkpoints for:
1. exact binding + LSP-before;
2. each lane completion (or checkpointed/recovery-required state);
3. six-lane synthesis;
4. implementation;
5. focused tests;
6. LSP-after;
7. FULL QG;
8. root-family exhaustion;
9. final disposition.

If interrupted, successor must continue from last valid checkpoint and must not repeat completed lanes.

# REQUIRED FINAL REPORT

Report:
- exact START/TREE;
- six lane states and durable checkpoint count;
- architecture/reuse findings;
- exact four methodologies;
- exact lifecycle semantics and max-holding proof;
- frozen-config binding proof;
- opportunity-density suitability design;
- CIBO/A-B semantics;
- LSP before/after evidence;
- changed files and diff size;
- focused and FULL QG results;
- adversarial coverage;
- valid findings/fixes made during batch;
- residual blockers for #473/#475/#471/#472;
- `RESUME STATE: COMPLETE` or exact safe next action;
- final verdict exactly one of `CANDIDATE READY`, `MATERIAL FINDING(S)`, or `VALIDATION BLOCKED`.

Artifact-only. Do not push or commit to qore-core. Produce the deterministic candidate patch and durable evidence for controlled materialization by the Integration Authority.
