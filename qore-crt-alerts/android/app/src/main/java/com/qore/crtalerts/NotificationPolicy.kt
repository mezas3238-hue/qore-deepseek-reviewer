package com.qore.crtalerts

// Payload assertions cannot replace a trusted server-side certification.
// The permanent QA build flag is false, regardless of remote input.
internal object NotificationPolicy {
    private val id = Regex("^[A-Za-z0-9_.:|+-]{12,256}$")
    private val ticker = Regex("^[A-Z0-9_]{3,16}$")
    private val digest = Regex("^[a-f0-9]{64}$")

    data class Decision(val accepted: Boolean, val reason: String,
                        val eventId: String? = null, val instrument: String? = null,
                        val direction: String? = null, val family: String? = null,
                        val eventType: String? = null,
                        val mssM5: String? = null, val mssM15: String? = null,
                        val tvSymbol: String? = null,
                        val mssM5AtMs: Long? = null, val mssM5Price: String? = null,
                        val mssM15AtMs: Long? = null, val mssM15Price: String? = null)

    fun evaluate(data: Map<String, String>, buildEnabled: Boolean): Decision {
        if (!buildEnabled) return Decision(false, "BUILD_LOCKED")
        if (data["schema"] == "QORE_CRT_STAGING_V2") {
            val v=QaCrtStatusContract.check(data)
            return Decision(v.ok,v.reason,v.eventId,v.instrument,v.direction,
                v.family,v.eventType,v.mssM5,v.mssM15,v.tvSymbol,
                v.mssM5AtMs,v.mssM5Price,v.mssM15AtMs,v.mssM15Price)
        }
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
        val mssAt = data["mssAtMs"]?.toLongOrNull()
            ?: return Decision(false, "INVALID_TIME")
        if (mssAt <= 0L || mssAt % 60_000L != 0L)
            return Decision(false, "INVALID_TIME")
        // This checks payload coherence only; untrusted FCM fields cannot
        // attest to genuine market data or replace authenticated enrollment.
        // The native source phase must come from this *same event cycle*.
        // Non-BTC feeds can close M15 at :01/:16, :02/:17 etc.
        val parts = eventId.split('|')
        val c1Start = parts.getOrNull(2)?.toLongOrNull()
        val nativePhaseMs = c1Start?.takeIf { it > 0L && it % 60_000L == 0L }
            ?.rem(300_000L)
        if (nativePhaseMs == null || mssAt % 900_000L != nativePhaseMs)
            return Decision(false, "INVALID_TIME")
        val cycleElapsed = if (c1Start != null && c1Start > 0L && c1Start < mssAt)
            mssAt - c1Start else -1L
        if (parts.size != 6 || parts[0].isBlank() ||
            parts[1] != instrument ||
            parts[3] != (if (direction == "BULLISH") "1" else "-1") ||
            parts[4] != "MSS_M15" ||
            parts[5] != mssAt.toString() ||
            cycleElapsed <= 14_400_000L || cycleElapsed > 43_200_000L)
            return Decision(false, "EVENT_ID_MISMATCH")
        return Decision(true, "STAGING_POLICY_PASS", eventId, instrument, direction)
    }
}
