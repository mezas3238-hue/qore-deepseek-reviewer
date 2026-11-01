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
- Android 13+ POST_NOTIFICATIONS is declared. An EXPLICIT tap on
  "Mostrar notificación LOCAL de prueba" may now request permission
  to show ONE clearly SIMULATED BTCUSD diagnostic notification.
  This is not an FCM message, market signal, or QA enrollment.
- Kotlin policy tests check replay blocking, MSS M15 only, bad timestamps,
  forged ticker and absence of OHLC SHA-256 proof.
- GitHub Actions attempts Android unit tests + assembleDebug, but
  building does not prove Firebase delivery or real phone readiness.

Do not enable delivery by editing one flag. Before any approved staging
delivery: confirm raw M5 feed + Pine equivalence, create Firebase project,
authenticated installation/device registration, approved server sender,
platform permission UI and physical Android end-to-end test. No merge.

QA security gate, updated 1 Nov 2026: AndroidManifest.xml explicitly disables
firebase_messaging_auto_init_enabled and firebase_analytics_collection_enabled.
Firebase current documentation recommends both values false when requiring
explicit consent before FID registration. The new local-only demo button
can request Android notification permission ON USER TAP only; it cannot
enable Firebase registration while the build flag remains locked.

## Local interest UI, not a push-registration flow

The Android QA launcher displays the OFFLINE status and permits recording a
local-only preference for future alerts. The user may erase that preference.
This action never requests Android notification permission, initializes
Firebase, uploads an FID/token, enrolls a device, or enables delivery.

QaConsentGate requires: local interest, approved build, server-verified
enrollment, verified Pine parity and Android permission. In this QA build,
the compile-time flag and receiver's server/Pine gates remain FALSE.
Kotlin tests verify the actual generated BuildConfig flag.

## BTCUSD local demonstration, never a real signal (1 Nov 2026)

MainActivity now shows owner-approved NY BTC CRT C1=01/05/21, and a
manual **LOCAL** Android notification demo button. On Android 13+ it
requests POST_NOTIFICATIONS only when tapped; on approval it posts an
on-device message titled `BTCUSD · PRUEBA LOCAL` and explicitly says
`Simulada. No es una señal CRT ni proviene de Firebase.`

This path never calls FirebaseMessaging.getToken(), enables auto-init,
subscribes a symbol, hits network services or treats local user interest
as server enrollment. Real FCM remains permanently blocked in this build
with BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false, backend enrollment
false, and Pine certification false. A local demonstration does not prove
any market-to-Android E2E. No installed phone test has been observed.
