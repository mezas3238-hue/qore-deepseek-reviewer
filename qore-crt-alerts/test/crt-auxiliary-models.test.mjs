import test from "node:test";
import assert from "node:assert/strict";
import {detectFourCandleCrt,detectPostMssM15Retest} from "../src/crt-auxiliary-models.mjs";
const H4=14400000,M15=900000;
const base=Date.parse("2026-10-31T05:00:00Z");
const provider="COINBASE_QA",instrumentId="BTCUSD";
const h4=(i,high,low,close)=>({
 provider,instrumentId,timeframe:"H4",openedAt:base+i*H4,
 closedAt:base+(i+1)*H4,high,low,close,nyHour:(1+4*i)%24,
 allowedC1:i===0
});
const fourBull=[
 h4(0,110,100,105),h4(1,109,98,104),
 h4(2,108,97,103),h4(3,111,101,108)
];
const fourBear=[
 h4(0,110,100,105),h4(1,112,101,106),
 h4(2,113,102,107),h4(3,109,99,102)
];
const r=(bars,family="crypto")=>detectFourCandleCrt({h4:bars,family});
test("MULTI4 4 closed consecutive H4, bullish two-bar manipulation",()=>{
 const x=r(fourBull);assert.equal(x.state,"MULTI4_BULL_QA");
 assert.equal(x.direction,1);assert.equal(x.c1Start,base);
 assert.equal(x.detectedAt,base+4*H4);assert.equal(x.sendPush,false);
 assert.equal(x.actionable,false);assert.equal(x.certified,false);
});
test("MULTI4 bearish symmetric two-H4 manipulation",()=>{
 const x=r(fourBear);assert.equal(x.state,"MULTI4_BEAR_QA");
 assert.equal(x.direction,-1);
});
test("MULTI4 refuses missing H4 and insufficient history",()=>{
 assert.equal(r(fourBull.slice(0,3)).state,"MULTI4_INCOMPLETE");
 assert.equal(r(fourBull.map((x,i)=>i===2?{...x,openedAt:x.openedAt+M15}:x)).state,
 "MULTI4_INVALID_CONTINUITY_OR_SOURCE");
});
test("MULTI4 rejects foreign provider or wrong 4-hour source",()=>{
 assert.equal(r(fourBull.map((x,i)=>i===1?{...x,provider:"IC"}:x)).state,
 "MULTI4_INVALID_CONTINUITY_OR_SOURCE");
 assert.equal(r(fourBull.map((x,i)=>i===2?{...x,timeframe:"M15"}:x)).state,
 "MULTI4_INVALID_CONTINUITY_OR_SOURCE");
});
test("MULTI4 only owner-approved C1 hour",()=>{
 const x=fourBull.map((b,i)=>i===0?{...b,nyHour:9,allowedC1:false}:b);
 assert.equal(r(x).state,"MULTI4_INVALID_CONTINUITY_OR_SOURCE");
});
test("MULTI4 rejects double sweeps or non-return",()=>{
 const doubled=fourBull.map((b,i)=>i===1?{...b,high:112}:b);
 assert.equal(r(doubled).state,"MULTI4_REJECTED_SWEEP_OR_RETURN");
 const escaped=fourBull.map((b,i)=>i===1?{...b,close:98.2}:b);
 assert.equal(r(escaped).state,"MULTI4_REJECTED_SWEEP_OR_RETURN");
});
test("MULTI4 no reversal if final H4 fails distribution",()=>{
 const x=fourBull.map((b,i)=>i===3?{...b,close:100}:b);
 assert.equal(r(x).state,"MULTI4_DISTRIBUTION_NOT_CONFIRMED");
});
test("MULTI4 never authorizes an independent entry or live push",()=>{
 for(const xs of [fourBull,fourBear]){
 const x=r(xs);assert.equal(x.actionable,false);assert.equal(x.sendPush,false);
 assert.equal(x.noEntryWithoutIndependentRule,true);
 }
});
const mssAt=Date.parse("2026-11-01T12:00:00Z");
const mk15=(i,high=110,low=105,close=108)=>({
 provider,instrumentId,timeframe:"M15",
 openedAt:mssAt+i*M15,closedAt:mssAt+(i+1)*M15,
 high,low,close
});
const run=(o={})=>detectPostMssM15Retest({
 provider,instrumentId,cycleId:"COINBASE_QA|BTCUSD|C1_123",
 direction:1,mssAt,pivotPrice:105,closedM15:[mk15(0)],...o
});
test("MSS M15 subsequent completed M15 retest in bullish direction",()=>{
 const x=run();assert.equal(x.state,"RETEST_M15_OBSERVED_QA");
 assert.equal(x.retestAt,mssAt+M15);
 assert.equal(x.noIndependentEntry,true);assert.equal(x.sendPush,false);
});
test("MSS M15 retest bearish after confirmation",()=>{
 const x=run({direction:-1,closedM15:[mk15(0,106,100,102)]});
 assert.equal(x.state,"RETEST_M15_OBSERVED_QA");
});
test("M5 or other provider cannot establish M15 retest",()=>{
 assert.equal(run({closedM15:[{...mk15(0),timeframe:"M5"}]}).state,
 "RETEST_SOURCE_OR_DATA_REJECTED");
 assert.equal(run({closedM15:[{...mk15(0),provider:"IC"}]}).state,
 "RETEST_SOURCE_OR_DATA_REJECTED");
});
test("retest MUST occur after M15 MSS, not within same closed event",()=>{
 const x=run({closedM15:[{...mk15(0),openedAt:mssAt-M15,closedAt:mssAt}]});
 assert.equal(x.state,"RETEST_PENDING");
});
test("M15 gaps suppress retest rather than assuming intact prices",()=>{
 assert.equal(run({closedM15:[mk15(1)]}).state,"RETEST_M15_GAP");
 assert.equal(run({closedM15:[mk15(0,108,106,107),mk15(2)]}).state,
 "RETEST_M15_GAP");
});
test("touch without closure back beyond pivot is pending",()=>{
 const x=run({closedM15:[mk15(0,107,104,105)]});
 assert.equal(x.state,"RETEST_PENDING");
});
test("retest window 4h expiry and strict 15m alignment",()=>{
 assert.equal(run({closedM15:[mk15(16)]}).state,"RETEST_EXPIRED");
 assert.equal(run({mssAt:mssAt+1}).state,"RETEST_INVALID_INPUT");
});
