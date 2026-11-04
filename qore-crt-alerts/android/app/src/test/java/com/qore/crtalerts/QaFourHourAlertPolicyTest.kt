package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class QaFourHourAlertPolicyTest {
    private val at = 1_800_000_000_000L
    private val expiry = at + 14_400_000L

    @Test fun exactlyFourHoursFromEventConfirmation() {
        val start = QaFourHourAlertPolicy.evaluate(at, expiry, null, at)
        assertTrue(start.accepted)
        assertEquals(14_400_000L, start.remainingMs)
        val lastMillisecond = QaFourHourAlertPolicy.evaluate(
            at, expiry, null, expiry - 1L)
        assertTrue(lastMillisecond.accepted)
        assertEquals(1L, lastMillisecond.remainingMs)
        assertEquals("EXPIRED", QaFourHourAlertPolicy.evaluate(
            at, expiry, null, expiry).reason)
    }

    @Test fun invalidationEndsAlertBeforeFourHours() {
        assertEquals("INVALIDATED_EARLY", QaFourHourAlertPolicy.evaluate(
            at, expiry, (at + 600_000).toString(), at + 600_001).reason)
    }

    @Test fun latePushAndBogusExtendedTtlAreAlwaysRejected() {
        assertEquals("EXPIRED", QaFourHourAlertPolicy.evaluate(
            at, expiry, null, expiry + 7_200_000L).reason)
        assertEquals("INVALID_FOUR_HOUR_EXPIRY", QaFourHourAlertPolicy.evaluate(
            at, at + 24L * 60L * 60L * 1000L, null, at + 60_000L).reason)
        assertEquals("INVALID_FOUR_HOUR_EXPIRY", QaFourHourAlertPolicy.evaluate(
            at, expiry - 1L, null, at).reason)
        assertEquals("FUTURE_CONFIRMATION", QaFourHourAlertPolicy.evaluate(
            at, expiry, null, at - 1L).reason)
    }

    @Test fun exactServerFieldsRequiredForFutureAndroidPush() {
        val data = mapOf("confirmedAtMs" to at.toString(),
            "expiresAtMs" to expiry.toString())
        assertTrue(QaFourHourAlertPolicy.check(data,at+1000).accepted)
        assertEquals("MISSING_EXPIRES_AT",
            QaFourHourAlertPolicy.check(data-"expiresAtMs",at+1000).reason)
        assertEquals("MISSING_CONFIRMED_AT",
            QaFourHourAlertPolicy.check(data-"confirmedAtMs",at+1000).reason)
        assertFalse(QaFourHourAlertPolicy.check(
            data+("invalidatedAtMs" to (at+500).toString()),at+1000).accepted)
    }

    @Test fun qaBuildStillHardLocksMarketPushIndependentlyOfValidExpiry() {
        assertFalse(BuildConfig.STAGING_NOTIFICATIONS_ENABLED)
    }
}
