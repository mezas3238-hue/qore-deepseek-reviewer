# CRT RADAR PRO — Trader Lab source provenance and causal M5 adapter (2026-11-02)
**DRAFT | NO HOLDOUT PASS | NO LIVE/ORDERS/FCM | no raw market data accessed**

## Verified archival origin correction
Original 33-source inventory remains in `qore-crt-alerts/trader-lab/34-instrument-source-preflight-2026-11-01.json`, now schema **v2**. It has all 34 slots, including missing BTCUSD. Using the GitHub Actions metadata from `qore-core`:
- **12 Atlas** original M5 artifacts, run 35166210458: `CTRADER_DEMO_ATLAS_BROKER_UNVERIFIED`. GitHub verified existence and ZIP digest; the original 12 are NOT currently proven to come from the exact IC Markets account. Their expiry is **2026-12-16T00:21:18Z**.
- **21 IC Markets** M5 artifacts, run 38193802541: exact broker catalog IC Markets DEMO was verified by the source acquisition, but TradingView same-feed price parity remains unproven. Expiry **2027-01-10T01:56:00Z**.
- Each artifact records the actual GitHub ZIP SHA256 `digest`, run ID, artifact ID, original head SHA, expiration and name. A ZIP digest is NOT the digest of underlying decompressed OHLC.
- `BTCUSD` still has no M5 archive from these two source cohorts.
- Both cohorts have been consumed in earlier research. Their previous in-sample/OOS windows cannot be relabeled untouched holdout.
- The manifest is RESEARCH METADATA ONLY; no original price rows are duplicated into public Git and there is no broker API access in this PR.

## Deterministic M5 bridge
`src/trader-lab-raw-m5-causal-bridge.mjs`:
1. `decodeCTraderRawM5` accepts one immutable native cTrader JSONL record with `low_relative`, `delta_open/high/close`, exact UTC minute, `opened_at`, account/source symbol ID and digits. Reconstructs full OHLC from provider-relative INTEGER units. No fabricated decimal scale, no cross-broker unit conversion, no use for orders.
2. `buildNyH4FromClosedM5` checks chronological M5 identity, validated OHLC, exact closed timestamp, New York local C1 buckets (Forex/crypto 01/05/21, indices 02/06/22), **48 contiguous M5 and actual NY local H4 close**. Rejects partial sessions, internal gaps, 36/60-bar DST blocks and **48-bar fall-back prefixes** that have not reached 05:00 New York. Does not stitch across weekends or providers.
3. `run34CrtM5ContextQA` accepts exactly 34 distinct feeds, converts M5 to closed H4, applies existing `inspectCrtMorphologies` only as structural QA, and reports counts/reasons without prices, push or market-action authority.
4. Tests include all **34 independent synthetic M5 streams**, valid H4 + 2C fixtures, error cases for provider mixing, native integer decoding, out-of-order/future/duplicate M5, incomplete H4 and both New York 2026 DST transitions. A successful result is NOT a market-data holdout.

## Current hard gate
The v2 source preflight returns `BLOCKED_HOLDOUT` until all of:
- source data license/read permission verified; approved private custody, SHA source content restore;
- exact source account/broker for Atlas 12 and TradingView parity verified;
- approved historical BTC M5 provider;
- preregistered disjoint calibration & untouched evaluation windows, versioned SHA of exactly which detector is tested;
- full valid per-model H4/MSS M5/M15/FVG/PDH/PDL parity, no-lookahead/prefix tests;
- subsequent Pine compilation and Android push E2E.

**Important limitation:** this new bridge tests H4 structural 2C/3C/Inside/Multi-N classifications (nontrading, noncertified). It does NOT yet execute the complete Pine engine, and 34 successful synthetic cases do NOT prove detection of all seven catalog categories in real markets. Native `VT-08` is separate methodology; QORE Trader Lab governance may be reused but its performance outcomes must not be inherited.

## References
- [Native Trader Lab preflight PR #1004](https://github.com/mezas3238-hue/qore-core/pull/1004)
- [Pine scanner source PR #69](https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/69)
- [QORE original sources issue #837](https://github.com/mezas3238-hue/qore-core/issues/837)
- [Original Atlas 12 metadata](https://github.com/mezas3238-hue/qore-core/actions/runs/35166210458)
- [IC Markets new 21 metadata](https://github.com/mezas3238-hue/qore-core/actions/runs/38193802541)
