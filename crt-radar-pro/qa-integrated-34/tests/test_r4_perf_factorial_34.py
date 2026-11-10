"""QORE V34.12X 34-market 2x2 history/buffer A/B source-contract QA.

WARNING: static tests only. No Pine compilation, latency or real 34x7 event parity.
"""
import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "baseline600_auto": ROOT / "QORE_CRT_RADAR_34_CHART_V34_12X_R3_34FVG_FIX_SAFE_PERF_QA.pine",
    "400_auto": ROOT / "QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine",
    "600_global600": ROOT / "QORE_CRT_34_R4_AB_600_M5_GLOBAL_BUFFER_600_QA.pine",
    "400_global600": ROOT / "QORE_CRT_RADAR_34_CHART_V34_12X_R3_EXPERIMENTO_400_M5_QA.pine",
}
SHA = {
    "baseline600_auto": "def86ba8684c77e4db687743d54145643967de24",
    "400_auto": "693e3f49719e86e2ea0702f7b355af33bd0c4c7c",
    "600_global600": "fd91a0f9dcc00b8a9eb27892c58a7c205018cf72",
    "400_global600": "13798aa054739f21eec04bf805ecf0bd548abe5f",
}
OLD_REQUEST = "calc_bars_count=600)"
NEW_REQUEST = "calc_bars_count=400)"
OLD_BUFFER = "max_boxes_count=5, dynamic_requests=true)"
NEW_BUFFER = "max_boxes_count=5, max_bars_back=600, dynamic_requests=true)"
class PerformanceAB(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = {k: v.read_text(encoding="utf-8") for k,v in SOURCES.items()}
        cls.base = cls.text["baseline600_auto"]
    def test_01_sha_pinned_no_source_drift(self):
        for name,s in self.text.items():
            b=s.encode("utf-8")
            blob=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
            self.assertEqual(blob,SHA[name],name)
    def test_02_unique_two_m5_request_sites(self):
        self.assertEqual(self.base.count(OLD_REQUEST),2)
        self.assertEqual(self.base.count(NEW_REQUEST),0)
    def test_03_indicator_single_buffer_site(self):
        self.assertEqual(self.base.count(OLD_BUFFER),1)
    def test_04_400_auto_exact_two_requested_edits(self):
        self.assertEqual(self.text["400_auto"],self.base.replace(OLD_REQUEST,NEW_REQUEST))
    def test_05_600_global_exact_one_declaration_edit(self):
        self.assertEqual(self.text["600_global600"],self.base.replace(OLD_BUFFER,NEW_BUFFER))
    def test_06_400_global_exact_three_edits(self):
        self.assertEqual(self.text["400_global600"],self.base.replace(OLD_REQUEST,NEW_REQUEST).replace(OLD_BUFFER,NEW_BUFFER))
    def test_07_all_34_slots_no_omissions(self):
        expected=re.findall(r'^s(\d{2}) = "(IC:[A-Z0-9]+)"$',self.base,re.M)
        self.assertEqual(len(expected),34)
        self.assertEqual([int(i) for i,_ in expected],list(range(1,35)))
        self.assertEqual(len({sym for _,sym in expected}),34)
        for name,s in self.text.items():
            self.assertEqual(re.findall(r'^s(\d{2}) = "(IC:[A-Z0-9]+)"$',s,re.M),expected,name)
    def test_08_btc_and_three_index_slots(self):
        for name,s in self.text.items():
            for tok in ('s05 = "IC:USTEC"','s06 = "IC:US500"','s07 = "IC:US30"','s08 = "IC:BTCUSD"'):
                self.assertIn(tok,s,name)
    def test_09_7_role_flags(self):
        cats=["categoryTrue3C","category2CPending","category2CExpansion","categoryInsideReturn","categoryInsideContinuation","categoryMultiCandle","categoryM15Retest"]
        for name,s in self.text.items():
            for token in cats:self.assertIn(token+" ?",s,name)
    def test_10_all_feed_scan_forced(self):
        for name,s in self.text.items():
            self.assertIn("const bool scanAll = true",s,name)
            self.assertIn("for i = 0 to 33",s,name)
    def test_11_btc_engine_not_altered(self):
        for s in self.text.values():self.assertIn("f_btc_crt_h4_ny(int t)",s)
    def test_12_mss_and_c1_safety_kept(self):
        for s in self.text.values():
            self.assertIn("f_monitorOwnMss(int slot)",s)
            self.assertIn('bool scanCrtValid = structuralCoreObserved and i == 7',s)
            self.assertIn('bool observedCoreQA = structuralCoreObserved and i != 7',s)
    def test_13_fvg_j0_fix_preserved(self):
        for s in self.text.values():
            self.assertIn('for j = 0 to k - 1',s)
            self.assertIn('lookahead=barmerge.lookahead_off',s)
    def test_14_rendering_fifteen_colors_preserved(self):
        for name,s in self.text.items():self.assertEqual(s.count('input.color('),15,name)
    def test_15_no_new_alerts_orders(self):
        for name,s in self.text.items():
            for tok in ('alert(', 'alertcondition(', 'strategy.entry('):
                self.assertNotIn(tok,s,name)
    def test_16_default_keep_hours_48(self):
        self.assertIn('keepHours = input.int(48, "Memoria ultimo CRT (horas)", minval=4, maxval=120',self.base)
    def test_17_400_bars_do_not_cover_default_48h_continuous(self):
        self.assertLess(400*5,48*60)
    def test_18_600_bars_only_narrowly_cover_48h_continuous(self):
        self.assertGreaterEqual(600*5,48*60)
        self.assertLess(600*5,120*60)
    def test_19_40_h4_inside_option_can_exceed_400_m5_hours(self):
        self.assertIn('maxH4Life = input.int(3, "Vida Inside Bar (H4 cerradas)", minval=1, maxval=10',self.base)
        self.assertLess(400*5,10*4*60)
    def test_20_external_ic_chart_m5_is_not_hidden(self):
        for name,s in self.text.items():
            expected=NEW_REQUEST if name.startswith("400_") else OLD_REQUEST
            self.assertIn('Signal outsideM5 = request.security(syminfo.tickerid, "5", f_engine_snapshot()',s)
            self.assertEqual(s.count(expected),2)
    def test_21_data_and_daily_preserved(self):
        for s in self.text.values():
            self.assertEqual(s.count("calc_bars_count=10)"),2)
            self.assertEqual(s.count("calc_bars_count=60)"),1)
    def test_22_engine_snapshot_unchanged(self):
        for s in self.text.values():
            self.assertIn("f_engine_snapshot() =>",s)
            self.assertIn("    Signal state = f_engine()",s)
            self.assertIn("    barstate.islast ? state : na",s)
            self.assertIn('bool chartExternalQA = chartIsIC and chartStaticSlot < 0',s)

if __name__ == "__main__":
    unittest.main(verbosity=2)
