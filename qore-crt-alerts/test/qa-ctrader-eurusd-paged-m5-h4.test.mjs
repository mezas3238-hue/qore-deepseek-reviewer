import test from "node:test";
import assert from "node:assert/strict";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
  from "../src/ctrader-demo-wss-probe-qa.mjs";
import {performStagingProbe}
  from "../scripts/railway-ctrader-demo-entry.mjs";
const NOW=1_800_000_000_000,M5=300_000,ACCOUNT=123456789;
const env={
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",QORE_PROVIDER:"IC",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_CLIENT_ID:"fake_client_id",QORE_CT_CLIENT_SECRET:"fake_secret_only",
 QORE_CT_VIEW_ACCESS_TOKEN:"fake_accounts_scope_view",
 QORE_CT_DEMO_ACCOUNT_ID:String(ACCOUNT),
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_CT_SAMPLE_SYMBOL_ID:"1",QORE_CT_SAMPLE_SYMBOL_NAME:"EURUSD",
 QORE_CT_SAMPLE_INSTRUMENT_ID:"EURUSD",QORE_CT_QA_HISTORY_PAGES:"2"
};
class TestWss {
 static sent=[];
 static duplicatePage=false;
 static useTradingScope=false;
 constructor(url){
  assert.equal(url,"wss://demo.ctraderapi.com:5036");
  this.events=new Map();this.historyCalls=0;
  queueMicrotask(()=>this.events.get("open")?.());
 }
 addEventListener(type,callback){this.events.set(type,callback);}
 send(raw){
  const msg=JSON.parse(raw);
  if(msg.payloadType===51)return;
  TestWss.sent.push(msg.payloadType);
  const p=msg.payload;
  let payload={};
  if(msg.payloadType===2100)payload=undefined; // no payload, allowed at APP only
  else if(msg.payloadType===2149)payload={permissionScope:TestWss.useTradingScope?1:0,
   ctidTraderAccount:[{ctidTraderAccountId:String(ACCOUNT),isLive:false,
     brokerTitleShort:"Raw Trading Ltd"}]};
  else if(msg.payloadType===2102)payload={ctidTraderAccountId:String(ACCOUNT)};
  else if(msg.payloadType===2114)payload={
    ctidTraderAccountId:String(ACCOUNT),
    symbol:[{symbolId:1,symbolName:"EURUSD",enabled:true}]
  };
  else if(msg.payloadType===2116)payload={
    ctidTraderAccountId:String(ACCOUNT),symbol:[{symbolId:1,digits:5}]
  };
  else if(msg.payloadType===2137){
    this.historyCalls++;
    assert.equal(p.count,300);
    assert.equal(p.period,5);
    assert.equal(p.symbolId,1);
    const last=TestWss.duplicatePage&&this.historyCalls===2?
      NOW-M5:p.toTimestamp;
    const trendbar=Array.from({length:300},(_,i)=>({
      utcTimestampInMinutes:(last-i*M5)/60000,
      low:100000,deltaHigh:350,deltaOpen:200,deltaClose:290
    })); // newest first; the state machine must sort
    payload={ctidTraderAccountId:String(ACCOUNT),
      symbolId:1,period:5,trendbar};
  }else throw Error("No unsupported API message permitted");
  queueMicrotask(()=>this.events.get("message")?.({
    data:JSON.stringify({clientMsgId:msg.clientMsgId,
      payloadType:msg.payloadType+1,...(payload===undefined?{}:{payload})})
  }));
 }
 close(){this.closed=true;}
}
test("two bounded EURUSD pages deliver 600 strictly closed M5 and NY-anchored H4 QA, never alerts",async()=>{
 TestWss.sent=[];TestWss.duplicatePage=false;TestWss.useTradingScope=false;
 const config=readDemoViewProbeConfig(env);
 assert.equal(config.historyPages,2);
 const result=await runAuthorizedDemoWssProbe({
   config,WebSocketImpl:TestWss,timeoutMs:3000,now:()=>NOW
 });
 assert.equal(result.state,"HISTORICAL_M5_QA_UNCERTIFIED");
 assert.equal(result.barCount,600);
 assert.equal(result.pagesFetched,2);
 assert.equal(result.gaps,0);
 assert.equal(result.nativePhaseMin,0);
 assert.equal(result.h4Summary.anchor,"America/New_York Forex 01/05/09");
 assert.ok(result.h4Summary.completeH4Blocks>=10);
 assert.equal(result.h4Summary.sourceParityCertified,false);
 assert.equal(result.h4Summary.crtFamiliesCertified,false);
 assert.equal(result.h4Summary.mssCertified,false);
 assert.equal(result.canTrade,false);
 assert.equal(result.sendPush,false);
 assert.equal(result.sourceParityCertified,false);
 assert.deepEqual(TestWss.sent,[2100,2149,2102,2114,2116,2137,2137]);
 assert.ok(!JSON.stringify(result).includes("fake_secret_only"));
 assert.ok(!JSON.stringify(result).includes("fake_accounts_scope_view"));
});
test("cross-page duplicate/overlap is quarantined, no retries",async()=>{
 TestWss.sent=[];TestWss.duplicatePage=true;
 try{
 const result=await runAuthorizedDemoWssProbe({
   config:readDemoViewProbeConfig(env),WebSocketImpl:TestWss,
   timeoutMs:3000,now:()=>NOW
 });
 assert.equal(result.reason,"CTRADER_HISTORY_PAGE_OVERLAP_OR_ORDER");
 assert.equal(result.sendPush,false);
 assert.equal(result.canTrade,false);
 assert.deepEqual(TestWss.sent,[2100,2149,2102,2114,2116,2137,2137]);
 }finally{TestWss.duplicatePage=false;}
});
test("SCOPE_TRADING blocks all symbol/history reads",async()=>{
 TestWss.sent=[];TestWss.useTradingScope=true;
 try{
 const result=await runAuthorizedDemoWssProbe({
   config:readDemoViewProbeConfig(env),WebSocketImpl:TestWss,
   timeoutMs:3000,now:()=>NOW
 });
 assert.equal(result.reason,"CTRADER_SCOPE_VIEW_NOT_PROVEN");
 assert.deepEqual(TestWss.sent,[2100,2149]);
 }finally{TestWss.useTradingScope=false;}
});
test("multi-page QA requires exactly named EURUSD and 2-3 pages, other modes rejected",()=>{
 assert.throws(()=>readDemoViewProbeConfig({...env,
   QORE_CT_QA_HISTORY_PAGES:"9"}),/HISTORY_PAGES_NOT_AUTHORIZED/);
 assert.throws(()=>readDemoViewProbeConfig({...env,
   QORE_CT_SAMPLE_SYMBOL_NAME:"GBPUSD"}),/HISTORY_PAGES_NOT_AUTHORIZED/);
 assert.throws(()=>readDemoViewProbeConfig({...env,
   QORE_CT_SAMPLE_SYMBOL_ID:""}),/MAPPING_INCOMPLETE/);
 assert.throws(()=>readDemoViewProbeConfig({...env,
   QORE_CT_STAGE:"LIVE"}),/NOT_EXPLICITLY_ENABLED/);
 assert.throws(()=>readDemoViewProbeConfig({...env,
   QORE_CT_OAUTH_SCOPE:"trading"}),/NOT_EXPLICITLY_ENABLED/);
});
test("STAGING CLI only emits sanitized QA H4 counters, never raw OHLC or credentials",async()=>{
 const result=await performStagingProbe({
  env,probe:async({config,timeoutMs,includeCandidateManifest})=>{
   assert.equal(config.historyPages,2);
   assert.equal(timeoutMs,35000);
   assert.equal(includeCandidateManifest,false);
   return {state:"HISTORICAL_M5_QA_UNCERTIFIED",barCount:600,
      pagesFetched:2,gaps:0,nativePhaseMin:0,
      h4Summary:{anchor:"America/New_York Forex 01/05/09",
        completeH4Blocks:11,partialH4Blocks:2,rejectedH4Blocks:0,
        sourceParityCertified:false,crtFamiliesCertified:false,
        mssCertified:false,canTrade:false,sendPush:false},
      bars:[{open:9.99,close:10.99}]};
  }
 });
 assert.equal(result.m5ClosedBars,600);
 assert.equal(result.m5PagesFetched,2);
 assert.equal(result.h4QaSummary.completeH4Blocks,11);
 assert.equal(result.canTrade,false);
 assert.equal(result.sendPush,false);
 assert.equal(result.sourceParityCertified,false);
 assert.ok(!JSON.stringify(result).includes("fake_secret_only"));
 assert.ok(!JSON.stringify(result).includes("9.99"));
});
