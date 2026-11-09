"""Independent CLOSED-M5 audit of an externally supplied CRT-family MSS claim.

Never connects to cTrader/TradingView, never sends alerts or orders.
Even a corroborated close is *not* a certified CRT/MSS: CSV provenance,
frozen pivot identity, exact broker phase and structural H4 origin need
independent evidence. Does not infer a CRT family from prices.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

M5 = timedelta(minutes=5)
M15 = timedelta(minutes=15)
ALLOWED_FAMILIES = {"3C TRUE QA", "INSIDE QA", "MULTI4 QA", "MULTI-N QA"}
FIELDS = ("symbol", "feed_id", "open_time_utc", "open", "high", "low", "close", "closed")


class EvidenceError(ValueError):
    """Unusable or internally inconsistent historical data."""


def utc(value: str) -> datetime:
    try:
        stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError) as exc:
        raise EvidenceError("invalid ISO8601 datetime") from exc
    if stamp.tzinfo is None or stamp.utcoffset() != timedelta(0):
        raise EvidenceError("timestamp must carry explicit UTC timezone")
    stamp = stamp.astimezone(UTC)
    if stamp.second or stamp.microsecond:
        raise EvidenceError("timestamp precision must be whole minute")
    return stamp


def decimal(value: str) -> Decimal:
    try:
        number = Decimal(value)
    except (InvalidOperation, TypeError) as exc:
        raise EvidenceError("invalid price") from exc
    if not number.is_finite() or number <= 0:
        raise EvidenceError("price is not finite and positive")
    return number


@dataclass(frozen=True)
class Candle:
    open_at: datetime
    op: Decimal
    hi: Decimal
    lo: Decimal
    cl: Decimal

    @property
    def close_at_5(self) -> datetime:
        return self.open_at + M5


@dataclass(frozen=True)
class Claim:
    symbol: str
    feed_id: str
    family: str
    direction: str
    timeframe: str
    phase_min: int
    c1_high: Decimal
    c1_low: Decimal
    sweep_window_start: datetime
    sweep_close_at: datetime
    frozen_pivot_open_at: datetime
    frozen_pivot: Decimal
    observe_until: datetime

    @classmethod
    def parse(cls, value: dict[str, Any]) -> Claim:
        required = (
            "symbol", "feed_id", "family", "direction", "timeframe",
            "phase_min", "c1_high", "c1_low", "sweep_window_start_utc",
            "sweep_close_utc", "frozen_pivot_open_utc", "frozen_pivot",
            "observe_until_utc",
        )
        if set(value) != set(required):
            raise EvidenceError("claim fields must match frozen schema")
        sym = value["symbol"]
        feed = value["feed_id"]
        if (
            not isinstance(sym, str) or not sym.startswith("IC:")
            or not isinstance(feed, str) or not feed.startswith("IC:")
        ):
            raise EvidenceError("explicit IC symbol/feed labels required, not verified")
        family = value["family"]
        direction = value["direction"]
        timeframe = value["timeframe"]
        phase = value["phase_min"]
        if family not in ALLOWED_FAMILIES:
            raise EvidenceError("unsupported CRT family")
        if direction not in ("BULLISH", "BEARISH") or timeframe not in ("M5", "M15"):
            raise EvidenceError("invalid direction/timeframe")
        if type(phase) is not int or phase not in range(5):
            raise EvidenceError("phase_min must be integer 0..4")
        c1_high, c1_low = decimal(value["c1_high"]), decimal(value["c1_low"])
        if c1_high <= c1_low:
            raise EvidenceError("invalid C1 bounds")
        start = utc(value["sweep_window_start_utc"])
        sweep = utc(value["sweep_close_utc"])
        pivot_at = utc(value["frozen_pivot_open_utc"])
        until = utc(value["observe_until_utc"])
        if not (pivot_at < sweep and start < sweep <= until):
            raise EvidenceError("event timestamps not causal")
        return cls(
            symbol=sym, feed_id=feed, family=family,
            direction=direction, timeframe=timeframe, phase_min=phase,
            c1_high=c1_high, c1_low=c1_low,
            sweep_window_start=start, sweep_close_at=sweep,
            frozen_pivot_open_at=pivot_at,
            frozen_pivot=decimal(value["frozen_pivot"]),
            observe_until=until,
        )


def load_m5_csv(path: Path, claim: Claim) -> tuple[Candle, ...]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file, strict=True)
        if tuple(reader.fieldnames or ()) != FIELDS:
            raise EvidenceError("unexpected CSV header")
        candles = []
        previous: datetime | None = None
        for row in reader:
            if None in row or any(v is None for v in row.values()):
                raise EvidenceError("missing/extra CSV columns")
            if (
                row["symbol"] != claim.symbol or row["feed_id"] != claim.feed_id
                or row["closed"] != "true"
            ):
                raise EvidenceError("mixed identity/feed or unclosed M5")
            at = utc(row["open_time_utc"])
            if at.minute % 5 != claim.phase_min:
                raise EvidenceError("M5 phase does not match claim")
            if previous is not None and at <= previous:
                raise EvidenceError("unordered or duplicated M5 timestamps")
            previous = at
            op, hi, lo, cl = (
                decimal(row[key]) for key in ("open", "high", "low", "close")
            )
            if lo > min(op, cl) or hi < max(op, cl) or lo > hi:
                raise EvidenceError("invalid M5 OHLC")
            candles.append(Candle(at, op, hi, lo, cl))
    if not candles:
        raise EvidenceError("empty M5 export")
    return tuple(candles)


def _series(m5: tuple[Candle, ...], timeframe: str, phase: int) -> tuple[Candle, ...]:
    if timeframe == "M5":
        return m5
    buckets: dict[datetime, list[Candle]] = {}
    for bar in m5:
        t = bar.open_at - timedelta(minutes=phase)
        start = t.replace(minute=(t.minute // 15) * 15) + timedelta(minutes=phase)
        buckets.setdefault(start, []).append(bar)
    out: list[Candle] = []
    for start, parts in sorted(buckets.items()):
        if len(parts) != 3 or any(
            parts[i].open_at != start + i * M5 for i in range(3)
        ):
            continue
        out.append(Candle(
            start, parts[0].op, max(c.hi for c in parts),
            min(c.lo for c in parts), parts[2].cl,
        ))
    return tuple(out)


def _close_at(bar: Candle, tf: str) -> datetime:
    return bar.open_at + (M5 if tf == "M5" else M15)


def _report(status: str, cause: str, claim: Claim, observed: datetime | None = None) -> dict[str, Any]:
    return {
        "schema": "CRT_MSS_OFFLINE_AUDIT_R0",
        "symbol": claim.symbol,
        "family": claim.family,
        "timeframe": claim.timeframe,
        "status": status,
        "reason": cause,
        "first_cross_closed_at_utc": observed.isoformat() if observed else None,
        "data_authenticity_verified": False,
        "crt_structure_certified": False,
        "pine_parity_certified": False,
        "operational_alert_authorized": False,
        "live_trading_authorized": False,
    }


def audit(claim: Claim, m5: tuple[Candle, ...]) -> dict[str, Any]:
    """Verify first raw directional sweep + pivot + fully CLOSED reversal cross."""
    lookups = {c.close_at_5: c for c in m5}
    # No holes between source window start and observation time, including
    # pivot and sweep. Market/session gaps yield UNKNOWN rather than no MSS.
    start = min(claim.sweep_window_start, claim.frozen_pivot_open_at)
    expected = start
    while expected < claim.observe_until:
        if expected + M5 not in lookups:
            return _report("INCOMPLETE", "missing M5 history or future close", claim)
        expected += M5
    m5_sweep = [
        c for c in m5
        if claim.sweep_window_start < c.close_at_5 <= claim.sweep_close_at
    ]
    def swept(c: Candle) -> bool:
        if claim.direction == "BULLISH":
            return c.lo < claim.c1_low and c.hi <= claim.c1_high
        return c.hi > claim.c1_high and c.lo >= claim.c1_low

    if not m5_sweep or m5_sweep[-1].close_at_5 != claim.sweep_close_at:
        return _report("INVALID", "sweep close not in available M5 bars", claim)
    if not swept(m5_sweep[-1]):
        return _report("INVALID", "claimed sweep did not break its C1 extreme", claim)
    if any(c.hi > claim.c1_high and c.lo < claim.c1_low for c in m5_sweep):
        return _report("INVALID", "dual-side sweep", claim)
    if any(
        c.hi > claim.c1_high if claim.direction == "BULLISH"
        else c.lo < claim.c1_low
        for c in m5_sweep
    ):
        return _report("INVALID", "opposing C1 boundary swept in same window", claim)
    if any(swept(c) for c in m5_sweep[:-1]):
        return _report("INVALID", "claimed sweep is not the first valid sweep", claim)

    tf = M5 if claim.timeframe == "M5" else M15
    candles = _series(m5, claim.timeframe, claim.phase_min)
    by_open = {c.open_at: i for i, c in enumerate(candles)}
    pivot_idx = by_open.get(claim.frozen_pivot_open_at)
    if pivot_idx is None or pivot_idx < 2 or pivot_idx + 2 >= len(candles):
        return _report("INCOMPLETE", "pivot L2/R2 history not available", claim)
    pivot = candles[pivot_idx]
    # The right-2 pivot confirmation is only known AFTER those bars close.
    if _close_at(candles[pivot_idx + 2], claim.timeframe) > claim.sweep_close_at:
        return _report("INVALID", "pivot was not frozen before sweep", claim)
    neighbors = candles[pivot_idx - 2:pivot_idx] + candles[pivot_idx + 1:pivot_idx + 3]
    if any(abs((c.open_at - pivot.open_at).total_seconds()) > 2 * tf.total_seconds() for c in neighbors):
        return _report("INCOMPLETE", "pivot neighborhood is not contiguous", claim)
    if claim.direction == "BULLISH":
        pivot_ok = pivot.hi == claim.frozen_pivot and all(pivot.hi > x.hi for x in neighbors)
    else:
        pivot_ok = pivot.lo == claim.frozen_pivot and all(pivot.lo < x.lo for x in neighbors)
    if not pivot_ok:
        return _report("INVALID", "frozen pivot not independently confirmed L2/R2", claim)

    prior: Candle | None = None
    for bar in candles:
        end = _close_at(bar, claim.timeframe)
        if end > claim.observe_until:
            break
        if end <= claim.sweep_close_at:
            prior = bar
            continue
        # An M15 containing the M5 sweep cannot establish a distinct
        # post-sweep M15 close by itself. Abstain for that one candle.
        # Start evaluating only full M15 bars OPENING after the sweep.
        if bar.open_at < claim.sweep_close_at:
            prior = bar
            continue
        if prior is None or _close_at(prior, claim.timeframe) != bar.open_at:
            return _report("INCOMPLETE", "missing immediately previous closed timeframe", claim)
        if claim.direction == "BULLISH":
            crossed = prior.cl <= claim.frozen_pivot < bar.cl
        else:
            crossed = prior.cl >= claim.frozen_pivot > bar.cl
        if crossed:
            return _report("RAW_CROSS", "closed directional crossing corroborated (not CRT certified)", claim, end)
        prior = bar
    return _report("NO_CROSS_OBSERVED", "no qualifying closed crossing within observed window", claim)


def main() -> None:
    parser = argparse.ArgumentParser(description="Read-only MSS evidence audit; NEVER trade")
    parser.add_argument("--m5-csv", type=Path, required=True)
    parser.add_argument("--claim-json", type=Path, required=True)
    parser.add_argument("--out-json", type=Path, required=True)
    args = parser.parse_args()
    claim = Claim.parse(json.loads(args.claim_json.read_text(encoding="utf-8")))
    report = audit(claim, load_m5_csv(args.m5_csv, claim))
    # Binds the output to the exact files supplied, without certifying that
    # the bytes genuinely came from IC Markets.
    report["m5_csv_sha256"] = hashlib.sha256(args.m5_csv.read_bytes()).hexdigest()
    report["claim_json_sha256"] = hashlib.sha256(args.claim_json.read_bytes()).hexdigest()
    args.out_json.write_text(json.dumps(report, sort_keys=True, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
