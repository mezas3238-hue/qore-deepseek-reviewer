import {createServer} from "node:http";
import {createHash} from "node:crypto";

// Loopback-only integration harness. It has NO external network clients,
// NO credential storage, NO production deployment or notification sender.
// Creating the server does not start a listener.
const CAP_BYTES=4096, WINDOW_MS=60000;
const noCache={
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "content-security-policy":"default-src 'none'"
};
const reply=(res,status,payload,extra={})=>{
  res.writeHead(status,{...noCache,...extra});
  res.end(JSON.stringify(payload));
};
const safe=(s)=>typeof s==="string"&&s.length>=12&&s.length<=4096&&
  !/[\r\n]/.test(s);
const local=(addr)=>addr==="127.0.0.1"||addr==="::1"||
  addr==="::ffff:127.0.0.1";
async function jsonBody(req){
  if(!req.headers["content-type"]?.toLowerCase().match(
    /^application\/json(?:\s*;\s*charset=utf-8)?$/))
    return {error:"UNSUPPORTED_MEDIA_TYPE"};
  if(Number(req.headers["content-length"]??0)>CAP_BYTES)
    return {error:"BODY_TOO_LARGE"};
  let size=0,text="";
  try{
    for await(const part of req){
      size+=part.length;
      if(size>CAP_BYTES)return {error:"BODY_TOO_LARGE"};
      text+=part.toString("utf8");
    }
    const value=JSON.parse(text);
    if(!value||Array.isArray(value)||typeof value!=="object")
      return {error:"INVALID_JSON_OBJECT"};
    return {value};
  }catch{return {error:"INVALID_JSON_OBJECT"};}
}
const status=(s)=>{
  if(s==="QA_REGISTERED"||s==="QA_INSTALLATION_ROTATED"||
     s==="QA_REGISTRATION_REFRESHED"||s==="QA_REVOKED"||
     s==="QA_NOT_FOUND"||s==="QA_REGISTRATIONS")return 200;
  if(s==="QA_DATABASE_UNAVAILABLE")return 503;
  if(s==="QA_CONFLICT_HELD")return 409;
  if(s==="AUTHENTICATION_REQUIRED"||s==="APP_CHECK_REQUIRED"||
     s==="APP_CHECK_INVALID")return 401;
  return 422;
};
export function createQaDeviceHttpServer({
  registry,verifyAppCheck,projectId,firebaseAppId,
  now=Date.now,requestsPerMinute=12
}={}){
  if(!registry||typeof registry.register!=="function"||
     typeof registry.revoke!=="function"||typeof registry.list!=="function"||
     typeof verifyAppCheck!=="function"||
     typeof projectId!=="string"||projectId.length<12||
     typeof firebaseAppId!=="string"||firebaseAppId.length<12||
     typeof now!=="function"||
     !Number.isSafeInteger(requestsPerMinute)||requestsPerMinute<1||
     requestsPerMinute>120)
    throw Error("QA registry, verifiers, IDs and bounded rate required");

  const buckets=new Map();
  return createServer(async(req,res)=>{
    try{
      if(!local(req.socket.remoteAddress)){
        return reply(res,403,{state:"LOOPBACK_ONLY"});
      }
      if(req.headers.origin||req.headers["access-control-request-method"])
        return reply(res,403,{state:"BROWSER_ORIGIN_BLOCKED"});
      if(req.url==="/qa/health"&&req.method==="GET")
        return reply(res,200,{state:"QA_OFFLINE",sendPush:false,
          deliveryState:"BLOCKED_NOT_CERTIFIED"});
      if(req.url!=="/qa/v1/devices")
        return reply(res,404,{state:"NOT_FOUND"});
      if(!["GET","POST","DELETE"].includes(req.method))
        return reply(res,405,{state:"METHOD_NOT_ALLOWED"},
          {allow:"GET, POST, DELETE"});
      const auth=req.headers.authorization;
      const credential=typeof auth==="string"&&auth.startsWith("Bearer ")?
        auth.slice(7):null;
      const check=req.headers["x-firebase-appcheck"];
      if(!safe(credential)||!safe(check))
        return reply(res,401,{state:"AUTHENTICATION_AND_APP_CHECK_REQUIRED"});

      // Bound two in-memory rate limits. Hash token pairs before storage.
      const timestamp=now();
      if(!Number.isSafeInteger(timestamp)||timestamp<=0)
        return reply(res,503,{state:"QA_CLOCK_UNAVAILABLE"});
      const bucketKey=createHash("sha256")
        .update(credential).update("|").update(check).digest("hex");
      for(const [key,rate] of buckets)
        if(rate.until<=timestamp)buckets.delete(key);
      if(!buckets.has(bucketKey)&&buckets.size>=2048)
        return reply(res,429,{state:"QA_RATE_CAPACITY_BLOCKED"});
      const rate=buckets.get(bucketKey);
      if(rate&&rate.count>=requestsPerMinute)
        return reply(res,429,{state:"QA_RATE_LIMITED"},{ "retry-after":"60"});
      buckets.set(bucketKey,rate?
        {count:rate.count+1,until:rate.until}:
        {count:1,until:timestamp+WINDOW_MS});

      // Registration consumes App Check inside QaDeviceRegistry; GET/DELETE
      // verify once here, avoiding double consumption of limited-use token.
      if(req.method!=="POST"){
        let valid=false;
        try{
          const attestation=await verifyAppCheck(check);
          valid=attestation?.verified===true&&
            attestation.projectId===projectId&&
            attestation.appId===firebaseAppId&&
            attestation.alreadyConsumed!==true;
        }catch{}
        if(!valid)return reply(res,401,{state:"APP_CHECK_INVALID"});
      }
      if(req.method==="GET"){
        if(req.headers["content-length"]&&Number(req.headers["content-length"])>0)
          return reply(res,400,{state:"BODY_NOT_ALLOWED"});
        const outcome=await registry.list({credential,now:timestamp});
        return reply(res,status(outcome.state),outcome);
      }
      const body=await jsonBody(req);
      if(body.error)return reply(res,body.error==="UNSUPPORTED_MEDIA_TYPE"?415:
        body.error==="BODY_TOO_LARGE"?413:400,{state:body.error});
      const data=body.value;
      const outcome=req.method==="POST"?
        await registry.register({credential,appCheckToken:check,projectId,
          deviceSlot:data.deviceSlot,installationId:data.installationId,
          optedIn:data.optedIn,expectedRevision:data.expectedRevision}):
        await registry.revoke({credential,deviceSlot:data.deviceSlot,
          expectedRevision:data.expectedRevision});
      return reply(res,status(outcome.state),outcome);
    }catch{
      return reply(res,503,{state:"QA_SERVICE_UNAVAILABLE"});
    }
  });
}
