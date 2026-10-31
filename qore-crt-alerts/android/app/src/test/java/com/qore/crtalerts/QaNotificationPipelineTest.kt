package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

// Regression gate against actual Android BuildConfig; not physical-device E2E.
class QaNotificationPipelineTest {
    private fun wouldBeStagingPayload() = mapOf(
        "schema" to "QORE_CRT_STAGING_V1",
        "mode" to "STAGING_APPROVED",
        "certified" to "true",
        "timeframe" to "M15",
        "kind" to "CRT_MSS",
        "eventId" to "QA|EURUSD|1793336400000|1|MSS_M15|1793351700000",
        "instrumentId" to "EURUSD",
        "direction" to "BULLISH",
        "ohlcSha256" to "f".repeat(64),
        "mssAtMs" to "1793351700000"
    )

    @Test fun actualCompiledQaFlagIsFalse() {
        assertFalse(BuildConfig.STAGING_NOTIFICATIONS_ENABLED)
    }

    @Test fun forgedCertifiedPayloadCannotAuthorizeQaDelivery() {
        val payload = NotificationPolicy.evaluate(
            wouldBeStagingPayload(), BuildConfig.STAGING_NOTIFICATIONS_ENABLED
        )
        assertFalse(payload.accepted)
        assertEquals("BUILD_LOCKED", payload.reason)
    }

    @Test fun localInterestCannotReplaceServerCertificationOrPineEvidence() {
        val payload = wouldBeStagingPayload()
        for (interest in listOf(false, true))
            for (enrolled in listOf(false, true))
                for (certified in listOf(false, true))
                    for (permission in listOf(false, true)) {
                        val contract = NotificationPolicy.evaluate(
                            payload, BuildConfig.STAGING_NOTIFICATIONS_ENABLED
                        )
                        val gate = QaConsentGate.evaluate(
                            interest = interest,
                            buildEnabled = BuildConfig.STAGING_NOTIFICATIONS_ENABLED,
                            serverEnrollmentVerified = enrolled,
                            tradingEngineCertified = certified,
                            systemPermission = permission
                        )
                        assertFalse(contract.accepted && gate.canShowNotification)
                        assertFalse(gate.canShowNotification)
                        assertFalse(gate.canRequestPermission)
                    }
    }

    @Test fun localPreferenceNeverRequestsAndroidPermissionInQa() {
        val gate = QaConsentGate.evaluate(
            interest = true,
            buildEnabled = BuildConfig.STAGING_NOTIFICATIONS_ENABLED,
            serverEnrollmentVerified = false,
            tradingEngineCertified = false,
            systemPermission = false
        )
        assertEquals("QA_TRANSPORT_LOCKED", gate.state)
        assertFalse(gate.canRequestPermission)
    }
}
