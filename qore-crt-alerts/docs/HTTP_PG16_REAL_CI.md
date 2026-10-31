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
