plugins { id("com.android.application") }
android {
    namespace = "com.qore.crtalerts"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.qore.crtalerts.qa"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0-qa"
        buildConfigField("boolean", "STAGING_NOTIFICATIONS_ENABLED", "false")
    }
    buildFeatures { buildConfig = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    testOptions { unitTests.isReturnDefaultValues = true }
}
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:35.1.0"))
    implementation("com.google.firebase:firebase-messaging")
    testImplementation("junit:junit:4.13.2")
}
