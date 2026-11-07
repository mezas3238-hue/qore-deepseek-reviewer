# cTrader IC Markets DEMO: manual-only account identity discovery (QA)

**Date:** 2026-11-07. **Stage:** QA/STAGING only. **Source:** child of PR #81. `NO LIVE / NO ORDERS / NO MARKET PUSH / NO MERGE`.

## Problem solved

The one-shot worker requires `QORE_CT_DEMO_ACCOUNT_ID` and
`QORE_CT_EXPECTED_BROKER_TITLE` before the first real probe. The
on-screen cTrader login number is **not** the API
`ctidTraderAccountId`. Never guess the broker's API
`brokerTitleShort` from the commercial brand.

The separate **owner-triggered** mode queries only the granted
account list after authorizing the application and validating
`permissionScope=SCOPE_VIEW`. It omits all LIVE/unverified accounts
and prints, **only in private Railway QA logs**, the proven DEMO
`ctidTraderAccountId` + exact `brokerTitleShort` for the Owner
to select. It NEVER sets the production or QA account automatically.

## Pre-requisites

On the Railway `qore-crt-alerts-qa` / `staging` project, service
`crt-demo-readonly-worker`:
- `QORE_CT_STAGE=DEMO`, `QORE_CT_OAUTH_SCOPE=accounts`,
  `QORE_PROVIDER=IC`, `QORE_TRADING_ENABLED=false`,
  `QORE_PUSH_ENABLED=false`,
  `QORE_ALERT_TTL_SECONDS=14400`,
  `QORE_CT_QA_PROBE=OWNER_APPROVED_VIEW_ONLY`.
- The Owner must securely set `QORE_CT_CLIENT_ID`,
  `QORE_CT_CLIENT_SECRET`, and `QORE_CT_VIEW_ACCESS_TOKEN`
  from the **same approved Open API application**, scope `accounts`.
- Only after Owner authorization, set
  `QORE_CT_ACCOUNT_DISCOVERY=OWNER_APPROVED_READONLY_DISCOVERY`.
- Pin to the tested branch/commit. Review all Railway pending changes
  and do **not** apply the patch until approved and other service
  prerequisites have been audited.

The existing start command remains
`npm run railway:ctrader:demo:qa`. With explicit opt-in, it runs
discovery instead of the ordinary signed connectivity receipt; it
completes once and exits. It does not publish a gateway receipt,
does not emit alerts and does not touch QORE Mobile.

## Once deployed in an approved isolated QA environment

1. Review sanitized private service logs for
   `DEMO_ACCOUNT_CANDIDATES_FOR_OWNER`. Never post raw logs
   containing account IDs or any other sensitive values publicly.
2. The Owner selects the proper IC Markets DEMO entry, and enters
   its exact `ctidTraderAccountId` into
   `QORE_CT_DEMO_ACCOUNT_ID` and exact
   `brokerTitleShort` into `QORE_CT_EXPECTED_BROKER_TITLE`
   **in private Railway QA variables**. Never use `traderLogin`.
3. Remove or disable `QORE_CT_ACCOUNT_DISCOVERY` after
   discovery. Only then run the original one-shot read-only probe.
4. The historical sample and gateway handshake remain
   uncertified. Seven CRT families, 34 instruments, parity and
   FCM are **not** activated by this helper.

## Fail-closed invariants

- DEMO WSS fixed to `wss://demo.ctraderapi.com:5036`.
- Only request message types 2100 and 2149 are emitted.
- Unknown permission scope, missing isLive=false, duplicate or
  malformed account identity, stale or mismatched request IDs:
  no selected account and no certification.
- No access tokens, refresh tokens, Client ID/Secret or market OHLC
  in result, logs or gateway payload.
- Tests: `node --test test/qa-ctrader-demo-account-discovery.test.mjs`.
