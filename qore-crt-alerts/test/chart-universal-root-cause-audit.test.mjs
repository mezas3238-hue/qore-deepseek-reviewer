import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// AUDIT tests that DOCUMENT KNOWN FAILURES of V34.12S.
// PASS means the evidence reproduces on existing source; it is NOT
// a "universal chart is certified" test. When remediated, update this
// audit together with real positive universal eligibility tests.
const source=new URL(
 "../../crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12S_PDH_PDL_VISIBLE_DIARIO_QA_NO_LIVE.pine",
 import.meta.url);
const pine=readFileSync(source,"utf8");
const symbols=[...pine.matchAll(/^s(\d\d) = input\.symbol\("([^"]+)", "([^"]+)"/gm)]
 .map(m=>({slot:Number(m[1]),feed:m[2],label:m[3]}));
const inRadar=feed=>symbols.some(x=>x.feed===feed);
const zoneDistance=(price,top,bottom)=>price>top?price-top:price<bottom?bottom-price:0;

test("AUDIT A1: Chart CRT still has strict 34-feed broker/symbol allowlist",()=>{
 assert.equal(symbols.length,34);
 assert.equal(inRadar("IC:EURCAD"),true);
 assert.equal(inRadar("OANDA:EURCAD"),false);
 assert.equal(inRadar("OANDA:EURGBP"),true);
 assert.equal(inRadar("IC:EURGBP"),false);
 assert.equal(inRadar("BINANCE:ETHUSDT"),false);
 assert.equal(inRadar("NASDAQ:AAPL"),false);
 assert.ok(pine.includes("if available and ticker.standard(symbol) == integratedChartBroker"));
 assert.ok(pine.includes("bool chartAvailable = integratedSlot >= 0"));
 assert.ok(pine.includes('bool chartCoreActive = chartAvailable and'));
 // This proves code is NOT yet suitable for all chart symbols/providers.
});

test("AUDIT A2: FVG H4 still incorrectly depends on the radar 34 allowlist",()=>{
 assert.ok(pine.includes('bool fvgChartOK = chartStaticSlot >= 0 and showChartH4Fvg'));
 assert.ok(pine.includes('if ticker.standard(candidateSymbol) == integratedChartBroker'));
 assert.ok(pine.includes('chartStaticSlot := i'));
 assert.ok(pine.includes('request.security(syminfo.tickerid, "240"'));
 // The H4 request can exist for external symbols, but its drawing gate forbids it.
});

test("AUDIT A3: historical rank then current-price ATR filter drops a valid near FVG",()=>{
 assert.ok(pine.includes('float referencePrice = close[1]'));
 assert.ok(pine.includes('if na(bestDistance) or dist < bestDistance'));
 assert.ok(pine.includes('chartFvgMaxZones = input.int(1'));
 assert.ok(pine.includes('f_chartZoneDistance(close,fvg1Top,fvg1Bottom)'));
 const lastConfirmedClose=1.0700, livePrice=1.0900, atr=0.004;
 const zoneA={top:1.0710,bottom:1.0690}; // nearest historical, far live
 const zoneB={top:1.0903,bottom:1.0897}; // less near historical, near live
 const ranked=[zoneA,zoneB].sort((a,b)=>
   zoneDistance(lastConfirmedClose,a.top,a.bottom)-
   zoneDistance(lastConfirmedClose,b.top,b.bottom));
 assert.equal(ranked[0],zoneA);
 assert.ok(zoneDistance(livePrice,ranked[0].top,ranked[0].bottom)>1.5*atr);
 assert.equal(zoneDistance(livePrice,zoneB.top,zoneB.bottom),0);
 // With maxZones=1, zoneA is suppressed by ATR and zoneB never considered.
});

test("AUDIT A4: FVG strict wall-clock 4h adjacency excludes otherwise neighboring trading bars",()=>{
 assert.ok(pine.includes('time[k + 1] - time[k + 2] == H4MS'));
 assert.ok(pine.includes('time[k] - time[k + 1] == H4MS'));
 // Gaps across exchange close/weekends fail, regardless of adjacency in bar index.
 const lastBarBeforeClose=Date.parse("2026-11-02T16:00:00Z");
 const firstBarAfterOpen=Date.parse("2026-11-03T13:00:00Z");
 assert.notEqual(firstBarAfterOpen-lastBarBeforeClose,4*3600_000);
});

test("AUDIT A5: CRT is a 48h live/historical snapshot, not a durable event history",()=>{
 assert.ok(pine.includes('keepLastCRT = input.bool(true'));
 assert.ok(pine.includes('keepHours = input.int(48'));
 assert.ok(pine.includes('barstate.islast ? state : na'));
 assert.ok(pine.includes('calc_bars_count=600'));
 assert.ok(pine.includes('bool recent = keepLastCRT and'));
 assert.ok(pine.includes('bool chartCoreHistorical = chartAvailable and own.phase == 3'));
 assert.equal(600*5/60,50); // 50 clock hours of M5 in continuously open market
});

test("AUDIT A6: different chart timeframes have inconsistent visual-eligibility gates",()=>{
 assert.ok(pine.includes("timeframe.multiplier == 5 or timeframe.multiplier == 15 or timeframe.multiplier == 240"));
 assert.ok(pine.includes("timeframe.in_seconds(timeframe.period) <= H4MS / 1000"));
 assert.ok(pine.includes("timeframe.isdaily and timeframe.multiplier == 1"));
 // A 30m chart can show H4 FVG and Daily levels but not CRT, by code.
});

test("AUDIT A7: BTC chart changes fixed scanner feed source; source labels remain input",()=>{
 assert.ok(pine.includes('bool btcSameChart = str.upper(syminfo.ticker) == "BTCUSD"'));
 assert.ok(pine.includes('array.set(scanSymbols, 7, syminfo.tickerid)'));
 assert.ok(pine.includes('array.from(f_name(s01), f_name(s02), f_name(s03)'));
 assert.equal(symbols[7].feed,"IC:BTCUSD");
});

test("AUDIT A8: native Daily PDH/PDL are already provider-independent from radar on S",()=>{
 assert.ok(pine.includes('request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time], lookahead=barmerge.lookahead_on'));
 assert.ok(pine.includes('bool dailyDataOK = not na(dailyPDH)'));
 assert.ok(pine.includes('bool showPDLevels = showChartPDHPDL and chartTfSupportsDaily and dailyDataOK'));
 assert.ok(!pine.includes('bool dailyDataOK = sameDailySymbol'));
 assert.ok(pine.includes('var table chartDailyPanel = table.new(position.bottom_right,1,3'));
 // This is a POSITIVE existing feature; screenshot cannot establish that
 // the user actually loaded this exact latest file or that broker D data exists.
});

test("AUDIT A9: request count 37 <= 40 does not prove performance or Pine compilation",()=>{
 const reqs=pine.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//"));
 assert.equal(reqs.length,4);
 assert.equal(34+2+1,37);
 assert.ok(37<=40);
 assert.ok(pine.length>200000);
 assert.ok(pine.includes('dynamic_requests=true'));
 // Heavy stateful M5 UDT and histories must be tested in TradingView,
 // not inferred as runtime-green from offline Node tests.
});
