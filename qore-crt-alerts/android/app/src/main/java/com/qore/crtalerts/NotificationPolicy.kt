package com.qore.crtalerts

// Payload assertions cannot replace a trusted server-side certification.
// The permanent QA build flag is false, regardless of remote input.
internal object NotificationPolicy {
    private val id = Regex("^[A-Za-z0-9_.:|+-]{12,256}$")
    private val ticker = Regex("^[A-Z0-9_]{3,16}$")
    private val digest = Regex("^[a-f0-9]{64}$")

    data class Decision(val accepted: Boolean, val reason: String,
                        val eventId: String? = null, val instrument: String? = null,
                        val direction: String? = null)

    fun evaluate(data: Map<String, String>, buildEnabled: Boolean): Decision {
        if (!buildEnabled) return Decision(false, "BUILD_LOCKED")
        if (data["schema"] != "QORE_CRT_STAGING_V1")
            return Decision(false, "UNKNOWN_SCHEMA")
        if (data["mode"] != "STAGING_APPROVED" || data["certified"] != "true")
            return Decision(false, "UNCERTIFIED_SOURCE")
        if (data["timeframe"] != "M15" || data["kind"] != "CRT_MSS")
            return Decision(false, "MSS_M15_REQUIRED")
        val eventId = data["eventId"] ?: return Decision(false, "NO_ID")
        val instrument = data["instrumentId"] ?: return Decision(false, "NO_SYMBOL")
        val direction = data["direction"] ?: return Decision(false, "NO_DIRECTION")
        if (!id.matches(eventId)) return Decision(false, "INVALID_ID")
        if (!ticker.matches(instrument)) return Decision(false, "INVALID_SYMBOL")
        if (direction != "BULLISH" && direction != "BEARISH")
            return Decision(false, "INVALID_DIRECTION")
        if (!digest.matches(data["ohlcSha256"] ?: ""))
            return Decision(false, "MISSING_DATA_PROOF")
        if ((data["mssAtMs"]?.toLongOrNull() ?: 0L) <= 0L)
            return Decision(false, "INVALID_TIME")
        return Decision(true, "STAGING_POLICY_PASS", eventId, instrument, direction)
    }
}
