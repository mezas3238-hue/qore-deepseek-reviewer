import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL("../../crt-radar-pro/"+name,import.meta.url),"utf8");
const prior=read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_C_PRIORIDAD_MSS_QA_NO_LIVE.pine");
const candidate=read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_D_AUDITORIA_FAMILIAS_QA_NO_LIVE.pine");
const count=(text,re)=>(text.match(re)||[]).length;
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const oldScanner=x=>x.slice(x.indexOf("// ---- 34 activos: una sola peticion 5m por activo ----"),x.indexOf("// Closed MSS evidence from the SAME symbol"));
const history=x=>x.slice(x.indexOf("f_renderFamilyHistory() =>"),x.indexOf("// Ranking 0=both MSS"));
const main=x=>x.slice(x.indexOf("f_renderRadarDashboard() =>"),x.indexOf("\nf_renderRadarDashboard()\n"));

test("V34.12D retains identical detector, full 34-feed scanner, M5/M15 evidence and all old ranking",()=>{
 assert.equal(engine(candidate),engine(prior),"never change engine as part of history panel");
 assert.equal(oldScanner(candidate),oldScanner(prior),"no change to slot evidence inputs");
 assert.equal(count(candidate,/^s\d\d = input\.symbol\(/gm),34);
 assert.equal(count(candidate,/^\s*Signal s = request\.security\(/gm),1);
 assert.equal(count(candidate,/^\s*plot\(/gm),1);
 assert.equal(count(candidate,/^indicator\(/gm),1);
 assert.equal(count(candidate,/request\.security\(/g),count(prior,/request\.security\(/g));
 assert.ok(candidate.includes('useAlerts = input.bool(false'));
 assert.ok(candidate.includes('qaPhase1NonBtc = input.bool(true'));
 assert.ok(candidate.includes('"NO LIVE"')&&candidate.includes('"NO PUSH"'));
 const clean=x=>x.replaceAll('and not qaFamilyHistoryView ','');
 assert.equal(clean(main(candidate)),main(prior),"primary dashboard changed unexpectedly");
});

test("history audit is optional; never replaces default CRT/MSS priority ranking",()=>{
 assert.ok(candidate.includes('qaFamilyHistoryView = input.bool(false, "QA: historial 2C/3C/Inside/Multi por mercado"'));
 assert.ok(candidate.includes('userFocus7 and not qaFamilyHistoryView and not showSlotEventAudit'));
 assert.ok(candidate.includes('f_renderRadarDashboard()\n\nf_renderFamilyHistory()'));
 const h=history(candidate);
 assert.ok(h.includes('showDashboard and compactMobile and userFocus7 and qaFamilyHistoryView'));
 assert.ok(h.includes('int onPage = 10'));
 assert.ok(h.includes('int totalPages = math.max(1,int(math.ceil(nFeeds * 1.0 / onPage)))'));
 assert.ok(h.includes('rowIndex = ordinal - (pageNow - 1) * onPage + 1'));
 assert.ok(h.includes('bool requested')===false);
 for(const header of ['"MERCADO"','"2C H"','"3C H"','"INS H"','"M4 H"','"MN H"'])
  assert.ok(h.includes(header),header);
});

test("3C history is TRUE independent C2-setup C3-C1 sweep, not legacy 2C active C3",()=>{
 const h=history(candidate);
 assert.ok(h.includes('array.get(qaTrue3CSignedBySlot,i)'));
 assert.ok(h.includes('int true3c = na(true3cSigned) ? na : int(math.abs(true3cSigned))'));
 assert.ok(h.includes('array.get(qaHistInsideReturnBySlot,i)'));
 assert.ok(h.includes('array.get(qaHistMulti4BySlot,i)'));
 assert.ok(h.includes('array.get(qaHistMultiNBySlot,i)'));
 assert.ok(h.includes('array.get(qaHistRatified2CBySlot,i)'));
 assert.ok(!h.includes('qaHistConfirmed3CBySlot'),"old QA legacy 3C is actually 2C distribution");
 assert.ok(h.includes('"3C:"+str.tostring(countTrue3C)'));
 assert.ok(h.includes('"INS:"+str.tostring(countInside)'));
 assert.ok(h.includes('"M4:"+str.tostring(countM4)'));
 assert.ok(h.includes('"MN:"+str.tostring(countMN)'));
});

test("histories distinguish UTCmin raw from DD/MM UTC, never certify current or MSS",()=>{
 const h=history(candidate);
 assert.ok(candidate.includes('str.format_time(t, "dd/MM", "Etc/UTC")'));
 assert.ok(candidate.includes('str.tostring(int(math.floor(t / 60000)))'));
 assert.ok(h.includes('int selected = math.min(math.max(qaEventSlot - 1,0),33)'));
 assert.ok(h.includes('selected := 7'));
 for(const text of ['"2C UTCmin"','"3C UTCmin"','"INS UTCmin"','"M4 UTCmin"','"MN UTCmin"','"HIST SOLO"','"NO MSS"','"NO LIVE"','"NO PUSH"'])
  assert.ok(h.includes(text),text);
 assert.ok(!h.includes('array.get(m5Times'));
 assert.ok(!h.includes('array.get(m15Times'));
 assert.ok(!h.includes('array.get(extraM15Flags'));
 assert.ok(!h.includes('alert('));
});

test("no unreconciled extra sources or current-signal promotion of QA masks",()=>{
 assert.ok(candidate.includes('bool categoryTrue3C = not na(qaTrue3CSignedAt)'));
 assert.ok(candidate.includes('int qaCatalogMask = (categoryTrue3C ? 1 : 0)'));
 assert.ok(candidate.includes('bool categoryInsideReturn = extraInside'));
 assert.ok(candidate.includes('bool categoryMultiCandle = extraMulti or extraMultiN'));
 assert.ok(candidate.includes('int rank = not requested ? 5 : (core or qaCore) ?'));
 assert.ok(!history(candidate).includes('qaCatalogMask'));
 assert.ok(history(candidate).includes('"HIST SOLO"'));
});
