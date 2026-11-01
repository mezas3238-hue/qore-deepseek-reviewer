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

## BTCUSD parity packet + QA Android preview (2026-11-01)

Current development includes a **source-verifiable evidence packet**
generated directly in GitHub Actions from a single public Coinbase
BTC-USD spot M5 REST capture:

- `src/btcusd-parity-bundle.mjs` derives a content-addressed
  `sourceId` from `hashM5`, retains every exact M5 UTC OHLC,
  chooses the latest C1 (NY 01/05/21) only when fully closed C1/C2
  and a partial live C3 exist, and builds the same backend Pine-audit
  contract as Forex. The 12-field Pine Data Window template is left
  `verifiedOnTradingView:false` with NULL values.
- `scripts/btcusd-parity-export.mjs` makes ONE public market read,
  writes `btcusd-source-m5.json`, `btcusd-backend-audit.json`,
  `btcusd-pine-capture-UNVERIFIED-template.json`, and
  `btcusd-packet-status.json`.
- `.github/workflows/qore-crt-alerts-btcusd-readonly-probe.yml`
  archives those four files as
  **btcusd-parity-evidence-NOT-CERTIFIED**. Download from its Actions
  artifact section within 7 days. The artifact is a true provider read,
  not a compiled Pine report or market notification.
- The initial successful archived run:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41312593663
  Artifact:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41312593663/artifacts/13085757671
- 192/192 BTC M5 passed the provider-window check in that run, but
  **C1 was null** because the data straddled the 2026-11-01 NY
  daylight-saving fallback; H4 ambiguity was correctly quarantined.
  `backendStatus:BACKEND_INCOMPLETE` and
  `PINE_EVIDENCE_MISSING` are HONEST, not release failures.
  An unambiguous later session and larger approved same-feed history
  are required before a Pine phase snapshot can be compared.

### TradingView parity operator steps (Android-friendly)

1. Open the actual BTCUSD Coinbase market in TradingView
   (search the full provider ticker `COINBASE:BTCUSD`; availability
   and exact price equivalence must be verified, never assumed).
   The indicator's default dashboard slot currently targets
   `IC:BTCUSD`; if testing Coinbase parity, change the *testing
   symbol input* `BTCUSD` to the Coinbase symbol, without rewriting
   the 34-symbol inventory or calling CFDs identical to spot.
2. In Pine Editor use the existing
   `CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine`
   candidate with recorded GitHub blob SHA
   `9a572500608fefbc24ae89b99d2e876529d0bfa5`.
   Do NOT change official V34.9. Record a REAL compile result.
3. On the exact same source/timeframe NY CRT H4 C2 closed and C3
   partially observed, record the 12 QA Data Window values, exact
   timezone, chart ticker and evidence screenshot/clip.
4. Fill the JSON capture template with **real** values and attach
   screenshots. Set `verifiedOnTradingView:true` only after an
   actual Pine Editor capture; this is not cryptographic proof.
5. Run `npm run parity -- parity-artifacts/btcusd-source-m5.json
   pine-capture.json` from `qore-crt-alerts`, review all 12
   differences. `MATCH_UNCERTIFIED` is only a diagnostic match;
   it does not authorize signal pushes.

### Offline BTC to Android transport-disabled E2E

Test `test/btcusd-end-to-end-blocked-preview.test.mjs` verifies
100 contiguous closed BTC M5 from Saturday 01 NY through fully
closed C2 -> strictly swept CRT H4 -> confirmed frozen swing MSS M15
-> SHA256 parity audit -> one quarantined observation -> blocked
Android notification-envelope preview. The preview has
`transport:DISABLED`, `certified:false`, no Firebase token,
`sendPush:false` and duplicate event identity rejection.

This is NOT real FCM delivery to an installed phone. External
Firebase STAGING, device token acquisition, mobile notification
permission, same-source Pine compilation and physical delivery
are still open. No merge/no LIVE.
