import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const root = new URL("../../crt-radar-pro/qa-34-feed-memory-probes/", import.meta.url);
const read = name => readFileSync(new URL(name, root), "utf8");
const old = read("QORE_CRT_RADAR_34_CHART_V34_12W_IC_CHART_EXTERNO_FVG_NATIVE_QA_NO_LIVE.pine");
const now = read("QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine");
const engine = source => source.slice(source.indexOf("f_engine() =>"), source.indexOf("f_engine_snapshot() =>"));
const feeds = source => [...source.matchAll(/^s\d\d = "(IC:[^"]+)"$/gm)].map(m=>m[1]);
const requests = source => source.split("\n").filter(x=>x.includes("request.security(") && !x.trimStart().startsWith("//"));

test("X adds the 15 color pickers to Settings > Entradas de datos without losing code", ()=>{
 assert.ok(now.startsWith("//@version=6"));
 assert.ok(now.includes('shorttitle="QORE CRT 34+Chart 12X"'));
 assert.ok(now.includes('string grpChartColors = "04B / Colores de Chart (personalizables)"'));
 const expected={
  chartCrhQAColor:"CRH · CRT provisional QA",
  chartCrlQAColor:"CRL · CRT provisional QA",
  chartCrhRatColor:"CRH · ratificado",
  chartCrlRatColor:"CRL · ratificado",
  chartCrtHistColor:"CRH/CRL · historico QA",
  chartM5Color:"MSS M5 · propio",
  chartM5ExtraColor:"MSS M5 · familia extra QA",
  chartM15WaitColor:"MSS M15 · pendiente",
  chartM15DoneColor:"MSS M15 · confirmado",
  chartPdhIntactColor:"PDH · INTACTO",
  chartPdhTakenColor:"PDH · TOMADO",
  chartPdlIntactColor:"PDL · INTACTO",
  chartPdlTakenColor:"PDL · TOMADO",
  chartFvgBullColor:"FVG H4 · ALCISTA",
  chartFvgBearColor:"FVG H4 · BAJISTA",
 };
 for(const [name,title] of Object.entries(expected)){
  assert.ok(now.includes(name+" = input.color("), name);
  assert.ok(now.includes('"'+title+'"'), title);
 }
 assert.equal([...now.matchAll(/= input\.color\(/g)].length,15);
 assert.ok(now.includes("chartFvgFillOpacity = input.int(83,"));
 assert.ok(now.includes('max_boxes_count=5'));
 assert.ok(now.includes('Signal.new('));
 assert.ok(now.includes('line.delete(pdlChartLine)'));
});

test("CRH/CRL and M5/M15 colors update both new drawings and existing drawings",()=>{
 for(const x of [
  'color crhInk = chartCoreHistorical ? chartCrtHistColor : crtRatifiedForColor ? chartCrhRatColor : chartCrhQAColor',
  'color crlInk = chartCoreHistorical ? chartCrtHistColor : crtRatifiedForColor ? chartCrlRatColor : chartCrlQAColor',
  'line.new(t1,displayCRH,t2,displayCRH,xloc=xloc.bar_time,color=crhInk',
  'line.new(t1,displayCRL,t2,displayCRL,xloc=xloc.bar_time,color=crlInk',
  'line.set_color(hiLine,crhInk)',
  'line.set_color(loLine,crlInk)',
  'label.set_textcolor(hiLabel,crhInk)',
  'label.set_textcolor(loLabel,crlInk)',
  'color own5Ink = extraOwnM5 ? chartM5ExtraColor : chartM5Color',
  'line.set_color(m5Line,own5Ink)',
  'color m15Ink = m15BreakConfirmed ? chartM15DoneColor : chartM15WaitColor',
  'line.set_color(m15Line,m15Ink)',
 ]) assert.ok(now.includes(x),x);
});

test("PDH and PDL taken/intact colors remain independently selectable with no pricing changes",()=>{
 for(const x of [
  'color pdhInk = chartPdhTaken1D ? chartPdhTakenColor : chartPdhIntactColor',
  'color pdlInk = chartPdlTaken1D ? chartPdlTakenColor : chartPdlIntactColor',
  'line.set_color(pdhChartLine,pdhInk)',
  'line.set_color(pdlChartLine,pdlInk)',
  'label.set_textcolor(pdhChartLabel,pdhInk)',
  'label.set_textcolor(pdlChartLabel,pdlInk)',
  '"PDH TOMADO" : "PDH INTACTO"',
  '"PDL TOMADO" : "PDL INTACTO"',
  'request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time]',
 ]) assert.ok(now.includes(x),x);
});

test("bullish/bearish FVG colors and translucency apply to existing boxes/labels",()=>{
 for(const x of [
  'color ink = dir == 1 ? chartFvgBullColor : chartFvgBearColor',
  'color fillInk = color.new(ink, partial ? math.min(100,chartFvgFillOpacity + 5) : chartFvgFillOpacity)',
  'box.new(left=bornAt,top=zoneTop,right=endAt,bottom=zoneBottom,xloc=xloc.bar_time,border_color=color.new(ink,35),bgcolor=fillInk)',
  'box.set_bgcolor(b,fillInk)',
  'box.set_border_color(b,color.new(ink,35))',
  'label.set_textcolor(l,ink)',
 ]) assert.ok(now.includes(x),x);
 assert.ok(now.includes('chartFvgMaxZones = input.int(1'));
});

test("core engine, IC 34 feeder and alert suppression unchanged, no requests added",()=>{
 assert.equal(engine(now),engine(old));
 assert.deepEqual(feeds(now),feeds(old));
 assert.deepEqual(feeds(now),INSTRUMENTS.map(x=>x.tvSymbol));
 assert.equal(feeds(now).length,34);
 assert.ok(!now.includes("scheduleMode"));
 assert.ok(!now.includes("array.set(scanSymbols, 7"));
 assert.deepEqual(requests(now),requests(old));
 assert.equal(requests(now).length,5);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(now));
});
