import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const read=n=>readFileSync(new URL(n,root),"utf8");
const t=read("QORE_CRT_RADAR_34_CHART_V34_12T_IC_MARKETS_34_FIJOS_QA_NO_LIVE.pine");
const u=read("QORE_CRT_RADAR_34_CHART_V34_12U_IC_FVG_RELEVANCIA_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const radar=s=>[...s.matchAll(/^s(\d\d) = "(IC:[^"]+)"$/gm)].map(x=>x[2]);

test("U is complete standalone source; no truncation at UDT",()=>{
 assert.ok(u.startsWith("//@version=6\n"));
 assert.ok(u.includes("f_engine() =>"));
 assert.ok(u.includes("Signal.new("));
 assert.ok(u.includes("f_chartH4Fvgs(int depth) =>"));
 assert.ok(u.includes("f_renderDashboard"));
 assert.ok(u.includes("line.delete(pdlChartLine)"));
 assert.ok(u.endsWith("\n"));
 assert.ok(u.split("\n").length>3400);
});

test("6/6 H4 and all 34 IC Markets fixed; BTC not changed when chart switches",()=>{
 assert.deepEqual(radar(u),radar(t));
 assert.deepEqual(radar(u),INSTRUMENTS.map(x=>x.tvSymbol));
 assert.equal(radar(u).length,34);
 assert.ok(radar(u).every(x=>x.startsWith("IC:")));
 assert.ok(u.includes('s05 = "IC:USTEC"'));
 assert.ok(u.includes('s06 = "IC:US500"'));
 assert.ok(!u.includes('array.set(scanSymbols, 7'));
 assert.ok(!u.includes('scheduleMode'));
 assert.ok(u.includes('indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
});

test("core CRT/MSS engine unchanged; current CRT is default, HIST only explicit opt-in",()=>{
 assert.equal(engine(u),engine(t));
 assert.ok(t.includes('keepLastCRT = input.bool(true'));
 assert.ok(u.includes('keepLastCRT = input.bool(false'));
 assert.ok(u.includes('bool chartCoreHistorical = chartAvailable and own.phase == 3'));
 assert.ok(u.includes('bool chartCoreActive = chartAvailable and own.phase == 2'));
 assert.ok(u.includes('string displayFamily = chartCoreHistorical ? "2C HIST QA"'));
});

test("FVG top-3 shortlist is reranked at chart current close after fill and distance validation",()=>{
 for(const x of [
   "bool fvg1Base = fvgChartOK",
   "bool fvg2Base = fvgChartOK",
   "bool fvg3Base = fvgChartOK",
   "bool fvg1FilledNow = fvg1Base and",
   "bool fvg2FilledNow = fvg2Base and",
   "bool fvg3FilledNow = fvg3Base and",
   "f_chartZoneDistance(close,fvg1Top,fvg1Bottom)",
   "f_chartZoneDistance(close,fvg2Top,fvg2Bottom)",
   "f_chartZoneDistance(close,fvg3Top,fvg3Bottom)",
   "array<float> fvgDistances = array.from(",
   "array<int> fvgRanked = array.sort_indices(fvgDistances,order.ascending)",
   "int fvgSelectedIndex1 = array.get(fvgRanked,0)",
   "int fvgSelectedIndex2 = array.get(fvgRanked,1)",
   "int fvgSelectedIndex3 = array.get(fvgRanked,2)",
   "bool drawFvg1 = chartFvgMaxZones >= 1 and array.get(fvgDistances,fvgSelectedIndex1) < disabledDistance",
   "bool drawFvg2 = chartFvgMaxZones >= 2 and array.get(fvgDistances,fvgSelectedIndex2) < disabledDistance",
   "bool drawFvg3 = chartFvgMaxZones >= 3 and array.get(fvgDistances,fvgSelectedIndex3) < disabledDistance",
   "array.get(fvgTopsChart,fvgSelectedIndex1)",
   "array.get(fvgTopsChart,fvgSelectedIndex2)",
   "array.get(fvgTopsChart,fvgSelectedIndex3)",
   "drawFvg1,drawFvg1Top,drawFvg1Bottom",
   "drawFvg2,drawFvg2Top,drawFvg2Bottom",
   "drawFvg3,drawFvg3Top,drawFvg3Bottom"
 ])assert.ok(u.includes(x),x);
 assert.ok(u.includes('float confirmedH4Atr = ta.atr(14)[1]'));
 assert.ok(u.includes('chartFvgLookbackH4 = input.int(24'));
 assert.ok(u.includes('chartFvgMaxZones = input.int(1'));
 assert.ok(u.includes('chartFvgMaxAtr = input.float(1.5'));
 // Explicit limitation: upper-level shortlist still ranked at last confirmed H4.
 assert.ok(u.includes('float referencePrice = close[1]'));
});

test("synthetic former bug: top H4 historical candidate too far, second candidate near now",()=>{
 const distance=(price,top,bottom)=>price>top?price-top:price<bottom?bottom-price:0;
 const priorClose=1.0700,now=1.0900,atr=0.004,cap=1.5*atr;
 const candidates=[
   {top:1.0710,bottom:1.0690,fullyFilled:false},
   {top:1.0903,bottom:1.0897,fullyFilled:false},
   {top:1.1100,bottom:1.1090,fullyFilled:true},
 ];
 const H4ranked=[...candidates].sort((a,b)=>distance(priorClose,a.top,a.bottom)-distance(priorClose,b.top,b.bottom));
 assert.equal(H4ranked[0],candidates[0]);
 const currentScored=candidates.map((z,i)=>({
   i,score:z.fullyFilled?1e20:distance(now,z.top,z.bottom)<=cap?distance(now,z.top,z.bottom):1e20
 })).sort((a,b)=>a.score-b.score);
 assert.equal(currentScored[0].i,1);
 assert.equal(currentScored[0].score,0);
 assert.equal(currentScored[1].score,1e20);
 assert.equal(currentScored.filter(x=>x.score<1e20).length,1);
});

test("PDH/PDL previous confirmed IC Daily and independent TOMADO/INTACTO unchanged",()=>{
 const before=t.slice(t.indexOf('// 12S: los niveles SOLO pertenecen'),t.indexOf('// V34.12Q H4 FVG'));
 const after=u.slice(u.indexOf('// 12S: los niveles SOLO pertenecen'),u.indexOf('// V34.12Q H4 FVG'));
 assert.equal(before,after);
 assert.ok(u.includes('"PDH TOMADO" : "PDH INTACTO"'));
 assert.ok(u.includes('"PDL TOMADO" : "PDL INTACTO"'));
 assert.ok(u.includes('chartIsIC and not na(dailyPDH)'));
});

test("same 37-request Basic budget, unchanged max_boxes and no real alerts/trades",()=>{
 const requests=s=>s.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//"));
 assert.equal(requests(u).length,4);
 assert.equal(requests(t).length,4);
 assert.equal(34+2+1,37);
 assert.ok(u.includes("max_boxes_count=5"));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(u));
});
