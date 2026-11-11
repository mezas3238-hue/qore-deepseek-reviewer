"""R3 QORE CRT 34 GitHub regression. Static and synthetic only; not Pine compilation."""
from pathlib import Path
import hashlib,re,unittest
ROOT=Path(__file__).resolve().parents[1]
R2=ROOT/"QORE_CRT_RADAR_34_CHART_12X_R2_ALL34_OWNERSAFE_QA_NO_LIVE.pine"
R3=ROOT/"QORE_CRT_RADAR_34_CHART_V34_12X_R3_34FVG_FIX_SAFE_PERF_QA.pine"
EXP=ROOT/"QORE_CRT_RADAR_34_CHART_V34_12X_R3_EXPERIMENTO_400_M5_QA.pine"
def sha(s):
 b=s.encode('utf-8')
 return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def mitigate(k,lows,highs,bull,top,bottom,patched=True):
 full=partial=False
 for j in (range(k) if patched else range(1,k) if k>1 else []):
  if bull:
   if lows[j] <= bottom: full=True
   elif lows[j] <= top: partial=True
  else:
   if highs[j] >= top: full=True
   elif highs[j] >= bottom: partial=True
 return full,partial
class R3FvgAndPerformance(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.r2=R2.read_text(encoding='utf-8')
  cls.r3=R3.read_text(encoding='utf-8')
  cls.exp=EXP.read_text(encoding='utf-8')
 def test_01_source_sha(self):
  self.assertEqual(sha(self.r2),"85060ecbb836e9ab5a8e07bc2395de470917458e")
  self.assertEqual(sha(self.r3),"def86ba8684c77e4db687743d54145643967de24")
  self.assertEqual(sha(self.exp),"13798aa054739f21eec04bf805ecf0bd548abe5f")
 def test_02_exactly_34_sounds(self):
  p=r'^s\d\d = "IC:[A-Z0-9]+"$'
  a=re.findall(p,self.r2,re.M);b=re.findall(p,self.r3,re.M)
  self.assertEqual(a,b);self.assertEqual(len(a),34)
 def test_03_market_anchors(self):
  for n in ('s05 = "IC:USTEC"','s06 = "IC:US500"','s07 = "IC:US30"','s08 = "IC:BTCUSD"'):
   self.assertIn(n,self.r3)
 def test_04_radar_always_34(self):
  self.assertIn("const bool scanAll = true",self.r3)
  self.assertIn("for i = 0 to 33",self.r3)
 def test_05_seven_roles(self):
  for k in ('categoryTrue3C','category2CPending','category2CExpansion','categoryInsideReturn','categoryInsideContinuation','categoryMultiCandle','categoryM15Retest'):
   self.assertIn(k+' ?',self.r3)
 def test_06_no_false_33_promotion(self):
  self.assertIn('bool scanCrtValid = structuralCoreObserved and i == 7',self.r3)
  self.assertIn('bool observedCoreQA = structuralCoreObserved and i != 7',self.r3)
 def test_07_FVG_j0(self):
  self.assertIn('for j = 0 to k - 1',self.r3)
  self.assertNotIn('if k > 1\n                for j = 1 to k - 1',self.r3)
 def test_08_bull_full_j0(self):
  self.assertEqual(mitigate(1,[99],[111],True,110,100),(True,False))
  self.assertEqual(mitigate(1,[99],[111],True,110,100,False),(False,False))
 def test_09_bull_partial_j0(self):
  self.assertEqual(mitigate(1,[105],[111],True,110,100),(False,True))
 def test_10_bull_intact_j0(self):
  self.assertEqual(mitigate(1,[111],[113],True,110,100),(False,False))
 def test_11_bear_full_j0(self):
  self.assertEqual(mitigate(1,[99],[111],False,110,100),(True,False))
  self.assertEqual(mitigate(1,[99],[111],False,110,100,False),(False,False))
 def test_12_bear_partial_j0(self):
  self.assertEqual(mitigate(1,[99],[104],False,110,100),(False,True))
 def test_13_bear_intact_j0(self):
  self.assertEqual(mitigate(1,[99],[97],False,110,100),(False,False))
 def test_14_older_FVG_wick(self):
  self.assertEqual(mitigate(3,[111,112,99],[113,114,100],True,110,100),(True,False))
  self.assertEqual(mitigate(3,[111,99,112],[113,114,115],True,110,100),(True,False))
 def test_15_H4_non_future(self):
  self.assertIn('"240", f_chartH4Fvgs(chartFvgLookbackH4), lookahead=barmerge.lookahead_off',self.r3)
  self.assertIn("currentH4LowSeen",self.r3)
 def test_16_H4_40_history_60(self):
  self.assertGreaterEqual(60,40+2+14)
  self.assertIn('maxval=40',self.r3)
  self.assertIn('calc_bars_count=60)',self.r3)
  self.assertNotIn('calc_bars_count=35)',self.r3)
 def test_17_daily_10(self):
  self.assertEqual(self.r3.count('calc_bars_count=10)'),2)
  self.assertIn('[high[1], low[1], time[1], time]',self.r3)
 def test_18_M5_safe_600(self):
  self.assertEqual(self.r3.count('calc_bars_count=600)'),2)
  self.assertNotIn('max_bars_back=600',self.r3)
 def test_19_lazily_construct_output_only(self):
  a=self.r2.split('f_engine() =>',1)[1].split('f_engine_snapshot()',1)[0]
  b=self.r3.split('f_engine() =>',1)[1].split('f_engine_snapshot()',1)[0]
  b=b.replace('barstate.islast ? FamilyVisual.new(','FamilyVisual.new(').replace('barstate.islast ? Signal.new(','Signal.new(').replace('familyVisualKind, familyHasOwnC1) : na','familyVisualKind, familyHasOwnC1)').replace('extraMss5Causal ? extraC1 : na) : na','extraMss5Causal ? extraC1 : na)')
  self.assertEqual(a,b)
 def test_20_exact_experiment_diff(self):
  e=self.r3.replace('calc_bars_count=600)','calc_bars_count=400)').replace('max_boxes_count=5, dynamic_requests=true)','max_boxes_count=5, max_bars_back=600, dynamic_requests=true)')
  self.assertEqual(self.exp,e)
 def test_21_chart_external(self):
  self.assertIn('bool chartExternalQA = chartIsIC and chartStaticSlot < 0',self.r3)
 def test_22_mss_reasons_and_hud(self):
  self.assertIn('f_qaMssMissingReason(',self.r3)
  self.assertIn('string feedDiag',self.r3)
  self.assertIn('string crtDiag',self.r3)
 def test_23_colors(self):
  self.assertEqual(self.r3.count('input.color('),15)
 def test_24_top3_limitation_transparent(self):
  self.assertIn('NO se certifica top-3 global',self.r3)
 def test_25_sentinel_explicit(self):
  self.assertIn('SENTINEL, nunca usar para array.get',self.r3)
 def test_26_safety_no_live_orders(self):
  for k in ('strategy.entry(','alertcondition(','alert('): self.assertNotIn(k,self.r3)
 def test_27_static_requests_unchanged(self):
  def calls(s):
   return [x for x in s.splitlines() if 'request.security(' in x and not x.lstrip().startswith('//')]
  self.assertEqual(len(calls(self.r2)),len(calls(self.r3)))
 def test_28_QA_marked(self):
  self.assertIn('QA NO CERT',self.r3)
