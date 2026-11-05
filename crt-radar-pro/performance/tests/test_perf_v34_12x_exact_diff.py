"""Owner gate: exact V34.12X customizable-colors indicator, PERF ONLY.

This test fails whenever even one unrelated character in V34.12X changes.
It cannot prove Pine runtime equivalence or performance; test in TradingView.
"""
from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine"
CANDIDATE = ROOT / "crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERF_ONLY_QA_NO_LIVE.pine"

ALLOWED_CHANGES = (
    ("string[] scanSymbols = array.from(s01,", "var string[] scanSymbols = array.from(s01,"),
    ("string[] scanNames = array.from(f_name(s01),", "var string[] scanNames = array.from(f_name(s01),"),
    ("    bool isIndex = f_index()", "    var bool isIndex = f_index()"),
    ('    bool isBTC = str.upper(syminfo.ticker) == "BTCUSD"', '    var bool isBTC = str.upper(syminfo.ticker) == "BTCUSD"'),
    ("    bool pdhRth = isIndex and not useExtIdx", "    var bool pdhRth = isIndex and not useExtIdx"),
    ('    string pdhSession = isBTC ? "0000-0000:1234567" : pdhRth ? "0930-1600:23456" : "1700-1700:23456"', '    var string pdhSession = isBTC ? "0000-0000:1234567" : pdhRth ? "0930-1600:23456" : "1700-1700:23456"'),
)

class PerformanceOnlyV3412XTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = SOURCE.read_text(encoding="utf-8")
        cls.candidate = CANDIDATE.read_text(encoding="utf-8")

    def test_every_byte_but_exact_six_vars_is_identical(self):
        original = self.source
        for before, after in ALLOWED_CHANGES:
            self.assertEqual(original.count(before), 1)
            original = original.replace(before, after, 1)
        self.assertEqual(original.encode("utf-8"), self.candidate.encode("utf-8"))
        self.assertEqual(len(self.candidate) - len(self.source), 24)

    def test_fifteen_customizable_colors_are_unmodified(self):
        self.assertEqual(self.source.count("input.color("), 15)
        self.assertEqual(self.candidate.count("input.color("), 15)
        for line in self.source.splitlines():
            if "input.color(" in line:
                self.assertIn(line, self.candidate.splitlines())

    def test_all_34_markets_engine_and_chart_are_unchanged(self):
        for phrase in (
            "f_engine_snapshot()", "request.security(", "calc_bars_count=600",
            "for i = 0 to 33", "IC:BTCUSD", "IC:USTEC", "IC:US500",
            "f_chartH4Fvgs(", "f_renderRadarDashboard()", "alertcondition(",
            "max_labels_count=12", "max_boxes_count=5",
        ):
            self.assertEqual(self.source.count(phrase), self.candidate.count(phrase), phrase)
        self.assertTrue(self.candidate.splitlines()[1].find("V34.12X") >= 0)
        reversed_candidate = self.candidate
        for before, after in ALLOWED_CHANGES:
            self.assertEqual(reversed_candidate.count(after), 1)
            reversed_candidate = reversed_candidate.replace(after, before, 1)
        self.assertEqual(
            hashlib.sha256(self.source.encode("utf-8")).hexdigest(),
            hashlib.sha256(reversed_candidate.encode("utf-8")).hexdigest(),
        )

if __name__ == "__main__":
    unittest.main()
