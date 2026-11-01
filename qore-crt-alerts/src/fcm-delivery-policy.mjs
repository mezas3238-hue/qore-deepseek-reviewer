// Policy-only error classification; no Firebase Admin SDK, HTTP or sender.
// This dry-run cannot transmit even if all inputs claim to be certified.
const terminal=new Set([
  "UNREGISTERED","SENDER_ID_MISMATCH",
  "messaging/registration-token-not-registered",
  "messaging/invalid-argument","messaging/mismatched-credential",
  "messaging/authentication-error"
]);
const retryable=new Set(["QUOTA_EXCEEDED","UNAVAILABLE","INTERNAL",
  "messaging/server-unavailable","messaging/internal-error",
  "messaging/unknown-error"]);
const result=(state,more={})=>Object.freeze({
  state,transport:"DISABLED",actionable:false,sendPush:false,...more});
export function classifyFcmFailure({code,attempt=0,retryAfterMs=null}={}){
  if(typeof code!=="string"||!Number.isSafeInteger(attempt)||
     attempt<0||attempt>20||
     (retryAfterMs!==null&&(!Number.isSafeInteger(retryAfterMs)||retryAfterMs<0)))
    return result("INVALID_FAILURE");
  if(terminal.has(code))return result("STOP_AND_REVIEW_REGISTRATION",
    {retry:false,reason:code});
  if(!retryable.has(code))return result("UNKNOWN_ERROR_BLOCKED",
    {retry:false,reason:code});
  if(attempt>=5)return result("RETRY_EXHAUSTED",{retry:false,reason:code});
  const minimum=code==="QUOTA_EXCEEDED"?60000:1000;
  return result("RETRY_PROPOSED_DRY_RUN",{
    retry:true,attempt:attempt+1,
    delayMs:Math.max(minimum*2**attempt,retryAfterMs??0),reason:code});
}
export function planReplayDryRun({observation,registration,at}={}){
  if(!Number.isSafeInteger(at)||at<=0)return result("INVALID_TIME");
  if(!observation||observation.status!=="QUARANTINED_REPLAY"||
     observation.deliveryState!=="BLOCKED_NOT_CERTIFIED"||
     observation.actionable!==false||observation.sendPush!==false)
    return result("INVALID_OR_NON_QUARANTINED_EVENT");
  if(!registration||registration.deliveryState!=="BLOCKED_NOT_CERTIFIED"||
     typeof registration.handle!=="string"||
     !Number.isSafeInteger(registration.expiresAt)||
     registration.expiresAt<=at)
    return result("NO_FRESH_ELIGIBLE_REGISTRATION");
  return result("DRY_RUN_BLOCKED_NOT_CERTIFIED",{
    eventId:observation.eventKey,deviceHandle:registration.handle,
    wouldBeTimeframe:"M15",certified:false});
}
