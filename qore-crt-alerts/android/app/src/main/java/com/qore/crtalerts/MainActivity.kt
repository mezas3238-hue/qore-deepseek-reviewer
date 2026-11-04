package com.qore.crtalerts

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.EditText
import android.text.InputType
import android.view.WindowManager
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView

// QA shell: stores only a local preference, never requests an FCM token or
// authenticates/enrolls a device. A deliberately separate, user-tapped
// local demonstration may request Android POST_NOTIFICATIONS. It can
// display only a clearly labeled non-market, non-Firebase test notice.
// It does NOT enable CRT market notifications or change the QA build lock.
class MainActivity : Activity() {
    private val DEMO_PERMISSION_REQUEST = 4801
    private var demoStatus: TextView? = null
    // On-demand QA only; stop network when the Activity stops.
    private var mobileProbe: CtraderMobileReadOnceQa? = null
    private val navy = Color.rgb(10, 21, 35)
    private val card = Color.rgb(21, 35, 54)
    private val muted = Color.rgb(154, 175, 194)
    private val amber = Color.rgb(244, 185, 80)
    private val cyan = Color.rgb(105, 211, 224)

    private fun label(value: String, sp: Float, tint: Int, bold: Boolean = false): TextView {
        return TextView(this).apply {
            text = value
            textSize = sp
            setTextColor(tint)
            if (bold) setTypeface(typeface, Typeface.BOLD)
            setPadding(0, 0, 0, 14)
        }
    }

    private fun rounded(color: Int): GradientDrawable =
        GradientDrawable().apply { setColor(color); cornerRadius = 24f }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = navy
        window.navigationBarColor = navy
        val prefs = getSharedPreferences(QaConsentGate.PREFS, MODE_PRIVATE)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(navy)
            setPadding(32, 44, 32, 32)
        }
        root.addView(label("QORE  /  CRT ALERTS", 15f, cyan, true))
        root.addView(label("Centro de alertas", 30f, Color.WHITE, true))
        root.addView(label("Versión Android QA · laboratorio aislado", 14f, muted))

        val statusCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(30, 28, 30, 18)
            background = rounded(card)
        }
        statusCard.addView(label("ESTADO DEL SISTEMA", 12f, muted, true))
        statusCard.addView(label("Notificaciones desactivadas", 20f, amber, true))
        statusCard.addView(label(
            "El motor CRT H4 + MSS M15 continúa en evaluación. " +
                "No existe conexión a precios reales ni Firebase STAGING aprobado.",
            15f, Color.WHITE
        ))
        root.addView(statusCard, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = 22 })

        root.addView(label("Preferencias de futura prueba", 19f, Color.WHITE, true).apply {
            setPadding(0, 38, 0, 16)
        })
        val preview = label("", 14f, muted)
        val choice = Switch(this).apply {
            text = "Guardar interés en alertas futuras"
            textSize = 15f
            setTextColor(Color.WHITE)
            isChecked = prefs.getBoolean(QaConsentGate.INTEREST_KEY, false)
        }
        fun refresh() {
            val decision = QaConsentGate.evaluate(
                interest = choice.isChecked,
                buildEnabled = BuildConfig.STAGING_NOTIFICATIONS_ENABLED,
                serverEnrollmentVerified = false,
                tradingEngineCertified = false,
                systemPermission = false
            )
            preview.text = when (decision.state) {
                "NO_LOCAL_INTEREST" -> "Sin interés registrado. Ningún dato se transmite."
                "QA_TRANSPORT_LOCKED" -> "Interés guardado solo en este teléfono. " +
                    "No se ha solicitado permiso de notificaciones ni registrado Firebase."
                else -> "Registro externo pendiente de autorización."
            }
        }
        choice.setOnCheckedChangeListener { _, enabled ->
            // A local preference does not call FirebaseMessaging.getToken,
            // enable auto-init, or request POST_NOTIFICATIONS.
            if (prefs.edit().putBoolean(QaConsentGate.INTEREST_KEY, enabled).commit()) refresh()
            else {
                choice.isChecked = prefs.getBoolean(QaConsentGate.INTEREST_KEY, false)
                refresh()
            }
        }
        root.addView(choice)
        root.addView(preview.apply { setPadding(0, 20, 0, 0) })
        refresh()

        val clear = Button(this).apply {
            text = "Borrar interés local en alertas"
            isAllCaps = false
            setOnClickListener {
                if (prefs.edit().remove(QaConsentGate.INTEREST_KEY).commit()) {
                    choice.isChecked = false
                    refresh()
                }
            }
        }
        root.addView(clear, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = 20 })

        root.addView(label("Mis 34 mercados · selección local", 19f, Color.WHITE, true).apply {
            setPadding(0, 32, 0, 8)
        })
        root.addView(label(
            "Seleccionar mercados guarda solo una preferencia en este teléfono. " +
                "No crea suscripciones, no activa precios ni envía alertas.",
            13f, muted
        ))
        val watchlistPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            visibility = View.GONE
            setPadding(8, 8, 8, 8)
        }
        var chosen = QaMarketWatchlist.normalized(
            prefs.getStringSet(QaMarketWatchlist.SELECTED_SYMBOLS_KEY, emptySet())
                ?.toSet() ?: emptySet()
        )
        val expandWatchlist = Button(this).apply { isAllCaps = false }
        fun refreshWatchlistCount() {
            val count = chosen.size
            expandWatchlist.text = if (watchlistPanel.visibility == View.VISIBLE)
                "Ocultar mercados ($count/34)" else "Elegir mercados ($count/34)"
        }
        var updatingChoices = false
        val checkboxes = mutableListOf<CheckBox>()
        for (instrument in QaMarketWatchlist.symbols) {
            val box = CheckBox(this).apply {
                text = instrument
                textSize = 15f
                setTextColor(Color.WHITE)
                isChecked = instrument in chosen
            }
            box.setOnCheckedChangeListener { _, enabled ->
                if (!updatingChoices) {
                    val next = QaMarketWatchlist.update(chosen, instrument, enabled)
                    if (prefs.edit().putStringSet(
                            QaMarketWatchlist.SELECTED_SYMBOLS_KEY, next.toSet()
                        ).commit()) {
                        chosen = next
                    } else {
                        updatingChoices = true
                        box.isChecked = instrument in chosen
                        updatingChoices = false
                    }
                    refreshWatchlistCount()
                }
            }
            checkboxes.add(box)
            watchlistPanel.addView(box)
        }
        expandWatchlist.setOnClickListener {
            watchlistPanel.visibility =
                if (watchlistPanel.visibility == View.GONE) View.VISIBLE else View.GONE
            refreshWatchlistCount()
        }
        refreshWatchlistCount()
        root.addView(expandWatchlist)
        root.addView(watchlistPanel)
        root.addView(Button(this).apply {
            text = "Borrar selección de mercados"
            isAllCaps = false
            setOnClickListener {
                if (prefs.edit().remove(QaMarketWatchlist.SELECTED_SYMBOLS_KEY).commit()) {
                    chosen = emptySet()
                    updatingChoices = true
                    for (box in checkboxes) box.isChecked = false
                    updatingChoices = false
                    refreshWatchlistCount()
                }
            }
        })

        root.addView(label("LECTURAS DESDE MI CELULAR · cTrader DEMO", 18f, cyan, true)
            .apply { setPadding(0, 36, 0, 8) })
        root.addView(label(
            "Sin VPS. Prueba puntual con la app abierta, permiso accounts / SCOPE_VIEW. " +
            "Consulta un símbolo exacto del broker, nunca activa órdenes ni alertas. " +
            "Las credenciales se escriben solo en tu teléfono y no se guardan.",
            13f, muted
        ))
        val phonePanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            visibility = View.GONE
            setPadding(8, 6, 8, 14)
        }
        fun phoneField(hintText: String, secret: Boolean = false,
                       number: Boolean = false): EditText {
            return EditText(this).apply {
                hint = hintText
                textSize = 14f
                setTextColor(Color.WHITE)
                setHintTextColor(muted)
                isSingleLine = true
                inputType = if (number) InputType.TYPE_CLASS_NUMBER
                    else if (secret) (InputType.TYPE_CLASS_TEXT or
                        InputType.TYPE_TEXT_VARIATION_PASSWORD)
                    else InputType.TYPE_CLASS_TEXT
            }
        }
        val clientIdField = phoneField("Client ID de cTrader Open API")
        val clientSecretField = phoneField("Client Secret · solo en este teléfono", true)
        val tokenField = phoneField("Token OAuth accounts · solo lectura", true)
        val accountField = phoneField("ctidTraderAccountId DEMO", number = true)
        val symbolField = phoneField("Símbolo EXACTO cTrader (ej. BTCUSD)").apply {
            setText("BTCUSD")
        }
        phonePanel.addView(clientIdField)
        phonePanel.addView(clientSecretField)
        phonePanel.addView(tokenField)
        phonePanel.addView(accountField)
        phonePanel.addView(symbolField)
        phonePanel.addView(label(
            "QA personal: el Client Secret en una app instalada no ofrece " +
            "la seguridad de un backend confidencial. No distribuir esta APK " +
            "con credenciales. Cero datos almacenados.",
            12f, amber
        ))
        val phoneStatus = label(
            "Sin conexión. Necesitas tu aplicación Open API aprobada y un " +
            "token accounts de una cuenta DEMO.", 13f, amber
        )
        phonePanel.addView(Button(this).apply {
            text = "Consultar M5 desde este teléfono (solo lectura)"
            isAllCaps = false
            setOnClickListener {
                val accountId = accountField.text.toString().toLongOrNull()
                val symbolName = symbolField.text.toString().trim()
                if (accountId == null || accountId <= 0L ||
                    !Regex("^[A-Za-z0-9_.:-]{3,80}$").matches(symbolName)) {
                    phoneStatus.text = "Cuenta DEMO numérica y símbolo válido del broker requeridos."
                } else {
                    val credentials = CtraderMobileReadOnceQa.Input(
                        clientIdField.text.toString().trim(),
                        clientSecretField.text.toString(),
                        tokenField.text.toString(),
                        accountId, symbolName
                    )
                    // Clear the visible secret text immediately after user action.
                    clientSecretField.text.clear()
                    tokenField.text.clear()
                    mobileProbe?.stop()
                    mobileProbe = CtraderMobileReadOnceQa { message ->
                        runOnUiThread { phoneStatus.text = message }
                    }
                    mobileProbe?.start(credentials)
                }
            }
        })
        phonePanel.addView(Button(this).apply {
            text = "Detener lectura móvil"
            isAllCaps = false
            setOnClickListener {
                mobileProbe?.stop()
                mobileProbe = null
                phoneStatus.text = "Lectura detenida. Sin monitoreo en segundo plano."
            }
        })
        phonePanel.addView(phoneStatus)
        val expandPhone = Button(this).apply {
            text = "Configurar lectura desde mi celular"
            isAllCaps = false
            setOnClickListener {
                val show = phonePanel.visibility != View.VISIBLE
                phonePanel.visibility = if (show) View.VISIBLE else View.GONE
                text = if (show) "Ocultar configuración móvil" else
                    "Configurar lectura desde mi celular"
                if (show) {
                    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                } else {
                    mobileProbe?.stop()
                    mobileProbe = null
                    clientSecretField.text.clear()
                    tokenField.text.clear()
                    window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                }
            }
        }
        root.addView(expandPhone)
        root.addView(phonePanel)

        root.addView(label("BTCUSD · primera prueba", 19f, Color.WHITE, true).apply {
            setPadding(0, 30, 0, 8)
        })
        root.addView(label("CRT H4 NY: 01→05→09, 05→09→13, 21→01→05. " +
            "MSS M15 obligatorio. Coinbase M5 solo lectura: verificado en GitHub, " +
            "no conectado a este teléfono.", 14f, muted))
        val demoButton = Button(this).apply {
            text = "Mostrar notificación LOCAL de prueba"
            isAllCaps = false
            setOnClickListener { requestLocalDemoOnly() }
        }
        root.addView(demoButton)
        val localDemoStatus = label("Solo prueba manual, sin señales, Firebase ni servidor.", 13f, amber)
        demoStatus = localDemoStatus
        root.addView(localDemoStatus)

        root.addView(label("Cobertura prevista: 34 instrumentos · feed continuo pendiente", 13f, muted)
            .apply { setPadding(0, 34, 0, 0) })
        root.addView(label(
            "Para habilitar cualquier entrega se requieren Firebase Auth/App Check " +
                "verificados, permiso Android, fuente M5 autorizada y paridad real " +
                "del indicador Pine. El usuario nunca autoriza señales con este interruptor.",
            13f, muted
        ))

        val scroll = ScrollView(this).apply { isFillViewport = true }
        scroll.addView(root)
        setContentView(scroll)
    }

    override fun onStop() {
        // Foreground-only experiment. A closed/background Activity MUST NOT
        // claim to provide continuous 34-market monitoring.
        mobileProbe?.stop()
        mobileProbe = null
        super.onStop()
    }

    private fun requestLocalDemoOnly() {
        // This button NEVER calls QoreMessagingService, requests an FCM token,
        // activates Firebase auto-init, or changes any consent/certification.
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED) {
            demoStatus?.text = "Permiso Android requerido solo para la prueba local."
            requestPermissions(
                arrayOf(Manifest.permission.POST_NOTIFICATIONS), DEMO_PERMISSION_REQUEST
            )
            return
        }
        postExplicitLocalDemo()
    }

    private fun postExplicitLocalDemo() {
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED) return
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "qore_crt_local_demo_only"
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(NotificationChannel(
                channelId, "Pruebas locales QORE CRT",
                NotificationManager.IMPORTANCE_DEFAULT
            ))
        }
        val notification = if (Build.VERSION.SDK_INT >= 26)
            Notification.Builder(this, channelId) else Notification.Builder(this)
        val built = notification
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("BTCUSD · PRUEBA LOCAL")
            .setContentText("Simulada. No es una señal CRT ni proviene de Firebase.")
            .setAutoCancel(true).build()
        manager.notify(4801, built)
        demoStatus?.text = "Prueba LOCAL solicitada. Alertas del mercado: BLOQUEADAS."
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != DEMO_PERMISSION_REQUEST) return
        if (grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            postExplicitLocalDemo()
        } else {
            demoStatus?.text = "Permiso denegado. Sin notificación de prueba."
        }
    }
}
