import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {INSTRUMENTS} from "../src/instruments.mjs";

const kotlinPath=fileURLToPath(new URL(
 "../android/app/src/main/java/com/qore/crtalerts/QaMarketWatchlist.kt",
 import.meta.url));

test("Android 34 local watchlist matches Pine 34 slot inventory exactly",()=>{
 const kotlin=readFileSync(kotlinPath,"utf8");
 const block=kotlin.split("val symbols: List<String> = listOf(")[1]?.split("\n    )")[0];
 assert.ok(block,"Kotlin watchlist definition missing");
 const android=[...block.matchAll(/"([A-Z0-9]+)"/g)].map(x=>x[1]);
 assert.equal(INSTRUMENTS.length,34);
 assert.deepEqual(android,INSTRUMENTS.map(x=>x.id));
 assert.equal(android.filter(x=>x==="BTCUSD").length,1);
 assert.equal(android.filter(x=>x!=="BTCUSD").length,33);
 assert.match(kotlin,/fun normalized\(saved: Set<String>\)/);
 assert.match(kotlin,/require\(instrumentId in symbols\)/);
});

test("Android manifest and transport remain QA-only",()=>{
 const base=new URL("../android/app/",import.meta.url);
 const gradle=readFileSync(fileURLToPath(new URL("build.gradle.kts",base)),"utf8");
 assert.match(gradle,/STAGING_NOTIFICATIONS_ENABLED", "false"/);
 const main=readFileSync(fileURLToPath(new URL(
 "src/main/java/com/qore/crtalerts/MainActivity.kt",base)),"utf8");
 assert.match(main,/getStringSet\(QaMarketWatchlist.SELECTED_SYMBOLS_KEY/);
 assert.doesNotMatch(main,/FirebaseMessaging\.getInstance\(\)/);
 assert.doesNotMatch(main,/https?:\/\//);
});
