import test from "node:test";
import assert from "node:assert/strict";
import {aggregateClosedM5} from "../src/aggregate.mjs";
import {inspectMssM5,frozenM5Pivot} from "../src/mss-m5.mjs";
const FIVE=300000,BASE=Date.parse("2026-10-30T05:00:00Z");
function scenario({dir=1,stage="C2",breakClose=null,alreadyCrossed=false}={}){
  const data=[];
  for(let i=0;i<144;i++){
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;}
    if(i===21){high=106;low=94;}
    if(i===48){high=dir===1?103:111;low=dir===1?89:96;close=alreadyCrossed?108:100;}
    if(i===49){high=109;low=dir===1?95:92;
      if(stage==="C2")close=breakClose??(dir===1?108:93);
      else if(alreadyCrossed)close=109;
    }
    if(i===96){high=109;low=93;if(stage==="C3")close=breakClose??(dir===1?108:93);}
    high=Math.max(high,close);
    low=Math.min(low,close);
    const openedAt=BASE+i*FIVE;
    data.push({provider:"OFFLINE_FIXTURE",instrumentId:"EURUSD",
      openedAt,closedAt:openedAt+FIVE,open:100,high,low,close});
  }
  const agg=aggregateClosedM5(data,{timeframe:"H4",family:"forex"});
  assert.equal(agg.complete.length,3);
  const [c1,c2,c3]=agg.complete;
  return {data,c1,c2,c3};
}
const run=(s,c3=null,rest={})=>inspectMssM5({candlesM5:s.data,c1:s.c1,c2:s.c2,c3,
  family:"forex",...rest});
test("M5 bullish crossing after sweep gets its own distinct event",()=>{
  const s=scenario(),x=run(s);
  assert.equal(x.state,"MSS_CONFIRMED_C2");
  assert.equal(x.pivotPrice,106);
  assert.equal(x.pivotAt,BASE+21*FIVE);
  assert.equal(x.mssAt,s.c2.openedAt+2*FIVE);
  assert.equal(x.sweepAt,s.c2.openedAt+FIVE);
  assert.equal(x.actionable,false);
  assert.equal(x.timeframe,"M5");
});
test("M5 bearish crossing requires previous close at/above low pivot",()=>{
  const s=scenario({dir:-1}),x=run(s);
  assert.equal(x.state,"MSS_CONFIRMED_C2");
  assert.equal(x.pivotPrice,94);
  assert.equal(x.direction,-1);
});
test("close exactly at pivot is not MSS M5",()=>{
  const s=scenario({breakClose:106});
  assert.equal(run(s).state,"MSS_NOT_CONFIRMED");
});
test("M5 cannot give an MSS during the sweep candle",()=>{
  const s=scenario({alreadyCrossed:true,stage:"NEVER"});
  assert.equal(run(s).state,"MSS_NOT_CONFIRMED");
});
test("C3 M5 confirmation recorded in C3 and not invented in C2",()=>{
  const s=scenario({stage:"C3"});
  assert.equal(run(s).state,"MSS_NOT_CONFIRMED");
  assert.equal(run(s,s.c3).state,"MSS_CONFIRMED_C3");
});
test("M5 MSS from C2 remains tied to original C1 during C3",()=>{
  const s=scenario();
  const x=run(s,s.c3);
  assert.equal(x.state,"MSS_CONFIRMED_C2");
  assert.equal(x.c1Start,s.c1.openedAt);
});
test("M5 pivot older than 60 minutes is not frozen",()=>{
  const s=scenario();
  assert.equal(run(s,null,{maxPivotAgeMinutes:60}).state,"NO_FRESH_PRE_SWEEP_PIVOT");
});
test("insufficient right bars means pivot is not yet confirmed",()=>{
  const s=scenario();
  assert.equal(frozenM5Pivot(s.data,{direction:1,sweepStart:BASE+22*FIVE}),null);
});
test("M5 missing inside reference H4 prevents false signals",()=>{
  const s=scenario();s.data.splice(30,1);
  assert.equal(run(s).state,"INCOMPLETE_OR_DIFFERENT_H4");
});
test("A new feed cannot reuse a pivot from a different price provider",()=>{
  const s=scenario();s.data[0]={...s.data[0],provider:"OTHER"};
  assert.equal(run(s).state,"MIXED_OR_MISSING_FEED");
});
test("C3 invalidation by H4 close disables live-like MSS state",()=>{
  const s=scenario();const last=s.data.at(-1);
  s.data[s.data.length-1]={...last,close:88,low:87};
  const c3=aggregateClosedM5(s.data,{timeframe:"H4",family:"forex"}).complete[2];
  assert.equal(run(s,c3).state,"CRT_INVALIDATED_C3");
});
