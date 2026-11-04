import {ALERT_LIFETIME_MS} from "./qa-four-hour-inbox.mjs";

// Server-side preflight for a FUTURE, separate authenticated FCM sender.
// Deliberately DRY-RUN; it cannot send, enroll devices or create trades.
// Actual FCM data messages must set TTL to the REMAINING seconds only.
const held=(state,more={})=>Object.freeze({
 state,transport:"DISABLED",deliveryState:"BLOCKED_NOT_CERTIFIED",
 sendPush:false,actionable:false,...more
});
export function planFourHourDryRunDelivery({event,nowMs,invalidatedAtMs=null}={}){
 if(!event || event.mode!=="OFFLINE_REPLAY" ||
    event.certification!=="NOT_VERIFIED" ||
    event.deliveryState!=="BLOCKED_NOT_CERTIFIED" ||
    event.transport!=="DISABLED" || event.sendPush!==false ||
    event.actionable!==false || event.tvSymbol?.startsWith("IC:")!==true)
  return held("NON_QUARANTINED_EVENT_BLOCKED");
 const confirmedAtMs=event.eventAtMs;
 if(!Number.isSafeInteger(confirmedAtMs)||confirmedAtMs<=0||
    !Number.isSafeInteger(nowMs)||nowMs<=0||
    confirmedAtMs>Number.MAX_SAFE_INTEGER-ALERT_LIFETIME_MS)
  return held("INVALID_TIME");
 const expiresAtMs=confirmedAtMs+ALERT_LIFETIME_MS;
 if(invalidatedAtMs!==null)return held("INVALIDATED_EARLY",{expiresAtMs});
 if(confirmedAtMs>nowMs)return held("FUTURE_EVENT_BLOCKED",{expiresAtMs});
 if(nowMs>=expiresAtMs)return held("EXPIRED_NOT_SENDABLE",{expiresAtMs});
 // Rounding down prevents exceeding the actual absolute expiry.
 const ttlSeconds=Math.floor((expiresAtMs-nowMs)/1000);
 if(ttlSeconds<1)return held("TOO_LATE_TO_DELIVER",{expiresAtMs});
 if(ttlSeconds>14400)throw Error("INVALID_TTL_COMPUTATION");
 return held("QA_DRY_RUN_NOT_SENDABLE",{
  expiresAtMs,remainingMs:expiresAtMs-nowMs,
  wouldUseFcmTtlSeconds:ttlSeconds
 });
}
