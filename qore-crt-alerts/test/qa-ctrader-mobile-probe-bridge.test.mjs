import test from "node:test";
import assert from "node:assert/strict";
import {createHash,createHmac} from "node:crypto";
import {mobileProbeBridgeGuard,publishQaProbe}
 from "../src/qa-ctrader-mobile-probe-bridge.mjs";

const secrets=Object.freeze({
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
 QORE_PROVIDER:"IC",QORE_TRADING_ENABLED:"false",
 QORE_PUSH_ENABLED:"false",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CTRADER_QA_MOBILE_BRIDGE:"OWNER_APPROVED_PROBE_ONLY",
 QORE_CTRADER_DEMO_PROBE_HMAC_SECRET:"x".repeat(64),
 QORE_CTRADER_QA_GATEWAY_URL:"https://qore-mobile-staging.up.railway.app/"
});
const probe=Object.freeze({
 state:"INVENTORY_QA_ONLY",connected:true,
 symbolsObserved:34,m5ClosedBars:null,
 sourceParityCertified:false,sendPush:false,canTrade:false
});

test("no signed bridge to Mobile without explicit staging authorization",async()=>{
 let count=0;
 const got=await publishQaProbe({env:{
  ...secrets,QORE_CTRADER_QA_MOBILE_BRIDGE:"DISABLED"
 },probe,fetchImpl:async()=>{count++;}});
 assert.equal(got.published,false);
 assert.equal(count,0);
 assert.equal(got.state,"AWAITING_OWNER_QA_BRIDGE_AUTHORIZATION");
});
test("production URL or trading-scope/live attempts fail closed",()=>{
 for(const [k,v] of [
  ["QORE_CT_STAGE","LIVE"],["QORE_CT_OAUTH_SCOPE","trading"],
  ["QORE_PUSH_ENABLED","true"],
  ["QORE_CTRADER_QA_GATEWAY_URL",
   "https://qore-mobile-gateway-production.up.railway.app/"],
  ["QORE_CTRADER_QA_GATEWAY_URL","http://qore-mobile-staging.up.railway.app/"],
  ["QORE_CTRADER_QA_GATEWAY_URL","https://example.com/"],
  ["QORE_CTRADER_DEMO_PROBE_HMAC_SECRET","short"]
 ]){
  assert.notEqual(mobileProbeBridgeGuard({...secrets,[k]:v}),
   "QA_BRIDGE_READY",k);
 }
});
test("valid QA probe sends signed no-market receipt with no sensitive data",async()=>{
 let calls=0;
 const time=1793955600000,nonce="11111111-1111-4111-8111-111111111111";
 const status=await publishQaProbe({
  env:secrets,probe,now:()=>time,nonceFn:()=>nonce,
  fetchImpl:async(url,opts)=>{
   calls++;
   assert.equal(url,
    "https://qore-mobile-staging.up.railway.app/v1/admin/crt/ctrader-demo-probe");
   assert.equal(opts.method,"POST");
   const body=JSON.parse(opts.body);
   assert.deepEqual(Object.keys(body),[
    "schema","source","environment","oauthScope","accountIsLive",
    "broker","probeState","observedAtMs","symbolsObserved",
    "closedM5Observed","sourceParityCertified","marketSignalsEnabled",
    "sendPush","canTrade"]);
   assert.equal(body.environment,"DEMO");
   assert.equal(body.broker,"IC Markets");
   assert.equal(body.sourceParityCertified,false);
   assert.equal(body.canTrade,false);
   assert.equal(body.closedM5Observed,0);
   assert.equal(body.symbolsObserved,34);
   assert.ok(!opts.body.includes("clientSecret"));
   assert.ok(!opts.body.includes("accessToken"));
   const canonical=["POST","/v1/admin/crt/ctrader-demo-probe",String(time),
    nonce,createHash("sha256").update(opts.body).digest("hex")].join("\n");
   assert.equal(opts.headers["X-Qore-Ctrader-Signature"],
    "v1="+createHmac("sha256",secrets.QORE_CTRADER_DEMO_PROBE_HMAC_SECRET)
      .update(canonical).digest("hex"));
   return {status:202};
  }
 });
 assert.equal(calls,1);
 assert.equal(status.published,true);
 assert.equal(status.sourceParityCertified,false);
 assert.equal(status.sendPush,false);
});
test("unverified or fake probe is never relayed",async()=>{
 for(const v of [
  {...probe,connected:false},
  {...probe,sourceParityCertified:true},
  {...probe,sendPush:true},
  {...probe,canTrade:true},
  {...probe,state:"FAKE_CERTIFIED"},
  {...probe,state:"HISTORICAL_M5_QA_UNCERTIFIED",m5ClosedBars:null},
  {...probe,symbolsObserved:6000}
 ]){
  let calls=0;
  const result=await publishQaProbe({env:secrets,probe:v,
   fetchImpl:async()=>{calls++}});
  assert.equal(result.published,false);
  assert.equal(calls,0);
 }
});
test("gateway rejects and network errors are not confused with alerts",async()=>{
 const reject=await publishQaProbe({env:secrets,probe,
  fetchImpl:async()=>({status:403})});
 assert.equal(reject.state,"QA_GATEWAY_REJECTED_PROBE");
 const failure=await publishQaProbe({env:secrets,probe,
  fetchImpl:async()=>{throw Error("network down");}});
 assert.equal(failure.state,"QA_GATEWAY_UNREACHABLE");
 assert.equal(failure.published,false);
});
