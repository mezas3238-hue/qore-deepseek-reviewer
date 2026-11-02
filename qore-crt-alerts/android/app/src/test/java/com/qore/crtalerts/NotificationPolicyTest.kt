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
    @Test fun forgedSymbolOrDirectionCannotReuseAnotherCycleId() {
        assertEquals("EVENT_ID_MISMATCH",
            NotificationPolicy.evaluate(valid() + ("instrumentId" to "GBPUSD"), true).reason)
        assertEquals("EVENT_ID_MISMATCH",
            NotificationPolicy.evaluate(valid() + ("direction" to "BEARISH"), true).reason)
    }
    @Test fun forgedEventIdAndM15TimestampCannotBeMixed() {
        val wrongId = "FIXTURE|EURUSD|1793336400000|1|MSS_M15|1793352600000"
        assertEquals("EVENT_ID_MISMATCH",
            NotificationPolicy.evaluate(valid() + ("eventId" to wrongId), true).reason)
        assertEquals("INVALID_TIME",
            NotificationPolicy.evaluate(valid() + ("mssAtMs" to "1793351700001"), true).reason)
    }
    @Test fun M5OrUnrelatedC1CannotPassAsM15Cycle() {
        assertEquals("EVENT_ID_MISMATCH",
            NotificationPolicy.evaluate(valid() + ("eventId" to
                "FIXTURE|EURUSD|1793336400000|1|MSS_M5|1793351700000"), true).reason)
        assertEquals("EVENT_ID_MISMATCH",
            NotificationPolicy.evaluate(valid() + ("eventId" to
                "FIXTURE|EURUSD|1793304000000|1|MSS_M15|1793351700000"), true).reason)
    }

    @Test fun nativeM5PhaseZeroThroughFourIsRecognizedWithoutEnablingQaPush() {
        val c1 = 1793336400000L
        val m15 = 1793351700000L
        for (minutes in 0..4) {
            val phase = minutes * 60_000L
            val id = "FIXTURE|EURUSD|${c1 + phase}|1|MSS_M15|${m15 + phase}"
            val payload = valid() + mapOf(
                "eventId" to id,
                "mssAtMs" to (m15 + phase).toString()
            )
            // Parser contracts can validate phase on a hypothetical future
            // approved build, while the ACTUAL QA BuildConfig is always OFF.
            assertTrue("phase $minutes", NotificationPolicy.evaluate(payload, true).accepted)
            assertEquals("BUILD_LOCKED", NotificationPolicy.evaluate(
                payload, BuildConfig.STAGING_NOTIFICATIONS_ENABLED
            ).reason)
            assertEquals("INVALID_TIME", NotificationPolicy.evaluate(payload + (
                "mssAtMs" to (m15 + phase + 60_000L).toString()
            ), true).reason)
            val wrongCycle = id.replace((c1 + phase).toString(),
                (c1 + ((minutes + 1) % 5) * 60_000L).toString())
            assertEquals("INVALID_TIME", NotificationPolicy.evaluate(
                payload + ("eventId" to wrongCycle), true
            ).reason)
        }
    }

}
