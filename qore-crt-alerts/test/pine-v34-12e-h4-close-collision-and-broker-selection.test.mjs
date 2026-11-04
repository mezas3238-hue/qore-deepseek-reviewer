import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const d=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_D_AUDITORIA_FAMILIAS_QA_NO_LIVE.pine");
const e=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_E_CIERRE_EXACTO_3C_INS_QA_NO_LIVE.pine");
const eng=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const sig=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const slot=x=>x.slice(x.indexOf("for i = 0 to 33\n    if scanAll or i == 7"),x.indexOf("// QA 34x5 historical family matrix"));
const main=x=>x.slice(x.indexOf("f_renderRadarDashboard() =>"),x.indexOf("\nf_renderRadarDashboard()"));
const hist=x=>x.slice(x.indexOf("f_renderFamilyHistory() =>"),x.indexOf("// Ranking 0=both MSS"));
test("E leaves full 34 feed engine, Signal, scanner, default dashboard and all MSS unchanged",()=>{
 assert.equal(eng(e),eng(d));
 assert.equal(sig(e),sig(d));
 assert.equal(slot(e),slot(d));
 assert.equal(main(e),main(d));
 assert.equal((e.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((e.match(/^\s*plot\(/gm)||[]).length,1);
 assert.equal((e.match(/request\.security\(/g)||[]).length,(d.match(/request\.security\(/g)||[]).length);
 assert.ok(e.includes("lookahead=barmerge.lookahead_off"));
 assert.ok(e.includes('useAlerts = input.bool(false'));
 assert.ok(e.includes('"NO PUSH"'));
 assert.ok(!e.includes('alert("CRT+MSS'));
});
test("chart-linked selected QA slot requires exact broker; never silently revert to AUDJPY",()=>{
 const h=hist(e);
 assert.ok(e.includes('qaHistoryFollowChart = input.bool(true'));
 for(const x of [
  'else if qaHistoryFollowChart',
  'selected := -1',
  'string selectedBrokerSymbol = ticker.standard(syminfo.tickerid)',
  'ticker.standard(array.get(scanSymbols,slot)) == selectedBrokerSymbol',
  'bool selectedReady = selected >= 0',
  '"SIN SLOT / BROKER"',
  'selectedReady ? array.get(qaHistRatified2CBySlot,selected) : na',
  'selectedReady ? array.get(qaHistMulti4BySlot,selected) : na'
 ])assert.ok(h.includes(x)||e.includes(x),x);
 assert.ok(h.includes('if not scanAll\n            selected := 7'));
 assert.ok(h.includes('int selected3cs = selectedReady ?'));
 assert.ok(h.includes('int selectedInside = selectedReady ?'));
});
test("date collision: two events on same DD/MM are never promoted to same H4 close",()=>{
 const h=hist(e);
 assert.ok(h.includes('if not na(true3c) and not na(inside) and true3c == inside'));
 assert.ok(h.includes('exact3cInsideCloses += 1'));
 assert.ok(h.includes('selected3c == selectedInside'));
 assert.ok(h.includes('str.format_time(selected3c,"yyyy-MM-dd","Etc/UTC") == str.format_time(selectedInside,"yyyy-MM-dd","Etc/UTC")'));
 for(const x of ['"MISMO CIERRE"','"MISMO DIA"','"CIERRE DIST"','"N/D"','"3C=INS:"','"C1 SIN VER"'])
  assert.ok(h.includes(x),x);
 assert.ok(!h.includes('mssM15 = true'));
 assert.ok(!h.includes('useAlerts := true'));
 assert.ok(h.includes('"NO MSS"'));
});
test("historical diagnosis remains off by default, not a second dashboard replacing the owner's monitor",()=>{
 assert.ok(e.includes('qaFamilyHistoryView = input.bool(false'));
 assert.ok(e.includes('f_renderRadarDashboard()\n\nf_renderFamilyHistory()'));
 assert.ok(e.includes('not qaFamilyHistoryView and not showSlotEventAudit'));
});
