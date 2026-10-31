import test from "node:test";
import assert from "node:assert/strict";
import {makeFirebaseAdminVerifiers} from "../src/firebase-admin-verifiers.mjs";
const projectId="qore-crt-qa-project",firebaseAppId="1:1234567890:android:qa-test-only";
const good=()=>({
 auth:{verifyIdToken:async()=>({aud:projectId,uid:"qa-owner-123456"})},
 appCheck:{verifyToken:async()=>({appId:firebaseAppId,alreadyConsumed:false})}
});
test("Firebase Admin verifier requires real SDK-shaped objects",()=>{
 assert.throws(()=>makeFirebaseAdminVerifiers({projectId,firebaseAppId}),/verified Firebase/);
});
test("Auth verifier checks signature through SDK and revocation flag true",async()=>{
 let invoked=null;const deps=good();
 deps.auth.verifyIdToken=async(t,revoke)=>{invoked=[t,revoke];return {aud:projectId,uid:"qa-owner-123456"}};
 const v=makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId});
 assert.deepEqual(await v.verifyAuth("id-token-qa"),
  {verified:true,subject:"qa-owner-123456"});
 assert.deepEqual(invoked,["id-token-qa",true]);
});
test("identity for wrong Firebase project rejected even when SDK accepts token",async()=>{
 const deps=good();deps.auth.verifyIdToken=async()=>({aud:"other-project",uid:"qa-owner-123456"});
 const v=makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId});
 assert.equal(await v.verifyAuth("id"),null);
});
test("App Check verifies and consumes only intended Firebase App ID",async()=>{
 let options;const deps=good();
 deps.appCheck.verifyToken=async(t,o)=>{options=o;return {appId:firebaseAppId,alreadyConsumed:false}};
 const v=makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId});
 assert.deepEqual(await v.verifyAppCheck("limited-use-qa"),{
  verified:true,projectId,appId:firebaseAppId,alreadyConsumed:false});
 assert.deepEqual(options,{consume:true});
});
test("consumed or other-project App Check tokens never enable registration",async()=>{
 let deps=good();deps.appCheck.verifyToken=async()=>({appId:firebaseAppId,alreadyConsumed:true});
 assert.equal(await makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId})
  .verifyAppCheck("replayed"),null);
 deps=good();deps.appCheck.verifyToken=async()=>({appId:"other-app",alreadyConsumed:false});
 assert.equal(await makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId})
  .verifyAppCheck("forged"),null);
});
test("SDK exceptions fail closed, never expose credentials or errors",async()=>{
 const deps=good();
 deps.auth.verifyIdToken=async()=>{throw Error("sensitive secret detail")};
 deps.appCheck.verifyToken=async()=>{throw Error("sensitive secret detail")};
 const v=makeFirebaseAdminVerifiers({...deps,projectId,firebaseAppId});
 assert.equal(await v.verifyAuth("bad"),null);
 assert.equal(await v.verifyAppCheck("bad"),null);
});
