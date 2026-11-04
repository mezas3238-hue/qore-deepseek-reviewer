package com.qore.crtalerts

/** Pure rules for the Android on-device, one-shot QA market-data probe. */
internal object CtraderPhoneM5Policy {
    const val M5_MS = 300_000L
    fun isViewOnlyScope(value: Any?): Boolean =
        value == 0 || value == "0" || value == "SCOPE_VIEW"

    fun isExplicitDemo(hasLiveFlag: Boolean, isLive: Any?): Boolean =
        hasLiveFlag && isLive == false

    fun validClosedMinute(openedAtMs: Long, observedAtMs: Long): Boolean =
        openedAtMs > 0L && openedAtMs % 60_000L == 0L &&
            observedAtMs >= openedAtMs &&
            observedAtMs - openedAtMs >= M5_MS

    /** Caller must supply distinct, sorted M5 opens; gaps are never filled. */
    fun countGaps(openTimes: List<Long>): Int {
        if (openTimes.isEmpty()) return 0
        var prior = openTimes.first()
        var gaps = 0
        for (i in 1 until openTimes.size) {
            val next = openTimes[i]
            require(next > prior && next % M5_MS == prior % M5_MS) {
                "M5_ORDER_OR_NATIVE_PHASE_INVALID"
            }
            if (next - prior != M5_MS) gaps++
            prior = next
        }
        return gaps
    }
}
