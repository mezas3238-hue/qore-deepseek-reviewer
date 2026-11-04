package com.qore.crtalerts

import org.junit.Assert.*
import org.junit.Test

class QaMarketWatchlistTest {
    @Test fun all34MarketsExistWithBtcSeparated() {
        val symbols = QaMarketWatchlist.symbols
        assertEquals(34, symbols.size)
        assertEquals(34, symbols.toSet().size)
        assertEquals(1, symbols.count { it == "BTCUSD" })
        assertEquals(33, symbols.count { it != "BTCUSD" })
        assertEquals("NZDCAD", symbols.last())
    }

    @Test fun selectionIsLocalAndDefaultsToNothing() {
        assertTrue(QaMarketWatchlist.normalized(emptySet()).isEmpty())
        val one = QaMarketWatchlist.update(emptySet(), "NZDCAD", true)
        assertEquals(setOf("NZDCAD"), one)
        val two = QaMarketWatchlist.update(one, "BTCUSD", true)
        assertEquals(setOf("NZDCAD", "BTCUSD"), two)
        assertEquals(setOf("BTCUSD"), QaMarketWatchlist.update(two, "NZDCAD", false))
        assertEquals(setOf("BTCUSD"), QaMarketWatchlist.normalized(
            setOf("BTCUSD", "UNKNOWN", "ETHUSD")
        ))
    }

    @Test fun invalidSymbolFailsAndQaBuildRemainsLocked() {
        try {
            QaMarketWatchlist.update(emptySet(), "UNKNOWN", true)
            fail("unlisted instrument must fail")
        } catch (_: IllegalArgumentException) {
            // Local input validation, not a feed authorization.
        }
        assertFalse(BuildConfig.STAGING_NOTIFICATIONS_ENABLED)
    }
}
