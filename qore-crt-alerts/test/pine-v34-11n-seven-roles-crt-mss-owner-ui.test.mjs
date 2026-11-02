import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_11M_HISTORICO_HORAS_UTC_MOVIL_QA_NO_LIVE.pine");
const candidate=load("CRT_RADAR_PRO_V34_11N_MONITOR_7_ROLES_CRT_MSS5_MSS15_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const udt=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));

test("N reads 34 feed slots and retains V34.11M engine H4/MSS without changed logic",()=>{
 assert.equal(engine(candidate),engine(old));
 assert.equal(udt(candidate),udt(old));
 assert.equal((candidate.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((candidate.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((candidate.match(/request\.security\(/g)||[]).length,
   (old.match(/request\.security\(/g)||[]).length);
 assert.ok(candidate.includes("calc_bars_count=1500"));
 assert.ok(candidate.includes("lookahead=barmerge.lookahead_off"));
 assert.ok(candidate.includes('isBTC ? f_btc_crt_h4_ny(barT)'));
});

test("owner-first compact 7-role monitor shows exactly required information",()=>{
 assert.match(candidate,/userFocus7 = input\.bool\(true, "Monitor simple: CRT 7 roles \+ MSS M5\/M15 \(QA\)"/);
 assert.ok(candidate.includes('if barstate.islast and showDashboard and compactMobile and userFocus7'));
 for(const label of ['"MERCADO"','"CRT 7"','"DIR"','"MSS M5"','"MSS M15"','"ETAPA"'])
   assert.ok(candidate.includes(label),label);
 assert.ok(candidate.includes('int onPage = expandFull34 ? 10 : 2'));
 assert.ok(candidate.includes('int nFeeds = scanAll ? 34 : 1'));
 assert.ok(candidate.includes('table.cell(board,5,summaryRow,"NO PUSH"'));
 assert.ok(candidate.includes('table.cell(board,4,summaryRow,"7 ROLES"'));
});

test("all seven bit roles remain distinct; rejection and retest not mistaken for actionable CRT",()=>{
 for(const expression of [
  "mask / 1","mask / 2","mask / 4","mask / 8",
  "mask / 16","mask / 32","mask / 64",
  '"2C*"','"EXP RECH"','"INS RECH"','"MULTI QA"','"RETEST QA"'
 ])assert.ok(candidate.includes(expression),expression);
 assert.ok(candidate.includes('core ? "CRT H4" : extra ? "QA H4"'));
 assert.ok(candidate.includes('mask != 0 ? "QA" : "ESPERA"'));
 assert.ok(candidate.includes('QA != SENAL'));
 assert.ok(candidate.includes('RECH != CRT'));
});

test("M5/M15 are independent and bound to pivot before sweep, break after, source phase",()=>{
 assert.ok(candidate.includes('pivot5T < sweepT and break5T > sweepT'));
 assert.ok(candidate.includes('break5T % MIN5 == nativePhase * 60000'));
 assert.ok(candidate.includes('pivot15T < sweepT and break15T > sweepT'));
 assert.ok(candidate.includes('f_m15_phase_ok(break15T, nativePhase)'));
 assert.ok(candidate.includes('break15T <= close15T'));
 assert.ok(candidate.includes('m5Text = not (core or extra)'));
 assert.ok(candidate.includes('m15Text = not (core or extra)'));
 assert.ok(candidate.includes('extra ? "N/V"'));
 assert.ok(!candidate.includes('f_m5_phase_ok('));
});

test("legacy diagnostic modes remain accessible and 33 non-BTC cannot turn QA into green signals",()=>{
 assert.ok(candidate.includes('if barstate.islast and showDashboard and compactMobile and not userFocus7'));
 assert.ok(candidate.includes('not showSlotEventAudit and not showNonBtcCohortQA'));
 assert.ok(candidate.includes('showCatalog7 = input.bool(false'));
 assert.ok(candidate.includes('showNonBtcCohortQA = input.bool(false'));
 assert.ok(candidate.includes('bool scanCrtValid = available and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(candidate.includes('qaPhase1NonBtc = input.bool(true'));
 assert.ok(candidate.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(candidate.includes('useAlerts = input.bool(false'));
});
