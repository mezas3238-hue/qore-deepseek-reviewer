package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class NotificationPolicyTest {
    private fun valid() = mapOf(
        "schema" to "QORE_CRT_STAGING_V1",
        "mode" to "STAGING_APPROVED",
        "certified" to "true",
        "timeframe" to "M15",
        "kind" to "CRT_MSS",
        "eventId" to "FIXTURE|EURUSD|1793336400000|1|MSS_M15|1793351700000",
        "instrumentId" to "EURUSD",
        "direction" to "BULLISH",
        "ohlcSha256" to "a".repeat(64),
        "mssAtMs" to "1793351700000"
    )
    @Test fun buildGateRejectsEveryIncomingMessage() {
        assertEquals("BUILD_LOCKED", NotificationPolicy.evaluate(valid(), false).reason)
        assertFalse(NotificationPolicy.evaluate(emptyMap(), false).accepted)
    }
    @Test fun stagingContractOnlyForFutureExplicitBuild() {
        assertTrue(NotificationPolicy.evaluate(valid(), true).accepted)
    }
    @Test fun offlineReplayIsRejected() {
        assertEquals("UNCERTIFIED_SOURCE",
            NotificationPolicy.evaluate(valid() + ("mode" to "OFFLINE_REPLAY"), true).reason)
    }
    @Test fun noCertificationIsRejected() {
        assertFalse(NotificationPolicy.evaluate(valid() + ("certified" to "false"), true).accepted)
    }
    @Test fun M5CannotReplaceM15() {
        assertEquals("MSS_M15_REQUIRED",
            NotificationPolicy.evaluate(valid() + ("timeframe" to "M5"), true).reason)
    }
    @Test fun invalidTickerIsRejected() {
        assertEquals("INVALID_SYMBOL",
            NotificationPolicy.evaluate(valid() + ("instrumentId" to "EURUSD\nSPOOF"), true).reason)
    }
    @Test fun absentShaIsRejected() {
        assertEquals("MISSING_DATA_PROOF",
            NotificationPolicy.evaluate(valid() - "ohlcSha256", true).reason)
    }
    @Test fun invalidTimeAndDirectionRejected() {
        assertFalse(NotificationPolicy.evaluate(valid() + ("mssAtMs" to "-1"), true).accepted)
        assertFalse(NotificationPolicy.evaluate(valid() + ("direction" to "BUY NOW"), true).accepted)
    }
}
