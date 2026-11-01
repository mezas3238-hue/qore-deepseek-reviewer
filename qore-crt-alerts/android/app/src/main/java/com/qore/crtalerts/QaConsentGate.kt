package com.qore.crtalerts

// A local interest preference is NOT Firebase registration or consent to
// collect an FID. Remote FCM payloads cannot change these permissions.
// No production certificate or server-authenticated enrollment exists in QA.
internal object QaConsentGate {
    const val PREFS = "qore_crt_local_preferences"
    const val INTEREST_KEY = "wants_future_alerts"

    data class Gate(
        val state: String,
        val canRequestPermission: Boolean,
        val canShowNotification: Boolean
    )

    fun evaluate(
        interest: Boolean,
        buildEnabled: Boolean,
        serverEnrollmentVerified: Boolean,
        tradingEngineCertified: Boolean,
        systemPermission: Boolean
    ): Gate {
        if (!interest) return Gate("NO_LOCAL_INTEREST", false, false)
        if (!buildEnabled) return Gate("QA_TRANSPORT_LOCKED", false, false)
        if (!serverEnrollmentVerified) return Gate("NO_VERIFIED_ENROLLMENT", false, false)
        if (!tradingEngineCertified) return Gate("PINE_PARITY_NOT_CERTIFIED", false, false)
        if (!systemPermission) return Gate("ANDROID_PERMISSION_REQUIRED", true, false)
        return Gate("STAGING_DEVICE_ELIGIBLE", false, true)
    }
}
