# BTCUSD FIRST — Owner-approved Forex CRT NY sessions (2026-11-01)

**PR #55 · OFFLINE_REPLAY / STAGING development only · NO LIVE / NO MERGE**

## Authority: new Owner decision

Owner explicitly approved that **BTCUSD uses the exact same three H4
CRT cycles as Forex**, for the full seven-day BTC trading week:

| C1 NY | C2 NY | C3 NY |
| --- | --- | --- |
| 01:00 | 05:00 | 09:00 |
| 05:00 | 09:00 | 13:00 |
| 21:00 | 01:00 (next day) | 05:00 (next day) |

Time zone: **America/New_York**, IANA DST-aware (NOT fixed UTC,
NOT UTC-midnight anchor). H4 C1 and C2 must be fully closed;
C3 close beyond C2 wick invalidates. The required confirmation is
**MSS M15**, swing left/right=2 with frozen pre-sweep pivot, same cycle.
MSS M5 remains context. This is an owner APPROVAL OF SCHEDULE only,
NOT a Pine/market parity certificate or authorization to send pushes.

## Implemented on the existing PR, without changing Pine V34.9

1. `src/ny-clock.mjs`: explicit `crypto:[1,5,21]`, NY origin 01
   like FX. `index` retains 02 origin. Weekend is included automatically.
2. `src/aggregate.mjs`: accepts `crypto`, with strict 48×M5 H4,
   3×M5 M15 completeness and DST-fold exclusion. Never fabricates bars.
3. `src/crypto-aggregate.mjs`: changed exploratory UTC-00 OHLC clock
   to owner-approved **NY Forex clock**. Keeps `sendPush:false`,
   `actionable:false`, `marketEquivalence:UNVERIFIED`,
   `certification:PINE_PARITY_PENDING`.
4. `src/crt-h4.mjs`: allows `crypto` but restricts crypto identifier
   to BTCUSD. Same H4 strict sweep and C3 close invalidation as FX.
5. `src/replay-cycle.mjs`: BTCUSD now runs the existing
   CRT H4 -> MSS M5/M15 -> confluence evaluation based on the SAME M5
   observations. Any confluence is `OFFLINE_REPLAY` and NOT SENDABLE.
6. `src/btcusd-coinbase-m5.mjs`: Coinbase public **BTC-USD spot** M5
   adapter. Validates timestamps, OHLC, finality, no gaps, exact provider
   identity; excludes and counts out-of-window boundary candles.
7. `scripts/btcusd-readonly-market-probe.mjs` and
   `.github/workflows/qore-crt-alerts-btcusd-readonly-probe.yml`:
   one-shot actual public HTTPS candles, no authentication, no trading,
   no Firebase, no Android push.
8. Updated tests: BTC schedule, summer/winter DST, weekend cycles,
   valid three H4 + mandatory frozen MSS M15, C3 invalidation,
   partial/gapped M5, mixed-provider restrictions.

## Actual market smoke evidence

Real GitHub Action: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41308599396

The initial Coinbase 16h read had a missing boundary bucket; after
explicitly ignoring provider extras and asking for two margin buckets,
the second probe returned **192/192 M5**; 3 complete H4 and 63 M15,
with partial window groups rejected. SHA256:
`5fbefa559d94f17bd343c3556f9823646c23813f8ab160d8bc8c163b43c0af3b`.
This is a **one-shot live market data READ**, not a real-time alert feed.

## Gating/remaining work

- Coinbase `BTC-USD` **spot** is NOT `IC:BTCUSD` TradingView CFD nor
  FundedNext MT5, and their OHLC cannot be presumed identical.
  Align chart source to Coinbase, then compare exact candle timestamps,
  ranges and MSS with Pine Editor compilation and Pine references.
- DST fallback 01 local is ambiguous (01 repeats); reject an ambiguous
  or incomplete H4 rather than issue a false CRT. Spring transition
  gaps also fail-closed.
- Real continuous licensed M5 feed/subscriber, persistence, restart and
  backfill still missing. The one-shot public endpoint is QA only.
- Real external Firebase Auth/App Check/FCM, HTTPS backend, PostgreSQL
  STAGING and physical Android end-to-end notification test still
  **NOT CERTIFIED**.
- No FCM sender may be enabled merely because a BTC replay returns
  `REPLAY_CRT_M15_CONFLUENCE`; blocked delivery outbox remains blocked.
- Keep PR #55 DRAFT; do not merge or deploy LIVE until explicit authority.
