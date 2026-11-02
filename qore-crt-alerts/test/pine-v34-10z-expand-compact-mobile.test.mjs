import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const vY=read("CRT_RADAR_PRO_V34_10Y_34_FEEDS_PANEL_MOVIL_QA_NO_INTEGRADO.pine");
const vZ=read("CRT_RADAR_PRO_V34_10Z_COMPACTO_EXPANDIR_34_QA_NO_INTEGRADO.pine");
const between=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert.ok(i>=0&&j>i);return s.slice(i,j);};
const scanner=s=>between(s,"for i = 0 to 33\n    if scanAll or i == 7\n        string symbol","if str.length(alertsNow) > 0");
const engine=s=>between(s,"f_engine() =>","f_engine_snapshot() =>");
const mobile=vZ.slice(vZ.indexOf("// V34.10z: COMPACTO by default"));

test("V34.10z preserves identical engine, 34 scanning and no new requests or alerts",()=>{
 assert.equal(engine(vY),engine(vZ));
 assert.equal(scanner(vY),scanner(vZ));
 assert.equal(vY.split("request.security(").length,vZ.split("request.security(").length);
 assert.equal(vZ.split(" = input.symbol(").length-1,34);
 assert.ok(vZ.includes('useAlerts = input.bool(false,'));
 assert.ok(vZ.includes('calc_bars_count=1500'));
});
test("Compact is default and full 34 inventory is explicit user opt-in in TradingView settings",()=>{
 assert.ok(vZ.includes('compactMobile = input.bool(true,'));
 assert.ok(vZ.includes('expandFull34 = input.bool(false, "Ver los 34 instrumentos (expandir)"'));
 assert.ok(mobile.includes('int feedCount = scanAll ? 34 : 1'));
 assert.ok(mobile.includes('int itemsPerPage = expandFull34 ? 4 : 2'));
 assert.ok(mobile.includes('int visibleTotal = expandFull34 ? feedCount : importantTotal'));
 assert.ok(mobile.includes('int totalPagesMobile = math.max(1,int(math.ceil(visibleTotal * 1.0 / itemsPerPage)))'));
 assert.ok(mobile.includes('int currentPageMobile = expandFull34 ? math.min(page,totalPagesMobile) : 1'));
});
test("Compact prioritizes M15-confirmed ratified H4, then other ratified CRTs",()=>{
 assert.ok(mobile.includes('bool core = array.get(validCoreFlags,i)'));
 assert.ok(mobile.includes('bool m15 = core and array.get(m15Flags,i) == 1'));
 assert.ok(mobile.includes('for priority = 0 to 1'));
 assert.ok(mobile.includes('rightPriority = expandFull34 ? priority == 0 : priority == 0 ? m15 : core and not m15'));
 assert.ok(mobile.includes('bool eligible = requested and rightPriority and (expandFull34 or core)'));
 assert.ok(mobile.includes('if not expandFull34 and importantTotal == 0'));
 assert.ok(mobile.includes('"SIN CRT VIGENTE"'));
});
test("Full mode includes 34 independent statuses, including missing and non-live QA",()=>{
 assert.ok(mobile.includes('bool eligible = requested and rightPriority and (expandFull34 or core)'));
 assert.ok(mobile.includes('not responded ? "SIN FEED"'));
 assert.ok(mobile.includes('phase == 1 ? "C2*"'));
 assert.ok(mobile.includes('extraQA ? family == "INSIDE QA"'));
 assert.ok(mobile.includes('"H4 N/D"'));
 assert.ok(mobile.includes('table.cell(board,0,rr,array.get(scanNames,i)'));
 assert.ok(mobile.includes('"R:"+str.tostring(checked)+"/"+str.tostring(feedCount)'));
 assert.ok(mobile.includes('"SIN:"+str.tostring(missing)'));
 assert.ok(mobile.includes('"NO PUSH"'));
});
test("Expanded and compact rows remain bounded, no fake on-chart click handlers",()=>{
 assert.ok(mobile.includes('int footerRow = expandFull34 ? 5 : 3'));
 assert.ok(mobile.includes('int hintRow = expandFull34 ? 6 : 4'));
 assert.ok(mobile.includes('"VER 34"'));
 assert.ok(mobile.includes('"AJUSTES"'));
 assert.ok(mobile.includes('"PAG: AJUSTES"'));
 assert.ok(mobile.includes('table.clear(board,0,0,5,14)'));
 assert.ok(!mobile.includes('alert('));
 assert.ok(!mobile.includes('request.security('));
});
