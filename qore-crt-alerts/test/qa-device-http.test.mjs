import test from "node:test";
import assert from "node:assert/strict";
import {QaDeviceRegistry} from "../src/device-registration.mjs";
import {createQaDeviceHttpServer} from "../src/qa-device-http.mjs";

const at=Date.parse("2026-10-31T15:00:00Z"),projectId="qore-crt-qa-project";
const firebaseAppId="1:1234567890:android:qa-test-only";
const verifyAuth=async t=>t==="alice-verified"?
  {verified:true,subject:"user-alice-qa-123"}:
  t==="bob-verified"?{verified:true,subject:"user-bob-qa-123"}:null;
const verifyAppCheck=async t=>t==="valid-attestation"?
  {verified:true,projectId,appId:firebaseAppId,alreadyConsumed:false}:null;
const setup=async(limit=12)=>{
  let now=at;
  const registry=new QaDeviceRegistry({verifyAuth,verifyAppCheck,
    projectId,firebaseAppId,hashSecret:"qa-only-secret-not-for-real-firebase-1234567",
    now:()=>now});
  const server=createQaDeviceHttpServer({
    registry,verifyAppCheck,projectId,firebaseAppId,now:()=>now,
    requestsPerMinute:limit
  });
  await new Promise((ok,fail)=>{
    server.once("error",fail);server.listen(0,"127.0.0.1",ok);
  });
  const port=server.address().port;
  const call=async(method="POST",data,headers={},path="/qa/v1/devices")=>{
    const init={method,headers:{
      authorization:"Bearer alice-verified",
      "x-firebase-appcheck":"valid-attestation",
      ...(method==="GET"?{}:{"content-type":"application/json"}),
      ...headers}};
    if(method!=="GET")init.body=typeof data==="string"?data:JSON.stringify(data??{});
    const result=await fetch("http://127.0.0.1:"+port+path,init);
    return {status:result.status,body:await result.json(),
      headers:result.headers};
  };
  return {registry,server,call,setNow:x=>{now=x},close:()=>
    new Promise(resolve=>server.close(resolve))};
};
const valid={deviceSlot:"slot-android-qa-001",
 installationId:"fid-android-qa-1234567890",optedIn:true};
test("local-only endpoint accepts verified App Check and Auth; no FCM",async()=>{
 const s=await setup();
 try{
  const a=await s.call("POST",valid);
  assert.equal(a.status,200);assert.equal(a.body.state,"QA_REGISTERED");
  assert.equal(a.body.sendPush,false);
  assert.ok(!JSON.stringify(a.body).includes(valid.installationId));
  const list=await s.call("GET");
  assert.equal(list.status,200);assert.equal(list.body.count,1);
  assert.equal(list.body.registrations[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
  assert.equal(list.headers.get("cache-control"),"no-store");
 }finally{await s.close();}
});
test("unauthenticated registration and forged App Check rejected",async()=>{
 const s=await setup();
 try{
  assert.equal((await s.call("POST",valid,
    {authorization:"Bearer not-authorized"})).status,401);
  assert.equal((await s.call("POST",valid,
    {"x-firebase-appcheck":"fake-attestation"})).status,401);
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("register must include explicit opt-in; no body user impersonation",async()=>{
 const s=await setup();
 try{
  assert.equal((await s.call("POST",{...valid,optedIn:false,
    subject:"user-bob-qa-123"})).body.state,"EXPLICIT_OPT_IN_REQUIRED");
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("same device retransmit and FID rotation remain one record",async()=>{
 const s=await setup();
 try{
  await s.call("POST",valid);
  assert.equal((await s.call("POST",valid)).body.state,"QA_REGISTRATION_REFRESHED");
  assert.equal((await s.call("POST",{...valid,
    installationId:"fid-android-qa-rotated-1234"})).body.state,
    "QA_INSTALLATION_ROTATED");
  assert.equal(s.registry.size,1);
 }finally{await s.close();}
});
test("revoke caller device; other verified user cannot revoke",async()=>{
 const s=await setup();
 try{
  await s.call("POST",valid);
  assert.equal((await s.call("DELETE",{deviceSlot:valid.deviceSlot},
   {authorization:"Bearer bob-verified"})).body.state,"QA_NOT_FOUND");
  assert.equal(s.registry.size,1);
  assert.equal((await s.call("DELETE",{deviceSlot:valid.deviceSlot})).body.state,
   "QA_REVOKED");
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("rate limit applies before payload processing",async()=>{
 const s=await setup(2);
 try{
  await s.call("GET");await s.call("GET");
  const denied=await s.call("POST",valid);
  assert.equal(denied.status,429);
  assert.equal(denied.body.state,"QA_RATE_LIMITED");
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("invalid JSON and excessive size rejected before registry",async()=>{
 const s=await setup();
 try{
  assert.equal((await s.call("POST","{bad-json}")).status,400);
  assert.equal((await s.call("POST",{...valid,padding:"a".repeat(5000)})).status,413);
  assert.equal((await s.call("POST",valid,
     {"content-type":"text/plain"})).status,415);
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("no CORS browser calls or send-push endpoint exists",async()=>{
 const s=await setup();
 try{
  assert.equal((await s.call("POST",valid,{origin:"https://evil.example"})).status,403);
  assert.equal((await s.call("POST",valid,{},"/qa/v1/send")).status,404);
  assert.equal((await s.call("GET",null,{},"/qa/health")).body.sendPush,false);
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("unknown method cannot mutate registry; no-cache metadata",async()=>{
 const s=await setup();
 try{
  const response=await fetch("http://127.0.0.1:"+s.server.address().port+
    "/qa/v1/devices",{method:"PUT"});
  assert.equal(response.status,405);
  assert.equal(response.headers.get("allow"),"GET, POST, DELETE");
  assert.equal(response.headers.get("cache-control"),"no-store");
  assert.equal(s.registry.size,0);
 }finally{await s.close();}
});
test("GET and DELETE require valid App Check attestation too",async()=>{
 const s=await setup();
 try{
  assert.equal((await s.call("GET",null,
    {"x-firebase-appcheck":"spoof"})).status,401);
  assert.equal((await s.call("DELETE",{deviceSlot:valid.deviceSlot},
    {"x-firebase-appcheck":"spoof"})).status,401);
 }finally{await s.close();}
});
