# CRT RADAR PRO × QORE Trader Lab — 34-feed preflight, 2026-11-01

**Status: SOURCE INVENTORY 33/34 VERIFIED BY GITHUB API; REAL HOLDOUT BLOCKED; NO TRADING/FCM/LIVE.**

## Reuse existing Trader Lab, no rebuild
Native lab: [`mezas3238-hue/qore-core`](https://github.com/mezas3238-hue/qore-core), `src/qore/infrastructure/trader_lab/`, [QORE-TRADER-LAB-001](https://github.com/mezas3238-hue/qore-core/blob/main/docs/architecture/QORE-TRADER-LAB-001.md). Its lifecycle is RESEARCH→REPLAY→FAST_FORWARD→OOS→STRESS→MONTE_CARLO→RISK_REVIEW→CIBO_REVIEW→INDEPENDENT_VALIDATION. Lab has no execution authority. Its VT-08 CRT 4H AMD is **NOT** the same as the Pine CRT RADAR PRO H4+C2/C3+Inside/Multi-N+MSS M15, and results cannot be transferred without a versioned adapter and causal parity.

Pine candidate from `crt-radar-pro/CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine` in branch `feature/crt-radar-v34-10w-c1-reasons-34qa-20261101`, baseline fixed at creation of this research branch. This is **not** a LIVE-certified Pine version. The owner wants testing prior to every further phone install.

## Exact available sources (metadata verified 2026-11-01)
At GitHub API `fetch_workflow_run_artifacts`:
- `qore-core` run **35166210458**: 12 original M5 10Y source ZIPs + aggregate. Twelve non-expired, expiration **2026-12-16T00:21:18Z**.
- `qore-core` run **38193802541**: 21 additional original IC Markets cTrader M5 ZIPs + catalog/inventory. Twenty-one non-expired, expiration **2027-01-10T01:56:00Z**.
- **33/33** non-BTC entries of current Pine 34 catalog map ONE-TO-ONE to those datasets. `NAS100USD` in TradingView maps to source `NAS100`; `US500` maps to source `SP500`. Do **not** silently assume identical tick units or session calendars.
- Source **BTCUSD** (Pine slot 08) is **missing** from these 33 IC Markets cTrader artifacts. Owner's screenshots use `COINBASE:BTCUSD` for chart. A distinct, validated BTC M5 source is required; NEVER fabricate missing BTC from an index, reuse `IC:BTCUSD` as if it were Coinbase, or merge source identities.
- Provenance of 33 ZIPs is IC Markets cTrader DEMO. Pine uses a mixture of `IC:`, `OANDA:` and chart-specific Coinbase; broker/source **parity not established** even though symbol names match.
- `qore-core` issue [#837](https://github.com/mezas3238-hue/qore-core/issues/837) documents these artifacts, original SHA inventory and retention risks; preserving them privately/license-compliantly before expiry is a separate P0.

**Important:** GitHub API metadata was inspected; no 700+ MB broker RAW price artifacts were downloaded or published. Their actual annual coverage, continuity, SHA of extracted price data, bid/ask availability, license constraints and untouched holdout status have **not** been independently checked in this PR. These source datasets may already have served other research; **they cannot be silently relabeled fresh holdout**.

## Strict holdout protection
`trader-lab/34-instrument-source-preflight-2026-11-01.json` freezes 34 source IDs/slots, archive IDs, run IDs, expiration and status, but explicitly records:
- `real_price_replay_executed: false`
- `holdout_period_frozen: false`
- `data_license_verified: false`
- `immutable_methodology_binding: REQUIRED_BEFORE_REPLAY`
- `usable_holdout_count: 0`
- `BTCUSD`: `MISSING_SOURCE`

The `auditTraderLab34Preflight` gate returns `BLOCKED_HOLDOUT` until all 34 datasets have source SHA256, immutable as-of windows, a sealed untouched holdout, versioned engine fingerprint, source parity evidence and approved data usage. A CLI run with **no flags** exits 2 when blocked; `--expect-blocked` is for negative QA tests only and **does not mean holdout PASS**. No unregistered tuning on frozen OOS.

## Replay QA prepared (not true market holdout)
`replayCrt34StructuralQA` validates 34 independent provider-bound closed-H4 data arrays with monotonic chronology, no future bars, proper OHLC and H4 intervals. It invokes the existing `inspectCrtMorphologies` structural classifier. Test fixtures use 34 **SYNTHETIC** positive 2C scenarios solely to verify isolation and fail-closed behavior. This cannot certify actual prices, Pine runtime or profitability. NO MSS M15, FVG H1/H4, PDH/PDL or Android FCM results are inferred from this step.

## Procedure before real 34-market holdout
1. Freeze exact candidate Pine/JS engine SHA and 34 provider IDs. Complete comparison of VT-08/native Trader Lab input contracts with the indicator, not substitute one CRT algorithm for another.
2. Verify legal/approved private access and restore SHA from the original data vault. Do not commit broker OHLC or secrets to a public repository or unapproved cloud. Protect already-consumed research periods.
3. Obtain approved BTC M5 history from a reproducible source (prefer same exact source used for the TradingView screenshot when testing BTC Pine parity).
4. Freeze two disjoint windows *before looking at outcome results*: calibration for development and untouched OOS holdout. Pre-register pass/fail criteria, timestamps, provider-specific sessions/DST and full source/artifact/data digests.
5. Reconstruct H4/M15/H1 exclusively from chronological M5. Run the **same formalized** 2C/3C/Inside/Multi4/Multi-N algorithms for all 34, check exact C1/C2/C3, sweeps, independent MSS pivots and ratification, FVG and PDH/PDL. Preserve non-repaint by prefix-invariance on shortened replay.
6. Report `PASS/FAIL/BLOCKED` for each slot, including date coverage, accepted/rejected CRT by family, false positives, feed gaps/DST, independent MSS, duplicates, runtime/memory; `READY_TO_TEST_PINE` only after full replay and parity to the indicator. OOS failures are not an invitation to tune on the same holdout.
7. Then test Pine in TradingView Android on 2–3 independent charts and subsequently all 34 feeds, followed by Android push E2E. No user phone repeatedly installing uncertified versions.

## Existing native Trader Lab evidence and boundary
The [VT08 2022–2024 holdout workflow](https://github.com/mezas3238-hue/qore-core/blob/agent/vt08-r3-10-c2c3-fresh-holdout-001/.github/workflows/vt08-r3-10-fresh-holdout-2022-2024.yml) replays **7** specific Forex symbols in its own frozen narrow-B01 methodology. It cannot be repurposed or labeled 34 CRT RADAR PRO passes. The core [VT-08 family contract](https://github.com/mezas3238-hue/qore-core/blob/main/docs/architecture/QORE-TRADER-FAMILY-MODEL-001.md) requires FVG-based entry and different structural semantics. Reuse its replay/OOS governance, not its strategy conclusions.

## GitHub tests
`node --test qore-crt-alerts/test/trader-lab-crt-34-preflight.test.mjs`
`node qore-crt-alerts/scripts/trader-lab-crt-34-preflight.mjs --expect-blocked`
Default `node qore-crt-alerts/scripts/trader-lab-crt-34-preflight.mjs` must exit **2** (BLOCKED), until exact prerequisites are satisfied.

**Release state:** no commit to `main`, no merge, no LIVE, no FCM, no orders, no fake 34 real holdout claim.
