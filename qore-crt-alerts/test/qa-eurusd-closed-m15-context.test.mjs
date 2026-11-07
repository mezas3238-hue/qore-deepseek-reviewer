import test from "node:test";
import assert from "node:assert/strict";
import {deriveClosedEurusdM15Context}
 from "../src/qa-eurusd-closed-m15-context.mjs";
const M5=300000,T=Date.parse("2026-11-04T20:00:00.000Z");
function fixture(n=600){
 return Array.from({length:n},(_,i)=>{
  const o=1.12+i/100000;
  return {provider:"IC",instrumentId:"EURUSD",
   brokerSymbol:"EURUSD",symbolId:1,
   source:"CTRADER_OPEN_API_DEMO",certified:false,
   actionable:false,sendPush:false,
   openedAt:T+i*M5,closedAt:T+(i+1)*M5,
   open:o,high:o+0.0004,low:o-0.0001,close:o+0.0002};
 });
}
test("600 distinct M5 closed inputs yield exactly 200 distinct M15 contexts",()=>{
 const input=fixture(),r=deriveClosedEurusdM15Context(input);
 assert.equal(r.state,"EURUSD_M15_DERIVED_CONTEXT_QA_UNCERTIFIED");
 assert.equal(r.completeM15,200);
 assert.equal(r.partialM15,0);
 assert.equal(r.rejectedM15,0);
 assert.equal(r.bars.length,200);
 assert.equal(r.bars[0].openedAt,input[0].openedAt);
 assert.equal(r.bars[0].closedAt,input[2].closedAt);
 assert.equal(r.bars[0].open,input[0].open);
 assert.equal(r.bars[0].close,input[2].close);
 assert.equal(r.bars[0].high,Math.max(...input.slice(0,3).map(x=>x.high)));
 assert.equal(r.bars[0].low,Math.min(...input.slice(0,3).map(x=>x.low)));
 assert.ok(r.bars.every(x=>x.timeframe==="M15"&&x.sourceM5Count===3));
 assert.ok(r.bars.every(x=>x.mss15Certified===false&&x.sendPush===false));
 assert.equal(r.mssM5Certified,false);
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.nativeBrokerM15Compared,false);
 assert.equal(r.canTrade,false);
});
test("an incomplete M15 group never manufactures a closed bar",()=>{
 const input=fixture(599);
 const r=deriveClosedEurusdM15Context(input);
 assert.equal(r.completeM15,199);
 assert.equal(r.partialM15,1);
 assert.equal(r.rejectedM15,0);
});
test("a missing middle M5 marks its M15 as rejected and never uses M5 MSS",()=>{
 const input=fixture();input.splice(1,1);
 const r=deriveClosedEurusdM15Context(input);
 assert.equal(r.completeM15,199);
 assert.equal(r.rejectedM15,1);
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.sendPush,false);
});
test("out of order, duplicate, wrong broker, future/open, TV fallback and wrong symbol blocked",()=>{
 const a=fixture(9);
 for(const corrupted of [
  [a[1],a[0],...a.slice(2)],
  [a[0],a[0],...a.slice(1)],
  a.map((x,i)=>i===0?{...x,source:"TRADINGVIEW_IC"}:x),
  a.map((x,i)=>i===0?{...x,provider:"OTHER"}:x),
  a.map((x,i)=>i===0?{...x,closedAt:x.closedAt+1}:x),
  a.map((x,i)=>i===0?{...x,symbolId:88}:x),
  a.map((x,i)=>i===0?{...x,high:x.low-1}:x)
 ])assert.throws(()=>deriveClosedEurusdM15Context(corrupted),/CTRADER_QA_M15/);
});
