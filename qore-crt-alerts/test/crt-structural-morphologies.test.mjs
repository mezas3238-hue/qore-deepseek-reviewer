import test from "node:test";
import assert from "node:assert/strict";
import {STRUCTURAL_MORPHOLOGIES,LEGACY_CATEGORY_ROLES,
  inspectCrtMorphologies,verifyMssM15ForFamily
} from "../src/crt-structural-morphologies.mjs";

const H4=14_400_000,M15=900_000;
const base=Date.parse("2026-11-02T06:00:00Z"); // 01:00 NY after DST change
const provider="COINBASE_QA",instrumentId="BTCUSD";
const bar=(i,open,high,low,close,extra={})=>({
 timeframe:"H4",provider,instrumentId,
 openedAt:base+i*H4,closedAt:base+(i+1)*H4,
 open,high,low,close,nyHour:(1+4*i)%24,allowedC1:i===0,...extra
});
const c1=bar(0,105,110,100,105);
const bullC2=bar(1,105,109,98,103);
const bearC2=bar(1,105,112,101,106);
const get=(bars)=>inspectCrtMorphologies({closedH4:bars,family:"crypto"});
const signal=(r,model)=>r.signals.filter(x=>x.model===model);
const diag=(r,model)=>r.diagnostics.filter(x=>x.model===model);
test("four documented H4 morphologies are not seven separately ratifiable family signals",()=>{
 assert.deepEqual(STRUCTURAL_MORPHOLOGIES,
   ["CRT_2C_RETURN","CRT_3C_REVERSAL","CRT_MULTICANDLE","CRT_INSIDE_BAR"]);
 assert.equal(Object.keys(LEGACY_CATEGORY_ROLES).length,7);
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_M15_RETEST,"ENTRY_CONFIRMATION");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_2C_CANDIDATE,"PENDING_STAGE");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_2C_EXPANSION,"REJECTED_OR_CONTEXT");
});
test("2C bullish and bearish strict single sweep, completed C2 inside C1",()=>{
 for(const [c2,dir] of [[bullC2,1],[bearC2,-1]]){
  const r=get([c1,c2]);const x=signal(r,"CRT_2C_RETURN");
  assert.equal(x.length,1);assert.equal(x[0].direction,dir);
  assert.equal(x[0].ratifiedAt,c2.closedAt);
  assert.equal(x[0].state,"RATIFIED_H4_QA");
  assert.equal(x[0].certified,false);
  assert.equal(x[0].actionable,false);assert.equal(x[0].sendPush,false);
 }
});
test("3C uses SAME C1/C2 ratification and only checks C3 invalidation at its H4 close",()=>{
 const passed=bar(2,104,117,101,111);
 const invalidated=bar(2,104,108,96,97);
 const good=get([c1,bullC2,passed]),bad=get([c1,bullC2,invalidated]);
 assert.equal(signal(good,"CRT_3C_REVERSAL")[0].state,"RATIFIED_H4_QA");
 assert.equal(signal(bad,"CRT_3C_REVERSAL").length,0);
 assert.equal(signal(good,"CRT_3C_REVERSAL")[0].ratifiedAt,bullC2.closedAt);
 assert.equal(signal(good,"CRT_2C_RETURN").length,0); // same C1, no double count
 assert.equal(signal(bad,"CRT_2C_RETURN").length,0); // C3 invalidates the live cycle
 assert.equal(diag(bad,"CRT_3C_REVERSAL")[0].state,"C3_INVALIDATED");
});
test("double sweep and touch-only must never create a structural CRT",()=>{
 assert.equal(signal(get([c1,bar(1,105,112,98,106)]),"CRT_2C_RETURN").length,0);
 assert.equal(signal(get([c1,bar(1,105,110,100,105)]),"CRT_2C_RETURN").length,0);
});
test("C2 close outside original range is expansion diagnostic, never entry",()=>{
 const x=get([c1,bar(1,105,114,102,112)]);
 assert.equal(signal(x,"CRT_2C_RETURN").length,0);
 assert.equal(diag(x,"CRT_2C_EXPANSION").length,1);
 assert.equal(diag(x,"CRT_2C_EXPANSION")[0].state,"REJECTED_NON_RETURN");
});
test("strict Inside C2 then C3 sweep of INSIDE low, closing within C2, is QA structural",()=>{
 const inside=bar(1,105,108,102,105);
 const swing=bar(2,105,107,101,104);
 const x=get([c1,inside,swing]);
 assert.equal(signal(x,"CRT_INSIDE_BAR").length,1);
 assert.equal(signal(x,"CRT_INSIDE_BAR")[0].direction,1);
 assert.equal(signal(x,"CRT_INSIDE_BAR")[0].c2End,inside.closedAt);
 assert.equal(signal(x,"CRT_INSIDE_BAR")[0].sweepH4End,swing.closedAt);
});
test("Inside close within C1 but outside C2 remains unresolved until evidence settles ambiguity",()=>{
 const inside=bar(1,105,108,102,105);
 const c3=bar(2,103,107,101,101.5);
 const x=get([c1,inside,c3]);
 assert.equal(signal(x,"CRT_INSIDE_BAR").length,0);
 assert.equal(diag(x,"CRT_INSIDE_BAR")[0].state,"RETURN_WITHIN_C1_ONLY_UNRESOLVED");
});
test("Inside continuation and double sweep are NOT approved standalone valid CRT",()=>{
 const inside=bar(1,105,108,102,105);
 const continueOutside=bar(2,105,107,97,98);
 const both=bar(2,105,109,101,105);
 assert.equal(signal(get([c1,inside,continueOutside]),"CRT_INSIDE_BAR").length,0);
 assert.equal(diag(get([c1,inside,continueOutside]),"CRT_INSIDE_BAR")[0].state,
  "CONTINUATION_NOT_APPROVED");
 assert.equal(diag(get([c1,inside,both]),"CRT_INSIDE_BAR")[0].state,
  "DOUBLE_SWEEP_REJECTED");
 assert.equal(signal(get([c1,bar(1,105,110,102,105),continueOutside]),"CRT_INSIDE_BAR").length,0);
});
test("Multi consolidation of two complete H4 then final C1 sweep is detected separately",()=>{
 const inside1=bar(1,105,109,101,106);
 const inside2=bar(2,106,108,102,105);
 const manipulation=bar(3,105,109,98,104);
 const x=get([c1,inside1,inside2,manipulation]);
 const a=signal(x,"CRT_MULTICANDLE");
 assert.equal(a.length,1);assert.equal(a[0].multiVariant,"CONSOLIDATION_THEN_SWEEP_QA");
 assert.equal(a[0].consolidationBars,2);
 assert.equal(a[0].direction,1);assert.equal(a[0].ratifiedAt,manipulation.closedAt);
});
test("Existing distributed 4-H4 sweep preserved as distinct diagnostic, not combined with consolidation semantics",()=>{
 const xs=[
 c1,
 bar(1,105,109,98,104),
 bar(2,104,108,97,103),
 bar(3,103,111,101,108)
 ];
 const a=get(xs);
 assert.equal(diag(a,"CRT_MULTICANDLE").some(x=>x.state==="DISTRIBUTED_SWEEP_FOUR_H4_QA"),true);
 assert.equal(signal(a,"CRT_MULTICANDLE").length,0);
});
test("Gap, provider mismatch, timeframe mismatch or partial H4 fail closed",()=>{
 const bad=[bar(1,105,109,98,103,{openedAt:base+H4+M15}),
  bar(1,105,109,98,103,{provider:"FOREIGN"}),
  bar(1,105,109,98,103,{timeframe:"M15"}),
  bar(1,105,109,98,103,{closedAt:base+2*H4-M15})];
 for(const c2 of bad){
  const x=get([c1,c2]);
  assert.equal(x.signals.length,0);
 }
 assert.equal(get([{...c1,allowedC1:false},bullC2]).signals.length,0);
});
test("MSS M15 confirms only same cycle, provider, direction and closed timeframe",()=>{
 const entry=signal(get([c1,bullC2]),"CRT_2C_RETURN")[0];
 const sweepAt=base+H4+M15;
 const mssAt=base+2*H4;
 const mss={provider,instrumentId,c1Start:base,direction:1,
  timeframe:"M15",state:"MSS_CONFIRMED_C2",
  cycleId:[provider,instrumentId,base,1].join("|"),
  pivotAt:sweepAt-M15,sweepAt,mssAt,observedUntil:mssAt};
 const pass=verifyMssM15ForFamily(entry,mss);
 assert.equal(pass.state,"MSS_M15_CLOSED_MATCH_QA");
 assert.equal(pass.actionable,false);assert.equal(pass.sendPush,false);
 for(const bad of [
  {...mss,provider:"FOREIGN"}, {...mss,instrumentId:"ETHUSD"},
  {...mss,direction:-1},{...mss,c1Start:base-H4},
  {...mss,cycleId:"wrong"},{...mss,timeframe:"M5"},
  {...mss,state:"PENDING"},
  {...mss,pivotAt:sweepAt}, {...mss,mssAt:sweepAt},
  {...mss,mssAt:mssAt+1},{...mss,observedUntil:mssAt-M15}
 ]){
  assert.equal(verifyMssM15ForFamily(entry,bad).state,"AWAITING_OR_REJECTED_MSS_M15");
 }
});
test("historical ratifications expire and do not masquerade as live CRT",()=>{
 const oldCrt=bar(2,104,117,101,111);
 const later=bar(3,111,116,109,112);
 const stillLater=bar(4,112,114,108,111);
 const snap=get([c1,bullC2,oldCrt]);
 assert.equal(signal(snap,"CRT_3C_REVERSAL").length,1);
 assert.equal(signal(get([c1,bullC2,oldCrt,later]),"CRT_3C_REVERSAL").length,0);
 assert.equal(signal(get([c1,bullC2,oldCrt,later,stillLater]),"CRT_3C_REVERSAL").length,0);
});
test("no emitted family event can trigger a real trade or push",()=>{
 const inputs=[[c1,bullC2],[c1,bearC2],
 [c1,bar(1,105,108,102,105),bar(2,105,107,101,104)],
 [c1,bar(1,105,109,101,106),bar(2,106,108,102,105),bar(3,105,109,98,104)]];
 for(const bars of inputs){
  const r=get(bars);
  assert.equal(r.actionable,false);assert.equal(r.sendPush,false);
  for(const e of r.signals){assert.equal(e.actionable,false);assert.equal(e.sendPush,false);}
  assert.equal(new Set(r.signals.map(x=>x.id)).size,r.signals.length);
 }
});
