package com.qore.crtalerts

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

// Presentation only. These words cannot authorize FCM or promote QA data.
internal object QaCrtNotificationText {
    data class Content(val title: String, val collapsed: String, val expanded: String)

    fun render(
        event: NotificationPolicy.Decision,
        zone: TimeZone = TimeZone.getDefault()
    ): Content {
        val symbol = event.instrument ?: "DESCONOCIDO"
        val family = event.family ?: "SIN FAMILIA"
        val direction = when (event.direction) {
            "BULLISH" -> "alcista"
            "BEARISH" -> "bajista"
            else -> "sin dirección"
        }
        val title = "$symbol · $family $direction"
        val stage = when (event.eventType) {
            "CRT_OBSERVED" -> "CRT H4 detectado"
            "MSS_M5_OBSERVED" -> "MSS M5 confirmado"
            "MSS_M15_OBSERVED" -> "MSS M15 confirmado"
            else -> "Estado CRT/MSS"
        }
        val formatter = SimpleDateFormat("dd/MM HH:mm", Locale("es", "PY")).apply {
            timeZone = zone
        }
        fun status(value: String?, atMs: Long?, price: String?): String = when (value) {
            "CONFIRMED" -> if (atMs != null && price != null)
                "Confirmado · ${formatter.format(Date(atMs))} · $price"
                else "Confirmación sin precio/hora — bloqueada"
            "AWAITING" -> "Pendiente"
            "UNVERIFIED" -> "No verificado (QA)"
            else -> "Sin información"
        }
        val m5 = "MSS M5: ${status(event.mssM5, event.mssM5AtMs, event.mssM5Price)}"
        val m15 = "MSS M15: ${status(event.mssM15, event.mssM15AtMs, event.mssM15Price)}"
        val expanded = listOf(stage, m5, m15, "Fuente: ${event.tvSymbol ?: "N/D"}").joinToString("\n")
        return Content(title, "$stage · $m5 · $m15", expanded)
    }
}
