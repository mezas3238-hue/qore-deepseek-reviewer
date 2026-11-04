import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../../crt-radar-pro/qa-34-feed-memory-probes/",import.meta.url);
const original=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_QA_NO_LIVE.pine",root),"utf8");
const corrected=readFileSync(new URL("QORE_CRT_RADAR_34_CHART_V34_12O_PDH_PDL_1D_REAL_QA_NO_LIVE.pine",root),"utf8");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const draw=x=>x.slice(x.indexOf("Signal own = integratedOwn"));

test("V34.12O edits display only; V34.12N engine and 34 canonical M5 feeds unchanged",()=>{
 assert.equal(engine(corrected),engine(original));
 assert.match(corrected,/for i = 0 to 33/);
 assert.equal([...corrected.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.match(corrected,/Signal s = request\.security\(symbol, "5", f_engine_snapshot\(\), lookahead=barmerge\.lookahead_off, ignore_invalid_symbol=true, calc_bars_count=600\)/);
 assert.equal([...corrected.matchAll(/\brequest\.security\(/g)].length,2);
 assert.ok(corrected.includes('max_lines_count=8, max_labels_count=8, max_boxes_count=2'));
 assert.doesNotMatch(corrected,/\balert\s*\(|\balertcondition\s*\(/);
});
test("confirmed previous 1D high/low from exact chart ticker, not an RTH/NY reconstructed price",()=>{
 assert.match(corrected,/\[dailyPDH, dailyPDL, dailyPrevOpen, dailyPrevClose\] = request\.security\(syminfo\.tickerid, "D", \[high\[1\], low\[1\], time\[1\], time_close\[1\]\], lookahead=barmerge\.lookahead_on/);
 assert.ok(corrected.includes('int dailyNowOpen = time("D")'));
 assert.ok(corrected.includes('ticker.standard(symbol) == integratedChartBroker'));
 assert.match(corrected,/dailyPrevClose <= dailyNowOpen/);
 assert.match(corrected,/dailyPDH > dailyPDL/);
 assert.ok(corrected.includes("int pdStart = dailyNowOpen"));
 assert.ok(corrected.includes('timeframe.in_seconds(timeframe.period) <= 14400'));
 const visual=draw(corrected);
 assert.doesNotMatch(visual,/showPDLevels\s*=.*own\.pdhStatus/);
 assert.doesNotMatch(visual,/line\.new\([^\n]*own\.nyPDH/);
 assert.doesNotMatch(visual,/line\.new\([^\n]*own\.nyPDL/);
 assert.match(visual,/line\.set_xy1\(pdhChartLine,pdStart,dailyPDH\)/);
 assert.match(visual,/line\.set_xy1\(pdlChartLine,pdStart,dailyPDL\)/);
 assert.ok(visual.includes('"PDH 1D CONF"'));
 assert.ok(visual.includes('"PDL 1D CONF"'));
 assert.ok(visual.includes('title="QA Chart PDH 1D previo confirmado"'));
 assert.ok(visual.includes('title="QA Chart PDL 1D previo confirmado"'));
});
test("daily chart source is displayed separately; original internal liquidity strategy and FVG left untouched",()=>{
 assert.ok(original.includes('showChartPDHPDL = input.bool(true, "Mostrar PDH/PDL de sesion validada (QA)"'));
 assert.ok(original.includes('showChartH4Fvg = input.bool(true,'));
 assert.ok(corrected.includes('showChartH4Fvg = input.bool(false,'));
 assert.equal(corrected.slice(corrected.indexOf("bool latestFvgH4Valid ="),corrected.indexOf("var line hiLine")),
              original.slice(original.indexOf("bool latestFvgH4Valid ="),original.indexOf("var line hiLine")));
 assert.ok(corrected.includes('showPDLevels = showIntegratedChart and showChartPDHPDL'));
 assert.ok(!corrected.includes('label.set_text(pdhChartLabel,"PDH QA "+own.pdhStatus)'));
 assert.ok(!corrected.includes('label.set_text(pdlChartLabel,"PDL QA "+own.pdlStatus)'));
 assert.ok(corrected.includes('useExtIdx = input.bool(false'));
 assert.ok(corrected.includes('int endHour = pdhRth ? 16 : 17'));
});
test("Basic cap counts 34 M5 unique market requests plus chart-only 1D request = 35, not 35 markets",()=>{
 const names=[...corrected.matchAll(/^s\d\d = input\.symbol\(/gm)].length;
 const extra=[...corrected.matchAll(/^\[dailyPDH, dailyPDL, dailyPrevOpen, dailyPrevClose\] = request\.security\(/gm)].length;
 assert.equal(names+extra,35);
 assert.ok(names+extra<=40);
 assert.ok(!corrected.includes("request.security(symbol, \"D\""));
});
