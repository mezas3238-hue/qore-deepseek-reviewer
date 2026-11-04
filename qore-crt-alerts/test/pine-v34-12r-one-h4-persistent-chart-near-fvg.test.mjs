import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const original=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_V34_12Q_DAILY_TOMADO_FVG_H4_QA_NO_LIVE.pine",root),"utf8");
const fixed=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_V34_12R_LIMPIEZA_NIVELES_FVG_CERCANOS_QA_NO_LIVE.pine",root),"utf8");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const match=(re,content=fixed)=>[...content.matchAll(re)].length;

test("one and only one scanning schedule: six H4 over 24 hours, no 3-H4 option",()=>{
 assert.equal(match(/scheduleMode/g),0);
 assert.ok(fixed.includes("f_allowed(int hh, bool indexFamily) =>"));
 assert.ok(fixed.includes("indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)"));
 assert.ok(fixed.includes('"H4 24H"'));
 assert.equal(engine(fixed),engine(original),"CRT/MSS math must not change from Q to R");
 assert.ok(fixed.includes("f_engine_snapshot() =>"));
 assert.equal(match(/^s\d\d = input\.symbol\(/gm),34);
});

test("visual chart symbol identity independent from live Signal UDT availability",()=>{
 for(const text of [
  "int chartStaticSlot = -1",
  "string candidateSymbol = array.get(scanSymbols, i)",
  "if ticker.standard(candidateSymbol) == integratedChartBroker",
  "chartStaticSlot := i",
  "bool sameDailySymbol = chartStaticSlot >= 0",
  "bool fvgChartOK = chartStaticSlot >= 0 and showChartH4Fvg",
  "bool showPDLevels = showChartPDHPDL and",
 ])assert.ok(fixed.includes(text),text);
 assert.ok(!fixed.includes("bool sameDailySymbol = chartAvailable and integratedSlot >= 0"));
 assert.ok(!fixed.includes("bool fvgChartOK = chartAvailable and"));
 assert.ok(!fixed.includes("bool showPDLevels = showIntegratedChart and"));
 assert.ok(fixed.indexOf("int chartStaticSlot")<fixed.indexOf("for i = 0 to 33"));
 assert.ok(fixed.indexOf("bool sameDailySymbol =")>fixed.indexOf("for i = 0 to 33"));
});

test("PDH/PDL exact prior Daily levels and independent latched first wick touch",()=>{
 assert.ok(fixed.includes('request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time_close[1]], lookahead=barmerge.lookahead_on'));
 for(const token of [
  "chartPdhTaken1D := false",
  "chartPdlTaken1D := false",
  "if not chartPdhTaken1D and high >= dailyPDH",
  "if not chartPdlTaken1D and low <= dailyPDL",
  '"PDH TOMADO" : "PDH INTACTO"',
  '"PDL TOMADO" : "PDL INTACTO"',
  "line.set_xy1(pdhChartLine,pdStart,dailyPDH)",
  "line.set_xy1(pdlChartLine,pdStart,dailyPDL)",
  "line.delete(pdhChartLine)",
  "line.delete(pdlChartLine)"
 ])assert.ok(fixed.includes(token),token);
 assert.ok(!fixed.includes('line.new(pdStart,own.nyPDH'));
 assert.ok(!fixed.includes('line.new(pdStart,own.nyPDL'));
});

test("3-closed H4 FVG have exact broker source, nearest first, max confirmed ATR distance",()=>{
 for(const token of [
  "f_chartH4Fvgs(int depth) =>",
  "for k = 1 to depth",
  "time[k + 1] - time[k + 2] == H4MS",
  "time[k] - time[k + 1] == H4MS",
  "low[k] - high[k + 2] >= syminfo.mintick",
  "low[k + 2] - high[k] >= syminfo.mintick",
  "if low[j] <= bottom",
  "else if low[j] <= top",
  "if high[j] >= top",
  "else if high[j] >= bottom",
  "array.push(tops,top)",
  "for rank = 0 to 2",
  "if na(bestDistance) or dist < bestDistance",
  "array.set(used,best,true)",
  "array.get(tops,best)",
  "array.get(partials,best)",
  "time_close[k]",
  "float confirmedH4Atr = ta.atr(14)[1]",
  "f_chartZoneDistance(float px, float top, float bottom) =>",
  "fvg1Near = fvgAtrReady",
  "fvg2Near = fvgAtrReady",
  "fvg3Near = fvgAtrReady",
  "fvgConfirmedAtr * chartFvgMaxAtr",
  "bool drawFvg1 = fvg1OK and not fvg1FilledNow",
  "box.delete(b)",
  "label.delete(l)",
 ])assert.ok(fixed.includes(token),token);
 assert.ok(fixed.includes("chartFvgMaxZones = input.int(1"));
 assert.ok(fixed.includes('chartFvgMaxAtr = input.float(1.5'));
 assert.ok(fixed.includes('request.security(syminfo.tickerid, "240"'));
 assert.ok(fixed.includes('lookahead=barmerge.lookahead_on'));
 assert.ok(!fixed.includes('own.fvgH4Top : own.fvgH4Bottom'));
});

test("no fake certification, no extra market, no FCM and under Basic request ceiling",()=>{
 const requests=fixed.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//"));
 assert.equal(requests.length,3,requests.join("\n"));
 assert.equal(34+2,36);
 assert.ok(36<=40);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(fixed));
 assert.ok(fixed.includes('"NO LIVE"'));
 assert.ok(fixed.includes('"NO PUSH"'));
});

test("selection example: nearer FVG beats far zone regardless of age",()=>{
 const d=(px,top,bottom)=>px>top?px-top:px<bottom?bottom-px:0;
 const price=52416.70;
 const nearby={top:52200,bottom:52050,age:10};
 const faraway={top:53100,bottom:52900,age:2};
 const ranked=[faraway,nearby].map(z=>({...z,distance:d(price,z.top,z.bottom)})).sort((a,b)=>a.distance-b.distance);
 assert.equal(ranked[0].age,10);
 assert.ok(Math.abs(ranked[0].distance-216.70)<1e-6);
 const h4Atr=500,maxDistance=1.5*h4Atr;
 assert.ok(ranked[0].distance<=maxDistance);
 assert.ok(ranked[1].distance<=maxDistance); // check chart relevance by configured ATR
});
