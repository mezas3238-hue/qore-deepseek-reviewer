import test from "node:test";
import assert from "node:assert/strict";
import {decodeClosedNativeEurusdM15,compareNativeDerivedEurusdM15}
 from "../src/qa-ctrader-native-m15-compare.mjs";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "../src/ctrader-demo-wss-probe-qa.mjs";
import {performStagingProbe}
 from "../scripts/railway-ctrader-demo-entry.mjs";

const NOW=1_800_000_000_000,ACCOUNT=123456789,M5=300000,M15=900000;
const ENV={
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",QORE_PROVIDER:"IC",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_CLIENT_ID:"fake-client",QORE_CT_CLIENT_SECRET:"no-real-secret",
 QORE_CT_VIEW_ACCESS_TOKEN:"no-real-access-token",
 QORE_CT_DEMO_ACCOUNT_ID:String(ACCOUNT),
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_CT_SAMPLE_SYMBOL_ID:"1",QORE_CT_SAMPLE_SYMBOL_NAME:"EURUSD",
 QORE_CT_SAMPLE_INSTRUMENT_ID:"EURUSD",
 QORE_CT_QA_HISTORY_PAGES:"2",QORE_CT_QA_M5_CSV_EXPORT:"DISABLED",
 QORE_CT_QA_NATIVE_M15_COMPARE:"OWNER_APPROVED_NATIVE_M15_COMPARE"
};
function nativeRaw(){
 return Array.from({length:200},(_,i)=>({
  utcTimestampInMinutes:(NOW-(200-i)*M15)/60000,
  low:100000,deltaOpen:200,deltaHigh:350,deltaClose:290
 }));
}
class NativeWssFake {
 static requests=[];static mismatch=false;static wrongPeriod=false;
 static missing=false;static wrongAccount=false;static scope=0;
 constructor(url){assert.equal(url,"wss://demo.ctraderapi.com:5036");
  this.events=new Map();this.history=0;
  queueMicrotask(()=>this.events.get("open")?.());
 }
 addEventListener(type,cb){this.events.set(type,cb)}
 send(text){
  const req=JSON.parse(text);if(req.payloadType===51)return;
  NativeWssFake.requests.push({type:req.payloadType,period:req.payload?.period});
  let payload={};
  if(req.payloadType===2100)payload=undefined;
  else if(req.payloadType===2149)payload={
    permissionScope:NativeWssFake.scope,
    ctidTraderAccount:[{ctidTraderAccountId:String(ACCOUNT),
     brokerTitleShort:"Raw Trading Ltd",isLive:false}]
  };
  else if(req.payloadType===2102)payload={ctidTraderAccountId:String(ACCOUNT)};
  else if(req.payloadType===2114)payload={ctidTraderAccountId:String(ACCOUNT),
    symbol:[{symbolId:1,symbolName:"EURUSD",enabled:true}]};
  else if(req.payloadType===2116)payload={ctidTraderAccountId:String(ACCOUNT),
    symbol:[{symbolId:1,digits:5}]};
  else if(req.payloadType===2137){
   this.history++;
   const p=req.payload;
   assert.equal(p.ctidTraderAccountId,ACCOUNT);
   assert.equal(p.symbolId,1);
   if(this.history<=2){
    assert.equal(p.period,5);assert.equal(p.count,300);
    payload={ctidTraderAccountId:String(ACCOUNT),period:5,symbolId:1,
     trendbar:Array.from({length:300},(_,i)=>({
       utcTimestampInMinutes:(p.toTimestamp-i*M5)/60000,
       low:100000,deltaOpen:200,deltaHigh:350,deltaClose:290
     }))};
   }else{
    assert.equal(p.period,7);
    assert.equal(p.count,200);
    assert.equal(p.fromTimestamp,NOW-600*M5);
    assert.equal(p.toTimestamp,NOW-1);
    const bars=nativeRaw();
    if(NativeWssFake.mismatch)bars[50].deltaClose=291;
    if(NativeWssFake.missing)bars.pop();
    payload={
     ctidTraderAccountId:String(ACCOUNT+(NativeWssFake.wrongAccount?1:0)),
     period:NativeWssFake.wrongPeriod?5:7,symbolId:1,
     trendbar:bars.reverse()
    };
   }
  }else throw Error("Unsupported request");
  queueMicrotask(()=>this.events.get("message")?.({
   data:JSON.stringify({clientMsgId:req.clientMsgId,
    payloadType:req.payloadType+1,...(payload===undefined?{}:{payload})})
  }));
 }
 close(){this.closed=true}
}
function reset(){
 NativeWssFake.requests=[];NativeWssFake.mismatch=false;
 NativeWssFake.wrongPeriod=false;NativeWssFake.missing=false;
 NativeWssFake.wrongAccount=false;NativeWssFake.scope=0;
}
async function run(){
 const cfg=readDemoViewProbeConfig(ENV);
 return runAuthorizedDemoWssProbe({config:cfg,WebSocketImpl:NativeWssFake,
  now:()=>NOW,timeoutMs:3000});
}
test("native M15 period 7 matches exactly 200 derived 3xM5 with no MSS alias",async()=>{
 reset();const result=await run();
 assert.equal(result.state,"HISTORICAL_M5_M15_QA_UNCERTIFIED");
 assert.equal(result.barCount,600);
 assert.equal(result.pagesFetched,2);
 assert.equal(result.gaps,0);
 const native=result.nativeM15Summary;
 assert.equal(native.state,"CTRADER_M15_NATIVE_DERIVED_OHLC_MATCH_QA");
 assert.equal(native.sameTimestampBars,200);
 assert.equal(native.nativeBarsReceived,200);
 assert.equal(native.ohlcMismatchBars,0);
 assert.equal(native.nativeDerivedOhlcMatch,true);
 assert.equal(native.tradingViewParityCertified,false);
 assert.equal(native.mssM5Certified,false);
 assert.equal(native.mssM15Certified,false);
 assert.equal(native.canTrade,false);assert.equal(native.sendPush,false);
 assert.equal(result.m15Summary.completeM15,200);
 assert.equal(result.h4Summary.completeH4Blocks,12);
 assert.deepEqual(NativeWssFake.requests.map(x=>x.type),
   [2100,2149,2102,2114,2116,2137,2137,2137]);
 assert.deepEqual(NativeWssFake.requests.slice(-3).map(x=>x.period),[5,5,7]);
 assert.ok(!JSON.stringify(result).includes("no-real-secret"));
 assert.ok(!JSON.stringify(result).includes("no-real-access-token"));
});
test("same time but one native price differs is not certified",async()=>{
 reset();NativeWssFake.mismatch=true;
 try{
 const r=await run();assert.equal(r.state,"HISTORICAL_M5_M15_QA_UNCERTIFIED");
 assert.equal(r.nativeM15Summary.state,"CTRADER_M15_NATIVE_DERIVED_OHLC_DIFFERENCE_QA");
 assert.equal(r.nativeM15Summary.ohlcMismatchBars,1);
 assert.equal(r.nativeM15Summary.ohlcMismatchByField.close,1);
 assert.equal(r.nativeM15Summary.maxDifferenceTicks,1);
 assert.equal(r.nativeM15Summary.nativeDerivedOhlcMatch,false);
 assert.equal(r.sendPush,false);
 }finally{reset();}
});
test("one missing native M15 bar blocks complete OHLC match",async()=>{
 reset();NativeWssFake.missing=true;
 try{const r=await run();
  assert.equal(r.nativeM15Summary.state,"CTRADER_M15_NATIVE_COHORT_INCOMPLETE_QA");
  assert.equal(r.nativeM15Summary.nativeBarsReceived,199);
  assert.equal(r.nativeM15Summary.unpairedDerived,1);
  assert.equal(r.nativeM15Summary.nativeDerivedOhlcMatch,false);
 }finally{reset();}
});
test("wrong native timeframe and account fail closed",async()=>{
 for(const errorCase of ["wrongPeriod","wrongAccount"]){
  reset();NativeWssFake[errorCase]=true;
  const r=await run();
  assert.equal(r.state,"CTRADER_NATIVE_M15_RESPONSE_SCOPE_INVALID");
  assert.equal(r.sendPush,false);
  assert.equal(r.canTrade,false);
 }
 reset();
});
test("no SCOPE_VIEW means no native trendbar or market data requests",async()=>{
 reset();NativeWssFake.scope=1;
 try{const r=await run();
  assert.equal(r.state,"CTRADER_SCOPE_VIEW_NOT_PROVEN");
  assert.deepEqual(NativeWssFake.requests.map(x=>x.type),[2100,2149]);
 }finally{reset();}
});
test("native M15 opt-in refuses LIVE, other symbol, other broker, CSV export",()=>{
 for(const delta of [
  {QORE_CT_STAGE:"LIVE"},{QORE_CT_OAUTH_SCOPE:"trading"},
  {QORE_CT_SAMPLE_SYMBOL_ID:"2"},
  {QORE_CT_SAMPLE_SYMBOL_NAME:"GBPUSD"},
  {QORE_CT_EXPECTED_BROKER_TITLE:"Other"},
  {QORE_CT_QA_HISTORY_PAGES:"1"},
  {QORE_CT_QA_HISTORY_PAGES:"3"},
  {QORE_CT_QA_M5_CSV_EXPORT:"OWNER_APPROVED_PRIVATE_QA_CSV_ONLY"},
  {QORE_CT_QA_NATIVE_M15_COMPARE:"UNKNOWN"}
 ]) assert.throws(()=>readDemoViewProbeConfig({...ENV,...delta}));
});
test("native decoder rejects future/open, duplicates, malformed period and prices",()=>{
 const raw=nativeRaw();
 assert.equal(decodeClosedNativeEurusdM15({raw,nowMs:NOW}).length,200);
 const variants=[
  [{...raw[0],period:5},...raw.slice(1)],
  [{...raw[0],utcTimestampInMinutes:(NOW/60000)},...raw.slice(1)],
  [{...raw[0],deltaOpen:900},...raw.slice(1)],
  [{...raw[0],utcTimestampInMinutes:raw[0].utcTimestampInMinutes+1},...raw.slice(1)],
  [...raw.slice(0,1),raw[0],...raw.slice(2)]
 ];
 for(const arr of variants)
  assert.throws(()=>decodeClosedNativeEurusdM15({raw:arr,nowMs:NOW}),/CTRADER_NATIVE_M15_QA/);
});
test("Railway result remains OHLC-free and FCM-free with native QA counters",async()=>{
 reset();
 const result=await performStagingProbe({env:ENV,probe:async({config})=>{
  assert.equal(config.compareNativeM15,true);
  return {state:"HISTORICAL_M5_M15_QA_UNCERTIFIED",
   barCount:600,pagesFetched:2,gaps:0,nativePhaseMin:0,
   nativeM15Summary:{state:"CTRADER_M15_NATIVE_DERIVED_OHLC_MATCH_QA",
    nativeM15Compared:true,sameTimestampBars:200,ohlcMismatchBars:0,
    nativeDerivedOhlcMatch:true,sourceParityCertified:false,
    canTrade:false,sendPush:false},
   bars:[{open:9.999,close:8.999}]};
 }});
 assert.equal(result.m5ClosedBars,600);
 assert.equal(result.nativeM15QaSummary.sameTimestampBars,200);
 assert.equal(result.sourceParityCertified,false);
 assert.equal(result.canTrade,false);
 assert.equal(result.sendPush,false);
 assert.ok(!JSON.stringify(result).includes("9.999"));
});
