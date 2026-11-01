import test from "node:test";
import assert from "node:assert/strict";
import {CRT_MODEL_FAMILIES,classifyCrtEntryModels} from "../src/crt-entry-model-catalog.mjs";

const c1=Date.parse("2026-10-31T05:00:00Z");
const c2=c1+14400000;
const sweep=c2+3600000;
const m15At=c2+7200000;
const provider="COINBASE_SPOT_PROBE",instrumentId="BTCUSD",direction=-1;
const cycleId=[provider,instrumentId,c1,direction].join("|");
const crt={state:"C3_NOT_INVALIDATED",provider,instrumentId,c1Start:c1,c2Start:c2,direction};
const m15={state:"MSS_CONFIRMED_C2",timeframe:"M15",direction,cycleId,c1Start:c1,
  sweepAt:sweep,pivotAt:sweep-3600000,mssAt:m15At,eligibleAfter:c2+14400000};
const conf={state:"REPLAY_CRT_M15_CONFLUENCE",cycleId,mssM15At:m15At};
const run=(x={})=>classifyCrtEntryModels({crt,mssM15:m15,confluence:conf,...x});
test("all seven documented family categories are present, only 3C reversal eligible",()=>{
 assert.equal(CRT_MODEL_FAMILIES.length,7);
 assert.equal(new Set(CRT_MODEL_FAMILIES.map(x=>x.id)).size,7);
 assert.equal(CRT_MODEL_FAMILIES.filter(x=>x.entryEligible).length,1);
});
test("three H4 valid + M15 closed same provider/cycle in C2 is QA confirmed not sendable",()=>{
 const r=run();
 assert.equal(r.primary.id,"CRT_3C_REVERSAL");
 assert.equal(r.primary.state,"QA_CONFIRMED_M15");
 assert.equal(r.primary.stage,"C2");
 assert.equal(r.primary.eligibleAfter,c2+14400000);
 assert.equal(r.primary.sendPush,false);
 assert.equal(r.actionable,false);
 assert.equal(r.certification,"NOT_CERTIFIED");
});
test("C3 stage is independently classified, with M5 absent entirely",()=>{
 const mssAt=c2+14400000+1800000;
 const x=run({mssM15:{...m15,state:"MSS_CONFIRMED_C3",mssAt},
  confluence:{...conf,mssM15At:mssAt}});
 assert.equal(x.primary.state,"QA_CONFIRMED_M15");
 assert.equal(x.primary.stage,"C3");
});
test("M5 confirmation without M15 cannot ever certify an entry",()=>{
 const r=run({mssM15:null,confluence:null});
 assert.equal(r.primary.state,"AWAITING_MSS_M15");
 assert.equal(r.primary.sendPush,false);
});
test("mismatched exchange, cycle or M15 pivot chronology fail closed",()=>{
 for(const m of [{...m15,cycleId:"IC|BTCUSD|other"},
    {...m15,pivotAt:sweep},
    {...m15,mssAt:sweep},
    {...m15,mssAt:m15At+1},
    {...m15,direction:1},
    {...m15,state:"MSS_CONFIRMED_C2",mssAt:null}]){
  const r=run({mssM15:m});
  assert.equal(r.primary.state,"AWAITING_MSS_M15");
 }
});
test("C3 close beyond C2 wick invalidates despite an old valid M15",()=>{
 const r=run({crt:{...crt,state:"C3_INVALIDATED"}});
 assert.equal(r.primary.state,"INVALIDATED");
 assert.equal(r.primary.sendPush,false);
});
test("C2 outside C1 is expansion diagnostic not reversal signal",()=>{
 const r=run({crt:{state:"C2_CLOSE_OUTSIDE_C1",direction:-1}});
 assert.equal(r.primary.id,"CRT_2C_EXPANSION");
 assert.equal(r.primary.state,"DIAGNOSTIC_ONLY");
});
test("C2 double strict sweep and absent strict sweep both rejected",()=>{
 for(const state of ["DOUBLE_STRICT_SWEEP","NO_STRICT_SWEEP"]){
  const r=run({crt:{state}});
  assert.equal(r.primary.state,"REJECTED");
 }
});
test("2 candle ratified is a candidate but awaits the third H4 for full cycle",()=>{
 const r=run({crt:{...crt,state:"C2_RATIFIED_AWAITING_C3"},confluence:null,mssM15:null});
 assert.equal(r.primary.state,"AWAITING_MSS_M15");
 assert.equal(r.auxiliaries[0].id,"CRT_2C_CANDIDATE");
 assert.equal(r.auxiliaries[0].state,"AWAITING_C3");
});
test("Inside Return, Inside Continuation and Multi-H4 never steal same-cycle MSS",()=>{
 for(const state of ["RATIFIED","CONTINUATION"]){
  const x=run({insideBar:{state},multicandle:{state:"SEEKING"}});
  assert.equal(x.auxiliaries[0].state,"DIAGNOSTIC_ONLY");
  assert.equal(x.auxiliaries[1].id,"CRT_MULTICANDLE");
  assert.equal(x.primary.state,"QA_CONFIRMED_M15");
 }
});
test("M15 retest is an independent diagnostic until real M15 closing evidence",()=>{
 const x=run({retestM15:{state:"TOUCH_OBSERVED"}});
 assert.equal(x.auxiliaries[0].id,"CRT_M15_RETEST");
 assert.equal(x.auxiliaries[0].sendPush,false);
});
test("PDH/PDL and FVG context require provenance/time and never upgrade entries",()=>{
 const x=run({mssM15:null,confluence:null,
  liquidity:{sameProvider:true,sameC2SweepAt:true,swept:"PDH"},
  fvg:{sameProvider:true,confirmedAfterSweep:true,timeframe:"H4"}});
 assert.deepEqual(x.contexts,["PDH_SAME_SWEEP","FVG_H4_CONTEXT"]);
 assert.equal(x.primary.state,"AWAITING_MSS_M15");
 const y=run({liquidity:{sameProvider:false,sameC2SweepAt:true,swept:"PDH"},
  fvg:{sameProvider:true,confirmedAfterSweep:false,timeframe:"H4"}});
 assert.deepEqual(y.contexts,[]);
});
test("unknown CRT and no data remain non-actionable",()=>{
 for(const crt of [null,{state:"INVALID_CYCLE"},{state:"DATA_GAP"}]){
  const r=run({crt});
  assert.equal(r.primary.sendPush,false);
  assert.equal(r.actionable,false);
 }
});
