package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class QaReplayInboxPreviewTest {
    private val at = 1_800_000_000_000L
    private val c1 = at - 28_800_000L

    private fun event(
        id: String = "USDCAD",
        family: String = "CRT_2C_RETURN",
        kind: String = "CRT_OBSERVED"
    ): Map<String, String> {
        val tv = when (id) {
            "NDX100" -> "IC:USTEC"
            "SPX500" -> "IC:US500"
            else -> "IC:$id"
        }
        return mapOf(
            "schema" to "QORE_CRT_MONITOR_QA_V2",
            "mode" to "OFFLINE_REPLAY",
            "certification" to "NOT_VERIFIED",
            "deliveryState" to "BLOCKED_NOT_CERTIFIED",
            "transport" to "DISABLED",
            "sendPush" to "false",
            "actionable" to "false",
            "requiresRealFeedAndPineParity" to "true",
            "instrumentId" to id, "tvSymbol" to tv,
            "family" to family, "direction" to "BULLISH",
            "eventType" to kind,
            "mssM5" to if (kind == "MSS_M5_OBSERVED") "CONFIRMED" else "AWAITING",
            "mssM15" to if (kind == "MSS_M15_OBSERVED") "CONFIRMED" else "AWAITING",
            "c1StartMs" to c1.toString(),
            "eventAtMs" to at.toString(),
            "confirmedAtMs" to at.toString(),
            "expiresAtMs" to (at+14_400_000L).toString(),
            "eventId" to "IC|$id|$c1|1|$kind|$at"
        )
    }

    @Test fun latestAndExpiryAreStrictlyFromOriginalBar() {
        val valid = QaReplayInboxPreview.project(listOf(event()),at+600_000L)
        assertEquals(1,valid.size)
        assertEquals(at+14_400_000L,valid[0].expiresAtMs)
        assertTrue(QaReplayInboxPreview.project(listOf(event()),at+14_400_000L).isEmpty())
        assertTrue(QaReplayInboxPreview.project(listOf(event()),at-1L).isEmpty())
        assertTrue(QaReplayInboxPreview.project(listOf(
            event()+("expiresAtMs" to (at+86_400_000L).toString())
        ),at+10L).isEmpty())
    }

    @Test fun rejectLiveClaimsAndEarlyInvalidations() {
        for (override in listOf(
            "mode" to "STAGING_APPROVED",
            "certification" to "CERTIFIED",
            "sendPush" to "true",
            "deliveryState" to "READY",
            "tvSymbol" to "OANDA:USDCAD",
            "eventId" to "forged",
            "invalidatedAtMs" to (at+1).toString()
        )) {
            assertTrue(QaReplayInboxPreview.project(
                listOf(event()+override),at+60_000L
            ).isEmpty())
        }
    }

    @Test fun separateMssAndFamiliesNotCollapsed() {
        val rows=listOf(
            event(),
            event(kind="MSS_M5_OBSERVED"),
            event(kind="MSS_M15_OBSERVED"),
            event(family="MULTI4")
        )
        assertEquals(4,QaReplayInboxPreview.project(rows,at+1000).size)
        assertEquals(1,QaReplayInboxPreview.project(rows,at+1000,setOf("USDCAD")).size - 3)
        assertTrue(QaReplayInboxPreview.project(rows,at+1000,setOf("EURUSD")).isEmpty())
        assertEquals(1,QaReplayInboxPreview.project(
            listOf(event(id="NDX100")),at+1000
        ).size)
        assertEquals(1,QaReplayInboxPreview.project(
            listOf(event(id="SPX500")),at+1000
        ).size)
    }

    @Test fun duplicateIsNotRenewedAndConflictingEvidenceQuarantined() {
        assertEquals(1,QaReplayInboxPreview.project(
            listOf(event(),event()),at+1000
        ).size)
        val conflict = event()+("mssM5" to "CONFIRMED")
        assertTrue(QaReplayInboxPreview.project(
            listOf(event(),conflict),at+1000
        ).isEmpty())
    }

    @Test fun noUnprovenMssPromotion() {
        assertTrue(QaReplayInboxPreview.project(
            listOf(event(kind="MSS_M5_OBSERVED")+("mssM5" to "AWAITING")),
            at+1000
        ).isEmpty())
        assertTrue(QaReplayInboxPreview.project(
            listOf(event(kind="MSS_M15_OBSERVED")+("mssM15" to "AWAITING")),
            at+1000
        ).isEmpty())
    }
}
