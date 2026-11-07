import test from "node:test";
import assert from "node:assert/strict";
import {nyForexH4BucketStart,summarizeClosedEurusdH4}
  from "../src/qa-eurusd-ny-h4-reconstruction.mjs";
const M5=300000;
const candles=(start,count)=>{
  const t=Date.parse(start);
  return Array.from({length:count},(_,i)=>{
    const k=i/10000,low=1.01+k;
    return {provider:"IC",instrumentId:"EURUSD",
      source:"CTRADER_OPEN_API_DEMO",certified:false,sendPush:false,
      openedAt:t+i*M5,closedAt:t+(i+1)*M5,
      open:low+0.01,high:low+0.02,low,close:low+0.015};
  });
};
test("EURUSD NY 1/5/9 anchors create exactly 12 H4s from 576 M5 candles",()=>{
 const sample=candles("2026-11-03T06:00:00Z",576); // 01:00 EST
 const out=summarizeClosedEurusdH4(sample);
 assert.equal(out.completeH4Blocks,12);
 assert.equal(out.partialH4Blocks,0);
 assert.equal(out.rejectedH4Blocks,0);
 assert.equal(out.firstCompleteH4OpenedAtMs,Date.parse("2026-11-03T06:00:00Z"));
 assert.equal(out.bars[0].open,sample[0].open);
 assert.equal(out.bars[0].close,sample[47].close);
 assert.equal(out.bars[0].high,Math.max(...sample.slice(0,48).map(x=>x.high)));
 assert.equal(out.bars[0].low,Math.min(...sample.slice(0,48).map(x=>x.low)));
 assert.ok(out.bars.every(x=>x.m5Bars===48&&x.sourceParityCertified===false));
 assert.equal(out.crtFamiliesCertified,false);
 assert.equal(out.mssCertified,false);
 assert.equal(out.canTrade,false);
 assert.equal(out.sendPush,false);
});
test("partial H4 cannot fabricate remaining M5",()=>{
 const out=summarizeClosedEurusdH4(candles("2026-11-03T06:00:00Z",600));
 assert.equal(out.completeH4Blocks,12);
 assert.equal(out.partialH4Blocks,1);
 assert.equal(out.bars.length,12);
});
test("missing M5 inside a full block prevents H4 output",()=>{
 const arr=candles("2026-11-03T06:00:00Z",48);
 arr.splice(23,1);
 const x=summarizeClosedEurusdH4(arr);
 assert.equal(x.completeH4Blocks,0);
 assert.equal(x.rejectedH4Blocks,1);
});
test("DST spring-forward / fall-back bucketing keeps causality and never invents bars",()=>{
 const before=Date.parse("2026-03-08T06:00:00Z");
 const after=Date.parse("2026-03-08T07:00:00Z");
 assert.equal(nyForexH4BucketStart(before),before); // 01:00 EST
 assert.equal(nyForexH4BucketStart(after),Date.parse("2026-03-08T05:00:00Z")); // 03:00 EDT belongs prior 21:00 EST bucket
 const data=candles("2026-03-08T06:00:00Z",48);
 const summary=summarizeClosedEurusdH4(data);
 assert.ok(summary.completeH4Blocks<1);
 assert.equal(summary.sendPush,false);
});
test("duplicate, unclosed, swapped source, bad price quarantined",()=>{
 const data=candles("2026-11-03T06:00:00Z",48);
 for(const bad of [
   [...data.slice(0,1),data[0],...data.slice(1)],
   data.map((x,i)=>i===0?{...x,closedAt:x.closedAt+1}:x),
   data.map((x,i)=>i===0?{...x,provider:"TV"}:x),
   data.map((x,i)=>i===0?{...x,high:x.low-0.01}:x),
   data.map((x,i)=>i===0?{...x,certified:true}:x)
 ])assert.throws(()=>summarizeClosedEurusdH4(bad),/CRT_QA/);
});
