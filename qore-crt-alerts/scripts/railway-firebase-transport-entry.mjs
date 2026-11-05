#!/usr/bin/env node
// Separate STAGING HTTP service (not the cTrader DEMO one-shot worker).
// NO trading. NO market push. NO inbound webhook that claims certification.
// Firebase Admin credentials are supplied privately at Railway runtime only.
import {qaFirebaseBridgeConfig,createQaFirebaseTransportServer}
  from "../src/qa-firebase-transport-bridge.mjs";

export async function createFirebaseAdminAdapters(env=process.env){
  const decoded=(typeof env.QORE_FIREBASE_SERVICE_ACCOUNT_JSON==="string"&&
     env.QORE_FIREBASE_SERVICE_ACCOUNT_JSON.length>100)?
      env.QORE_FIREBASE_SERVICE_ACCOUNT_JSON:
      (typeof env.QORE_FIREBASE_SERVICE_ACCOUNT_B64==="string"&&
       env.QORE_FIREBASE_SERVICE_ACCOUNT_B64.length>100)?
        Buffer.from(env.QORE_FIREBASE_SERVICE_ACCOUNT_B64,"base64").toString("utf8"):
        null;
  if(!decoded)throw Error("FIREBASE_SERVICE_ACCOUNT_NOT_CONFIGURED");
  let json;
  try{json=JSON.parse(decoded);}catch{throw Error("INVALID_SERVICE_ACCOUNT_JSON");}
  if(json?.type!=="service_account"||
     json.project_id!==env.QORE_FIREBASE_PROJECT_ID)
    throw Error("FIREBASE_PROJECT_MISMATCH");
  // Do not log the decoded key, access tokens, device tokens or payloads.
  const [{initializeApp,cert}, {getAuth}, {getAppCheck}, {getMessaging}] =
    await Promise.all([
      import("firebase-admin/app"),import("firebase-admin/auth"),
      import("firebase-admin/app-check"),import("firebase-admin/messaging")
    ]);
  const app=initializeApp({credential:cert(json),projectId:json.project_id},
    "qore-crt-alerts-qa-test");
  const auth={
    verifyIdToken:async token=>{
      const decoded=await getAuth(app).verifyIdToken(token,true);
      return {uid:decoded.uid};
    },
    verifyAppCheck:async token=>{
      const claims=await getAppCheck(app).verifyToken(token);
      return {appId:claims.appId??claims.token?.app_id??null};
    }
  };
  const sendTestMessage=async({token,data,ttlSeconds})=>{
    if(data.schema!=="QORE_QA_SYSTEM_TEST_V1"||
       data.kind!=="SYSTEM_TEST"||data.testOnly!=="true"||
       ttlSeconds!==60)
      throw Error("MARKET_FCM_SEND_FORBIDDEN");
    // FCM data-only; handset explicitly renders a QA TEST notification.
    const id=await getMessaging(app).send({
      token,data,android:{priority:"high",ttl:ttlSeconds*1000}
    });
    return {id};
  };
  return {auth,sendTestMessage};
}

export async function startQaTransport({
  env=process.env,
  factory=createFirebaseAdminAdapters,
  listener=server=>server.listen(Number(env.PORT||8080),"0.0.0.0")
}={}){
  const config=qaFirebaseBridgeConfig(env);
  if(!config.ready)
    return Object.freeze({state:"QA_BRIDGE_CONFIGURATION_PENDING",
      started:false,marketPush:false});
  const {auth,sendTestMessage}=await factory(env);
  const server=createQaFirebaseTransportServer({
    config,auth,sendTestMessage
  });
  listener(server);
  return {state:"QA_BRIDGE_STARTED_SYSTEM_TEST_ONLY",
    started:true,server,marketPush:false};
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
  try{
    const result=await startQaTransport();
    if(!result.started){
      process.stdout.write(JSON.stringify(result)+"\n");
      process.exitCode=0;
    } else {
      process.stdout.write(JSON.stringify({
        state:result.state,marketPush:false,
        eventTtlSeconds:14400,systemTestOnly:true
      })+"\n");
      process.on("SIGTERM",()=>result.server.close());
    }
  }catch{
    process.stderr.write("QA_BRIDGE_START_BLOCKED\n");
    process.exitCode=1;
  }
}
