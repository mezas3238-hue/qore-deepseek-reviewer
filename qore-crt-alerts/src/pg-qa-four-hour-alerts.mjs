// Private PostgreSQL adapter for 006_qa_four_hour_alerts.sql.
// Caller injects privileged server-only DB pool. No FCM or trading routes.
import {QaFourHourInbox} from "./qa-four-hour-inbox.mjs";

const held=(state,extra={})=>Object.freeze({
 state,sendPush:false,actionable:false,
 transport:"DISABLED",deliveryState:"BLOCKED_NOT_CERTIFIED",...extra
});
const validClock=t=>Number.isSafeInteger(t)&&t>0;
const validId=e=>typeof e==="string"&&e.length>=16&&e.length<=512;
export class PgQaFourHourAlerts {
 #db;
 constructor({db,mode="OFFLINE_REPLAY"}={}){
  if(mode!=="OFFLINE_REPLAY"||typeof db?.query!=="function")
   throw Error("PRIVATE_QA_POSTGRES_EXECUTOR_REQUIRED");
  this.#db=db;
 }
 async stage(event,{nowMs}={}){
  // Same validation as existing blocked replay bridge before SQL.
  const local=new QaFourHourInbox({maxEvents:1}).stage(event,{nowMs});
  if(local.state!=="QA_STAGED_4H")return local;
  try{
   const r=await this.#db.query(
    "SELECT qore_crt_alerts.qa_stage_4h_alert($1::jsonb) AS state",
    [JSON.stringify(event)]);
   const state=r?.rows?.[0]?.state;
   if(!["QA_STAGED_4H_NOT_SENDABLE","QA_DUPLICATE_NOT_RENEWED","QA_EXPIRED_OR_FUTURE_NOT_RECORDED"].includes(state))
    return held("QA_DATABASE_UNAVAILABLE");
   return held(state,{eventId:event.eventId,expiresAtMs:local.expiresAtMs});
  }catch(e){
   if(e?.code==="23514")return held("QA_CONFLICT_OR_INVALID_EVIDENCE");
   return held("QA_DATABASE_UNAVAILABLE");
  }
 }
 async active({nowMs}={}){
  if(!validClock(nowMs))return held("INVALID_SERVER_CLOCK",{alerts:[]});
  try{
   const sql=[
    "SELECT event_key,family,instrument_id,tv_symbol,event_type,evidence,",
    " (EXTRACT(EPOCH FROM confirmed_at)*1000)::bigint AS confirmed_ms,",
    " (EXTRACT(EPOCH FROM expires_at)*1000)::bigint AS expires_ms",
    "FROM qore_crt_alerts.qa_alerts_4h",
    "WHERE confirmed_at <= to_timestamp($1::double precision / 1000.0)",
    "AND expires_at > to_timestamp($1::double precision / 1000.0)",
    "AND invalidated_at IS NULL",
    "ORDER BY confirmed_at DESC LIMIT 500"
   ].join(" ");
   const r=await this.#db.query(sql,[nowMs]);
   const alerts=(r?.rows??[]).map(row=>Object.freeze({
    ...row.evidence,eventId:row.event_key,family:row.family,
    confirmedAtMs:Number(row.confirmed_ms),expiresAtMs:Number(row.expires_ms),
    remainingMs:Math.max(0,Number(row.expires_ms)-nowMs),
    sendPush:false,actionable:false,transport:"DISABLED",
    deliveryState:"BLOCKED_NOT_CERTIFIED"
   }));
   return held("QA_ACTIVE_4H",{alerts:Object.freeze(alerts),count:alerts.length});
  }catch{return held("QA_DATABASE_UNAVAILABLE",{alerts:[]});}
 }
 async invalidate({eventKey,family,reason="STRUCTURE_INVALIDATED"}={}){
  if(!validId(eventKey)||typeof family!=="string"||family.length>64||
    !/^[A-Z][A-Z0-9_]{2,47}$/.test(reason))
   return held("INVALID_INVALIDATION_REQUEST");
  try{
   const r=await this.#db.query(
    "SELECT qore_crt_alerts.qa_invalidate_4h_alert($1,$2,$3) AS state",
    [eventKey,family,reason]);
   const state=r?.rows?.[0]?.state;
   if(!["QA_INVALIDATED_EARLY","QA_ALREADY_INVALIDATED","QA_NOT_ACTIVE_OR_EXPIRED"].includes(state))
    return held("QA_DATABASE_UNAVAILABLE");
   return held(state,{eventKey,family});
  }catch{return held("QA_DATABASE_UNAVAILABLE");}
 }
 async purge(){
  try{
   const r=await this.#db.query(
    "SELECT qore_crt_alerts.qa_purge_4h_alerts() AS removed");
   const removed=Number(r?.rows?.[0]?.removed);
   if(!Number.isSafeInteger(removed)||removed<0)return held("QA_DATABASE_UNAVAILABLE");
   return held("QA_EXPIRED_PURGED",{removed});
  }catch{return held("QA_DATABASE_UNAVAILABLE");}
 }
}
