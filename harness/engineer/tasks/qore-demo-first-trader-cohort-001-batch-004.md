# QORE DEMO FIRST TRADER COHORT — BATCH 004

## PURPOSE
Occupy the third parallel Harness engineering lane with the highest-priority non-overlapping DEMO work: specialized Traders. This package follows the integrated 31/31 Trader inventory from qore-core PR #478 and MUST NOT rerun Batch 003 inventory lanes.

## IMMUTABLE BINDING
- qore-core START: `9672c4d999bd5d3e6db544f349243bc6abea0363`
- START TREE: `67c77fbe016b6688e5114165a5a14c3026832027`
- Parent program: #469
- Active Trader stream: #470
- Canonical catalog/inventory evidence: #477 / merged PR #478
- Trader Lab: #473
- CIBO Cognitive: #482
- CIBO Functions: #483

## CONTINUITY / DO NOT REPEAT
Batch 003 inventory is durable integrated evidence and MUST NOT be rerun. It established:
- 31/31 catalog inventory;
- all traders require individual Trader Lab admission;
- first DEMO target: VT-01, VT-08, VT-09, VT-17, VT-31, with fewer admitted if fewer qualify;
- VT-30 supporting infrastructure exists but concrete evaluator remains absent;
- the next implementation delta is shared reusable Trader primitives followed by bounded cohort evaluators only where methodology evidence is sufficient.

This package does NOT modify CIBO Cognitive, CIBO Functions, or Trader Lab implementation paths because those workstreams have independent candidates/reviews in flight.

## PRIMARY OBJECTIVE
Build the smallest reusable, deterministic, provider-neutral Trader implementation foundation needed to make the first DEMO cohort individually implementable and Lab-qualifiable without inventing methodology rules.

Target cohort identities from integrated #478:
- VT-01 NY Precision Core
- VT-08 CRT 4H AMD
- VT-09 Turtle Soup
- VT-17 QT Scalper
- VT-31 Silver Bullet

No Trader is presumed profitable. No Trader receives execution authority.

## HARD METHODOLOGY LAW
`CEO-SUPPLIED METHODOLOGY != IMPLEMENTED TRADER`
`IMPLEMENTED TRADER != TRADER LAB PASS`
`TRADER LAB PASS != PROFITABILITY`
`DEMO_ELIGIBLE != DEMO_PROFITABLE`
`TRADER SIGNAL != ORDER AUTHORITY`
`TRADER VOICE != FORMAL SIGNAL`

Do not invent qualitative rules. Every unresolved methodology element must be classified explicitly as one of:
- DETERMINISTIC_NOW
- REQUIRES_FORMALIZATION
- REQUIRES_EXTERNAL_DATA
- REQUIRES_PROVIDER_CAPABILITY
- REQUIRES_RESEARCH_VALIDATION
- INSUFFICIENT_EVIDENCE

If an evaluator cannot be faithfully implemented from authoritative evidence, preserve the shared foundation and mark that evaluator MATERIAL_BLOCKED with exact missing evidence instead of guessing.

## REQUIRED SHARED FOUNDATION
Within the Trader module family, implement/reuse as applicable:
1. exact versioned Trader identity/methodology/config fingerprint contracts;
2. immutable deterministic Trader state and explicit action/side semantics;
3. exact evidence/lookback binding and closed-bar-only evaluation law;
4. deterministic position lifecycle metadata sufficient for entry/invalidation/exit/time-expiry representation without placing orders;
5. provider-neutral OHLC liquidity primitives needed across the cohort where authoritative semantics are sufficient (e.g. pivots/sweeps/FVG/session extrema), with no lookahead;
6. deterministic opportunity-density accounting contract for the fast-DEMO suitability gate, not profitability inference;
7. explicit hooks/contracts to consume existing market-clock/session semantics rather than reimplement DST/time authority;
8. exact runtime type enforcement, bool-vs-int rejection, recursive retained-material revalidation, deterministic ordering and canonical fingerprints.

## COHORT IMPLEMENTATION RULE
For each VT-01/08/09/17/31:
- locate authoritative methodology evidence before code;
- map required fields/dependencies;
- reuse shared primitives;
- implement only deterministically specified rules;
- make insufficiency explicit and fail closed;
- no forced trade;
- no hidden current clock/RNG/global mutable state;
- no post-hoc frequency optimization;
- no provider-native identity or execution authority.

Where a bounded holding horizon is part of the authoritative methodology, encode it exactly. Do not silently impose a generic horizon on a Trader whose methodology record says otherwise.

## SIX LANES
1. Repository + authoritative methodology seam map using LSP; prove no equivalent implementation exists and identify reusable VirtualTrader/research/market-clock seams.
2. Shared exact identity/config/state/action/evidence contracts + deterministic lifecycle foundation.
3. Shared closed-OHLC/session/liquidity/opportunity-density primitives with adversarial no-lookahead semantics.
4. Five-Trader methodology normalization matrix and concrete evaluator implementation only for DETERMINISTIC_NOW portions; exact MATERIAL_BLOCKED evidence for unresolved portions.
5. Adversarial/metamorphic testing: same input/config/state => same output/state; reordered/duplicate/future evidence; insufficient lookback; flat/ambiguous market; exact boundaries; bool/int/subclass laundering; config/state mismatch; no hidden perpetual position; no forced trade.
6. Integration/root-family exhaustion + LSP-after + architecture document + focused validation + canonical FULL QG readiness.

## NON-OVERLAP BOUNDARY
Do not modify:
- `src/qore/modules/cibo/**`
- `src/qore/infrastructure/cibo_*`
- Trader Lab implementation files
- Risk/Policy/Execution/provider adapters
- Production configuration/secrets

Read/reference those seams as needed, but this candidate owns only Trader-module implementation and its tests/docs.

## SAFETY
No Production accounts, credentials, real capital, real-money orders, deposits/withdrawals, autonomous custody or Risk bypass. No OrderIntent placement. No provider execution.

## QUALITY
No test weakening, suppressions, unjustified skip/xfail, defect-hiding ignore, linter silencing or coverage gaming.

Harness must use semantic LSP before/after, focused and adversarial tests, diff audit and Root-Family Exhaustion. Host candidate gate must run:
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`
- `git diff --check`

## OUTPUT
Artifact-only candidate. No commit/push/merge. Return durable six-lane checkpoints and exact MATERIAL_BLOCKED evidence where authoritative methodology is insufficient. Do not dispatch Expert from Harness.
