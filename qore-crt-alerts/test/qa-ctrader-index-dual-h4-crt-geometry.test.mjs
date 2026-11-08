import test from "node:test";
import assert from "node:assert/strict";
import {compareIndexH4GeometryTwoClocksQA}
 from "../src/qa-ctrader-index-dual-h4-crt-geometry.mjs";
import {auditCrtMss34ClosedBrokerBars}
 from "../src/qa-ctrader-34-crt-mss-closed-replay.mjs";
import {OBSERVED_IC34_CANDIDATES}
 from "../src/qa-ctrader-full34-m5-cohort.mjs";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {C1_HOURS} from "../src/ny-clock.mjs";
const START=Date.parse("2026-11-04T20:00:00Z"),M5=300000;
const ASOF=START+605*M5;
const fake=(name,symbolId,{start=START,tailGapAt=-1,
    c2Sweep=true}={})=>{
 const bars=Array.from({length:600},(_,i)=>{
  const openedAt=start+(i+(tailGapAt>=0&&i>=tailGapAt?1:0))*M5;
  const spike=c2Sweep&&openedAt===Date.parse("2026-11-05T10:00:00Z");
  const low=spike?88:90;
  return {provider:"IC",instrumentId:name,symbolId,
    source:"CTRADER_OPEN_API_DEMO",certified:false,
    actionable:false,sendPush:false,transport:"DISABLED",
    openedAt,closedAt:openedAt+M5,
    open:95,high:100,low,close:95};
 });
 return bars;
};
const proof=(id,phase=[120])=>({
 periodName:"H4",instrumentId:id,nativeBarsFetched:30,
 matchedUtcAndCompleteM5Blocks:11,mismatchBars:0,
 nativeUtcH4PhasesMinutes:phase,
 sourceParityCertified:false,canTrade:false,sendPush:false
});
const m15=id=>({
 periodName:"M15",instrumentId:id,nativeBarsFetched:250,
 matchedUtcAndCompleteM5Blocks:180,mismatchBars:0,
 sourceParityCertified:false,canTrade:false,sendPush:false
});
const run=(id,opts={},phase=[120])=>{
 const row=OBSERVED_IC34_CANDIDATES.find(x=>x.instrumentId===id);
 const bars=fake(id,row.nativeId,opts);
 return compareIndexH4GeometryTwoClocksQA({
  instrumentId:id,symbolId:row.nativeId,closedM5:bars,
  asOfMs:opts.start?opts.start+605*M5:ASOF,
  nativeH4:proof(id,phase)
 });
};
test("all three indices compare exactly same source but keep C1 owner clock and no signals",()=>{
 assert.deepEqual(C1_HOURS.index,[2,6,22]);
 for(const id of ["NDX100","SPX500","US30"]){
  const a=run(id);
  assert.equal(a.state,"INDEX_H4_GEOMETRY_TWO_CLOCKS_COMPARED_UNCERTIFIED");
  assert.equal(a.same600M5ForBoth,true);
  assert.equal(a.closedM5Compared,600);
  assert.deepEqual(a.approvedOwnerC1NY,[2,6,22]);
  assert.deepEqual(a.nativeCandidateC1NY,[1,5,21]);
  assert.equal(a.ownerClockMatchesNative,false);
  assert.ok(a.ownerCompleteH4>0&&a.nativeCompleteH4>0);
  assert.ok(a.unapprovedNativeGeometry.c2SingleSweepReturn>=1);
  assert.ok(a.unapprovedNativeGeometry.c3ClosedValid>=1);
  assert.ok(a.unapprovedNativeWitnesses.some(x=>
    x.c1OpenMs===Date.parse("2026-11-05T06:00:00Z")&&
    x.category==="C2_SINGLE_SWEEP_RETURN_QA"&&x.direction===1&&
    x.c2CloseMs===Date.parse("2026-11-05T14:00:00Z")));
  assert.ok(!a.ownerWitnesses.some(x=>
    x.c1OpenMs===Date.parse("2026-11-05T06:00:00Z")));
  assert.equal(a.clockChangeAuthorized,false);
  assert.equal(a.indexCrtMssBlocked,true);
  assert.equal(a.actionable,false);
  assert.equal(a.canTrade,false);
  assert.equal(a.sendPush,false);
  assert.equal(a.noRepaintCertified,false);
  assert.equal(a.sevenCategoryEventParityCertified,false);
 }
});
test("sample without low sweep has no falsely invented 2C on either clock",()=>{
 const r=run("NDX100",{c2Sweep:false});
 assert.equal(r.unapprovedNativeGeometry.c2SingleSweepReturn,0);
 assert.equal(r.ownerGeometry.c2SingleSweepReturn,0);
 assert.equal(r.sharedWitnessIdentities>=0,true);
 assert.equal(r.sendPush,false);
});
test("missing M5 inside native C2 never becomes a complete H4 or positive CRT",()=>{
 const gapIdx=(Date.parse("2026-11-05T11:00:00Z")-START)/M5;
 const r=run("SPX500",{tailGapAt:gapIdx});
 assert.ok(r.nativeIncompleteH4>=1);
 assert.ok(!r.unapprovedNativeWitnesses.some(x=>
   x.c1OpenMs===Date.parse("2026-11-05T06:00:00Z")&&
   x.category==="C2_SINGLE_SWEEP_RETURN_QA"));
 assert.equal(r.canTrade,false);
});
test("native phase unknown or multi-phase DST cannot emit clock comparison geometry",()=>{
 for(const phase of [[120,180],[],[240]]){
  const r=run("US30",{},phase);
  assert.equal(r.state,"INDEX_DUAL_H4_SOURCE_OR_PHASE_NOT_PROVEN_QA");
  assert.equal(r.actionable,false);
  assert.equal(r.sendPush,false);
  assert.equal(r.unapprovedNativeWitnesses,undefined);
 }
});
test("misbound instrument, compromised source and open bars fail closed",()=>{
 const idx=OBSERVED_IC34_CANDIDATES.find(x=>x.instrumentId==="NDX100");
 for(const id of ["EURUSD","BTCUSD","XAUUSD"]){
  assert.throws(()=>compareIndexH4GeometryTwoClocksQA({
   instrumentId:id,symbolId:idx.nativeId,
   closedM5:fake("NDX100",idx.nativeId),
   asOfMs:ASOF,nativeH4:proof(id)
  }),/CRT_INDEX_DUAL_CLOCK_APPROVED_SCOPE_CHANGED/);
 }
 for(const patch of [{provider:"OTHER"},{symbolId:9999},
  {transport:"FCM"},{certified:true},{actionable:true},
  {openedAt:ASOF,closedAt:ASOF+M5}]){
  const b=fake("NDX100",idx.nativeId);
  b[67]={...b[67],...patch};
  assert.throws(()=>compareIndexH4GeometryTwoClocksQA({
   instrumentId:"NDX100",symbolId:idx.nativeId,
   closedM5:b,asOfMs:ASOF,nativeH4:proof("NDX100")
  }),/CRT34_CLOCK_SOURCE_/);
 }
});
test("34/34 cohort unchanged: 3 index vetoes carry only QA dual-clock geometry",()=>{
 assert.equal(INSTRUMENTS.length,34);
 assert.deepEqual(INSTRUMENTS.map(x=>x.id),
  OBSERVED_IC34_CANDIDATES.map(x=>x.instrumentId));
 const reports=OBSERVED_IC34_CANDIDATES.map(x=>
  auditCrtMss34ClosedBrokerBars({
   instrumentId:x.instrumentId,symbolId:x.nativeId,
   bars:fake(x.instrumentId,x.nativeId),asOfMs:ASOF,
   nativeM15:m15(x.instrumentId),nativeH4:proof(x.instrumentId)
  }));
 assert.equal(reports.length,34);
 assert.deepEqual(reports.filter(x=>
  x.state==="NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA")
  .map(x=>x.instrumentId),["NDX100","SPX500","US30"]);
 assert.equal(reports.filter(x=>
  x.state==="CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED")
  .length,31);
 for(const x of reports){
  assert.equal(x.canTrade,false);assert.equal(x.sendPush,false);
  assert.equal(x.crtCertified,undefined);
  if(["NDX100","SPX500","US30"].includes(x.instrumentId)){
   assert.equal(x.cyclesEvaluated,0);
   assert.equal(x.indexClockGeometryQA?.indexCrtMssBlocked,true);
   assert.equal(x.indexClockGeometryQA?.same600M5ForBoth,true);
   assert.equal(x.mssM5Certified,false);
   assert.equal(x.mssM15Certified,false);
  }else assert.equal(x.indexClockGeometryQA,undefined);
 }
});
