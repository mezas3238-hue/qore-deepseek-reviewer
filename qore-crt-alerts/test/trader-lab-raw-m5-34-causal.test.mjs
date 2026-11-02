import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {decodeCTraderRawM5,buildNyH4FromClosedM5,run34CrtM5ContextQA}
 from "../src/trader-lab-raw-m5-causal-bridge.mjs";
import {auditTraderLab34Preflight} from "../src/trader-lab-crt-34-gate.mjs";
const manifest=JSON.parse(readFileSync(new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
const M5=300000;
const base=Date.parse("2026-10-26T05:00:00Z"); // NY Monday 01:00, EDT
const candle=(time,symbol,provider,high,low,open=105,close=105)=>({
 timeframe:"M5",provider,instrumentId:symbol,
 openedAt:time,closedAt:time+M5,open,high,low,close
});
function fixture(entry,{bars=96,asOfBase=base}={}){
 const symbol=entry.source_symbol;
 const family=["NAS100","SP500","US30"].includes(symbol)?"index":symbol==="BTCUSD"?"crypto":"forex";
 const start=asOfBase+(family==="index"?3600000:0);
 return {
  slot:entry.slot,provider:"FIXTURE_ONLY_"+entry.slot,instrumentId:symbol,family,
  closedM5:Array.from({length:bars},(_,i)=>{
   const h=i===0?110:106;
   const l=i===0?100:i===49?98:104;
   return candle(start+i*M5,symbol,"FIXTURE_ONLY_"+entry.slot,h,l);
  })
 };
}
test("33 source ZIP SHA256 from GitHub are bound to exact cohort without assuming the 12 Atlas broker identities",()=>{
 const rows=manifest.source_catalog;
 assert.equal(manifest.schema,"qore.crt.trader_lab_34.source_preflight.v2");
 assert.equal(rows.length,34);
 const present=rows.filter(x=>x.status==="ARCHIVE_METADATA_PRESENT_CONTENT_UNOPENED");
 assert.equal(present.length,33);
 assert.equal(present.filter(x=>x.artifact.run_id===35166210458).length,12);
 assert.equal(present.filter(x=>x.artifact.run_id===38193802541).length,21);
 assert.equal(present.filter(x=>x.source_provider==="CTRADER_DEMO_ATLAS_BROKER_UNVERIFIED").length,12);
 assert.equal(present.filter(x=>x.source_provider==="IC_MARKETS_DEMO_CONFIRMED_CAPTURE").length,21);
 for(const x of present){
  assert.match(x.artifact.archive_sha256,/^sha256:[a-f0-9]{64}$/);
  assert.match(x.artifact.capture_head_sha,/^[a-f0-9]{40}$/);
  assert.equal(x.content_manifest_sha256,null);
  assert.equal(x.source_content_attested,false);
  assert.equal(x.broker_to_tradingview_price_parity_verified,false);
 }
 assert.equal(rows.find(x=>x.source_symbol==="BTCUSD").status,"MISSING_SOURCE");
 const res=auditTraderLab34Preflight(manifest);
 assert.equal(res.metadata_present,33);
 assert.equal(res.atlas_source_accounts_unverified,12);
 assert.equal(res.ic_markets_catalog_verified_metadata,21);
 assert.equal(res.verdict,"BLOCKED_HOLDOUT");
 for(const reason of ["MISSING_SOURCE:BTCUSD","ATLAS_EXACT_BROKER_ORIGIN_UNVERIFIED",
   "PROVIDER_PARITY_NOT_ESTABLISHED","LICENSE_NOT_VERIFIED",
   "HOLDOUT_NOT_PREREGISTERED","PRICE_CONTENT_DIGEST_OR_WINDOW_UNVERIFIED"])
   assert.ok(res.reasons.includes(reason),reason);
});
test("native cTrader integers decoded without guessing price decimal scales",()=>{
 const ms=base,raw={
  canonical_symbol:"EURUSD",provider_symbol:"EURUSD",provider_symbol_id:123,digits:5,
  utc_timestamp_in_minutes:ms/60000,
  low_relative:100000,delta_open:5000,delta_high:10000,delta_close:7000,
  open_relative:105000,high_relative:110000,close_relative:107000,
  opened_at:new Date(ms).toISOString()
 };
 const identity={source_symbol:"EURUSD",provider_symbol:"EURUSD",
  provider_symbol_id:123,provider_tag:"ARCHIVE_001",digits:5};
 const b=decodeCTraderRawM5(raw,identity);
 assert.equal(b.low,100000);
 assert.equal(b.high,110000);
 assert.equal(b.priceUnit,"CTRADER_NATIVE_INTEGER");
 assert.equal(b.openedAt,ms);
 assert.equal(b.closedAt,ms+M5);
 assert.throws(()=>decodeCTraderRawM5({...raw,provider_symbol_id:999},identity),/PROVIDER_SYMBOL_IDENTITY_MISMATCH/);
 assert.throws(()=>decodeCTraderRawM5({...raw,high_relative:110001},identity),/NATIVE_OHLC_RELATIVE_MISMATCH/);
 assert.throws(()=>decodeCTraderRawM5({...raw,utc_timestamp_in_minutes:ms/60000+1},identity),/M5_TIMESTAMP_OR_ALIGNMENT_INVALID/);
});
test("34 distinct M5 contexts become 68 closed H4s and 34 2C structural synthetic examples, no trade signals",()=>{
 const feeds=manifest.source_catalog.map(entry=>fixture(entry));
 const asOf=base+9*3600000;
 const report=run34CrtM5ContextQA({catalog:manifest.source_catalog,feeds,asOf});
 assert.equal(report.symbolCount,34);
 assert.equal(report.results.length,34);
 assert.equal(report.results.reduce((s,x)=>s+x.historicalH4,0),68);
 assert.equal(report.results.reduce((s,x)=>s+x.structuralQaCandidates,0),34);
 assert.ok(report.results.every(x=>x.holdoutStatus==="NOT_SEALED"&&!x.sendPush&&!x.live));
 assert.equal(report.actualHoldoutCertified,false);
 assert.equal(report.sourceLicenseCertified,false);
 assert.equal(report.pineCompiled,false);
 assert.equal(report.pushE2e,false);
});
test("Forex and index NY anchor not confused while M5→H4 reconstructs closed causal blocks",()=>{
 const fore=fixture({slot:1,source_symbol:"EURUSD"});
 const idx=fixture({slot:2,source_symbol:"NAS100"});
 for(const f of [fore,idx]){
  const r=buildNyH4FromClosedM5({...f,asOf:base+9*3600000});
  assert.equal(r.closedH4.length,2);
  assert.equal(r.excludedH4.length,0);
  assert.equal(r.closedH4[0].allowedC1,true);
  assert.equal(r.closedH4[0].nyHour,f.family==="index"?2:1);
  assert.equal(r.closedH4[1].allowedC1,true);
 }
});
test("M5 partial, internal gap, wrong feed and future candle never become closed H4 CRT",()=>{
 const f=fixture({slot:1,source_symbol:"EURCHF"});
 const partial=buildNyH4FromClosedM5({...f,closedM5:f.closedM5.slice(0,70),asOf:base+9*3600000});
 assert.equal(partial.closedH4.length,1);
 assert.equal(partial.excludedH4.length,1);
 const gap=f.closedM5.filter((_,i)=>i!==24);
 const r=buildNyH4FromClosedM5({...f,closedM5:gap,asOf:base+9*3600000});
 assert.equal(r.closedH4.length,1);
 assert.ok(r.excludedH4.some(x=>x.reason==="INTERNAL_M5_DISCONTINUITY"));
 assert.throws(()=>buildNyH4FromClosedM5({...f,closedM5:[...f.closedM5,f.closedM5[95]],asOf:base+9*3600000}),/DUPLICATE_OR_UNSORTED_M5/);
 const wrong=f.closedM5.map(x=>({...x}));wrong[30].provider="OTHER_PROVIDER";
 assert.throws(()=>buildNyH4FromClosedM5({...f,closedM5:wrong,asOf:base+9*3600000}),/M5_OHLC_OR_IDENTITY_INVALID/);
 assert.throws(()=>buildNyH4FromClosedM5({...f,asOf:base+M5}),/LOOKAHEAD_OR_OPEN_M5_FORBIDDEN/);
});
test("NY 2026-11-01 fall-back 01-05 block of 60 M5 is rejected; 48-bar incomplete prefix cannot repaint",()=>{
 const t=Date.parse("2026-11-01T05:00:00Z");
 const f=fixture({slot:8,source_symbol:"BTCUSD"},{bars:60,asOfBase:t});
 const full=buildNyH4FromClosedM5({...f,asOf:t+60*M5});
 assert.equal(full.closedH4.length,0);
 assert.equal(full.excludedH4.length,1);
 assert.equal(full.excludedH4[0].observedM5,60);
 assert.equal(full.excludedH4[0].reason,"DST_OR_UNUSUAL_NY_BUCKET");
 const prefix=buildNyH4FromClosedM5({...f,closedM5:f.closedM5.slice(0,48),asOf:t+48*M5});
 assert.equal(prefix.closedH4.length,0);
 assert.equal(prefix.excludedH4[0].reason,"DST_OR_UNUSUAL_NY_BUCKET");
});
test("NY 2026-03-08 spring-forward produces 36 M5 and fails closed",()=>{
 const t=Date.parse("2026-03-08T06:00:00Z");
 const f=fixture({slot:8,source_symbol:"BTCUSD"},{bars:36,asOfBase:t});
 const result=buildNyH4FromClosedM5({...f,asOf:t+36*M5});
 assert.equal(result.closedH4.length,0);
 assert.equal(result.excludedH4[0].reason,"DST_OR_UNUSUAL_NY_BUCKET");
});
test("holdout does not accept 33 contexts as a substitute for 34",()=>{
 const f=manifest.source_catalog.map(x=>fixture(x));
 assert.throws(()=>run34CrtM5ContextQA({catalog:manifest.source_catalog,feeds:f.slice(0,33),asOf:base+9*3600000}),/34_INDEPENDENT_SOURCES_REQUIRED/);
 const duplicate=f.map(x=>({...x}));duplicate[1].slot=1;
 assert.throws(()=>run34CrtM5ContextQA({catalog:manifest.source_catalog,feeds:duplicate,asOf:base+9*3600000}),/DUPLICATE_SOURCE_SLOT/);
 const wrong=f.map(x=>({...x}));wrong[5].instrumentId="FAKE_US500";
 assert.throws(()=>run34CrtM5ContextQA({catalog:manifest.source_catalog,feeds:wrong,asOf:base+9*3600000}),/UNBOUND_SOURCE/);
});
