import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base=new URL("../../crt-radar-pro/",import.meta.url);
const A=readFileSync(new URL("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine",base),"utf8");
const B=readFileSync(new URL("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine",base),"utf8");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
test("Radar QA H27-H33 preserve full and identical A/B engine",()=>{
 assert.equal(engine(A),engine(B));
 assert.ok(A.includes('Signal s = request.security(symbol, "5"'));
 assert.ok(A.includes("for i = 0 to 33"));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(A+B));
});
test("QA phase only opt-in and false alert switches removed",()=>{
 for(const s of [A,B])assert.ok(s.includes("qaPhase1NonBtc = input.bool(false"));
 const inputs=Array.from(A.matchAll(/^([A-Za-z_]\w*)\s*=\s*input\./gm),m=>m[1]);
 for(const n of ["modeDashboard","useAlerts","showLevels","showMssLines","showFvgAudit","showEntryCatalog","rowsToShow","compactMobile","userFocus7"])assert.ok(!inputs.includes(n),n);
 for(const n of inputs)assert.ok(Array.from(A.matchAll(new RegExp("\\b"+n+"\\b","g"))).length>1,"input unused "+n);
});
test("33-feed and event views render instead of blanking; selected chart never crosses brokers",()=>{
 assert.ok(A.includes("f_renderNonBtcAudit()"));
 assert.ok(A.includes("f_renderSlotEventAudit()"));
 assert.ok(A.includes("if i != 7"));
 assert.ok(A.includes("ticker.standard(array.get(scanSymbols,slot)) == chartBroker"));
 assert.ok(A.includes("priority == -1 and i == chartSlot"));
 assert.ok(A.includes("SIN SLOT / BROKER"));
});
