import test from "node:test";
import assert from "node:assert/strict";
import {
 IC34_H4_SEASON_WINDOWS,INDICES_FOR_SEASONAL_H4,
 seasonH4HistoryRequest,summarizeVerifiedIndexH4Season,
 evaluateIndexH4SeasonalEvidence
} from "../src/qa-ctrader-index-h4-seasonal-2026.mjs";
import {readDemoViewProbeConfig}
 from "../src/ctrader-demo-wss-probe-qa.mjs";
import {
 runAuthorizedFull34M5Cohort,OBSERVED_IC34_CANDIDATES,COHORT34_OPT_IN
} from "../src/qa-ctrader-full34-m5-cohort.mjs";
const NOW=Date.parse("2026-11-08T04:00:00Z"),M5=300000,H4=14400000;
function rawH4(index,phase=120,count=5){
 const w=IC34_H4_SEASON_WINDOWS[index];
 const first=w.fromMs+phase*60000;
 return Array.from({length:count},(_,i)=>({
  utcTimestampInMinutes:(first+i*H4)/60000,
  low:100000,deltaOpen:100,deltaHigh:400,deltaClose:200
 }));
}
function witness(instrumentId,symbolId,phases=[120,60,60,60,120]){
 const windows=IC34_H4_SEASON_WINDOWS.map((_,i)=>
   summarizeVerifiedIndexH4Season({
    instrumentId,symbolId,index:i,nowMs:NOW,
    trendbars:rawH4(i,phases[i])
   }));
 return evaluateIndexH4SeasonalEvidence({
  instrumentId,symbolId,windows
 });
}
test("exactly 5 fixed historical windows, all already CLOSED, bounded and read-only",()=>{
 assert.equal(IC34_H4_SEASON_WINDOWS.length,5);
 for(const [id,ref] of Object.entries(INDICES_FOR_SEASONAL_H4)){
  const names=new Set();
  for(let i=0;i<5;i++){
   const x=seasonH4HistoryRequest({
    instrumentId:id,symbolId:ref.id,index:i,nowMs:NOW
   });
   assert.equal(x.period,10);
   assert.equal(x.count,48);
   assert.equal(x.fromTimestamp,IC34_H4_SEASON_WINDOWS[i].fromMs);
   assert.equal(x.toTimestamp,IC34_H4_SEASON_WINDOWS[i].toMs-1);
   assert.ok(x.toTimestamp<NOW);
   names.add(IC34_H4_SEASON_WINDOWS[i].id);
  }
  assert.equal(names.size,5);
 }
 for(const [id,symbolId] of [["EURUSD",1],["BTCUSD",10026],
  ["NDX100",1],["SPX500",10014]]){
  assert.throws(()=>seasonH4HistoryRequest({
   instrumentId:id,symbolId,index:0,nowMs:NOW
  }),/CRT34_SEASON_SCOPE_OR_INDEX_INVALID/);
 }
 assert.throws(()=>seasonH4HistoryRequest({
  instrumentId:"US30",symbolId:10015,index:5,nowMs:NOW
 }),/CRT34_SEASON_SCOPE_OR_INDEX_INVALID/);
});
test("winter and summer native phase are observed distinctly, never assumed or certified",()=>{
 for(const [id,ref] of Object.entries(INDICES_FOR_SEASONAL_H4)){
  const r=witness(id,ref.id);
  assert.equal(r.state,"HISTORICAL_NATIVE_INDEX_H4_PHASES_OBSERVED_QA");
  assert.equal(r.observedWindows,5);
  assert.equal(r.nativeH4Bars,25);
  assert.deepEqual(r.winterH4PhaseMinutes,[120]);
  assert.deepEqual(r.summerH4PhaseMinutes,[60]);
  assert.equal(r.nativeH4PhaseDiffersByNYSeason,true);
  assert.equal(r.clockCertified,false);
  assert.equal(r.sourceParityCertified,false);
  assert.equal(r.mssM5Certified,false);
  assert.equal(r.mssM15Certified,false);
  assert.equal(r.canTrade,false);
  assert.equal(r.sendPush,false);
 }
});
test("missing winter bars, mixed intrawindow phases and out-of-window H4 fail closed",()=>{
 const id="NDX100",symbolId=10014;
 const empty=IC34_H4_SEASON_WINDOWS.map((_,i)=>
  summarizeVerifiedIndexH4Season({
   instrumentId:id,symbolId,index:i,nowMs:NOW,
   trendbars:i===2?[]:rawH4(i)
  }));
 assert.throws(()=>evaluateIndexH4SeasonalEvidence({
  instrumentId:id,symbolId,windows:empty
 }),/CRT34_SEASON_MISSING_OR_MIXED_PHASE/);
 const mixed=IC34_H4_SEASON_WINDOWS.map((_,i)=>
  summarizeVerifiedIndexH4Season({
   instrumentId:id,symbolId,index:i,nowMs:NOW,
   trendbars:i===1?[...rawH4(i,120,2),...rawH4(i,60,2)]:rawH4(i)
  }));
 assert.throws(()=>evaluateIndexH4SeasonalEvidence({
  instrumentId:id,symbolId,windows:mixed
 }),/CRT34_SEASON_MISSING_OR_MIXED_PHASE/);
 const outside=rawH4(1);outside[0]={...outside[0],
   utcTimestampInMinutes:(IC34_H4_SEASON_WINDOWS[1].toMs+H4)/60000};
 assert.throws(()=>summarizeVerifiedIndexH4Season({
  instrumentId:id,symbolId,index:1,nowMs:NOW,trendbars:outside
 }),/CRT34_SEASON_H4_OUTSIDE_REQUESTED_WINDOW/);
});
const env={
 QORE_CT_QA_COHORT34:COHORT34_OPT_IN,
 QORE_CT_QA_COHORT34_PAGES:"2",
 QORE_CT_QA_NATIVE_ALL34_TF:"OWNER_APPROVED_34_NATIVE_M15_H4_QA",
 QORE_CT_QA_CRT_MSS_ALL34:"OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA",
 QORE_CT_QA_INDEX_H4_SEASONS_2026:"OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA",
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
 QORE_PROVIDER:"IC",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_ACCOUNT_DISCOVERY:"DISABLED",
 QORE_CT_QA_HISTORY_PAGES:"1",QORE_CT_QA_M5_CSV_EXPORT:"DISABLED",
 QORE_CT_QA_NATIVE_M15_COMPARE:"DISABLED",
 QORE_CT_QA_NATIVE_H4_AUDIT:"DISABLED",
 QORE_CT_CLIENT_ID:"fake-client",QORE_CT_CLIENT_SECRET:"secret-not-for-logs",
 QORE_CT_VIEW_ACCESS_TOKEN:"token-not-for-logs",
 QORE_CT_DEMO_ACCOUNT_ID:"123456789"
};
test("all 34 remain mandatory; only the three native indices request five seasonal H4 windows",async()=>{
 const seen=[];const inventory=OBSERVED_IC34_CANDIDATES.map(x=>({
  symbolId:x.nativeId,symbolName:x.nativeName,enabled:true
 }));
 const r=await runAuthorizedFull34M5Cohort({
  env,throttleMs:0,probe:async({config})=>{
   if(config.sampleSymbolId===undefined){
    assert.equal(config.compareSeasonalIndexH4,false);
    return {state:"INVENTORY_QA_ONLY",symbols:inventory};
   }
   const ref=OBSERVED_IC34_CANDIDATES.find(x=>
     x.instrumentId===config.sampleInstrumentId);
   const index=["NDX100","SPX500","US30"].includes(ref.instrumentId);
   assert.equal(config.compareSeasonalIndexH4,index);
   seen.push(ref.instrumentId);
   const q=index?witness(ref.instrumentId,ref.nativeId):undefined;
   return {
    state:"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED",
    symbolName:ref.nativeName,barCount:600,pagesFetched:2,
    gaps:0,missingM5Intervals:0,gapIntervals:[],
    gapIntervalsTruncated:false,nativePhaseMin:0,
    native34M15Summary:{nativeBarsFetched:250,
      matchedUtcAndCompleteM5Blocks:197,mismatchBars:0},
    native34H4Summary:{nativeBarsFetched:30,
      matchedUtcAndCompleteM5Blocks:10,mismatchBars:0},
    crtMss34Replay:{
      state:index?"NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA":
       "CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED",
      cyclesEvaluated:index?0:4
    },
    ...(q?{nativeSeasonalH4Summary:q}:{})
   };
  }
 });
 assert.equal(seen.length,34);
 assert.equal(new Set(seen).size,34);
 assert.equal(r.state,"CTRADER_34_WITH_3_INDEX_H4_SEASONS_OBSERVED_UNCERTIFIED");
 assert.equal(r.nativeM15MarketsRead,34);
 assert.equal(r.nativeH4MarketsRead,34);
 assert.equal(r.indexH4SeasonalMarketsRead,3);
 assert.equal(r.indexH4SeasonalWindowsRead,15);
 assert.equal(r.indexH4SeasonalNativeBars,75);
 assert.equal(r.allThreeIndexSeasonsObserved,true);
 assert.equal(r.clockMismatchMarketCount,3);
 assert.deepEqual(r.clockMismatchMarkets,["NDX100","SPX500","US30"]);
 assert.equal(r.crossSeasonClockCertified,false);
 assert.equal(r.all34CrtMssSignalsCertified,false);
 assert.equal(r.canTrade,false);assert.equal(r.sendPush,false);
 assert.ok(!JSON.stringify(r).includes("token-not-for-logs"));
});
test("seasonal index analysis is blocked on LIVE, trading, push, or missing base native cohort",()=>{
 const ref={
  ...env,QORE_CT_QA_HISTORY_PAGES:"2",QORE_CT_SAMPLE_SYMBOL_ID:"10014",
  QORE_CT_SAMPLE_SYMBOL_NAME:"USTEC",QORE_CT_SAMPLE_INSTRUMENT_ID:"NDX100"
 };
 assert.equal(readDemoViewProbeConfig(ref).compareSeasonalIndexH4,true);
 for(const changed of [
  {QORE_CT_STAGE:"LIVE"},{QORE_CT_OAUTH_SCOPE:"trading"},
  {QORE_TRADING_ENABLED:"true"},{QORE_PUSH_ENABLED:"true"},
  {QORE_CT_QA_NATIVE_ALL34_TF:"DISABLED"},
  {QORE_CT_QA_COHORT34_PAGES:"1"},
  {QORE_CT_QA_INDEX_H4_SEASONS_2026:"wrong"}
 ])assert.throws(()=>readDemoViewProbeConfig({...ref,...changed}));
});
