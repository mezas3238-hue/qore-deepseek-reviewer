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
        val memory = getSharedPreferences("crt_staging_seen", MODE_PRIVATE)
        if (memory.getBoolean(eventId, false)) return
        if (!memory.edit().putBoolean(eventId, true).commit()) return
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
        manager.notify(eventId.hashCode(),
            notification.setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("QORE CRT • " + result.instrument)
                .setContentText("MSS M15 " + result.direction + " • STAGING")
                .setAutoCancel(true).build())
    }
}
