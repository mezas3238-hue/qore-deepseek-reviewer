"""Offline tests for cTrader historical M5 proof; no SDK or network."""
import unittest
from types import SimpleNamespace

from ctrader_probe.closed_m5 import InvalidM5Evidence, summarize_closed_m5

BASE = 30_000_000
MINUTE_MS = 60_000


def bar(minute=BASE, low=138_000, high=250, opening=130, close=215):
    return SimpleNamespace(utcTimestampInMinutes=minute,
                           low=low, deltaHigh=high,
                           deltaOpen=opening, deltaClose=close)


def response(rows=None, account_id=123, symbol_id=37, period=5, has_more=False):
    return SimpleNamespace(ctidTraderAccountId=account_id,
                           symbolId=symbol_id, period=period,
                           hasMore=has_more,
                           trendbar=[bar(BASE), bar(BASE+5)] if rows is None else rows)


class TestClosedM5(unittest.TestCase):
    def test_closed_native_m5_and_relative_price_without_provider_spoofing(self):
        now=(BASE+10)*MINUTE_MS
        result=summarize_closed_m5(response(), account_id=123,
                                   symbol_id=37, observed_at_ms=now)
        self.assertEqual(result["barCount"], 2)
        self.assertEqual(result["nativePhaseMin"], BASE % 5)
        self.assertEqual(result["gaps"], [])
        self.assertEqual(result["bars"][0]["lowRelative"], 138_000)
        self.assertEqual(result["bars"][0]["deltaClose"], 215)
        self.assertEqual(result["bars"][0]["closedAtMs"],
                         (BASE+5)*MINUTE_MS)
        self.assertFalse(result["sendPush"])
        self.assertFalse(result["canTrade"])
        self.assertFalse(result["sourceParityCertified"])

    def test_broker_may_return_open_bar_but_never_confirm_it(self):
        now=(BASE+10)*MINUTE_MS
        result=summarize_closed_m5(response([bar(BASE),bar(BASE+5),bar(BASE+10)]),
                                   account_id=123,symbol_id=37,
                                   observed_at_ms=now)
        self.assertEqual(result["barCount"],2)

    def test_missing_ticks_create_gap_not_interpolation(self):
        now=(BASE+20)*MINUTE_MS
        result=summarize_closed_m5(response([bar(BASE),bar(BASE+10)]),
                                   account_id=123,symbol_id=37,
                                   observed_at_ms=now)
        self.assertEqual(result["barCount"],2)
        self.assertEqual(len(result["gaps"]),1)
        self.assertEqual(result["gaps"][0]["afterMs"],(BASE+5)*MINUTE_MS)

    def test_wrong_source_period_phase_and_duplicate_rejected(self):
        now=(BASE+20)*MINUTE_MS
        for bad in [
            response(account_id=999),
            response(symbol_id=38),
            response(period=1),
            response([bar(BASE),bar(BASE+1)]),
            response([bar(BASE),bar(BASE)]),
            response([bar(BASE,high=150,opening=151)]),
            response([bar(BASE,low=0)]),
            response([bar(BASE,high=10,close=12)]),
        ]:
            with self.subTest(bad=bad):
                with self.assertRaises(InvalidM5Evidence):
                    summarize_closed_m5(bad,account_id=123,symbol_id=37,
                                       observed_at_ms=now)

    def test_has_more_response_never_promotes_to_signal(self):
        out=summarize_closed_m5(response(has_more=True), account_id=123,
                                symbol_id=37, observed_at_ms=(BASE+11)*MINUTE_MS)
        self.assertTrue(out["sourceHasMore"])
        self.assertFalse(out["sendPush"])


if __name__ == "__main__":
    unittest.main()
