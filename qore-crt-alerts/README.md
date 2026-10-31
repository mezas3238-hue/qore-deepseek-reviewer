# QORE CRT ALERTS — offline engine foundation (DRAFT)

This is an executable backend **replay laboratory** with a native Kotlin
Android QA source project. It is NOT a functioning real-time signal or push
service. It has no live market feed, external database connection, Railway
deployment, configured Firebase project, device registration, or real FCM
delivery. Android QA intentionally rejects all notifications by build flag.

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
- src/closed-m5-ingestion.mjs: one-source offline M5 intake with explicit
  instrument/provider mapping, closed-candle finality, duplicate/gap
  quarantine and fail-closed bounded memory. No live feed connection.
- src/observation-ledger.mjs: immutable replay-only confluence records,
  deterministic fingerprint, deduplication and conflicting-OHLC hold.
- sql/001_quarantined_observations.sql: UNAPPLIED staging proposal for
  PostgreSQL 16+ with RLS deny-by-default, blocked delivery state, and
  a private idempotent function rejecting divergent evidence.
- src/parity-audit.mjs: exact 12-field Pine QA Data Window comparison
  with M5 SHA-256 integrity, strict source identity and fail-closed
  missing/mismatched evidence; never calls itself certified.
- src/notification-preview.mjs: deterministic backend-to-Android
  envelope for a quarantined observation; OFFLINE_REPLAY, certified=false,
  transport DISABLED, never includes an FCM token or send operation.
- android/: isolated Kotlin native Android QA launcher, FirebaseMessagingService
  and strict payload validation. The Gradle build hardcodes
  STAGING_NOTIFICATIONS_ENABLED=false. No google-services.json and no token
  registration; source code is not a certified installed app.
- src/signal-gate.mjs: only a ratified CRT and same-cycle M15 MSS form an
  offline replay confluence; M5 is optional context, never its substitute.
  All results enforce actionable:false and sendPush:false when present.

## Reproduce tests

With Node.js 22+: cd qore-crt-alerts && npm test

GitHub Actions: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/workflows/qore-crt-alerts-foundation.yml

Evidence as of 31 Oct 2026: **120/120 offline Node tests PASS**.
Tests are fixture-based and do NOT compile Pine or establish runtime equivalence.
An additional GitHub Actions job uses a disposable PostgreSQL 16 container,
NOT a real Supabase instance, to test the schema, RLS, deduplication and
conflicting OHLC rejection. See .github/workflows/qore-crt-alerts-postgres-offline.yml.

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
2. Obtain REAL TradingView Data Window captures and the same provider M5.
   Compare using the strict offline runner (instructions:
   docs/PINE_PARITY_CAPTURE.md). A passing synthetic test is NOT Pine parity.
3. Finish FVG/PDH/PDL contextual modules without making them CRT filters.
4. Connect this quarantined event model to an explicitly approved staging
   PostgreSQL instance with credentials, audit and transactional retry. A
   real persistent outbox, API, FCM, delivery service and Android client
   remain unimplemented and must not be silently enabled.
5. Finish Firebase project configuration, authenticated device enrollment,
   Android notification permission UI, FCM server adapter and physical-device
   E2E. Android source exists but all notifications remain blocked.
6. Real TradingView compilation, replay parity, and physical-device E2E
   must pass before declaring any product certified.
