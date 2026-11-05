package com.qore.crtalerts

import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory

// Physical sideload QA: user registers the debug token in Firebase Console.
// No debug token is stored in source, APK configuration or logs by us.
internal object QaAppCheckFactory {
    fun install(app: FirebaseApp) {
        FirebaseAppCheck.getInstance(app)
            .installAppCheckProviderFactory(DebugAppCheckProviderFactory.getInstance())
    }
}
