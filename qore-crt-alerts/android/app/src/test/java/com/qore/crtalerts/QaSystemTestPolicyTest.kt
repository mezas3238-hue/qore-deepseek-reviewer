package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class QaSystemTestPolicyTest {
    private val at = 1_800_000_000_000L
    private val base = mapOf(
        "schema" to "QORE_QA_SYSTEM_TEST_V1",
        "kind" to "SYSTEM_TEST",
        "testOnly" to "true",
        "sentAtMs" to at.toString(),
        "expiresAtMs" to (at+60_000).toString(),
        "nonce" to "0123456789abcdef01234567"
    )
    private fun check(d: Map<String, String>, now: Long=at+1000,
                      consent: Boolean=true, enrolled: Boolean=true,
                      ready: Boolean=true) =
        QaSystemTestPolicy.check(d,now,consent,enrolled,ready)

    @Test fun aValidSystemPingRequiresAllIndependentPermissions() {
        assertTrue(check(base).accepted)
        assertFalse(check(base,consent=false).accepted)
        assertFalse(check(base,enrolled=false).accepted)
        assertFalse(check(base,ready=false).accepted)
        assertEquals("QA_SYSTEM_TEST_ONLY",check(base).reason)
    }
    @Test fun fourHourOrMarketPayloadMustNeverBecomeQaPing() {
        assertFalse(check(base+("expiresAtMs" to (at+14_400_000).toString())).accepted)
        assertFalse(check(base+("instrumentId" to "BTCUSD")).accepted)
        assertFalse(check(base+("eventType" to "CRT_OBSERVED")).accepted)
        assertFalse(check(base+("certified" to "true")).accepted)
        assertFalse(check(base+("kind" to "CRT_MSS")).accepted)
    }
    @Test fun expiryReplayAndForgedNonceAreRejected() {
        assertTrue(check(base,now=at+59_999).accepted)
        assertFalse(check(base,now=at+60_000).accepted)
        assertFalse(check(base,now=at+70_000).accepted)
        assertFalse(check(base+("nonce" to "invalid")).accepted)
        assertFalse(check(base+("sentAtMs" to (at+10_000).toString())).accepted)
    }
}
