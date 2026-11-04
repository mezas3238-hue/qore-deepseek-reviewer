import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const file=name=>readFileSync(new URL(name,root),"utf8");
const prev=file("QORE_CRT_RADAR_34_CHART_V34_12R_LIMPIEZA_NIVELES_FVG_CERCANOS_QA_NO_LIVE.pine");
const code=file("QORE_CRT_RADAR_34_CHART_V34_12S_PDH_PDL_VISIBLE_DIARIO_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));

test("Daily 1D source is native chart symbol, NOT NY RTH, broker slot, or CRT UDT",()=>{
 assert.ok(code.includes('[dailyPDH, dailyPDL, dailyPrevOpen, dailyNowOpen] = request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time], lookahead=barmerge.lookahead_on'));
 assert.ok(code.includes('calc_bars_count=60)'));
 assert.ok(code.includes('bool dailyDataOK = not na(dailyPDH)'));
 assert.ok(code.includes('dailyPrevOpen < dailyNowOpen'));
 assert.ok(!code.includes('dailyPrevClose <= dailyNowOpen'));
 assert.ok(!code.includes('bool sameDailySymbol = chartStaticSlot >= 0'));
 assert.ok(!code.includes('dailyDataOK = sameDailySymbol'));
 assert.ok(!code.includes('dailyDataOK = chartAvailable'));
 assert.ok(code.includes('bool showPDLevels = showChartPDHPDL and chartTfSupportsDaily and dailyDataOK'));
 assert.ok(!code.includes('bool showPDLevels = showIntegratedChart'));
 assert.ok(!code.includes('line.new(pdStart,own.nyPDH'));
 assert.ok(!code.includes('line.new(pdStart,own.nyPDL'));
});

test("PDH/PDL independent TAKE by wicks; live Daily only applied to latest bar of exact same Daily session",()=>{
 for(const token of [
  'var bool chartPdhTaken1D = false',
  'var bool chartPdlTaken1D = false',
  'chartPdhTaken1D := false',
  'chartPdlTaken1D := false',
  'if not chartPdhTaken1D and high >= dailyPDH',
  'if not chartPdlTaken1D and low <= dailyPDL',
  '[dailyLiveHigh, dailyLiveLow, dailyLiveOpen] = request.security(syminfo.tickerid, "D", [high, low, time], lookahead=barmerge.lookahead_off',
  'bool dailyLiveSameDay = barstate.islast and dailyDataOK and not na(dailyLiveOpen) and dailyLiveOpen == dailyNowOpen',
  'dailyLiveHigh >= dailyPDH',
  'dailyLiveLow <= dailyPDL',
  'chartPdhFirstBarAt := time',
  'chartPdlFirstBarAt := time',
  '"PDH TOMADO" : "PDH INTACTO"',
  '"PDL TOMADO" : "PDL INTACTO"'
 ])assert.ok(code.includes(token),token);
 const state=code.slice(code.indexOf('var int chartDailySeenAt'),code.indexOf('// El panel no depende de la escala vertical'));
 assert.ok(!state.includes('own.pdhTaken'));
 assert.ok(!state.includes('own.pdlTaken'));
 assert.ok(!state.includes('hasLiquidityRef'));
});

test("PDH/PDL display even when zoom puts price outside viewport; explicit reason if no Daily data",()=>{
 assert.ok(code.includes('var table chartDailyPanel = table.new(position.bottom_right,1,3'));
 assert.ok(code.includes('if barstate.islast'));
 for(const token of [
  '"PDH DESACTIVADO"',
  '"PDL DESACTIVADO"',
  '"PDH TF NO SOPORTADA"',
  '"PDL TF NO SOPORTADA"',
  '"PDH SIN D (verificar datos)"',
  '"PDL SIN D (verificar datos)"',
  'str.tostring(dailyPDH,format.mintick)',
  'str.tostring(dailyPDL,format.mintick)',
  'table.cell(chartDailyPanel,0,1,topText',
  'table.cell(chartDailyPanel,0,2,bottomText'
 ])assert.ok(code.includes(token),token);
 assert.ok(code.includes('int pdStart = dailyNowOpen'));
 assert.ok(code.includes('int pdEnd = na(time_close) ?'));
 assert.ok(code.includes('line.set_xy1(pdhChartLine,pdStart,dailyPDH)'));
 assert.ok(code.includes('line.set_xy1(pdlChartLine,pdStart,dailyPDL)'));
});

test("CRT is identical to 12R and all H4 eligible, FVG proximity remains independent",()=>{
 assert.equal(engine(code),engine(prev),"CRT/MSS engine must not change");
 assert.equal([...code.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.ok(!code.includes("scheduleMode"));
 assert.ok(code.includes('indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
 assert.ok(code.includes('f_chartH4Fvgs(int depth) =>'));
 assert.ok(code.includes('bool fvgChartOK = chartStaticSlot >= 0 and'));
 assert.ok(code.includes('chartFvgMaxZones = input.int(1'));
 assert.ok(code.includes('chartFvgMaxAtr = input.float(1.5'));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(code));
});

test("request budget: 34 M5 + 2 Daily queries + 1 H4 query = 37 under Basic 40 cap",()=>{
 const q=code.split("\n").filter(x=>x.includes('request.security(') && !x.trimStart().startsWith('//'));
 assert.equal(q.length,4,q.join('\n'));
 assert.ok(q.some(x=>x.includes('request.security(symbol, "5"')));
 assert.equal(q.filter(x=>x.includes('request.security(syminfo.tickerid, "D"')).length,2);
 assert.equal(q.filter(x=>x.includes('request.security(syminfo.tickerid, "240"')).length,1);
 assert.equal(34+2+1,37);
 assert.ok(37<=40);
});
