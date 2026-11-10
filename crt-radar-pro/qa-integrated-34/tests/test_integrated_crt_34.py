"""Github CI: exact integration and inventory for QORE CRT 34.
Static regression ONLY. Not a Pine compiler or TradingView market-parity proof.
"""
import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "crt-radar-pro/qa-mss-reasons/QORE_CRT_RADAR_34_CHART_V34_12X_MSS_NV_DIAGNOSTICO_QA_NO_LIVE.pine"
TARGET = ROOT / "crt-radar-pro/qa-integrated-34/QORE_CRT_RADAR_34_CHART_12X_R1_34_MERCADOS_QA_NO_LIVE.pine"
BLOB100 = "6ec393ce81919eb861a961b7ce534ba07c9106b4"
EDITS = [
    ('    bool isIndex = f_index()', '    var bool isIndex = f_index()'),
    ('    bool isBTC = str.upper(syminfo.ticker) == "BTCUSD"', '    var bool isBTC = str.upper(syminfo.ticker) == "BTCUSD"'),
    ('    bool pdhRth = isIndex and not useExtIdx', '    var bool pdhRth = isIndex and not useExtIdx'),
    ('    string pdhSession = isBTC ? "0000-0000:1234567" : pdhRth ? "0930-1600:23456" : "1700-1700:23456"', '    var string pdhSession = isBTC ? "0000-0000:1234567" : pdhRth ? "0930-1600:23456" : "1700-1700:23456"'),
    ('string[] scanSymbols = array.from(', 'var string[] scanSymbols = array.from('),
    ('string[] scanNames = array.from(', 'var string[] scanNames = array.from('),
    ('"V12W IC · "', '"V34.12X IC · "'),
    ('"V12W NO IC · "', '"V34.12X NO IC · "'),
]
class IntegratedCRT34(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.origin_bytes = SOURCE.read_bytes()
        cls.origin = cls.origin_bytes.decode("utf-8")
        cls.current = TARGET.read_text(encoding="utf-8")
    def test_01_pinned_github_blob(self):
        b = self.origin_bytes
        sha = hashlib.sha1(b"blob " + str(len(b)).encode() + b"\\0" + b).hexdigest()
        self.assertEqual(sha, BLOB100)
    def test_02_exact_eight_patches_only(self):
        expected = self.origin
        for old, new in EDITS:
            self.assertEqual(expected.count(old), 1, old[:60])
            expected = expected.replace(old, new)
        self.assertEqual(self.current, expected)
    def test_03_34_symbol_slots_no_omissions(self):
        found = re.findall(r'^s(\\d{2})\\s*=\\s*"(IC:[A-Z0-9]+)"$', self.current, re.M)
        self.assertEqual([int(a) for a,_ in found], list(range(1,35)))
        self.assertEqual(len(set(s for _,s in found)), 34)
        self.assertEqual(found[7], ("08", "IC:BTCUSD"))
    def test_04_three_indices_canonical(self):
        for symbol in ("s05 = \"IC:USTEC\"","s06 = \"IC:US500\"","s07 = \"IC:US30\""):
            self.assertIn(symbol, self.current)
        self.assertIn('str.contains(name, "USTEC")', self.current)
    def test_05_seven_role_bits(self):
        for flag,value in [("categoryTrue3C",1),("category2CPending",2),
                           ("category2CExpansion",4),("categoryInsideReturn",8),
                           ("categoryInsideContinuation",16),("categoryMultiCandle",32),
                           ("categoryM15Retest",64)]:
            self.assertIn(f"{flag} ? {value} : 0", self.current)
    def test_06_34_security_loop_without_exclusions(self):
        for snip in ("for i = 0 to 33", "if scanAll or i == 7",
                     'request.security(symbol, "5", f_engine_snapshot()',
                     "calc_bars_count=600", "ignore_invalid_symbol=true"):
            self.assertIn(snip, self.current)
    def test_07_fifteen_colors(self):
        self.assertEqual(len(re.findall(r"\\binput\\.color\\(",self.current)), 15)
    def test_08_safety_gate_non_btc_not_promoted(self):
        self.assertIn("bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)",self.current)
    def test_09_mss_is_own_cycle_and_causal(self):
        for snip in ("f_monitorOwnMss(int slot)", "p5 < sweepT", "b5 > sweepT",
                     "p15 < sweepT", "b15 > sweepT", "SIN PIV", "NO CERT", "SIN FEED"):
            self.assertIn(snip, self.current)
    def test_10_no_live_or_fictitious_alarms(self):
        self.assertNotIn("strategy.entry(",self.current)
        self.assertNotIn("alertcondition(",self.current)
        self.assertNotIn("alert(",self.current)
        self.assertIn("External alerts remain disabled",self.current)
    def test_11_all_34_scan_default(self):
        self.assertIn('memoryScan = input.string("34 instrumentos (experimental)"',self.current)
        self.assertIn('bool scanAll = memoryScan == "34 instrumentos (experimental)"',self.current)
    def test_12_explicit_no_certification(self):
        self.assertIn("QA NO CERT",self.current)
        self.assertIn("qaPhase1NonBtc",self.current)
    def test_13_btc_special_engine_unchanged(self):
        for snip in ("f_btc_crt_h4_ny(int t)",'str.upper(syminfo.ticker) == "BTCUSD"',
                     'isBTC ? "0000-0000:1234567"'):
            self.assertIn(snip,self.current)
    def test_14_ny_clocks_untouched(self):
        for snip in ("f_index_crt_h4_ny(int t)","f_forex_metal_crt_h4_ny(int t)","America/New_York"):
            self.assertIn(snip,self.current)
    def test_15_data_requests_unmodified(self):
        for pattern in ('calc_bars_count=600','calc_bars_count=110','calc_bars_count=60',
                        'lookahead=barmerge.lookahead_off'):
            self.assertEqual(self.origin.count(pattern),self.current.count(pattern))
    def test_16_source_size_and_label(self):
        self.assertEqual(len(self.origin.splitlines()),len(self.current.splitlines()))
        self.assertNotIn("V12W",self.current)
        self.assertIn("V34.12X IC · ",self.current)

if __name__ == "__main__":
    unittest.main(verbosity=2)
