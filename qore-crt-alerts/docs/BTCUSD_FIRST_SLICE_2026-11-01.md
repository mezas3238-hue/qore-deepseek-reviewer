# BTCUSD FIRST SLICE — 2026-11-01 (NO LIVE, no Android push)

## Scope

Owner selected **BTCUSD** as the first instrument. This does NOT
authorize a crypto CRT C1 schedule, real-money signals, external Firebase,
or merge. Do not copy the Forex C1 hours to BTC without TradingView
Pine-v6 equivalence evidence and owner approval.

The existing 34-symbol inventory is preserved. Existing EURUSD/XAUUSD
tests and the V34.9 Pine official source remain unchanged.

## New implementation

- `src/closed-m5-ingestion.mjs` accepts BTCUSD family `crypto` in
  `OFFLINE_REPLAY` only, with explicit native feed mapping and finality.
- `src/btcusd-coinbase-m5.mjs` reads public, read-only Coinbase
  **BTC-USD spot** M5 candles, rejects unclosed/invalid rows and keeps
  provider identity distinct from `IC:BTCUSD` and FundedNext MT5.
- Official API endpoint:
  https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-candles
  Endpoint fixed to
  `https://api.coinbase.com/api/v3/brokerage/market/products/BTC-USD/candles`,
  `granularity=FIVE_MINUTE`. Max window is bounded to 300 M5 bars.
  No secrets, user IDs, orders, persistent connection or notifications.
- `src/crypto-aggregate.mjs` reconstructs contiguous BTC M15 and
  H4 with UTC-00 exploratory boundaries. This is a **candidate time
  anchor for inspecting OHLC only**, NOT an accepted CRT schedule.
  All derived H4 objects have `allowedC1:false`,
  `c1Schedule:NOT_APPROVED`, `sendPush:false`.
- `scripts/btcusd-readonly-market-probe.mjs` performs a single
  read-only 16-hour M5 sample, hashes closed data and reports gaps/H4.
- `.github/workflows/qore-crt-alerts-btcusd-readonly-probe.yml`
  runs the read-only public-market probe on branch changes or manually.
  No cloud DB, Firebase or Android distribution is involved.
- `test/btcusd-coinbase-m5.test.mjs` and `test/crypto-aggregate.test.mjs`
  cover timestamp finality, ordered OHLC, malformed prices, missing bars,
  dedup, provider identity, DST fallback and no certified BTC CRT.

## Validation and operational blockers

1. GitHub Node fixture tests must pass. The real public-API probe must
   succeed separately before claiming that Coinbase was contacted.
2. Align TradingView chart/exports to the SAME provider (Coinbase BTCUSD)
   to assess parity; the current `IC:BTCUSD` CFD differs. Obtain real
   Pine Editor compilation and Data Window evidence.
3. **Mandatory C1 decision:** owner must approve a specific BTC 24/7 H4
   session and C1 three-slot rule in America/New_York, including DST
   convention, or an explicitly authorized alternate anchor. Do not
   pretend UTC-00 equals the existing forex/index schedule.
4. After C1 selection, implement BTC-specific CRT H4 and MSS M15
   same-cycle confirmation with three consecutive H4 and prove anti-repaint.
   Until then `inspectCrtH4({family:"crypto"})` returns
   `UNSUPPORTED_FAMILY` and cannot trigger an alert.
5. Firebase STAGING Auth+App Check+FCM, external PostgreSQL 16,
   HTTPS outbox, installed Android app and physical test are STILL
   missing. Delivery flags MUST remain disabled before certifications.
6. Verify public data usage terms/commercial redistribution rights
   before integrating a real hosted always-on feed.

## How to run

```sh
cd qore-crt-alerts
npm test
node scripts/btcusd-readonly-market-probe.mjs
```

The second command makes a ONE-TIME external HTTPS GET for public
BTC-USD OHLC; it prints a SHA256 and diagnostics, **never a market alert**.
A failed read or missing M5 holds observations; it does not backfill
with fabricated prices or silently substitute another exchange.

**PROGRESS DEFINITION:** BTC M5 intake + offline UTC H4 math works
after tests, but `BTCUSD READY FOR LIVE PUSH` is **FALSE** until
the entire same-feed Pine parity + real FCM phone path is verified.
