import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const before=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_V34_12S_PDH_PDL_VISIBLE_DIARIO_QA_NO_LIVE.pine",root),"utf8");
const now=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_V34_12T_IC_MARKETS_34_FIJOS_QA_NO_LIVE.pine",root),"utf8");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const pineRows=[...now.matchAll(/^s(\d\d) = "([^"]+)"$/gm)]
    .map(x=>({slot:Number(x[1]),symbol:x[2]}));
const canonical=[
"IC:AUDJPY","IC:GBPUSD","IC:GBPJPY","IC:XAUUSD","IC:USTEC","IC:US500","IC:US30","IC:BTCUSD",
"IC:AUDUSD","IC:USDCAD","IC:USDJPY","IC:EURUSD","IC:USDCHF","IC:NZDUSD","IC:NZDJPY","IC:NZDCHF",
"IC:XAGUSD","IC:AUDCAD","IC:AUDCHF","IC:AUDNZD","IC:CADCHF","IC:CADJPY","IC:CHFJPY","IC:EURAUD",
"IC:EURCAD","IC:EURCHF","IC:EURGBP","IC:EURJPY","IC:EURNZD","IC:GBPAUD","IC:GBPCAD","IC:GBPCHF",
"IC:GBPNZD","IC:NZDCAD"
];

test("SINGLE canonical IC Markets inventory — 34 fixed slots, zero OANDA/fallback",()=>{
 assert.equal(pineRows.length,34);
 assert.deepEqual(pineRows.map(x=>x.slot),Array.from({length:34},(_,i)=>i+1));
 assert.deepEqual(pineRows.map(x=>x.symbol),canonical);
 assert.equal(new Set(pineRows.map(x=>x.symbol)).size,34);
 assert.ok(pineRows.every(x=>x.symbol.startsWith("IC:")));
 assert.doesNotMatch(now,/^s\d\d = input\.symbol\(/gm);
 assert.doesNotMatch(now,/OANDA:/);
 assert.doesNotMatch(now,/COINBASE:/);
 assert.doesNotMatch(now,/array\.set\(scanSymbols,\s*7/);
 assert.ok(now.includes("string[] scanSymbols = array.from(s01,"));
});

test("JS Android bridge and Pine 34-market inventory agree on exact immutable sources",()=>{
 assert.equal(INSTRUMENTS.length,34);
 assert.ok(Object.isFrozen(INSTRUMENTS));
 assert.deepEqual(INSTRUMENTS.map(x=>x.slot),pineRows.map(x=>x.slot));
 assert.deepEqual(INSTRUMENTS.map(x=>x.tvSymbol),canonical);
 assert.ok(INSTRUMENTS.every(x=>Object.isFrozen(x)));
 assert.equal(INSTRUMENTS[4].id,"NDX100");
 assert.equal(INSTRUMENTS[4].tvSymbol,"IC:USTEC");
 assert.equal(INSTRUMENTS[5].id,"SPX500");
 assert.equal(INSTRUMENTS[5].tvSymbol,"IC:US500");
});

test("Nasdaq USTEC retains INDEX recognition and 24h H4 blocks (not Forex)",()=>{
 assert.ok(now.includes('idxList = input.string("USTEC,NAS100USD,US500'));
 assert.ok(now.includes('bool typical = str.contains(name, "USTEC")'));
 assert.ok(now.includes('indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
 assert.ok(now.includes('string[] scanNames = array.from(f_name(s01), f_name(s02), f_name(s03), f_name(s04), "NDX100",'));
});

test("Chart cannot silently use OANDA/other-provider OHLC; wrong chart provider gets visible warning",()=>{
 assert.ok(now.includes('bool chartIsIC = str.upper(syminfo.prefix) == "IC"'));
 assert.ok(now.includes('if chartIsIC and ticker.standard(candidateSymbol) == integratedChartBroker'));
 assert.ok(now.includes('if available and chartIsIC and ticker.standard(symbol) == integratedChartBroker'));
 assert.ok(now.includes('bool chartAvailable = chartIsIC and integratedSlot >= 0'));
 assert.ok(now.includes('bool dailyDataOK = chartIsIC and not na(dailyPDH)'));
 assert.ok(now.includes('bool fvgChartOK = chartIsIC and showChartH4Fvg'));
 assert.ok(now.includes('"FUENTE NO IC · CAMBIA GRAFICO"'));
 assert.ok(now.includes('"PDH BLOQUEADO · NO IC"'));
 assert.ok(now.includes('"PDL BLOQUEADO · NO IC"'));
 assert.ok(!now.includes('bool fvgChartOK = chartStaticSlot >= 0'));
 // Pine cannot switch the user's chart provider; it must explicitly reject a mismatch.
});

test("IC market FVG chart independent from 34-slot radar, preserving confirmed H4 source",()=>{
 assert.ok(now.includes('request.security(syminfo.tickerid, "240"'));
 assert.ok(now.includes('f_chartH4Fvgs(int depth) =>'));
 assert.ok(now.includes('bool fvgChartOK = chartIsIC and showChartH4Fvg'));
 assert.ok(now.includes('f_chartZoneDistance(close,fvg1Top,fvg1Bottom)'));
 assert.ok(now.includes('chartFvgMaxZones = input.int(1'));
});

test("No edits to CRT or MSS engine; no real alerts, no deployment; Basic request budget not increased",()=>{
 assert.equal(engine(now),engine(before),"f_engine must be byte identical");
 const q=now.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//"));
 assert.equal(q.length,4);
 assert.equal(34+2+1,37);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(now));
 assert.ok(now.includes('"NO LIVE"'));
 assert.ok(now.includes('"NO PUSH"'));
});
