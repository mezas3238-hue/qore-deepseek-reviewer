package com.qore.crtalerts

// Strict, entirely separate non-market ping receipt. It can NEVER make
// a CRT event actionable or bypass STAGING_NOTIFICATIONS_ENABLED=false.
internal object QaSystemTestPolicy {
    const val TTL_MS = 60_000L
    const val ENROLLED_KEY = "qa_test_device_enrolled_v1"
    const val ENABLED_KEY = "qa_test_local_consent_v1"
    data class Decision(val accepted: Boolean, val reason: String,
                        val expiryMs: Long = 0L, val nonce: String? = null)
    fun check(d: Map<String, String>, nowMs: Long, consent: Boolean,
              enrolled: Boolean, buildReady: Boolean): Decision {
        if (!buildReady || !consent || !enrolled)
            return Decision(false, "QA_TEST_NOT_AUTHORIZED")
        if (d["schema"] != "QORE_QA_SYSTEM_TEST_V1" ||
            d["kind"] != "SYSTEM_TEST" ||
            d["testOnly"] != "true" ||
            d.keys.any { it in setOf("family","instrumentId","direction",
                "ohlcSha256","certified","sendPush","eventType","mssM5","mssM15") })
            return Decision(false, "NON_SYSTEM_PAYLOAD_BLOCKED")
        val sent = d["sentAtMs"]?.toLongOrNull()
            ?: return Decision(false, "MISSING_TEST_TIME")
        val expiry = d["expiresAtMs"]?.toLongOrNull()
            ?: return Decision(false, "MISSING_TEST_EXPIRY")
        val nonce = d["nonce"]?.takeIf { Regex("^[a-f0-9]{24}$").matches(it) }
            ?: return Decision(false, "INVALID_TEST_NONCE")
        if (sent <= 0L || nowMs <= 0L || sent > Long.MAX_VALUE-TTL_MS ||
            expiry != sent+TTL_MS || nowMs >= expiry ||
            sent > nowMs+5_000L)
            return Decision(false, "TEST_EXPIRED_OR_INVALID")
        return Decision(true, "QA_SYSTEM_TEST_ONLY", expiry, nonce)
    }
}
