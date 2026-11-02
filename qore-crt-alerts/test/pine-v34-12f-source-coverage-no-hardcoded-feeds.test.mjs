import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const e=read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_E_CIERRE_EXACTO_3C_INS_QA_NO_LIVE.pine");
const f=read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_F_COBERTURA_34_FEEDS_QA_NO_LIVE.pine");
const count=(s,pattern)=>(s.match(pattern)||[]).length;
const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
test("engine, Signal UDT, 34 market scanner and default MSS dashboard are BYTE identical",()=>{
 assert.equal(slice(f,"f_engine() =>","f_engine_snapshot() =>"),slice(e,"f_engine() =>","f_engine_snapshot() =>"));
 assert.equal(slice(f,"type Signal","// M3B.2"),slice(e,"type Signal","// M3B.2"));
 assert.equal(slice(f,"for i = 0 to 33\n    if scanAll or i == 7","// QA 34x5 historical family matrix"),
              slice(e,"for i = 0 to 33\n    if scanAll or i == 7","// QA 34x5 historical family matrix"));
 assert.equal(slice(f,"f_renderRadarDashboard() =>","\nf_renderRadarDashboard()"),
              slice(e,"f_renderRadarDashboard() =>","\nf_renderRadarDashboard()"));
 assert.equal(count(f,/^s\d\d = input\.symbol\(/gm),34);
 assert.equal(count(f,/^\s*Signal s = request\.security\(/gm),1);
 assert.equal(count(f,/^\s*plot\(/gm),1);
 assert.equal(count(f,/request\.security\(/g),count(e,/request\.security\(/g));
 assert.ok(f.includes("useAlerts = input.bool(false"));
 assert.ok(f.includes('"NO PUSH"')||f.includes('"HIST NO PUSH"'));
 assert.ok(!f.includes('alert("CRT+MSS'));
});
test("selected broker feed shows measured response, C1 eligibility and H4 reconstruction without inferring CRT",()=>{
 const h=slice(f,"f_renderFamilyHistory() =>","// Ranking 0=both MSS");
 for(const x of [
  'bool selectedFeedOK = selectedReady and array.get(auditFeedAvailable,selected) == 1',
  'int selectedC1Count = selectedFeedOK ? array.get(auditFeedC1,selected) : 0',
  'int selectedH4Closed = selectedFeedOK ? array.get(auditFeedH4Closed,selected) : 0',
  'int selectedH4LastBars = selectedFeedOK ? array.get(auditFeedH4LastBars,selected) : na',
  '"R:"+str.tostring(checked)+"/"+str.tostring(nFeeds)',
  '"S:NO BROKER"',
  '"S:FEED OK"',
  '"S:SIN FEED"',
  '"C1:"+str.tostring(selectedC1Count)',
  '"H4:"+str.tostring(selectedH4Closed)',
  '"HIST NO PUSH"'
 ])assert.ok(h.includes(x),x);
 assert.ok(!h.includes('"34 FEEDS"'));
 assert.ok(h.includes('"3C=INS:"'));
 assert.ok(h.includes('ticker.standard(syminfo.tickerid)'));
 assert.ok(h.includes('selected := -1'));
});
test("no inference: 0 historic cases on GBPAUD cannot be equated with offline 34-feed disconnect",()=>{
 const h=slice(f,"f_renderFamilyHistory() =>","// Ranking 0=both MSS");
 assert.ok(h.includes('array.get(qaHistRatified2CBySlot,i)'));
 assert.ok(h.includes('array.get(qaTrue3CSignedBySlot,i)'));
 assert.ok(h.includes('array.get(qaHistInsideReturnBySlot,i)'));
 assert.ok(h.includes('array.get(qaHistMulti4BySlot,i)'));
 assert.ok(h.includes('array.get(qaHistMultiNBySlot,i)'));
 assert.ok(h.includes('"MISMO CIERRE"'));
 assert.ok(h.includes('"MISMO DIA"'));
 assert.ok(h.includes('"CIERRE DIST"'));
 assert.ok(h.includes('"N/D"'));
 assert.ok(!h.includes("strategy.entry"));
});
