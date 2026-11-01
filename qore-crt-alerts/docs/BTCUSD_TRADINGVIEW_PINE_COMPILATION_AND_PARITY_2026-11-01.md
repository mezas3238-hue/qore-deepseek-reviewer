# BTCUSD — Compilación real TradingView y paridad Pine ↔ backend

**1 de noviembre de 2026 · PR #55 DRAFT · NO LIVE / NO MERGE**

## Estado verificado versus NO verificado

- **Node static source preflight:** GitHub Actions passes. Validates exact
  Git blob SHA, Pine v6 header, BTC slot, America/New_York, Forex
  01/05/21 C1, 24x7 0100 H4 bucket, M5 `lookahead_off`,
  disabled alert default, and 12 Data Window audit plots.
  **A text-only check is not a Pine compiler**.
- **Backend fixtures:** BTC M5 → 3×H4 CRT → frozen MSS M15 →
  SHA audit → blocked Android preview passed in CI. This is not
  TradingView/real market parity.
- **Historical real Coinbase spot data:** archived from GitHub Actions
  with exact M5 OHLC and SHA-256; its public REST feed was actually
  fetched; it is not automatically the same dataset used by
  `COINBASE:BTCUSD` TradingView charts.
- **TradingView compilation:** NOT PERFORMED. Exact QA Pine candidate
  source is available in GitHub; a human/authorized TradingView browser
  session is required to compile and read the actual Data Window.
- **Same-source comparison:** NOT PERFORMED. Pine template remains
  `verifiedOnTradingView:false`. Never fill it from backend predictions.
- **FCM live delivery / real phone market E2E:** NOT PERFORMED.

## 1. Script exacto a compilar, sin cambiar la versión oficial

Pine QA V34.10b (candidate; do NOT merge into V34.9):

https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/qore-crt-alerts-contract-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine

Known unmodified Git blob SHA:
`9a572500608fefbc24ae89b99d2e876529d0bfa5`.

This version includes 34 slots, including the **BTCUSD slot**
(`s08`) with DEFAULT `IC:BTCUSD` (CFD); this is NOT the Coinbase
spot ticker. The QA indicator code must remain unmodified so the
backend's current expected Pine SHA is valid. Change the **BTCUSD
symbol input in indicator Settings**, not the source code.

## 2. Android-only browser procedure

1. Open Chrome for Android and visit
   https://www.tradingview.com/chart/ ; sign in to the TradingView
   account. If Pine Editor controls are missing, try Chrome
   **Desktop site**; mobile UI support is browser-dependent.
   The native TradingView Android app may not present the Pine Editor.
2. Select **`COINBASE:BTCUSD` spot** chart, **5 minutes** for exact
   closed-bar timing (15m can be checked additionally).
   Do NOT select `COINBASE:BTCUSD.P` perpetual futures,
   `IC:BTCUSD` CFD, or `BTCUSDT`; their OHLC differs.
3. In the Pine Editor create a *new private indicator copy*.
   Open the GitHub candidate in another Chrome tab, copy all **1386
   lines** and paste; use **Add to chart** / **Save**. Capture the
   actual TradingView compiler output and any error line number.
   Do not publish, share, or overwrite official V34.9.
4. In the indicator Settings, set BTCUSD symbol input (slot 08) to
   `COINBASE:BTCUSD`; keep **Escaneo C1 = Solo C1 de tres
   horarios NY** and NY `America/New_York`. Other 33 symbols
   are unchanged. Keep QA alerts OFF. Confirm 01→05→09,
   05→09→13 and 21→01→05 in the NY timezone.
5. Confirm that script loads on the chart; make a screenshot with
   complete ticker/exchange, 5m timeframe, indicator version,
   compiler result and the relevant on-chart CRT state.
   **One screenshot of just a green indicator name is not proof of
   zero compiler warnings or exact event parity.**

Official TradingView editor guide:
https://es.tradingview.com/support/solutions/43000763320/

## 3. Compare chart and backend on ONE exact M5 dataset

Use the run's read-only public market parity artifact:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41312593663

The artifact contains:
- `btcusd-source-m5.json`: every retrieved closed Coinbase spot M5,
  original provider `COINBASE_SPOT_PROBE`, UTC milliseconds and SHA.
- `btcusd-backend-audit.json`: backend phase/pivots, only when
  C1+C2 are fully closed and C3 has a completed M5.
- `btcusd-pine-capture-UNVERIFIED-template.json`: all 12 exact
  Pine Data Window plot labels, intentionally NULL and
  `verifiedOnTradingView:false`.
- `btcusd-packet-status.json`: completeness, C1 and reasons.

**Important:** on 2026-11-01 the source sample crosses NY DST
fall-back and the snapshot correctly holds with
`c1Start:null` / `BACKEND_INCOMPLETE`. Do NOT claim a successful
same-source parity test from that dataset. A complete, unambiguous
NY CRT cycle with C1 and C2 closed + C3 forming must be captured.

The Pine Chart Data Window has these twelve fields, all compared:
1. AUDIT estado CRT grafico (1=provisional 2=activo 3=ultimo)
2. AUDIT direccion CRT grafico (+1/-1)
3. QA CRT C1 inicio UTC min
4. QA CRT C2 inicio UTC min
5. QA CRT C2 ratificacion UTC min
6. QA CRT barrida C2 fin UTC min
7. QA CRT MSS M5 pivote precio
8. QA CRT MSS M5 pivote UTC min
9. QA CRT MSS M5 ruptura UTC min
10. QA CRT MSS M15 pivote precio
11. QA CRT MSS M15 pivote UTC min
12. QA CRT MSS M15 ruptura UTC min

M5 and M15 UTC *time plots* are minutes-since-epoch;
backend audit times are UTC milliseconds. Use real precise values;
`na` means `null`, never 0. Verify OHLC timestamps from
TradingView against the Coinbase public REST dataset first: provider
name matching does NOT prove prices match. If source OHLC differ,
record `SOURCE_OHLC_MISMATCH` and resolve; do not use backend's
computed hash as "proof" that TradingView used those same bars.

Only after recording actual Pine data for the same timestamp/source,
fill the capture template, setting `verifiedOnTradingView:true`
as an operator attestation after genuine compilation. Then execute:

```sh
cd qore-crt-alerts
npm run parity -- parity-artifacts/btcusd-source-m5.json pine-capture.json
```

Compare the 12 fields, maintain individual mismatch evidence and
reproduce again with a second closed CRT cycle. `MATCH_UNCERTIFIED`
is diagnostic only, never a release approval.

## 4. Expected next outcome

A first verified screenshot should report one of:
`PINE_COMPILE_OK`, `PINE_COMPILE_ERROR` with message/line, or
`PINE_EDITOR_UNAVAILABLE_ON_ANDROID`. None can be assumed by
GitHub Actions; **only actual TradingView execution establishes it**.

Once compiled, separate *runtime* and *provider OHLC* differences
from *algorithmic* differences, fix candidate code only on review
branch, then retest. Keep Firebase/push gating disabled until an
independent certified E2E process authorizes it.
