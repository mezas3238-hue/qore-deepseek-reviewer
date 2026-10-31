# QORE CRT Alerts — Android Kotlin source in QA ONLY

This is a native Android Kotlin project, not a signed, installed or
certified Android application. There is no configured Firebase project
or live device token registration, and no network transmission is enabled.

- Android Gradle Plugin 9.5.0, Gradle 9.6.0, JDK 17, compile SDK 36.
- Firebase Android BoM 35.1.0 and firebase-messaging main module.
- MainActivity explicitly shows notifications are disabled.
- FirebaseMessagingService is registered, with BUILD-TIME hard lock FALSE.
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
