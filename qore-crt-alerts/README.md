# QORE CRT ALERTS — isolated offline foundation

This is the first executable backend foundation, NOT a working signals app.
It does NOT connect to prices, Railway, Firebase/FCM, Android or Supabase,
and does NOT send alerts, compute MSS, or certify CRT trading signals.

Includes: 34 symbols copied from the V34.10b QA Pine source, an explicit
UNVERIFIED provider mapping, strict five-minute closed-candle OHLC contract
(UTC Unix milliseconds), deterministic NY session clock, conservative M15
and H4 aggregation, deduplication and offline tests.

Node 22: cd qore-crt-alerts && npm test

Crypto BTCUSD is deliberately not assigned an unapproved forex/index cycle.
FX-family treatment of XAUUSD/XAGUSD follows existing Pine classification,
but actual provider calendars must be checked. US DST ambiguous and incomplete
blocks are rejected rather than converted into fictitious candles.

Next: verify legal provider coverage and 34 symbol equivalents, port CRT and
MSS rules without lookahead, compare identical samples against Pine, add a
persisted event outbox and Android FCM, then certify a real staging E2E.
The Pine QA candidate and the official V34.9 are untouched.
