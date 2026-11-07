import test from "node:test";
import assert from "node:assert/strict";
import {CTRADER_DEMO_JSON_URL,VIEW_ONLY_TYPES}
  from "../src/ctrader-demo-view-session-qa.mjs";
import {accountDiscoveryGuard,parseProvenDemoAccountCandidates,
  discoverAuthorizedDemoAccounts,DISCOVERY_OPT_IN}
  from "../src/qa-ctrader-demo-account-discovery.mjs";

const env=Object.freeze({
  QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
  QORE_PROVIDER:"IC",QORE_TRADING_ENABLED:"false",
  QORE_PUSH_ENABLED:"false",QORE_ALERT_TTL_SECONDS:"14400",
  QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
  QORE_CT_ACCOUNT_DISCOVERY:DISCOVERY_OPT_IN,
  QORE_CT_CLIENT_ID:"fake-client-id",QORE_CT_CLIENT_SECRET:"fake-secret",
  QORE_CT_VIEW_ACCESS_TOKEN:"fake-view-token"
});
const proven=(accounts,permissionScope=0)=>({
  clientMsgId:"request2",payloadType:VIEW_ONLY_TYPES.ACCOUNTS_OK,
  payload:{permissionScope,ctidTraderAccount:accounts}
});

test("explicit DEMO VIEW owner opt-in and server credentials are mandatory",()=>{
  assert.equal(accountDiscoveryGuard(env),"AUTHORIZED_DEMO_DISCOVERY_READY");
  for(const [key,value] of [
    ["QORE_CT_STAGE","LIVE"],["QORE_CT_OAUTH_SCOPE","trading"],
    ["QORE_PROVIDER","OTHER"],["QORE_TRADING_ENABLED","true"],
    ["QORE_PUSH_ENABLED","true"],["QORE_ALERT_TTL_SECONDS","10000"]
  ])assert.notEqual(accountDiscoveryGuard({...env,[key]:value}),
     "AUTHORIZED_DEMO_DISCOVERY_READY",key);
  assert.notEqual(accountDiscoveryGuard({...env,QORE_CT_ACCOUNT_DISCOVERY:""}),
    "AUTHORIZED_DEMO_DISCOVERY_READY");
  for(const key of ["QORE_CT_CLIENT_ID","QORE_CT_CLIENT_SECRET",
    "QORE_CT_VIEW_ACCESS_TOKEN"])
    assert.equal(accountDiscoveryGuard({...env,[key]:""}),
      "AWAITING_SECURE_CTRADER_CREDENTIALS");
});

test("only explicitly DEMO accounts with exact native broker names are presented",()=>{
  const result=parseProvenDemoAccountCandidates(proven([
    {ctidTraderAccountId:"12345",isLive:false,brokerTitleShort:"IC Markets"},
    {ctidTraderAccountId:"88888",isLive:true,brokerTitleShort:"IC Markets"},
    {ctidTraderAccountId:"77777",brokerTitleShort:"IC Markets"},
    {ctidTraderAccountId:"98765",isLive:false,brokerTitleShort:"Other Broker"}
  ]),"request2");
  assert.equal(result.state,"DEMO_ACCOUNT_CANDIDATES_FOR_OWNER");
  assert.deepEqual(result.accounts,[
    {ctidTraderAccountId:"12345",brokerTitleShort:"IC Markets",isLive:false},
    {ctidTraderAccountId:"98765",brokerTitleShort:"Other Broker",isLive:false}
  ]);
  assert.equal(result.accountsWithoutProvenDemo,2);
  assert.equal(result.canTrade,false);
  assert.equal(result.sendPush,false);
  assert.equal(result.sourceParityCertified,false);
  assert.equal(result.connected,false);
});

test("scope, correlation and malformed account identities fail closed",()=>{
  for(const payload of [
    proven([{ctidTraderAccountId:"123",isLive:false,brokerTitleShort:"IC Markets"}],1),
    proven([{ctidTraderAccountId:"123",isLive:false,brokerTitleShort:"IC Markets"}],"SCOPE_TRADE"),
    {...proven([]),clientMsgId:"other"},
    proven([{ctidTraderAccountId:"xx",isLive:false,brokerTitleShort:"IC Markets"}]),
    proven([{ctidTraderAccountId:"123",isLive:false,brokerTitleShort:"IC Markets"},
      {ctidTraderAccountId:"123",isLive:false,brokerTitleShort:"IC Markets"}]),
    proven([{ctidTraderAccountId:"123",isLive:false,brokerTitleShort:""}])
  ])assert.equal(parseProvenDemoAccountCandidates(payload,"request2").accounts.length,0);
  assert.equal(parseProvenDemoAccountCandidates(proven([
    {ctidTraderAccountId:"123",isLive:true,brokerTitleShort:"IC Markets"}
  ]),"request2").state,"NO_VERIFIED_DEMO_ACCOUNTS");
});

test("no credentials means no WebSocket may open",async()=>{
  let sockets=0;
  class NeverWs{constructor(){sockets++;}}
  const result=await discoverAuthorizedDemoAccounts({
    env:{...env,QORE_CT_CLIENT_ID:""},WebSocketImpl:NeverWs
  });
  assert.equal(result.connected,false);
  assert.equal(sockets,0);
});

test("socket sends only application auth and authorized account discovery",async()=>{
  const sent=[];
  class FakeWebSocket{
    constructor(url){
      assert.equal(url,CTRADER_DEMO_JSON_URL);
      this.handlers={};
      queueMicrotask(()=>this.handlers.open?.({}));
    }
    addEventListener(k,fn){this.handlers[k]=fn;}
    send(raw){
      const msg=JSON.parse(raw);
      sent.push(msg);
      let answer;
      if(msg.payloadType===VIEW_ONLY_TYPES.APP_AUTH)answer={
        clientMsgId:msg.clientMsgId,
        payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK,payload:{}
      };
      else if(msg.payloadType===VIEW_ONLY_TYPES.ACCOUNTS)answer={
        clientMsgId:msg.clientMsgId,
        payloadType:VIEW_ONLY_TYPES.ACCOUNTS_OK,
        payload:{permissionScope:0,ctidTraderAccount:[
          {ctidTraderAccountId:"3333",brokerTitleShort:"IC Markets",isLive:false}
        ]}
      };
      else throw Error("Unexpected outbound request");
      queueMicrotask(()=>this.handlers.message?.({data:JSON.stringify(answer)}));
    }
    close(){}
  }
  let request=0;
  const result=await discoverAuthorizedDemoAccounts({
    env,WebSocketImpl:FakeWebSocket,
    idFn:()=>String(++request).padStart(4,"x")
  });
  assert.equal(result.state,"DEMO_ACCOUNT_CANDIDATES_FOR_OWNER");
  assert.deepEqual(sent.map(x=>x.payloadType),[
    VIEW_ONLY_TYPES.APP_AUTH,VIEW_ONLY_TYPES.ACCOUNTS
  ]);
  assert.equal(sent[0].payload.clientSecret,"fake-secret");
  assert.equal(sent[1].payload.accessToken,"fake-view-token");
  const sanitized=JSON.stringify(result);
  assert.ok(!sanitized.includes("fake-secret"));
  assert.ok(!sanitized.includes("fake-view-token"));
  assert.ok(!sanitized.includes("fake-client-id"));
  assert.equal(result.accounts[0].ctidTraderAccountId,"3333");
});
