package com.qore.crtalerts

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CtraderPhoneM5PolicyTest {
    @Test fun viewOnlyNeverAcceptsTradingScope() {
        assertTrue(CtraderPhoneM5Policy.isViewOnlyScope(0))
        assertTrue(CtraderPhoneM5Policy.isViewOnlyScope("SCOPE_VIEW"))
        assertFalse(CtraderPhoneM5Policy.isViewOnlyScope(1))
        assertFalse(CtraderPhoneM5Policy.isViewOnlyScope("SCOPE_TRADE"))
        assertFalse(CtraderPhoneM5Policy.isViewOnlyScope(null))
        assertFalse(CtraderPhoneM5Policy.isViewOnlyScope(false))
    }

    @Test fun demoRequiresExplicitIsLiveFalse() {
        assertTrue(CtraderPhoneM5Policy.isExplicitDemo(true, false))
        assertFalse(CtraderPhoneM5Policy.isExplicitDemo(true, true))
        assertFalse(CtraderPhoneM5Policy.isExplicitDemo(false, false))
        assertFalse(CtraderPhoneM5Policy.isExplicitDemo(false, null))
        assertFalse(CtraderPhoneM5Policy.isExplicitDemo(true, "false"))
    }

    @Test fun onlyClosedM5FromExactMinuteIsAccepted() {
        val opened = 1_800_000_000_000L
        assertFalse(CtraderPhoneM5Policy.validClosedMinute(opened, opened + 299999))
        assertTrue(CtraderPhoneM5Policy.validClosedMinute(opened, opened + 300000))
        assertFalse(CtraderPhoneM5Policy.validClosedMinute(opened + 1000, opened + 301000))
        assertFalse(CtraderPhoneM5Policy.validClosedMinute(-1L, opened + 300000))
    }

    @Test fun nativePhaseZeroToFourNeverGetsRounded() {
        val opened = 1_800_000_000_000L
        for (phase in 0..4) {
            val a = opened + phase * 60_000L
            val b = a + 300_000L
            assertEquals(0, CtraderPhoneM5Policy.countGaps(listOf(a, b)))
            assertEquals(1, CtraderPhoneM5Policy.countGaps(listOf(a, b + 300_000L)))
        }
    }

    @Test(expected = IllegalArgumentException::class)
    fun changingNativePhaseIsRejected() {
        CtraderPhoneM5Policy.countGaps(listOf(1_800_000_000_000L,
            1_800_000_000_000L + 360_000L))
    }

    @Test(expected = IllegalArgumentException::class)
    fun outOfOrderM5IsRejected() {
        CtraderPhoneM5Policy.countGaps(listOf(1_800_000_300_000L,
            1_800_000_000_000L))
    }
}
