import test from "node:test";
import assert from "node:assert/strict";
import {auditCrtMss34ClosedBrokerBars}
 from "../src/qa-ctrader-34-crt-mss-closed-replay.mjs";
import {readDemoViewProbeConfig}
 from "../src/ctrader-demo-wss-probe-qa.mjs";
import {runAuthorizedFull34M5Cohort,OBSERVED_IC34_CANDIDATES,
 COHORT34_OPT_IN} from "../src/qa-ctrader-full34-m5-cohort.mjs";
const START=Date.parse("2026-11-04T20:00:00Z"),M5=300000;
const ASOF=START+600*M5+M5;
const mk=(name,id,delta=0)=>Array.from({length:600},(_,i)=>{
 const t=START+i*M5,open=1.23+delta;
 return {provider:"IC",instrumentId:name,symbolId:id,
  source:"CTRADER_OPEN_API_DEMO",
  certified:false,actionable:false,sendPush:false,
  transport:"DISABLED",openedAt:t,closedAt:t+M5,
  open,high:open+0.02,low:open-0.02,close:open};
});
const proof=(instrumentId,periodName)=>({
 periodName,instrumentId,nativeBarsFetched:periodName==="M15"?250:30,
 matchedUtcAndCompleteM5Blocks:periodName==="M15"?200:11,
 nativeUtcH4PhasesMinutes:[120],mismatchBars:0,
 sourceParityCertified:false,canTrade:false,sendPush:false
});
function run(id="EURUSD"){
 const row=OBSERVED_IC34_CANDIDATES.find(x=>x.instrumentId===id);
 return auditCrtMss34ClosedBrokerBars({
  instrumentId:id,symbolId:row.nativeId,
  bars:mk(id,row.nativeId),asOfMs:ASOF,
  nativeM15:proof(id,"M15"),nativeH4:proof(id,"H4")
 });
}
test("ALL 34 symbols are checked; index native H4 clock conflicts blocked not shifted",()=>{
 const actual=OBSERVED_IC34_CANDIDATES.map(r=>run(r.instrumentId));
 assert.equal(actual.length,34);
 const conflict=actual.filter(x=>
   x.state==="NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA");
 assert.deepEqual(conflict.map(x=>x.instrumentId),
  ["NDX100","SPX500","US30"]);
 for(const r of conflict){
  assert.deepEqual(r.nativeH4UtcPhaseMin,[120]);
  assert.deepEqual(r.configuredNyH4UtcPhaseMin,[180]);
  assert.equal(r.cyclesEvaluated,0);
  assert.equal(r.prohibitedAutoShift,true);
  assert.equal(r.requiresOwnerClockReview,true);
  assert.equal(r.sendPush,false);
 }
 const evaluated=actual.filter(x=>
   x.state==="CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED");
 assert.equal(evaluated.length,31);
 assert.ok(evaluated.every(x=>x.cyclesEvaluated>=1));
 assert.ok(evaluated.every(x=>x.mssM5Certified===false&&
   x.mssM15Certified===false&&x.noRepaintCertified===false));
 for(const x of actual){
  assert.equal(x.certified,false);
  assert.equal(x.actionable,false);
  assert.equal(x.sourceParityCertified,false);
  assert.equal(x.sendPush,false);
  assert.equal(x.canTrade,false);
 }
});
test("real source identity and unclosed/future data are rejected",()=>{
 const row=OBSERVED_IC34_CANDIDATES.find(x=>x.instrumentId==="EURUSD");
 for(const patch of [
  {source:"TRADINGVIEW_PINE_V6"},
  {symbolId:99999},{provider:"OTHER"},
  {certified:true},{sendPush:true},{actionable:true},
  {openedAt:ASOF,closedAt:ASOF+M5},
  {open:Infinity}
 ]){
  const bars=mk("EURUSD",row.nativeId);
  bars[55]={...bars[55],...patch};
  assert.throws(()=>auditCrtMss34ClosedBrokerBars({
   instrumentId:"EURUSD",symbolId:row.nativeId,
   bars,asOfMs:ASOF,nativeM15:proof("EURUSD","M15"),
   nativeH4:proof("EURUSD","H4")
  }),/CRT34_CLOSED_M5/);
 }
});
test("mismatched native OHLC cannot be used as CRT source",()=>{
 const id="BTCUSD",sym=10026;
 const result=auditCrtMss34ClosedBrokerBars({
   instrumentId:id,symbolId:sym,bars:mk(id,sym),
   asOfMs:ASOF,
   nativeM15:{...proof(id,"M15"),mismatchBars:1},
   nativeH4:proof(id,"H4")
 });
 assert.equal(result.state,"NATIVE_M15_H4_MATCH_REQUIRED");
 assert.equal(result.sendPush,false);
 assert.equal(result.certified,false);
});
test("seven roles are distinct informational roles, never seven trade authorizations",()=>{
 const r=run("EURUSD");
 assert.equal(r.crtRoleObservations.length,7);
 assert.deepEqual(r.crtRoleObservations.map(x=>x.role),[
  "CRT_3C_REVERSAL","CRT_2C_CANDIDATE","CRT_2C_EXPANSION",
  "CRT_INSIDE_RETURN","CRT_INSIDE_CONTINUATION",
  "CRT_MULTICANDLE","CRT_M15_RETEST"
 ]);
 assert.equal(r.crtRoleObservations.find(x=>
  x.role==="CRT_2C_CANDIDATE").kind,"PROVISIONAL");
 assert.equal(r.crtRoleObservations.find(x=>
  x.role==="CRT_INSIDE_CONTINUATION").kind,"REJECTION");
 assert.ok(r.crtRoleObservations.every(x=>!x.independentlyVerified&&
  x.actionable===false&&x.sendPush===false));
 assert.equal(r.mssM5ClosedWitnesses,0);
 assert.equal(r.mssM15ClosedWitnesses,0);
 assert.equal(r.sevenCrtRolesCertified,false);
});
const env={
 QORE_CT_QA_COHORT34:COHORT34_OPT_IN,
 QORE_CT_QA_COHORT34_PAGES:"2",
 QORE_CT_QA_NATIVE_ALL34_TF:"OWNER_APPROVED_34_NATIVE_M15_H4_QA",
 QORE_CT_QA_CRT_MSS_ALL34:"OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA",
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
 QORE_PROVIDER:"IC",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_ACCOUNT_DISCOVERY:"DISABLED",
 QORE_CT_QA_HISTORY_PAGES:"1",QORE_CT_QA_M5_CSV_EXPORT:"DISABLED",
 QORE_CT_QA_NATIVE_M15_COMPARE:"DISABLED",
 QORE_CT_QA_NATIVE_H4_AUDIT:"DISABLED",
 QORE_CT_CLIENT_ID:"fake-client",QORE_CT_CLIENT_SECRET:"never-log",
 QORE_CT_VIEW_ACCESS_TOKEN:"never-log",QORE_CT_DEMO_ACCOUNT_ID:"123456789"
};
test("34 manifested source rows require independent CRT/MSS audit on each slot",async()=>{
 const symbols=OBSERVED_IC34_CANDIDATES.map(x=>({
  symbolId:x.nativeId,symbolName:x.nativeName,enabled:true
 }));
 let calls=0;
 const r=await runAuthorizedFull34M5Cohort({
  env,throttleMs:0,
  probe:async({config})=>{
   calls++;
   if(!config.sampleSymbolId){
    assert.equal(config.auditCrtMssAll34,false);
    return {state:"INVENTORY_QA_ONLY",symbols};
   }
   assert.equal(config.compareNativeAll34,true);
   assert.equal(config.auditCrtMssAll34,true);
   const market=OBSERVED_IC34_CANDIDATES.find(x=>
    x.instrumentId===config.sampleInstrumentId);
   const replay=run(market.instrumentId);
   return {state:"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED",
    symbolName:market.nativeName,barCount:600,pagesFetched:2,
    gaps:0,missingM5Intervals:0,gapIntervals:[],
    gapIntervalsTruncated:false,nativePhaseMin:0,
    native34M15Summary:proof(market.instrumentId,"M15"),
    native34H4Summary:proof(market.instrumentId,"H4"),
    crtMss34Replay:replay};
  }
 });
 assert.equal(calls,35);
 assert.equal(r.expected,34);
 assert.equal(r.attempted,34);
 assert.equal(r.crtClockMarketsAudited,34);
 assert.equal(r.crtCausalMarketsEvaluated,31);
 assert.equal(r.clockMismatchMarketCount,3);
 assert.deepEqual(r.clockMismatchMarkets,["NDX100","SPX500","US30"]);
 assert.equal(r.all34CrtMssSignalsCertified,false);
 assert.equal(r.state,"CTRADER_34_CRT_MSS_CLOCK_AUDIT_UNCERTIFIED");
 assert.equal(r.sendPush,false);assert.equal(r.canTrade,false);
});
test("no opt-in, LIVE, push/trading or partial history can run the 34 CRT replay",async()=>{
 const patches=[
  {QORE_CT_QA_CRT_MSS_ALL34:"DISABLED"},
  {QORE_CT_QA_NATIVE_ALL34_TF:"DISABLED"},
  {QORE_CT_QA_COHORT34_PAGES:"1"},
  {QORE_CT_STAGE:"LIVE"},
  {QORE_CT_OAUTH_SCOPE:"trading"},
  {QORE_PUSH_ENABLED:"true"},
  {QORE_TRADING_ENABLED:"true"},
  {QORE_CT_QA_M5_CSV_EXPORT:"OWNER_APPROVED_PRIVATE_QA_CSV_ONLY"}
 ];
 const full={...env,QORE_CT_SAMPLE_SYMBOL_ID:"1",
  QORE_CT_SAMPLE_SYMBOL_NAME:"EURUSD",
  QORE_CT_SAMPLE_INSTRUMENT_ID:"EURUSD",
  QORE_CT_QA_HISTORY_PAGES:"2"};
 assert.equal(readDemoViewProbeConfig(full).auditCrtMssAll34,true);
 for(const patch of patches){
  const set={...full,...patch};
  if(patch.QORE_CT_QA_CRT_MSS_ALL34==="DISABLED"){
   assert.equal(readDemoViewProbeConfig(set).auditCrtMssAll34,false);
  }else assert.throws(()=>readDemoViewProbeConfig(set));
 }
 let calls=0;
 const denied=await runAuthorizedFull34M5Cohort({
  env:{...env,QORE_PUSH_ENABLED:"true"},
  probe:async()=>{calls++;return {}},throttleMs:0
 });
 assert.equal(calls,0);
 assert.equal(denied.state,"CTRADER_34_UNSAFE_CONFIG_BLOCKED");
});
