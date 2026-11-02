import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {hashM5} from "../src/parity-audit.mjs";
import {buildNyH4FromClosedM5} from "../src/trader-lab-raw-m5-causal-bridge.mjs";
import {inspectCrtMorphologies} from "../src/crt-structural-morphologies.mjs";
import {compare34PineTraderLabEvents}
 from "../src/crt-34-pine-event-parity-gate.mjs";

const manifest=JSON.parse(readFileSync(
 new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
const catalog=manifest.source_catalog;
const M5=300000,base=Date.parse("2026-10-26T05:00:00Z");
const asOf=base+10*3600000;
const pineBlobSha="66c2041c2e2534c65a07e6b794eea8e976bff99c"; // fixture only, not Pine blob
const familyOf=s=>["NAS100","SP500","US30"].includes(s)?"index":s==="BTCUSD"?"crypto":"forex";
const feed=(c,n=96)=>{
 const family=familyOf(c.source_symbol),instrumentId=c.source_symbol;
 const provider="SYNTHETIC_TEST_FEED_"+c.slot;
 const start=base+(family==="index"?3600000:0);
 return {slot:c.slot,instrumentId,provider,family,
  closedM5:Array.from({length:n},(_,i)=>{
   const low=i===49?98:i===0?100:104;
   const high=i===0?110:106;
   return {timeframe:"M5",provider,instrumentId,
    openedAt:start+i*M5,closedAt:start+(i+1)*M5,
    open:105,high,low,close:105};
  })
 };
};
const feeds=catalog.map(x=>feed(x));
function syntheticCapture(f){
 const window=f.closedM5.slice(-1500);
 const h4=buildNyH4FromClosedM5({
  closedM5:window,family:f.family,provider:f.provider,instrumentId:f.instrumentId,asOf
 });
 const events=inspectCrtMorphologies({closedH4:h4.closedH4,family:f.family}).signals
  .map(x=>({model:x.model,direction:x.direction,c1Start:x.c1Start,
   ratifiedAt:x.ratifiedAt,provider:x.provider,instrumentId:x.instrumentId}));
 return {slot:f.slot,provider:f.provider,instrumentId:f.instrumentId,
  verifiedOnTradingView:true,engine:"TRADINGVIEW_PINE_V6_CAPTURE",
  evidenceLocator:"SYNTHETIC_TEST_ONLY_NOT_EDITOR_EVIDENCE",
  pineBlobSha,candleSha256:hashM5(window),
  windowM5Count:window.length,windowStartMs:window[0].openedAt,
  windowEndMs:window.at(-1).closedAt,asOf,
  actionable:false,sendPush:false,events};
}
const captured=feeds.map(syntheticCapture);
const compare=(fs=feeds,cs=captured,catalogArg=catalog)=>compare34PineTraderLabEvents({
  catalog:catalogArg,feeds:fs,captures:cs,asOf,pineBlobSha
});
test("34 independently bound synthetic H4 event matches remain uncertified: MSS15/Android OFF",()=>{
 const r=compare();
 assert.equal(r.scope,34);
 assert.equal(r.matchedH4Slots,34);
 assert.equal(r.status,"H4_34_MATCH_BUT_UNCERTIFIED");
 assert.ok(r.results.every(x=>x.labH4Events===1&&x.status==="H4_EVENTS_MATCH_MSS15_PENDING"));
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.pineRuntimeCertified,false);
 assert.equal(r.sourceEquivalenceCertified,false);
 assert.equal(r.androidE2eCertified,false);
 assert.equal(r.sendPush,false);
 assert.equal(r.certified,false);
});
test("missing Pine capture blocks even when 34 Trader Lab structural candidates exist",()=>{
 const r=compare(feeds,[]);
 assert.equal(r.status,"PARITY_BLOCKED_OR_MISMATCH");
 assert.equal(r.matchedH4Slots,0);
 assert.ok(r.results.every(x=>x.status==="PINE_CAPTURE_MISSING"));
});
test("1 altered M5 timestamp/price hash or wrong provider never yields same-feed parity",()=>{
 const bad=captured.map(x=>({...x}));
 bad[4]={...bad[4],candleSha256:"a".repeat(64)};
 bad[5]={...bad[5],provider:"OTHER_PROVIDER"};
 const r=compare(feeds,bad);
 assert.equal(r.matchedH4Slots,32);
 assert.equal(r.results[4].status,"SOURCE_WINDOW_OR_ASOF_MISMATCH");
 assert.equal(r.results[5].status,"SOURCE_WINDOW_OR_ASOF_MISMATCH");
});
test("H4 structural false positive and missed model are classified, never auto-relabelled",()=>{
 const extra=captured.map(x=>({...x}));
 extra[0]={...extra[0],events:[...extra[0].events,{
  ...extra[0].events[0],model:"CRT_MULTICANDLE"}]};
 extra[1]={...extra[1],events:[]};
 const r=compare(feeds,extra);
 assert.equal(r.matchedH4Slots,32);
 assert.equal(r.results[0].status,"H4_EVENT_MISMATCH");
 assert.equal(r.results[0].unexpectedInPine.length,1);
 assert.equal(r.results[1].missingInPine.length,1);
});
test("no fabricated Pine editor attestation, mismatched candidate or live flag accepted",()=>{
 const c=captured.map(x=>({...x}));
 c[2]={...c[2],verifiedOnTradingView:false};
 c[3]={...c[3],pineBlobSha:"a".repeat(40)};
 c[4]={...c[4],sendPush:true};
 const r=compare(feeds,c);
 assert.equal(r.matchedH4Slots,31);
 assert.equal(r.results[2].status,"PINE_PROVENANCE_BLOCKED");
 assert.equal(r.results[3].status,"PINE_PROVENANCE_BLOCKED");
 assert.equal(r.results[4].status,"PINE_PROVENANCE_BLOCKED");
});
test("1500 closed M5 horizon is enforced per source rather than complete historical count",()=>{
 const extended=feeds.map(x=>({...x,closedM5:[...x.closedM5]}));
 // A different, older M5 outside the most recent 1500 cannot alter the
 // comparison window. Use a longer contiguous synthetic fixture.
 const one=feed(catalog[0],1536);
 const horizonAsOf=one.closedM5.at(-1).closedAt;
 const expectedWindow=one.closedM5.slice(-1500);
 assert.equal(expectedWindow.length,1500);
 assert.equal(hashM5(one.closedM5.slice(0,1500))===hashM5(expectedWindow),false);
 assert.equal(one.closedM5.at(-1).closedAt,horizonAsOf);
 assert.equal(extended.length,34);
});
test("full-history input is actually sliced to the latest 1500 M5 by the parity gate",()=>{
 const extended=[feed(catalog[0],1536),...feeds.slice(1)];
 const horizonAt=extended[0].closedM5.at(-1).closedAt;
 const r=compare34PineTraderLabEvents({
  catalog,feeds:extended,captures:[],asOf:horizonAt,pineBlobSha
 });
 assert.equal(r.results[0].observedWindowM5,1500);
 assert.equal(r.results[1].observedWindowM5,96);
 assert.equal(r.results[0].status,"PINE_CAPTURE_MISSING");
 assert.equal(r.status,"PARITY_BLOCKED_OR_MISMATCH");
});
test("duplicate catalog symbol, duplicate capture and wrong feed slot fail closed",()=>{
 const clone=catalog.map(x=>({...x}));
 clone[1].source_symbol=clone[0].source_symbol;
 assert.throws(()=>compare(feeds,captured,clone),/DUPLICATE_OR_INVALID_CATALOG/);
 assert.throws(()=>compare(feeds,[...captured,captured[0]]),/DUPLICATE_OR_UNKNOWN_PINE_SLOT/);
 const wrong=feeds.map(x=>({...x}));
 wrong[0].slot=999;
 assert.throws(()=>compare(wrong),/DUPLICATE_OR_UNKNOWN_FEED_SLOT/);
});
