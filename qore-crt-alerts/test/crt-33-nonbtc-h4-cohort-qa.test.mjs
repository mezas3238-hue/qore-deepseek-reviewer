import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {audit33NonBtcH4,PINE_33_SOURCE_BLOB_SHA}
 from "../src/crt-33-nonbtc-h4-cohort-qa.mjs";

const manifest=JSON.parse(readFileSync(new URL(
 "../trader-lab/34-instrument-source-preflight-2026-11-01.json",
 import.meta.url),"utf8"));
const sourceCatalog=manifest.source_catalog,asOf=1793659200000;
const mk=c=>({
 slot:c.slot,tvSymbol:c.tv_symbol,responded:true,
 pineBlobSha:PINE_33_SOURCE_BLOB_SHA,
 evidenceLocator:"SYNTHETIC_QA_FIXTURE_NOT_TRADINGVIEW_PROOF",
 asOf,lookbackM5:1500,h4Closed:32,h4Incomplete:0,
 h4Partial:0,h4Internal:0,h4Dst:0,
 c1Hours:3,c1Ok:3,c1BadClock:0,c1BadData:0,c1BadRange:0,
 audit2C:1,audit3C:1,auditInside:0,auditMulti4:0,auditMultiN:0
});
const snaps=sourceCatalog.map(mk);
const withOne=(arr,index,values)=>arr.map(x=>x.slot===index?{...x,...values}:x);
const run=(s=snaps,cat=sourceCatalog)=>audit33NonBtcH4({
 sourceCatalog:cat,snapshots:s,asOf,pineSourceBlobSha:PINE_33_SOURCE_BLOB_SHA
});
test("33 non-BTC records from the exact 34-market catalogue: 28 FX, 2 metals, 3 indices",()=>{
 const result=run();
 assert.equal(result.status,"33_NONBTC_SNAPSHOTS_VALID_BUT_UNCERTIFIED");
 assert.equal(result.results.length,33);
 assert.equal(result.btcSlotExcluded,8);
 assert.equal(result.counts.forex,28);
 assert.equal(result.counts.metals,2);
 assert.equal(result.counts.indices,3);
 assert.equal(result.counts.responded,33);
 assert.equal(result.counts.missing,0);
 assert.equal(result.certified,false);
 assert.equal(result.actionable,false);
 assert.equal(result.sendPush,false);
 assert.ok(result.results.every(x=>x.tvSymbol!=="IC:BTCUSD"&&x.slot!==8));
 assert.ok(result.results.some(x=>x.slot===34&&x.tvSymbol==="IC:NZDCAD"));
});
test("BTC has its own recognition and changes cannot alter 33 denominator",()=>{
 const modified=withOne(snaps,8,{responded:false,h4Closed:1,h4Incomplete:1,h4Partial:1});
 const result=run(modified);
 assert.equal(result.includedNonBtc,33);
 assert.equal(result.counts.responded,33);
 assert.equal(result.results.length,33);
 const noBTC=run(snaps.filter(x=>x.slot!==8));
 assert.equal(noBTC.counts.responded,33);
 assert.equal(noBTC.btcSlotExcluded,8);
});
test("NZDCAD H4 32/32 blocked gets its own failure, other 32 cannot inherit it",()=>{
 const dataset=withOne(snaps,34,{h4Closed:32,h4Incomplete:32,
  h4Partial:32,c1Hours:3,c1Ok:0,c1BadData:3});
 const r=run(dataset);
 assert.equal(r.status,"33_NONBTC_SNAPSHOTS_VALID_BUT_UNCERTIFIED");
 assert.equal(r.counts.responded,33);
 assert.equal(r.counts.blockedAllH4,1);
 const nz=r.results.find(x=>x.slot===34);
 assert.equal(nz.status,"H4_NOT_READY");
 assert.equal(nz.h4Incomplete,32);
 assert.equal(nz.c1Ok,0);
 assert.equal(r.results.find(x=>x.slot===12).status,"C1_CONTEXT_OBSERVED_UNCERTIFIED");
 assert.equal(r.certified,false);
});
test("Missing or unresponsive a single Forex, index or metal does not count as covered",()=>{
 for(const slot of [1,4,5,34]){
  const r=run(snaps.filter(x=>x.slot!==slot));
  assert.equal(r.counts.responded,32);
  assert.equal(r.counts.missing,1);
  assert.equal(r.status,"33_NONBTC_COHORT_INCOMPLETE_OR_BLOCKED");
  assert.equal(r.results.find(x=>x.slot===slot).status,"MISSING_OR_UNRESPONSIVE_FEED");
 }
});
test("One instrument cannot fabricate H4 continuity or exceed its 1500-M5 window",()=>{
 const r=run(withOne(snaps,17,{h4Incomplete:40}));
 assert.equal(r.results.find(x=>x.slot===17).status,"H4_COUNTERS_INCONSISTENT");
 assert.equal(r.counts.invalid,1);
 assert.equal(r.counts.responded,32);
 const late=run(withOne(snaps,23,{lookbackM5:1501}));
 assert.equal(late.results.find(x=>x.slot===23).status,"SOURCE_OR_WINDOW_NOT_ATTESTED");
});
test("H4 BAD breakdown and C1 mutually exclusive reasons must exactly reconcile",()=>{
 const gap=run(withOne(snaps,10,{h4Incomplete:12,h4Partial:3,h4Internal:4,h4Dst:4}));
 assert.equal(gap.results.find(x=>x.slot===10).status,"H4_COUNTERS_INCONSISTENT");
 const gate=run(withOne(snaps,21,{c1Ok:0,c1Hours:4,c1BadData:3}));
 assert.equal(gate.results.find(x=>x.slot===21).status,"C1_COUNTERS_INCONSISTENT");
 const bad=run(withOne(snaps,3,{c1Ok:0,c1Hours:3,c1BadClock:3}));
 assert.equal(bad.results.find(x=>x.slot===3).status,"H4_VALID_BUT_NO_C1");
});
test("Missing real Pine evidence does not magically certify 33/33 or reveal 7 trade entries",()=>{
 const r=run([]);
 assert.equal(r.status,"33_NONBTC_COHORT_INCOMPLETE_OR_BLOCKED");
 assert.equal(r.counts.responded,0);
 assert.equal(r.counts.missing,33);
 assert.equal(r.perEventParityCertified,false);
 assert.equal(r.realPineCompiled,false);
 assert.equal(r.independentOHLCVerified,false);
 assert.equal(r.noRepaintCertified,false);
 assert.equal(r.sendPush,false);
});
test("Exact Pine blob and immutable BTC slot are mandatory",()=>{
 assert.throws(()=>audit33NonBtcH4({
  sourceCatalog,snapshots:snaps,asOf,
  pineSourceBlobSha:"0123456789abcdef0123456789abcdef01234567"
 }),/INVALID_33_COHORT_OR_PINE_SOURCE/);
 const broken=sourceCatalog.map(x=>x.slot===8?{...x,tv_symbol:"IC:ETHUSD"}:x);
 assert.throws(()=>run(snaps,broken),/BTC_MUST_BE_OWN_SLOT_8/);
});
