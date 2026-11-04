// QORE CRT ALERTS — 4-hour QA inbox. NO LIVE / NO FCM.
// Read-only replay observations; never interprets QA as a trade entry.
import {BlockedQaInbox} from "./qa-market-alert-bridge.mjs";

export const ALERT_LIFETIME_MS = 4 * 60 * 60 * 1000;
const HELD = "BLOCKED_NOT_CERTIFIED";
const positive = n => Number.isSafeInteger(n) && n > 0;
const result = (state, more={}) => Object.freeze({
  state, transport:"DISABLED", deliveryState:HELD,
  sendPush:false, actionable:false, ...more
});
const validClock = now => positive(now) && now + ALERT_LIFETIME_MS <= Number.MAX_SAFE_INTEGER;

// This store is intentionally bounded and in memory; Supabase/Postgres
// receives an independent private staging table and the same TTL policy.
// Expiration means earliest of 4h from CONFIRMED BAR or invalidation;
// never extend on mobile open, retries, persistence or new MSS events.
export class QaFourHourInbox {
  #rows = new Map();
  #max;
  constructor({maxEvents=1024}={}) {
    if(!Number.isSafeInteger(maxEvents) || maxEvents<1 || maxEvents>10000)
      throw Error("INVALID_INBOX_CAPACITY");
    this.#max=maxEvents;
  }
  #sweep(nowMs) {
    for(const [key,row] of this.#rows)
      if(row.expiresAtMs<=nowMs)this.#rows.delete(key);
  }
  stage(event,{nowMs}={}) {
    if(!validClock(nowMs))return result("INVALID_SERVER_CLOCK");
    this.#sweep(nowMs);
    // Delegate exact event/cycle/provider/family/causality wire checks to
    // the existing, established QA bridge. Cannot stage forged LIVE data.
    try { new BlockedQaInbox().record(event); }
    catch { return result("INVALID_QA_EVIDENCE"); }
    if(!positive(event.eventAtMs) || event.eventAtMs>nowMs)
      return result("FUTURE_OR_MISSING_CONFIRMATION");
    const expiresAtMs=event.eventAtMs+ALERT_LIFETIME_MS;
    if(!Number.isSafeInteger(expiresAtMs) || expiresAtMs<=nowMs)
      return result("EXPIRED_NOT_RECORDED");
    const scopedKey=event.eventId+"|"+event.family;
    const existing=this.#rows.get(scopedKey);
    if(existing) {
      const same=JSON.stringify(existing.event)===JSON.stringify(event);
      return result(same?"DUPLICATE_NOT_RENOTIFIED":"CONFLICT_HELD",{
        scopedKey,expiresAtMs:existing.expiresAtMs,inserted:false
      });
    }
    if(this.#rows.size>=this.#max)return result("INBOX_CAPACITY_BLOCKED");
    const row=Object.freeze({
      scopedKey,
      confirmedAtMs:event.eventAtMs,
      expiresAtMs,
      invalidatedAtMs:null,
      invalidationReason:null,
      event:Object.freeze({...event})
    });
    this.#rows.set(scopedKey,row);
    return result("QA_STAGED_4H",{
      scopedKey,confirmedAtMs:event.eventAtMs,expiresAtMs,inserted:true
    });
  }
  invalidate({scopedKey,nowMs,reason="STRUCTURE_INVALIDATED"}={}) {
    if(!validClock(nowMs))return result("INVALID_SERVER_CLOCK");
    this.#sweep(nowMs);
    if(typeof scopedKey!=="string" || !/^[A-Za-z0-9_.:|+-]{12,512}$/.test(scopedKey))
      return result("INVALID_EVENT_ID");
    if(typeof reason!=="string" || !/^[A-Z][A-Z0-9_]{2,47}$/.test(reason))
      return result("INVALID_INVALIDATION_REASON");
    const row=this.#rows.get(scopedKey);
    if(!row)return result("NOT_ACTIVE_OR_EXPIRED");
    if(row.invalidatedAtMs!==null)return result("ALREADY_INVALIDATED",{scopedKey});
    this.#rows.set(scopedKey,Object.freeze({
      ...row,invalidatedAtMs:nowMs,invalidationReason:reason
    }));
    // Keep a small tombstone only UNTIL the original 4h expiry to prevent
    // identical replay reactivation. Never retain a 7/30-day event history.
    return result("INVALIDATED_EARLY",{scopedKey,expiresAtMs:row.expiresAtMs});
  }
  active({nowMs}={}) {
    if(!validClock(nowMs))throw Error("INVALID_SERVER_CLOCK");
    this.#sweep(nowMs);
    return Object.freeze([...this.#rows.values()]
      .filter(x=>x.invalidatedAtMs===null && x.confirmedAtMs<=nowMs && x.expiresAtMs>nowMs)
      .sort((a,b)=>b.confirmedAtMs-a.confirmedAtMs)
      .map(x=>Object.freeze({
        ...x.event, confirmedAtMs:x.confirmedAtMs,expiresAtMs:x.expiresAtMs,
        remainingMs:x.expiresAtMs-nowMs,
        deliveryState:HELD,transport:"DISABLED",
        sendPush:false,actionable:false
      })));
  }
  // Inspection only; includes early-invalidated tombstones until their
  // original expiry, never a public response or a notification queue.
  get stagingCount(){return this.#rows.size;}
  sweep({nowMs}={}){
    if(!validClock(nowMs))throw Error("INVALID_SERVER_CLOCK");
    const before=this.#rows.size;
    this.#sweep(nowMs);
    return result("QA_EXPIRED_PURGED",{removed:before-this.#rows.size});
  }
}
