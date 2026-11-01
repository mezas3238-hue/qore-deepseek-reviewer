# GitHub CI: actual HTTP → PostgreSQL 16 transport

**This workflow does not contact Supabase, Railway, Firebase, TradingView, a
market-data provider, or an Android phone.** It is a disposable PostgreSQL 16
service on a GitHub-hosted runner, with a real Node.js 22 HTTP server bound
to loopback and a real node-postgres database client. No LIVE/FCM network.

Execute after migrations 001,002,003. A separate QA-only 004 script creates
a NOLOGIN server role with narrow device-table RLS access. The CI workflow
creates a throwaway login restricted to that role. Actual end-to-end test
covers registration, duplicate, listing, CAS race, user isolation,
failed App Check, revocation, permanent no-delivery, and denied access to
trading observations. Login credentials are ephemeral fixed fixtures,
NOT usable outside the GitHub PostgreSQL service.

The test deliberately injects *mock* Firebase authentication/App Check
verifiers to isolate real HTTP/PG behavior from cloud Firebase. It proves
neither true Firebase authentication nor FCM or Pine parity. SQL migrations
are proposals and must not be applied to external systems without review.

## CI results, 31 October 2026

- 12 of 12 actual HTTP/Postgres assertions SUCCESS in GitHub Actions:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243532565
- 170 of 170 Node tests SUCCESS in GitHub Actions:
  https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243532571
- PostgreSQL SQLSTATE=23514 with a precisely allowlisted CAS conflict is
  returned by HTTP as a redacted 409 QA_CONFLICT_HELD. Unknown database
  exceptions fail closed as 503 QA_DATABASE_UNAVAILABLE.
- Normal PostgreSQL rejected writes appear as ERROR in DB logs by
  design; tests assert that the corresponding HTTP request is blocked.
  They are not successful or LIVE signals.
- The backend test DB role is explicitly restricted by RLS and cannot
  inspect replay_observations, but its direct SQL permissions on its own
  device table mean DB credentials must NEVER reach app clients.
