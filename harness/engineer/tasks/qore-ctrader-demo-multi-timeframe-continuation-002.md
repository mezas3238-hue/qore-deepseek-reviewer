# QORE cTrader DEMO MULTI-TIMEFRAME — HARNESS CONTINUATION 002

Continuation-only successor for QORE Core Issue #494. Do NOT restart or discard prior Harness work.

## Current baseline
qore-core main SHA `514ca00f89fca8194eb57c954e78ba9b2e82b9b7`, TREE `80688a11e42d2ed7f67860b2d0002499b37d1dd9`.

## Recovery
Restore the sanitized semantic patch from the prior Harness family. CONTINUATION-001 failed before DeepSeek spend solely because the old recovery artifact contained a binary coverage database. The semantic candidate has been sanitized and authenticated separately. Preserve all completed semantic work and reconcile it with current main.

## Exact scope — mandatory six timeframes
Implement and close together, with no deferral: M1, M5, M15, M30, H1 and D (Daily). H4 is NOT part of this work package.

Close provider mapping and canonical runtime semantics for all six timeframes, native/closed bars, exact UTC/timezone alignment, deterministic replay, session/date boundaries, no partial-candle leakage, no lookahead, no silent backfill, no future data, exact runtime types, stable ordering/deduplication, explicit unsupported/invalid states, and cross-timeframe consistency. Daily must be fully included now so it is not reopened later.

## Six lanes mandatory
L1 architecture/contracts/timeframe exact types; L2 cTrader period/provider mapping and transport; L3 closed-bar/time boundary/DST/session semantics; L4 deterministic replay/dedup/out-of-order/backfill adversarial; L5 property/metamorphic cross-timeframe validation; L6 integration/call-sites/regression/LSP. Exactly 6 non-duplicative active lanes with durable evidence.

Use semantic LSP evidence: goToDefinition, findReferences, goToImplementation when applicable, hover/type inspection, symbols/call sites and final recheck. HIGH normally; MAX for time-boundary/DST/replay/contract contradictions and final closure.

No Production/real capital. No weakening tests or governance.

## FULL QG
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

## Artifact-only
Do not commit/push/merge qore-core. Deliver semantic patch, exact current baseline binding, 6/6 lane evidence, LSP evidence, durable checkpoints, focused/adversarial tests, FULL QG and closure/blockers. Final candidate must contain no coverage databases or `.qore-harness-recovery/*` product diffs.
