"""Fail-closed contract for V34.12N performance-only Pine candidate.

The canonical approved QA source MUST NOT be edited to pass this test.
Only two additional 'var ' storage qualifiers are allowed, applied to
the 34 symbols and display-name arrays. All calculations, requests,
visuals, inputs, colors and alert logic must remain byte-identical.
"""
from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_QA_NO_LIVE.pine"
CANDIDATE = ROOT / "crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_PERF_ARRAYS_QA_NO_LIVE.pine"

MODIFICATIONS = (
    ("string[] scanSymbols = array.from(s01,",
     "var string[] scanSymbols = array.from(s01,"),
    ("string[] scanNames = array.from(f_name(s01),",
     "var string[] scanNames = array.from(f_name(s01),"),
)

# Git blob content evidence taken from PR #74; file stays intact.
ORIGINAL_SHA256_NOTE = "Do not change baseline; compare its full contents to the candidate."


class PinePerformanceOnlyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = SOURCE.read_bytes().decode("utf-8")
        cls.perf = CANDIDATE.read_bytes().decode("utf-8")

    def test_two_and_only_two_storage_qualifier_changes(self):
        reconstructed = self.base
        for old, new in MODIFICATIONS:
            self.assertEqual(reconstructed.count(old), 1)
            reconstructed = reconstructed.replace(old, new, 1)
        self.assertEqual(reconstructed, self.perf)
        self.assertEqual(len(self.perf) - len(self.base), 8)

    def test_no_change_to_requests_engine_dashboard_alerts_or_34_markets(self):
        for name in ("f_engine_snapshot()", "request.security(", "calc_bars_count=600",
                     "table.new(", "f_renderRadarDashboard()", "alertcondition("):
            self.assertEqual(self.perf.count(name), self.base.count(name), name)
        self.assertEqual(self.perf.count(" = input.symbol("), 34)
        self.assertIn("for i = 0 to 33", self.perf)
        self.assertIn("max_lines_count=8", self.perf)
        self.assertIn("max_labels_count=8", self.perf)

    def test_source_version_unchanged_and_only_var_storage_changes(self):
        self.assertEqual(
            self.base.splitlines()[1],
            self.perf.splitlines()[1],
        )
        # A separate hash of the baseline is useful for manual comparison.
        self.assertEqual(
            hashlib.sha256(
                self.perf.replace("var string[] scanSymbols = array.from(s01,",
                                  "string[] scanSymbols = array.from(s01,")
                    .replace("var string[] scanNames = array.from(f_name(s01),",
                             "string[] scanNames = array.from(f_name(s01),")
                    .encode("utf-8")
            ).digest(),
            hashlib.sha256(self.base.encode("utf-8")).digest(),
        )


if __name__ == "__main__":
    unittest.main()
