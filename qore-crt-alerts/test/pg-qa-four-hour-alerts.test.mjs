import test from "node:test";
import assert from "node:assert/strict";
import {PgQaFourHourAlerts} from "../src/pg-qa-four-hour-alerts.mjs";
import {ALERT_LIFETIME_MS} from "../src/qa-four-hour-inbox.mjs";
import {buildBlockedCrtMssInboxEvents} from "../src/qa-market-alert-bridge.mjs";

const c1=1793336400000,rat=c1+8*3600000;
const event=buildBlockedCrtMssInboxEvents({
 instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
 direction:1,c1StartMs:c1,sweepAtMs:c1+5*3600000,
 c2RatifiedAtMs:rat,observedAtMs:rat+1200000,
 sourcePhaseMin:0,coreCrt:true,m5:{},m15:{}
})[0];
test("Postgres adapter stages only quarantined IC event with parametrized SQL",async()=>{
 let calls=[];
 const db={query:async(sql,params)=>{calls.push({sql,params});
   return {rows:[{state:"QA_STAGED_4H_NOT_SENDABLE"}]};}};
 const a=new PgQaFourHourAlerts({db});
 const r=await a.stage(event,{nowMs:event.eventAtMs+2000});
 assert.equal(r.state,"QA_STAGED_4H_NOT_SENDABLE");
 assert.equal(r.sendPush,false);
 assert.equal(r.expiresAtMs,event.eventAtMs+ALERT_LIFETIME_MS);
 assert.match(calls[0].sql,/\$1::jsonb/);
 assert.deepEqual(JSON.parse(calls[0].params[0]),event);
 assert.equal(calls.length,1);
});
test("expired/future/forged data never reach database",async()=>{
 let n=0;
 const db={query:async()=>{n++;return {rows:[]};}};
 const a=new PgQaFourHourAlerts({db});
 assert.equal((await a.stage(event,{nowMs:event.eventAtMs+ALERT_LIFETIME_MS})).state,
  "EXPIRED_NOT_RECORDED");
 assert.equal((await a.stage(event,{nowMs:event.eventAtMs-1})).state,
  "FUTURE_OR_MISSING_CONFIRMATION");
 assert.equal((await a.stage({...event,sendPush:true},{nowMs:event.eventAtMs})).state,
  "INVALID_QA_EVIDENCE");
 assert.equal(n,0);
});
test("SQL read of active alerts has strict DB expiry and invalidation predicates",async()=>{
 let readSql="",params;
 const db={query:async(sql,p)=>{readSql=sql;params=p;
   return {rows:[{event_key:event.eventId,family:event.family,
    confirmed_ms:String(event.eventAtMs),
    expires_ms:String(event.eventAtMs+ALERT_LIFETIME_MS),
    evidence:event}]};}};
 const a=new PgQaFourHourAlerts({db});
 const n=event.eventAtMs+60_000;
 const r=await a.active({nowMs:n});
 assert.equal(r.count,1);
 assert.equal(r.alerts[0].remainingMs,ALERT_LIFETIME_MS-60_000);
 assert.equal(r.alerts[0].actionable,false);
 assert.equal(r.alerts[0].sendPush,false);
 assert.match(readSql,/expires_at > to_timestamp\(\$1::double precision/);
 assert.match(readSql,/invalidated_at IS NULL/);
 assert.match(readSql,/LIMIT 500/);
 assert.deepEqual(params,[n]);
});
test("invalidation and purge are private parametrized functions, no push sender",async()=>{
 const queries=[];
 const db={query:async(sql,p)=>{queries.push({sql,p});return {
   rows:[{state:"QA_INVALIDATED_EARLY",removed:2}]};}};
 const a=new PgQaFourHourAlerts({db});
 const result=await a.invalidate({eventKey:event.eventId,family:event.family});
 assert.equal(result.state,"QA_INVALIDATED_EARLY");
 assert.deepEqual(queries[0].p,[event.eventId,event.family,"STRUCTURE_INVALIDATED"]);
 assert.match(queries[0].sql,/\$1,\$2,\$3/);
 const purged=await a.purge();
 assert.equal(purged.removed,2);
 assert.match(queries[1].sql,/qa_purge_4h_alerts/);
});
test("private mode enforced and no unhandled SQL errors leaked",async()=>{
 assert.throws(()=>new PgQaFourHourAlerts({db:{},mode:"LIVE"}));
 const a=new PgQaFourHourAlerts({db:{query:async()=>{throw Error("sensitive db state");}}});
 assert.equal((await a.stage(event,{nowMs:event.eventAtMs})).state,"QA_DATABASE_UNAVAILABLE");
 assert.deepEqual((await a.active({nowMs:event.eventAtMs})).alerts,[]);
});
