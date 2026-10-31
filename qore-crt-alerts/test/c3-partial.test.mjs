import test from "node:test";
import assert from "node:assert/strict";
import {replayCycle} from "../src/replay-cycle.mjs";
import {aggregateClosedM5} from "../src/aggregate.mjs";
const FIRST=Date.parse("2026-10-30T05:00:00Z"),FIVE=300000;
function fixture({c3Count=3,breakInC3=true,invalidC3=false}={}){
  const out=[];
  for(let i=0;i<96+c3Count;i++){
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;} // C1 range
    if(i===21){high=106;low=94;} // M5 and M15 swing
    if(i===48){low=89;high=104;} // strict sweep C2
    if(i===96&&breakInC3){high=109;close=108;}
    if(i===97&&breakInC3){high=109;close=108;}
    if(i===98&&breakInC3){high=109;close=108;}
    if(invalidC3&&i===143){low=87;close=88;}
    const openedAt=FIRST+i*FIVE;
    out.push({provider:"QA_FIXTURE",instrumentId:"EURUSD",openedAt,
      closedAt:openedAt+FIVE,open:100,high,low,close});
  }
  return out;
}
test("C3 M5/M15 may confirm during first 15 minutes without closing C3 H4",()=>{
  const r=replayCycle({candlesM5:fixture(),c1Start:FIRST,family:"forex"});
  assert.equal(r.crt.state,"C2_RATIFIED_AWAITING_C3");
  assert.equal(r.mssM5.state,"MSS_CONFIRMED_C3");
  assert.equal(r.mssM15.state,"MSS_CONFIRMED_C3");
  assert.equal(r.mssM5.mssAt,FIRST+97*FIVE);
  assert.equal(r.mssM15.mssAt,FIRST+99*FIVE);
  assert.equal(r.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
  assert.equal(r.confluence.sendPush,false);
});
test("three closed C3 M5 are needed for a completed M15 MSS",()=>{
  const r=replayCycle({candlesM5:fixture({c3Count:2}),c1Start:FIRST,family:"forex"});
  assert.equal(r.mssM5.state,"MSS_CONFIRMED_C3");
  assert.equal(r.mssM15.state,"MSS_NOT_CONFIRMED");
  assert.equal(r.confluence.state,"AWAITING_MSS_M15");
});
test("C3 M5/M15 events must not be found in the preceding C2 window",()=>{
  const a=replayCycle({candlesM5:fixture({c3Count:0}),c1Start:FIRST,family:"forex"});
  assert.equal(a.mssM5.state,"MSS_NOT_CONFIRMED");
  assert.equal(a.mssM15.state,"MSS_NOT_CONFIRMED");
  assert.equal(a.confluence.state,"AWAITING_MSS_M15");
});
test("C3 late H4 close below sweep invalidates the whole cycle",()=>{
  const data=fixture({c3Count:48,invalidC3:true});
  const r=replayCycle({candlesM5:data,c1Start:FIRST,family:"forex"});
  assert.equal(r.crt.state,"C3_INVALIDATED");
  assert.equal(r.confluence.state,"CRT_NOT_VALID");
  assert.equal(r.sendPush,false);
});
test("future C4 events cannot be misassigned to C3 after its 4h window",()=>{
  const bars=fixture({c3Count:51,breakInC3:false});
  for(let i=144;i<147;i++)bars[i]={...bars[i],high:109,close:108};
  const r=replayCycle({candlesM5:bars,c1Start:FIRST,family:"forex"});
  assert.equal(r.mssM5.state,"MSS_NOT_CONFIRMED");
  assert.equal(r.mssM15.state,"MSS_NOT_CONFIRMED");
});
test("C3 invalidation is not inferred from a temporary low wick during its formation",()=>{
  const bars=fixture();
  bars[96]={...bars[96],low:87};
  const r=replayCycle({candlesM5:bars,c1Start:FIRST,family:"forex"});
  assert.equal(r.crt.state,"C2_RATIFIED_AWAITING_C3");
  assert.equal(r.mssM15.state,"MSS_CONFIRMED_C3");
  assert.equal(r.sendPush,false);
});
