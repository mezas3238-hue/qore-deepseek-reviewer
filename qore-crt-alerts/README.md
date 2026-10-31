# QORE CRT ALERTS — offline engine foundation (DRAFT)

This is an executable backend **replay laboratory**, NOT a functioning
market-data, production trading signal, or Android push service. It has no
market feed, database connection, Railway deployment, FCM, or Android application.

## Existing isolated modules

- src/instruments.mjs: 34 exact TradingView instrument slots, with
  **UNVERIFIED** backend feed mappings. BTCUSD has no silently invented
  FX/index H4 schedule.
- src/contracts.mjs: closed M5 UTC OHLC contract, strict validation and
  retransmission deduplication.
- src/ny-clock.mjs: explicit three C1 NY slots per family, DST-aware.
- src/aggregate.mjs: contiguous, complete M5 -> M15/H4 aggregation;
  incomplete blocks, discontinuities, and ambiguous DST blocks rejected.
- src/crt-h4.mjs: preliminary closed-C2 C1/C2/C3 evaluator with strict
  sweeps, return within C1 and H4-close-only C3 invalidation.
- src/mss-m15.mjs: strict 2/2 default M15 swing, frozen at first actual
  sweep; 720-minute default age cap, preceding consecutive M15 close,
  C2/C3 continuity and cycle identity.
- src/mss-m5.mjs: independent M5 swing and post-sweep close detector.
  An M5 cross on the same sweep candle is prohibited.
- src/replay-cycle.mjs: offline integration from the same M5 closed bars through
  H4/M15, CRT, both MSS detectors and the confluence decision.
- src/signal-gate.mjs: only a ratified CRT and same-cycle M15 MSS form an
  offline replay confluence; M5 is optional context, never its substitute.
  All results enforce actionable:false and sendPush:false when present.

## Reproduce tests

With Node.js 22+: cd qore-crt-alerts && npm test

GitHub Actions: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/workflows/qore-crt-alerts-foundation.yml

Evidence as of 31 Oct 2026: **63/63 offline tests PASS**.
Tests are fixture-based and do NOT compile Pine or establish runtime equivalence.

## Important restrictions

- No live or financial signals and no Android notifications are emitted.
- The TradingView labels from the Pine source DO NOT certify any legal
  realtime provider API or equivalence to FundedNext.
- FX-family classification of XAUUSD and XAGUSD mirrors the candidate
  Pine default but broker session calendars remain to be validated.
- Backend MSS rules mirror reviewed Pine QA intentions but are NOT
  certified bit-for-bit or event-for-event equivalent. Differences in
  pivot timing, M15 closure timing, DST treatment, chart refresh and
  feed-specific H4 boundaries require a parity test with identical data.
- Pine V34.9 and all V34.10b candidate source files are unchanged.
- This is a DRAFT branch, never merge or deploy without explicit approval.

## Next evidence gates

1. Source and validate authorized M5 market feeds for all 34 assets,
   their trading calendars, historical completeness and broker mappings.
2. Build a deterministic Pine/backend candle-level parity harness,
   especially pivot confirmation and intra-C2/C3 chronology.
3. Finish FVG/PDH/PDL contextual modules without making them CRT filters.
4. Add a persistent outbox with replay-safe identifiers, database, API,
   FCM and an actual Android client in a staging-only deployment.
5. Execute physical-device E2E and real TradingView compilation before
   declaring the products certified.
