package com.qore.crtalerts

// Future authenticated STAGING contract for separate CRT/MSS notifications.
// QA build is hard-locked BEFORE this validator; payloads are not proof of
// market data, certification or device enrollment by themselves.
internal object QaCrtStatusContract {
    data class Result(
        val ok: Boolean, val reason: String,
        val eventId: String? = null, val instrument: String? = null,
        val direction: String? = null, val family: String? = null,
        val eventType: String? = null, val mssM5: String? = null,
        val mssM15: String? = null, val tvSymbol: String? = null,
        val mssM5AtMs: Long? = null, val mssM5Price: String? = null,
        val mssM15AtMs: Long? = null, val mssM15Price: String? = null
    )
    private fun fail(reason: String) = Result(false, reason)
    private val marketSources = listOf(
        "IC:AUDJPY","IC:GBPUSD","IC:GBPJPY","IC:XAUUSD",
        "IC:USTEC","IC:US500","IC:US30","IC:BTCUSD",
        "IC:AUDUSD","IC:USDCAD","IC:USDJPY","IC:EURUSD",
        "IC:USDCHF","IC:NZDUSD","IC:NZDJPY","IC:NZDCHF",
        "IC:XAGUSD","IC:AUDCAD","IC:AUDCHF","IC:AUDNZD",
        "IC:CADCHF","IC:CADJPY","IC:CHFJPY","IC:EURAUD",
        "IC:EURCAD","IC:EURCHF","IC:EURGBP","IC:EURJPY",
        "IC:EURNZD","IC:GBPAUD","IC:GBPCAD","IC:GBPCHF",
        "IC:GBPNZD","IC:NZDCAD"
    )
    private val families = setOf(
        "CRT_2C_RETURN","CRT_3C_TRUE","INSIDE_RETURN",
        "INSIDE_CONTINUATION_REJECTED",
        "MULTI4","MULTI_N","M15_RETEST"
    )
    private val kinds = setOf("CRT_OBSERVED","MSS_M5_OBSERVED","MSS_M15_OBSERVED")
    private val statuses = setOf("AWAITING","CONFIRMED","UNVERIFIED")
    fun check(d: Map<String,String>): Result {
        if (d["mode"]!="STAGING_APPROVED" || d["certified"]!="true")
            return fail("UNCERTIFIED_SOURCE")
        if (d["kind"]!="CRT_STATUS") return fail("INVALID_KIND")
        val id=d["instrumentId"]?:return fail("NO_SYMBOL")
        val tv=d["tvSymbol"]?:return fail("NO_SOURCE")
        val slot=QaMarketWatchlist.symbols.indexOf(id)
        if (slot<0 || marketSources[slot]!=tv) return fail("SOURCE_MISMATCH")
        val fam=d["family"]?:return fail("NO_FAMILY")
        val event=d["eventType"]?:return fail("NO_EVENT")
        val m5=d["mssM5"]?:return fail("NO_MSS5")
        val m15=d["mssM15"]?:return fail("NO_MSS15")
        val dir=d["direction"]?:return fail("NO_DIRECTION")
        if (fam !in families || event !in kinds ||
            m5 !in statuses || m15 !in statuses ||
            (dir!="BULLISH" && dir!="BEARISH"))
            return fail("INVALID_CRT_MSS_STATUS")
        if (event=="MSS_M5_OBSERVED" && m5!="CONFIRMED" ||
            event=="MSS_M15_OBSERVED" && m15!="CONFIRMED")
            return fail("UNCONFIRMED_MSS")
        if (!Regex("^[a-f0-9]{64}$").matches(d["ohlcSha256"]?:""))
            return fail("MISSING_OHLC_PROOF")
        val c1=d["c1StartMs"]?.toLongOrNull()?:return fail("INVALID_TIME")
        val at=d["eventAtMs"]?.toLongOrNull()?:return fail("INVALID_TIME")
        if (c1<=0 || at<=c1 || at-c1>345_600_000L ||
            c1%60_000L!=0L || at%60_000L!=0L)
            return fail("INVALID_TIME")
        val phase=c1%300_000L
        val step=if(event=="MSS_M15_OBSERVED")900_000L else 300_000L
        if(at%step!=phase) return fail("NATIVE_PHASE_MISMATCH")
        // Each confirmed MSS must carry its OWN exact closed-bar time and
        // positive close price. No pending stage may borrow future proof.
        val pricePattern=Regex("^[0-9]{1,9}(?:\\.[0-9]{1,10})?$")
        fun hasValidProof(state:String,tf:String):Boolean {
            val timeText=d["mss${tf}AtMs"]
            val priceText=d["mss${tf}Price"]
            if(state!="CONFIRMED") return timeText==null && priceText==null
            val confirmedAt=timeText?.toLongOrNull()?:return false
            val close=priceText?.takeIf { pricePattern.matches(it) }
                ?.toBigDecimalOrNull()?:return false
            val unit=if(tf=="M15")900_000L else 300_000L
            return close.signum()>0 && confirmedAt>c1 &&
                confirmedAt<=at && confirmedAt%unit==phase &&
                (event!="MSS_${tf}_OBSERVED" || confirmedAt==at)
        }
        if (!hasValidProof(m5,"M5")) return fail("INVALID_MSS5_PROOF")
        if (!hasValidProof(m15,"M15")) return fail("INVALID_MSS15_PROOF")
        val eventId=d["eventId"]?:return fail("NO_EVENT_ID")
        val expected=listOf(tv.substringBefore(':'),id,c1,
            if(dir=="BULLISH")1 else -1,event,at).joinToString("|")
        if (eventId!=expected || eventId.length>256)
            return fail("EVENT_ID_MISMATCH")
        return Result(true,"STAGING_CONTRACT_PASS",eventId,id,dir,fam,event,m5,m15,
            tv,d["mssM5AtMs"]?.toLongOrNull(),d["mssM5Price"],
            d["mssM15AtMs"]?.toLongOrNull(),d["mssM15Price"])
    }
}
