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
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
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
            text = "Borrar mi preferencia local"
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
        demoStatus = label("Solo prueba manual, sin señales, Firebase ni servidor.", 13f, amber)
        root.addView(demoStatus)

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
