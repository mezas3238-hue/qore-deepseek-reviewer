import test from "node:test";
import assert from "node:assert/strict";
import {inspectTrue3cRowdyQa} from "../src/crt-true-3c-rowdy-qa.mjs";
import {INSTRUMENTS} from "../src/instruments.mjs";

const H4=14_400_000,M5=300_000,M15=900_000;
const t=Date.parse("2026-11-02T05:01:00Z");
const bar=(startAt,low,high,close)=>({
  startAt,endAt:startAt+H4,m5Count:48,continuous:true,
  low,high,close
});
const bullish=[
 bar(t,90,110,100),bar(t+H4,92,108,99),
 bar(t+2*H4,87,109,101)
];
const bearish=[
 bar(t,90,110,100),bar(t+H4,92,108,99),
 bar(t+2*H4,91,113,101)
];
const provider="IC", instrumentId="USDCAD",phase=1;
const sweepAt=t+2*H4+M5;
const identity=(dir=1)=>({
 provider,instrumentId,c1StartAt:t,direction:dir,
 cycleId:[provider,instrumentId,t,dir,"TRUE3C"].join("|")
});
const proof=(period,dir=1)=>({...identity(dir),pivotAt:t+H4-M15,
 breakAt:sweepAt+(period===M5?M5:M15),
 lastClosedAt:sweepAt+M15});
const sample=(p={})=>({
 provider,instrumentId,h4:bullish,sourcePhaseMin:phase,
 sweepAt,m5Evidence:proof(M5),m15Evidence:proof(M15),...p
});

test("real 3C: C2 contains NO sweep; C3 closes after one-sided C1 sweep",()=>{
 const v=inspectTrue3cRowdyQa(sample());
 assert.equal(v.state,"TRUE_3C_STRUCTURE_CLOSED_QA");
 assert.equal(v.direction,1);
 assert.equal(v.sweepSide,"C1_LOW");
 assert.equal(v.mssM5,"QA_CONFIRMED");
 assert.equal(v.mssM15,"QA_CONFIRMED");
 assert.equal(v.certified,false);
 assert.equal(v.sendPush,false);
 assert.equal(v.actionable,false);
});

test("3C bearish mirrors the sweep, does not import bullish MSS",()=>{
 const noProof=inspectTrue3cRowdyQa(sample({h4:bearish}));
 assert.equal(noProof.direction,-1);
 assert.equal(noProof.mssM5,"QA_PENDING");
 assert.equal(noProof.mssM15,"QA_PENDING");
 const yes=inspectTrue3cRowdyQa(sample({h4:bearish,
   m5Evidence:proof(M5,-1),m15Evidence:proof(M15,-1)}));
 assert.equal(yes.mssM5,"QA_CONFIRMED");
 assert.equal(yes.mssM15,"QA_CONFIRMED");
});

test("C2 sweep means the ALREADY EXISTING two-candle CRT, never pure three",()=>{
 const notTrue=[bullish[0],bar(t+H4,89,108,99),bullish[2]];
 assert.equal(inspectTrue3cRowdyQa(sample({h4:notTrue})).state,
   "C2_MUST_BE_SETUP_NO_SWEEP");
});

test("Inside-only sweep of C2 but not C1 is not labelled C3 C1 raid",()=>{
 const insideOnly=[bullish[0],bullish[1],bar(t+2*H4,91,109,100)];
 assert.equal(inspectTrue3cRowdyQa(sample({h4:insideOnly})).state,
   "INSIDE_C2_SWEEP_ONLY");
});

test("C2 inside with C3 C1 sweep can be a true3C; C1 raid takes precedence",()=>{
 const v=inspectTrue3cRowdyQa(sample());
 assert.equal(v.strictInsideC2,true);
 assert.equal(v.priority,"C3_SWEEP_C1_BEFORE_INSIDE_C2");
 const touched=[bullish[0],bar(t+H4,90,108,99),bullish[2]];
 const u=inspectTrue3cRowdyQa(sample({h4:touched}));
 assert.equal(u.state,"TRUE_3C_STRUCTURE_CLOSED_QA");
 assert.equal(u.strictInsideC2,false);
});

test("double sweep, C3 outside, missing H4 and partial 48 M5 all fail closed",()=>{
 const both=[bullish[0],bullish[1],bar(t+2*H4,87,113,101)];
 assert.equal(inspectTrue3cRowdyQa(sample({h4:both})).state,"REJECT_DOUBLE_SWEEP");
 const outside=[bullish[0],bullish[1],bar(t+2*H4,87,109,89)];
 assert.equal(inspectTrue3cRowdyQa(sample({h4:outside})).state,
   "REJECT_C3_CLOSE_OUTSIDE_C1");
 for(const broken of [
  {...bullish[0],m5Count:47},
  {...bullish[0],continuous:false},
  {...bullish[0],endAt:bullish[0].endAt+M5}
 ]){
  assert.equal(inspectTrue3cRowdyQa(sample({h4:[broken,...bullish.slice(1)]})).state,
    "CLOSED_H4_OR_48_M5_REQUIRED");
 }
 const hole=[bullish[0],{...bullish[1],startAt:bullish[1].startAt+M5,
   endAt:bullish[1].endAt+M5},bullish[2]];
 assert.equal(inspectTrue3cRowdyQa(sample({h4:hole})).state,"NOT_CONSECUTIVE");
});

test("every 0..4 native minute phase requires separate real M5 and M15 closes",()=>{
 for(let phase=0;phase<=4;phase++){
  const shift=(phase-1)*60_000;
  const h4=bullish.map(c=>({...c,startAt:c.startAt+shift,endAt:c.endAt+shift}));
  const s=sweepAt+shift;
  const source={provider,instrumentId,c1StartAt:t+shift,direction:1,
    cycleId:[provider,instrumentId,t+shift,1,"TRUE3C"].join("|")};
  const m5={...source,pivotAt:t+shift+H4-M15,breakAt:s+M5};
  const m15={...source,pivotAt:t+shift+H4-M15,
    breakAt:s+M15,lastClosedAt:s+M15};
  const base=sample({h4,sourcePhaseMin:phase,sweepAt:s,
    m5Evidence:m5,m15Evidence:m15});
  assert.equal(inspectTrue3cRowdyQa(base).mssM5,"QA_CONFIRMED");
  assert.equal(inspectTrue3cRowdyQa(base).mssM15,"QA_CONFIRMED");
  assert.equal(inspectTrue3cRowdyQa({...base,m15Evidence:{
    ...m15,breakAt:m15.breakAt+60_000
  }}).mssM15,"QA_PENDING");
  assert.equal(inspectTrue3cRowdyQa({...base,m5Evidence:{
    ...m5,cycleId:"wrong"
  }}).mssM5,"QA_PENDING");
 }
});

test("34 independent markets including separate BTC do not imply 34 signals",()=>{
 assert.equal(INSTRUMENTS.length,34);
 assert.equal(INSTRUMENTS.filter(x=>x.id==="BTCUSD").length,1);
 for(const row of INSTRUMENTS){
  const v=inspectTrue3cRowdyQa({provider:"TEST",instrumentId:row.id,h4:[]});
  assert.equal(v.state,"NEED_EXACTLY_THREE_CLOSED_H4");
  assert.equal(v.sendPush,false);
 }
});

test("C3 crossing without witnessed sweepAt or incomplete M15 is NOT a MSS",()=>{
 for(const t0 of [undefined,sweepAt+1,sweepAt-H4,t+3*H4+M5]){
  const v=inspectTrue3cRowdyQa(sample({sweepAt:t0}));
  assert.equal(v.state,"TRUE_3C_STRUCTURE_MSS_UNVERIFIED");
  assert.equal(v.mssM5,"UNVERIFIED");
  assert.equal(v.mssM15,"UNVERIFIED");
 }
 const early=inspectTrue3cRowdyQa(sample({m15Evidence:{
   ...proof(M15),lastClosedAt:sweepAt
 }}));
 assert.equal(early.mssM5,"QA_CONFIRMED");
 assert.equal(early.mssM15,"QA_PENDING");
});
