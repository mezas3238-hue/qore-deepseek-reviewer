import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=name=>readFileSync(new URL(name,root),"utf8");
const baseline=read("CRT_RADAR_PRO_V34_10B_QA_TRES_CICLOS_NO_INTEGRADO.pine");
const candidate=read("CRT_RADAR_PRO_V34_10B_QA_ALERTAS_RATIFICADAS_NO_INTEGRADO.pine");
const M=60_000;
const entry=(o={})=>({phase:2,c1:100,c2Start:200*M,ratifiedAt:440*M,m5:250*M,m15:260*M,...o});
function alertDecision(s, now, ids={m5:0,m15:0},freshMinutes=20){
 const certified=s.phase===2&&s.c1>0&&Number.isFinite(s.c2Start)&&Number.isFinite(s.ratifiedAt);
 const decide=(t,last)=>certified&&t>=s.c2Start&&last!==s.c1&&now>=Math.max(t,s.ratifiedAt)&&now-Math.max(t,s.ratifiedAt)<=freshMinutes*M;
 return {m5:decide(s.m5,ids.m5),m15:decide(s.m15,ids.m15)};
}
test("STATIC: the alert QA candidate keeps V34.10b M5B and three NY cycles",()=>{
 for(const x of ["f_update_context_fvg(", "f_allowed(int hh", "America/New_York", 'scheduleMode = input.string("Solo C1 de tres horarios NY"'])
   assert.ok(baseline.includes(x)&&candidate.includes(x));
});
test("STATIC: no extra request.security or extra symbols in candidate",()=>{
 const count=s=>s.split("\n").filter(l=>!l.trimStart().startsWith("//")&&l.includes("request.security(")).length;
 assert.equal(count(candidate),2);assert.equal(count(candidate),count(baseline));
 assert.equal(candidate.split("\n").filter(l=>/^s\d\d = input\.symbol\(/.test(l)).length,34);
});
test("STATIC: structural change limited to one UDT scalar, input and alert logic",()=>{
 assert.ok(candidate.includes("int crtRatifiedAt"));
 assert.ok(candidate.includes("outPhase == 2 ? c3Start : na"));
 assert.ok(candidate.includes("bool certifiedCRT = st == 2"));
 assert.ok(candidate.includes("int eligibleM5At = validM5 ? math.max(m5t, s.crtRatifiedAt) : na"));
 assert.ok(candidate.includes("int eligibleM15At = validM15 ? math.max(m15t, s.crtRatifiedAt) : na"));
 assert.ok(candidate.includes("alert.freq_all"));
 assert.ok(candidate.includes("varip array<int> alert5IDs")&&candidate.includes("varip array<int> alert15IDs"));
});
test("MODEL: C2 provisional never alerts even with MSS confirmations",()=>{
 assert.deepEqual(alertDecision(entry({phase:1}),300*M),{m5:false,m15:false});
});
test("MODEL: C2 MSS earlier than ratification does not alert early",()=>{
 assert.deepEqual(alertDecision(entry(),439*M),{m5:false,m15:false});
});
test("MODEL: retained C2 MSS both alert immediately on C3 ratification",()=>{
 assert.deepEqual(alertDecision(entry(),445*M),{m5:true,m15:true});
});
test("MODEL: C2 MSS not declared stale relative to original pivot time",()=>{
 assert.deepEqual(alertDecision(entry({m5:201*M,m15:202*M}),452*M),{m5:true,m15:true});
});
test("MODEL: C3 fresh M5 may alert separately",()=>{
 assert.deepEqual(alertDecision(entry({m5:450*M,m15:500*M}),451*M),{m5:true,m15:false});
});
test("MODEL: C3 fresh M15 may alert separately",()=>{
 assert.deepEqual(alertDecision(entry({m5:500*M,m15:450*M}),451*M),{m5:false,m15:true});
});
test("MODEL: no pre-C2 or out-of-cycle event",()=>{
 assert.deepEqual(alertDecision(entry({m5:199*M,m15:199*M}),445*M),{m5:false,m15:false});
});
test("MODEL: confirmed recent-historical phase 3 does not alert",()=>{
 assert.deepEqual(alertDecision(entry({phase:3}),445*M),{m5:false,m15:false});
});
test("MODEL: no alert on unconfirmed or missing ratification timestamp",()=>{
 assert.deepEqual(alertDecision(entry({ratifiedAt:NaN}),445*M),{m5:false,m15:false});
});
test("MODEL: alerts expire after 20 minutes",()=>{
 assert.deepEqual(alertDecision(entry(),461*M),{m5:false,m15:false});
});
test("MODEL: dedup same C1 after alert even if script recalculates",()=>{
 assert.deepEqual(alertDecision(entry(),445*M,{m5:100,m15:100}),{m5:false,m15:false});
});
test("MODEL: new C1 can issue independent alerts",()=>{
 assert.deepEqual(alertDecision(entry({c1:101}),445*M,{m5:100,m15:100}),{m5:true,m15:true});
});
test("MODEL: valid event at ratification boundary",()=>{
 assert.deepEqual(alertDecision(entry(),440*M),{m5:true,m15:true});
});
test("MODEL: late event > 20m expires on M15/H4 slow chart",()=>{
 assert.deepEqual(alertDecision(entry(),480*M),{m5:false,m15:false});
});
test("MODEL: fresh C3 can still alert after C2 event window",()=>{
 assert.deepEqual(alertDecision(entry({m5:478*M,m15:479*M}),480*M),{m5:true,m15:true});
});
