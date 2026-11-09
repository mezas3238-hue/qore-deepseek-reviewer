"""Synthetic regression tests for the standalone CSV forensic verifier."""

from __future__ import annotations

import csv
from datetime import UTC, datetime, timedelta
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import verify_mss_evidence_csv as verifier  # noqa: E402

START = datetime(2026, 11, 9, 9, 0, tzinfo=UTC)


def iso(m: int) -> str:
    return (START + timedelta(minutes=m)).isoformat()


def dataset(*, missing_open: int | None = None, after_cross: bool = True) -> list[dict[str, str]]:
    bars = []
    for i in range(24):
        minutes = i * 5
        if minutes == missing_open:
            continue
        high = 105 if minutes == 55 else 102
        low = 94 if minutes == 85 else 98
        close = 99 if minutes == 85 else 106 if after_cross and minutes in (95, 100) else 100
        high = max(high, close)
        bars.append({
            "symbol": "IC:XAGUSD",
            "feed_id": "IC:DEMO:TEST",
            "open_time_utc": iso(minutes),
            "open": "100",
            "high": str(high),
            "low": str(low),
            "close": str(close),
            "closed": "true",
        })
    return bars


def claim(*, timeframe: str, pivot_open: int, until: int = 120) -> dict[str, object]:
    return {
        "symbol": "IC:XAGUSD", "feed_id": "IC:DEMO:TEST",
        "family": "INSIDE QA", "direction": "BULLISH",
        "timeframe": timeframe, "phase_min": 0,
        "c1_high": "108", "c1_low": "95",
        "sweep_window_start_utc": iso(75),
        "sweep_close_utc": iso(90),
        "frozen_pivot_open_utc": iso(pivot_open),
        "frozen_pivot": "105",
        "observe_until_utc": iso(until),
    }


class CsvProofVerifierTests(unittest.TestCase):
    def setUp(self) -> None:
        import tempfile

        self._temp = tempfile.TemporaryDirectory()
        self.addCleanup(self._temp.cleanup)
        self.csv_path = Path(self._temp.name) / "m5.csv"

    def load(self, data: list[dict[str, str]], obj: dict[str, object]):
        with self.csv_path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=verifier.FIELDS)
            writer.writeheader()
            writer.writerows(data)
        c = verifier.Claim.parse(obj)
        return c, verifier.load_m5_csv(self.csv_path, c)

    def test_m5_cross_checks_pivot_and_closed_continuity(self) -> None:
        c, m5 = self.load(dataset(), claim(timeframe="M5", pivot_open=55))
        res = verifier.audit(c, m5)
        self.assertEqual(res["status"], "RAW_CROSS")
        self.assertEqual(res["first_cross_closed_at_utc"], iso(100))
        self.assertFalse(res["operational_alert_authorized"])
        self.assertFalse(res["pine_parity_certified"])

    def test_m15_aggregates_three_closed_m5_and_is_independent(self) -> None:
        c, m5 = self.load(dataset(), claim(timeframe="M15", pivot_open=45))
        res = verifier.audit(c, m5)
        self.assertEqual(res["status"], "RAW_CROSS")
        self.assertEqual(res["first_cross_closed_at_utc"], iso(105))
        self.assertFalse(res["crt_structure_certified"])

    def test_no_close_cross_yields_no_cross_not_an_entry(self) -> None:
        c, m5 = self.load(
            dataset(after_cross=False), claim(timeframe="M5", pivot_open=55)
        )
        self.assertEqual(verifier.audit(c, m5)["status"], "NO_CROSS_OBSERVED")

    def test_missing_m5_yields_unknown_instead_of_false_no(self) -> None:
        c, m5 = self.load(
            dataset(missing_open=80), claim(timeframe="M15", pivot_open=45)
        )
        self.assertEqual(verifier.audit(c, m5)["status"], "INCOMPLETE")

    def test_unclosed_or_other_feed_is_rejected(self) -> None:
        wrong = dataset()
        wrong[0]["closed"] = "false"
        with self.assertRaisesRegex(verifier.EvidenceError, "unclosed"):
            self.load(wrong, claim(timeframe="M5", pivot_open=55))
        wrong = dataset()
        wrong[0]["feed_id"] = "SOME_OTHER_BROKER"
        with self.assertRaisesRegex(verifier.EvidenceError, "mixed identity"):
            self.load(wrong, claim(timeframe="M5", pivot_open=55))

    def test_falsely_claimed_sweep_is_invalid(self) -> None:
        obj = claim(timeframe="M5", pivot_open=55)
        obj["c1_low"] = "92"
        c, m5 = self.load(dataset(), obj)
        self.assertEqual(verifier.audit(c, m5)["status"], "INVALID")

    def test_falsely_claimed_frozen_pivot_is_invalid(self) -> None:
        obj = claim(timeframe="M5", pivot_open=55)
        obj["frozen_pivot"] = "106"
        c, m5 = self.load(dataset(), obj)
        self.assertEqual(verifier.audit(c, m5)["status"], "INVALID")

    def test_incomplete_observation_window_does_not_imply_no_mss(self) -> None:
        c, m5 = self.load(dataset()[:-2], claim(timeframe="M5", pivot_open=55))
        self.assertEqual(verifier.audit(c, m5)["status"], "INCOMPLETE")

    def test_unconfirmed_future_pivot_at_sweep_is_invalid(self) -> None:
        # Fake 10:25 pivot would need later M5 candles to be confirmed.
        obj = claim(timeframe="M5", pivot_open=85)
        c, m5 = self.load(dataset(), obj)
        self.assertEqual(verifier.audit(c, m5)["status"], "INVALID")

    def test_output_explicitly_never_certifies_live_or_pine_parity(self) -> None:
        c, m5 = self.load(dataset(), claim(timeframe="M5", pivot_open=55))
        res = verifier.audit(c, m5)
        for key in (
            "live_trading_authorized", "operational_alert_authorized",
            "crt_structure_certified", "pine_parity_certified",
            "data_authenticity_verified",
        ):
            self.assertIs(res[key], False)


if __name__ == "__main__":
    unittest.main(verbosity=2)
