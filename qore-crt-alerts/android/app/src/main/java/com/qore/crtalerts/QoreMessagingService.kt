package com.qore.crtalerts

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

// No Firebase project, token registration or backend integration yet.
// QA build has notifications disabled at compile time (not runtime config).
class QoreMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Never log or upload a token without an authenticated device API.
    }
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        // Only an explicitly enrolled device can show a non-market QA ping.
        // This path never calls the CRT/MSS notification policy.
        if (message.data["schema"] == "QORE_QA_SYSTEM_TEST_V1") {
            showSystemTransportTest(message.data)
            return
        }
        // Hard block in QA, even for forged "certified" payloads.
        if (!BuildConfig.STAGING_NOTIFICATIONS_ENABLED) return
        // A future permitted data-only FCM message MUST carry the original
        // closed-bar confirmation and exact 4-hour expiry. No stale pushes.
        val expiry = QaFourHourAlertPolicy.check(message.data, System.currentTimeMillis())
        if (!expiry.accepted) return
        val result = NotificationPolicy.evaluate(
            message.data, BuildConfig.STAGING_NOTIFICATIONS_ENABLED
        )
        if (!result.accepted) return
        // Incoming FCM data never grants local consent, certification or
        // authenticated server enrollment. Those are independent checks.
        val interested = getSharedPreferences(QaConsentGate.PREFS, MODE_PRIVATE)
            .getBoolean(QaConsentGate.INTEREST_KEY, false)
        if (!QaConsentGate.evaluate(
                interest = interested,
                buildEnabled = BuildConfig.STAGING_NOTIFICATIONS_ENABLED,
                serverEnrollmentVerified = false,
                tradingEngineCertified = false,
                systemPermission = if (Build.VERSION.SDK_INT >= 33)
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
                        PackageManager.PERMISSION_GRANTED else true
            ).canShowNotification) return
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) return
        val eventId = result.eventId ?: return
        // The eventId V2 wire format lacks family. Never suppress one CRT
        // family because a different family has the same timestamp.
        val scopedEventId = eventId + "|" + (result.family ?: "")
        val memory = getSharedPreferences("crt_staging_seen", MODE_PRIVATE)
        val nowMs = System.currentTimeMillis()
        val previouslySeenUntil = memory.all[scopedEventId] as? Long ?: 0L
        if (previouslySeenUntil > nowMs) return
        // Do not retain historical event identifiers for 7/30 days or
        // indefinitely. At each new alert, remove expired dedup entries.
        val cleanup = memory.edit()
        for ((key, value) in memory.all) {
            if ((value is Long && value <= nowMs) || value is Boolean) cleanup.remove(key)
        }
        if (!cleanup.putLong(scopedEventId, expiry.expiresAtMs!!).commit()) return
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "qore_crt_staging"
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(NotificationChannel(
                channelId, "CRT QA Alerts", NotificationManager.IMPORTANCE_DEFAULT
            ))
        }
        val notification = if (Build.VERSION.SDK_INT >= 26)
            Notification.Builder(this, channelId)
        else Notification.Builder(this)
        val preview = QaCrtNotificationText.render(result)
        manager.notify(scopedEventId.hashCode(),
            notification.setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(if (result.eventType != null)
                    preview.title else "QORE CRT • " + result.instrument)
                .setContentText(if (result.eventType != null)
                    preview.collapsed else "MSS M15 • STAGING")
                .setStyle(Notification.BigTextStyle().bigText(
                    if (result.eventType != null) preview.expanded
                    else "MSS M15 • STAGING"))
                .setAutoCancel(true)
                .apply {
                    if (Build.VERSION.SDK_INT >= 26)
                        setTimeoutAfter(expiry.remainingMs)
                }
                .build())
    }
    private fun showSystemTransportTest(data: Map<String, String>) {
        val prefs = getSharedPreferences(QaConsentGate.PREFS, MODE_PRIVATE)
        val verdict = QaSystemTestPolicy.check(
            data, System.currentTimeMillis(),
            consent = prefs.getBoolean(QaSystemTestPolicy.ENABLED_KEY, false),
            enrolled = prefs.getBoolean(QaSystemTestPolicy.ENROLLED_KEY, false),
            buildReady = BuildConfig.QA_TEST_TRANSPORT_ENABLED
        )
        if (!verdict.accepted) return
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED) return
        val nonce = verdict.nonce ?: return
        val memory = getSharedPreferences("qore_qa_test_dedup", MODE_PRIVATE)
        val now = System.currentTimeMillis()
        if ((memory.getLong(nonce, 0L)) > now) return
        val change = memory.edit()
        for ((key, value) in memory.all)
            if (value is Long && value <= now) change.remove(key)
        if (!change.putLong(nonce, verdict.expiryMs).commit()) return

        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val channel = "qore_crt_connection_test"
        if (Build.VERSION.SDK_INT >= 26)
            manager.createNotificationChannel(NotificationChannel(
                channel,"Pruebas de conexión CRT",
                NotificationManager.IMPORTANCE_HIGH
            ))
        val notification = if (Build.VERSION.SDK_INT >= 26)
            Notification.Builder(this,channel) else Notification.Builder(this)
        notification.setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("QORE CRT · Prueba de conexión")
            .setContentText("Mensaje recibido desde Firebase. NO es una señal CRT.")
            .setStyle(Notification.BigTextStyle().bigText(
                "Prueba técnica recibida del servidor de alertas QA. " +
                "No contiene precios, CRT, MSS ni instrucciones de trading."
            ))
            .setAutoCancel(true)
        if (Build.VERSION.SDK_INT >= 26)
            notification.setTimeoutAfter(verdict.expiryMs-now)
        manager.notify(nonce.hashCode(),notification.build())
    }

}
