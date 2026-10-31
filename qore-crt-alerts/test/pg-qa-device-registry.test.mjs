import test from "node:test";
import assert from "node:assert/strict";
import {PgQaDeviceRegistry} from "../src/pg-qa-device-registry.mjs";
const PROJECT="qore-crt-qa-project",APP="1:1234567890:android:qa-test-only";
const auth=async token=>token==="valid-alice"?
 {verified:true,subject:"alice-uid-123456"}:null;
const check=async token=>token==="limited-use-valid"?
 {verified:true,projectId:PROJECT,appId:APP,alreadyConsumed:false}:null;
const create=(db)=>new PgQaDeviceRegistry({
 db,verifyAuth:auth,verifyAppCheck:check,projectId:PROJECT,
 firebaseAppId:APP,hashSecret:"fake-test-secret-not-deployment-1234567890"
});
const req={credential:"valid-alice",appCheckToken:"limited-use-valid",
 projectId:PROJECT,deviceSlot:"android-device-slot-123",
 installationId:"firebase-install-id-1234567",optedIn:true};
test("registration maps only hashed identifying fields into parametrized SQL",async()=>{
 let seen=null;
 const r=create({query:async(q,params)=>{
  seen={q,params};
  return {rows:[{result:{state:"QA_DEVICE_REGISTERED",revision:1}}]};
 }});
 const out=await r.register(req);
 assert.equal(out.state,"QA_REGISTERED");
 assert.equal(out.sendPush,false);
 assert.equal(out.revision,1);
 assert.match(seen.q,/\$1,\$2,\$3,\$4,\$5,\$6/);
 assert.equal(seen.params.length,6);
 assert.match(seen.params[0],/^[a-f0-9]{64}$/);
 assert.match(seen.params[1],/^[a-f0-9]{64}$/);
 assert.match(seen.params[2],/^[a-f0-9]{64}$/);
 assert.ok(!JSON.stringify(seen).includes(req.installationId));
 assert.ok(!JSON.stringify(seen).includes(req.credential));
});
test("unauthorized, wrong Firebase App ID and consent denied before any SQL",async()=>{
 let called=0;const db={query:async()=>{called++;throw Error("must not query")}};
 const r=create(db);
 assert.equal((await r.register({...req,credential:"wrong"})).state,
  "AUTHENTICATION_REQUIRED");
 assert.equal((await r.register({...req,appCheckToken:"wrong"})).state,"APP_CHECK_INVALID");
 assert.equal((await r.register({...req,optedIn:false})).state,"EXPLICIT_OPT_IN_REQUIRED");
 assert.equal(called,0);
});
test("CAS expectedRevision propagates on device rotation",async()=>{
 let query=null;
 const r=create({query:async(q,p)=>{query=p;
  return {rows:[{result:{state:"QA_DEVICE_ROTATED_OR_REFRESHED",revision:4}}]}}});
 const a=await r.register({...req,expectedRevision:3});
 assert.equal(a.state,"QA_INSTALLATION_ROTATED");
 assert.equal(a.revision,4);
 assert.equal(query[4],3);
});
test("revocation only for user-scoped hashed handle and revision",async()=>{
 let sql,parameters;
 const r=create({query:async(q,p)=>{sql=q;parameters=p;
  return {rows:[{result:{state:"QA_DEVICE_REVOKED",revision:5}}]}}});
 const a=await r.revoke({credential:req.credential,
  deviceSlot:req.deviceSlot,expectedRevision:4});
 assert.equal(a.state,"QA_REVOKED");
 assert.equal(a.sendPush,false);
 assert.match(sql,/qa_revoke_device/);
 assert.equal(parameters[2],4);
 assert.match(parameters[0],/^[a-f0-9]{64}$/);
});
test("wrong/absent CAS revision is rejected before database writes",async()=>{
 let writes=0;const r=create({query:async()=>{writes++;return {rows:[]}}});
 assert.equal((await r.revoke({credential:req.credential,
  deviceSlot:req.deviceSlot})).state,"INVALID_DEVICE_SLOT");
 assert.equal((await r.register({...req,expectedRevision:-1})).state,
  "INVALID_PROJECT_OR_INSTALLATION");
 assert.equal(writes,0);
});
test("DB failures redact errors, never leak SQL details",async()=>{
 const r=create({query:async()=>{throw Error("secret database connection string")}});
 assert.deepEqual(await r.register(req),{
  state:"QA_DATABASE_UNAVAILABLE",environment:"OFFLINE_REPLAY",
  actionable:false,sendPush:false,deliveryState:"BLOCKED_NOT_CERTIFIED"});
});
test("list filters by user HMAC and returns only public hashed handles",async()=>{
 let sql,args;
 const r=create({query:async(q,p)=>{sql=q;args=p;return {
  rows:[{handle:"a".repeat(64),revision:"2",expires_ms:"1793450000000"}]}}});
 const out=await r.list({credential:req.credential});
 assert.equal(out.count,1);
 assert.equal(out.registrations[0].revision,2);
 assert.equal(out.registrations[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
 assert.match(sql,/user_scope_hash=\$1/);
 assert.equal(args.length,1);
 assert.match(args[0],/^[a-f0-9]{64}$/);
});
test("mock cannot trick registry into positive delivery state",async()=>{
 const r=create({query:async()=>({rows:[{
  result:{state:"READY_TO_SEND",revision:1}}]})});
 assert.equal((await r.register(req)).state,"QA_DATABASE_UNAVAILABLE");
});
