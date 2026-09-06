# QORE — HARNESS ENGINEER WORK PACKAGE

## Package

`HARNESS-ENGINEER-QORE-CTRADER-DEMO-MULTI-TIMEFRAME-001`

## Authority / continuity

- qore-core live GitHub is the source of truth.
- Expected immutable START: `1e08a355f4109f016ca47bc4b8957b92a1ae7948`
- Expected TREE: `5b37d0750ca163665135f9c075b4d7c44a43be8e`
- Parent operational contract: qore-core Issue #290.
- Current delivery contract: qore-core Issue #494.
- DEMO program: qore-core Issue #469.
- Trader cohort dependency: qore-core Issue #493.
- Artifact-only: DO NOT commit, push, merge, open/modify PRs, or mutate GitHub state from the isolated workspace.
- Preserve completed prior work. Do not restart unrelated UMI/R-history investigations.

## Objective

Engineer and adversarially certify one complete cTrader DEMO native multi-timeframe closed-OHLC capability for exactly these six QORE timeframes:

1. `M1`
2. `M5`
3. `M15`
4. `M30`
5. `H1`
6. `D` (Daily)

This is a single family closure. Do not return an M5-only or intraday-only partial candidate. Daily is mandatory in this package so QORE does not need another infrastructure cycle merely to add it later.

## Current known gap

At START, `src/qore/infrastructure/ctrader_demo_market_data.py` is first-slice M5-specific: `CTraderTrendbarPeriod` admits only M5 and its interval semantics are specialized accordingly. QORE already has broader canonical timeframe semantics in `market_observation.py`. Reconcile the cTrader boundary with canonical QORE semantics without leaking provider-specific rules into Core/Domain.

## Provider/native-period contract

- Prefer/require provider-native cTrader trendbars for all six target periods in this delivery.
- Verify exact cTrader SDK/protocol period identifiers; do not guess aliases.
- The provider-native Daily identifier may differ from canonical QORE `D`; map it explicitly and immutably to QORE `D`.
- A derived/resampled bar must never masquerade as provider-native evidence.
- If a target period is not actually provider-supported by the exact admitted SDK/protocol, fail closed and report a MATERIAL BLOCKER rather than silently deriving/coercing it.

## Mandatory temporal / evidence laws

For every target timeframe:

- Admit only fully closed bars.
- At decision instant `t`, only evidence with `closed_at <= t` and valid availability/provenance is visible.
- One instant before close MUST remain unavailable as closed evidence.
- The first legal instant at/after close must be deterministic and explicitly tested.
- No partially formed higher-timeframe bar may enter lower-timeframe decisions.
- No silent backfill/revision may rewrite evidence already bound to an earlier decision/replay.
- Exact instrument/account/symbol/provider/timeframe/interval bindings; mismatch fails closed.
- Identical bound evidence + config + state replays identically.
- Snapshot/evidence identity must distinguish timeframe correctly.
- Daily must have explicit UTC/calendar-day open/close law and boundary tests; no host-local timezone dependence or implicit `datetime.now()`.
- Preserve all #290 credential/account sanitization and provider-data hardening.

## Real DEMO boundary

This package remains READ-ONLY / DEMO-only.

Allowed chain:

`cTrader DEMO native trendbar(s)`
→ sanitized immutable provider observation
→ cTrader deterministic boundary
→ `ExternalOhlcPayload`
→ canonical QORE ingestion
→ canonical OHLC evidence / snapshot

Forbidden:

- LIVE account authority
- order messages
- trading permissions
- execution
- Risk bypass
- real capital
- Production claims

## Root-family exhaustion

Treat timeframe correctness as one causal family, not six superficial enum additions. Explore at least:

- period-code mapping;
- exact seconds/duration where fixed;
- Daily calendar boundary semantics;
- interval opening/closing identity;
- availability at exact edge instants;
- native provider response period binding;
- cross-timeframe visibility / lookahead prevention;
- snapshot/provenance identity;
- malformed/mismatched provider responses;
- provider pagination/`hasMore` semantics where applicable;
- existing cTrader `deltaHigh` ambiguity hardening from #290;
- deterministic replay;
- false positives / legitimate flat bars / valid boundaries;
- regression of existing M5 behavior.

## Exactly six Harness lanes — mandatory, non-duplicative

### L1 — Architecture / contracts / canonical timeframe reconciliation
Map existing cTrader, ingestion, canonical timeframe, replay and provenance contracts. Use LSP definition/references/implementation/hover. Define the smallest correct architecture that supports all six periods without provider leakage.

### L2 — cTrader SDK/protocol native-period verification
Verify exact provider period identifiers and response bindings for M1/M5/M15/M30/H1/Daily. Resolve canonical `D` mapping explicitly. Audit existing #290 provider-risk notes and version-skew implications.

### L3 — Temporal correctness / cross-timeframe red team
Attack close/open boundaries, one-instant-before-close, exact-close visibility, lower-vs-higher timeframe synchronization, UTC rollovers, Daily boundary, stale/backfilled data, and lookahead leakage.

### L4 — Property / metamorphic / deterministic replay
Generate systematic tests across all six periods for interval identity, repeated replay, timeframe substitution/mismatch, ordering, and invariant preservation. Exhaust bounded equivalence classes where feasible.

### L5 — Historical regression / provider corruption / false positives
Re-run neighboring cTrader regression family including malformed trendbars, `deltaHigh` ambiguity, `hasMore` absence/version skew, account/symbol mismatch, flat bars, and valid M5 legacy behavior. Avoid reopening unrelated history.

### L6 — Implementation impact / integration / tests / QG
Implement the family closure, inspect all call sites/references with semantic LSP, add/update architecture docs and tests, then run FULL QG. Recheck references after edits.

All 6/6 lane outputs and their concrete evidence must be written to the durable checkpoint/artifact. Missing lane evidence is BLOCKED.

## Semantic LSP evidence — mandatory

For modified or affected symbols, record evidence of:

- goToDefinition
- findReferences
- hover
- goToImplementation where applicable
- call-site review
- post-change reference recheck

Do not claim LSP use without tool evidence.

## Minimum adversarial tests

At minimum cover:

- exact admitted set M1/M5/M15/M30/H1/D;
- exact provider-native period mapping for each;
- reject unsupported period and semantic impostors/subclasses where exact-type contracts require;
- provider response period mismatch;
- interval start/end alignment for every target;
- one instant before close unavailable;
- exact first legal visibility instant;
- Daily UTC/calendar rollover;
- lower-timeframe decision cannot see unfinished H1/D bar;
- immutable evidence/snapshot timeframe binding;
- deterministic replay across repeated identical inputs;
- no silent derived/native provenance confusion;
- malformed trendbar/provider-risk cases from #290;
- existing M5 behavior remains green;
- secret/raw account material absent from public evidence/errors/repr.

## Implementation freedom

Harness may refactor the M5-specialized implementation into a general exact-period contract if that is the root-correct fix. Do not duplicate six nearly-identical code paths when a single exact typed mapping/interval law closes the family more safely.

Do not modify unrelated trading/execution authority.

## Durable continuation requirement

Continuously write concrete findings, decisions, explored alternatives, modified symbols, test status, LSP evidence, unresolved blockers, and current patch state to the durable checkpoint. If interrupted, a successor must be able to resume from the last completed causal sub-family without restarting the investigation.

## FULL QUALITY GATE

Mandatory final certification commands:

- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No weakening tests, strictness, lint, typing, or coverage to obtain green.

## Final result vocabulary

Return exactly one high-level disposition:

- `CANDIDATE READY — M1/M5/M15/M30/H1/D ROOT FAMILY EXHAUSTED`
- `BLOCKED — FURTHER MATERIAL TIMEFRAME FAMILY FOUND`
- `BLOCKED — PROVIDER/SDK FACT PREVENTS TARGET PERIOD`

The final artifact must include patch, hashes, changed files, 6-lane evidence, LSP evidence, tests/QG evidence, remaining non-claims, and a closure argument.