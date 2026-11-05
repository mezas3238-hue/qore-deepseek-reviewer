package com.qore.crtalerts

// Local, untrusted OFFLINE_REPLAY inspector; never a source of market signals.
// In particular: this module does not enroll devices, poll a server, generate
// notifications, or accept a client-side "certified" claim as authorization.
internal object QaReplayInboxPreview {
    data class Item(
        val instrumentId: String,
        val family: String,
        val direction: String,
        val eventType: String,
        val mssM5: String,
        val mssM15: String,
        val confirmedAtMs: Long,
        val expiresAtMs: Long,
        val eventId: String
    )

    private val families = setOf(
        "CRT_2C_RETURN", "CRT_3C_TRUE", "INSIDE_RETURN",
        "INSIDE_CONTINUATION_REJECTED", "MULTI4", "MULTI_N", "M15_RETEST"
    )
    private val events = setOf(
        "CRT_OBSERVED", "MSS_M5_OBSERVED", "MSS_M15_OBSERVED"
    )
    private val statuses = setOf("AWAITING", "CONFIRMED", "UNVERIFIED")
    private fun expectedSource(id: String): String = when (id) {
        "NDX100" -> "IC:USTEC"
        "SPX500" -> "IC:US500"
        else -> "IC:$id"
    }

    private fun validate(d: Map<String, String>, nowMs: Long): Item? {
        if (d["schema"] != "QORE_CRT_MONITOR_QA_V2" ||
            d["mode"] != "OFFLINE_REPLAY" ||
            d["certification"] != "NOT_VERIFIED" ||
            d["deliveryState"] != "BLOCKED_NOT_CERTIFIED" ||
            d["transport"] != "DISABLED" ||
            d["sendPush"] != "false" || d["actionable"] != "false" ||
            d["requiresRealFeedAndPineParity"] != "true") return null

        val id = d["instrumentId"] ?: return null
        if (id !in QaMarketWatchlist.symbols || d["tvSymbol"] != expectedSource(id))
            return null
        val family = d["family"]?.takeIf { it in families } ?: return null
        val event = d["eventType"]?.takeIf { it in events } ?: return null
        val direction = d["direction"]?.takeIf {
            it == "BULLISH" || it == "BEARISH"
        } ?: return null
        val m5 = d["mssM5"]?.takeIf { it in statuses } ?: return null
        val m15 = d["mssM15"]?.takeIf { it in statuses } ?: return null
        if ((event == "MSS_M5_OBSERVED" && m5 != "CONFIRMED") ||
            (event == "MSS_M15_OBSERVED" && m15 != "CONFIRMED")) return null

        val c1 = d["c1StartMs"]?.toLongOrNull() ?: return null
        val at = d["eventAtMs"]?.toLongOrNull() ?: return null
        if (c1 <= 0L || at <= c1 || at-c1 > 345_600_000L ||
            c1 % 60_000L != 0L || at % 60_000L != 0L) return null
        val phase = c1 % 300_000L
        val step = if (event == "MSS_M15_OBSERVED") 900_000L else 300_000L
        if (at % step != phase) return null

        val expiry = QaFourHourAlertPolicy.check(d, nowMs)
        if (!expiry.accepted || expiry.confirmedAtMs != at) return null
        val idText = d["eventId"] ?: return null
        val dir = if (direction == "BULLISH") 1 else -1
        if (idText != "IC|$id|$c1|$dir|$event|$at") return null
        return Item(id, family, direction, event, m5, m15, at,
            expiry.expiresAtMs ?: return null, idText)
    }

    // Empty selected instruments means no local watchlist filter, not no feeds.
    // A contradictory duplicate invalidates the scoped record for this import.
    fun project(
        rows: List<Map<String, String>>,
        nowMs: Long,
        selectedInstruments: Set<String> = emptySet()
    ): List<Item> {
        if (rows.size > 1024 || nowMs <= 0L) return emptyList()
        val selected = QaMarketWatchlist.normalized(selectedInstruments)
        val byKey = linkedMapOf<String, Item>()
        val conflicts = mutableSetOf<String>()
        for (row in rows) {
            val item = validate(row, nowMs) ?: continue
            if (selected.isNotEmpty() && item.instrumentId !in selected) continue
            val scoped = item.eventId + "|" + item.family
            if (scoped in conflicts) continue
            val previous = byKey[scoped]
            if (previous != null && previous != item) {
                byKey.remove(scoped)
                conflicts.add(scoped)
            } else byKey[scoped] = item
        }
        return byKey.values.sortedWith(
            compareByDescending<Item> { it.confirmedAtMs }.thenBy { it.eventId }
        )
    }
}
