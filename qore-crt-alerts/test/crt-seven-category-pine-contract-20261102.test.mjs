import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectCrtMorphologies,verifyMssM15ForFamily,
  LEGACY_CATEGORY_ROLES,STRUCTURAL_MORPHOLOGIES} from "../src/crt-structural-morphologies.mjs";
import {detectFourCandleCrt,detectPostMssM15Retest} from "../src/crt-auxiliary-models.mjs";

const H4=14_400_000,M15=900_000;
const start=Date.parse("2026-10-26T05:00:00Z"); // Monday 01:00 New York
const root="../../crt-radar-pro/";
const source=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const manifest=JSON.parse(readFileSync(new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
function h4(i,hi,lo,close,{symbol="EURCHF",provider="TEST_FEED",index=false}={}){
 const first=start+i*H4+(index?3600000:0);
 return {provider,instrumentId:symbol,timeframe:"H4",openedAt:first,closedAt:first+H4,
  open:close,high:hi,low:lo,close,nyHour:index?2:1,allowedC1:i===0};
}
const scan=(bars,family="forex")=>inspectCrtMorphologies({closedH4:bars,family});

test("Catalog specifies 7 distinct roles, not seven certified structural H4 detectors",()=>{
 const keys=Object.keys(LEGACY_CATEGORY_ROLES);
 assert.equal(keys.length,7);
 assert.deepEqual(new Set(STRUCTURAL_MORPHOLOGIES),
  new Set(["CRT_2C_RETURN","CRT_3C_REVERSAL","CRT_MULTICANDLE","CRT_INSIDE_BAR"]));
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_2C_CANDIDATE,"PENDING_STAGE");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_2C_EXPANSION,"REJECTED_OR_CONTEXT");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_INSIDE_CONTINUATION,"UNAPPROVED_VARIANT");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_M15_RETEST,"ENTRY_CONFIRMATION");
 assert.equal(LEGACY_CATEGORY_ROLES.CRT_MULTICANDLE,"STRUCTURAL_QA");
});
test("2C low return is valid without needing C3; 3C supersedes 2C on C3 closed",()=>{
 const c1=h4(0,110,100,105),c2=h4(1,109,98,104),c3=h4(2,108,101,106);
 const two=scan([c1,c2]);
 assert.equal(two.signals.length,1);
 assert.equal(two.signals[0].model,"CRT_2C_RETURN");
 assert.equal(two.signals[0].direction,1);
 assert.equal(two.signals[0].ratifiedAt,c2.closedAt);
 assert.equal(two.signals[0].sendPush,false);
 const three=scan([c1,c2,c3]);
 assert.equal(three.signals.length,1);
 assert.equal(three.signals[0].model,"CRT_3C_REVERSAL");
 assert.equal(three.signals[0].distribution,"C3_CLOSED_VALID");
 assert.equal(three.signals[0].sameStructuralCycleId,two.signals[0].id);
 assert.equal(three.signals[0].ratifiedAt,c2.closedAt);
});
test("3C invalidation cannot resurrect old 2C; opposite simultaneous sweep never ratifies",()=>{
 const c1=h4(0,110,100,105),c2=h4(1,109,98,104);
 const rejected=scan([c1,c2,h4(2,105,96,97)]);
 assert.equal(rejected.signals.length,0);
 assert.ok(rejected.diagnostics.some(x=>x.state==="C3_INVALIDATED"));
 const double=scan([c1,h4(1,111,99,105)]);
 assert.equal(double.signals.length,0);
});
test("2C expansion outside C1 is not actionable",()=>{
 const ex=scan([h4(0,110,100,105),h4(1,109,98,99)]);
 assert.equal(ex.signals.length,0);
 assert.ok(ex.diagnostics.some(x=>x.model==="CRT_2C_EXPANSION"&&x.state==="REJECTED_NON_RETURN"));
});
test("Inside return strict, continuation and ambiguous double sweep remain distinct",()=>{
 const c1=h4(0,110,100,105),c2=h4(1,108,102,105);
 const ok=scan([c1,c2,h4(2,107,101,104)]);
 assert.ok(ok.signals.some(x=>x.model==="CRT_INSIDE_BAR"&&x.insideVariant==="RETURN_STRICT_C2"));
 const continuation=scan([c1,c2,h4(2,107,99,99)]);
 assert.equal(continuation.signals.length,0);
 assert.ok(continuation.diagnostics.some(x=>x.state==="CONTINUATION_NOT_APPROVED"));
 const ambiguous=scan([c1,c2,h4(2,109,101,105)]);
 assert.equal(ambiguous.signals.length,0);
 assert.ok(ambiguous.diagnostics.some(x=>x.state==="DOUBLE_SWEEP_REJECTED"));
});
test("Multi-N consolidation with terminal H4 sweep recognized without pretending to be FCM LIVE",()=>{
 const bars=[h4(0,110,100,105),h4(1,108,102,105),
  h4(2,107,103,105),h4(3,109,99,104)];
 const r=scan(bars);
 assert.ok(r.signals.some(x=>x.model==="CRT_MULTICANDLE"&&
  x.consolidationBars===2&&x.multiVariant==="CONSOLIDATION_THEN_SWEEP_QA"));
 assert.ok(r.signals.every(x=>x.certified===false&&x.actionable===false&&!x.sendPush));
});
test("Multi4 distributed H4 sweep requires actual 4 closed H4s of one source",()=>{
 const bars=[h4(0,110,100,105),h4(1,109,99,104),
  h4(2,109,99,105),h4(3,108,101,106)];
 const p=detectFourCandleCrt({h4:bars,family:"forex"});
 assert.equal(p.state,"MULTI4_BULL_QA");
 assert.equal(p.actionable,false);
 const wrong=bars.map(x=>({...x}));
 wrong[2].provider="ANOTHER_FEED";
 assert.equal(detectFourCandleCrt({h4:wrong,family:"forex"}).state,
  "MULTI4_INVALID_CONTINUITY_OR_SOURCE");
});
test("MSS M15 requires independent closed cross of same provider, cycle and pre-sweep pivot",()=>{
 const entry=scan([h4(0,110,100,105),h4(1,109,98,104)]).signals[0];
 const sweepAt=entry.c2End-H4+M15;
 const mssAt=sweepAt+M15;
 const confirmation={
  provider:entry.provider,instrumentId:entry.instrumentId,
  c1Start:entry.c1Start,direction:1,timeframe:"M15",
  cycleId:[entry.provider,entry.instrumentId,entry.c1Start,1].join("|"),
  state:"MSS_CONFIRMED_C2",sweepAt,pivotAt:sweepAt-M15,
  mssAt,observedUntil:mssAt
 };
 assert.equal(verifyMssM15ForFamily(entry,confirmation).state,"MSS_M15_CLOSED_MATCH_QA");
 for(const changed of [
  {...confirmation,timeframe:"M5"},
  {...confirmation,provider:"WRONG_FEED"},
  {...confirmation,cycleId:"PREVIOUS_CRT"},
  {...confirmation,pivotAt:confirmation.sweepAt+M15},
  {...confirmation,observedUntil:confirmation.mssAt-M15},
  {...confirmation,state:"PENDING"}
 ]){
  assert.equal(verifyMssM15ForFamily(entry,changed).state,"AWAITING_OR_REJECTED_MSS_M15");
 }
});
test("Retest may occur only on distinct closed M15 after its own MSS, not the MSS candle",()=>{
 const at=start+H4*2;
 const provider="IC:test",instrumentId="EURCHF",cycleId="IC:test|EURCHF|C1";
 const mk=(openedAt,hi,lo,c)=>({timeframe:"M15",provider,instrumentId,
  openedAt,closedAt:openedAt+M15,high:hi,low:lo,close:c});
 const ok=detectPostMssM15Retest({provider,instrumentId,cycleId,direction:1,
  mssAt:at,pivotPrice:105,closedM15:[mk(at,109,104,106)]});
 assert.equal(ok.state,"RETEST_M15_OBSERVED_QA");
 assert.equal(ok.sendPush,false);
 const wrong=detectPostMssM15Retest({provider,instrumentId,cycleId,direction:1,
  mssAt:at,pivotPrice:105,closedM15:[mk(at-M15,109,104,106)]});
 assert.equal(wrong.state,"RETEST_PENDING");
});
test("All 34 independently sourced slots can process 2C; not a live 34-signal guarantee",()=>{
 assert.equal(manifest.source_catalog.length,34);
 for(const slot of manifest.source_catalog){
  const family=["NAS100","SP500","US30"].includes(slot.source_symbol)?"index":
   slot.source_symbol==="BTCUSD"?"crypto":"forex";
  const ident={symbol:slot.source_symbol,provider:"OFFLINE_SLOT_"+slot.slot,index:family==="index"};
  const r=scan([h4(0,110,100,105,ident),h4(1,109,98,104,ident)],family);
  assert.equal(r.signals.length,1,slot.source_symbol);
  assert.equal(r.signals[0].instrumentId,slot.source_symbol);
  assert.equal(r.sendPush,false);
 }
});
test("Pine snapshot keeps 34 dedicated request slots, strict model gate and no alerts by default",()=>{
 assert.equal([...source.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.ok(source.includes('modeDashboard = input.string("Solo CRT"'));
 assert.ok(source.includes('useAlerts = input.bool(false'));
 assert.ok(source.includes("calc_bars_count=1500"));
 assert.ok(source.includes('s.modelKind == "CRT_2C_RETURN"'));
 assert.ok(source.includes('bool family15QA = extraValidQA'));
 assert.ok(source.includes("lastHigh15At < c2SweepEnd")||
  source.includes("c2Pivot15At < c2SweepEnd"));
 assert.ok(source.includes("closed15At > c2SweepEnd"));
 assert.ok(source.includes("m15Count == 3"));
});
