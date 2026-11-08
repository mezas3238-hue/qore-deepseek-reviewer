import test from "node:test";
import assert from "node:assert/strict";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {C1_HOURS} from "../src/ny-clock.mjs";
import {inspectAll34NativeVsOwnerH4ClockQA}
 from "../src/qa-ctrader-34-native-vs-owner-h4-clock.mjs";
import {auditCrtMss34ClosedBrokerBars}
 from "../src/qa-ctrader-34-crt-mss-closed-replay.mjs";
import {OBSERVED_IC34_CANDIDATES}
 from "../src/qa-ctrader-full34-m5-cohort.mjs";
const M5=300_000,START=Date.parse("2026-11-04T20:00:00.000Z");
const full=(id,symbolId,start=START,gapAt=-1)=>
 Array.from({length:600},(_,i)=>{
  const at=start+(i+(i>=gapAt&&gapAt>=0?1:0))*M5;
  const px=1.2+i/1000;
  return {
   provider:"IC",instrumentId:id,symbolId,
   source:"CTRADER_OPEN_API_DEMO",certified:false,
   actionable:false,sendPush:false,transport:"DISABLED",
   openedAt:at,closedAt:at+M5,open:px,
   high:px+.001,low:px-.001,close:px+.0002
  };
 });
const h4=(id,phase=[120])=>({
 periodName:"H4",instrumentId:id,nativeBarsFetched:30,
 matchedUtcAndCompleteM5Blocks:11,mismatchBars:0,
 nativeUtcH4PhasesMinutes:phase,
 sourceParityCertified:false,canTrade:false,sendPush:false
});
const m15=id=>({
 periodName:"M15",instrumentId:id,nativeBarsFetched:250,
 matchedUtcAndCompleteM5Blocks:200,mismatchBars:0,
 sourceParityCertified:false,canTrade:false,sendPush:false
});
const inspect=(id,{start=START,gap=-1,phase=[120]}={})=>{
 const x=OBSERVED_IC34_CANDIDATES.find(r=>r.instrumentId===id);
 return inspectAll34NativeVsOwnerH4ClockQA({
  instrumentId:id,symbolId:x.nativeId,
  closedM5:full(id,x.nativeId,start,gap),
  asOfMs:start+700*M5,nativeH4:h4(id,phase)
 });
};
test("all sovereign 34: three winter index H4 conflicts, 31 broker-aligned QA samples",()=>{
 assert.equal(OBSERVED_IC34_CANDIDATES.length,34);
 assert.deepEqual(OBSERVED_IC34_CANDIDATES.map(x=>x.instrumentId),
  INSTRUMENTS.map(x=>x.id));
 const results=INSTRUMENTS.map(x=>inspect(x.id));
 assert.equal(results.length,34);
 const conflicts=results.filter(x=>x.state===
  "NATIVE_VS_OWNER_H4_ANCHOR_CONFLICT_QA");
 assert.deepEqual(conflicts.map(x=>x.instrumentId),
  ["NDX100","SPX500","US30"]);
 assert.equal(results.filter(x=>x.state===
  "SAMPLED_H4_ANCHOR_ALIGNED_BUT_NOT_CERTIFIED_QA").length,31);
 for(const x of conflicts){
  assert.equal(x.nativeH4UtcPhaseMin,120);
  assert.deepEqual(x.configuredH4UtcPhasesMin,[180]);
  assert.equal(x.timestampMatchedCompleteH4,0);
  assert.ok(x.ownerCompleteH4>0);
  assert.ok(x.nativeCompleteH4>0);
  assert.equal(x.nativeAtApprovedC1Hours,0);
  assert.ok(x.nativeAtUnapprovedEarlierHours>0);
  assert.equal(x.requiresOwnerClockReview,true);
 }
 for(const x of results){
  assert.equal(x.clockReconciled,false);
  assert.equal(x.approvedC1ClockUnchanged,true);
  assert.equal(x.timezoneCrossSeasonCertified,false);
  assert.equal(x.crtCertified,false);
  assert.equal(x.actionable,false);
  assert.equal(x.sendPush,false);
  assert.equal(x.canTrade,false);
 }
 assert.deepEqual(C1_HOURS.index,[2,6,22]);
});
test("a market reopening gap cannot create a complete artificial native H4",()=>{
 const noGap=inspect("NDX100");
 const withGap=inspect("NDX100",{gap:121});
 assert.ok(withGap.nativeIncompleteH4>=noGap.nativeIncompleteH4);
 assert.ok(withGap.nativeCompleteH4<noGap.nativeCompleteH4);
 assert.equal(withGap.nativeH4UtcPhaseMin,120);
 assert.equal(withGap.sendPush,false);
});
test("summer is only a synthetic hypothesis; seasonal alignment cannot certify winter",()=>{
 const start=Date.parse("2026-07-07T20:00:00.000Z");
 const index=inspect("US30",{start});
 assert.equal(index.state,
  "SAMPLED_H4_ANCHOR_ALIGNED_BUT_NOT_CERTIFIED_QA");
 assert.equal(index.nativeH4UtcPhaseMin,120);
 assert.deepEqual(index.configuredH4UtcPhasesMin,[120]);
 assert.ok(index.timestampMatchedCompleteH4>0);
 assert.equal(index.timezoneCrossSeasonCertified,false);
 assert.equal(index.clockReconciled,false);
});
test("multiple observed native H4 phases require DST segmentation, not silent conversion",()=>{
 const x=inspect("SPX500",{phase:[120,180]});
 assert.equal(x.state,"MULTI_PHASE_REQUIRES_SEGMENTED_DST_AUDIT_QA");
 assert.equal(x.sendPush,false);
 assert.equal(x.clockReconciled,false);
});
test("bad provider, time, open bars or forged native M5/H4 parity are fail-closed",()=>{
 const x=OBSERVED_IC34_CANDIDATES[4];
 for(const changed of [{provider:"OTHER"},{symbolId:999},
  {certified:true},{sendPush:true},{transport:"FCM"},
  {closedAt:Date.parse("2026-11-09T00:00:00Z")} ]){
  const bars=full(x.instrumentId,x.nativeId);
  bars[35]={...bars[35],...changed};
  assert.throws(()=>inspectAll34NativeVsOwnerH4ClockQA({
   instrumentId:x.instrumentId,symbolId:x.nativeId,closedM5:bars,
   asOfMs:START+700*M5,nativeH4:h4(x.instrumentId)
  }),/CRT34_CLOCK_SOURCE_/);
 }
 const result=inspectAll34NativeVsOwnerH4ClockQA({
  instrumentId:x.instrumentId,symbolId:x.nativeId,
  closedM5:full(x.instrumentId,x.nativeId),
  asOfMs:START+700*M5,
  nativeH4:{...h4(x.instrumentId),mismatchBars:1}
 });
 assert.equal(result.state,"NATIVE_H4_PROOF_NOT_ACCEPTED_QA");
 assert.equal(result.canTrade,false);assert.equal(result.sendPush,false);
});
test("existing CRT/MSS index veto remains even if dual-clock diagnostics display H4s",()=>{
 const id="NDX100",symbolId=10014;
 const r=auditCrtMss34ClosedBrokerBars({
  instrumentId:id,symbolId,bars:full(id,symbolId),
  asOfMs:START+700*M5,nativeM15:m15(id),nativeH4:h4(id)
 });
 assert.equal(r.state,"NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA");
 assert.equal(r.cyclesEvaluated,0);
 assert.equal(r.nativeOwnerClockQA.state,
  "NATIVE_VS_OWNER_H4_ANCHOR_CONFLICT_QA");
 assert.equal(r.nativeOwnerClockQA.timestampMatchedCompleteH4,0);
 assert.equal(r.mssM5Certified,false);
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.sendPush,false);
});
