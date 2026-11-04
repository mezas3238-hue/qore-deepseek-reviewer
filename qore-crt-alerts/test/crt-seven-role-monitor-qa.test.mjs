import test from "node:test";
import assert from "node:assert/strict";
import {CRT_SEVEN_ROLES,sevenRoleView,renderCrtMssQaStatus}
  from "../src/crt-seven-role-monitor-qa.mjs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const H4=14_400_000,M15=900_000,M5=300_000;
const t=Date.parse("2026-11-02T06:01:00Z");
const identity={provider:"IC",instrumentId:"NZDCAD",
  c1StartMs:t,direction:1};
const cycleId=["IC","NZDCAD",t,1].join("|");
const sweepAtMs=t+H4+M5,c2RatifiedAtMs=t+2*H4;
const proof=(timeframe)=>({...identity,cycleId,
  pivotAtMs:t+H4-M15,
  breakAtMs:timeframe==="M5"?sweepAtMs+M5:c2RatifiedAtMs+M15,
  lastClosedAtMs:c2RatifiedAtMs+M15});
const sample=(x={})=>({ ...identity,mask:1,sourcePhaseMin:1,
  sweepAtMs,c2RatifiedAtMs,coreCrt:true,
  m5:proof("M5"),m15:proof("M15"),...x});

test("exactly seven legacy roles, distinct from independent valid entries",()=>{
 assert.equal(CRT_SEVEN_ROLES.length,7);
 assert.deepEqual(sevenRoleView({mask:127}),CRT_SEVEN_ROLES);
 assert.deepEqual(sevenRoleView({mask:0}),[]);
 assert.deepEqual(sevenRoleView({mask:1|32|64}),[
  "CRT_3C_REVERSAL","CRT_MULTICANDLE","CRT_M15_RETEST"
 ]);
 for(const invalid of [-1,128,1.1,null])assert.throws(()=>sevenRoleView({mask:invalid}));
});

test("34 feeds are separate, BTC one slot only, without any forced certification",()=>{
 assert.equal(INSTRUMENTS.length,34);
 assert.equal(INSTRUMENTS.filter(x=>x.id==="BTCUSD").length,1);
 assert.equal(INSTRUMENTS.filter(x=>x.id!=="BTCUSD").length,33);
 for(const row of INSTRUMENTS){
  const s=renderCrtMssQaStatus({
    provider:"LAB",instrumentId:row.id,direction:0,mask:0
  });
  assert.equal(s.state,"NO_CURRENT_VALID_CRT");
  assert.equal(s.certified,false);
  assert.equal(s.sendPush,false);
 }
});

test("valid same-cycle M5 and M15 can be confirmed independently, never authorize alerts",()=>{
 const both=renderCrtMssQaStatus(sample());
 assert.equal(both.mssM5,"CONFIRMED");
 assert.equal(both.mssM15,"CONFIRMED");
 assert.equal(both.crtRatified,true);
 assert.equal(both.matchedCycleId,cycleId);
 assert.equal(both.sendPush,false);
 for(const key of ["m5","m15"]){
  const broken=renderCrtMssQaStatus(sample({[key]:{...proof(key==="m5"?"M5":"M15"),
    cycleId:"IC|GBPJPY|different|1"}}));
  assert.equal(broken[key==="m5"?"mssM5":"mssM15"],"AWAITING");
  assert.equal(broken[key==="m5"?"mssM15":"mssM5"],"CONFIRMED");
 }
});

test("all native 0..4 minute phases apply to independent M15, M5 and wrong phases reject",()=>{
 for(let phase=0;phase<=4;phase++){
  const shift=(phase-1)*60_000;
  const i={...identity,c1StartMs:t+shift};
  const id=[i.provider,i.instrumentId,i.c1StartMs,1].join("|");
  const sweep=sweepAtMs+shift,ratified=c2RatifiedAtMs+shift;
  const m5={...i,cycleId:id,pivotAtMs:t+H4-M15+shift,breakAtMs:sweep+M5};
  const m15={...i,cycleId:id,pivotAtMs:t+H4-M15+shift,
    breakAtMs:ratified+M15,lastClosedAtMs:ratified+M15};
  const v={...i,mask:1,sourcePhaseMin:phase,sweepAtMs:sweep,
    c2RatifiedAtMs:ratified,coreCrt:true,m5,m15};
  const pass=renderCrtMssQaStatus(v);
  assert.equal(pass.mssM5,"CONFIRMED","M5 phase "+phase);
  assert.equal(pass.mssM15,"CONFIRMED","M15 phase "+phase);
  assert.equal(renderCrtMssQaStatus({
    ...v,m5:{...m5,breakAtMs:m5.breakAtMs+60_000}
  }).mssM5,"AWAITING");
  assert.equal(renderCrtMssQaStatus({
    ...v,m15:{...m15,breakAtMs:m15.breakAtMs+60_000}
  }).mssM15,"AWAITING");
 }
});

test("unapproved/rejected/inside candidates never become valid entries from a mask alone",()=>{
 for(const mask of [2,4,8,16,32,64,127]){
  const s=renderCrtMssQaStatus(sample({
    mask,coreCrt:false,m5:proof("M5"),m15:proof("M15")
  }));
  assert.equal(s.crtRatified,false);
  assert.equal(s.mssM5,"NOT_APPLICABLE");
  assert.equal(s.mssM15,"NOT_APPLICABLE");
  assert.equal(s.matchedCycleId,null);
 }
 const extra=renderCrtMssQaStatus(sample({mask:8,coreCrt:false,
   extraStructuralQa:true}));
 assert.equal(extra.state,"STRUCTURE_QA_NOT_APPROVED");
 assert.equal(extra.mssM5,"UNVERIFIED");
 assert.equal(extra.mssM15,"UNVERIFIED");
 assert.equal(extra.sendPush,false);
});

test("M15 cannot precede sweep, reuse a pivot after sweep or inherit M5 proof",()=>{
 const cases=[
  {m15:{...proof("M15"),pivotAtMs:sweepAtMs}},
  {m15:{...proof("M15"),breakAtMs:sweepAtMs}},
  {m15:{...proof("M15"),breakAtMs:c2RatifiedAtMs+M15,
    lastClosedAtMs:c2RatifiedAtMs}},
  {m15:{...proof("M15"),instrumentId:"EURUSD"}},
  {m15:{...proof("M15"),direction:-1}},
 ];
 for(const bad of cases){
  const result=renderCrtMssQaStatus(sample(bad));
  assert.equal(result.mssM15,"AWAITING");
  assert.equal(result.mssM5,"CONFIRMED");
 }
});
