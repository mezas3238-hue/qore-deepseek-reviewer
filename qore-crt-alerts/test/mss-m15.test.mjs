import test from "node:test";
import assert from "node:assert/strict";
import {aggregateClosedM5} from "../src/aggregate.mjs";
import {inspectMssM15,frozenM15Pivot} from "../src/mss-m15.mjs";
const FIVE=300000,BASE=Date.parse("2026-10-30T05:00:00Z");
// 16 M15 groups = C1; 16 = C2; 16 = C3.
// C1 extreme high=110, low=90. Strict swing high=105/low=95 at M15 #7
// is confirmed only after M15 #9; sweep happens in C2 M5 #0.
function scenario({dir=1,mssStage="C2",breakClose=null}={}){
  const data=[];
  for(let group=0;group<48;group++){
    let high=102,low=97,close=100;
    if(group===0){high=110;low=90;}
    if(group===7){high=105;low=95;}
    if(group===16){
      high=dir===1?109:111;
      low=dir===1?89:92;
    }
    if(group===32){high=109;low=94;}
    if((mssStage==="C2"&&group===16)||(mssStage==="C3"&&group===32)){
      close=breakClose??(dir===1?108:94);
      high=Math.max(high,close);
      low=Math.min(low,close);
    }
    for(let k=0;k<3;k++){
      const t=BASE+(group*3+k)*FIVE;
      data.push({provider:"OFFLINE_FIXTURE",instrumentId:"EURUSD",openedAt:t,closedAt:t+FIVE,
        open:100,high,low,close:k===2?close:100});
    }
  }
  const agg=aggregateClosedM5(data,{timeframe:"H4",family:"forex"});
  assert.equal(agg.complete.length,3);
  const [c1,c2,c3]=agg.complete;
  return {data,c1,c2,c3};
}
const evalMSS=(s,c3=null,config={})=>inspectMssM15({
  candlesM5:s.data,c1:s.c1,c2:s.c2,c3,family:"forex",...config});
test("bullish M15 breaks last confirmed pre-sweep swing in C2",()=>{
  const s=scenario(),r=evalMSS(s);
  assert.equal(r.state,"MSS_CONFIRMED_C2");
  assert.equal(r.direction,1);
  assert.equal(r.pivotPrice,105);
  assert.equal(r.pivotAt,BASE+7*900000);
  assert.equal(r.pivotConfirmedAt,BASE+10*900000);
  assert.equal(r.sweepAt,s.c2.openedAt+FIVE);
  assert.equal(r.mssAt,s.c2.openedAt+900000);
  assert.equal(r.eligibleAfter,s.c2.closedAt);
  assert.equal(r.actionable,false);
});
test("bearish M15 breaks last confirmed pre-sweep low in C2",()=>{
  const s=scenario({dir:-1}),r=evalMSS(s);
  assert.equal(r.state,"MSS_CONFIRMED_C2");
  assert.equal(r.direction,-1);
  assert.equal(r.pivotPrice,95);
});
test("strict crossing: exact touch is NOT M15 MSS",()=>{
  const s=scenario({breakClose:105});
  assert.equal(evalMSS(s).state,"MSS_NOT_CONFIRMED");
});
test("C2 MSS is inherited while C3 stays non-invalidated",()=>{
  const s=scenario();
  const r=evalMSS(s,s.c3);
  assert.equal(r.state,"MSS_CONFIRMED_C2");
  assert.equal(r.crtState,"C3_NOT_INVALIDATED");
});
test("MSS can first confirm in C3 without pretending it was C2",()=>{
  const s=scenario({mssStage:"C3"});
  const r=evalMSS(s,s.c3);
  assert.equal(r.state,"MSS_CONFIRMED_C3");
  assert.equal(r.mssAt,s.c3.openedAt+900000);
});
test("No C3 supplied means no future C3 MSS leak",()=>{
  const s=scenario({mssStage:"C3"});
  assert.equal(evalMSS(s).state,"MSS_NOT_CONFIRMED");
});
test("C3 H4 invalidation suppresses confirmed operational MSS",()=>{
  const s=scenario();
  const tail=s.data.at(-1);
  const ix=s.data.length-1;
  s.data[ix]={...tail,close:88,low:87};
  const c3=aggregateClosedM5(s.data,{timeframe:"H4",family:"forex"}).complete[2];
  const r=evalMSS(s,c3);
  assert.equal(r.state,"CRT_INVALIDATED_C3");
  assert.equal(r.actionable,false);
});
test("frozen pivot expires by minutes, not 48 bars",()=>{
  const s=scenario();
  assert.equal(evalMSS(s,null,{maxPivotAgeMinutes:60}).state,"NO_FRESH_PRE_SWEEP_PIVOT");
});
test("missing closed M5 inside C1 rejects reference H4 and prevents MSS",()=>{
  const s=scenario();
  s.data.splice(17,1);
  assert.equal(evalMSS(s).state,"INCOMPLETE_OR_DIFFERENT_H4");
});
test("M15 crossed on the first full candle after sweep, not the sweep M5",()=>{
  const s=scenario(),r=evalMSS(s);
  assert.ok(r.mssAt>r.sweepAt);
});
test("cannot mix price providers with an otherwise matching CRT",()=>{
  const s=scenario();
  s.data[0]={...s.data[0],provider:"WRONG"};
  assert.equal(evalMSS(s).state,"MIXED_OR_MISSING_FEED");
});
test("contract checks right-hand bar confirmation and rejects unconfirmed pivot",()=>{
  const s=scenario();
  const m15=aggregateClosedM5(s.data,{timeframe:"M15",family:"forex"}).complete;
  const early=frozenM15Pivot(m15,{direction:1,sweepStart:BASE+8*900000});
  assert.equal(early,null);
});
test("M15 gaps prevent stale pivot reuse across discontinuous runs",()=>{
  const s=scenario();
  const m15=aggregateClosedM5(s.data,{timeframe:"M15",family:"forex"}).complete;
  const sliced=m15.filter(x=>x.openedAt!==BASE+12*900000);
  const pivot=frozenM15Pivot(sliced,{direction:1,sweepStart:s.c2.openedAt});
  assert.equal(pivot,null);
});
test("reject mismatched historical C2 rather than combining unrelated OHLC",()=>{
  const s=scenario();
  const bad={...s.c2,low:s.c2.low-0.5};
  const r=inspectMssM15({candlesM5:s.data,c1:s.c1,c2:bad,family:"forex"});
  assert.equal(r.state,"INCOMPLETE_OR_DIFFERENT_H4");
});
test("cycle identity includes provider, symbol, C1 timestamp and direction",()=>{
  const s=scenario(),r=evalMSS(s);
  assert.equal(r.cycleId,"OFFLINE_FIXTURE|EURUSD|"+s.c1.openedAt+"|1");
});
