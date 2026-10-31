import test from "node:test";
import assert from "node:assert/strict";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {M5_MS,validateClosedM5,deduplicateM5} from "../src/contracts.mjs";
import {bucketNY,nyParts,C1_HOURS} from "../src/ny-clock.mjs";
import {aggregateClosedM5} from "../src/aggregate.mjs";
const at=x=>Date.parse(x);
const candle=(t,more={})=>({provider:"OFFLINE_FIXTURE",instrumentId:"EURUSD",
  openedAt:t,closedAt:t+M5_MS,open:100,high:102,low:99,close:101,...more});
const bars=(t,n)=>Array.from({length:n},(_,i)=>candle(t+i*M5_MS));
test("34 exact Pine inventory slots with no invented feed mapping",()=>{
  assert.equal(INSTRUMENTS.length,34);
  assert.equal(new Set(INSTRUMENTS.map(x=>x.tvSymbol)).size,34);
  assert.equal(INSTRUMENTS[24].id,"EURCAD");
  assert.equal(INSTRUMENTS[29].id,"GBPAUD");
  assert.ok(INSTRUMENTS.every(x=>x.feedSymbol===null&&x.feedStatus==="UNVERIFIED"));
});
test("BTCUSD is NOT silently assigned a forex H4 timetable",()=>{
  assert.equal(INSTRUMENTS[7].family,"crypto");
  assert.throws(()=>bucketNY(at("2026-10-30T05:00:00Z"),"H4","crypto"),/unsupported family/);
});
test("M5 shape, alignment and OHLC are strictly validated",()=>{
  const b=candle(at("2026-10-30T05:00:00Z"));
  assert.deepEqual(validateClosedM5(b),b);
  assert.throws(()=>validateClosedM5({...b,high:99}),/OHLC/);
  assert.throws(()=>validateClosedM5({...b,openedAt:b.openedAt+1}),/timestamps/);
  assert.throws(()=>validateClosedM5({...b,close:Infinity}),/OHLC/);
});
test("duplicate replay is harmless only with identical OHLC",()=>{
  const b=candle(at("2026-10-30T05:00:00Z"));
  assert.equal(deduplicateM5([b,b]).length,1);
  assert.throws(()=>deduplicateM5([b,{...b,close:100.5}]),/conflicting/);
});
test("NY DST winter/summer and strict C1 hours",()=>{
  assert.equal(nyParts(at("2026-01-15T06:00:00Z")).hour,1);
  assert.equal(nyParts(at("2026-07-15T05:00:00Z")).hour,1);
  assert.deepEqual(C1_HOURS.forex,[1,5,21]);
  assert.deepEqual(C1_HOURS.index,[2,6,22]);
});
test("overnight FX grouping 21->01 NY",()=>{
  const x=bucketNY(at("2026-10-31T01:00:00Z"),"H4","forex");
  const y=bucketNY(at("2026-10-31T04:30:00Z"),"H4","forex");
  const z=bucketNY(at("2026-10-31T05:00:00Z"),"H4","forex");
  assert.equal(x.key,y.key);
  assert.equal(x.hour,21);assert.equal(z.hour,1);assert.equal(x.allowedC1,true);
});
test("index starts NY 02 not FX 01",()=>{
  const t=at("2026-10-30T06:00:00Z");
  assert.equal(bucketNY(t,"H4","index").hour,2);
  assert.equal(bucketNY(t,"H4","forex").hour,1);
});
test("48 complete closed M5 reconstruct H4",()=>{
  const t=at("2026-10-30T05:00:00Z");
  const r=aggregateClosedM5(bars(t,48),{timeframe:"H4",family:"forex"});
  assert.equal(r.complete.length,1);assert.equal(r.rejected.length,0);
  assert.equal(r.complete[0].nyHour,1);
  assert.equal(r.complete[0].closedAt,t+48*M5_MS);
});
test("missing M5 and incomplete H4 must be rejected",()=>{
  const t=at("2026-10-30T05:00:00Z"),a=bars(t,48);
  assert.equal(aggregateClosedM5(a.slice(0,47),{timeframe:"H4",family:"forex"}).complete.length,0);
  const r=aggregateClosedM5(a.filter((_,i)=>i!==12),{timeframe:"H4",family:"forex"});
  assert.equal(r.complete.length,0);assert.equal(r.rejected.length,1);
});
test("M15 requires three contiguous M5",()=>{
  const t=at("2026-10-30T05:00:00Z"),a=bars(t,3);
  assert.equal(aggregateClosedM5(a,{timeframe:"M15",family:"forex"}).complete.length,1);
  assert.equal(aggregateClosedM5(a.slice(1),{timeframe:"M15",family:"forex"}).complete.length,0);
});
test("DST repeated NY hour is conservatively rejected, not used for signals",()=>{
  assert.equal(nyParts(at("2026-11-01T05:00:00Z")).hour,1);
  assert.equal(nyParts(at("2026-11-01T06:00:00Z")).hour,1);
  const r=aggregateClosedM5(bars(at("2026-11-01T05:00:00Z"),60),{timeframe:"H4",family:"forex"});
  assert.equal(r.complete.length,0);assert.ok(r.rejected.length>0);
});
test("never aggregate across separate providers",()=>{
  const t=at("2026-10-30T05:00:00Z");
  assert.throws(()=>aggregateClosedM5([candle(t),candle(t+M5_MS,{provider:"OTHER"})],
    {timeframe:"M15",family:"forex"}),/mixed provider/);
});
