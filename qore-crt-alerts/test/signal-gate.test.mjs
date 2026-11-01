import test from "node:test";
import assert from "node:assert/strict";
import {classifyReplayConfluence} from "../src/signal-gate.mjs";
const c1=Date.parse("2026-10-30T05:00:00Z"),c2=c1+14400000;
const crt={state:"C2_RATIFIED_AWAITING_C3",provider:"FIXTURE",instrumentId:"EURUSD",
  c1Start:c1,c2Start:c2,direction:1,actionable:false};
const key="FIXTURE|EURUSD|"+c1+"|1";
const m15={state:"MSS_CONFIRMED_C2",timeframe:"M15",cycleId:key,
  c1Start:c1,direction:1,mssAt:c2+900000,eligibleAfter:c2+14400000};
const m5={state:"MSS_CONFIRMED_C2",timeframe:"M5",cycleId:key,
  c1Start:c1,direction:1,mssAt:c2+600000};
const gate=(crtIn=crt,m15In=m15,m5In=null)=>classifyReplayConfluence({
  crt:crtIn,mssM15:m15In,mssM5:m5In});
test("CRT + same-cycle M15 => REPLAY confluence, not a live alert",()=>{
  const r=gate();
  assert.equal(r.state,"REPLAY_CRT_M15_CONFLUENCE");
  assert.equal(r.sendPush,false);assert.equal(r.actionable,false);
  assert.equal(r.environment,"OFFLINE_REPLAY");
  assert.equal(r.mssM5At,null);
});
test("M5 by itself is NOT an accepted operational confluence",()=>{
  assert.equal(gate(crt,null,m5).state,"AWAITING_MSS_M15");
});
test("optional matching M5 provides extra context without changing gating",()=>{
  const r=gate(crt,m15,m5);
  assert.equal(r.state,"REPLAY_CRT_M15_CONFLUENCE");
  assert.equal(r.mssM5At,m5.mssAt);
});
test("M15 from a different C1 cannot contaminate the current CRT",()=>{
  assert.equal(gate(crt,{...m15,cycleId:key+"other"}).state,"IDENTITY_OR_TIME_MISMATCH");
});
test("M15 on another asset/provider cannot be reused",()=>{
  assert.equal(gate(crt,{...m15,cycleId:"OTHER|EURUSD|"+c1+"|1"}).state,"IDENTITY_OR_TIME_MISMATCH");
});
test("wrong directional M15 is rejected",()=>{
  assert.equal(gate(crt,{...m15,direction:-1}).state,"IDENTITY_OR_TIME_MISMATCH");
});
test("CRT invalidated C3 disables any previously recorded MSS",()=>{
  assert.equal(gate({...crt,state:"C3_INVALIDATED"}).state,"CRT_NOT_VALID");
});
test("provisional CRT is NOT a valid gating condition",()=>{
  assert.equal(gate({...crt,state:"C2_PROVISIONAL"}).state,"CRT_NOT_VALID");
});
test("M15 crossing before C2 start must not pass",()=>{
  assert.equal(gate(crt,{...m15,mssAt:c2}).state,"IDENTITY_OR_TIME_MISMATCH");
});
test("signal ID is deterministic across replay and independent of optional M5",()=>{
  assert.equal(gate().signalId,gate(crt,m15,m5).signalId);
  assert.equal(gate().signalId,key+"|MSS_M15|"+m15.mssAt);
});
test("M5 from wrong cycle never gets attached to the M15 confluence",()=>{
  assert.equal(gate(crt,m15,{...m5,cycleId:"WRONG"}).mssM5At,null);
});
