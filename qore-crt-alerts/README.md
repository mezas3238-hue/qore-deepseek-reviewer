# QORE CRT ALERTS — offline engine foundation (DRAFT)

This is an executable backend **replay laboratory** with a native Kotlin
Android QA source project. It is NOT a functioning real-time signal or push
service. It has no live market feed, external database connection, Railway
deployment, configured Firebase project, real device registration, or real FCM
delivery. Android QA intentionally rejects all notifications by build flag.

## Existing isolated modules

- src/instruments.mjs: 34 exact TradingView instrument slots, with
  **UNVERIFIED** backend feed mappings. BTCUSD now has an
  explicitly OWNER-APPROVED NY Forex-equivalent C1=01/05/21 schedule.
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
- sql/003_qa_device_revision.sql: UNAPPLIED PostgreSQL revision-based
  compare-and-swap for device updates/revocation, preventing stale
  rotations and requiring server-verified consent. CI validates SQL.
- sql/002_qa_devices_blocked.sql: UNAPPLIED PostgreSQL QA table for
  HMAC handles, server-side consent, rotation, opt-out, 30-day expiry and
  permanently BLOCKED_NOT_CERTIFIED delivery. RLS denies client access.
- sql/001_quarantined_observations.sql: UNAPPLIED staging proposal for
  PostgreSQL 16+ with RLS deny-by-default, blocked delivery state, and
  a private idempotent function rejecting divergent evidence.
- src/parity-audit.mjs: exact 12-field Pine QA Data Window comparison
  with M5 SHA-256 integrity, strict source identity and fail-closed
  missing/mismatched evidence; never calls itself certified.
- src/device-registration.mjs: offline registration with injected
  server-side Auth and App Check verifiers, HMAC device handles, explicit
  opt-in, FID rotation, revocation, server-clock expiry and no push transport.
- src/firebase-admin-verifiers.mjs: injected real Firebase Admin
  Auth / App Check verifier adapter, including revoked ID tokens and
  consumed limited-use App Check tokens, tested with mocks (no credentials).
- src/qa-device-http.mjs: loopback-only HTTP QA service (not started or
  deployed automatically): GET/POST/DELETE device registration, consent,
  App Check, strict JSON size, rate limits, no FCM or send route.
- src/pg-qa-device-registry.mjs: parametrized PostgreSQL backend adapter
  for Auth/App Check, pseudonymous device handles, compare-and-swap,
  revocation and authenticated listing (no live database connection).
- src/fcm-delivery-policy.mjs: pure offline classification of FCM failures,
  exponential/quota retry planning and permanent delivery blocking.
- src/notification-preview.mjs: deterministic backend-to-Android
  envelope for a quarantined observation; OFFLINE_REPLAY, certified=false,
  transport DISABLED, never includes an FCM token or send operation.
- android/: native Kotlin Android QA launcher with a local-only future
  interest preference, erase control, FirebaseMessagingService, strict
  payload validation and independent consent/enrollment/Pine/permission
  gates. The Gradle build hardcodes STAGING_NOTIFICATIONS_ENABLED=false.
  No google-services.json, no Firebase auto-initialization, no device
  registration or real push delivery. A manually tapped local BTCUSD
  notification DEMO can request Android POST_NOTIFICATIONS; it is simulated
  and entirely separate from the market-signal FCM lock.
- src/signal-gate.mjs: only a ratified CRT and same-cycle M15 MSS form an
  offline replay confluence; M5 is optional context, never its substitute.
  All results enforce actionable:false and sendPush:false when present.

## Reproduce tests

With Node.js 22+: cd qore-crt-alerts && npm test

GitHub Actions: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/workflows/qore-crt-alerts-foundation.yml

Evidence as of 31 Oct 2026: **170/170 offline Node tests PASS**.
Tests are fixture-based and do NOT compile Pine or establish runtime equivalence.
An additional GitHub Actions job uses a disposable PostgreSQL 16 container,
NOT a real Supabase instance, to test the schema, RLS, deduplication,
conflicting OHLC rejection, revision-based rotation and revocation. See .github/workflows/qore-crt-alerts-postgres-offline.yml.

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
4. Deploy a separately approved STAGING PostgreSQL and connect real
   Firebase Auth / App Check credentials through a secure TLS API gateway.
   The loopback-only HTTP and injected PostgreSQL adapters are implemented
   in QA but NOT deployed or connected to real Firebase or database. A
   persistent notification outbox, real FCM sender and authenticated Android
   registration remain NOT implemented.
5. Finish Firebase project configuration, authenticated device enrollment,
   Android notification permission UI, FCM server adapter and physical-device
   E2E. Android source exists but all notifications remain blocked.
6. Real TradingView compilation, replay parity, and physical-device E2E
   must pass before declaring any product certified.

## Latest verified CI (31 Oct 2026)

- Node.js 22 offline suite: **170 PASS / 0 FAIL**:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243532571
- PostgreSQL 16 ephemeral transactional CAS & RLS: **SUCCESS**:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41239931334
- Android Kotlin QA compilation (prior verified): **SUCCESS**:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41228916649
- HTTP contract: docs/QA_DEVICE_HTTP.md
- PostgreSQL adapter: docs/PG_DEVICE_REGISTRY.md

No real device, Firebase project or market feed was accessed.

## Android QA latest evidence

- Android source UI + QaConsentGate Android test matrix: GitHub Actions
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41241227126
  (successful compilation of the first QA UI revision).
- Further integration tests for the actual compiled delivery-disabled flag
  passed in QaNotificationPipelineTest.kt via GitHub CI.
- No actual Android permission request, Firebase registration, or notification
  delivery is implemented at this stage. Status UI is offline-only.

## REAL HTTP → ephemeral PostgreSQL 16 integration (31 Oct 2026)

- New CI-only role qore_crt_http_qa NOLOGIN, PostgreSQL RLS policy for
  QA device table only, denied access to trading observation ledger.
- New GitHub Actions integration test uses Node 22 HTTP bound to
  127.0.0.1, actual PostgreSQL 16 and a restricted test login;
  authenticated mock Firebase Auth/App Check verifiers only.
- **12 / 12 E2E assertions passed**: registration, duplicate handling,
  scoped listing, simultaneous CAS rotations, wrong-user revocation
  rejection, App Check rejection, revocation and permanent no-delivery.
- **170 / 170 Node tests passed**. QA SQL failures from concurrent
  stale revisions are exposed to the HTTP caller as sanitized 409,
  while unexpected database failures return 503.
- GitHub CI evidence:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243532565
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243532571
- Code: docs/HTTP_PG16_REAL_CI.md, sql/004_ephemeral_http_role.sql.
- ALL external Firebase credentials, Supabase, Railway, real authorized
  M5 prices and Android physical-device delivery remain absent.
- RLS policy trusts a dedicated backend role, not end-user SQL claims:
  never expose this login to Android/anonymous clients. Production-grade
  role credentials, distributed rate limits and audited TLS are pending.

## 1 Nov 2026 BTCUSD checkpoint (supersedes old QA test count)

Owner-approved BTCUSD NY Forex schedule: C1 01/05/21, C2 05/09/01,
C3 09/13/05, seven days a week, DST-aware. Coinbase public BTC-USD
spot 192/192 M5 real smoke confirmed; this is not IC:BTCUSD equivalence.

A real read-only market packet and an UNVERIFIED 12-field Pine template
are exported as a GitHub Actions artifact:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41312593663

Backend BTC M5 -> C2 sweep -> frozen MSS M15 -> SHA audit -> replay
ledger -> blocked Android notification preview is tested end-to-end
using LOCAL fixtures (no Firebase). Android's optional local demo is
explicitly synthetic and does not authorize signal delivery.

Refer to docs/BTCUSD_FIRST_SLICE_2026-11-01.md for the latest
work and current external certification blockers. Historical tests and
CI links above are retained as prior evidence only.
