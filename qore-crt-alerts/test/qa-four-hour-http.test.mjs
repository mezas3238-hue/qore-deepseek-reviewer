import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createQaFourHourHttpServer} from "../src/qa-four-hour-http.mjs";
import {QaFourHourInbox,ALERT_LIFETIME_MS} from "../src/qa-four-hour-inbox.mjs";
import {buildBlockedCrtMssInboxEvents} from "../src/qa-market-alert-bridge.mjs";

const c1=1793336400000, rat=c1+8*3600000;
const makeEvent=()=>buildBlockedCrtMssInboxEvents({
 instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
 direction:1,c1StartMs:c1,sweepAtMs:c1+5*3600000,
 c2RatifiedAtMs:rat,observedAtMs:rat+1200000,
 sourcePhaseMin:0,coreCrt:true,m5:{},m15:{}
})[0];
test("read-only HTTP QA responds with active events and removes exactly at 4h (no Internet)",async()=>{
 const event=makeEvent(), inbox=new QaFourHourInbox();
 let clock=event.eventAtMs+60_000;
 assert.equal(inbox.stage(event,{nowMs:clock}).state,"QA_STAGED_4H");
 const server=createQaFourHourHttpServer({inbox,now:()=>clock});
 server.listen(0,"127.0.0.1");
 await once(server,"listening");
 try {
  const url="http://127.0.0.1:"+server.address().port;
  const health=await fetch(url+"/qa/health");
  assert.equal(health.status,200);
  const healthBody=await health.json();
  assert.equal(healthBody.ttlMs,14_400_000);
  assert.equal(healthBody.transport,"DISABLED");
  assert.equal(healthBody.notifications,false);
  const active=await fetch(url+"/qa/v1/alerts");
  assert.equal(active.headers.get("cache-control"),"no-store");
  const list=await active.json();
  assert.equal(list.count,1);
  assert.equal(list.alerts[0].confirmedAtMs,event.eventAtMs);
  assert.equal(list.alerts[0].expiresAtMs,event.eventAtMs+ALERT_LIFETIME_MS);
  assert.equal(list.alerts[0].sendPush,false);
  assert.equal(list.alerts[0].actionable,false);
  assert.equal(list.alerts[0].remainingMs,ALERT_LIFETIME_MS-60_000);
  clock=event.eventAtMs+ALERT_LIFETIME_MS;
  const expired=await(await fetch(url+"/qa/v1/alerts")).json();
  assert.equal(expired.count,0);
  assert.equal(inbox.stagingCount,0);
  const denied=await fetch(url+"/qa/v1/alerts",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
  assert.equal(denied.status,405);
  assert.equal((await denied.json()).state,"READ_ONLY_QA");
  assert.equal((await fetch(url+"/fcm/send")).status,404);
  const browser=await fetch(url+"/qa/v1/alerts",{headers:{origin:"https://untrusted.example"}});
  assert.equal(browser.status,403);
  assert.equal((await browser.json()).state,"BROWSER_ORIGIN_BLOCKED");
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test("server cannot be created with unaudited store",()=>{
 assert.throws(()=>createQaFourHourHttpServer({inbox:{active:()=>[]}}));
});
