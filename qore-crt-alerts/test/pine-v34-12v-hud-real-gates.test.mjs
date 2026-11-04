import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const src=name=>readFileSync(new URL(name,root),"utf8");
const u=src("QORE_CRT_RADAR_34_CHART_V34_12U_IC_FVG_RELEVANCIA_QA_NO_LIVE.pine");
const v=src("QORE_CRT_RADAR_34_CHART_V34_12V_GATES_HUD_IC_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const slots=s=>[...s.matchAll(/^s\d\d = "(IC:[^"]+)"$/gm)].map(x=>x[1]);
const reqs=s=>s.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//"));

test("12V is complete; still 34 immutable IC feeds and same CRT/MSS algorithm",()=>{
 assert.ok(v.startsWith("//@version=6"));
 assert.ok(v.includes("Signal.new("));
 assert.ok(v.includes("f_chartH4Fvgs(int depth) =>"));
 assert.ok(v.includes("line.delete(pdlChartLine)"));
 assert.ok(v.split("\n").length>3400);
 assert.deepEqual(slots(v),INSTRUMENTS.map(x=>x.tvSymbol));
 assert.equal(slots(v).length,34);
 assert.ok(!v.includes("scheduleMode"));
 assert.ok(!v.includes("array.set(scanSymbols, 7"));
 assert.ok(v.includes('s05 = "IC:USTEC"'));
 assert.ok(v.includes('s06 = "IC:US500"'));
 assert.equal(engine(v),engine(u));
 assert.ok(v.includes('keepLastCRT = input.bool(false'));
});

test("no cross-component eight-gate waterfall: Daily and FVG remain independent",()=>{
 for(const token of [
  'bool chartAvailable = chartIsIC and integratedSlot >= 0',
  'bool fvgChartOK = chartIsIC and showChartH4Fvg',
  'bool dailyDataOK = chartIsIC and not na(dailyPDH)',
  'bool showPDLevels = showChartPDHPDL and chartTfSupportsDaily and dailyDataOK',
  'bool visualChartAligned = timeframe.isintraday and',
  'bool visible = visualChartAligned and',
 ])assert.ok(v.includes(token),token);
 assert.ok(!v.includes('bool showPDLevels = chartAvailable'));
 assert.ok(!v.includes('bool fvgChartOK = chartAvailable'));
 assert.ok(!v.includes('bool showPDLevels = visualChartAligned'));
});

test("bottom-right panel has 6 rows for independent DATA/FEED/CRT/FVG status",()=>{
 assert.ok(v.includes('table.new(position.bottom_right,1,6'));
 assert.ok(v.includes('V12V IC · '));
 assert.ok(v.includes('PDH TOMADO'));
 assert.ok(v.includes('PDH INTACTO'));
 assert.ok(v.includes('PDL TOMADO'));
 assert.ok(v.includes('PDL INTACTO'));
 for(const diagnostic of [
  'IC SIN SLOT RADAR 34',
  'FUENTE BLOQUEADA NO IC',
  'IC SLOT ',
  'CRT VISTA OFF',
  'CRT TF NO SOPORTADA',
  'CRT FUERA DE RADAR 34',
  'CRT SIN SNAPSHOT M5',
  'CRT SIN C1 VIGENTE',
  'FVG OFF',
  'FVG TF NO SOPORTADA',
  'FVG H4 SIN RELOJ',
  'FVG H4 SIN ATR',
  'FVG LEJOS/RELLENADOS',
  'FVG SIN ZONA VALIDA',
  'FVG VISIBLES '
 ])assert.ok(v.includes(diagnostic),diagnostic);
 for(let row=0;row<6;row++)assert.ok(v.includes("table.cell(chartDailyPanel,0,"+row+","));
 const panel=v.slice(v.indexOf('var table chartDailyPanel'),v.indexOf('var line hiLine'));
 assert.ok(!panel.includes('request.security('));
});

test("6/6 H4, BTC IC only, no emitted alerts/trading and same 37 request budget",()=>{
 assert.ok(v.includes('indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
 assert.equal(reqs(v).length,4);
 assert.deepEqual(reqs(v),reqs(u));
 assert.equal(34+2+1,37);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(v));
});

test("IC slot can still be absent due to missing Signal; expose separate diagnostic",()=>{
 assert.ok(v.includes("int chartStaticSlot = -1"));
 assert.ok(v.includes("if chartIsIC and ticker.standard(candidateSymbol) == integratedChartBroker"));
 assert.ok(v.includes("chartStaticSlot := i"));
 assert.ok(v.includes("bool available = not na(s) and not na(s.phase)"));
 assert.ok(v.includes("if available and chartIsIC and ticker.standard(symbol) == integratedChartBroker"));
 assert.ok(v.includes("integratedSlot := i"));
 assert.ok(v.includes('chartStaticSlot < 0 ? "CRT FUERA DE RADAR 34" : not chartAvailable ? "CRT SIN SNAPSHOT M5"'));
});
