import test from "node:test";
import assert from "node:assert/strict";
import {decodeNative34Trendbars,compareNative34AgainstClosedM5}
 from "../src/qa-ctrader-ic34-native-timeframes.mjs";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "../src/ctrader-demo-wss-probe-qa.mjs";
import {OBSERVED_IC34_CANDIDATES,
 runAuthorizedFull34M5Cohort,COHORT34_OPT_IN}
 from "../src/qa-ctrader-full34-m5-cohort.mjs";
const M5=300000,START=Date.parse("2026-11-04T20:00:00.000Z"),NOW=START+70*3600000;
const symbolId=10014,instrumentId="NDX100";
const makeBars=(gapped=false)=>Array.from({length:600},(_,i)=>{
 const t=START+(i+(gapped&&i>=100?12:0))*M5;
 const o=10000+i/100;
 return {provider:"IC",instrumentId,symbolId,
  source:"CTRADER_OPEN_API_DEMO",certified:false,actionable:false,
  sendPush:false,openedAt:t,closedAt:t+M5,open:o,
  high:o+0.03,low:o-0.03,close:o+0.01};
});
function rawFrom(bars,period){
 const span=period===7?3:48;
 const out=[];
 const by=new Map(bars.map(x=>[x.openedAt,x]));
 for(let start=START;start+span*M5<=bars.at(-1).closedAt;start+=span*M5){
  const group=Array.from({length:span},(_,i)=>by.get(start+i*M5));
  if(group.some(x=>!x))continue;
  const low=Math.round(Math.min(...group.map(x=>x.low))*100000);
  const open=Math.round(group[0].open*100000);
  const high=Math.round(Math.max(...group.map(x=>x.high))*100000);
  const close=Math.round(group.at(-1).close*100000);
  out.push({utcTimestampInMinutes:start/60000,low,deltaOpen:open-low,
   deltaHigh:high-low,deltaClose:close-low});
 }
 return out;
}
test("native M15 and H4 strictly match independently reconstructed complete 600-M5 blocks",()=>{
 const m5=makeBars();
 for(const [period,expected] of [[7,200],[10,12]]){
  const bars=decodeNative34Trendbars({
   raw:rawFrom(m5,period),period,symbolId,nowMs:NOW,maxBars:250
  });
  const out=compareNative34AgainstClosedM5({
   m5Bars:m5,nativeBars:bars,period,instrumentId,symbolId
  });
  assert.equal(out.nativeBarsFetched,expected);
  assert.equal(out.eligibleNativeAnchoredM5Blocks,expected);
  assert.equal(out.matchedUtcAndCompleteM5Blocks,expected);
  assert.equal(out.mismatchBars,0);
  assert.equal(out.maxDifferenceTicks,0);
  assert.equal(out.state,"NATIVE_DERIVED_MATCHED_ELIGIBLE_BLOCKS_QA");
  assert.equal(out.sourceParityCertified,false);
  assert.equal(out.mssM5Certified,false);
  assert.equal(out.mssM15Certified,false);
  assert.equal(out.crtFamiliesCertified,false);
  assert.equal(out.canTrade,false);
  assert.equal(out.sendPush,false);
 }
});
test("missing M5 during a session cannot create a synthetic completed M15 or H4",()=>{
 const m5=makeBars(true);
 const n15=decodeNative34Trendbars({
  raw:rawFrom(makeBars(),7),period:7,symbolId,nowMs:NOW,maxBars:250
 });
 const a=compareNative34AgainstClosedM5({
  m5Bars:m5,nativeBars:n15,period:7,instrumentId,symbolId
 });
 assert.ok(a.skippedNativeBlocks>=4);
 assert.ok(a.matchedUtcAndCompleteM5Blocks<200);
 // After a 12-bar time shift the synthetic prices no longer correspond
 // to the same real timestamps, so mismatches MUST be reported too.
 assert.ok(a.mismatchBars>0);
 assert.equal(a.nativeDerivedFullCoverageCertified,false);
 const n4=decodeNative34Trendbars({
  raw:rawFrom(makeBars(),10),period:10,symbolId,nowMs:NOW,maxBars:100
 });
 const b=compareNative34AgainstClosedM5({
  m5Bars:m5,nativeBars:n4,period:10,instrumentId,symbolId
 });
 assert.ok(b.skippedNativeBlocks>=1);
 assert.equal(b.nativeDerivedFullCoverageCertified,false);
});
test("one changed tick in native close is reported, not ignored",()=>{
 const m5=makeBars();
 const raw=rawFrom(m5,7);raw[25].deltaClose+=1;
 const native=decodeNative34Trendbars({
  raw,period:7,symbolId,nowMs:NOW,maxBars:250
 });
 const r=compareNative34AgainstClosedM5({
  m5Bars:m5,nativeBars:native,period:7,instrumentId,symbolId
 });
 assert.equal(r.mismatchBars,1);
 assert.equal(r.mismatchByField.close,1);
 assert.equal(r.maxDifferenceTicks,1);
 assert.equal(r.state,"NATIVE_DERIVED_OHLC_DIFFERENCE_QA");
 assert.equal(r.sendPush,false);
});
test("native H4 can have non-zero UTC phase, never shift it into an artificial clock",()=>{
 const m5=makeBars(),raw=rawFrom(m5,10).map(x=>({
  ...x,utcTimestampInMinutes:x.utcTimestampInMinutes+120
 }));
 const native=decodeNative34Trendbars({
  raw,period:10,symbolId,nowMs:NOW,maxBars:100
 });
 const r=compareNative34AgainstClosedM5({
  m5Bars:m5,nativeBars:native,period:10,instrumentId,symbolId
 });
 assert.deepEqual(r.nativeUtcH4PhasesMinutes,[120]);
 assert.ok(r.matchedUtcAndCompleteM5Blocks<=12);
 assert.equal(r.tradingViewParityCertified,false);
});
test("native OHLC parser blocks duplicate, malformed, open, wrong timeframe and misphased bars",()=>{
 const base=rawFrom(makeBars(),7);
 const bad=[
  [{...base[0],period:10},...base.slice(1)],
  [{...base[0],deltaHigh:-1},...base.slice(1)],
  [{...base[0],utcTimestampInMinutes:base[0].utcTimestampInMinutes+1},...base.slice(1)],
  [base[0],base[0],...base.slice(2)],
  [{...base[0],low:0},...base.slice(1)],
  [{...base[0],utcTimestampInMinutes:NOW/60000},...base.slice(1)]
 ];
 for(const raw of bad)
  assert.throws(()=>decodeNative34Trendbars({
    raw,period:7,symbolId,nowMs:NOW,maxBars:250
  }),/CTRADER_34_NATIVE/);
});
const env={
 QORE_CT_QA_COHORT34:COHORT34_OPT_IN,
 QORE_CT_QA_COHORT34_PAGES:"2",
 QORE_CT_QA_NATIVE_ALL34_TF:"OWNER_APPROVED_34_NATIVE_M15_H4_QA",
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",QORE_PROVIDER:"IC",
 QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_ACCOUNT_DISCOVERY:"DISABLED",
 QORE_CT_QA_HISTORY_PAGES:"1",QORE_CT_QA_M5_CSV_EXPORT:"DISABLED",
 QORE_CT_QA_NATIVE_M15_COMPARE:"DISABLED",
 QORE_CT_QA_NATIVE_H4_AUDIT:"DISABLED",
 QORE_CT_CLIENT_ID:"fake_client",QORE_CT_CLIENT_SECRET:"never_log_this_secret",
 QORE_CT_VIEW_ACCESS_TOKEN:"never_log_this_token",
 QORE_CT_DEMO_ACCOUNT_ID:"123456789"
};
test("all 34 native M15/H4 attempts require true opt-in and exact manifest",async()=>{
 const inv=OBSERVED_IC34_CANDIDATES.map(x=>({
  symbolId:x.nativeId,symbolName:x.nativeName,enabled:true
 }));
 const calls=[];
 const result=await runAuthorizedFull34M5Cohort({
  env,throttleMs:0,probe:async ({config})=>{
   if(!config.sampleSymbolId){
    calls.push("inventory");
    assert.equal(config.historyPages,1);
    return {state:"INVENTORY_QA_ONLY",symbols:inv};
   }
   calls.push(config.sampleInstrumentId);
   assert.equal(config.historyPages,2);
   assert.equal(config.compareNativeAll34,true);
   return {state:"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED",
    symbolName:config.sampleSymbolName,barCount:600,pagesFetched:2,
    gaps:0,missingM5Intervals:0,gapIntervals:[],
    gapIntervalsTruncated:false,nativePhaseMin:0,
    native34M15Summary:{nativeBarsFetched:200,
      matchedUtcAndCompleteM5Blocks:200,mismatchBars:0},
    native34H4Summary:{nativeBarsFetched:12,
      matchedUtcAndCompleteM5Blocks:12,mismatchBars:0}};
  }
 });
 assert.equal(calls.length,35);
 assert.equal(result.attempted,34);
 assert.equal(result.nativeM15MarketsRead,34);
 assert.equal(result.nativeH4MarketsRead,34);
 assert.equal(result.all34NativeFramesRead,true);
 assert.equal(result.totalNativeM15Bars,6800);
 assert.equal(result.totalNativeH4Bars,408);
 assert.equal(result.totalM15ComparedBlocks,6800);
 assert.equal(result.totalH4ComparedBlocks,408);
 assert.equal(result.state,"CTRADER_34_NATIVE_M15_H4_SAMPLES_OBSERVED_UNCERTIFIED");
 assert.equal(result.all34SessionCalendarsCertified,false);
 assert.equal(result.crtFamiliesCertified,false);
 assert.equal(result.sourceParityCertified,false);
 assert.equal(result.canTrade,false);
 assert.equal(result.sendPush,false);
 assert.ok(!JSON.stringify(result).includes("never_log_this_token"));
});
test("native scope cannot be enabled without 2 pages or with trading/live/push",()=>{
 const full={...env,QORE_CT_QA_HISTORY_PAGES:"2",
 QORE_CT_SAMPLE_SYMBOL_ID:"10014",QORE_CT_SAMPLE_SYMBOL_NAME:"USTEC",
 QORE_CT_SAMPLE_INSTRUMENT_ID:"NDX100"};
 assert.equal(readDemoViewProbeConfig(full).compareNativeAll34,true);
 for(const patch of [
  {QORE_CT_QA_COHORT34_PAGES:"1"},
  {QORE_CT_QA_NATIVE_ALL34_TF:"WRONG"},
  {QORE_CT_QA_HISTORY_PAGES:"1"},
  {QORE_CT_STAGE:"LIVE"},{QORE_CT_OAUTH_SCOPE:"trading"},
  {QORE_TRADING_ENABLED:"true"},{QORE_PUSH_ENABLED:"true"},
  {QORE_CT_QA_M5_CSV_EXPORT:"OWNER_APPROVED_PRIVATE_QA_CSV_ONLY"}
 ])assert.throws(()=>readDemoViewProbeConfig({...full,...patch}));
});

class Native34WssFake{
 static requests=[];
 static oneTickMismatch=false;
 constructor(url){
  assert.equal(url,"wss://demo.ctraderapi.com:5036");
  this.handlers=new Map();this.page=0;
  queueMicrotask(()=>this.handlers.get("open")?.());
 }
 addEventListener(key,cb){this.handlers.set(key,cb);}
 close(){this.closed=true;}
 send(payload){
  const req=JSON.parse(payload);
  if(req.payloadType===51)return;
  Native34WssFake.requests.push({type:req.payloadType,period:req.payload?.period});
  let reply;
  if(req.payloadType===2100)reply=undefined;
  else if(req.payloadType===2149)reply={
   permissionScope:0,
   ctidTraderAccount:[{ctidTraderAccountId:"123456789",
    brokerTitleShort:"Raw Trading Ltd",isLive:false}]};
  else if(req.payloadType===2102)
   reply={ctidTraderAccountId:"123456789"};
  else if(req.payloadType===2114)
   reply={ctidTraderAccountId:"123456789",
    symbol:[{symbolId:10014,symbolName:"USTEC",enabled:true}]};
  else if(req.payloadType===2116)
   reply={ctidTraderAccountId:"123456789",
    symbol:[{symbolId:10014,digits:2}]};
  else if(req.payloadType===2137){
   const p=req.payload;
   assert.equal(p.symbolId,10014);
   assert.equal(p.ctidTraderAccountId,123456789);
   if(p.period===5){
    this.page++;
    assert.ok(this.page<=2);
    assert.equal(p.count,300);
    const slice=makeBars().slice(this.page===1?300:0,
      this.page===1?600:300);
    reply={ctidTraderAccountId:"123456789",symbolId:10014,period:5,
      trendbar:slice.reverse().map(b=>{
       const low=Math.round(b.low*1e5);
       return {utcTimestampInMinutes:b.openedAt/60000,
        low,deltaOpen:Math.round(b.open*1e5)-low,
        deltaHigh:Math.round(b.high*1e5)-low,
        deltaClose:Math.round(b.close*1e5)-low};
      })};
   }else{
    assert.ok([7,10].includes(p.period));
    const sample=rawFrom(makeBars(),p.period);
    if(p.period===7&&Native34WssFake.oneTickMismatch)
      sample[10].deltaClose+=1;
    reply={ctidTraderAccountId:"123456789",symbolId:10014,
      period:p.period,trendbar:sample.reverse()};
   }
  }else throw Error("fake: unapproved request");
  queueMicrotask(()=>this.handlers.get("message")?.({
   data:JSON.stringify({clientMsgId:req.clientMsgId,
    payloadType:req.payloadType+1,
    ...(reply===undefined?{}:{payload:reply})})
  }));
 }
}
test("actual WSS VIEW state machine makes 2 M5 + 1 M15 + 1 H4, no trading/push",async()=>{
 Native34WssFake.requests=[];Native34WssFake.oneTickMismatch=false;
 const config=readDemoViewProbeConfig({
  ...env,QORE_CT_QA_HISTORY_PAGES:"2",
  QORE_CT_SAMPLE_SYMBOL_ID:"10014",
  QORE_CT_SAMPLE_SYMBOL_NAME:"USTEC",
  QORE_CT_SAMPLE_INSTRUMENT_ID:"NDX100"
 });
 const out=await runAuthorizedDemoWssProbe({
  config,WebSocketImpl:Native34WssFake,
  now:()=>NOW,timeoutMs:3000
 });
 assert.equal(out.state,"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED");
 assert.equal(out.barCount,600);
 assert.equal(out.pagesFetched,2);
 assert.equal(out.native34M15Summary.matchedUtcAndCompleteM5Blocks,200);
 assert.equal(out.native34M15Summary.mismatchBars,0);
 assert.equal(out.native34H4Summary.matchedUtcAndCompleteM5Blocks,12);
 assert.equal(out.native34H4Summary.mismatchBars,0);
 assert.deepEqual(
  Native34WssFake.requests.filter(x=>x.type===2137).map(x=>x.period),
  [5,5,7,10]);
 assert.equal(out.sourceParityCertified,false);
 assert.equal(out.sendPush,false);
 assert.equal(out.canTrade,false);
 assert.ok(!JSON.stringify(out).includes("never_log_this_token"));
});
test("native M15 mismatch is recorded and does not authorize a signal",async()=>{
 Native34WssFake.requests=[];Native34WssFake.oneTickMismatch=true;
 try{
  const config=readDemoViewProbeConfig({
   ...env,QORE_CT_QA_HISTORY_PAGES:"2",
   QORE_CT_SAMPLE_SYMBOL_ID:"10014",QORE_CT_SAMPLE_SYMBOL_NAME:"USTEC",
   QORE_CT_SAMPLE_INSTRUMENT_ID:"NDX100"
  });
  const r=await runAuthorizedDemoWssProbe({
   config,WebSocketImpl:Native34WssFake,
   now:()=>NOW,timeoutMs:3000
  });
  assert.equal(r.state,"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED");
  assert.equal(r.native34M15Summary.mismatchBars,1);
  assert.equal(r.sourceParityCertified,false);
  assert.equal(r.sendPush,false);
 }finally{Native34WssFake.oneTickMismatch=false;}
});
