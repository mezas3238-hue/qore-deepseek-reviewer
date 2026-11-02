import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_11K_CRT_48M5_H4_CERRADA_QA_NO_LIVE.pine");
const candidate=load("CRT_RADAR_PRO_V34_11L_HISTORIAL_7_CATEGORIAS_QA_NO_LIVE.pine");
const fields=[
 ["Candidate2C","qaLastCandidate2CAt"],
 ["Ratified2C","qaLastRatified2CAt"],
 ["RejectedExpansion","qaLastRejectedExpansionAt"],
 ["Confirmed3C","qaLastConfirmed3CAt"],
 ["InsideReturn","qaLastInsideReturnAt"],
 ["InsideContinuation","qaLastInsideContinuationAt"],
 ["Multi4","qaLastMulti4At"],["MultiN","qaLastMultiNAt"],
 ["Retest15","qaLastRetest15At"]
];
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const signal=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const fieldCount=x=>(signal(x).match(/^\s+(?:int|float|bool|string) \w+/gm)||[]).length;
test("QA V34.11L remains beneath Pine UDT 128-field bound and 34 feed request budget",()=>{
 assert.equal(fieldCount(old),116);
 assert.equal(fieldCount(candidate),126);
 assert.equal((candidate.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((candidate.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((candidate.match(/request\.security\(/g)||[]).length,
  (old.match(/request\.security\(/g)||[]).length);
 assert.ok(candidate.includes('calc_bars_count=1500'));
 assert.ok(candidate.includes('lookahead=barmerge.lookahead_off'));
});
test("All 9 history timestamps are persisted in same-source Signal, 34 slot arrays, and QA view",()=>{
 for(const [key,prop] of fields){
  assert.ok(candidate.includes("int "+prop),"Signal "+key);
  assert.ok(candidate.includes("var int "+prop+" = na"),"engine memory "+key);
  assert.ok(candidate.includes("var array<int> qaHist"+key+"BySlot = array.new_int(34, na)"),"slot array "+key);
  assert.ok(candidate.includes("array.set(qaHist"+key+"BySlot, i, available ? s."+prop+" : na)"),"source mapping "+key);
  assert.ok(candidate.includes("array.get(qaHist"+key+"BySlot,slot)"),"table "+key);
 }
 assert.ok(candidate.includes('qaHistoricLast = input.bool(false,'));
 assert.ok(candidate.includes('"V34.11L"'));
 assert.ok(!candidate.includes('table.cell(board,0,9,"V34.11d"'));
});
test("History records ONLY on closed source events, never fabricate MSS15",()=>{
 for(const x of [
  "qaLastMulti4At := m4.endAt",
  "qaLastMultiNAt := endH4.endAt",
  "qaLastConfirmed3CAt := h4LastEnd",
  "qaLastInsideReturnAt := h4LastEnd",
  "qaLastInsideContinuationAt := h4LastEnd",
  "qaLastRejectedExpansionAt := h4LastEnd",
  "qaLastRatified2CAt := h4LastEnd",
  "qaLastCandidate2CAt := barEnd",
  "qaLastRetest15At := outRetest15At"
 ])assert.ok(candidate.includes(x),x);
 assert.ok(candidate.includes('bool validC3Close = fullH4'));
 assert.ok(candidate.includes('bool validC2Data = fullH4'));
 assert.ok(candidate.includes('bool c1CompleteData = fullH4'));
 assert.ok(candidate.includes('bool closedH4Complete = fullH4'));
 assert.ok(candidate.includes('bool insideH4Closed = fullH4'));
 assert.ok(candidate.includes('c2StrictSweep and not c2Double'));
 assert.ok(candidate.includes('f_m15_phase_ok(outM15At, qaNativeSourcePhaseMin)'));
 assert.ok(candidate.includes('qaLastCandidate2CCycle != c2Start'));
});
test("Detailed diagnostic explains current MASK7=0 alongside historical event timestamps without converting them into signals",()=>{
 assert.ok(candidate.includes('table.cell(board,1,1,displayedPhase'));
 assert.ok(candidate.includes('table.cell(board,2,1,responded ? str.tostring(mask)'));
 assert.ok(candidate.includes('if qaHistoricLast'));
 assert.ok(candidate.includes('    else\n        // Historical counters are computed'));
 assert.ok(candidate.includes('"HIST != ACT"'));
 assert.ok(candidate.includes('"SIN MSS PROOF"'));
 assert.ok(candidate.includes('"SIN CERT"'));
 assert.ok(candidate.includes('"NO PUSH"'));
 assert.equal((candidate.match(/table\.cell\(board,\d,1[0-4],/g)||[]).length>
   (old.match(/table\.cell\(board,\d,1[0-4],/g)||[]).length,true);
});
test("BTCUSD original detection logic and independent source-phase gating are intact",()=>{
 const prefix=(x)=>engine(x).split("    // Procesamos la ULTIMA M5 cerrada")[0];
 assert.ok(candidate.includes('isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)'));
 assert.ok(candidate.includes('int bucketH4 = bucketH4NY + qaNativeSourcePhaseMin * 60000'));
 assert.ok(candidate.includes('bool scanCrtValid = available and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(candidate.includes('bool certifiedCRT = (not qaPhase1NonBtc or i == 7)'));
 assert.ok(candidate.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert5'));
 assert.ok(candidate.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.equal(prefix(candidate).includes('var int qaLastCandidate2CAt = na'),true);
 assert.ok(!candidate.includes('minBarsC1 = input.int'));
});
