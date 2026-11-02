import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const get=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const c=get("CRT_RADAR_PRO_V34_11C_FEED_AUDIT_GRAFICO_QA.pine");
const d=get("CRT_RADAR_PRO_V34_11D_HISTORIAL_POR_FEED_QA.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const tail=d.slice(d.indexOf("// V34.11b: read-only event snapshot"));
const historical=tail.slice(tail.indexOf('// Historical counters are computed by the SAME'));

test("v34.11d keeps all 34 M5 requests, original source and engine unchanged",()=>{
 assert.equal(engine(d),engine(c));
 assert.equal(d.split("request.security(").length,c.split("request.security(").length);
 assert.equal((d.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((d.match(/^\s*plot\(/gm)||[]).length,(c.match(/^\s*plot\(/gm)||[]).length);
 assert.equal((d.match(/^\s*plot\(/gm)||[]).length,60);
 assert.ok(d.includes('useAlerts = input.bool(false'));
});
test("per-provider 1500-M5 historical diagnostics cannot be mistaken for live CRT phase",()=>{
 assert.ok(tail.includes('"SIN CRT ACT"'));
 assert.ok(historical.includes('"HIST 1500 M5"'));
 assert.ok(historical.includes('"RETROSPECTIVO"'));
 assert.ok(tail.includes('"EST=ACTUAL"'));
 assert.ok(historical.includes('"NO PUSH"'));
 for(const key of ["auditFeedH4Closed","auditFeedC1","auditFeed2C","auditFeed3C","auditFeedInside","auditFeedM4","auditFeedMN"]){
  assert.ok(historical.includes("array.get("+key+",slot)"),key);
 }
});
test("history, H4 gaps, DST and rejected C2 only come from requested, responded slot",()=>{
 assert.ok(tail.includes('int slot = qaFollowChart and chartExactSlot >= 0 ? chartExactSlot : qaEventSlot - 1'));
 assert.ok(tail.includes('bool responded = requested and array.get(auditFeedAvailable,slot) == 1'));
 for(const key of ["auditFeedH4Gap","auditFeedH4DST","auditFeedC2Rejected","auditFeedM15QA"]){
  assert.ok(historical.includes("responded ? str.tostring(array.get("+key+",slot)) : \"N/D\""),key);
 }
 assert.ok(tail.includes('ticker.standard(selectedFeed) == ownStd'));
});
test("auditor states explicitly whether V34.11d currently draws levels",()=>{
 assert.ok(historical.includes('showLevels and visible ? "LINEAS NY SI" : "LINEAS NY NO"'));
 assert.ok(d.includes('"CRT H4 NY HIGH"'));
 assert.ok(d.includes('"CRT H4 NY LOW"'));
 assert.ok(!d.includes('label.new(t2,own.crh,"CRH"'));
 assert.ok(!d.includes('label.new(t2,own.crl,"CRL"'));
});
test("remains inside a single table 6x15, without new plots, provider or notification requests",()=>{
 assert.equal((d.match(/table\.new\(/g)||[]).length,(c.match(/table\.new\(/g)||[]).length);
 assert.ok(historical.includes('table.cell(board,5,13,"NO PUSH"'));
 assert.ok(!historical.includes('request.security('));
 assert.ok(!historical.split("\n").some(x=>x.trimStart().startsWith('plot(')));
 assert.ok(!historical.split("\n").some(x=>x.trimStart().startsWith('alert(')));
});
