# QORE CRT — 34 IC Markets DEMO candidate manifest (STAGING-only)

**2026-11-07.** Branch/PR: #83, child of #82. **NO MERGE / NO LIVE / NO ORDERS / NO MARKET ALERTS / NO FCM / NO PRODUCTION**.

## Proven vs pending

Real cTrader Open API DEMO account authorization with `accounts` / `SCOPE_VIEW`, the exact native broker identity, and 365 symbols passed. 34 name-only matches, 0 ambiguous, were seen in the deployed **one-shot** inventory probe. This is **not** OHLC parity, 34 approved mappings, actual CRT/MSS detection or app/widget alert certification.

## New gated review manifest

The one-shot inventory worker now supports the *optional* QA-only flag:

```
QORE_CT_QA_SYMBOL_MANIFEST=OWNER_REVIEW_ONLY
```

After verifying the approved DEMO account, it writes a 34-row **review-only** manifest to the private Railway **worker** logs. For every fixed TradingView `IC:` slot, the output contains the exact broker-native symbol, `ctraderSymbolId`, source slot, and a deterministic SHA-256 fingerprint. Every row remains `ownerApproved=false` and `sourceParityCertified=false`. Missing or ambiguous symbols remain explicitly blocked. It never posts the manifest to the QORE Mobile gateway and cannot emit trading or FCM messages.

This flag is **not** a trade permission or approval to use historical data as an alert source. Do not copy any OAuth credentials, raw logs, or account metadata into public tickets.

**Preflight before Railway deployment:** review the patch and ensure it touches only the cTrader DEMO QA worker, source PR #83 tested commit, and the QA manifest flag. No other services, no global shared variables. Railway `restartPolicyType=NEVER`. Reconfirm explicit Owner approval before applying the staged patch.

**Review process:** The Owner verifies each of 34 instrument IDs and exact cTrader symbol IDs in the QA manifest, noting the SHA-256 fingerprint. A name match is only a *candidate*. Do not silently mark any row as owner-approved or source-equivalent.

## One-symbol closed M5 pilot

Once one native broker symbol has been reviewed and approved, use the existing gated one-shot worker's *three* exact variables together (start with **EURUSD**):

```
QORE_CT_SAMPLE_SYMBOL_ID=<API SYMBOL ID FROM REVIEWED MANIFEST>
QORE_CT_SAMPLE_SYMBOL_NAME=<EXACT NATIVE NAME FROM MANIFEST>
QORE_CT_SAMPLE_INSTRUMENT_ID=EURUSD
```

All three must refer to the *same* candidate. The worker then authorizes the same DEMO account, checks the symbol identity, fetches the full symbol's price scale, and requests a **bounded** read-only historical M5 sample. It refuses to issue any trading request. The worker's normal response intentionally reports only counts, gaps and native phase; it does not claim parity and does not send raw OHLC to any gateway.

### Two-source parity gate

`qore-core/tools/crt_feed_parity/compare_ic_m5.py` consumes **two independently sourced, approved files**, with fixed schema:

```
origin,tv_symbol,broker,server,open_time_utc,open,high,low,close,closed
```

TradingView source: `TRADINGVIEW_IC`; cTrader source: `CTRADER_IC_DEMO`. The comparison defaults to **at least 600 overlapping closed M5 bars per symbol**, so the one-shot initial pilot (up to 300 bars) **cannot** establish parity. Multiple bounded batches and authorized TradingView evidence are required, and all 34 symbols must pass independent feed checks before CRT/MSS or push can be approved. **BTCUSD retains its distinct CRT recognition requirements**, even if the symbol name matches.

Open API's history endpoint is `ProtoOAGetTrendbarsReq` with `symbolId`, `period=M5`, timestamp window and count; M5 is enum 5 and native OHLC uses low-plus-delta integer representation at 100000 scale. Source: official Spotware cTrader Open API docs.

## Acceptance gates

1. 34 review rows, full unique IDs and manifest SHA-256; **Owner mapping review**, no silent auto-approval.
2. Single source M5 request with correct symbol and DEMO scope; prove closed timestamps, no phase shifts or synthetic data.
3. 600+ **real** paired closed M5 samples per symbol from TradingView IC and cTrader IC DEMO, with server identifiers and exact UTC timestamps.
4. If price differences, session phase gaps, index timezone/calendar, feed provenance or broker variants differ: **block** and reconcile rather than manufacture equivalence.
5. Only after positive source parity: certified causal CRT 7-family and independent M5/M15 MSS detection validation, then Android app/widget QA with TTL 4h.
6. Until then: `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`, `ownerApprovedMappings=0` on this manifest route.

No credentials, refresh tokens, market orders, final mobile alerts, prod deploy or code merge are part of this PR.
