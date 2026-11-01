import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const xml=readFileSync(new URL("../android/app/src/main/AndroidManifest.xml",
  import.meta.url),"utf8");
test("Android disables FCM auto init and Analytics collection at startup",()=>{
 assert.match(xml,/android:name="firebase_messaging_auto_init_enabled"\s+android:value="false"/);
 assert.match(xml,/android:name="firebase_analytics_collection_enabled"\s+android:value="false"/);
});
test("Android receiver is not exported to third-party apps",()=>{
 assert.match(xml,/android:name="\.QoreMessagingService" android:exported="false"/);
});
