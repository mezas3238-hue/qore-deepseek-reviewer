import {createServer} from "node:http";
import {QaFourHourInbox,ALERT_LIFETIME_MS} from "./qa-four-hour-inbox.mjs";

// LOCAL QA HTTP preview. The returned server is NOT started automatically.
// NO POST/FCM/market subscription and no Internet/public HTTP endpoint.
// For a future remote API, Firebase Auth + App Check + TLS are mandatory.
const headers={
 "content-type":"application/json; charset=utf-8",
 "cache-control":"no-store",
 "x-content-type-options":"nosniff",
 "referrer-policy":"no-referrer",
 "content-security-policy":"default-src 'none'"
};
const local=addr=>addr==="127.0.0.1"||addr==="::1"||addr==="::ffff:127.0.0.1";
const reply=(res,code,body,more={})=>{
 res.writeHead(code,{...headers,...more});
 res.end(JSON.stringify(body));
};
export function createQaFourHourHttpServer({
 inbox=new QaFourHourInbox(),now=Date.now
}={}){
 if(!(inbox instanceof QaFourHourInbox)||typeof now!=="function")
  throw Error("QA_LOCAL_INBOX_AND_CLOCK_REQUIRED");
 return createServer((req,res)=>{
  if(!local(req.socket.remoteAddress))
    return reply(res,403,{state:"LOOPBACK_ONLY"});
  if(req.headers.origin||req.headers["access-control-request-method"])
    return reply(res,403,{state:"BROWSER_ORIGIN_BLOCKED"});
  if(req.method!=="GET")
    return reply(res,405,{state:"READ_ONLY_QA"},{allow:"GET"});
  const stamp=now();
  if(!Number.isSafeInteger(stamp)||stamp<=0)
    return reply(res,503,{state:"CLOCK_UNAVAILABLE"});
  if(req.url==="/qa/health")
    return reply(res,200,{state:"QA_READY_NO_PUSH",transport:"DISABLED",
      liveFeed:false,notifications:false,ttlMs:ALERT_LIFETIME_MS});
  if(req.url==="/qa/v1/alerts") {
    try{
      const alerts=inbox.active({nowMs:stamp});
      return reply(res,200,{state:"QA_ACTIVE_4H",nowMs:stamp,
        ttlMs:ALERT_LIFETIME_MS,count:alerts.length,alerts});
    }catch{return reply(res,503,{state:"QA_CLOCK_UNAVAILABLE"});}
  }
  return reply(res,404,{state:"NOT_FOUND"});
 });
}
