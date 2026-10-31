# QORE CRT Alerts — Android Kotlin source in QA ONLY

This is a native Android Kotlin project, not a signed, installed or
certified Android application. There is no configured Firebase project
or live device token registration, and no network transmission is enabled.

- Android Gradle Plugin 9.5.0, Gradle 9.6.0, JDK 17, compile SDK 36.
- Firebase Android BoM 35.1.0 and firebase-messaging main module.
- MainActivity explicitly shows notifications are disabled.
- FirebaseMessagingService is registered, with BUILD-TIME hard lock FALSE.
- Manifest disables FCM auto initialization AND Analytics collection,
  preventing premature FID registration until authorized consent and
  explicit app configuration are reviewed.
- onNewToken intentionally never logs or uploads FCM credentials.
- Android 13+ POST_NOTIFICATIONS is declared, not yet requested since QA
  cannot post notifications.
- Kotlin policy tests check replay blocking, MSS M15 only, bad timestamps,
  forged ticker and absence of OHLC SHA-256 proof.
- GitHub Actions attempts Android unit tests + assembleDebug, but
  building does not prove Firebase delivery or real phone readiness.

Do not enable delivery by editing one flag. Before any approved staging
delivery: confirm raw M5 feed + Pine equivalence, create Firebase project,
authenticated installation/device registration, approved server sender,
platform permission UI and physical Android end-to-end test. No merge.

QA security gate, 31 Oct 2026: AndroidManifest.xml explicitly disables
firebase_messaging_auto_init_enabled and firebase_analytics_collection_enabled.
Firebase current documentation recommends both values false when requiring
explicit consent before FID registration. Android QA has no permission UI,
and cannot enable Firebase registration while build flag remains locked.

## Local interest UI, not a push-registration flow

The Android QA launcher displays the OFFLINE status and permits recording a
local-only preference for future alerts. The user may erase that preference.
This action never requests Android notification permission, initializes
Firebase, uploads an FID/token, enrolls a device, or enables delivery.

QaConsentGate requires: local interest, approved build, server-verified
enrollment, verified Pine parity and Android permission. In this QA build,
the compile-time flag and receiver's server/Pine gates remain FALSE.
Kotlin tests verify the actual generated BuildConfig flag.
