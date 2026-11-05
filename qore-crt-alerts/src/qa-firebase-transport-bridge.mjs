// QORE CRT Alerts G1 — authenticated staging bridge.
// Only a deliberately user-requested SYSTEM TEST can be sent via FCM.
// Market observations are quarantined, read-only and NEVER pushed.
// This module does not create a network listener until explicitly invoked.
import {createServer} from "node:http";
import {randomBytes} from "node:crypto";
import {QaFourHourInbox,ALERT_LIFETIME_MS} from "./qa-four-hour-inbox.mjs";

const TEST_MS=60_000;
const MAX_BODY=12_000;
const TTL_MS=4*60*60*1000;
const headers={
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "content-security-policy":"default-src 'none'"
};
const respond=(res,code,body)=>{
  res.writeHead(code,headers);
  res.end(JSON.stringify(body));
};
const positive=n=>Number.isSafeInteger(n)&&n>0;
const legalToken=s=>typeof s==="string"&&s.length>=80&&s.length<=4096&&
  /^[A-Za-z0-9:_-]+$/.test(s);
const legalUid=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{6,128}$/.test(s);
const noPush=(more={})=>Object.freeze({
  transport:"BLOCKED_MARKET_PUSH",marketPush:false,
  trading:false,sourceCertified:false,...more
});
const isLoopback=x=>x==="127.0.0.1"||x==="::1"||x==="::ffff:127.0.0.1";
export function qaFirebaseBridgeConfig(env={}) {
  const cfg={
    stage:env.QORE_CT_STAGE==="DEMO"&&env.QORE_TRADING_ENABLED==="false"&&
      env.QORE_PUSH_ENABLED==="false"&&env.NODE_ENV!=="production"&&
      env.QORE_PROVIDER==="IC"&&env.QORE_ALERT_TTL_SECONDS==="14400",
    testEnabled:env.QORE_QA_SYSTEM_TEST_ENABLED==="true",
    ownerUid:env.QORE_QA_OWNER_UID??"",
    firebaseAppId:env.QORE_FIREBASE_APP_ID??"",
    firebaseProjectId:env.QORE_FIREBASE_PROJECT_ID??""
  };
  return Object.freeze({...cfg,ready:cfg.stage&&cfg.testEnabled&&
    legalUid(cfg.ownerUid)&&/^[A-Za-z0-9:._-]{12,128}$/.test(cfg.firebaseAppId)&&
    /^[a-z][a-z0-9-]{5,63}$/.test(cfg.firebaseProjectId)});
}
async function bodyJson(req){
  const chunks=[];let total=0;
  for await (const chunk of req){
    total+=chunk.length;
    if(total>MAX_BODY)throw Error("BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  if(!total) return {};
  const result=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if(!result||typeof result!=="object"||Array.isArray(result))throw Error("BAD_JSON_BODY");
  return result;
}
function makeStore() {
  const byUid=new Map();
  return {
    enroll(uid,token) {
      byUid.set(uid,{token});
    },
    get(uid){return byUid.get(uid)?.token??null;},
    remove(uid){return byUid.delete(uid);}
  };
}
// Auth adapter contract:
// verifyIdToken(string) -> {uid}, verifyAppCheck(string) -> {appId}
// sendTestMessage({token,data,ttlSeconds}) -> Promise<{id}>
// Real adapter always uses Firebase Admin verification (see adapter below).
export function createQaFirebaseTransportServer({
  config,auth,sendTestMessage,now=Date.now,devices=makeStore(),
  inbox=new QaFourHourInbox({maxEvents:1024})
}={}) {
  if(!config||!auth||typeof auth.verifyIdToken!=="function"||
    typeof auth.verifyAppCheck!=="function"||
    typeof sendTestMessage!=="function"||typeof now!=="function"||
    !inbox || !(inbox instanceof QaFourHourInbox))
    throw Error("QA_BRIDGE_DEPENDENCIES_REQUIRED");
  const lastTest=new Map();
  return createServer(async(req,res)=>{
    try {
      if(req.headers.origin||req.headers["access-control-request-method"])
        return respond(res,403,noPush({state:"BROWSER_ORIGIN_BLOCKED"}));
      if(!isLoopback(req.socket.remoteAddress)&&
        req.headers["x-forwarded-proto"]!=="https")
        return respond(res,403,noPush({state:"HTTPS_REQUIRED"}));
      if(req.url==="/qa/health"&&req.method==="GET")
        return respond(res,200,noPush({state:config.ready?
          "QA_TRANSPORT_READY_NO_MARKET_PUSH":"AWAITING_SECURE_FIREBASE_SETUP",
          testEnabled:Boolean(config.ready),ttlMs:ALERT_LIFETIME_MS}));
      if(!config.ready)return respond(res,503,noPush({state:"QA_TRANSPORT_DISABLED"}));
      const routes={
        "POST /qa/v1/device/enroll":true,
        "POST /qa/v1/device/unregister":true,
        "POST /qa/v1/system/test-ping":true,
        "POST /qa/v1/observation/stage":true,
        "GET /qa/v1/alerts":true
      };
      const route=req.method+" "+req.url;
      if(!routes[route])return respond(res,404,noPush({state:"NOT_FOUND"}));
      const match=/^Bearer ([A-Za-z0-9._-]{40,8192})$/.exec(
        req.headers.authorization??"");
      const appCheck=req.headers["x-firebase-appcheck"];
      if(!match||typeof appCheck!=="string"||appCheck.length<40||
        appCheck.length>8192)
        return respond(res,401,noPush({state:"AUTH_AND_APP_CHECK_REQUIRED"}));
      let user,attestation;
      try{
        [user,attestation]=await Promise.all([
          auth.verifyIdToken(match[1]),
          auth.verifyAppCheck(appCheck)
        ]);
      }catch{return respond(res,401,noPush({state:"INVALID_IDENTITY_OR_ATTESTATION"}));}
      if(user?.uid!==config.ownerUid||attestation?.appId!==config.firebaseAppId)
        return respond(res,403,noPush({state:"NOT_OWNER_OR_WRONG_APP"}));
      const stamp=now();
      if(!positive(stamp)||stamp>Number.MAX_SAFE_INTEGER-TTL_MS)
        return respond(res,503,noPush({state:"CLOCK_UNAVAILABLE"}));
      const uid=user.uid;
      if(route==="GET /qa/v1/alerts"){
        return respond(res,200,noPush({state:"QA_ONLY_4H_INBOX",
          count:inbox.active({nowMs:stamp}).length,
          alerts:inbox.active({nowMs:stamp})}));
      }
      let body;
      try{body=await bodyJson(req);}catch{
        return respond(res,400,noPush({state:"INVALID_OR_OVERSIZE_JSON"}));
      }
      if(route==="POST /qa/v1/device/enroll"){
        if(!legalToken(body.deviceToken))
          return respond(res,400,noPush({state:"INVALID_DEVICE_TOKEN"}));
        devices.enroll(uid,body.deviceToken);
        return respond(res,200,noPush({state:"ENROLLED_QA_TEST_ONLY",uid}));
      }
      if(route==="POST /qa/v1/device/unregister"){
        devices.remove(uid);
        return respond(res,200,noPush({state:"QA_DEVICE_UNREGISTERED"}));
      }
      if(route==="POST /qa/v1/observation/stage"){
        if(!body.event||typeof body.event!=="object"||Array.isArray(body.event))
          return respond(res,400,noPush({state:"QA_EVENT_REQUIRED"}));
        const result=inbox.stage(body.event,{nowMs:stamp});
        return respond(res,result.state==="QA_STAGED_4H"?201:422,noPush({
          state:result.state,expiresAtMs:result.expiresAtMs??null
        }));
      }
      if(route==="POST /qa/v1/system/test-ping"){
        const token=devices.get(uid);
        if(!token)return respond(res,409,noPush({state:"DEVICE_NOT_ENROLLED"}));
        if(lastTest.has(uid)&&stamp-lastTest.get(uid)<30_000)
          return respond(res,429,noPush({state:"QA_TEST_RATE_LIMIT"}));
        if(Object.keys(body).length>0)
          return respond(res,400,noPush({state:"QA_TEST_TAKES_NO_MARKET_FIELDS"}));
        const nonce=randomBytes(12).toString("hex");
        const data={
          schema:"QORE_QA_SYSTEM_TEST_V1",kind:"SYSTEM_TEST",
          testOnly:"true",sentAtMs:String(stamp),
          expiresAtMs:String(stamp+TEST_MS),nonce
        };
        try {
          await sendTestMessage({token,data,ttlSeconds:60});
        }catch {
          return respond(res,502,noPush({state:"QA_FCM_DELIVERY_REQUEST_FAILED"}));
        }
        lastTest.set(uid,stamp);
        return respond(res,202,noPush({
          state:"QA_TEST_ACCEPTED_BY_FCM_NOT_DEVICE_CONFIRMED",
          expiresAtMs:stamp+TEST_MS
        }));
      }
    }catch {
      return respond(res,500,noPush({state:"QA_BRIDGE_INTERNAL_FAILURE"}));
    }
  });
}
export const QA_SYSTEM_TEST_TTL_MS=TEST_MS;
