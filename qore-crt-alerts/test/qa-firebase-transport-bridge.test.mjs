import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {qaFirebaseBridgeConfig,createQaFirebaseTransportServer}
  from "../src/qa-firebase-transport-bridge.mjs";
import {buildBlockedCrtMssInboxEvents}
  from "../src/qa-market-alert-bridge.mjs";

const GOOD_TOKEN="T".repeat(150);
const bearer="B".repeat(110);
const check="C".repeat(100);
const appId="1:100001:android:abcdef123456789";
const uid="ownerUidABC123";
const headers={
  authorization:"Bearer "+bearer,
  "x-firebase-appcheck":check
};
const config={ready:true,ownerUid:uid,firebaseAppId:appId};
const fakeAuth={
  verifyIdToken:async t=>{
    if(t!==bearer)throw Error("invalid auth");
    return {uid};
  },
  verifyAppCheck:async t=>{
    if(t!==check)throw Error("invalid app attestation");
    return {appId};
  }
};
let now=1_800_000_000_000;
const c1=now-8*3_600_000;
const rat=c1+8*3_600_000;
function observation(){
  return buildBlockedCrtMssInboxEvents({
    instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",
    family:"CRT_2C_RETURN",direction:1,c1StartMs:c1,
    sweepAtMs:c1+5*3_600_000,c2RatifiedAtMs:rat,
    observedAtMs:rat+300_000,sourcePhaseMin:0,coreCrt:true,
    m5:{},m15:{}
  })[0];
}
async function withApi(fn, opts={}){
  let sent=[];
  let localNow=opts.nowMs??now;
  const auth=opts.auth??fakeAuth;
  const server=createQaFirebaseTransportServer({
    config:opts.config??config,auth,
    now:()=>localNow,
    sendTestMessage:async msg=>{sent.push(msg);return {id:"qa-fcm-accepted"};}
  });
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  const url="http://127.0.0.1:"+server.address().port;
  const call=async(path,body,override={})=>{
    const method=body===null?"GET":"POST";
    const response=await fetch(url+path,{
      method,headers:{...headers,...(body!==null?{"content-type":"application/json"}:{}),
        ...override},
      ...(body!==null?{body:JSON.stringify(body)}:{})
    });
    return {code:response.status,body:await response.json()};
  };
  try{await fn({call,sent,getClock:()=>localNow,setClock:x=>{localNow=x;}});}
  finally{await new Promise(done=>server.close(done));}
}
test("QA bridge defaults OFF until explicit secure configuration",()=>{
  const cfg=qaFirebaseBridgeConfig({
    NODE_ENV:"test",QORE_CT_STAGE:"DEMO",QORE_PROVIDER:"IC",
    QORE_PUSH_ENABLED:"false",QORE_TRADING_ENABLED:"false",
    QORE_ALERT_TTL_SECONDS:"14400"
  });
  assert.equal(cfg.ready,false);
  assert.equal(qaFirebaseBridgeConfig({...cfg,
    QORE_QA_SYSTEM_TEST_ENABLED:"true"}).ready,false);
});
test("Firebase ID + app attestation mandatory, public market paths not exposed",async()=>{
  await withApi(async({call,sent})=>{
    const health=await call("/qa/health",null,{authorization:""});
    assert.equal(health.code,200);
    assert.equal(health.body.marketPush,false);
    const noIdentity=await call("/qa/v1/alerts",null,{authorization:""});
    assert.equal(noIdentity.code,401);
    const badApp=await call("/qa/v1/alerts",null,{"x-firebase-appcheck":"X".repeat(100)});
    assert.equal(badApp.code,401);
    assert.equal((await call("/v1/fcm/market",{eventType:"CRT_OBSERVED"})).code,404);
    assert.equal(sent.length,0);
  });
});
test("Wrong owner UID or wrong App Check appId are rejected",async()=>{
  for(const bad of [
    {...fakeAuth,verifyIdToken:async()=>({uid:"stranger"})},
    {...fakeAuth,verifyAppCheck:async()=>({appId:"other-app"})}
  ]){
    await withApi(async({call,sent})=>{
      const result=await call("/qa/v1/device/enroll",{deviceToken:GOOD_TOKEN});
      assert.equal(result.code,403);
      assert.equal(sent.length,0);
    },{auth:bad});
  }
});
test("explicitly enrolled device only accepts data-only SYSTEM_TEST, throttled",async()=>{
  await withApi(async({call,sent,setClock})=>{
    const missing=await call("/qa/v1/system/test-ping",{});
    assert.equal(missing.code,409);
    assert.equal((await call("/qa/v1/device/enroll",
      {deviceToken:"short"})).code,400);
    const created=await call("/qa/v1/device/enroll",{deviceToken:GOOD_TOKEN});
    assert.equal(created.code,200);
    assert.equal(created.body.state,"ENROLLED_QA_TEST_ONLY");
    const forged=await call("/qa/v1/system/test-ping",{family:"CRT_2C_RETURN"});
    assert.equal(forged.code,400);
    const ack=await call("/qa/v1/system/test-ping",{});
    assert.equal(ack.code,202);
    assert.equal(ack.body.state,"QA_TEST_ACCEPTED_BY_FCM_NOT_DEVICE_CONFIRMED");
    assert.equal(sent.length,1);
    assert.equal(sent[0].token,GOOD_TOKEN);
    assert.equal(sent[0].ttlSeconds,60);
    assert.equal(sent[0].data.schema,"QORE_QA_SYSTEM_TEST_V1");
    assert.equal(sent[0].data.kind,"SYSTEM_TEST");
    assert.equal(sent[0].data.testOnly,"true");
    assert.equal(Number(sent[0].data.expiresAtMs)-
      Number(sent[0].data.sentAtMs),60_000);
    assert.equal((await call("/qa/v1/system/test-ping",{})).code,429);
    setClock(now+30_001);
    assert.equal((await call("/qa/v1/device/unregister",{})).code,200);
    assert.equal((await call("/qa/v1/system/test-ping",{})).code,409);
  });
});
test("4h evidence stays in quarantined API without ever being sent to FCM",async()=>{
  await withApi(async({call,sent,setClock})=>{
    const event=observation();
    assert.equal(event.mode,"OFFLINE_REPLAY");
    const result=await call("/qa/v1/observation/stage",{event});
    assert.equal(result.code,201);
    const snapshot=await call("/qa/v1/alerts",null);
    assert.equal(snapshot.body.count,1);
    assert.equal(snapshot.body.alerts[0].sendPush,false);
    assert.equal(snapshot.body.alerts[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
    assert.equal(sent.length,0);
    const duplicate=await call("/qa/v1/observation/stage",{event});
    assert.equal(duplicate.code,422);
    assert.equal(duplicate.body.state,"DUPLICATE_NOT_RENOTIFIED");
    assert.equal((await call("/qa/v1/observation/stage",{
      event:{...event,sendPush:true}
    })).body.state,"INVALID_QA_EVIDENCE");
    setClock(event.eventAtMs+14_400_000);
    assert.equal((await call("/qa/v1/alerts",null)).body.count,0);
    assert.equal(sent.length,0);
  });
});
test("bridge cannot send test when not configured",async()=>{
  await withApi(async({call})=>{
    const status=await call("/qa/v1/device/enroll",{deviceToken:GOOD_TOKEN});
    assert.equal(status.code,503);
    assert.equal(status.body.state,"QA_TRANSPORT_DISABLED");
  },{config:{ready:false}});
});
