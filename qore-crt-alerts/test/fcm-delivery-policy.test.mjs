import test from "node:test";
import assert from "node:assert/strict";
import {classifyFcmFailure,planReplayDryRun} from "../src/fcm-delivery-policy.mjs";
const held={eventKey:"OFFLINE|EURUSD|1|MSS_M15|2",status:"QUARANTINED_REPLAY",
 deliveryState:"BLOCKED_NOT_CERTIFIED",actionable:false,sendPush:false};
const device={handle:"f".repeat(64),
 expiresAt:Date.parse("2026-11-20T00:00:00Z"),
 deliveryState:"BLOCKED_NOT_CERTIFIED"};
const now=Date.parse("2026-11-01T00:00:00Z");
test("dry run is forever non-deliverable even with matching registration",()=>{
 const x=planReplayDryRun({observation:held,registration:device,at:now});
 assert.equal(x.state,"DRY_RUN_BLOCKED_NOT_CERTIFIED");
 assert.equal(x.transport,"DISABLED");
 assert.equal(x.certified,false);assert.equal(x.sendPush,false);
});
test("expired device and attempted live observation are blocked",()=>{
 assert.equal(planReplayDryRun({observation:held,registration:device,
  at:device.expiresAt}).state,"NO_FRESH_ELIGIBLE_REGISTRATION");
 assert.equal(planReplayDryRun({observation:{...held,sendPush:true},
  registration:device,at:now}).state,"INVALID_OR_NON_QUARANTINED_EVENT");
});
test("unregistered and credential mismatch errors stop retry",()=>{
 for(const code of ["UNREGISTERED","SENDER_ID_MISMATCH",
  "messaging/mismatched-credential","messaging/authentication-error"])
  assert.equal(classifyFcmFailure({code}).retry,false);
});
test("transient errors use bounded exponential dry-run retry",()=>{
 assert.equal(classifyFcmFailure({code:"UNAVAILABLE",attempt:0}).delayMs,1000);
 assert.equal(classifyFcmFailure({code:"UNAVAILABLE",attempt:3}).delayMs,8000);
 assert.equal(classifyFcmFailure({code:"UNAVAILABLE",attempt:5}).state,"RETRY_EXHAUSTED");
});
test("quota exceeded has sixty second minimum delay",()=>{
 assert.equal(classifyFcmFailure({code:"QUOTA_EXCEEDED"}).delayMs,60000);
 assert.equal(classifyFcmFailure({code:"QUOTA_EXCEEDED",attempt:1}).delayMs,120000);
});
test("retryAfterMs and errors fail closed",()=>{
 assert.equal(classifyFcmFailure({code:"messaging/server-unavailable",
   retryAfterMs:30000}).delayMs,30000);
 assert.equal(classifyFcmFailure({code:"UNKNOWN"}).state,"UNKNOWN_ERROR_BLOCKED");
 assert.equal(classifyFcmFailure({code:"UNKNOWN",attempt:-1}).state,"INVALID_FAILURE");
});
