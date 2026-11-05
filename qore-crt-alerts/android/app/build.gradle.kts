plugins { id("com.android.application") }

// Public Firebase mobile project identifiers are injected at BUILD time.
// Do not commit google-services.json, service-account JSON or access tokens.
// Empty identifiers produce a completely disabled QA transport.
fun gradleString(value: String): String = "\"" +
    value.replace("\\", "\\\\").replace("\"", "\\\"")
        .replace("\n", "").replace("\r", "") + "\""

val firebaseApiKey = System.getenv("QORE_FIREBASE_ANDROID_API_KEY") ?: ""
val firebaseAppId = System.getenv("QORE_FIREBASE_ANDROID_APP_ID") ?: ""
val firebaseProjectId = System.getenv("QORE_FIREBASE_PROJECT_ID") ?: ""
val firebaseSenderId = System.getenv("QORE_FIREBASE_SENDER_ID") ?: ""
val qaTransportUrl = System.getenv("QORE_QA_BRIDGE_URL") ?: ""
val qaConfigured = firebaseApiKey.isNotBlank() &&
    firebaseAppId.isNotBlank() && firebaseProjectId.isNotBlank() &&
    firebaseSenderId.isNotBlank() && qaTransportUrl.startsWith("https://") &&
    System.getenv("QORE_QA_TEST_TRANSPORT_BUILD") == "true"

android {
    namespace = "com.qore.crtalerts"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.qore.crtalerts.qa"
        minSdk = 24
        targetSdk = 35
        versionCode = 3
        versionName = "0.3.0-qa-transport"
        // A REAL market notification is never authorized by this flag.
        buildConfigField("boolean", "STAGING_NOTIFICATIONS_ENABLED", "false")
        buildConfigField("boolean", "QA_FIREBASE_IDENTIFICATION_ENABLED",
            if (firebaseApiKey.isNotBlank() && firebaseAppId.isNotBlank() &&
                firebaseProjectId.isNotBlank() && firebaseSenderId.isNotBlank())
                "true" else "false")
        buildConfigField("boolean", "QA_TEST_TRANSPORT_ENABLED",
            if (qaConfigured) "true" else "false")
        buildConfigField("String", "QA_FIREBASE_API_KEY", gradleString(firebaseApiKey))
        buildConfigField("String", "QA_FIREBASE_APP_ID", gradleString(firebaseAppId))
        buildConfigField("String", "QA_FIREBASE_PROJECT_ID", gradleString(firebaseProjectId))
        buildConfigField("String", "QA_FIREBASE_SENDER_ID", gradleString(firebaseSenderId))
        buildConfigField("String", "QA_BRIDGE_URL", gradleString(qaTransportUrl.trimEnd('/')))
    }
    buildFeatures { buildConfig = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    testOptions { unitTests.isReturnDefaultValues = true }
}
dependencies {
    // BoM 35.1 brings Auth 25 (Kotlin metadata 2.4), incompatible with AGP 9.5 Kotlin 2.2.
    implementation(platform("com.google.firebase:firebase-bom:33.16.0"))
    implementation("com.google.firebase:firebase-messaging")
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-appcheck")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    debugImplementation("com.google.firebase:firebase-appcheck-debug")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    testImplementation("junit:junit:4.13.2")
}
