import test from "node:test";
import assert from "node:assert/strict";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "../src/ctrader-demo-wss-probe-qa.mjs";

const ACCOUNT=123456789,now=1_800_000_000_000;
const rawEnv={
 QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
 QORE_CT_CLIENT_ID:"fake_client_id",QORE_CT_CLIENT_SECRET:"never_print_secret",
 QORE_CT_VIEW_ACCESS_TOKEN:"fake_view_token",
 QORE_CT_DEMO_ACCOUNT_ID:String(ACCOUNT),
 QORE_CT_EXPECTED_BROKER_TITLE:"IC Markets"
};
class WssFake {
 static responseScope=0; static sent=[];
 constructor(url){
  assert.equal(url,"wss://demo.ctraderapi.com:5036");
  this.listeners=new Map();
  queueMicrotask(()=>this.emit("open"));
 }
 addEventListener(type,fn){this.listeners.set(type,fn);}
 emit(type,event={}){this.listeners.get(type)?.(event);}
 send(body){
  const req=JSON.parse(body);WssFake.sent.push(req.payloadType);
  const payloadType=req.payloadType+1;
  let payload;
  switch(req.payloadType){
   case 2100: payload={};break;
   case 2149: payload={
      permissionScope:WssFake.responseScope,
      ctidTraderAccount:[{ctidTraderAccountId:String(ACCOUNT),
       isLive:false,brokerTitleShort:"IC Markets"}]
    };break;
   case 2102: payload={ctidTraderAccountId:String(ACCOUNT)};break;
   case 2114: payload={ctidTraderAccountId:String(ACCOUNT),
      symbol:[{symbolId:77,symbolName:"EURUSD",enabled:true}]};break;
   case 2116: payload={ctidTraderAccountId:String(ACCOUNT),
      symbol:[{symbolId:77,digits:5}]};break;
   case 2137: payload={ctidTraderAccountId:String(ACCOUNT),
      symbolId:77,period:5,trendbar:[
       {utcTimestampInMinutes:(now-900000)/60000,low:100000,
        deltaHigh:900,deltaOpen:500,deltaClose:600}
      ]};break;
   default:throw Error("Unexpected request type");
  }
  queueMicrotask(()=>this.emit("message",{data:JSON.stringify({
    clientMsgId:req.clientMsgId,payloadType,payload
   })}));
 }
 close(){this.closed=true;}
}
test("probe is opt-in and requires demo accounts view token",()=>{
 assert.throws(()=>readDemoViewProbeConfig({}),/NOT_EXPLICITLY_ENABLED/);
 assert.throws(()=>readDemoViewProbeConfig({...rawEnv,
  QORE_CT_OAUTH_SCOPE:"trading"}),/NOT_EXPLICITLY_ENABLED/);
 assert.throws(()=>readDemoViewProbeConfig({...rawEnv,
  QORE_CT_STAGE:"LIVE"}),/NOT_EXPLICITLY_ENABLED/);
 assert.throws(()=>readDemoViewProbeConfig({...rawEnv,
  QORE_CT_VIEW_ACCESS_TOKEN:""}),/SERVER_SECRETS_MISSING/);
 assert.throws(()=>readDemoViewProbeConfig({...rawEnv,
  QORE_CT_SAMPLE_SYMBOL_ID:"77"}),/MAPPING_INCOMPLETE/);
});
test("WSS inventory probe only sends auth and READ-ONLY symbols request",async()=>{
 WssFake.sent=[];WssFake.responseScope=0;
 const cfg=readDemoViewProbeConfig(rawEnv);
 const result=await runAuthorizedDemoWssProbe({
   config:cfg,WebSocketImpl:WssFake,now:()=>now,timeoutMs:3000
 });
 assert.equal(result.state,"INVENTORY_QA_ONLY");
 assert.equal(result.count,1);
 assert.deepEqual(result.symbols,[{symbolId:77,symbolName:"EURUSD",enabled:true}]);
 assert.equal(result.exactNameCandidates,1);
 assert.equal(result.ambiguousNameCandidates,0);
 assert.equal(result.pendingOwnerApproval,34);
 assert.deepEqual(WssFake.sent,[2100,2149,2102,2114]);
 assert.ok(!JSON.stringify(result).includes("fake_view_token"));
 assert.ok(!JSON.stringify(result).includes("never_print_secret"));
 assert.equal(result.sendPush,false);
 assert.equal(result.sourceParityCertified,false);
});
test("explicitly approved broker symbol can request bounded M5 historical bars",async()=>{
 WssFake.sent=[];WssFake.responseScope=0;
 const cfg=readDemoViewProbeConfig({...rawEnv,
   QORE_CT_SAMPLE_SYMBOL_ID:"77",QORE_CT_SAMPLE_SYMBOL_NAME:"EURUSD",
   QORE_CT_SAMPLE_INSTRUMENT_ID:"EURUSD"
 });
 const result=await runAuthorizedDemoWssProbe({
   config:cfg,WebSocketImpl:WssFake,now:()=>now,timeoutMs:3000
 });
 assert.equal(result.state,"HISTORICAL_M5_QA_UNCERTIFIED");
 assert.deepEqual(WssFake.sent,[2100,2149,2102,2114,2116,2137]);
 assert.equal(result.barCount,1);
 assert.equal(result.gaps,0);
 assert.equal(result.sourceParityCertified,false);
 assert.equal(result.canTrade,false);
 assert.equal(result.sendPush,false);
});
test("trading permission cannot open a market history even with correct broker account",async()=>{
 WssFake.sent=[];WssFake.responseScope=1;
 const config=readDemoViewProbeConfig(rawEnv);
 const result=await runAuthorizedDemoWssProbe({
   config,WebSocketImpl:WssFake,now:()=>now,timeoutMs:3000
 });
 assert.equal(result.reason,"CTRADER_SCOPE_VIEW_NOT_PROVEN");
 assert.deepEqual(WssFake.sent,[2100,2149]);
 assert.equal(result.sendPush,false);
 WssFake.responseScope=0;
});
test("non-deployable transport rejects invalid setup before network",async()=>{
 const result=await runAuthorizedDemoWssProbe({
   config:{},WebSocketImpl:WssFake,timeoutMs:3000
 });
 assert.equal(result.reason,"CTRADER_VIEW_ONLY_CONFIG_INVALID");
});
