"""Strictly observational M5 history validator for cTrader Open API.

Only historical closed bars of a single, exact DEMO account and symbol are
admitted. Missing bars, native phase drift or partial responses are reported,
not interpolated. Never certifies OHLC parity, trade decisions or notifications.
"""

from __future__ import annotations

from typing import Any

FIVE_MINUTES_MS = 300_000
ONE_MINUTE_MS = 60_000
M5_ENUM = 5
MAX_BARS = 2000


class InvalidM5Evidence(ValueError):
    pass


def _int(raw: Any, field: str, positive: bool = False) -> int:
    if type(raw) is not int or raw < (1 if positive else 0):
        raise InvalidM5Evidence("INVALID_" + field.upper())
    return raw


def summarize_closed_m5(
    response: Any, *, account_id: int, symbol_id: int, observed_at_ms: int
) -> dict[str, Any]:
    _int(account_id, "accountId", True)
    _int(symbol_id, "symbolId", True)
    _int(observed_at_ms, "observedAtMs", True)
    if getattr(response, "ctidTraderAccountId", None) != account_id:
        raise InvalidM5Evidence("M5_ACCOUNT_MISMATCH")
    if getattr(response, "symbolId", None) != symbol_id:
        raise InvalidM5Evidence("M5_SYMBOL_MISMATCH")
    if getattr(response, "period", None) != M5_ENUM:
        raise InvalidM5Evidence("M5_PERIOD_MISMATCH")
    source_bars = getattr(response, "trendbar", None)
    if source_bars is None:
        raise InvalidM5Evidence("M5_TRENDBARS_MISSING")
    if len(source_bars) > MAX_BARS:
        raise InvalidM5Evidence("M5_TOO_MANY_BARS")

    rows: list[dict[str, Any]] = []
    phase: int | None = None
    timestamps: set[int] = set()
    for item in source_bars:
        opened_minute = _int(getattr(item, "utcTimestampInMinutes", None),
                             "utcTimestampInMinutes", True)
        opened_at_ms = opened_minute * ONE_MINUTE_MS
        if opened_at_ms > 2**53-1 or opened_at_ms % ONE_MINUTE_MS:
            raise InvalidM5Evidence("INVALID_M5_TIMESTAMP")
        if opened_at_ms in timestamps:
            raise InvalidM5Evidence("DUPLICATE_M5_OPEN_TIMESTAMP")
        timestamps.add(opened_at_ms)
        if opened_at_ms + FIVE_MINUTES_MS > observed_at_ms:
            # A partially formed bar is never a confirmed M5.
            continue
        low = _int(getattr(item, "low", None), "low", True)
        high_delta = _int(getattr(item, "deltaHigh", None), "deltaHigh")
        open_delta = _int(getattr(item, "deltaOpen", None), "deltaOpen")
        close_delta = _int(getattr(item, "deltaClose", None), "deltaClose")
        if (open_delta > high_delta or close_delta > high_delta or
                max(low + high_delta, low + open_delta, low + close_delta) > 2**53-1):
            raise InvalidM5Evidence("M5_INVALID_RELATIVE_OHLC")
        native_phase = (opened_at_ms % FIVE_MINUTES_MS) // ONE_MINUTE_MS
        if phase is not None and native_phase != phase:
            raise InvalidM5Evidence("M5_NATIVE_PHASE_CHANGED")
        phase = native_phase
        rows.append({
            "openedAtMs": opened_at_ms, "closedAtMs": opened_at_ms+FIVE_MINUTES_MS,
            "lowRelative": low, "deltaHigh": high_delta,
            "deltaOpen": open_delta, "deltaClose": close_delta
        })

    rows.sort(key=lambda row: row["openedAtMs"])
    gaps: list[dict[str, int]] = []
    for previous, current in zip(rows, rows[1:]):
        if current["openedAtMs"] != previous["openedAtMs"] + FIVE_MINUTES_MS:
            gaps.append({"afterMs": previous["closedAtMs"],
                         "nextAtMs": current["openedAtMs"]})

    return {
        "status": "HISTORICAL_CLOSED_M5_QA_NOT_CERTIFIED",
        "accountMatches": True,
        "symbolId": symbol_id,
        "observedAtMs": observed_at_ms,
        "nativePhaseMin": phase,
        "barCount": len(rows),
        "sourceHasMore": getattr(response, "hasMore", False) is True,
        "gaps": gaps, "bars": rows,
        "sourceParityCertified": False,
        "sendPush": False, "canTrade": False
    }
