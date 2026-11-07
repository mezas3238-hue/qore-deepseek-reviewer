# QORE CRT: cTrader DEMO native EURUSD M15 vs M15 reconstructed from M5

**Date:** 2026-11-07. **State:** QA only. **NO LIVE / NO ORDERS / NO MERGE / NO PUSH / NO FCM / NO production**.

## Ground truth and request

Existing cTrader DEMO worker has already read **600 closed EURUSD M5**, built **200 M15 derived from three M5**, and **12 complete Forex NY 1/5/9 H4**. This PR adds a third, bounded **read-only** historical cTrader API request for the **native M15** timeframe, after the 600 original M5 are revalidated.

The official Spotware Open API defines **ProtoOATrendbarPeriod.M15 = 7**, historical request **ProtoOAGetTrendbarsReq = 2137**, response **ProtoOAGetTrendbarsRes = 2138**, and low-plus-delta OHLC decoding using 100000 scale. References:
- https://help.ctrader.com/open-api/model-messages/
- https://help.ctrader.com/open-api/messages/
- https://help.ctrader.com/open-api/symbol-data/

Explicit STAGING-only flag:

```
QORE_CT_QA_NATIVE_M15_COMPARE=OWNER_APPROVED_NATIVE_M15_COMPARE
```

Valid only with the already-proven cTrader DEMO account, `accounts/SCOPE_VIEW`, `Raw Trading Ltd`, native `EURUSD` symbol `1`, 2 pages × 300 closed M5, and private CSV export **DISABLED**. The native M15 request uses the *identical timestamp coverage* already established from the returned M5, with `period=7,count=200`. It never sends orders or messages to the mobile gateway.

## Fail-closed comparison

The native cTrader M15 is decoded and compared **bar by bar by UTC open timestamp** with the M15 rebuilt from three M5. The QA result contains:
- native M15 bar count and same-timestamp count
- missing/unpaired M15 bars
- OHLC mismatch count, per-field mismatch count and maximum difference (ticks of 1e-5)
- clearly labeled state `CTRADER_M15_NATIVE_DERIVED_OHLC_MATCH_QA`, `...DIFFERENCE_QA` or `...INCOMPLETE_QA`

Wrong account, period, symbol, duplicate bar, unclosed bar, malformed delta, changed time phase, missing validated M5 input or incorrect OAuth scope **blocks**. A mismatch is reported without inventing candles or tolerances.

Even if **all 200 native M15 match** the derived 200 M15, this only checks internal consistency of **the same cTrader broker**, **not** equality with TradingView, independent Pine execution, CRT 7 families, or MSS M5/M15 signal certification. Neither M5 nor M15 MSS is inferred or transmitted. Both remain **uncertified**.

## Integration limitations

Only one authorized private Railway STAGING worker is changed. No updates to production, FundedNext, FCM, QORE Mobile, Supabase or any existing LIVE Trader. The worker is **one-shot** with no automatic retry. Results in private Railway logs are only counts and booleans, no OAuth credentials, raw OHLC nor identifying account numbers.

Next separate gates: native H4/NY session equivalence, independent TradingView IC:EURUSD same-window OHLC acquisition if available, complete 34-instrument feed and session coverage, seven CRT event tests, independent MSS M5 vs M15 causal tests, then mobile QA delivery. No push until certification.
