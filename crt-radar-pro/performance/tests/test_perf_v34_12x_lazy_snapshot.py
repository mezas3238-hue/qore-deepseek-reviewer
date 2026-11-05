"""Fail-closed structural parity: V34.12X lazy UDT snapshot experiment.

This check does NOT prove TradingView Pine compiler acceptance or elapsed performance.
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / "crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERF_ONLY_QA_NO_LIVE.pine"
CAND = ROOT / "crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_V34_12X_PERF_LAZY_SIGNAL_QA_NO_LIVE.pine"

class TestLazySnapshotContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = BASE.read_text(encoding="utf-8")
        cls.cand = CAND.read_text(encoding="utf-8")

    def test_exact_whitelisted_modification_no_signal_change(self):
        old_fam = "    FamilyVisual outFamilyVisual = FamilyVisual.new("
        new_fam = "    FamilyVisual outFamilyVisual = barstate.islast ? FamilyVisual.new("
        old_signal = "    Signal.new(outPhase, outDir,"
        new_signal = "    barstate.islast ? Signal.new(outPhase, outDir,"
        self.assertEqual(self.base.count(old_fam), 1)
        self.assertEqual(self.base.count(old_signal), 1)
        original_family_line = next(x for x in self.base.splitlines() if x.startswith(old_fam))
        original_signal_line = next(x for x in self.base.splitlines() if x.startswith(old_signal))
        expected = self.base.replace(original_family_line,
            original_family_line.replace(old_fam, new_fam) + " : na", 1)
        expected = expected.replace(original_signal_line,
            original_signal_line.replace(old_signal, new_signal) + " : na", 1)
        self.assertEqual(expected, self.cand)

    def test_terminal_only_udt_no_state_machine_shortcut(self):
        # Guard that f_engine still executes unconditionally on every M5,
        # with last-bar restriction only on the two UDT *constructors*.
        same = [
            "f_engine_snapshot() =>\n    Signal state = f_engine()\n    barstate.islast ? state : na",
            "request.security(symbol, \"5\", f_engine_snapshot(), lookahead=barmerge.lookahead_off, ignore_invalid_symbol=true, calc_bars_count=600)",
            "request.security(syminfo.tickerid, \"5\", f_engine_snapshot(), lookahead=barmerge.lookahead_off, ignore_invalid_symbol=true, calc_bars_count=600)",
            "for i = 0 to 33",
        ]
        for needle in same:
            self.assertIn(needle, self.base)
            self.assertIn(needle, self.cand)
        self.assertEqual(self.base.count("input.color("), 15)
        self.assertEqual(self.cand.count("input.color("), 15)
        self.assertEqual(self.cand.count("FamilyVisual outFamilyVisual = barstate.islast ?"), 1)
        self.assertEqual(self.cand.count("    barstate.islast ? Signal.new(outPhase, outDir,"), 1)
        self.assertEqual(self.cand.count("FamilyVisual.new("), self.base.count("FamilyVisual.new("))
        self.assertEqual(self.cand.count("Signal.new("), self.base.count("Signal.new("))
        # Only final output depends on last bar; earlier stateful updates run.
        self.assertEqual(self.cand.count("f_engine_snapshot() =>"), 1)

if __name__ == "__main__":
    unittest.main()
