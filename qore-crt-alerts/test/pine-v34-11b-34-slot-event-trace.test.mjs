import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root="../..//crt-radar-pro/";
const load=n=>readFileSync(new URL(root+n,import.meta.url),"utf8");
const a=load("CRT_RADAR_PRO_V34_11A_SIETE_CATEGORIAS_34_FEEDS_QA.pine");
const b=load("CRT_RADAR_PRO_V34_11B_34_SLOT_CAUSAL_TRACE_QA.pine");
const between=(x,from,to)=>{const first=x.indexOf(from),last=x.indexOf(to,first);
 assert.ok(first>=0&&last>first);return x.slice(first,last);};
const req=(x)=>between(x,
  "for i = 0 to 33\n    if scanAll or i == 7\n        string symbol",
  "if str.length(alertsNow) > 0");
const engine=(x)=>between(x,"f_engine() =>","f_engine_snapshot() =>");
const audit=b.slice(b.indexOf("// V34.11b: read-only event snapshot"));
test("V34.11b changes only QA presentation, never CRT H4/MSS detection or alerts",()=>{
 assert.equal(engine(b),engine(a));
 assert.equal(b.split("request.security(").length,a.split("request.security(").length);
 assert.equal((b.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(b.includes('useAlerts = input.bool(false'));
 assert.ok(b.includes('calc_bars_count=1500'));
 assert.ok(req(b).includes('request.security(symbol, "5", f_engine_snapshot()'));
});
test("No increase from existing 60 plot calls to exceed Pine 64 plot ceiling",()=>{
 const oldPlotCount=(a.match(/^\s*plot\(/gm)||[]).length;
 const newPlotCount=(b.match(/^\s*plot\(/gm)||[]).length;
 assert.equal(oldPlotCount,60);assert.equal(newPlotCount,oldPlotCount);
 assert.ok(!audit.split("\n").some(line=>line.trimStart().startsWith("plot(")));
});
test("Input has independent 1..34 slot selector, QA view opt-in, compact preserved",()=>{
 assert.ok(b.includes('showSlotEventAudit = input.bool(false,'));
 assert.ok(b.includes('qaEventSlot = input.int(1, "QA: numero de instrumento (1-34)", minval=1, maxval=34'));
 assert.ok(audit.includes('int slot = qaEventSlot - 1'));
 assert.ok(audit.includes('if barstate.islast and showDashboard and showSlotEventAudit'));
 assert.ok(audit.includes('table.clear(board,0,0,5,14)'));
 assert.ok(b.includes('expandFull34 = input.bool(false'));
});
test("Selected slot preserves same-source C1/C2/sweep/ratification and M15 proof",()=>{
 for(const part of [
  'array.set(qaC1BySlot, i, available ? s.c1Start : na)',
  'array.set(qaC2BySlot, i, available ? s.crtC2Start : na)',
  'array.set(qaSweepBySlot, i, available ? s.sweepAt : na)',
  'array.set(qaRatBySlot, i, available ? s.crtRatifiedAt : na)',
  'array.set(qaPivot15AtBySlot, i, available ? s.m15PivotAt : na)',
  'array.set(qaPivot15PriceBySlot, i, available ? s.m15Level : na)',
  'array.set(qaBreak15BySlot, i, available ? s.m15At : na)',
  'array.set(qaClosed15BySlot, i, available ? s.qaLastClosedM15At : na)',
  'array.set(qaExtraC1BySlot, i, available ? s.extraFamilyC1 : na)',
  'array.set(qaExtraSweepBySlot, i, available ? s.extraFamilySweepAt : na)',
  'array.set(qaExtraPivot15AtBySlot, i, available ? s.extraFamilyM15PivotAt : na)',
  'array.set(qaExtraBreak15BySlot, i, available ? s.extraFamilyM15At : na)',
  'array.set(qaExtraRatBySlot, i, available ? s.extraFamilyRatifiedAt : na)'
 ])assert.ok(req(b).includes(part),part);
 assert.ok(audit.includes('f_qaUtcMin(array.get(qaC1BySlot,slot))'));
 assert.ok(audit.includes('f_qaUtcMin(array.get(qaBreak15BySlot,slot))'));
 assert.ok(audit.includes('f_qaUtcMin(array.get(qaExtraBreak15BySlot,slot))'));
 assert.ok(audit.includes('f_qaPrice(array.get(qaPivot15PriceBySlot,slot))'));
 assert.ok(audit.includes('f_qaPrice(array.get(qaExtraPivot15PriceBySlot,slot))'));
});
test("Missing scan/response is explicit and audit cannot trigger push or certify models",()=>{
 assert.ok(audit.includes('bool requested = scanAll or slot == 7'));
 assert.ok(audit.includes('bool responded = requested and array.get(auditFeedAvailable,slot) == 1'));
 assert.ok(audit.includes('"SIN FEED"'));
 assert.ok(audit.includes('"BTC SOLO"'));
 assert.ok(audit.includes('"NO LIVE"'));
 assert.ok(audit.includes('"NO PUSH"'));
 assert.ok(audit.includes('"SNAPSHOT"'));
 assert.ok(!audit.includes("alert("));
});
