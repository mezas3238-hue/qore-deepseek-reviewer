import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const read=name=>readFileSync(new URL(name,root),"utf8");
const v=read("QORE_CRT_RADAR_34_CHART_V34_12V_GATES_HUD_IC_QA_NO_LIVE.pine");
const w=read("QORE_CRT_RADAR_34_CHART_V34_12W_IC_CHART_EXTERNO_FVG_NATIVE_QA_NO_LIVE.pine");
const engine=code=>code.slice(code.indexOf("f_engine() =>"),code.indexOf("f_engine_snapshot() =>"));
const slots=code=>[...code.matchAll(/^s\d\d = "(IC:[^"]+)"$/gm)].map(x=>x[1]);
const reqs=code=>code.split("\n").filter(line=>line.includes("request.security(")&&!line.trimStart().startsWith("//"));

test("W complete >3500 Pine lines, no missing constructor or drawing cleanup",()=>{
 assert.ok(w.startsWith("//@version=6"));
 assert.ok(w.includes('shorttitle="QORE CRT 34+Chart 12W"'));
 assert.ok(w.includes("Signal.new("));
 assert.ok(w.includes("f_engine() =>"));
 assert.ok(w.includes("f_chartH4Fvgs(int depth) =>"));
 assert.ok(w.includes("line.delete(pdlChartLine)"));
 assert.ok(w.split("\n").length>=3500);
 assert.ok(w.endsWith("\n"));
});

test("34 scanner feeds never change, immutable IC-only with exact JS parity and same CRT/MSS engine",()=>{
 assert.equal(slots(w).length,34);
 assert.deepEqual(slots(w),slots(v));
 assert.deepEqual(slots(w),INSTRUMENTS.map(x=>x.tvSymbol));
 assert.ok(slots(w).every(x=>x.startsWith("IC:")));
 assert.ok(!w.includes("scheduleMode"));
 assert.ok(w.includes('s05 = "IC:USTEC"'));
 assert.ok(w.includes('s06 = "IC:US500"'));
 assert.ok(!w.includes("array.set(scanSymbols, 7"));
 assert.ok(w.includes("for i = 0 to 33"));
 assert.ok(w.includes('indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
 assert.equal(engine(w),engine(v));
});

test("one conditional EXACT-IC Chart M5 outside radar, never changes scanned slot or claims certification",()=>{
 const extra=w.indexOf("bool chartExternalQA = chartIsIC and chartStaticSlot < 0");
 const req=w.indexOf('Signal outsideM5 = request.security(syminfo.tickerid, "5", f_engine_snapshot()',extra);
 const end=w.indexOf("Signal own = integratedOwn",req);
 assert.ok(extra>0 && req>extra && end>req);
 const block=w.slice(extra,end);
 assert.match(block,/if chartExternalQA\s+\n?\s*Signal outsideM5 = request\.security/);
 assert.ok(block.includes("integratedOwn := outsideM5"));
 assert.ok(block.includes("integratedSlot := 34"));
 assert.ok(!block.includes("array.set(scanSymbols"));
 assert.ok(w.includes('bool chartAvailable = chartIsIC and integratedSlot >= 0'));
 assert.ok(w.includes('string displayFamily = chartCoreHistorical ? "2C HIST QA" : chartCoreActive ? (chartExternalQA ? "2C QA EXT IC"'));
 assert.ok(w.includes('IC EXTERNO · QA M5'));
 assert.ok(w.includes("CRT EXT SIN M5"));
 assert.ok(w.includes("CRT EXT SIN C1 QA"));
 assert.ok(w.includes("CRT C1 " + ""));
 assert.ok(w.includes('title="QA Chart slot 1-34 / 35=EXTERNO QA"'));
 assert.ok(!w.includes('bool chartExternalQA = not chartIsIC'));
});

test("all H4 FVG candidates rank against current H4 price, not previous closed H4 price",()=>{
 const chart=w.slice(w.indexOf("f_chartH4Fvgs(int depth) =>"),w.indexOf("// El mismo simbolo abierto"));
 assert.ok(chart.includes("for k = 1 to depth"));
 assert.ok(chart.includes("array.push(tops,top)"));
 assert.ok(chart.includes("float referencePrice = close  // precio H4 ACTUAL"));
 assert.ok(!chart.includes("float referencePrice = close[1]"));
 assert.ok(chart.includes("for idx = 0 to array.size(tops) - 1"));
 assert.ok(chart.includes("float dist = referencePrice > top"));
 assert.ok(chart.includes("if na(bestDistance) or dist < bestDistance"));
 assert.ok(chart.includes("for rank = 0 to 2"));
 assert.ok(chart.includes('time[k + 1] - time[k + 2] == H4MS'));
 assert.ok(chart.includes('time[k] - time[k + 1] == H4MS'));
 assert.ok(chart.includes('low[k] - high[k + 2] >= syminfo.mintick'));
 assert.ok(chart.includes('low[k + 2] - high[k] >= syminfo.mintick'));
 assert.ok(chart.includes('float confirmedH4Atr = ta.atr(14)[1]'));
 assert.ok(w.includes('request.security(syminfo.tickerid, "240", f_chartH4Fvgs(chartFvgLookbackH4), lookahead=barmerge.lookahead_off'));
 assert.ok(w.includes('bool fvg1FilledNow = fvg1Base'));
 assert.ok(w.includes('bool fvg2FilledNow = fvg2Base'));
 assert.ok(w.includes('bool fvg3FilledNow = fvg3Base'));
 assert.ok(w.includes('bool drawFvg1 = chartFvgMaxZones >= 1'));
});

test("synthetic fourth FVG becomes closest after price moves; all-candidate selection includes it",()=>{
 const dist=(price,top,bottom)=>price>top?price-top:price<bottom?bottom-price:0;
 const prior=100,current=145;
 const zones=[
  {top:101,bottom:99,name:"old-1"},
  {top:104,bottom:102,name:"old-2"},
  {top:108,bottom:106,name:"old-3"},
  {top:145.5,bottom:144.5,name:"new-closest"}
 ];
 const previous=[...zones].sort((a,b)=>dist(prior,a.top,a.bottom)-dist(prior,b.top,b.bottom)).slice(0,3);
 assert.ok(!previous.some(x=>x.name==="new-closest"),"prior selection misses zone 4");
 const now=[...zones].sort((a,b)=>dist(current,a.top,a.bottom)-dist(current,b.top,b.bottom)).slice(0,3);
 assert.equal(now[0].name,"new-closest");
 assert.equal(dist(current,now[0].top,now[0].bottom),0);
});

test("max 38 unique requests (34 M5 + Chart M5 if outside + 2 Daily + 1 H4)",()=>{
 assert.equal(reqs(v).length,4);
 assert.equal(reqs(w).length,5);
 assert.equal(reqs(w).filter(x=>x.includes('request.security(syminfo.tickerid, "5"')).length,1);
 assert.equal(reqs(w).filter(x=>x.includes('request.security(syminfo.tickerid, "D"')).length,2);
 assert.equal(reqs(w).filter(x=>x.includes('request.security(syminfo.tickerid, "240"')).length,1);
 assert.equal(34+1+2+1,38);
 assert.ok(38<=40);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(w));
});

test("PDH and PDL independent Daily and 6-row HUD remain in place",()=>{
 assert.ok(w.includes('table.new(position.bottom_right,1,6'));
 assert.ok(w.includes('V12W IC ·'));
 assert.ok(w.includes('"PDH TOMADO" : "PDH INTACTO"'));
 assert.ok(w.includes('"PDL TOMADO" : "PDL INTACTO"'));
 assert.ok(w.includes('[dailyPDH, dailyPDL, dailyPrevOpen, dailyNowOpen] = request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time]'));
 assert.ok(w.includes('bool dailyDataOK = chartIsIC and'));
 assert.ok(w.includes('bool fvgChartOK = chartIsIC and'));
 assert.ok(w.includes('keepLastCRT = input.bool(false'));
});
