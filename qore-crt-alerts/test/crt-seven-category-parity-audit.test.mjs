import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {hashM5} from "../src/parity-audit.mjs";
import {decodeSevenCrtCategoryMask,compareSevenCrtCategories34,CATEGORY_BITS}
 from "../src/crt-seven-category-parity-audit.mjs";

const manifest=JSON.parse(readFileSync(
 new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
const catalog=manifest.source_catalog;
const t=Date.parse("2026-10-26T05:00:00Z"),M5=300000,asOf=t+12*M5;
const sourceSha="0123456789abcdef0123456789abcdef01234567"; // test only: no Pine compilation
const feed=c=>({
 slot:c.slot,instrumentId:c.source_symbol,provider:"SIM_PROV_"+c.slot,
 closedM5:Array.from({length:12},(_,i)=>({
   provider:"SIM_PROV_"+c.slot,instrumentId:c.source_symbol,
   openedAt:t+i*M5,closedAt:t+(i+1)*M5,
   open:100,high:102,low:98,close:101
 }))
});
const feeds=catalog.map(feed);
const snapshot=(f,isPine,mask=0)=>{
 const candles=f.closedM5.slice(-1500);
 return {slot:f.slot,instrumentId:f.instrumentId,provider:f.provider,
  engine:isPine?"TRADINGVIEW_PINE_V6_CAPTURE":"INDEPENDENT_TRADER_LAB_SEVEN_CATALOG_REPLAY",
  verifiedOnTradingView:isPine?true:undefined,pineBlobSha:isPine?sourceSha:undefined,
  evidenceLocator:"SYNTHETIC_FIXTURE_NOT_A_REAL_EDITOR_CAPTURE",
  candleSha256:hashM5(candles),windowM5Count:candles.length,
  windowStartMs:candles[0].openedAt,windowEndMs:candles.at(-1).closedAt,
  asOf,categoryMask:mask,actionable:false,sendPush:false};
};
const lab=feeds.map(f=>snapshot(f,false)),pine=feeds.map(f=>snapshot(f,true));
const audit=(f=feeds,l=lab,p=pine)=>compareSevenCrtCategories34({
 catalog,feeds:f,labSnapshots:l,pineCaptures:p,asOf,
 pineSourceBlobSha:sourceSha
});
const replace=(xs,index,value)=>xs.map((x,i)=>i===index?value:x);
test("Seven categories are seven distinct state bits, not seven trade entry detectors",()=>{
 const bits=Object.values(CATEGORY_BITS);
 assert.deepEqual(bits,[1,2,4,8,16,32,64]);
 for(let i=0;i<7;i++){
  const names=decodeSevenCrtCategoryMask(bits[i]);
  assert.equal(Object.values(names).filter(Boolean).length,1);
 }
 assert.equal(Object.values(decodeSevenCrtCategoryMask(127)).filter(Boolean).length,7);
 assert.throws(()=>decodeSevenCrtCategoryMask(128),/INVALID_SEVEN_CATEGORY_MASK/);
});
test("34 independent synthetic OHLC contracts can match seven states but never certify live",()=>{
 const result=audit();
 assert.equal(result.status,"CATALOG_34_MASKS_MATCH_BUT_UNCERTIFIED");
 assert.equal(result.matchedSlots,34);
 assert.equal(result.comparedSlots,34);
 assert.equal(result.certified,false);assert.equal(result.sendPush,false);
 assert.equal(result.pineCompilationVerified,false);
 assert.equal(result.eventByEventMss15Verified,false);
 assert.equal(result.androidPushE2eVerified,false);
 assert.ok(result.results.every(x=>x.status==="SEVEN_CATEGORY_MASK_MATCH_UNCERTIFIED"&&x.comparedCategories===7));
});
test("one mismatched legacy category among 34 is identified, not auto-corrected",()=>{
 const p=replace(pine,17,{...pine[17],categoryMask:4});
 const r=audit(feeds,lab,p);
 assert.equal(r.status,"CATALOG_34_PARITY_BLOCKED");
 assert.equal(r.matchedSlots,33);
 assert.deepEqual(r.results[17].differences,["CRT_2C_EXPANSION"]);
});
test("missing true TradingView capture or unverified source never counts as evidence",()=>{
 const p=replace(pine,3,{...pine[3],verifiedOnTradingView:false});
 const r=audit(feeds,lab,p);
 assert.equal(r.results[3].status,"PINE_PROVENANCE_NOT_VERIFIED");
 assert.equal(r.matchedSlots,33);
 const missing=audit(feeds,lab,[]);
 assert.equal(missing.matchedSlots,0);
 assert.equal(missing.results[0].status,"MISSING_PINE_EVIDENCE");
});
test("other provider, OHLC hash or wrong asOf can never match seven categories",()=>{
 const p=replace(pine,1,{...pine[1],provider:"OTHER"});
 const l=replace(lab,2,{...lab[2],candleSha256:"a".repeat(64)});
 const r=audit(feeds,l,p);
 assert.equal(r.matchedSlots,32);
 assert.equal(r.results[1].status,"SOURCE_OHLC_WINDOW_MISMATCH");
 assert.equal(r.results[2].status,"SOURCE_OHLC_WINDOW_MISMATCH");
});
test("M15 retest needs independent pivot/sweep/MSS/retest sequence on both sides",()=>{
 const l=replace(lab,0,{...lab[0],categoryMask:64});
 const p=replace(pine,0,{...pine[0],categoryMask:64});
 assert.equal(audit(feeds,l,p).results[0].status,"M15_RETEST_CAUSAL_PROOF_MISSING");
 const proof={timeframe:"M15",instrumentId:feeds[0].instrumentId,
  provider:feeds[0].provider,c1StartMs:t-14400000,pivotAtMs:t-900000,
  sweepAtMs:t,mssAtMs:t+900000,retestAtMs:t+1800000,observedUntilMs:asOf};
 const goodL=replace(l,0,{...l[0],mss15Proof:proof});
 const goodP=replace(p,0,{...p[0],mss15Proof:proof});
 assert.equal(audit(feeds,goodL,goodP).results[0].status,"SEVEN_CATEGORY_MASK_MATCH_UNCERTIFIED");
 const badP=replace(goodP,0,{...goodP[0],mss15Proof:{...proof,pivotAtMs:t+M5}});
 assert.equal(audit(feeds,goodL,badP).results[0].status,"M15_RETEST_CAUSAL_PROOF_MISSING");
});
test("no role or source can claim a push or an operational trade",()=>{
 const p=replace(pine,7,{...pine[7],sendPush:true,actionable:true});
 assert.equal(audit(feeds,lab,p).results[7].status,"UNSAFE_OR_INVALID_CATEGORY_EVIDENCE");
});
test("35th, duplicated or foreign slot and future M5 cannot silently enter 34 cohort",()=>{
 assert.throws(()=>audit([...feeds,feeds[0]]),/DUPLICATE_OR_UNKNOWN_FEED_SLOT/);
 assert.throws(()=>audit(feeds,lab,[...pine,pine[0]]),/DUPLICATE_OR_UNKNOWN_PINE_SLOT/);
 const bad=replace(feeds,1,{...feeds[1],closedM5:[...feeds[1].closedM5,
  {...feeds[1].closedM5.at(-1),openedAt:asOf,closedAt:asOf+M5}]});
 assert.throws(()=>audit(bad),/OPEN_FUTURE_UNSORTED_OR_MIXED_M5/);
});
