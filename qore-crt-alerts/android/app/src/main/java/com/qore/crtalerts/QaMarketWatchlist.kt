package com.qore.crtalerts

// Local QA interest list only. No prices, Firebase token, server account,
// subscriptions or delivery rights are created by these choices.
// Keep this exact 34-symbol order in sync with src/instruments.mjs.
internal object QaMarketWatchlist {
    const val SELECTED_SYMBOLS_KEY = "qa_selected_instruments_v1"

    val symbols: List<String> = listOf(
        "AUDJPY", "GBPUSD", "GBPJPY", "XAUUSD",
        "NDX100", "SPX500", "US30", "BTCUSD",
        "AUDUSD", "USDCAD", "USDJPY", "EURUSD",
        "USDCHF", "NZDUSD", "NZDJPY", "NZDCHF",
        "XAGUSD", "AUDCAD", "AUDCHF", "AUDNZD",
        "CADCHF", "CADJPY", "CHFJPY", "EURAUD",
        "EURCAD", "EURCHF", "EURGBP", "EURJPY",
        "EURNZD", "GBPAUD", "GBPCAD", "GBPCHF",
        "GBPNZD", "NZDCAD"
    )

    fun normalized(saved: Set<String>): Set<String> =
        saved.intersect(symbols.toSet()).toSet()

    fun update(saved: Set<String>, instrumentId: String, selected: Boolean): Set<String> {
        require(instrumentId in symbols) { "UNSUPPORTED_QA_INSTRUMENT" }
        val clean = normalized(saved)
        return if (selected) clean + instrumentId else clean - instrumentId
    }
}
