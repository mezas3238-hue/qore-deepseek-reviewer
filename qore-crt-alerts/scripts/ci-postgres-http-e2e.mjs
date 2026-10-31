// GitHub Actions ONLY: local PostgreSQL 16 + actual Node HTTP stack.
 // Never imports firebase-admin or calls Firebase/FCM. No external deployments.
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {PgQaDeviceRegistry} from "../src/pg-qa-device-registry.mjs";
import {createQaDeviceHttpServer} from "../src/qa-device-http.mjs";

if(process.env.CRT_EPHEMERAL_CI!=="true"||
   process.env.PGHOST!=="127.0.0.1"||
   process.env.PGUSER!=="qore_crt_http_test"||
   !process.env.PGPASSWORD||
   process.env.PGDATABASE!=="crt_replay_qa")
 throw Error("EPHEMERAL_CI_ONLY: reject nonlocal DB or unapproved role");

const require=createRequire(import.meta.url);
const {Pool}=require("pg");
const pool=new Pool({host:"127.0.0.1",port:5432,database:"crt_replay_qa",
 user:"qore_crt_http_test",password:process.env.PGPASSWORD,
 max:4,connectionTimeoutMillis:3000,statement_timeout:5000,
 query_timeout:6000});
const PROJECT="qore-ci-firebase-project",APP="1:987654321:android:qa-only";
const auth=async t=>t==="ci-auth-user-a"?{verified:true,subject:"ci-account-aaaa-123"}:
  t==="ci-auth-user-b"?{verified:true,subject:"ci-account-bbbb-456"}:null;
const appCheck=async t=>t==="ci-app-check-123"?
  {verified:true,projectId:PROJECT,appId:APP,alreadyConsumed:false}:null;
const registry=new PgQaDeviceRegistry({db:pool,verifyAuth:auth,
 verifyAppCheck:appCheck,hashSecret:"ci-fixture-hmac-only-not-a-secret-for-use",
 projectId:PROJECT,firebaseAppId:APP});
const server=createQaDeviceHttpServer({registry,verifyAppCheck:appCheck,
 projectId:PROJECT,firebaseAppId:APP,requestsPerMinute:50});
const checks=[];
const check=(name,fn)=>{checks.push(name);return fn()};
let port;
const request=async(method,data,identity="ci-auth-user-a",app="ci-app-check-123")=>{
 const resp=await fetch("http://127.0.0.1:"+port+"/qa/v1/devices",{
  method,
  headers:{"authorization":"Bearer "+identity,
   "x-firebase-appcheck":app,
   ...(method==="GET"?{}:{"content-type":"application/json"})},
  ...(method==="GET"?{}:{body:JSON.stringify(data)})
 });
 return {status:resp.status,data:await resp.json()};
};
const original={deviceSlot:"ci-phone-one-1234567",
 installationId:"ci-fid-original-12345678",optedIn:true,expectedRevision:0};
try{
 await pool.query("SELECT 1");
 await new Promise((ok,fail)=>{server.once("error",fail);
  server.listen(0,"127.0.0.1",ok)});
 port=server.address().port;
 const first=await request("POST",original);
 check("create through real Postgres",()=>{
  assert.equal(first.status,200);
  assert.equal(first.data.state,"QA_REGISTERED");
  assert.equal(first.data.revision,1);
  assert.equal(first.data.sendPush,false);
 });
 const duplicate=await request("POST",original);
 check("replay exact same registration idempotent",()=>{
  assert.equal(duplicate.status,200);
  assert.equal(duplicate.data.state,"QA_REGISTRATION_REFRESHED");
  assert.equal(duplicate.data.revision,1);
 });
 const list=await request("GET");
 check("list scoped hashed device from actual DB",()=>{
  assert.equal(list.status,200);
  assert.equal(list.data.count,1);
  assert.equal(list.data.registrations[0].revision,1);
  assert.equal(list.data.registrations[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
  assert.equal(list.data.registrations[0].handle,first.data.handle);
 });
 const concurrent=await Promise.all([
  request("POST",{...original,installationId:"ci-fid-rotated-a-1234567",expectedRevision:1}),
  request("POST",{...original,installationId:"ci-fid-rotated-b-1234567",expectedRevision:1})
 ]);
 check("concurrent compare-and-swap exactly one winner",()=>{
  assert.deepEqual(concurrent.map(x=>x.status).sort(),[200,409]);
  assert.equal(concurrent.filter(x=>x.data.revision===2).length,1);
 });
 const other=await request("GET",null,"ci-auth-user-b");
 check("authenticated other principal sees no device",()=>{
  assert.equal(other.status,200);assert.equal(other.data.count,0);
 });
 const wrong=await request("DELETE",{
  deviceSlot:original.deviceSlot,expectedRevision:2},"ci-auth-user-b");
 check("other principal cannot revoke",()=>{
  assert.equal(wrong.status,409);
  assert.equal(wrong.data.state,"QA_CONFLICT_HELD");
});
 const blocked=await request("POST",{...original,
  installationId:"ci-fid-new-12345678",expectedRevision:2},
  "ci-auth-user-a","invalid-app-check");
 check("App Check invalid prevents SQL write",()=>{
  assert.equal(blocked.status,401);
  assert.equal(blocked.data.state,"APP_CHECK_INVALID");
 });
 const revoked=await request("DELETE",{deviceSlot:original.deviceSlot,
  expectedRevision:2});
 check("owner revokes with current revision",()=>{
  assert.equal(revoked.status,200);
  assert.equal(revoked.data.state,"QA_REVOKED");
  assert.equal(revoked.data.revision,3);
 });
 const replay=await request("POST",{...original,
  installationId:"ci-fid-after-revoke-123456",expectedRevision:3});
 check("revoked handle cannot be silently resurrected",()=>{
  assert.equal(replay.status,409);
  assert.equal(replay.data.state,"QA_CONFLICT_HELD");
  assert.equal(replay.data.sendPush,false);
 });
 const verified=await pool.query(
  "SELECT count(*)::int AS count, bool_and(delivery_state='BLOCKED_NOT_CERTIFIED') AS held, "+
  "bool_and(active=FALSE) AS revoked "+
  "FROM qore_crt_alerts.qa_device_registrations");
 check("DB holds immutable delivery state after revocation",()=>{
  assert.equal(verified.rows[0].count,1);
  assert.equal(verified.rows[0].held,true);
  assert.equal(verified.rows[0].revoked,true);
 });
 let denied=false;
 try{await pool.query("SELECT * FROM qore_crt_alerts.replay_observations")}
 catch(e){denied=e.code==="42501"}
 check("dedicated HTTP DB role cannot read trading observations",()=>{
  assert.equal(denied,true);
 });
 const after=await request("GET");
 check("post-revocation list empty",()=>assert.equal(after.data.count,0));
 console.log("QORE CRT ALERTS HTTP/PG16 EPHEMERAL E2E PASS",
  checks.length,"checks; Auth and App Check mocks; sendPush:false");
}finally{
 if(server.listening)await new Promise(ok=>server.close(ok));
 await pool.end();
}
