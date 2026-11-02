import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {hashM5} from "../src/parity-audit.mjs";
import {compareSevenCrtEventTraces34,PINE_V34_11K_SOURCE_SHA}
 from "../src/crt-seven-category-event-parity.mjs";
import {compareSevenCrtCategories34}
 from "../src/crt-seven-category-parity-audit.mjs";

const manifest=JSON.parse(readFileSync(new URL(
 "../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
const catalog=manifest.source_catalog;
const t=Date.parse("2026-10-26T05:00:00Z"),STEP=300000,count=150;
const asOf=t+count*STEP;
const mkFeed=(c,phase=0)=>({
 slot:c.slot,instrumentId:c.source_symbol,provider:"PROV_"+c.slot,
 closedM5:Array.from({length:phase?count-1:count},(_,i)=>({
  provider:"PROV_"+c.slot,instrumentId:c.source_symbol,
  openedAt:t+i*STEP+phase*60000,closedAt:t+(i+1)*STEP+phase*60000,
  open:100,high:102,low:98,close:101
 }))
});
const feeds=catalog.map(mkFeed);
const mkEvent=(f,phase,category="CRT_2C_CANDIDATE")=>({
 category,state:"PROVISIONAL",instrumentId:f.instrumentId,
 provider:f.provider,c1StartMs:t+phase*60000,
 eventAtMs:t+STEP+phase*60000,direction:1
});
function capture(f,phase,pine,opts={}){
 const bars=f.closedM5,mask=opts.categoryMask??2;
 return {
  slot:f.slot,instrumentId:f.instrumentId,provider:f.provider,
  candleSha256:hashM5(bars),windowM5Count:bars.length,
  windowStartMs:bars[0].openedAt,windowEndMs:bars.at(-1).closedAt,
  engine:pine?"TRADINGVIEW_PINE_V6_CAPTURE":"INDEPENDENT_TRADER_LAB_SEVEN_CATALOG_REPLAY",
  verifiedOnTradingView:pine?true:undefined,
  pineBlobSha:pine?PINE_V34_11K_SOURCE_SHA:undefined,
  evidenceLocator:"SYNTHETIC_NOT_A_REAL_TRADINGVIEW_CAPTURE",
  asOf,categoryMask:mask,sourcePhaseMin:phase,
  events:opts.events??[mkEvent(f,phase)],mss15Proof:opts.mss15Proof,
  sendPush:false,actionable:false
 };
}
const replace=(a,slot,value)=>a.map(x=>x.slot===slot?value:x);
const r0={
 catalog,feeds,
 pineCaptures:feeds.map(x=>capture(x,0,true)),
 labSnapshots:feeds.map(x=>capture(x,0,false)),
 asOf,pineSourceBlobSha:PINE_V34_11K_SOURCE_SHA
};
const compare=r=>compareSevenCrtEventTraces34(r);

test("All 34 exact source-phase zero fixtures still match but remain uncertified",()=>{
 const r=compare(r0);
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.matchedSlots,34);
 assert.equal(r.certified,false);assert.equal(r.sendPush,false);
 assert.equal(r.results[0].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 assert.equal(r0.pineCaptures[0].sourcePhaseMin,0);
});
test("AUDJPY +1, XAUUSD +2 and BTC phase 0 can be reconciled simultaneously",()=>{
 let feeds=r0.feeds,pines=r0.pineCaptures,labs=r0.labSnapshots;
 for(const [slot,phase] of [[1,1],[4,2]]){
  const f=mkFeed(catalog[slot-1],phase);
  feeds=replace(feeds,slot,f);
  pines=replace(pines,slot,capture(f,phase,true));
  labs=replace(labs,slot,capture(f,phase,false));
 }
 const r=compare({...r0,feeds,pineCaptures:pines,labSnapshots:labs});
 assert.equal(r.status,"ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED");
 assert.equal(r.matchedSlots,34);
 assert.equal(r.results[0].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 assert.equal(r.results[3].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 assert.equal(r.results[7].status,"EVENT_TRACE_MATCH_UNCERTIFIED"); // BTC
 assert.equal(r.certified,false);assert.equal(r.androidE2eCertified,false);
 const base=compareSevenCrtCategories34({...r0,feeds,pineCaptures:pines,labSnapshots:labs});
 assert.deepEqual([base.results[0].sourcePhaseMin,base.results[3].sourcePhaseMin,base.results[7].sourcePhaseMin],[1,2,0]);
});
test("A forged 0-phase MSS M15 never passes a +2 metal feed, even with a matching catalog bit",()=>{
 const metal=mkFeed(catalog[3],2);
 const mss={
  instrumentId:metal.instrumentId,provider:metal.provider,timeframe:"M15",
  c1StartMs:t+120000,pivotAtMs:t+120000-900000,
  pivotPrice:101.5,sweepAtMs:t+120000+STEP,
  breakAtMs:t+120000+900000,retestAtMs:t+120000+1800000,
  observedUntilMs:asOf,mssAtMs:t+120000+900000
 };
 const ev={...mkEvent(metal,2),category:"CRT_M15_RETEST",
  state:"QA_OBSERVED",eventAtMs:mss.retestAtMs,mss15:{
   ...mss
  }};
 const l=capture(metal,2,false,{categoryMask:64,events:[ev],mss15Proof:mss});
 const p=capture(metal,2,true,{categoryMask:64,events:[ev],mss15Proof:mss});
 const data={...r0,feeds:replace(r0.feeds,4,metal),
   pineCaptures:replace(r0.pineCaptures,4,p),
   labSnapshots:replace(r0.labSnapshots,4,l)};
 assert.equal(compare(data).results[3].status,"EVENT_TRACE_MATCH_UNCERTIFIED");
 const fakeM15={...mss,breakAtMs:t+900000,retestAtMs:t+1800000};
 const invalidP={...p,mss15Proof:fakeM15,
  events:[{...ev,mss15:{...ev.mss15,breakAtMs:t+900000}}]};
 const result=compare({...data,pineCaptures:replace(data.pineCaptures,4,invalidP)});
 assert.equal(result.results[3].status,"MASK_OR_SOURCE_NOT_READY");
 assert.equal(result.results[3].reason,"M15_RETEST_CAUSAL_PROOF_MISSING");
});
test("TradingView and lab must agree exactly on phase; matching OHLC alone is insufficient",()=>{
 const metal=mkFeed(catalog[3],2),p=capture(metal,2,true),l=capture(metal,2,false);
 const data={...r0,feeds:replace(r0.feeds,4,metal),pineCaptures:replace(r0.pineCaptures,4,p),
  labSnapshots:replace(r0.labSnapshots,4,l)};
 assert.equal(compare(data).matchedSlots,34);
 const forged={...p,sourcePhaseMin:1};
 const mismatch=compare({...data,pineCaptures:replace(data.pineCaptures,4,forged)});
 assert.equal(mismatch.results[3].status,"MASK_OR_SOURCE_NOT_READY");
 assert.equal(mismatch.results[3].reason,"SOURCE_PHASE_MISMATCH");
});
test("One M5 from another native phase is invalid even when prices and hash are replaced together",()=>{
 const metal=mkFeed(catalog[3],2);
 metal.closedM5[12]={...metal.closedM5[12],
  openedAt:metal.closedM5[12].openedAt-60000,
  closedAt:metal.closedM5[12].closedAt-60000};
 const p=capture(metal,2,true),l=capture(metal,2,false);
 const data={...r0,feeds:replace(r0.feeds,4,metal),
  pineCaptures:replace(r0.pineCaptures,4,p),
  labSnapshots:replace(r0.labSnapshots,4,l)};
 assert.throws(()=>compare(data),/M5_SOURCE_PHASE_DRIFT/);
});
test("A +2 native feed cannot be passed off as +1 just by shifting event timestamps",()=>{
 const metal=mkFeed(catalog[3],2),p=capture(metal,2,true),l=capture(metal,2,false);
 const forged={...p,events:[{...p.events[0],
   eventAtMs:p.events[0].eventAtMs-60000}]};
 const data={...r0,feeds:replace(r0.feeds,4,metal),
  pineCaptures:replace(r0.pineCaptures,4,forged),
  labSnapshots:replace(r0.labSnapshots,4,l)};
 const result=compare(data);
 assert.equal(result.results[3].status,"INVALID_OR_MISSING_EVENT_TRACE");
 assert.equal(result.results[3].pineReason,"INVALID_EVENT_IDENTITY_OR_CAUSAL_TIME");
});
