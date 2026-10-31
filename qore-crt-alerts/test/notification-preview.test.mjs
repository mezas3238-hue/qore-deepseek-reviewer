import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createBlockedAndroidPreview} from "../src/notification-preview.mjs";

const c1=Date.parse("2026-10-30T05:00:00Z"),mss=c1+15000000;
function observation(direction=1){
  return {eventKey:"TEST|EURUSD|"+c1+"|"+direction+"|MSS_M15|"+mss,
    fingerprint:"f".repeat(64),sourceId:"test-offline",
    provider:"TEST",instrumentId:"EURUSD",family:"forex",
    c1StartMs:c1,mssM15AtMs:mss,ohlcSha256:"a".repeat(64),
    status:"QUARANTINED_REPLAY",deliveryState:"BLOCKED_NOT_CERTIFIED",
    actionable:false,sendPush:false};
}
test("backend preview matches expected Android Kotlin field contract, but blocks send",()=>{
 const p=createBlockedAndroidPreview(observation());
 assert.equal(p.data.timeframe,"M15");
 assert.equal(p.data.direction,"BULLISH");
 assert.equal(p.data.mode,"OFFLINE_REPLAY");
 assert.equal(p.data.certified,"false");
 assert.equal(p.deliverable,false);
 assert.equal(p.sendPush,false);
 assert.equal(p.transport,"DISABLED");
});
test("bearish cycle remains bearish even though it never becomes sendable",()=>{
 assert.equal(createBlockedAndroidPreview(observation(-1)).data.direction,"BEARISH");
});
test("no runtime flag may convert unapproved replay to FCM",()=>{
 assert.throws(()=>createBlockedAndroidPreview({...observation(),sendPush:true}),/blocked replay/);
 assert.throws(()=>createBlockedAndroidPreview({...observation(),deliveryState:"READY_TO_SEND"}),/blocked replay/);
});
test("tampered event identity cannot enter the Android preview contract",()=>{
 const e=observation();
 assert.throws(()=>createBlockedAndroidPreview({...e,eventKey:e.eventKey.replace("EURUSD","GBPUSD")}),/identity/);
});
test("a malformed OHLC digest is always rejected",()=>{
 assert.throws(()=>createBlockedAndroidPreview({...observation(),ohlcSha256:"not-a-sha"}),/blocked replay/);
});
test("Kotlin explicitly rejects offline mode and build has false delivery gate",()=>{
 const kt=readFileSync(new URL("../android/app/src/main/java/com/qore/crtalerts/NotificationPolicy.kt",import.meta.url),"utf8");
 const gradle=readFileSync(new URL("../android/app/build.gradle.kts",import.meta.url),"utf8");
 assert.match(kt,/data\["mode"\] != "STAGING_APPROVED"/);
 assert.match(kt,/if \(!buildEnabled\) return Decision\(false, "BUILD_LOCKED"\)/);
 assert.match(gradle,/buildConfigField\("boolean", "STAGING_NOTIFICATIONS_ENABLED", "false"\)/);
});
test("preview schema is aligned with Android Kotlin policy names",()=>{
 const p=createBlockedAndroidPreview(observation());
 const kt=readFileSync(new URL("../android/app/src/main/java/com/qore/crtalerts/NotificationPolicy.kt",import.meta.url),"utf8");
 for(const key of Object.keys(p.data))assert.ok(kt.includes('data["'+key+'"]'),key);
});
