import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const A=get("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const B=get("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const occurrences=(s,n)=>Array.from(s.matchAll(new RegExp("\\b"+n+"\\b","g"))).length;
test("H04 RADAR is complete in GitHub: f_engine, Signal.new, 34 slots, render",()=>{
 assert.ok(A.split("\n").length>2700);
 for(const token of ["Signal.new(","f_renderRadarDashboard()","for i = 0 to 33"])assert.ok(A.includes(token),token);
 assert.equal(engine(A),engine(B));
});
test("H01 memory comments reflect A's 34 and B chart-only defaults",()=>{
 assert.ok(A.includes("RADAR consulta 34 feeds por defecto"));
 assert.ok(B.includes("CHART B consulta solo el ticker del grafico"));
 assert.ok(A.includes('memoryScan = input.string("34 instrumentos (experimental)"'));
 assert.ok(!B.includes("BTCUSD-only por defecto"));
});
test("H05 Chart B removes dead input controls, not 18 inputs in real use",()=>{
 const inputs=Array.from(B.matchAll(/^([A-Za-z_]\w*)\s*=\s*input\./gm),m=>m[1]);
 assert.equal(inputs.length,18);
 for(const n of inputs)assert.ok(occurrences(B,n)>1,"dead input "+n);
 for(const n of ["memoryScan","showDashboard","expandFull34","showCatalog7","useAlerts","alertFreshMinutes","showEntryCatalog"])assert.ok(!inputs.includes(n),"misleading "+n);
 for(const n of ["qaPhase1NonBtc","showLevels","showMssLines","showFvgAudit"])assert.ok(inputs.includes(n),n);
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(B));
});
test("Chart H08/H18: intraday 240 minutes included; only ratified core 2C draws",()=>{
 assert.ok(B.includes("timeframe.isintraday or (timeframe.isdaily"));
 assert.ok(B.includes("own.phase == 2 and own.isPatternValid"));
 assert.ok(B.includes('own.modelKind == "CRT_2C_RETURN"'));
});
