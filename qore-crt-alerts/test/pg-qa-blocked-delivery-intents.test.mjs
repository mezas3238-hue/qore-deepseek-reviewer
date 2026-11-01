import test from "node:test";
import assert from "node:assert/strict";
import {PgQaBlockedDeliveryIntents}
 from "../src/pg-qa-blocked-delivery-intents.mjs";
const observation={eventKey:"TEST|EURUSD|1000|1|MSS_M15|900001",
 fingerprint:"a".repeat(64),status:"QUARANTINED_REPLAY",
 deliveryState:"BLOCKED_NOT_CERTIFIED",actionable:false,sendPush:false};
const registration={handle:"b".repeat(64),
 deliveryState:"BLOCKED_NOT_CERTIFIED"};
test("stage uses fixed parametrized PostgreSQL function without FCM token",async()=>{
 let q,p;
 const reg=new PgQaBlockedDeliveryIntents({db:{query:async(sql,params)=>{
  q=sql;p=params;return {rows:[{state:"QA_INTENT_RECORDED_NOT_SENDABLE"}]};
 }}});
 const out=await reg.stage({observation,registration});
 assert.equal(out.state,"QA_INTENT_RECORDED_NOT_SENDABLE");
 assert.equal(out.transport,"DISABLED");assert.equal(out.sendPush,false);
 assert.equal(out.deviceHandle,registration.handle);
 assert.match(q,/qa_stage_blocked_delivery_intent\(\$1,\$2,\$3\)/);
 assert.deepEqual(p,[observation.eventKey,registration.handle,observation.fingerprint]);
});
test("duplicates remain blocked without changing status",async()=>{
 const reg=new PgQaBlockedDeliveryIntents({db:{query:async()=>({
  rows:[{state:"DUPLICATE_IGNORED"}]})}});
 const out=await reg.stage({observation,registration});
 assert.equal(out.state,"DUPLICATE_IGNORED");
 assert.equal(out.deliveryState,"BLOCKED_NOT_CERTIFIED");
 assert.equal(out.actionable,false);
});
test("reject unverified observation or wrong registration BEFORE SQL",async()=>{
 let called=0;const reg=new PgQaBlockedDeliveryIntents({
  db:{query:async()=>{called++;throw Error("should not call SQL")}}});
 for(const changed of [{...observation,sendPush:true},
  {...observation,status:"CERTIFIED"}, {...observation,fingerprint:"bad"},
  {...observation,actionable:true}]){
   assert.equal((await reg.stage({observation:changed,registration})).state,
    "INVALID_QUARANTINED_EVENT");
 }
 assert.equal((await reg.stage({observation,registration:{
   ...registration,handle:"raw_fcm_token"}})).state,"INVALID_QA_REGISTRATION");
 assert.equal(called,0);
});
test("PostgreSQL revocation/expiry and conflicting identity are held safely",async()=>{
 const reg=new PgQaBlockedDeliveryIntents({db:{query:async()=>{
  throw Object.assign(Error("QA_INTENT_BLOCKED: registration expired"),
   {code:"23514"})}}});
 assert.equal((await reg.stage({observation,registration})).state,
  "QA_INTENT_HELD");
});
test("unknown DB failures or unexpected SQL results never unlock sending",async()=>{
 const db={query:async()=>{throw Error("postgres://private-secret")}};
 const reg=new PgQaBlockedDeliveryIntents({db});
 assert.deepEqual(await reg.stage({observation,registration}),{
  state:"QA_DATABASE_UNAVAILABLE",environment:"OFFLINE_REPLAY",
  actionable:false,sendPush:false,transport:"DISABLED",
  deliveryState:"BLOCKED_NOT_CERTIFIED"});
 const malicious=new PgQaBlockedDeliveryIntents({db:{
  query:async()=>({rows:[{state:"READY_TO_SEND"}]})}});
 assert.equal((await malicious.stage({observation,registration})).state,
  "QA_DATABASE_UNAVAILABLE");
});
test("cannot configure live mode or missing database",()=>{
 assert.throws(()=>new PgQaBlockedDeliveryIntents({db:{query:async()=>{}},
  mode:"LIVE"}),/offline-only/);
 assert.throws(()=>new PgQaBlockedDeliveryIntents({}),/offline-only/);
});
