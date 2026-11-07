# QORE CRT — cTrader DEMO EURUSD: real native M15 vs derived 3×M5 match

**2026-11-07 / QA STAGING / OWNER AUTHORIZED VIEW ONLY**
**NO MERGE / NO LIVE / NO TRADING / NO FCM / NO production / NO market alerts**

## Verified real transport result

- PR: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/88 (DRAFT)
- Source SHA deployed: `d11682dd6940cdf240c34ba229e87367f482630f`
- Railway project: `qore-crt-alerts-qa`, environment `staging`, service `crt-demo-readonly-worker`
- Successful deployment: `b86f2a61-f74d-4e68-8b9e-c007d5138c4a`
- Authentic API: `wss://demo.ctraderapi.com:5036`, only `accounts/SCOPE_VIEW`, `Raw Trading Ltd`, native `EURUSD symbolId=1`
- Both CI workflows on deployment SHA: **SUCCESS**.

Actual structured Railway log status: `HISTORICAL_M5_M15_QA_UNCERTIFIED`, `connected=true`.

| Item | Actual measured |
| --- | ---: |
| M5 closed from native cTrader API, two history requests | **600** |
| M5 gaps | **0** |
| M5 phase | **0 min** |
| Native M15 closed from separate API request, period=7 | **200** |
| Derived M15 from three M5 | **200** |
| Timestamp-identical M15 comparisons | **200** |
| Native / derived unmatched M15 | **0 / 0** |
| M15 bars with discrepant OHLC | **0** |
| Open/high/low/close field differences | **0/0/0/0** |
| Largest price discrepancy | **0 native 1e-5 ticks** |
| H4 complete from Forex NY 1/5/9 anchors | **12** |
| H4 partial excluded | **1** |
| H4 rejected | **0** |

Reported `nativeM15QaSummary.state=CTRADER_M15_NATIVE_DERIVED_OHLC_MATCH_QA`, `nativeDerivedOhlcMatch=true`, `tradingViewParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sendPush=false`, `canTrade=false`, `sourceParityCertified=false`. The mobile bridge state remains `NOT_ATTEMPTED_IN_HISTORICAL_M5_QA`.

## Interpretation

The user’s specific earlier bug—**MSS M15 incorrectly reusing MSS M5**—is guarded by separate timeframe series and an independently compared native M15 candle source. **This does not mean the MSS M15 detector itself is implemented or certified.** Causal pivot, sweep, break, retest and event times still require independent implementation and runtime verification. No cross-timeframe event copying is permitted.

An intra-broker OHLC match is **not** TradingView `IC:EURUSD` vs cTrader same-feed parity; no TradingView M5 original CSV has yet been compared. User uses TradingView Free and no paid plan or undocumented TV export is presumed.

Other 33 broker symbols retain status unverified for M5/M15/H4 session parity. BTCUSD must use distinct clock and CRT recognition path; indices and metals need their own session calendars and native phase inspection. User’s app/widget remain disconnected from certified market alerts; planned TTL is **4 hours**.

## Safe next work order (existing Owner blanket DEMO QA authorization)

1. Formalize instrument-specific clock and session gates for 33 remaining instruments, preserving exact broker-native IDs and disabling push until each feed passes.
2. Validate native cTrader H4 vs NY 1/5/9 aggregated H4 where appropriate, without manufacturing time-phase equivalence.
3. Implement/verify causal CRT seven-category event scanner and MSS M5/M15 independent pivots with negative tests; compare independent event traces, not mask snapshots.
4. Validate QORE Mobile QA gateway and widget only after event source and expiry/dedup controls are certified.
5. No merge, LIVE, funded account, trades, VPS modification, production, Firebase push or Movete Fácil changes without separate authorization.

**Source citations:** official cTrader Open API model enum M15=7, request type 2137, response 2138: https://help.ctrader.com/open-api/model-messages/ and https://help.ctrader.com/open-api/messages/
