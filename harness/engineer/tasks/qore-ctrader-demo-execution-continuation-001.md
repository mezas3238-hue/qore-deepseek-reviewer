# QORE cTrader DEMO EXECUTION — HARNESS CONTINUATION 001

Continuation-only successor for QORE Core Issue #471. Do NOT restart or discard prior run `34028985646` work.

## Current baseline
qore-core main SHA `514ca00f89fca8194eb57c954e78ba9b2e82b9b7`, TREE `80688a11e42d2ed7f67860b2d0002499b37d1dd9`.

## Recovery
Restore the sanitized semantic candidate from the cancelled original Harness run. Preserve completed cTrader DEMO account binding, execution models/gateway/runtime/assembler/transport and tests; reconcile with current main and with the Risk authority boundary without inventing LIVE authority.

## Required closure
Close exact pipeline `Risk-authorized intent -> cTrader DEMO order -> receipt -> fill/partial/reject -> reconciliation` with DEMO-only provider/account binding; exact authorization identity and freshness; idempotency; account/symbol/side/volume mapping; provider IDs; rejects; partial fills; duplicate/out-of-order events; timeout/disconnection/unknown outcome; reconnect/reconciliation; no blind resubmit; containment; no corrective trading; exact retained receipts/evidence; deterministic replay; fail-closed ambiguity; strict TEST/DEMO vs LIVE/Production separation.

Execution may consume only valid Risk authorization and may not allow CIBO/Trader/provider responses to bypass Risk. No Production or real-capital authorization.

## Six mandatory lanes
L1 architecture/contracts/exact execution types; L2 cTrader account/symbol/volume/provider codec; L3 idempotency/order lifecycle/partial/reject; L4 disconnect/unknown outcome/reconciliation/containment; L5 Risk authorization/evidence/replay/security boundary; L6 integration/call-sites/regressions/LSP/real-DEMO evidence readiness. Exactly 6 non-duplicative lanes with durable evidence.

Semantic LSP mandatory: goToDefinition, findReferences, goToImplementation when applicable, hover/type inspection, symbols/call-sites and final recheck. HIGH normally; MAX for unknown outcome/idempotency/reconciliation/authority contradictions and final closure.

## FULL QG
- `ruff check .`
- `mypy src tests`
- `pytest --cov=src/qore --cov-report=term-missing`

No test/governance weakening.

## Artifact-only
Do not commit/push/merge qore-core. Deliver semantic patch, exact current baseline, 6/6 lanes, LSP evidence, checkpoints, focused/adversarial/property tests, FULL QG and closure/blockers. Final candidate must exclude `.qore-harness-recovery/*` and local coverage artifacts.
