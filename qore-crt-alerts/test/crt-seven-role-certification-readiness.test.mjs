import test from "node:test";
import assert from "node:assert/strict";
import {SEVEN_CRT_ROLES,assessSevenCrtReadiness}
 from "../src/crt-seven-role-certification-readiness.mjs";

const t=Date.parse("2026-10-26T05:00:00Z");
const sha="a".repeat(64);
const rows=Array.from({length:34},(_,i)=>({
 slot:i+1,symbol:"S"+(i+1),provider:"PROVIDER_"+(i+1),
 sourcePhaseMin:i===7?0:i===3?2:1,
 candleSha256:sha,status:"EVENT_TRACE_MATCH_UNCERTIFIED",matchedEvents:1
}));
const audit={comparedSlots:34,matchedSlots:34,matchedEvents:34,
 coveredCategories:SEVEN_CRT_ROLES.map(x=>x.id),results:rows,
 certified:false,actionable:false,sendPush:false};
function control(role,slot,controlType,variant){
 const row=rows[slot-1],at=t+row.sourcePhaseMin*60000+1800000;
 const common={
  controlId:role.id+"/"+slot+"/"+controlType+(variant??""),
  category:role.id,slot,controlType,variant,
  instrumentId:row.symbol,provider:row.provider,
  sourcePhaseMin:row.sourcePhaseMin,candleSha256:sha,
  eventAtMs:at,actionable:false,sendPush:false,
  pineEvidenceId:"PINE_FIXTURE/"+role.id+"/"+slot,
  labEvidenceId:"LAB_FIXTURE/"+role.id+"/"+slot,
  pineObserved:controlType==="POSITIVE",labObserved:controlType==="POSITIVE"
 };
 if(controlType==="NEGATIVE")common.negativeReason=role.negative;
 if(role.id!=="CRT_MULTICANDLE")delete common.variant;
 if(role.id==="CRT_M15_RETEST"&&controlType==="POSITIVE")
  common.mss15={timeframe:"M15",instrumentId:row.symbol,provider:row.provider,
   pivotAtMs:at-2700000,sweepAtMs:at-1500000,
   breakAtMs:at-900000,retestAtMs:at};
 return common;
}
const good=SEVEN_CRT_ROLES.flatMap((role,i)=>{
 const slot=i+1;
 return role.id==="CRT_MULTICANDLE"?
  [control(role,slot,"POSITIVE","MULTI4"),
   control(role,slot,"POSITIVE","MULTI_N"),
   control(role,slot,"NEGATIVE")]:
  [control(role,slot,"POSITIVE"),control(role,slot,"NEGATIVE")];
});
const run=(controlCases=good,eventAudit=audit)=>assessSevenCrtReadiness({
 eventAudit,controlCases
});
test("7 roles distinguished from 7 fully approved entry strategies",()=>{
 assert.equal(SEVEN_CRT_ROLES.length,7);
 assert.deepEqual(SEVEN_CRT_ROLES.map(x=>x.kind),[
  "STRUCTURAL","PROVISIONAL","REJECTION",
  "STRUCTURAL_QA","REJECTION","STRUCTURAL_QA","CONFIRMATION_QA"
 ]);
 assert.equal(new Set(SEVEN_CRT_ROLES.map(x=>x.id)).size,7);
});
test("Synthetic 7x positive/negative plus Multi4/MultiN controls pass OFFLINE matrix but NEVER certify live",()=>{
 const r=run();
 assert.equal(r.status,"SEVEN_OFFLINE_ROLE_CONTROLS_COMPLETE_NEEDS_EXTERNAL_CERTIFICATION");
 assert.equal(r.roleCount,7);
 assert.equal(r.readyForExternalReview,7);
 assert.equal(r.caseCount,15);
 assert.equal(r.certified,false);assert.equal(r.sendPush,false);
 assert.equal(r.rolesAreNotSevenTradingStrategies,true);
 assert.equal(r.independentPineCompilerVerified,false);
 assert.equal(r.independentProviderOHLCVerified,false);
 assert.equal(r.noRepaintHoldoutVerified,false);
 assert.equal(r.androidPushE2eVerified,false);
 assert.ok(r.categoryReports.every(x=>x.missing.length===0&&x.certified===false));
});
test("No real independent 34 events/captures => zero category ever certified",()=>{
 const r=run([],null);
 assert.equal(r.status,"34_EVENT_PARITY_NOT_READY");
 assert.equal(r.readyForExternalReview,0);
 assert.equal(r.certified,false);
 assert.ok(r.categoryReports.every(x=>x.status==="CONTROL_COVERAGE_INCOMPLETE"));
});
test("No negative control or no positive event blocks that specific category, not all seven",()=>{
 const role=SEVEN_CRT_ROLES[3];
 const incomplete=run(good.filter(x=>!(x.category===role.id&&x.controlType==="NEGATIVE")));
 assert.equal(incomplete.readyForExternalReview,6);
 const r=incomplete.categoryReports.find(x=>x.category===role.id);
 assert.ok(r.missing.includes("INDEPENDENT_NEGATIVE_CONTROL"));
 const missingCategory=run(good,{...audit,
  coveredCategories:audit.coveredCategories.filter(x=>x!==role.id)});
 assert.equal(missingCategory.readyForExternalReview,6);
 assert.ok(missingCategory.categoryReports.find(x=>x.category===role.id)
  .missing.includes("POSITIVE_CATEGORY_EVENT_IN_MATCHED_34"));
});
test("All 34 sources must have individually compared event trace, BTC is part of 34",()=>{
 const incomplete={...audit,matchedSlots:33,
  results:rows.map(x=>x.slot===8?{...x,status:"MASK_OR_SOURCE_NOT_READY"}:x)};
 const r=run(good,incomplete);
 assert.equal(r.status,"34_EVENT_PARITY_NOT_READY");
 assert.equal(r.readyForExternalReview,0);
 assert.equal(r.scopeFeeds,34);
});
test("XAUUSD +2 and other provider phases must match exact source, no borrowed phase",()=>{
 const bad=good.map(x=>x.slot===4?{...x,sourcePhaseMin:1}:x);
 const r=run(bad);
 assert.equal(r.invalidControlCases,2);
 assert.equal(r.status,"INVALID_CONTROL_EVIDENCE");
 assert.equal(r.categoryReports.find(x=>x.category===SEVEN_CRT_ROLES[3].id)
  .distinctPositiveControls,0);
});
test("Multi4 and Multi-N positive evidence both mandatory; rejection is not a positive",()=>{
 const lost=run(good.filter(x=>x.variant!=="MULTI_N"));
 const multi=lost.categoryReports.find(x=>x.category==="CRT_MULTICANDLE");
 assert.ok(multi.missing.includes("MULTI4_AND_MULTI_N_POSITIVE_CONTROLS"));
 assert.equal(multi.multiVariantsCovered.length,1);
 assert.equal(lost.certified,false);
});
test("Retest M15 must be after MSS15 and on same source-phase, never a M5 timestamp",()=>{
 const changed=good.map(x=>x.category==="CRT_M15_RETEST"&&x.controlType==="POSITIVE"?
   {...x,mss15:{...x.mss15,breakAtMs:x.mss15.breakAtMs-300000}}:x);
 const r=run(changed);
 assert.equal(r.invalidControlCases,1);
 assert.ok(r.categoryReports.find(x=>x.category==="CRT_M15_RETEST")
  .missing.includes("INDEPENDENT_POSITIVE_CONTROL"));
 const wrongSrc=good.map(x=>x.category==="CRT_M15_RETEST"&&x.controlType==="POSITIVE"?
   {...x,mss15:{...x.mss15,provider:"FOREIGN"}}:x);
 assert.equal(run(wrongSrc).invalidControlCases,1);
});
test("Forged positive/negative results and duplicate evidence ids cannot satisfy controls",()=>{
 const bad=good.map(x=>x.category==="CRT_2C_EXPANSION"&&x.controlType==="NEGATIVE"?
  {...x,pineObserved:true}:x);
 assert.equal(run(bad).invalidControlCases,1);
 assert.throws(()=>run([...good,good[0]]),/DUPLICATE_OR_MISSING_CONTROL_ID/);
 const act=good.map((x,i)=>i===0?{...x,actionable:true}:x);
 assert.equal(run(act).invalidControlCases,1);
});
