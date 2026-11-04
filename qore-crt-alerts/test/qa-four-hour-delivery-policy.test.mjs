import test from "node:test";
import assert from "node:assert/strict";
import {planFourHourDryRunDelivery} from "../src/qa-four-hour-delivery-policy.mjs";
import {buildBlockedCrtMssInboxEvents} from "../src/qa-market-alert-bridge.mjs";
const c1=1793336400000,rat=c1+8*3600000;
const event=buildBlockedCrtMssInboxEvents({
 instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
 direction:1,c1StartMs:c1,sweepAtMs:c1+5*3600000,
 c2RatifiedAtMs:rat,observedAtMs:rat+1200000,
 sourcePhaseMin:0,coreCrt:true,m5:{},m15:{}
})[0];
test("FCM preflight returns DRY-RUN only and TTL from remaining seconds",()=>{
 const a=planFourHourDryRunDelivery({event,nowMs:event.eventAtMs});
 assert.equal(a.state,"QA_DRY_RUN_NOT_SENDABLE");
 assert.equal(a.wouldUseFcmTtlSeconds,14_400);
 assert.equal(a.sendPush,false);
 assert.equal(a.transport,"DISABLED");
 const b=planFourHourDryRunDelivery({event,nowMs:event.eventAtMs+4500});
 assert.equal(b.wouldUseFcmTtlSeconds,14395);
 assert.equal(b.expiresAtMs,event.eventAtMs+14_400_000);
 assert.equal(planFourHourDryRunDelivery({event,nowMs:event.eventAtMs+14_399_001}).state,
  "TOO_LATE_TO_DELIVER");
});
test("expired, invalidated, future, uncertified and provider-switched events never send",()=>{
 const at=event.eventAtMs;
 assert.equal(planFourHourDryRunDelivery({event,nowMs:at+14_400_000}).state,"EXPIRED_NOT_SENDABLE");
 assert.equal(planFourHourDryRunDelivery({event,nowMs:at+1000,invalidatedAtMs:at+500}).state,"INVALIDATED_EARLY");
 assert.equal(planFourHourDryRunDelivery({event,nowMs:at-1}).state,"FUTURE_EVENT_BLOCKED");
 assert.equal(planFourHourDryRunDelivery({event:{...event,sendPush:true},nowMs:at}).state,"NON_QUARANTINED_EVENT_BLOCKED");
 assert.equal(planFourHourDryRunDelivery({event:{...event,tvSymbol:"OANDA:USDCAD"},nowMs:at}).state,"NON_QUARANTINED_EVENT_BLOCKED");
 assert.equal(planFourHourDryRunDelivery({event:{...event,certification:"STAGING_APPROVED"},nowMs:at}).state,"NON_QUARANTINED_EVENT_BLOCKED");
});
