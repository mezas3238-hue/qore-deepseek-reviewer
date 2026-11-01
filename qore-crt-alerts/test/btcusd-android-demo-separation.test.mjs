import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const main=read("../android/app/src/main/java/com/qore/crtalerts/MainActivity.kt");
const service=read("../android/app/src/main/java/com/qore/crtalerts/QoreMessagingService.kt");
const gradle=read("../android/app/build.gradle.kts");
test("BTC local Android notification demo is explicit user action, not live FCM",()=>{
 assert.match(main,/setOnClickListener \{ requestLocalDemoOnly\(\) \}/);
 assert.match(main,/BTCUSD · PRUEBA LOCAL/);
 assert.match(main,/No es una señal CRT ni proviene de Firebase/);
 assert.match(main,/requestPermissions\(/);
 assert.doesNotMatch(main,/FirebaseMessaging\s*\.|getToken\s*\(|setAutoInitEnabled/);
});
test("staging FCM remains compile-time disabled despite local demo",()=>{
 assert.match(gradle,/buildConfigField\("boolean", "STAGING_NOTIFICATIONS_ENABLED", "false"\)/);
 assert.match(service,/serverEnrollmentVerified = false/);
 assert.match(service,/tradingEngineCertified = false/);
});
