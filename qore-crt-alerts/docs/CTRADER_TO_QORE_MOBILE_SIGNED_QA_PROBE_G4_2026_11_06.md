# G4 — cTrader DEMO IC Markets one-shot QA proof to QORE Mobile widget

**2026-11-06 · NO LIVE / NO MERGE / NO TRADING / NO MARKET PUSH**

The existing `railway-ctrader-demo-entry.mjs` was connected to a **disabled-by-default** signed QA status reporter: `src/qa-ctrader-mobile-probe-bridge.mjs`.

One authorized cTrader Open API read-only DEMO session gets inventory (or up to 500 closed M5 in the QA probe); if successful, it can **optionally** transmit ONLY a sanitized connectivity proof to a dedicated QORE Mobile STAGING gateway. No account ID, access token, client secret, OHLC, CRT price, alert or order is sent.

Contract:
- Receiver: `POST /v1/admin/crt/ctrader-demo-probe` in QORE Mobile gateway PR descendant of #128.
- Sender signs the exact JSON bytes using HMAC-SHA256 over method/path/timestamp/nonce/body SHA-256; headers `X-Qore-Ctrader-Time`, `X-Qore-Ctrader-Nonce`, `X-Qore-Ctrader-Signature`.
- Mandatory private Railway variables: `QORE_CTRADER_QA_MOBILE_BRIDGE=OWNER_APPROVED_PROBE_ONLY`, `QORE_CTRADER_QA_GATEWAY_URL=https://<staging|qa-host>.up.railway.app/`, and `QORE_CTRADER_DEMO_PROBE_HMAC_SECRET` (same random 32+ byte secret on gateway). It blocks production endpoints.
- The existing cTrader vars `QORE_CT_STAGE=DEMO`, `QORE_CT_OAUTH_SCOPE=accounts`, `QORE_PROVIDER=IC`, `QORE_CT_QA_PROBE=OWNER_APPROVED_VIEW_ONLY`, `QORE_TRADING_ENABLED=false` and `QORE_PUSH_ENABLED=false` still apply. Without them **no cTrader WSS** and **no outbound staging gateway request**.
- The proof remains `sourceParityCertified=false`, `sendPush=false` and `canTrade=false`.
- No infinite loop. Existing Railway worker is a **one-shot** script. Full alert service requires persistent 34-source market-data worker, TradingView/Pine parity evidence, authorized credential provisioning, a secure persistent event relay and delivery chain.

Automated tests in `test/qa-ctrader-mobile-probe-bridge.test.mjs` cover HMAC, body scope, TLS staging URL allowlist, disabled defaults and missing actual auth. The tests use fake HTTP functions, **never open real broker or Railway connections**.

The Railway `qore-crt-alerts-qa` project has staged, not deployed services. Do not accept/commit the existing 37 staged changes without inspecting all resources; do not use unrelated `qore-mobile-staging` (Movete Fácil). To test a real proof, first deploy a dedicated QORE Mobile QA Gateway from approved code and set private keys in Railway. Never publish OAuth secrets in GitHub/chat.

**Not a market alert:** the mobile widget will display a QA status only, not an actionable CRT event. V34.12X TradingView remains untouched.
