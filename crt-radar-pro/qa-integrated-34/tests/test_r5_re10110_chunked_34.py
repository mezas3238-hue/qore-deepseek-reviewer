"""QORE CRT 34 R5 QA RE10110: exact partitioning + preserved detector invariants.
Static-only certification: it does NOT compile Pine or benchmark TradingView.
"""
from pathlib import Path
import hashlib
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine"
CANDIDATE=ROOT/"QORE_CRT_34_R5_RE10110_LOOPS_6X_LASTBAR_QA.pine"
SHA_BASE="693e3f49719e86e2ea0702f7b355af33bd0c4c7c"
SHA_R5="c8bd9ecf2b8a5dd1877fb0ede0a6da29355d466f"
class RuntimeR5Safety(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.a=BASE.read_text(encoding="utf-8")
        cls.b=CANDIDATE.read_text(encoding="utf-8")
    def test_01_pinned_source_blobs(self):
        for p,d in ((BASE,SHA_BASE),(CANDIDATE,SHA_R5)):
            b=p.read_bytes()
            self.assertEqual(hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest(),d)
    def test_02_all_thirty_four_slots(self):
        for s in (self.a,self.b):
            slots=re.findall(r'^s(\d\d) = "(IC:[A-Z0-9]+)"$',s,re.M)
            self.assertEqual(len(slots),34)
            self.assertEqual([int(x) for x,y in slots],list(range(1,35)))
            self.assertEqual(len(set(y for x,y in slots)),34)
    def test_03_six_non_overlapping_blocks(self):
        blocks=[(int(a),int(b)) for a,b in re.findall(r'qorePrefetched := f_prefetchBlock\((\d+), (\d+), qorePrefetched\)',self.b)]
        self.assertEqual(blocks,[(0,5),(6,11),(12,17),(18,23),(24,29),(30,33)])
        self.assertEqual([i for a,b in blocks for i in range(a,b+1)],list(range(34)))
    def test_04_single_request_syntax_for_34(self):
        self.assertEqual(self.b.count("Signal rawM5 = request.security("),1)
        self.assertNotIn('Signal s = request.security(symbol, "5",',self.b)
        self.assertIn("Signal s = array.get(qorePrefetched, i)",self.b)
    def test_05_unchanged_request_arguments(self):
        self.assertIn('request.security(feedSymbol, "5", f_engine_snapshot(), lookahead=barmerge.lookahead_off, ignore_invalid_symbol=true, calc_bars_count=400)',self.b)
        self.assertEqual(self.b.count("calc_bars_count=400)"),2)
        self.assertEqual(self.b.count("calc_bars_count=10)"),2)
        self.assertEqual(self.b.count("calc_bars_count=60)"),1)
    def test_06_btc_and_index_slots(self):
        for x in ('s05 = "IC:USTEC"','s06 = "IC:US500"','s07 = "IC:US30"','s08 = "IC:BTCUSD"'):
            self.assertIn(x,self.b)
    def test_07_34_forced_without_single_btc(self):
        self.assertIn("const bool scanAll = true",self.b)
    def test_08_motor_unchanged_bytewise(self):
        a=self.a.split("f_engine() =>",1)[1].split("f_engine_snapshot() =>",1)[0]
        b=self.b.split("f_engine() =>",1)[1].split("f_engine_snapshot() =>",1)[0]
        self.assertEqual(a,b)
    def test_09_seven_category_bits(self):
        for x in ('categoryTrue3C','category2CPending','category2CExpansion','categoryInsideReturn','categoryInsideContinuation','categoryMultiCandle','categoryM15Retest'):
            self.assertIn(x+" ?",self.b)
    def test_10_safety_gate_preserved(self):
        self.assertIn("bool scanCrtValid = structuralCoreObserved and i == 7",self.b)
        self.assertIn("bool observedCoreQA = structuralCoreObserved and i != 7",self.b)
    def test_11_mss_phase_preserved(self):
        self.assertIn("f_m15_phase_ok(",self.b)
        self.assertIn("f_monitorOwnMss(int slot)",self.b)
    def test_12_fixed_fvg_preserved(self):
        self.assertIn("for j = 0 to k - 1",self.b)
    def test_13_external_ic_feed_preserved(self):
        self.assertIn("bool chartExternalQA = chartIsIC and chartStaticSlot < 0",self.b)
        self.assertIn('Signal outsideM5 = request.security(syminfo.tickerid, "5", f_engine_snapshot()',self.b)
    def test_14_chart_slot_determined_from_first_bar(self):
        self.assertIn("var int chartStaticSlot = -1",self.b)
        self.assertIn("if barstate.isfirst and chartIsIC",self.b)
        self.assertIn("chartStaticSlot := si",self.b)
        self.assertNotIn("chartStaticSlot := i",self.b)
    def test_15_scan_processing_only_last_chart_bar(self):
        self.assertIn("if barstate.islast\n    for i = 0 to 33",self.b)
        self.assertIn("Signal s = array.get(qorePrefetched, i)",self.b)
    def test_16_prefetch_evaluates_unconditionally(self):
        i=self.b.index("var array<Signal> qorePrefetched")
        k=self.b.index("Signal integratedOwn = na")
        self.assertLess(i,k)
        self.assertNotIn("if barstate.islast",self.b[i:k])
    def test_17_m5_calculation_always_on_each_closed_candle(self):
        self.assertIn("    Signal state = f_engine()",self.b)
        self.assertIn("    barstate.islast ? state : na",self.b)
    def test_18_pdh_pdl_and_hud_preserved(self):
        for x in ("dailyPDH","dailyPDL","f_qaMssMissingReason","string feedDiag","string crtDiag"):
            self.assertIn(x,self.b)
    def test_19_all_fifteen_colors(self):
        self.assertEqual(self.b.count("input.color("),15)
    def test_20_no_trading_or_alert_activations(self):
        for x in ("strategy.entry(","alertcondition(","alert("):
            self.assertNotIn(x,self.b)
    def test_21_same_inputs(self):
        def inputs(s):
            return [l for l in s.splitlines() if " = input." in l]
        self.assertEqual(inputs(self.a),inputs(self.b))
    def test_22_no_max_buffer_forcing(self):
        self.assertNotIn("max_bars_back=600",self.b)
    def test_23_full_34_loop_removed_from_security(self):
        pre=self.b.split("f_prefetchBlock(int lo, int hi",1)[1].split("var array<Signal> qorePrefetched",1)[0]
        self.assertIn("for k = lo to hi",pre)
        self.assertIn("array.set(sink, k, rawM5)",pre)
    def test_24_six_chunks_largest_six(self):
        chunks=[(int(x),int(y)) for x,y in re.findall(r'f_prefetchBlock\((\d+), (\d+), qorePrefetched\)',self.b)]
        self.assertLessEqual(max(y-x+1 for x,y in chunks),6)

if __name__=="__main__":
    unittest.main(verbosity=2)
