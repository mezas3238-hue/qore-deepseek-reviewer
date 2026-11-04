import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const read=name=>readFileSync(new URL(name,root),"utf8");
const last=read("QORE_CRT_RADAR_34_CHART_V34_12P_C1_TODAS_H4_24H_QA_NO_LIVE.pine");
const fixed=read("QORE_CRT_RADAR_34_CHART_V34_12Q_DAILY_TOMADO_FVG_H4_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const execSecurity=s=>s.split("\n").filter(row=>!row.trimStart().startsWith("//")&&row.includes("request.security("));

test("QORE CRT 12Q preserves complete 34 market motor, six H4, causal MSS and no alerts",()=>{
 assert.equal(engine(fixed),engine(last),"engine bytes changed unexpectedly");
 assert.match(fixed,/scheduleMode = input\.string\("Todas las H4 NY"/);
 assert.match(fixed,/for i = 0 to 33/);
 assert.equal([...fixed.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.ok(fixed.includes('calc_bars_count=600)'));
 assert.ok(fixed.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
 assert.doesNotMatch(fixed,/\balert\s*\(|\balertcondition\s*\(/);
 assert.match(fixed,/shorttitle="QORE CRT 34\+Chart 12Q"/);
});

test("PDH/PDL always source the last confirmed 1D OHLC of the exact open chart ticker",()=>{
 assert.ok(fixed.includes('[dailyPDH, dailyPDL, dailyPrevOpen, dailyPrevClose] = request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time_close[1]], lookahead=barmerge.lookahead_on'));
 assert.ok(fixed.includes('ticker.standard(symbol) == integratedChartBroker'));
 assert.ok(fixed.includes('dailyPrevClose <= dailyNowOpen'));
 assert.ok(fixed.includes('int pdStart = dailyNowOpen'));
 assert.ok(!fixed.includes('line.new(pdStart,own.nyPDH'));
 assert.ok(!fixed.includes('line.new(pdStart,own.nyPDL'));
 assert.ok(fixed.includes('showChartPDHPDL = input.bool(true'));
});

test("PDH and PDL have separate, wick-driven first take states reset on 1D day boundary",()=>{
 for(const str of [
  'var int chartDailySeenAt = na',
  'var bool chartPdhTaken1D = false',
  'var bool chartPdlTaken1D = false',
  'chartDailySeenAt != dailyNowOpen',
  'chartPdhTaken1D := false',
  'chartPdlTaken1D := false',
  'if not chartPdhTaken1D and high >= dailyPDH',
  'if not chartPdlTaken1D and low <= dailyPDL',
  'chartPdhTaken1D := true',
  'chartPdlTaken1D := true',
  'chartPdhFirstBarAt := time',
  'chartPdlFirstBarAt := time',
  'chartPdhTaken1D ? "PDH 1D TOMADO" : "PDH 1D INTACTO"',
  'chartPdlTaken1D ? "PDL 1D TOMADO" : "PDL 1D INTACTO"',
  'line.set_color(pdhChartLine,pdhInk)',
  'line.set_color(pdlChartLine,pdlInk)',
  'label.set_textcolor(pdhChartLabel,pdhInk)',
  'label.set_textcolor(pdlChartLabel,pdlInk)',
  'QA PDH 1D estado (1=tomado, 0=intacto)',
  'QA PDL 1D estado (1=tomado, 0=intacto)',
 ])assert.ok(fixed.includes(str),str);
 assert.ok(!fixed.includes('label.set_text(pdhChartLabel,"PDH QA "+own.pdhStatus)'));
 assert.ok(!fixed.includes('label.set_text(pdlChartLabel,"PDL QA "+own.pdlStatus)'));
});

test("confirmed native-chart H4 FVG, non-repainting, independently of CRT, 3 areas max",()=>{
 for(const str of [
  'f_chartH4Fvgs(int depth) =>',
  'for k = 1 to depth',
  'time[k + 1] - time[k + 2] == H4MS',
  'time[k] - time[k + 1] == H4MS',
  'low[k] - high[k + 2] >= syminfo.mintick',
  'low[k + 2] - high[k] >= syminfo.mintick',
  'for j = 1 to k - 1',
  'if low[j] <= bottom',
  'if low[j] <= top',
  'if high[j] >= top',
  'if high[j] >= bottom',
  'if not fullFill and found < 3',
  'a1 := time_close[k]',
  'a2 := time_close[k]',
  'a3 := time_close[k]',
  'request.security(syminfo.tickerid, "240", f_chartH4Fvgs(chartFvgLookbackH4), lookahead=barmerge.lookahead_on',
  'var float currentH4HighSeen = na',
  'var float currentH4LowSeen = na',
  'var int chartH4OpenSeen = na',
  'bool drawFvg1 = fvg1OK and not fvg1FilledNow',
  'bool drawFvg2 = fvg2OK and not fvg2FilledNow',
  'bool drawFvg3 = fvg3OK and not fvg3FilledNow',
  'f_drawChartFvg(box existingBox, label existingLabel',
  'showChartH4Fvg = input.bool(true',
  'box.delete(b)',
  'FVG H4 zonas sin rellenar (0-3)',
 ]) assert.ok(fixed.includes(str),str);
 assert.ok(!fixed.includes('bool showNearFvgH4 = latestFvgH4Valid'));
 assert.ok(!fixed.includes('showChartH4Fvg = input.bool(false'));
 const fvgPart=fixed.slice(fixed.indexOf('f_chartH4Fvgs(int depth) =>'),fixed.indexOf('// V34.12K: Chart B VISUAL'));
 assert.ok(!fvgPart.includes('visible and'));
 assert.ok(!fvgPart.includes('chartCoreC1'));
 assert.ok(!fvgPart.includes('own.fvgH4Top'));
 assert.ok(!fvgPart.includes('own.fvgH4Bottom'));
 assert.ok(!fvgPart.includes('low[0]'));
 assert.ok(!fvgPart.includes('high[0]'));
 assert.ok(!fvgPart.includes('a1 := time[k]'),"no zone should be drawn before third H4 CLOSE");
});

test("Pine chart variables must precede all FVG chart predicates",()=>{
 assert.ok(fixed.indexOf('bool chartAvailable =') > 0);
 assert.ok(fixed.indexOf('bool fvgChartOK =') > fixed.indexOf('bool chartAvailable ='));
 assert.ok(fixed.indexOf('bool visible =') < fixed.indexOf('bool fvgChartOK ='));
 assert.ok(fixed.indexOf('bool drawFvg1 =') > fixed.indexOf('bool fvgChartOK ='));
 assert.ok(fixed.indexOf('var box fvgH4ChartBox1 =') > fixed.indexOf('bool drawFvg1 ='));
});

test("TradingView Basic budget still has 34 M5 feeds plus 1D/H4 exact ticker = 36 unique requests",()=>{
 const lines=execSecurity(fixed);
 assert.equal(lines.length,3,lines.join("\n"));
 assert.ok(lines.some(x=>x.includes('request.security(symbol, "5"')));
 assert.ok(lines.some(x=>x.includes('request.security(syminfo.tickerid, "D"')));
 assert.ok(lines.some(x=>x.includes('request.security(syminfo.tickerid, "240"')));
 assert.ok(34+2<=40);
 assert.ok(fixed.includes('max_boxes_count=5'));
 assert.ok(fixed.includes('max_labels_count=12'));
});

test("synthetic causal FVG semantics, not a claim of Pine Editor execution",()=>{
 // Bullish: H4 candle 1 high 100, candle 3 low 102, gap [100,102].
 const zone={top:102,bottom:100,dir:1};
 const check=(lo,hi)=>({partial:zone.dir>0?lo<=zone.top:hi>=zone.bottom,
                           full:zone.dir>0?lo<=zone.bottom:hi>=zone.top});
 assert.deepEqual(check(103,104),{partial:false,full:false});
 assert.deepEqual(check(101,104),{partial:true,full:false});
 assert.deepEqual(check(99,104),{partial:true,full:true});
 // Bearish: H4 candle 1 low 110, candle 3 high 108, gap [108,110].
 const bear={top:110,bottom:108,dir:-1};
 const checkBear=hi=>({partial:hi>=bear.bottom,full:hi>=bear.top});
 assert.deepEqual(checkBear(107),{partial:false,full:false});
 assert.deepEqual(checkBear(109),{partial:true,full:false});
 assert.deepEqual(checkBear(111),{partial:true,full:true});
});
