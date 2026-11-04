import test from "node:test";
import assert from "node:assert/strict";
import {stagingGuard,performStagingProbe}
 from "../scripts/railway-ctrader-demo-entry.mjs";

const env=Object.freeze({
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
 QORE_PROVIDER:"IC",QORE_TRADING_ENABLED:"false",
 QORE_PUSH_ENABLED:"false",QORE_ALERT_TTL_SECONDS:"14400",
 QORE_CT_QA_PROBE:"DISABLED_UNTIL_OWNER_VIEW_TOKEN"
});
test("Railway staging without secrets never contacts broker",async()=>{
 let calls=0;
 const result=await performStagingProbe({env,probe:async()=>{
  calls++;throw Error("network must not be accessed");
 }});
 assert.equal(result.state,"AWAITING_OWNER_VIEW_ONLY_AUTHORIZATION");
 assert.equal(result.connected,false);
 assert.equal(result.sendPush,false);
 assert.equal(calls,0);
});
test("blocks unauthorized scope, LIVE, wrong IC feed, trading, push and TTL",()=>{
 for(const [k,v] of [
  ["QORE_CT_STAGE","LIVE"],["QORE_CT_OAUTH_SCOPE","trading"],
  ["QORE_PROVIDER","OANDA"],["QORE_TRADING_ENABLED","true"],
  ["QORE_PUSH_ENABLED","true"],["QORE_ALERT_TTL_SECONDS","86400"]
 ]){
  assert.equal(stagingGuard({...env,[k]:v}),"BLOCKED_UNSAFE_STAGE_CONFIG");
 }
});
test("explicit owner enabled without all credentials still cannot open socket",async()=>{
 const res=await performStagingProbe({
   env:{...env,QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY"},
   probe:async()=>{throw Error("unexpected network");}
 });
 assert.equal(res.state,"AWAITING_SECURE_CTRADER_CREDENTIALS");
});
test("sanitizes provider output and never promotes inventory to trading certification",async()=>{
 const secrets={...env,
  QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
  QORE_CT_CLIENT_ID:"qa_app_id",
  QORE_CT_CLIENT_SECRET:"NOT_FOR_LOGGING_123",
  QORE_CT_VIEW_ACCESS_TOKEN:"NOT_FOR_LOGGING_ACCESS_TOKEN",
  QORE_CT_DEMO_ACCOUNT_ID:"123456789",
  QORE_CT_EXPECTED_BROKER_TITLE:"IC Markets"
 };
 let calls=0;
 const output=await performStagingProbe({env:secrets,probe:async({config})=>{
  calls++;assert.equal(config.demoAccountId,"123456789");
  return {state:"INVENTORY_QA_ONLY",count:34,exactNameCandidates:32,
   ambiguousNameCandidates:1,secret:secrets.QORE_CT_CLIENT_SECRET};
 }});
 assert.equal(calls,1);
 assert.equal(output.state,"INVENTORY_QA_ONLY");
 assert.equal(output.connected,true);
 assert.equal(output.symbolsObserved,34);
 assert.equal(output.icExactNameCandidates,32);
 assert.equal(output.sourceParityCertified,false);
 assert.equal(output.canTrade,false);
 assert.equal(output.sendPush,false);
 assert.ok(!JSON.stringify(output).includes("NOT_FOR_LOGGING"));
});
test("failed connection remains unconnected and no raw response propagated",async()=>{
 const secrets={...env,QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
  QORE_CT_CLIENT_ID:"qa_app_id",QORE_CT_CLIENT_SECRET:"secret_qa",
  QORE_CT_VIEW_ACCESS_TOKEN:"access_qa",
  QORE_CT_DEMO_ACCOUNT_ID:"123456789",
  QORE_CT_EXPECTED_BROKER_TITLE:"IC Markets"
 };
 const out=await performStagingProbe({env:secrets,probe:async()=>({
  state:"BLOCKED",reason:"CTRADER_DEMO_TLS_FAILED",
  credentials:"should-not-return"
 })});
 assert.equal(out.connected,false);
 assert.equal(out.state,"CTRADER_DEMO_TLS_FAILED");
 assert.ok(!JSON.stringify(out).includes("credentials"));
});
