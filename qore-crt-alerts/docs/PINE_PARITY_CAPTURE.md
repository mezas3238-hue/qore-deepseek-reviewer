# PARITY LAB — Pine Script QA vs QORE CRT ALERTS
31 Oct 2026 • Candidate ONLY • no LIVE • no merge or release

## Confirmed source and strict scope

Repository: mezas3238-hue/qore-deepseek-reviewer
Pine QA file: crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine
Pine blob SHA (required): 9a572500608fefbc24ae89b99d2e876529d0bfa5
Backend comparison: qore-crt-alerts/src/parity-audit.mjs
Source code is NOT compiled/certified by this laboratory.

Use only ONE identical data source and ONE exact instrument / provider for
each comparison. Prefer EURCAD and GBPAUD as visual QA targets because
their CRT/MSS locations were previously questioned. Do not call two
different providers equivalent without an independently validated feed
mapping, trading calendar and reconciliation.

The valid first-scope observation is after a real C2 H4 has closed and
while C3 is still forming; take a screenshot/Data Window reading after at
least one C3 M5 is closed. Do NOT record a post-C3-close snapshot for this
contract; Pine's subsequent displayed phase is not yet modeled here.

## 1. TradingView Pine Editor capture (human verification required)

1. Open exact QA Pine candidate at the recorded blob SHA. Paste into
   TradingView Pine Editor, compile, and RECORD the compiler result.
   This tool cannot compile the Pine script for you. Do not describe
   compilation as successful without a screenshot/compiler diagnostic.
2. Use the same provider symbol as in the source M5 evidence. Use the
   authorized NY C1 timetable, and set the correct indicator inputs.
3. Inspect the CURRENT CRT and the Data Window at the same known M5 close
   within C3. Record chart exchange, full ticker, timezone, source prices,
   actual closed M5 timestamp, settings and an image of the chart + Data
   Window. An image alone cannot prove parity.
4. Copy the exact numbers (not rounded approximations). Data Window time
   fields here are UTC MINUTES since epoch because Pine plots timestamp/60000.
   A missing NA value must be entered as JSON null, never as 0.
5. Export the underlying *closed* M5 OHLC bars with original provider and
   UTC millisecond timestamps; C1+C2 and observed part of C3 need to be
   present, as well as enough PRE-C1 history to confirm MSS 2/2 swings.
   No synthetic fill for downtime or missing M5 allowed.

## 2. Source dataset JSON to pass to the comparison utility

Create dataset.json:
{
  "sourceId": "IMMUTABLE_SOURCE_ID",
  "family": "forex",
  "c1Start": 0,
  "candlesM5": []
}

Replace placeholders with one real series. Each element of candlesM5 has:
provider (string), instrumentId (string), openedAt (UTC Unix ms),
closedAt (openedAt+300000), open, high, low, close (finite numbers).
Do not use this template unmodified: a blank dataset must FAIL.

Run from qore-crt-alerts/:
  npm test
  npm run parity -- dataset.json

The first command runs offline tests. The second command prints the backend
fields and canonical candleSha256, and exits code 2 with PINE_EVIDENCE_MISSING.
That is EXPECTED until an independent TradingView capture exists.

## 3. Pine capture JSON

Create pine-capture.json with the same sourceId/provider/instrumentId/C1,
the printed candleSha256 from the data processed above, and the actual
Data Window values from the exact Pine QA script.

Template (all numbers below NULL because no real evidence supplied):
{
  "schema": "QORE_CRT_PARITY_V1",
  "engine": "TRADINGVIEW_PINE_EDITOR_CAPTURE",
  "pineBlobSha": "9a572500608fefbc24ae89b99d2e876529d0bfa5",
  "verifiedOnTradingView": false,
  "sourceId": "IMMUTABLE_SOURCE_ID",
  "candleSha256": "REPLACE_WITH_ACTUAL_SHA256",
  "instrumentId": "EURUSD",
  "provider": "REPLACE_WITH_VERIFIED_PROVIDER",
  "c1Start": 0,
  "evidenceLocator": "REPLACE_WITH_REAL_CAPTURE_ID_OR_LINK",
  "dataWindow": {
    "AUDIT estado CRT grafico (1=provisional 2=activo 3=ultimo)": null,
    "AUDIT direccion CRT grafico (+1/-1)": null,
    "QA CRT C1 inicio UTC min": null,
    "QA CRT C2 inicio UTC min": null,
    "QA CRT C2 ratificacion UTC min": null,
    "QA CRT barrida C2 fin UTC min": null,
    "QA CRT MSS M5 pivote precio": null,
    "QA CRT MSS M5 pivote UTC min": null,
    "QA CRT MSS M5 ruptura UTC min": null,
    "QA CRT MSS M15 pivote precio": null,
    "QA CRT MSS M15 pivote UTC min": null,
    "QA CRT MSS M15 ruptura UTC min": null
  }
}

Only set verifiedOnTradingView:true after the owner/operator has actually
performed the Editor compilation and captured the matching Data Window.
This is an operator attestation, NOT cryptographic proof of TradingView
provenance. Independently review screenshots and original export files.

Run:
  npm run parity -- dataset.json pine-capture.json

Exit codes: 0 = MATCH_UNCERTIFIED (still not certified, no LIVE);
1 = PARITY_MISMATCH; 2 = MISSING/BLOCKED/INVALID EVIDENCE.
Compare field-by-field. Do not suppress mismatches. If one happens, record
source, timestamp, pivot and candle evidence; open a QA candidate issue.

## 4. Non-negotiable release gates

Pine compilation evidence, matching provider calendar and raw M5, 34 symbol
audit, no-repaint proof, independent replay equivalence, context modules,
FCM+Android physical device, and staging E2E remain open. Passing 86 unit
tests or obtaining a MATCH_UNCERTIFIED report alone DOES NOT close them.
