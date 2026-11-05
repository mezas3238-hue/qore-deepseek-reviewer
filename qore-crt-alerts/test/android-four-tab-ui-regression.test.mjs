import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const dashboard = read("../android/app/src/main/java/com/qore/crtalerts/QoreDashboardActivity.kt");
const manifest = read("../android/app/src/main/AndroidManifest.xml");
const gradle = read("../android/app/build.gradle.kts");
const legacy = read("../android/app/src/main/java/com/qore/crtalerts/MainActivity.kt");

test("dashboard is public launcher, legacy tools only internal", () => {
  assert.match(manifest, /<activity android:name="\.QoreDashboardActivity" android:exported="true">/);
  assert.match(manifest, /<activity android:name="\.MainActivity" android:exported="false"\s*\/>/);
  assert.equal((manifest.match(/android.intent.category.LAUNCHER/g) ?? []).length, 1);
  assert.match(dashboard, /Intent\(this, MainActivity::class\.java\)/);
  assert.match(legacy, /CtraderMobileReadOnceQa/);
});

test("all four navigation screens are present with live state never faked", () => {
  for (const word of ["Inicio", "Mercados", "Alertas", "Ajustes"]) {
    assert.ok(dashboard.includes('"' + word + '"'), "missing " + word);
  }
  for (const fn of ["home()", "markets()", "alerts()", "settings()"]) {
    assert.ok(dashboard.includes("private fun " + fn));
  }
  assert.match(dashboard, /"Señales en vivo"/);
  assert.match(dashboard, /"0" to "Señales en vivo"/);
  assert.match(dashboard, /"Mostrar ejemplos ficticios"/);
  assert.match(dashboard, /"EJEMPLO FICTICIO · NO ES UNA SEÑAL"/);
});

test("markets list reuses canonical 34 selection, no subscriptions", () => {
  assert.match(dashboard, /QaMarketWatchlist\.symbols\.filter/);
  assert.match(dashboard, /QaMarketWatchlist\.update/);
  assert.match(dashboard, /SELECTED_SYMBOLS_KEY/);
  assert.match(dashboard, /"NDX100" -> " · IC:USTEC"/);
  assert.match(dashboard, /"SPX500" -> " · IC:US500"/);
});

test("QA inbox uses strict existing replay projection rather than self-certification", () => {
  assert.match(dashboard, /QaReplayInboxPreview\.project/);
  assert.match(dashboard, /"alerts"/);
  assert.match(dashboard, /current\(\)\.size/);
  assert.match(dashboard, /imported = emptyList\(\)/);
  assert.match(dashboard, /OFFLINE REPLAY · NO CERTIFICADO · NO OPERAR/);
  assert.match(dashboard, /"MSS M5"/);
  assert.match(dashboard, /"MSS M15"/);
});

test("QA build retains hard push blocker and no Firebase auto-init", () => {
  assert.match(gradle, /buildConfigField\("boolean", "STAGING_NOTIFICATIONS_ENABLED", "false"\)/);
  assert.match(manifest, /firebase_messaging_auto_init_enabled"[\s\S]*?android:value="false"/);
  assert.match(dashboard, /alertas/i);
  assert.doesNotMatch(dashboard, /FirebaseMessaging\.getToken|sendPush\s*=\s*true/);
});
