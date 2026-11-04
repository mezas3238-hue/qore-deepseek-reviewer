package com.qore.crtalerts

// Additional strict gate for ALL future Android notifications.
// Alerts expire four hours after the actual closed-bar confirmation;
// opening the app, retrying FCM or arriving later never renews expiry.
// QA build's STAGING_NOTIFICATIONS_ENABLED remains hardcoded false.
internal object QaFourHourAlertPolicy {
    const val TTL_MS = 4L * 60L * 60L * 1000L

    data class Decision(
        val accepted: Boolean,
        val reason: String,
        val confirmedAtMs: Long? = null,
        val expiresAtMs: Long? = null,
        val remainingMs: Long = 0L
    )

    fun check(data: Map<String, String>, nowMs: Long): Decision {
        val confirmed = data["confirmedAtMs"]?.toLongOrNull()
            ?: return Decision(false, "MISSING_CONFIRMED_AT")
        val expires = data["expiresAtMs"]?.toLongOrNull()
            ?: return Decision(false, "MISSING_EXPIRES_AT")
        return evaluate(confirmed, expires, data["invalidatedAtMs"], nowMs)
    }

    fun evaluate(
        confirmedAtMs: Long,
        expiresAtMs: Long,
        invalidatedAtMs: String?,
        nowMs: Long
    ): Decision {
        if (confirmedAtMs <= 0L || expiresAtMs <= 0L || nowMs <= 0L)
            return Decision(false, "INVALID_CLOCK")
        if (confirmedAtMs > Long.MAX_VALUE - TTL_MS ||
            expiresAtMs != confirmedAtMs + TTL_MS)
            return Decision(false, "INVALID_FOUR_HOUR_EXPIRY")
        if (!invalidatedAtMs.isNullOrBlank())
            return Decision(false, "INVALIDATED_EARLY")
        if (confirmedAtMs > nowMs)
            return Decision(false, "FUTURE_CONFIRMATION")
        if (nowMs >= expiresAtMs)
            return Decision(false, "EXPIRED")
        return Decision(true, "VALID_FOR_REMAINING_TIME",
            confirmedAtMs, expiresAtMs, expiresAtMs - nowMs)
    }
}
