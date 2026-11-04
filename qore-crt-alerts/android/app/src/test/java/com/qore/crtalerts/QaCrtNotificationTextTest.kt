package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test
import java.util.TimeZone

class QaCrtNotificationTextTest {
    private val c1=1793336400000L
    private val crt=c1+28_800_000L
    private val m5=crt+300_000L
    private val m15=crt+900_000L

    private fun payload(eventType:String, eventAt:Long,
                        m5Known:Boolean=false,m15Known:Boolean=false):Map<String,String> {
        val parts=mutableMapOf(
            "schema" to "QORE_CRT_STAGING_V2",
            "mode" to "STAGING_APPROVED", "certified" to "true",
            "kind" to "CRT_STATUS", "instrumentId" to "USDCAD",
            "tvSymbol" to "IC:USDCAD", "family" to "MULTI4",
            "direction" to "BULLISH",
            "mssM5" to if(m5Known) "CONFIRMED" else "AWAITING",
            "mssM15" to if(m15Known) "CONFIRMED" else "AWAITING",
            "c1StartMs" to "$c1", "eventAtMs" to "$eventAt",
            "eventType" to eventType,
            "eventId" to "IC|USDCAD|$c1|1|$eventType|$eventAt",
            "ohlcSha256" to "a".repeat(64)
        )
        if(m5Known){parts["mssM5AtMs"]="$m5";parts["mssM5Price"]="1.38215"}
        if(m15Known){parts["mssM15AtMs"]="$m15";parts["mssM15Price"]="1.38340"}
        return parts
    }

    @Test fun separateCrtM5M15StagesAndPrices() {
        val crtEvent=NotificationPolicy.evaluate(payload("CRT_OBSERVED",crt),true)
        val m5Event=NotificationPolicy.evaluate(payload("MSS_M5_OBSERVED",m5,true),true)
        val m15Event=NotificationPolicy.evaluate(payload("MSS_M15_OBSERVED",m15,true,true),true)
        assertTrue(crtEvent.reason,crtEvent.accepted)
        assertTrue(m5Event.reason,m5Event.accepted)
        assertTrue(m15Event.reason,m15Event.accepted)
        val zone=TimeZone.getTimeZone("UTC")
        val a=QaCrtNotificationText.render(crtEvent,zone)
        val b=QaCrtNotificationText.render(m5Event,zone)
        val c=QaCrtNotificationText.render(m15Event,zone)
        assertEquals("USDCAD · MULTI4 alcista",a.title)
        assertTrue(a.expanded.contains("CRT H4 detectado"))
        assertTrue(a.expanded.contains("MSS M5: Pendiente"))
        assertTrue(a.expanded.contains("MSS M15: Pendiente"))
        assertTrue(b.expanded.contains("MSS M5 confirmado"))
        assertTrue(b.expanded.contains("1.38215"))
        assertTrue(b.expanded.contains("MSS M15: Pendiente"))
        assertTrue(c.expanded.contains("MSS M15 confirmado"))
        assertTrue(c.expanded.contains("1.38340"))
        assertTrue(c.expanded.contains("1.38215"))
        assertEquals("BUILD_LOCKED",NotificationPolicy.evaluate(
            payload("MSS_M15_OBSERVED",m15,true,true),
            BuildConfig.STAGING_NOTIFICATIONS_ENABLED).reason)
    }

    @Test fun confirmedStageRequiresTimestampPriceAndExactEventTime() {
        val good=payload("MSS_M5_OBSERVED",m5,true)
        assertEquals("INVALID_MSS5_PROOF",NotificationPolicy.evaluate(
            good - "mssM5Price",true).reason)
        assertEquals("INVALID_MSS5_PROOF",NotificationPolicy.evaluate(
            good + ("mssM5Price" to "0"),true).reason)
        assertEquals("INVALID_MSS5_PROOF",NotificationPolicy.evaluate(
            good + ("mssM5AtMs" to (m5+60_000L).toString()),true).reason)
        assertEquals("INVALID_MSS5_PROOF",NotificationPolicy.evaluate(
            good + ("mssM5AtMs" to "$crt"),true).reason)
        val pendingWithFuture=payload("CRT_OBSERVED",crt)+
            mapOf("mssM5AtMs" to "$m5", "mssM5Price" to "1.38215")
        assertEquals("INVALID_MSS5_PROOF",NotificationPolicy.evaluate(
            pendingWithFuture,true).reason)
        val m15Good=payload("MSS_M15_OBSERVED",m15,true,true)
        assertEquals("INVALID_MSS15_PROOF",NotificationPolicy.evaluate(
            m15Good + ("mssM15AtMs" to "$m5"),true).reason)
        assertEquals("INVALID_MSS15_PROOF",NotificationPolicy.evaluate(
            m15Good + ("mssM15Price" to "NaN"),true).reason)
    }
}
