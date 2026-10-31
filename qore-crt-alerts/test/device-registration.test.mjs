import test from "node:test";
import assert from "node:assert/strict";
import {QaDeviceRegistry} from "../src/device-registration.mjs";
const NOW=Date.parse("2026-10-31T15:00:00Z"),PROJECT="qore-crt-qa-project";
const verifyAuth=async credential=>
  credential==="alice-valid"?{verified:true,subject:"user-alice-qa-123"}:
  credential==="bob-valid"?{verified:true,subject:"user-bob-qa-123"}:null;
const make=()=>new QaDeviceRegistry({verifyAuth,projectId:PROJECT,
  hashSecret:"fixture-only-secret-not-valid-for-prod-1234567890"});
const input={credential:"alice-valid",projectId:PROJECT,
  deviceSlot:"slot-android-qa-001",installationId:"fid-android-qa-1234567890",
  optedIn:true,observedAt:NOW};
test("verified backend identity and same Firebase project are required",async()=>{
 const r=make();
 assert.equal((await r.register({...input,credential:"invalid"})).state,"AUTHENTICATION_REQUIRED");
 assert.equal((await r.register({...input,projectId:"bad-project"})).state,"INVALID_PROJECT_OR_INSTALLATION");
 assert.equal(r.size,0);
});
test("explicit opt-in gate rejects authenticated request without consent",async()=>{
 const r=make();
 assert.equal((await r.register({...input,optedIn:false})).state,"EXPLICIT_OPT_IN_REQUIRED");
});
test("QA registration gives only hashed device handle, no raw FID or user",async()=>{
 const r=make(),x=await r.register(input);
 assert.equal(x.state,"QA_REGISTERED");
 assert.match(x.handle,/^[a-f0-9]{64}$/);
 assert.equal(x.sendPush,false);
 const list=await r.list({credential:"alice-valid",now:NOW});
 assert.equal(list.count,1);
 assert.equal(list.registrations[0].deliveryState,"BLOCKED_NOT_CERTIFIED");
 assert.ok(!JSON.stringify(list).includes(input.installationId));
 assert.ok(!JSON.stringify(list).includes("user-alice"));
});
test("rotating installation identifier replaces existing device slot",async()=>{
 const r=make();await r.register(input);
 assert.equal((await r.register({...input,installationId:"fid-android-qa-new-123456",
  observedAt:NOW+300000})).state,"QA_INSTALLATION_ROTATED");
 assert.equal(r.size,1);
});
test("duplicate registration refresh retains same handle",async()=>{
 const r=make(),a=await r.register(input),b=await r.register({...input,observedAt:NOW+1});
 assert.equal(a.handle,b.handle);
 assert.equal(b.state,"QA_REGISTRATION_REFRESHED");
});
test("stale rotation and replay are rejected without overwriting",async()=>{
 const r=make();await r.register(input);
 await r.register({...input,installationId:"fid-android-qa-new-123456",observedAt:NOW+500000});
 assert.equal((await r.register({...input,observedAt:NOW+100000})).state,
 "STALE_ROTATION_IGNORED");
});
test("users sharing device slot IDs remain isolated",async()=>{
 const r=make();await r.register(input);await r.register({...input,credential:"bob-valid"});
 const a=await r.list({credential:"alice-valid",now:NOW});
 const b=await r.list({credential:"bob-valid",now:NOW});
 assert.notEqual(a.registrations[0].handle,b.registrations[0].handle);
});
test("revocation is restricted to verified device owner",async()=>{
 const r=make();await r.register(input);
 assert.equal((await r.revoke({credential:"bob-valid",deviceSlot:input.deviceSlot})).state,"QA_NOT_FOUND");
 assert.equal((await r.revoke({credential:"alice-valid",deviceSlot:input.deviceSlot})).state,"QA_REVOKED");
 assert.equal(r.size,0);
});
test("expiry prunes inactive registrations at thirty days",async()=>{
 const r=make();await r.register(input);
 const expiry=NOW+30*24*60*60*1000;
 assert.equal((await r.list({credential:"alice-valid",now:expiry})).count,0);
 assert.equal(r.pruneExpired({now:expiry}).purged,1);
});
test("do not accept client verified flag or weak secrets",async()=>{
 const r=make();
 assert.equal((await r.register({...input,credential:"bad",verified:true})).state,
 "AUTHENTICATION_REQUIRED");
 assert.throws(()=>new QaDeviceRegistry({verifyAuth,projectId:PROJECT,
  hashSecret:"weak"}),/secret/);
});
