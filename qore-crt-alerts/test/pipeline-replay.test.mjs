import test from "node:test";
import assert from "node:assert/strict";
import {replayCycle} from "../src/replay-cycle.mjs";
const start=Date.parse("2026-10-30T05:00:00Z"),FIVE=300000;
function generate({m15Break=true}={}){
  const candles=[];
  for(let i=0;i<96;i++){
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;}
    if(i===21){high=106;low=94;}
    if(i===48){high=104;low=89;}
    if(i===49){high=109;close=108;}
    if(i===50&&m15Break){high=109;close=108;}
    const openedAt=start+i*FIVE;
    candles.push({provider:"OFFLINE_FIXTURE",instrumentId:"EURUSD",openedAt,
      closedAt:openedAt+FIVE,open:100,high,low,close});
  }
  return candles;
}
test("end-to-end offline M5 -> H4/M15 -> CRT -> both MSS -> same-cycle gate",()=>{
  const result=replayCycle({candlesM5:generate(),c1Start:start,family:"forex"});
  assert.equal(result.state,"REPLAY_EVALUATED");
  assert.equal(result.crt.state,"C2_RATIFIED_AWAITING_C3");
  assert.equal(result.mssM5.state,"MSS_CONFIRMED_C2");
  assert.equal(result.mssM15.state,"MSS_CONFIRMED_C2");
  assert.equal(result.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
  assert.equal(result.confluence.actionable,false);
  assert.equal(result.sendPush,false);
  assert.equal(result.confluence.mssM15At,start+48*FIVE+3*FIVE);
  assert.equal(result.confluence.mssM5At,start+48*FIVE+2*FIVE);
});
test("M5-only break is never upgraded to M15 confluence",()=>{
  const x=replayCycle({candlesM5:generate({m15Break:false}),c1Start:start,family:"forex"});
  assert.equal(x.mssM5.state,"MSS_CONFIRMED_C2");
  assert.equal(x.mssM15.state,"MSS_NOT_CONFIRMED");
  assert.equal(x.confluence.state,"AWAITING_MSS_M15");
});
test("one missing M5 prevents C1 certification at all integration layers",()=>{
  const data=generate();data.splice(11,1);
  const r=replayCycle({candlesM5:data,c1Start:start,family:"forex"});
  assert.equal(r.state,"INCOMPLETE_C1_C2");
  assert.equal(r.sendPush,false);
});
test("same M5 replay and retransmissions produce identical cycle signal ID",()=>{
  const data=generate(),a=replayCycle({candlesM5:data,c1Start:start,family:"forex"});
  const b=replayCycle({candlesM5:[...data,data[48],data[49]],c1Start:start,family:"forex"});
  assert.equal(a.confluence.signalId,b.confluence.signalId);
});
