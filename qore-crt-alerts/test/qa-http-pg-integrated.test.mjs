import test from "node:test";
import assert from "node:assert/strict";
import {PgQaDeviceRegistry} from "../src/pg-qa-device-registry.mjs";
import {createQaDeviceHttpServer} from "../src/qa-device-http.mjs";

const PROJECT="qore-crt-qa-project",APP="1:1234567890:android:qa-test-only",
 AT=Date.parse("2026-10-31T15:00:00Z");
const verifyAuth=async t=>t==="bearer-alice-verified-123"?
 {verified:true,subject:"qa-alice-uid-123456"}:
 t==="bearer-bob-verified-123"?{verified:true,subject:"qa-bob-uid-123456"}:null;
const verifyAppCheck=async t=>t==="valid-limited-attestation-123"?
 {verified:true,appId:APP,projectId:PROJECT,alreadyConsumed:false}:null;

function qaDb(){
 const records=new Map();
 return {records,async query(sql,p){
   if(sql.includes("qa_stage_device")){
     const [handle,scope,installation,project,expected,optedIn]=p;
     if(!optedIn||project!==PROJECT)throw Error("reject invalid scope");
     const old=records.get(handle);
     if(!old){
       if(expected!==0)throw Error("CAS expected 0");
       records.set(handle,{handle,scope,installation,revision:1,
         expiresAt:AT+2592000000,active:true});
       return {rows:[{result:{state:"QA_DEVICE_REGISTERED",revision:1}}]};
     }
     if(expected===0){
       if(old.installation!==installation||!old.active)throw Error("immutable conflict");
       return {rows:[{result:{state:"QA_DEVICE_DUPLICATE",revision:old.revision}}]};
     }
     if(expected!==old.revision||old.scope!==scope||!old.active)
       throw Error("stale CAS");
     old.installation=installation;old.revision++;
     return {rows:[{result:{state:"QA_DEVICE_ROTATED_OR_REFRESHED",
       revision:old.revision}}]};
   }
   if(sql.includes("qa_revoke_device")){
     const [handle,scope,expected]=p;
     const old=records.get(handle);
     if(!old||old.scope!==scope||old.revision!==expected||!old.active)
       throw Error("revocation conflict");
     old.active=false;old.revision++;
     return {rows:[{result:{state:"QA_DEVICE_REVOKED",revision:old.revision}}]};
   }
   if(sql.includes("user_scope_hash=$1")){
     const result=[...records.values()].filter(x=>x.scope===p[0]&&x.active)
       .map(x=>({handle:x.handle,revision:String(x.revision),
         expires_ms:String(x.expiresAt)}));
     return {rows:result};
   }
   throw Error("no real database transport in QA");
 }};
}
async function start(){
 const db=qaDb();
 const registry=new PgQaDeviceRegistry({db,verifyAuth,verifyAppCheck,
   projectId:PROJECT,firebaseAppId:APP,
   hashSecret:"test-injected-memory-sql-bridge-secret-12345678"});
 const server=createQaDeviceHttpServer({registry,verifyAppCheck,
   projectId:PROJECT,firebaseAppId:APP,now:()=>AT,requestsPerMinute:20});
 await new Promise((ok,fail)=>{server.once("error",fail);
   server.listen(0,"127.0.0.1",ok);});
 const call=async(method,body=null,credential="bearer-alice-verified-123")=>{
   const params={method,headers:{
     authorization:"Bearer "+credential,
     "x-firebase-appcheck":"valid-limited-attestation-123",
     ...(method==="GET"?{}:{"content-type":"application/json"})
   }};
   if(method!=="GET")params.body=JSON.stringify(body);
   const res=await fetch("http://127.0.0.1:"+server.address().port+
     "/qa/v1/devices",params);
   return {status:res.status,body:await res.json()};
 };
 return {call,db,close:()=>new Promise(ok=>server.close(ok))};
}
const first={deviceSlot:"android-phone-slot-123456",
  installationId:"firebase-qa-installation-123456",optedIn:true,
  expectedRevision:0};
test("full local HTTP -> SQL adapter -> CAS rotate -> revoke, no FCM",async()=>{
 const s=await start();
 try{
   const init=await s.call("POST",first);
   assert.equal(init.status,200);
   assert.equal(init.body.state,"QA_REGISTERED");
   assert.equal(init.body.revision,1);
   assert.equal(init.body.sendPush,false);
   const listing=await s.call("GET");
   assert.equal(listing.body.count,1);
   assert.equal(listing.body.registrations[0].revision,1);
   assert.equal(listing.body.registrations[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
   const next=await s.call("POST",{...first,
     installationId:"new-qa-installation-abcdef1234",expectedRevision:1});
   assert.equal(next.body.state,"QA_INSTALLATION_ROTATED");
   assert.equal(next.body.revision,2);
   assert.equal(s.db.records.size,1);
   const stale=await s.call("POST",{...first,expectedRevision:1});
   assert.equal(stale.status,503);
   assert.equal(stale.body.state,"QA_DATABASE_UNAVAILABLE");
   assert.equal((await s.call("GET")).body.registrations[0].revision,2);
   const revoked=await s.call("DELETE",{
     deviceSlot:first.deviceSlot,expectedRevision:2});
   assert.equal(revoked.status,200);
   assert.equal(revoked.body.state,"QA_REVOKED");
   assert.equal(revoked.body.sendPush,false);
   assert.equal((await s.call("GET")).body.count,0);
   assert.equal(s.db.records.size,1);
   assert.equal([...s.db.records.values()][0].active,false);
 }finally{await s.close();}
});
test("HTTP bearer subject never trusts body, cannot list other user's device",async()=>{
 const s=await start();
 try{
  await s.call("POST",{...first,subject:"qa-bob-uid-123456"});
  assert.equal((await s.call("GET",null,"bearer-bob-verified-123")).body.count,0);
  const denied=await s.call("DELETE",{
    deviceSlot:first.deviceSlot,expectedRevision:1},"bearer-bob-verified-123");
  assert.equal(denied.status,503);
  assert.equal(s.db.records.size,1);
 }finally{await s.close();}
});
test("HTTP and SQL bridge never exposes raw FID or credentials",async()=>{
 const s=await start();
 try{
  const x=await s.call("POST",first);
  const data=JSON.stringify(x.body);
  assert.ok(!data.includes(first.installationId));
  assert.ok(!data.includes("bearer-alice"));
  assert.ok(!data.includes("qa-alice-uid"));
  assert.match(x.body.handle,/^[a-f0-9]{64}$/);
 }finally{await s.close();}
});
