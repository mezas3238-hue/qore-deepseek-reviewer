import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=name=>readFileSync(new URL("../../crt-radar-pro/"+name,import.meta.url),"utf8");
const original=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_QA_NO_LIVE.pine");
const latest=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_C_PRIORIDAD_MSS_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const beforeDashboard=x=>x.slice(0,x.indexOf("f_renderRadarDashboard() =>"));
const count=(s,r)=>(s.match(r)||[]).length;

test("full 34 market engine is unchanged; QA radar does not emit TradingView or FCM alerts",()=>{
 assert.equal(engine(latest),engine(original));
 assert.equal(count(latest,/^s\d\d = input\.symbol\(/gm),34);
 assert.equal(count(latest,/^\s*Signal s = request\.security\(/gm),1);
 assert.equal(count(latest,/^\s*plot\(/gm),1);
 assert.equal(count(latest,/^indicator\(/gm),1);
 assert.ok(latest.includes("lookahead=barmerge.lookahead_off"));
 assert.ok(latest.includes("qaPhase1NonBtc = input.bool(true"));
 assert.ok(latest.includes("useAlerts = input.bool(false"));
 assert.ok(!latest.includes('alert("CRT+MSS'));
 assert.ok(!latest.includes("Signal own = request.security"));
 assert.ok(!latest.includes("line.new("));
 assert.ok(latest.includes('"NO LIVE"'));
 assert.ok(latest.includes('"NO PUSH"'));
});

test("rank=0 both confirmed, rank=1 M15 only, rank=2 M5 only, rank=3 CRT without MSS",()=>{
 for(const line of [
 "int rank = not requested ? 5 : (core or qaCore) ? (m5 and m15 ? 0 : m15 ? 1 : m5 ? 2 : 3) : extraM15 ? 1 : otherStructural ? 4 : 5",
 "for priority = 0 to 5",
 "priority == rank and (expandFull34 or rank < 5)",
 "int visibleCount = expandFull34 ? nFeeds : activeCount",
 "int onPage = expandFull34 ? 10 : 2"
 ])assert.ok(latest.includes(line),line);
 assert.ok(latest.includes('bool otherStructural = (true3c or extra or insideObserved or multiObserved)'));
 assert.ok(latest.includes('bool true3c = requested and not core and not qaCore'));
 assert.ok(latest.includes('bool catInsideReturn = int(math.floor(mask / 8)) % 2 == 1'));
 assert.ok(latest.includes('bool catMulti = int(math.floor(mask / 32)) % 2 == 1'));
 assert.ok(latest.includes('ownExtraM15 ? "QA SI"'));
});

test("QA M5 and QA M15 have their own counters, never appear as zero Core M15",()=>{
 for(const x of [
 'int coreM15Count = 0','int qaM5Count = 0','int qaM15Count = 0',
 'if qaCore and m5','if qaCore and m15 or extraM15',
 '"M5q:"+str.tostring(qaM5Count)',
 '"M15q:"+str.tostring(qaM15Count)',
 '"M15c:"+str.tostring(coreM15Count)',
 '"QA:"+str.tostring(qaStructCount)',
 '"R:"+str.tostring(checked)+"/"+str.tostring(nFeeds)'
 ])assert.ok(latest.includes(x),x);
 assert.ok(!latest.includes('"M15:"+str.tostring(m15SameCycle)'));
});

test("MSS may only be confirmed when independent pivot, sweep and closed timestamp match same C1",()=>{
 const s=latest.slice(latest.indexOf('f_monitorOwnMss(int slot) =>'),latest.indexOf('f_renderRadarDashboard() =>'));
 for(const x of [
 'bool coreOrQa = array.get(validCoreFlags,slot) or array.get(qaCoreObservedFlags,slot)',
 'int c1T = array.get(qaC1BySlot,slot)',
 'int sweepT = array.get(qaSweepBySlot,slot)',
 'int ratT = array.get(qaRatBySlot,slot)',
 'p5 < sweepT and b5 > sweepT',
 'b5 % MIN5 == phase * 60000',
 'p15 < sweepT and b15 > sweepT',
 'b15 <= lastClosed15 and f_m15_phase_ok(b15,phase)',
 '[m5Confirmed,m15Confirmed]'
 ])assert.ok(s.includes(x),x);
 assert.ok(latest.includes('qaCore ? (ownM5 ? "QA SI" : "QA --")'));
 assert.ok(latest.includes('qaCore ? (ownM15 ? "QA SI" : "QA --")'));
 assert.ok(latest.includes('true3c ? "3C TRUE QA"'));
 assert.ok(latest.includes('catInsideReturn ? "INS RET QA"'));
 assert.ok(latest.includes('catMulti ? "MULTI QA"'));
 assert.ok(latest.includes('qaDiagnostics ? catExpansion ? "EXP RECH"'));
});

test("only dashboard presentation code added; all source readers and incoming Signal arrays identical",()=>{
 const normalize=x=>x.replace(
 'indicator("QORE CRT RADAR | 34 mercados MSS primero V34.12C QA", shorttitle="QORE CRT Radar 12C"',
 'indicator("QORE CRT RADAR | 34 mercados CRT/MSS QA V34.12A", shorttitle="QORE CRT Radar 12A"'
 );
 const previousPrefix=original.slice(0,original.indexOf('f_renderRadarDashboard() =>'));
 const newPrefix=latest.slice(0,latest.indexOf('// Closed MSS evidence from the SAME symbol'));
 assert.equal(normalize(newPrefix),previousPrefix);
 assert.ok(latest.includes('bool c1Ready = (core or qaCore) ? coreC1Ready'));
 assert.ok(latest.includes('string visibleStage = lacksC1 ? "C1 N/D" : stage'));
});

test("34 source counts and page capacity do not confuse QA historical roles with certified patterns",()=>{
 assert.ok(latest.includes('bool requested = scanAll or i == 7'));
 assert.ok(latest.includes('bool qaCore = requested and array.get(qaCoreObservedFlags,i)'));
 assert.ok(latest.includes('bool extra = requested and array.get(validCrtFlags,i)'));
 assert.ok(latest.includes('qaDiagnostics = expandFull34 and showCatalog7'));
 assert.ok(latest.includes('if not expandFull34 and activeCount == 0'));
 assert.ok(latest.includes('"4 BASE + VAR"'));
 assert.ok(latest.includes('"7 ROLES QA"'));
 assert.ok(latest.includes('"QA NO CERT"'));
});
