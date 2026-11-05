package com.qore.crtalerts

import android.app.Activity
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// Native UI only. No data subscription, Firebase token, financial orders
// or client-side self-certification. The original QA tools remain accessible.
class QoreDashboardActivity : Activity() {
    private val navy = Color.rgb(8, 20, 35)
    private val panel = Color.rgb(20, 39, 60)
    private val raised = Color.rgb(31, 53, 77)
    private val border = Color.rgb(48, 69, 90)
    private val white = Color.WHITE
    private val muted = Color.rgb(163, 184, 205)
    private val aqua = Color.rgb(105, 216, 234)
    private val green = Color.rgb(105, 222, 184)
    private val amber = Color.rgb(232, 181, 93)
    private val red = Color.rgb(239, 155, 155)
    private val prefs by lazy { getSharedPreferences(QaConsentGate.PREFS, MODE_PRIVATE) }

    private val qaNotificationPermissionCode = 4862
    private var qaStatus = "Sin vinculación de Firebase QA."
    private var qaStatusView: TextView? = null
    private fun reportQaStatus(message: String) {
        qaStatus = message
        qaStatusView?.text = message
    }
    private fun beginQaEnrollment() {
        if (!BuildConfig.QA_TEST_TRANSPORT_ENABLED) {
            reportQaStatus("Prueba FCM bloqueada: faltan proyecto Firebase y URL HTTPS.")
            return
        }
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                qaNotificationPermissionCode)
            return
        }
        QaDeviceTransport.enroll(this) { reportQaStatus(it) }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != qaNotificationPermissionCode) return
        if (grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED)
            QaDeviceTransport.enroll(this) { reportQaStatus(it) }
        else reportQaStatus("Permiso Android denegado: no se activaron pruebas.")
    }

    private var tab = 0
    private var examplesOpen = false
    private var watchlist: Set<String> = emptySet()
    private var imported: List<Map<String, String>> = emptyList()
    private var importStatus = "Sin eventos QA importados. Alertas reales desactivadas."
    private lateinit var page: LinearLayout
    private lateinit var scroller: ScrollView
    private lateinit var navigation: LinearLayout

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density + 0.5f).toInt()
    private fun bg(color: Int, radius: Int = 14, outlined: Boolean = false): GradientDrawable =
        GradientDrawable().apply {
            setColor(color)
            cornerRadius = dp(radius).toFloat()
            if (outlined) setStroke(dp(1), border)
        }
    private fun text(value: String, size: Float = 14f, color: Int = white,
                     bold: Boolean = false) = TextView(this).apply {
        text = value
        textSize = size
        setTextColor(color)
        if (bold) setTypeface(typeface, Typeface.BOLD)
        setLineSpacing(dp(2).toFloat(), 1f)
    }
    private fun vertical() = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
    }
    private fun row() = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
    }
    private fun spacer(parent: LinearLayout, height: Int) {
        parent.addView(View(this), LinearLayout.LayoutParams(1, dp(height)))
    }
    private fun append(parent: LinearLayout, view: View, top: Int = 0) {
        parent.addView(view, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(top) })
    }
    private fun card() = vertical().apply {
        background = bg(panel, 16, true)
        setPadding(dp(16), dp(15), dp(16), dp(15))
    }
    private fun rule(parent: LinearLayout) {
        parent.addView(View(this).apply { setBackgroundColor(border) },
            LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(1)).apply {
                topMargin = dp(12)
                bottomMargin = dp(8)
            })
    }
    private fun button(value: String, click: () -> Unit) = Button(this).apply {
        text = value
        textSize = 13f
        isAllCaps = false
        setTextColor(white)
        background = bg(raised, 12, true)
        setOnClickListener { click() }
    }
    private fun statusLine(box: LinearLayout, label: String, value: String, tint: Int = muted) {
        val r = row()
        r.addView(text(label, 13f), LinearLayout.LayoutParams(
            0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        r.addView(text(value, 12f, tint))
        append(box, r, 9)
    }
    private fun heading(name: String, note: String) {
        append(page, text(name, 26f, white, true))
        append(page, text(note, 13f, muted), 4)
        spacer(page, 19)
    }
    private fun current() = QaReplayInboxPreview.project(
        imported, System.currentTimeMillis(), watchlist
    )
    private fun date(timestamp: Long) =
        SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(Date(timestamp))
    private fun family(name: String) = when (name) {
        "CRT_2C_RETURN" -> "CRT 2C retorno"
        "CRT_3C_TRUE" -> "CRT 3C"
        "INSIDE_RETURN" -> "Inside retorno"
        "INSIDE_CONTINUATION_REJECTED" -> "Inside continuación rechazada"
        "MULTI4" -> "CRT Multi4"
        "MULTI_N" -> "CRT Multi-N"
        "M15_RETEST" -> "Retest M15"
        else -> "CRT QA"
    }
    private fun stage(value: String) = when (value) {
        "CONFIRMED" -> "Confirmado"
        "AWAITING" -> "Pendiente"
        else -> "No verificado"
    }
    private fun stageColor(value: String) = if (value == "CONFIRMED") green else amber

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = navy
        window.navigationBarColor = navy
        tab = savedInstanceState?.getInt("tab")?.coerceIn(0, 3) ?: 0
        watchlist = QaMarketWatchlist.normalized(prefs.getStringSet(
            QaMarketWatchlist.SELECTED_SYMBOLS_KEY, emptySet()
        )?.toSet() ?: emptySet())

        val shell = vertical().apply { setBackgroundColor(navy) }
        val head = row().apply {
            setPadding(dp(18), dp(18), dp(18), dp(15))
        }
        val brand = vertical()
        append(brand, text("QORE  /  CRT ALERTS", 18f, aqua, true))
        append(brand, text("Centro de monitoreo", 12f, muted), 2)
        head.addView(brand, LinearLayout.LayoutParams(
            0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        head.addView(text("●  QA", 12f, amber, true).apply {
            background = bg(raised, 16)
            setPadding(dp(11), dp(8), dp(11), dp(8))
        })
        append(shell, head)

        page = vertical().apply {
            setPadding(dp(17), dp(14), dp(17), dp(30))
        }
        scroller = ScrollView(this).apply {
            isFillViewport = true
            addView(page)
        }
        shell.addView(scroller, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        navigation = row().apply {
            setPadding(dp(7), dp(9), dp(7), dp(11))
            setBackgroundColor(panel)
        }
        append(shell, navigation)
        setContentView(shell)
        draw()
    }
    override fun onSaveInstanceState(outState: Bundle) {
        outState.putInt("tab", tab)
        super.onSaveInstanceState(outState)
    }
    private fun open(index: Int) {
        tab = index
        draw()
    }
    private fun draw() {
        page.removeAllViews()
        when (tab) {
            0 -> home()
            1 -> markets()
            2 -> alerts()
            else -> settings()
        }
        navigation.removeAllViews()
        val icons = listOf("⌂", "▦", "◉", "⚙")
        val labels = listOf("Inicio", "Mercados", "Alertas", "Ajustes")
        for (n in 0..3) {
            val cell = vertical().apply {
                gravity = Gravity.CENTER
                setPadding(dp(3), dp(3), dp(3), dp(3))
                isClickable = true
                isFocusable = true
                contentDescription = "Abrir " + labels[n]
                setOnClickListener { open(n) }
            }
            val tint = if (n == tab) aqua else muted
            cell.addView(text(icons[n], 22f, tint, n == tab))
            cell.addView(text(labels[n], 11f, tint, n == tab))
            navigation.addView(cell, LinearLayout.LayoutParams(
                0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        }
        scroller.scrollTo(0, 0)
    }

    private fun home() {
        heading("Centro de alertas", "CRT H4 y confirmaciones MSS M5 / MSS M15")
        val overview = card()
        statusLine(overview, "Estado de conexión", "QA · No conectado", amber)
        append(overview, text(
            "Railway DEMO aún no está desplegado ni autorizado con una " +
                "cuenta de solo lectura. No existen señales en vivo.", 13f
        ), 12)
        rule(overview)
        val metricRow = row()
        val entries = listOf(
            "34" to "Mercados configurados",
            "0" to "Señales en vivo",
            "4 h" to "Vigencia máxima"
        )
        entries.forEachIndexed { i, entry ->
            val metric = vertical().apply {
                gravity = Gravity.CENTER
                background = bg(raised, 10)
                setPadding(dp(3), dp(11), dp(3), dp(11))
            }
            metric.addView(text(entry.first, 22f, white, true))
            metric.addView(text(entry.second, 10f, muted).apply {
                gravity = Gravity.CENTER
                textAlignment = View.TEXT_ALIGNMENT_CENTER
            })
            metricRow.addView(metric, LinearLayout.LayoutParams(
                0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f
            ).apply { if (i > 0) leftMargin = dp(7) })
        }
        append(overview, metricRow, 4)
        append(page, overview)

        val rows = current()
        append(page, text("Buzón de eventos", 19f, white, true), 22)
        append(page, text(
            if (rows.isEmpty()) "No hay eventos QA vigentes importados."
            else rows.size.toString() + " eventos de laboratorio (NO OPERAR).",
            13f, muted
        ), 5)
        rows.take(2).forEach { append(page, observedCard(it), 11) }
        append(page, button("Ver alertas y eventos") { open(2) }, 12)

        append(page, text("Vista de ejemplo", 19f, white, true), 22)
        append(page, text(
            "Tarjetas ficticias para revisar el diseño; nunca son señales del mercado.",
            12f, muted
        ), 6)
        append(page, button(
            if (examplesOpen) "Ocultar ejemplos" else "Mostrar ejemplos ficticios"
        ) {
            examplesOpen = !examplesOpen
            draw()
        }, 11)
        if (examplesOpen) {
            append(page, demoCard("USDCAD", "CRT Multi4", "Alcista",
                "Confirmado", "Pendiente"), 11)
            append(page, demoCard("XAUUSD", "CRT 3C", "Bajista",
                "Pendiente", "Pendiente"), 11)
        }
        append(page, text(
            "Próxima etapa: certificar los 34 instrumentos, sus siete familias " +
                "y el MSS propio de cada temporalidad antes de habilitar notificaciones.",
            12f, muted
        ), 20)
    }

    private fun observedCard(item: QaReplayInboxPreview.Item): LinearLayout {
        val box = card()
        val r = row()
        r.addView(text(item.instrumentId + "  ·  IC Markets", 17f, white, true),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        r.addView(text(
            if (item.direction == "BULLISH") "↗ Alcista" else "↘ Bajista",
            13f, if (item.direction == "BULLISH") green else red, true
        ))
        append(box, r)
        append(box, text(family(item.family) + " · " + item.eventType, 13f), 10)
        statusLine(box, "MSS M5", stage(item.mssM5), stageColor(item.mssM5))
        statusLine(box, "MSS M15", stage(item.mssM15), stageColor(item.mssM15))
        rule(box)
        append(box, text(
            "Confirmación: " + date(item.confirmedAtMs) +
                "\nVence: " + date(item.expiresAtMs),
            12f, muted
        ))
        append(box, text("OFFLINE REPLAY · NO CERTIFICADO · NO OPERAR",
            11f, amber, true), 10)
        return box
    }

    private fun demoCard(symbol: String, name: String, direction: String,
                         m5: String, m15: String): LinearLayout {
        val box = card()
        append(box, text("EJEMPLO FICTICIO · NO ES UNA SEÑAL", 11f, amber, true))
        val r = row()
        r.addView(text(symbol + "  ·  IC Markets", 17f, white, true),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        r.addView(text(direction, 12f,
            if (direction == "Alcista") green else red, true))
        append(box, r, 10)
        append(box, text(name + " · H4", 14f), 7)
        statusLine(box, "CRT", "Ejemplo", amber)
        statusLine(box, "MSS M5", m5, if (m5 == "Confirmado") green else amber)
        statusLine(box, "MSS M15", m15, amber)
        rule(box)
        append(box, text(
            "Los eventos reales mostrarán hora, precio de cierre " +
                "verificado y vencimiento individual.", 12f, muted
        ))
        return box
    }

    private fun markets() {
        heading("Mis 34 mercados", "IC Markets · selección local de instrumentos")
        val intro = card()
        append(intro, text(watchlist.size.toString() + " / 34 seleccionados",
            19f, white, true))
        append(intro, text(
            "Esto solo guarda una preferencia. Con 0 seleccionados, " +
                "la vista QA muestra todos los eventos válidos.",
            12f, muted
        ), 7)
        append(page, intro)
        val input = EditText(this).apply {
            hint = "Buscar: EURUSD, BTCUSD…"
            setSingleLine(true)
            textSize = 14f
            setTextColor(white)
            setHintTextColor(muted)
            background = bg(raised, 12)
            setPadding(dp(12), dp(11), dp(12), dp(11))
        }
        append(page, input, 15)
        val list = vertical()
        append(page, list, 10)
        fun fill(query: String) {
            list.removeAllViews()
            val matches = QaMarketWatchlist.symbols.filter {
                it.contains(query.trim(), ignoreCase = true)
            }
            if (matches.isEmpty()) append(list, text("Sin resultados.", 13f, muted))
            for (id in matches) {
                val r = row().apply {
                    background = bg(panel, 12, true)
                    setPadding(dp(12), dp(5), dp(11), dp(5))
                }
                val native = when (id) {
                    "NDX100" -> " · IC:USTEC"
                    "SPX500" -> " · IC:US500"
                    else -> ""
                }
                r.addView(text(id + native, 15f, white, true),
                    LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
                val check = CheckBox(this).apply {
                    isChecked = id in watchlist
                    contentDescription = "Seleccionar " + id
                    setOnCheckedChangeListener { _, isSelected ->
                        val next = QaMarketWatchlist.update(watchlist, id, isSelected)
                        if (prefs.edit().putStringSet(
                            QaMarketWatchlist.SELECTED_SYMBOLS_KEY, next.toSet()
                        ).commit()) watchlist = next
                        else isChecked = id in watchlist
                    }
                }
                r.addView(check)
                r.setOnClickListener { check.isChecked = !check.isChecked }
                append(list, r, 7)
            }
        }
        input.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int,
                                           count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int,
                                       before: Int, count: Int) {
                fill(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })
        fill("")
        append(page, button("Borrar selección") {
            if (prefs.edit().remove(QaMarketWatchlist.SELECTED_SYMBOLS_KEY).commit()) {
                watchlist = emptySet()
                draw()
            }
        }, 15)
    }

    private fun alerts() {
        heading("Alertas", "Eventos CRT, MSS M5 y MSS M15 independientes")
        val notice = card()
        append(notice, text("TRANSPORTE BLOQUEADO · QA", 13f, amber, true))
        append(notice, text(
            "Solo se admiten eventos OFFLINE_REPLAY de laboratorio. " +
                "No son notificaciones enviadas ni señales operables.",
            12f, muted
        ), 7)
        append(page, notice)
        append(page, button("Actualizar bandeja QA desde Railway") {
            QaDeviceTransport.fetchQaInbox(this,
                { message -> importStatus = message },
                { rows ->
                    imported = rows
                    importStatus = "Bandeja QA sincronizada: " + rows.size + " eventos."
                    open(2)
                })
        }, 12)
        append(page, text("Importar pruebas locales", 18f, white, true), 21)
        append(page, text(
            "Pega el JSON de /qa/v1/alerts. Las alertas vencen " +
                "4 horas después del cierre de su vela.",
            12f, muted
        ), 6)
        val input = EditText(this).apply {
            hint = "JSON con campo alerts: [...]"
            setTextColor(white)
            setHintTextColor(muted)
            textSize = 13f
            minLines = 3
            maxLines = 5
            background = bg(raised, 12)
            setPadding(dp(12), dp(11), dp(12), dp(11))
        }
        append(page, input, 12)
        append(page, button("Importar y validar") {
            val value = input.text.toString()
            if (value.length > 150_000) {
                importStatus = "Rechazado: supera 150.000 caracteres."
            } else try {
                val array = org.json.JSONObject(value).getJSONArray("alerts")
                if (array.length() > 1024) {
                    importStatus = "Rechazado: máximo 1.024 eventos."
                } else {
                    val rows = mutableListOf<Map<String, String>>()
                    for (i in 0 until array.length()) {
                        val obj = array.optJSONObject(i) ?: continue
                        val map = mutableMapOf<String, String>()
                        val keys = obj.keys()
                        while (keys.hasNext()) {
                            val key = keys.next()
                            val field = obj.opt(key)
                            if (field != null && field != org.json.JSONObject.NULL &&
                                (field is String || field is Number || field is Boolean)) {
                                map[key] = field.toString()
                            }
                        }
                        rows.add(map)
                    }
                    imported = rows
                    importStatus = current().size.toString() +
                        " eventos QA válidos y vigentes."
                }
            } catch (_: Exception) {
                importStatus = "JSON inválido. Se necesita un campo alerts."
            }
            draw()
        }, 11)
        append(page, text(importStatus, 12f, amber), 9)
        val rows = current()
        append(page, text("Vigentes: " + rows.size, 18f, white, true), 21)
        if (rows.isEmpty()) append(page, text(
            "No hay eventos vigentes. Ninguna señal ha sido enviada.", 13f, muted
        ), 7)
        rows.take(50).forEach { append(page, observedCard(it), 11) }
        if (rows.size > 50) append(page, text(
            "Se muestran los 50 más recientes.", 12f, muted
        ), 7)
        append(page, button("Limpiar buzón temporal") {
            imported = emptyList()
            importStatus = "Buzón temporal limpio."
            draw()
        }, 17)
    }

    private fun settings() {
        heading("Ajustes", "Preferencias y seguridad del sistema")
        val notifications = card()
        append(notifications, text("Notificaciones", 18f, white, true))
        val interested = Switch(this).apply {
            text = "Guardar interés en alertas futuras"
            textSize = 14f
            setTextColor(white)
            isChecked = prefs.getBoolean(QaConsentGate.INTEREST_KEY, false)
            setOnCheckedChangeListener { _, selected ->
                if (!prefs.edit().putBoolean(QaConsentGate.INTEREST_KEY, selected).commit())
                    isChecked = prefs.getBoolean(QaConsentGate.INTEREST_KEY, false)
            }
        }
        append(notifications, interested, 9)
        append(notifications, text(
            "No solicita permisos, tokens ni activa Firebase. El build " +
                "conserva bloqueado el envío de avisos del mercado.",
            12f, muted
        ), 8)
        rule(notifications)
        statusLine(notifications, "Vigencia por evento", "4 horas", aqua)
        statusLine(notifications, "Firebase / FCM", "No conectado", amber)
        statusLine(notifications, "Detector CRT/MSS", "Sin certificar", amber)
        append(page, notifications)

        val connectivity = card()
        append(connectivity, text("Conectividad cTrader DEMO", 18f, white, true))
        append(connectivity, text(
            "Railway STAGING preparado, todavía sin autorización " +
                "de lectura ni ejecución confirmada. No usar cuentas LIVE.",
            13f, muted
        ), 9)
        append(connectivity, button("Abrir herramientas DEMO anteriores") {
            startActivity(Intent(this, MainActivity::class.java))
        }, 12)
        append(page, connectivity, 14)

        val test = card()
        append(test, text("Recepción de pruebas FCM", 18f, white, true))
        statusLine(test, "Estado", if (BuildConfig.QA_TEST_TRANSPORT_ENABLED)
            "Configurado QA" else "Pendiente Firebase/HTTPS", amber)
        append(test, text(
            "La prueba es un aviso del sistema y no muestra señales CRT. " +
            "Para asociar este teléfono se requiere Firebase Auth, App Check y " +
            "la autorización del propietario en Railway.",
            12f, muted
        ), 8)
        qaStatusView = text(qaStatus, 12f, aqua)
        append(test, qaStatusView!!, 9)
        append(test, button("Vincular mi Android para pruebas") {
            beginQaEnrollment()
        }, 12)
        append(test, button("Enviar notificación de conexión (NO señal)") {
            QaDeviceTransport.ping(this) { reportQaStatus(it) }
        }, 9)
        append(test, button("Desvincular mi teléfono") {
            QaDeviceTransport.unregister(this) { reportQaStatus(it) }
        }, 9)
        append(page, test, 14)

        val safety = card()
        append(safety, text("Seguridad", 18f, white, true))
        statusLine(safety, "Mercados configurados", "34")
        statusLine(safety, "Órdenes de trading", "Bloqueadas", green)
        statusLine(safety, "Alertas automáticas", "Bloqueadas", amber)
        append(safety, text(
            "Los ejemplos no son señales. Una alerta vigente " +
                "cuatro horas no implica que exista una entrada ejecutable.",
            12f, muted
        ), 13)
        append(page, safety, 14)
    }
}
