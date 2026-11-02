import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {hashM5} from "../src/parity-audit.mjs";
import {compareSevenCrtEventTraces34}
 from "../src/crt-seven-category-event-parity.mjs";

const manifest=JSON.parse(readFileSync(new URL(
 "../trader-lab/34-instrument-source-preflight-2026-11-01.json",
 import.meta.url),"utf8"));
const catalog=manifest.source_catalog;
const t=Date.parse("2026-10-26T05:00:00Z"),step=300000;
const count=150,asOf=t+count*step;
const pineSourceBlobSha="28c8c731c943d9c3b3f8a2cc77746dee3a02f8c6";
const feeds=catalog.map(c=>({
 slot:c.slot,instrumentId:c.source_symbol,provider:"SIM_"+c.slot,
 closedM5:Array.from({length:count},(_,i)=>({
  openedAt:t+i*step,closedAt:t+(i+1)*step,
  provider:"SIM_"+c.slot,instrumentId:c.source_symbol,
  open:101,high:103,low:100,close:102
 }))
}));
const event=(f,category="CRT_2C_CANDIDATE")=>({
 category,state:category==="CRT_2C_CANDIDATE"?"PROVISIONAL":"RATIFIED",
 provider:f.provider,instrumentId:f.instrumentId,
 c1StartMs:t,direction:1,eventAtMs:t+step
});
const snapshot=(f,isPine,categoryMask=2,events=[event(f)])=>({
 slot:f.slot,instrumentId:f.instrumentId,provider:f.provider,
 engine:isPine?"TRADINGVIEW_PINE_V6_CAPTURE":
   "INDEPENDENT_TRADER_LAB_SEVEN_CATALOG_REPLAY",
 verifiedOnTradingView:isPine?true:undefined,
 pineBlobSha:isPine?pineSourceBlobSha:undefined,
 evidenceLocator:"SYNTHETIC_FIXTURE_NEVER_PINE_RUNTIME",
 candleSha256:hashM5(f.closedM5),windowM5Count:f.closedM5.length,
 windowStartMs:f.closedM5[0].openedAt,
 windowEndMs:f.closedM5.at(-1).closedAt,
 asOf,categoryMask,actionable:false,sendPush:false,events
});
const pine=feeds.map(f=>snapshot(f,true));
const lab=feeds.map(f=>snapshot(f,false));
const swap=(rows,i,changes)=>rows.map((x,j)=>i===j?{...x,...changes}:x);
const run=(l=lab,p=pine,fs=feeds)=>compareSevenCrtEventTraces34({
 catalog,feeds:fs,labSnapshots:l,pineCaptures:p,asOf,pineSourceBlobSha
});
test("34 independent closed-M5 synthetic traces match BUT never certify real Pine or alerts",()=>{
 const r=run();
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.matchedSlots,34);assert.equal(r.matchedEvents,34);
 assert.equal(r.distinctCategoriesObserved,1);
 assert.deepEqual(r.coveredCategories,["CRT_2C_CANDIDATE"]);
 assert.equal(r.certified,false);assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);assert.equal(r.realPineCompilationCertified,false);
 assert.equal(r.mssM15RuntimeCertified,false);
 assert.equal(r.holdoutCertified,false);assert.equal(r.androidE2eCertified,false);
});
test("Same seven-bit mask but different event time cannot pass",()=>{
 const altered={...pine[5].events[0],eventAtMs:t+2*step};
 const p=swap(pine,5,{events:[altered]});
 const r=run(lab,p);
 assert.equal(r.status,"EVENT_PARITY_BLOCKED_OR_EMPTY");
 assert.equal(r.matchedSlots,33);
 assert.equal(r.results[5].status,"EVENT_TRACE_MISMATCH");
 assert.equal(r.results[5].labOnly.length,1);
 assert.equal(r.results[5].pineOnly.length,1);
});
test("Same event identity but different direction or C1 fails",()=>{
 const wrongDir=swap(pine,6,{events:[{...pine[6].events[0],direction:-1}]});
 assert.equal(run(lab,wrongDir).results[6].status,"EVENT_TRACE_MISMATCH");
 const wrongC1=swap(pine,6,{events:[{...pine[6].events[0],c1StartMs:t+step}]});
 assert.equal(run(lab,wrongC1).results[6].status,"INVALID_OR_MISSING_EVENT_TRACE");
});
test("A missing event array or duplicate trace never passes with a matching mask",()=>{
 const p=swap(pine,0,{events:undefined});
 assert.equal(run(lab,p).results[0].pineReason,"EVENT_TRACE_MISSING");
 const dup=swap(pine,1,{events:[pine[1].events[0],pine[1].events[0]]});
 assert.equal(run(lab,dup).results[1].pineReason,"DUPLICATE_CAUSAL_EVENT");
});
test("Seven-bit masks with no event evidence may not certify seven categories",()=>{
 const l=lab.map(x=>({...x,categoryMask:0,events:[]}));
 const p=pine.map(x=>({...x,categoryMask:0,events:[]}));
 const r=run(l,p);
 assert.equal(r.matchedSlots,34);assert.equal(r.matchedEvents,0);
 assert.equal(r.status,"EVENT_PARITY_BLOCKED_OR_EMPTY");
 assert.equal(r.distinctCategoriesObserved,0);
 assert.equal(r.certified,false);
});
test("Trace mask cannot claim a C2 when its event is absent",()=>{
 const p=swap(pine,12,{events:[]});
 assert.equal(run(lab,p).results[12].pineReason,"MASK_NOT_RECONCILED_WITH_EVENTS");
});
test("3C ratification and independent MSS15 price/timestamps must match, even with same mask",()=>{
 const f=feeds[2];
 const e={category:"CRT_3C_REVERSAL",state:"RATIFIED",
  provider:f.provider,instrumentId:f.instrumentId,c1StartMs:t,
  direction:1,c2StartMs:t+4*3600000,sweepAtMs:t+4*3600000+step,
  ratifiedAtMs:t+8*3600000,eventAtMs:t+8*3600000,
  mss15:{provider:f.provider,instrumentId:f.instrumentId,timeframe:"M15",
   c1StartMs:t,pivotAtMs:t+3600000,pivotPrice:101.2,
   sweepAtMs:t+4*3600000+step,breakAtMs:t+8*3600000+900000,
   observedUntilMs:asOf}
 };
 const l=swap(lab,2,{categoryMask:1,events:[e]});
 const p=swap(pine,2,{categoryMask:1,events:[e]});
 assert.equal(run(l,p).results[2].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 const modified={...e,mss15:{...e.mss15,pivotPrice:101.3}};
 assert.equal(run(l,swap(p,2,{events:[modified]})).results[2].status,
  "EVENT_TRACE_MISMATCH");
 const preSweep={...e,mss15:{...e.mss15,breakAtMs:t+3600000}};
 assert.equal(run(l,swap(p,2,{events:[preSweep]})).results[2].pineReason,
  "CROSS_CYCLE_OR_INVALID_M15");
});
test("Reject expansion cannot masquerade as ratified entry",()=>{
 const f=feeds[3],bad={...event(f,"CRT_2C_EXPANSION"),state:"RATIFIED"};
 const p=swap(pine,3,{categoryMask:4,events:[bad]});
 const l=swap(lab,3,{categoryMask:4,events:[{...bad,state:"REJECTED"}]});
 assert.equal(run(l,p).results[3].pineReason,"INVALID_EVENT_IDENTITY_OR_CAUSAL_TIME");
});
test("No conflation of Multi4 and Multi-N when seven-category mask matches",()=>{
 const f=feeds[4];
 const e={...event(f,"CRT_MULTICANDLE"),state:"QA_RATIFIED",variant:"MULTI_N"};
 const l=swap(lab,4,{categoryMask:32,events:[e]});
 const p=swap(pine,4,{categoryMask:32,events:[{...e,variant:"MULTI4"}]});
 assert.equal(run(l,p).results[4].status,"EVENT_TRACE_MISMATCH");
});
test("M15 retest must have same-cycle pivot, sweep, break and later closed retest",()=>{
 const f=feeds[8];
 const ms15={provider:f.provider,instrumentId:f.instrumentId,timeframe:"M15",
  c1StartMs:t,pivotAtMs:t-900000,pivotPrice:103.25,sweepAtMs:t+step,
  breakAtMs:t+900000,retestAtMs:t+1800000,observedUntilMs:asOf};
 const proof={...ms15,mssAtMs:ms15.breakAtMs};
 const e={...event(f,"CRT_M15_RETEST"),state:"QA_OBSERVED",
  eventAtMs:ms15.retestAtMs,mss15:ms15};
 const l=swap(lab,8,{categoryMask:64,events:[e],mss15Proof:proof});
 const p=swap(pine,8,{categoryMask:64,events:[e],mss15Proof:proof});
 assert.equal(run(l,p).results[8].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 const different={...e,mss15:{...ms15,retestAtMs:t+2700000},eventAtMs:t+2700000};
 assert.equal(run(l,swap(p,8,{events:[different]})).results[8].status,
  "EVENT_TRACE_MISMATCH");
 const invalid={...e,mss15:{...ms15,breakAtMs:t}};
 assert.equal(run(l,swap(p,8,{events:[invalid]})).results[8].pineReason,
  "RETEST_M15_CAUSAL_TRACE_MISSING");
});
test("Missing independent lab data or mismatched provider blocks before any trace match",()=>{
 const noLab=run([],pine);
 assert.equal(noLab.matchedSlots,0);
 assert.equal(noLab.results[0].status,"MASK_OR_SOURCE_NOT_READY");
 const p=swap(pine,3,{provider:"FICTITIOUS"});
 assert.equal(run(lab,p).results[3].status,"MASK_OR_SOURCE_NOT_READY");
});

test("comparison cannot silently accept a different Pine candidate even with seven identical masks",()=>{
 assert.throws(()=>compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:pine,asOf,
  pineSourceBlobSha:"0123456789abcdef0123456789abcdef01234567"
 }),/UNRECOGNIZED_PINE_V34_11B_11C_11D_11E_11F_11G_11H_SOURCE_SHA/);
});

test("exact V34.11c audit-display candidate can compare traces, without certifying real Pine",()=>{
 const cSha="3c202bf8ff7eaec8b8f043aad8d0117cccd900ca";
 const captures=pine.map(p=>({...p,pineBlobSha:cSha}));
 const result=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:captures,asOf,
  pineSourceBlobSha:cSha
 });
 assert.equal(result.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(result.certified,false);
 assert.equal(result.sendPush,false);
});

test("the exact V34.11d historical QA candidate source is pinned, never live-certified",()=>{
 const digest="d1c26edc67fb6554bc32f71c96c7cbdfdefa6a84";
 const sameSource=pine.map(p=>({...p,pineBlobSha:digest}));
 const r=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:sameSource,asOf,
  pineSourceBlobSha:digest
 });
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.certified,false);
 assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
});

test("the exact V34.11e NY-anchor QA source stays fail-closed for live alerts",()=>{
 const digest="d95872057233e58c128f1c6171c620bdb2524b30";
 const captures=pine.map(p=>({...p,pineBlobSha:digest}));
 const r=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:captures,asOf,
  pineSourceBlobSha:digest
 });
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.certified,false);
 assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
});

test("the exact V34.11f source with isolated BTC + 33-market QA is accepted only as UNCERTIFIED",()=>{
 const digest="4e0d5541413fa0054c8fad827a8023929d105177";
 const captures=pine.map(p=>({...p,pineBlobSha:digest}));
 const r=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:captures,asOf,pineSourceBlobSha:digest
 });
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.certified,false);
 assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
});

test("V34.11g 33-market H4 boundary evidence is accepted only as UNCERTIFIED QA",()=>{
 const digest="ea619e19b271bfffed96fe05bc71fa6c584c1316";
 const captures=pine.map(p=>({...p,pineBlobSha:digest}));
 const r=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:captures,asOf,
  pineSourceBlobSha:digest
 });
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.certified,false);assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
});

test("V34.11h source-native 33-market +1min QA cannot certify synthetic parity or send push",()=>{
 const digest="638b01991bfce4901dbdfb3b9d640a8cdb896fd1";
 const sources=pine.map(p=>({...p,pineBlobSha:digest}));
 const result=compareSevenCrtEventTraces34({
  catalog,feeds,labSnapshots:lab,pineCaptures:sources,asOf,
  pineSourceBlobSha:digest
 });
 assert.equal(result.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(result.realPineCompilationCertified,false);
 assert.equal(result.certified,false);assert.equal(result.actionable,false);assert.equal(result.sendPush,false);
});
