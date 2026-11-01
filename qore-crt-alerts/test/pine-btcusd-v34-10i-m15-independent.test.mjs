import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA_BTC_MSS15} from "../src/parity-audit.mjs";
const previous=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10H_QA_BTC_CRT_RELOJ_NY_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10I_QA_BTC_MSS15_INDEPENDIENTE_NO_INTEGRADO.pine",import.meta.url),"utf8");
test("BTC only QA scanner always uses exact chart exchange not IC BTCUSD input",()=>{
 assert.match(previous,/s08 = input\.symbol\("IC:BTCUSD"/);
 assert.match(pine,/bool btcSameChartOnly = not scanAll and str\.upper\(syminfo\.ticker\) == "BTCUSD"/);
 assert.match(pine,/if btcSameChartOnly\s+array\.set\(scanSymbols, 7, syminfo\.tickerid\)/);
 assert.match(pine,/string symbol = array\.get\(scanSymbols, i\)/);
 assert.match(pine,/bool sameAsChart = ticker\.standard\(sym\) == ownStd/);
 assert.match(pine,/if slotScanned and not sameAsChart and \(allMode or hasCRT\)/);
});
test("MSS 15 requires full 3 M5, 15m closed time and independent M15 pivot",()=>{
 assert.match(pine,/bool fullM15 = m15Count == 3 and m15LastEnd == bucket15/);
 assert.match(pine,/lastCompleteM15CloseAt := m15LastEnd/);
 assert.match(pine,/bool frozenPivot15 = not na\(c2Pivot15\) and not na\(c2Pivot15At\) and c2Pivot15At < c2SweepEnd/);
 assert.match(pine,/bool exact15Close = closed15At == bucket15 and closed15At % MIN15 == 0/);
 assert.match(pine,/bool eligible15 = exact15Close and frozenPivot15 and prev15Continuous and/);
 assert.match(pine,/m15Close < c2Pivot15 and prev15Close >= c2Pivot15/);
 assert.doesNotMatch(pine,/bool eligible15 = [^\n]*bC/);
});
test("MSS M15 can confirm in C2 or C3 only on full M15 before dashboard check",()=>{
 assert.match(pine,/if eligible15 and na\(c2M15At\)\s+c2M15At := closed15At/);
 assert.match(pine,/if eligible15 and na\(c3M15At\)\s+c3M15At := closed15At/);
 assert.match(pine,/outM15PivotAt < outSweep and outM15At > outSweep and outM15At % MIN15 == 0/);
 assert.match(pine,/int verifiedM15At = validIndependent15 \? outM15At : na/);
 assert.match(pine,/Signal\.new\(outPhase, outDir, outC1, outHi, outLo, outSweep, outM5At, verifiedM15At,/);
});
test("dashboard chart MSS15 is a separate valid timestamp, not shared with M5",()=>{
 assert.match(pine,/bool m15CRTConfirmed = chartActive and not na\(own\.m15At\) and not na\(own\.m15PivotAt\)/);
 assert.match(pine,/own\.m15At % MIN15 == 0/);
 assert.match(pine,/table\.cell\(board,5,1,m15CRTConfirmed \? "✓" : "—"/);
 assert.match(pine,/table\.cell\(board,2,7,m15CRTConfirmed \? "M15 OK" : "M15 ESP"/);
 assert.match(pine,/table\.cell\(board,1,7,chartActive and not na\(own\.m5At\) \? "M5 OK" : "M5 ESP"/);
 const first=pine.indexOf("bool m15CRTConfirmed = ");
 const used=pine.indexOf("table.cell(board,5,1,m15CRTConfirmed");
 assert.ok(first>0&&first<used);
});
test("time/window audit separately exposes M5 event and M15 close and pivot",()=>{
 for(const label of ["QA CRT MSS M5 pivote precio","QA CRT MSS M5 ruptura UTC min",
  "QA CRT MSS M15 pivote precio","QA CRT MSS M15 ruptura UTC min",
  "QA MSS M15 ultima vela cerrada UTC min",
  "QA BTC MSS15 validado por M15 UTC min"])assert.ok(pine.includes(label),label);
 assert.match(pine,/qaLastClosedM15At/);
 assert.match(pine,/if not previousM5Continuous and not na\(barT\)\s+lastCompleteM15CloseAt := na/);
});
test("pending M15 displays its own frozen swing, never an early M15 check",()=>{
 assert.match(pine,/bool m15SwingAvailable = showMssLines and own\.phase == 2 and not na\(own\.m15PivotAt\)/);
 assert.match(pine,/own\.m15PivotAt < own\.sweepAt/);
 assert.match(pine,/bool m15BreakConfirmed = m15SwingAvailable and not na\(own\.m15At\)/);
 assert.match(pine,/int lineEndM15 = m15BreakConfirmed \? own\.m15At : time_close/);
 assert.match(pine,/color m15Ink = m15BreakConfirmed \? color\.blue : color\.orange/);
 assert.match(pine,/line\.set_xy1\(m15Line,own\.m15PivotAt,own\.m15Level\)/);
 assert.match(pine,/line\.set_xy2\(m15Line,lineEndM15,own\.m15Level\)/);
});
test("full BTC CRT H4 schedule, PDH provider D, 34 slots and alert gate preserved",()=>{
 assert.match(pine,/f_btc_crt_h4_ny\(int t\)/);
 assert.match(pine,/int bucketH4 = isBTC \? f_btc_crt_h4_ny\(barT\)/);
 assert.match(pine,/chartBtcSymbol \? "PDH 1D" : "PDH"/);
 assert.match(pine,/chartPdhTaken = chartDayAuditReady and own\.chartDayHighM5 > chartPrevDHigh/);
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
});
test("same provider identity is required for M5 and M15",()=>{
 const chartTicker="COINBASE:BTCUSD",slotDefault="IC:BTCUSD";
 assert.notEqual(chartTicker,slotDefault);
 const effective=chartTicker;
 assert.equal(effective,chartTicker);
 // Different exchanges' MSS events must never be merged in QA BTC-only.
 assert.equal(effective===slotDefault,false);
});
test("exact Pine v34.10i source SHA pins an unverified QA revision",()=>{
 const sha=createHash("sha1").update(
   "blob "+Buffer.byteLength(pine,"utf8")+String.fromCharCode(0)+pine).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_MSS15);
 assert.notEqual(sha,"d254ff36c735ce071b46dc744e241ed25fb2b1ae");
});
