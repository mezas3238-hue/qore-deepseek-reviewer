package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class QaConsentGateTest {
    @Test fun defaultNoInterestNeverGrantsDelivery() {
        val gate = QaConsentGate.evaluate(false, false, false, false, false)
        assertEquals("NO_LOCAL_INTEREST", gate.state)
        assertFalse(gate.canShowNotification)
        assertFalse(gate.canRequestPermission)
    }

    @Test fun interestedUserInQaBuildCannotAskPermissionOrReceivePush() {
        val gate = QaConsentGate.evaluate(true, false, true, true, true)
        assertEquals("QA_TRANSPORT_LOCKED", gate.state)
        assertFalse(gate.canRequestPermission)
        assertFalse(gate.canShowNotification)
    }

    @Test fun appRequiresVerifiedBackendEnrollmentEvenIfBuildEnabled() {
        val gate = QaConsentGate.evaluate(true, true, false, true, true)
        assertEquals("NO_VERIFIED_ENROLLMENT", gate.state)
        assertFalse(gate.canShowNotification)
    }

    @Test fun marketParityGateIsSeparateFromFirebaseEnrollment() {
        val gate = QaConsentGate.evaluate(true, true, true, false, true)
        assertEquals("PINE_PARITY_NOT_CERTIFIED", gate.state)
        assertFalse(gate.canShowNotification)
    }

    @Test fun androidPermissionIsRequiredOnlyAfterAllOtherGates() {
        val gate = QaConsentGate.evaluate(true, true, true, true, false)
        assertEquals("ANDROID_PERMISSION_REQUIRED", gate.state)
        assertTrue(gate.canRequestPermission)
        assertFalse(gate.canShowNotification)
    }

    @Test fun pureFutureApprovedHypotheticalRequiresEverySingleGate() {
        assertTrue(QaConsentGate.evaluate(true, true, true, true, true).canShowNotification)
        val vals = listOf(false, true)
        for (a in vals) for (b in vals) for (c in vals)
            for (d in vals) for (e in vals) {
                val result = QaConsentGate.evaluate(a, b, c, d, e)
                assertEquals(a && b && c && d && e, result.canShowNotification)
            }
    }
}
