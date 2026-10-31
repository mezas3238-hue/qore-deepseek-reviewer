package com.qore.crtalerts

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color

// QA launcher only: no live signals or Firebase credentials connected.
class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 90, 48, 48)
            setBackgroundColor(Color.rgb(9, 20, 32))
            gravity = Gravity.TOP
        }
        fun label(value: String, size: Float, color: Int) {
            val widget = TextView(this).apply {
                text = value
                textSize = size
                setTextColor(color)
                setPadding(0, 0, 0, 28)
            }
            view.addView(widget)
        }
        label("QORE CRT ALERTS", 28f, Color.WHITE)
        label("QA • Android", 15f, Color.rgb(154, 176, 197))
        label("Notificaciones desactivadas", 20f, Color.rgb(250, 194, 105))
        label("Motor CRT/MSS en laboratorio. Falta equivalencia con TradingView, " +
              "proveedor de cotizaciones y Firebase autenticado. Sin señales operativas.",
              16f, Color.WHITE)
        label("34 instrumentos inventariados • feed pendiente", 13f,
              Color.rgb(154, 176, 197))
        setContentView(view)
    }
}
