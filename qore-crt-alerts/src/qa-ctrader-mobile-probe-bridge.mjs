// One-shot signed cTrader DEMO proof to a separately configured QORE Mobile
// STAGING gateway. NOT a CRT/MSS event, not push, no token/market price export.
// Source = already-authenticated view-only QA inventory/historical probe.
import {createHash,createHmac,randomUUID} from "node:crypto";

const PATH="/v1/admin/crt/ctrader-demo-probe";
const RESULTS=new Set(["INVENTORY_QA_ONLY","HISTORICAL_M5_QA_UNCERTIFIED"]);
const blocked=state=>Object.freeze({state,published:false,
 sourceParityCertified:false,sendPush:false,canTrade:false});

export function mobileProbeBridgeGuard(env={}){
 if(env.QORE_CT_STAGE!=="DEMO"||env.QORE_CT_OAUTH_SCOPE!=="accounts"||
    env.QORE_PROVIDER!=="IC"||env.QORE_TRADING_ENABLED!=="false"||
    env.QORE_PUSH_ENABLED!=="false"||
    env.QORE_CT_QA_PROBE!=="OWNER_APPROVED_VIEW_ONLY")
  return "BLOCKED_UNSAFE_VIEW_SCOPE";
 if(env.QORE_CTRADER_QA_MOBILE_BRIDGE!=="OWNER_APPROVED_PROBE_ONLY")
  return "AWAITING_OWNER_QA_BRIDGE_AUTHORIZATION";
 const secret=env.QORE_CTRADER_DEMO_PROBE_HMAC_SECRET;
 if(typeof secret!=="string"||Buffer.byteLength(secret)<32)
  return "AWAITING_QA_BRIDGE_HMAC_SECRET";
 let url;
 try{url=new URL(env.QORE_CTRADER_QA_GATEWAY_URL);}
 catch{return "AWAITING_QA_STAGING_GATEWAY_URL";}
 // Avoid posting staging observations into the operational production gateway.
 if(url.protocol!=="https:" || url.username || url.password ||
    url.search || url.hash || url.pathname!=="/" ||
    !(url.hostname.endsWith(".up.railway.app") &&
       /staging|qa/i.test(url.hostname) &&
       !/production/i.test(url.hostname)))
  return "BLOCKED_UNSAFE_STAGING_URL";
 return "QA_BRIDGE_READY";
}

export async function publishQaProbe({
  env=process.env,probe,fetchImpl=globalThis.fetch,
  now=Date.now,nonceFn=randomUUID
}={}){
 const gate=mobileProbeBridgeGuard(env);
 if(gate!=="QA_BRIDGE_READY")return blocked(gate);
 if(!probe||probe.connected!==true||
    !RESULTS.has(probe.state)||probe.sendPush!==false||
    probe.canTrade!==false||probe.sourceParityCertified!==false)
  return blocked("NO_AUTHENTICATED_DEMO_QA_PROBE");
 const symbols=Number.isSafeInteger(probe.symbolsObserved)?
  probe.symbolsObserved:0;
 const count=Number.isSafeInteger(probe.m5ClosedBars)?probe.m5ClosedBars:0;
 if(symbols<0||symbols>3000||count<0||count>500||
    (probe.state==="INVENTORY_QA_ONLY"&&count!==0)||
    (probe.state==="HISTORICAL_M5_QA_UNCERTIFIED"&&count===0))
  return blocked("QA_PROBE_COUNT_INVALID");
 const at=now();
 if(!Number.isSafeInteger(at)||at<=0)return blocked("QA_CLOCK_INVALID");
 const nonce=nonceFn();
 if(typeof nonce!=="string"||!/^[a-f0-9-]{32,64}$/.test(nonce))
  return blocked("QA_NONCE_INVALID");
 const body=JSON.stringify({
  schema:"QORE_CTRADER_IC_DEMO_PROBE_V1",
  source:"CTRADER_OPEN_API_DEMO",
  environment:"DEMO",
  oauthScope:"accounts",
  accountIsLive:false,
  broker:"IC Markets",
  probeState:probe.state,
  observedAtMs:at,
  symbolsObserved:symbols,
  closedM5Observed:count,
  sourceParityCertified:false,
  marketSignalsEnabled:false,
  sendPush:false,canTrade:false
 });
 const time=String(at);
 const canonical=["POST",PATH,time,nonce,
  createHash("sha256").update(body).digest("hex")].join("\n");
 const signature=createHmac("sha256",env.QORE_CTRADER_DEMO_PROBE_HMAC_SECRET)
  .update(canonical).digest("hex");
 const target=new URL(PATH,env.QORE_CTRADER_QA_GATEWAY_URL).toString();
 try{
  const result=await fetchImpl(target,{
   method:"POST",
   headers:{
    "content-type":"application/json",
    "X-Qore-Ctrader-Time":time,
    "X-Qore-Ctrader-Nonce":nonce,
    "X-Qore-Ctrader-Signature":"v1="+signature
   },
   body,
   signal:AbortSignal.timeout(8_000)
  });
  if(result?.status!==202)return blocked("QA_GATEWAY_REJECTED_PROBE");
  // HTTP 202 confirms acceptance only; does not imply device delivery.
  return Object.freeze({state:"QA_PROBE_ACCEPTED_NOT_CERTIFIED",
    published:true,sourceParityCertified:false,sendPush:false,canTrade:false});
 }catch{return blocked("QA_GATEWAY_UNREACHABLE");}
}
