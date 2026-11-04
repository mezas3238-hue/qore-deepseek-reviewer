import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=x=>readFileSync(new URL("../../crt-radar-pro/"+x,import.meta.url),"utf8");
const f=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_F_COBERTURA_34_FEEDS_QA_NO_LIVE.pine");
const g=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_G_MARCAR_SOLAPES_3C_INS_QA_NO_LIVE.pine");
const part=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
test("G preserves exactly all core/QA detector and independent MSS validation",()=>{
 assert.equal(part(g,"f_engine() =>","f_engine_snapshot() =>"),part(f,"f_engine() =>","f_engine_snapshot() =>"));
 assert.equal(part(g,"type Signal","// M3B.2"),part(f,"type Signal","// M3B.2"));
 assert.equal(part(g,"for i = 0 to 33\n    if scanAll or i == 7","// QA 34x5 historical family matrix"),
   part(f,"for i = 0 to 33\n    if scanAll or i == 7","// QA 34x5 historical family matrix"));
 assert.equal(part(g,"f_renderRadarDashboard() =>","\nf_renderRadarDashboard()"),
   part(f,"f_renderRadarDashboard() =>","\nf_renderRadarDashboard()"));
 assert.equal((g.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((g.match(/^\s*plot\(/gm)||[]).length,1);
 assert.equal((g.match(/request\.security\(/g)||[]).length,(f.match(/request\.security\(/g)||[]).length);
 assert.ok(g.includes("useAlerts = input.bool(false"));
});
test("star shown on names and 3C/Inside dates only for exact timestamp equality",()=>{
 const h=part(g,"f_renderFamilyHistory() =>","// Ranking 0=both MSS");
 assert.ok(h.includes("bool closeOverlap = not na(true3c) and not na(inside) and true3c == inside"));
 assert.ok(h.includes('string collisionTag = closeOverlap ? "*" : ""'));
 assert.ok(h.includes("array.get(scanNames,i) + collisionTag"));
 assert.ok(h.includes("f_qaHistoryDate(true3c) + collisionTag"));
 assert.ok(h.includes("f_qaHistoryDate(inside) + collisionTag"));
 assert.ok(h.includes('"*3C=INS:"+str.tostring(exact3cInsideCloses)'));
 assert.ok(h.includes('"C1:"+str.tostring(selectedC1Count)'));
 assert.ok(h.includes('"R:"+str.tostring(checked)+"/"+str.tostring(nFeeds)'));
 assert.ok(h.includes('ticker.standard(array.get(scanSymbols,slot)) == selectedBrokerSymbol'));
 assert.ok(!h.includes("sameDayOnly and closeOverlap"));
 assert.ok(!h.includes("mss15 := true"));
 assert.ok(!h.includes("alert("));
});
