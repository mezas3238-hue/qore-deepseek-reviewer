// PostgreSQL QA-only, permanently blocked event/device intent staging.
// No FCM SDK, tokens, transport or authorization to publish a signal.
// PostgreSQL 005 enforces existence, expiry, revocation and immutable dedup.
const hex=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const result=(state,extra={})=>Object.freeze({
  state,environment:"OFFLINE_REPLAY",actionable:false,sendPush:false,
  transport:"DISABLED",deliveryState:"BLOCKED_NOT_CERTIFIED",...extra
});
export class PgQaBlockedDeliveryIntents {
  #db;
  constructor({db,mode="OFFLINE_REPLAY"}={}){
    if(mode!=="OFFLINE_REPLAY"||typeof db?.query!=="function")
      throw Error("offline-only PostgreSQL executor required");
    this.#db=db;
  }
  async stage({observation,registration}={}){
    if(!observation||observation.status!=="QUARANTINED_REPLAY"||
       observation.deliveryState!=="BLOCKED_NOT_CERTIFIED"||
       observation.actionable!==false||observation.sendPush!==false||
       !hex(observation.fingerprint)||
       typeof observation.eventKey!=="string"||
       observation.eventKey.length<1||observation.eventKey.length>512)
      return result("INVALID_QUARANTINED_EVENT");
    if(!registration||!hex(registration.handle)||
       registration.deliveryState!=="BLOCKED_NOT_CERTIFIED")
      return result("INVALID_QA_REGISTRATION");
    try{
      const r=await this.#db.query(
        "SELECT qore_crt_alerts.qa_stage_blocked_delivery_intent($1,$2,$3) AS state",
        [observation.eventKey,registration.handle,observation.fingerprint]);
      const s=r?.rows?.[0]?.state;
      if(s==="QA_INTENT_RECORDED_NOT_SENDABLE")
        return result("QA_INTENT_RECORDED_NOT_SENDABLE",{
          eventKey:observation.eventKey,deviceHandle:registration.handle});
      if(s==="DUPLICATE_IGNORED")return result("DUPLICATE_IGNORED",{
        eventKey:observation.eventKey,deviceHandle:registration.handle});
      return result("QA_DATABASE_UNAVAILABLE");
    }catch(e){
      // No SQL error message is ever exposed, even with expected rejections.
      if(e?.code==="23514" && typeof e?.message==="string" &&
         (e.message.startsWith("QA_INTENT_BLOCKED:")||
          e.message.startsWith("QA_INTENT_CONFLICT:")))
        return result("QA_INTENT_HELD");
      return result("QA_DATABASE_UNAVAILABLE");
    }
  }
}
