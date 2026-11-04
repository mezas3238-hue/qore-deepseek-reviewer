package com.qore.crtalerts

import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit

// Single deliberate, user-started reading on the phone with cTrader DEMO.
// Credentials exist only in memory; no VPS, Firebase, trades, LIVE, or logs.
// Requires an already-approved cTrader Open API account/view-only OAuth token.
// Never equates cTrader broker data to IC/OANDA TradingView evidence.
internal class CtraderMobileReadOnceQa(private val status: (String) -> Unit) {
    data class Input(val clientId: String, val clientSecret: String,
                     val viewAccessToken: String, val demoAccountId: Long,
                     val brokerSymbolName: String)

    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .pingInterval(10, TimeUnit.SECONDS)
        .build()
    @Volatile private var socket: WebSocket? = null
    @Volatile private var ended = false

    // Official JSON payloadType IDs; no order/position requests are allowed.
    private val types = setOf(2100, 2149, 2102, 2114, 2137)
    fun stop() {
        ended = true
        socket?.close(1000, "User ended QA")
        socket = null
        client.dispatcher.executorService.shutdown()
        client.connectionPool.evictAll()
    }
    private fun finish(message: String) {
        if (!ended) {
            ended = true
            status(message + " · NO SIGNALS / NO TRADES / NO FCM")
            socket?.close(1000, "QA ended")
        }
    }
    private fun readId(payload: JSONObject, key: String): Long =
        payload.opt(key)?.toString()?.toLongOrNull()?.takeIf { it > 0L }
            ?: throw IllegalArgumentException("invalid ID")
    private fun relative(payload: JSONObject, key: String): Long =
        payload.opt(key)?.toString()?.toLongOrNull()?.takeIf { it >= 0L }
            ?: throw IllegalArgumentException("invalid OHLC")

    fun start(input: Input) {
        if (ended) return
        if (input.clientId.isBlank() || input.clientSecret.isBlank() ||
            input.viewAccessToken.isBlank() ||
            input.demoAccountId <= 0L ||
            !Regex("^[A-Za-z0-9_.:-]{3,80}$").matches(input.brokerSymbolName)) {
            finish("Faltan credenciales DEMO de solo lectura")
            return
        }
        status("Conectando a cTrader DEMO desde tu teléfono")
        var state = 0
        var sequence = 0
        var selectedSymbolId: Long? = null
        fun send(ws: WebSocket, kind: Int, data: JSONObject) {
            if (kind !in types || ended) return
            sequence++
            val envelope = JSONObject()
                .put("clientMsgId", "qore-mobile-qa-" + sequence)
                .put("payloadType", kind)
                .put("payload", data)
            if (!ws.send(envelope.toString())) finish("Error al enviar solicitud de lectura")
        }
        try {
            val request = Request.Builder().url("wss://demo.ctraderapi.com:5036").build()
            socket = client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(ws: WebSocket, response: Response) {
                    send(ws, 2100, JSONObject().put("clientId", input.clientId)
                        .put("clientSecret", input.clientSecret))
                }
                override fun onMessage(ws: WebSocket, text: String) {
                    if (ended) return
                    try {
                        val envelope = JSONObject(text)
                        val kind = envelope.optInt("payloadType", -1)
                        if (kind == 2142) {
                            finish("Solicitud rechazada por cTrader")
                            return
                        }
                        if (kind !in setOf(2101, 2150, 2103, 2115, 2138)) return
                        val body = envelope.optJSONObject("payload") ?:
                            if (kind == 2101) JSONObject()
                            else throw IllegalArgumentException("payload")
                        when (state) {
                            0 -> {
                                if (kind != 2101) throw IllegalArgumentException("sequence")
                                state = 1
                                send(ws, 2149, JSONObject().put("accessToken", input.viewAccessToken))
                            }
                            1 -> {
                                if (kind != 2150) throw IllegalArgumentException("sequence")
                                val scope = body.opt("permissionScope")
                                if (!CtraderPhoneM5Policy.isViewOnlyScope(scope))
                                    throw IllegalArgumentException("not view-only")
                                val accounts = body.optJSONArray("ctidTraderAccount")
                                    ?: throw IllegalArgumentException("accounts")
                                var found = 0
                                for (i in 0 until accounts.length()) {
                                    val item = accounts.optJSONObject(i) ?: continue
                                    if (readId(item, "ctidTraderAccountId") ==
                                        input.demoAccountId) {
                                        if (!CtraderPhoneM5Policy.isExplicitDemo(
                                                item.has("isLive"), item.opt("isLive")))
                                            throw IllegalArgumentException("LIVE denied")
                                        found++
                                    }
                                }
                                if (found != 1) throw IllegalArgumentException("account")
                                state = 2
                                send(ws, 2102, JSONObject()
                                    .put("ctidTraderAccountId", input.demoAccountId.toString())
                                    .put("accessToken", input.viewAccessToken))
                            }
                            2 -> {
                                if (kind != 2103 ||
                                    readId(body, "ctidTraderAccountId") != input.demoAccountId)
                                    throw IllegalArgumentException("account mismatch")
                                state = 3
                                status("Cuenta DEMO comprobada. Leyendo inventario cTrader.")
                                send(ws, 2114, JSONObject()
                                    .put("ctidTraderAccountId", input.demoAccountId.toString())
                                    .put("includeArchivedSymbols", false))
                            }
                            3 -> {
                                if (kind != 2115 ||
                                    readId(body, "ctidTraderAccountId") != input.demoAccountId)
                                    throw IllegalArgumentException("symbols mismatch")
                                val symbols = body.optJSONArray("symbol")
                                    ?: throw IllegalArgumentException("symbols missing")
                                var found = 0
                                for (i in 0 until symbols.length()) {
                                    val s = symbols.optJSONObject(i) ?: continue
                                    if (s.optString("symbolName", "") == input.brokerSymbolName &&
                                        s.opt("enabled") == true) {
                                        selectedSymbolId = readId(s, "symbolId")
                                        found++
                                    }
                                }
                                if (found != 1 || selectedSymbolId == null)
                                    throw IllegalArgumentException("symbol unavailable")
                                state = 4
                                status("Símbolo activo. Solicitando 500 velas M5 históricas.")
                                val now = System.currentTimeMillis()
                                send(ws, 2137, JSONObject()
                                    .put("ctidTraderAccountId", input.demoAccountId.toString())
                                    .put("symbolId", selectedSymbolId.toString())
                                    .put("period", 5)
                                    .put("count", 500)
                                    .put("fromTimestamp", (now - 72L*3600000L).toString())
                                    .put("toTimestamp", now.toString()))
                            }
                            4 -> {
                                if (kind != 2138 ||
                                    readId(body, "ctidTraderAccountId") != input.demoAccountId ||
                                    readId(body, "symbolId") != selectedSymbolId)
                                    throw IllegalArgumentException("trendbar identity")
                                val period = body.opt("period")
                                if (period != 5 && period != "5" && period != "M5")
                                    throw IllegalArgumentException("period")
                                val items = body.optJSONArray("trendbar")
                                    ?: throw IllegalArgumentException("bars")
                                if (items.length() > 500)
                                    throw IllegalArgumentException("bar count")
                                val closed = sortedSetOf<Long>()
                                var phase: Long? = null
                                var openCount = 0
                                for (i in 0 until items.length()) {
                                    val row = items.optJSONObject(i)
                                        ?: throw IllegalArgumentException("bar")
                                    val minute = readId(row, "utcTimestampInMinutes")
                                    val opened = Math.multiplyExact(minute, 60000L)
                                    if (!CtraderPhoneM5Policy.validClosedMinute(
                                            opened, System.currentTimeMillis())) {
                                        openCount++
                                        continue
                                    }
                                    val low = readId(row, "low")
                                    val high = relative(row, "deltaHigh")
                                    val o = relative(row, "deltaOpen")
                                    val c = relative(row, "deltaClose")
                                    if (o > high || c > high)
                                        throw IllegalArgumentException("invalid OHLC")
                                    Math.addExact(low, high)
                                    if (!closed.add(opened))
                                        throw IllegalArgumentException("duplicate")
                                    val p = opened % 300000L
                                    if (phase != null && p != phase)
                                        throw IllegalArgumentException("phase changed")
                                    phase = p
                                }
                                val gaps = CtraderPhoneM5Policy.countGaps(closed.toList())
                                finish("Lectura móvil completada: " + closed.size +
                                    " velas M5 cerradas; " + gaps + " huecos; fase " +
                                    (phase?.div(60000L) ?: "-") + " min; " +
                                    openCount + " abiertas ignoradas. " +
                                    "Fuente DEMO sin equivalencia TV certificada")
                            }
                            else -> throw IllegalArgumentException("invalid state")
                        }
                    } catch (_: Exception) {
                        finish("Respuesta inválida, permisos o fuente no verificables")
                    }
                }
                override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                    finish("Conexión, TLS o red no disponible")
                }
                override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                    if (!ended) finish("Conexión cerrada antes de obtener M5")
                }
            })
        } catch (_: Exception) {
            finish("No se pudo iniciar la conexión TLS desde Android")
        }
    }
}
