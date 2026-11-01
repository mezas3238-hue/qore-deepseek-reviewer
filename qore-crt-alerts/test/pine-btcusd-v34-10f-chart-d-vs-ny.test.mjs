import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA_BTC_CHART_D} from "../src/parity-audit.mjs";
const old=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10E_QA_BTC_PDH_24X7_NY_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10F_QA_BTC_PDH_GRAFICO_VS_NY_NO_INTEGRADO.pine",import.meta.url),"utf8");
test("BTC previous 1D high/low comes directly from same chart ticker, confirmed day only",()=>{
 assert.match(pine,/\[chartPrevDHigh, chartPrevDLow, chartPrevDOpenAt, chartPrevDCloseAt\]\s*=\s*request\.security\(syminfo\.tickerid,\s*"D",\s*\[high\[1\], low\[1\], time\[1\], time_close\[1\]\],\s*lookahead=barmerge\.lookahead_on/);
 assert.match(pine,/chartTfForDailyComparison = timeframe\.isintraday or \(timeframe\.isdaily and timeframe\.multiplier == 1\)/);
 assert.match(pine,/chartPrevDHigh >= chartPrevDLow/);
 assert.doesNotMatch(pine,/request\.security\(syminfo\.tickerid,\s*"D",\s*\[high, low,/);
});
test("BTC top status explicitly NY, broker D is separately displayed with levels and window",()=>{
 assert.match(pine,/chartBtcSymbol \? "PDH NY" : "PDH"/);
 assert.match(pine,/chartBtcSymbol \? "PDL NY" : "PDL"/);
 for(const label of ["PDH 1D GRAF","PDL 1D GRAF","PDH/PDL NY",
   "QA BTC PDH 1D GRAFICO precio","QA BTC PDL 1D GRAFICO precio",
   "QA BTC D proveedor inicio UTC min","QA BTC D proveedor cierre UTC min"])
   assert.ok(pine.includes(label),"Missing "+label);
 assert.match(pine,/chartPrevDOpenAt, "dd\/MM HH:mm", syminfo\.timezone/);
 assert.match(pine,/chartPrevDCloseAt, "dd\/MM HH:mm", syminfo\.timezone/);
});
test("two calendar definitions need not have same PDH; compare equal feed + timestamp",()=>{
 const chartPrevDay={high:81700,low:76940,exchangeDailyOpenUtc:"00:00"};
 const nyPrevDay={high:77747.48,low:76954.57,nyDayOpenUtc:"04:00"};
 assert.notEqual(chartPrevDay.high,nyPrevDay.high);
 assert.ok(chartPrevDay.high>nyPrevDay.high);
 assert.equal(chartPrevDay.exchangeDailyOpenUtc!=="04:00",true);
});
test("no CRT engine, M15 logic, 34 slots or NY liquidity logic is rewritten",()=>{
 assert.equal((pine.match(/^s\d\d\s*=\s*input\.symbol\(/gm)||[]).length,34);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.match(pine,/left15 = input\.int\(2/);
 assert.match(pine,/right15 = input\.int\(2/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.match(pine,/bool pdhInSession = not na\(time\("5", pdhSession, TZ\)\[1\]\)/);
 assert.match(pine,/bool validC2Data = [^\n]+h4Count == 48/);
 assert.match(pine,/f_engine_snapshot\(\)\s*=>\s*Signal state = f_engine\(\)/);
 assert.match(old,/PDH\/PDL NY/);
 assert.doesNotMatch(old,/PDH 1D GRAF/);
});
test("Pine BTC 1D vs NY QA is a separate exact-hash noncertified candidate",()=>{
 const sha=createHash("sha1").update(
   "blob "+Buffer.byteLength(pine,"utf8")+String.fromCharCode(0)+pine
 ).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_CHART_D);
 assert.notEqual(sha,"3c51656418313fb51172e03657eed3bf37b0e4e1");
});
