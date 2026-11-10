"""QORE CRT R2 QA-only: exact 34/34 scanner and safe feed promotion gates."""
import hashlib,re,difflib,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]/"crt-radar-pro/qa-integrated-34"
R1=ROOT/"QORE_CRT_RADAR_34_CHART_12X_R1_34_MERCADOS_QA_NO_LIVE.pine"
R2=ROOT/"QORE_CRT_RADAR_34_CHART_12X_R2_ALL34_OWNERSAFE_QA_NO_LIVE.pine"
class StrictR2(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=R1.read_text(encoding="utf-8");cls.b=R2.read_text(encoding="utf-8")
 def test_01_exact_github_blobs(self):
  def blob(s):
   b=s.encode("utf-8")
   return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
  self.assertEqual(blob(self.a),"208d38abc9e30bd06fa540b0f6d543180103df03")
  self.assertEqual(blob(self.b),"85060ecbb836e9ab5a8e07bc2395de470917458e")
 def test_02_all_thirty_four_slots(self):
  a=re.findall(r'^s(\d{2}) = "(IC:[A-Z0-9]+)"$',self.b,re.M)
  self.assertEqual(len(a),34);self.assertEqual([int(x) for x,y in a],list(range(1,35)))
  self.assertEqual(len({y for x,y in a}),34)
 def test_03_btc_engine_kept(self):
  self.assertIn('s08 = "IC:BTCUSD"',self.b)
  self.assertIn('f_btc_crt_h4_ny(int t)',self.b)
 def test_04_index_slots_kept(self):
  for x in ['s05 = "IC:USTEC"','s06 = "IC:US500"','s07 = "IC:US30"']:
   self.assertIn(x,self.b)
 def test_05_no_manual_btc_only_mode(self):
  self.assertIn('const bool scanAll = true',self.b)
  self.assertNotIn('memoryScan = input.string(',self.b)
  self.assertNotIn('bool scanAll = memoryScan ==',self.b)
 def test_06_closed_m5_every_feed(self):
  for x in ['for i = 0 to 33','request.security(symbol, "5", f_engine_snapshot()',
            'lookahead=barmerge.lookahead_off','calc_bars_count=600','int barT = time[1]']:
   self.assertIn(x,self.b)
 def test_07_no_qa_checkbox_33_promotions(self):
  self.assertIn('bool scanCrtValid = structuralCoreObserved and i == 7',self.b)
  self.assertIn('bool observedCoreQA = structuralCoreObserved and i != 7',self.b)
  self.assertNotIn('structuralCoreObserved and (not qaPhase1NonBtc or i == 7)',self.b)
 def test_08_chart_color_safe(self):
  self.assertIn('chartCoreActive and chartBtcSymbol and not chartExternalQA',self.b)
  self.assertNotIn('chartCoreActive and (not qaPhase1NonBtc or chartBtcSymbol)',self.b)
 def test_09_chart_label_safe(self):
  self.assertIn('chartBtcSymbol ? "2C RAT" : "2C QA"',self.b)
  self.assertNotIn('(not qaPhase1NonBtc or chartBtcSymbol) ? "2C RAT"',self.b)
 def test_10_mss_family_logic_preserved(self):
  for x in ('bool family5QA = extraValidQA','bool family15QA = extraValidQA','f_monitorOwnMss(int slot)','f_m15_phase_ok('):
   self.assertIn(x,self.b)
 def test_11_all_seven_crt_roles_present(self):
  for x in ('categoryTrue3C','category2CPending','category2CExpansion','categoryInsideReturn','categoryInsideContinuation','categoryMultiCandle','categoryM15Retest'):
   self.assertIn(x+' ?',self.b)
 def test_12_colors_still_fifteen(self):
  self.assertEqual(self.b.count('input.color('),15)
 def test_13_no_alert_order_activation(self):
  for x in ('alert(', 'alertcondition(', 'strategy.entry('):self.assertNotIn(x,self.b)
  self.assertIn('External alerts remain disabled',self.b)
 def test_14_nonbtc_observations_retained(self):
  for x in ('array.set(qaCoreObservedFlags, i, observedCoreQA)','array.set(validCrtFlags, i, anyStructuralCRT)'):
   self.assertIn(x,self.b)
 def test_15_qa_not_cert(self):
  for x in ('QA NO CERT','qaPhase1NonBtc = input.bool(true','const bool scanAll = true'):
   self.assertIn(x,self.b)
 def test_16_only_five_approved_edit_blocks(self):
  x=[tag for tag,*v in difflib.SequenceMatcher(a=self.a.splitlines(),b=self.b.splitlines(),autojunk=False).get_opcodes() if tag!='equal']
  self.assertEqual(len(x),5)
if __name__=='__main__':unittest.main()
