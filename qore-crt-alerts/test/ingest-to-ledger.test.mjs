import test from "node:test";
import assert from "node:assert/strict";
import {ClosedM5Ingestion} from "../src/closed-m5-ingestion.mjs";
import {replayCycle} from "../src/replay-cycle.mjs";
import {buildBackendAudit} from "../src/parity-audit.mjs";
import {ReplayObservationLedger,createReplayObservation}
  from "../src/observation-ledger.mjs";
const C1=Date.parse("2026-10-30T05:00:00Z"),M5=300000;
function dataset(){
  const events=[];
  for(let i=0;i<96;i++){
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;}
    if(i===21){high=106;low=94;}
    if(i===48){low=89;}
    if(i===49){high=109;close=108;}
    if(i===50){high=109;close=108;}
    const openedAt=C1+i*M5;
    events.push({provider:"FIXTURE_INGEST",instrumentId:"EURUSD",
      feedSymbol:"EURUSD.NATIVE_QA",openedAt,closedAt:openedAt+M5,
      open:100,high,low,close});
  }
  return events;
}
function start(){
 return new ClosedM5Ingestion({provider:"FIXTURE_INGEST",instrumentId:"EURUSD",
  feedSymbol:"EURUSD.NATIVE_QA",maxBars:200,finalityLagMs:1000});
}
const upload=(ing,e)=>ing.ingest(e,{receivedAt:e.closedAt+1000});
function evaluate(ing){
 const d={candlesM5:ing.snapshot(),c1Start:C1,
  sourceId:"frozen-fixture-feed-20261030",family:"forex"};
 const replay=replayCycle(d),audit=buildBackendAudit(d);
 return {d,replay,audit};
}
test("offline full path M5 intake -> CRT -> M15 MSS -> SHA audit -> quarantined ledger",()=>{
 const ing=start();
 for(const e of dataset())assert.equal(upload(ing,e).state,"CLOSED_M5_ACCEPTED");
 const {replay,audit}=evaluate(ing);
 assert.equal(replay.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
 const observation=createReplayObservation({replay,audit});
 const ledger=new ReplayObservationLedger();
 assert.equal(ledger.record(observation).state,"QUARANTINED_RECORDED");
 assert.equal(ledger.record(observation).state,"DUPLICATE_IGNORED");
 assert.equal(ledger.count,1);
 assert.equal(observation.sendPush,false);
 assert.equal(observation.deliveryState,"BLOCKED_NOT_CERTIFIED");
});
test("M15 C2 provisional crossing cannot be observed before H4 C2 closes",()=>{
 const ing=start(),bars=dataset();
 for(const e of bars.slice(0,50))upload(ing,e);
 const r=evaluate(ing);
 assert.equal(r.replay.state,"INCOMPLETE_C1_C2");
 assert.equal(r.audit.status,"BACKEND_INCOMPLETE");
 assert.throws(()=>createReplayObservation(r),/non-actionable/);
});
test("forming final M5 cannot be smuggled into a published CRT",()=>{
 const ing=start(),bars=dataset();
 for(const e of bars.slice(0,95))upload(ing,e);
 const last=bars[95];
 assert.equal(ing.ingest(last,{receivedAt:last.closedAt}).state,"CANDLE_NOT_FINAL");
 assert.equal(evaluate(ing).replay.state,"INCOMPLETE_C1_C2");
});
test("conflicting duplicated OHLC blocks downstream progression immediately",()=>{
 const ing=start(),bars=dataset();
 for(const e of bars.slice(0,60))upload(ing,e);
 assert.equal(upload(ing,{...bars[59],high:110}).state,"CONFLICT_HELD");
 for(const e of bars.slice(60))assert.equal(upload(ing,e).state,
  "HELD_REQUIRES_MANUAL_RECONCILIATION");
 assert.equal(evaluate(ing).replay.state,"INCOMPLETE_C1_C2");
});
test("incorrect feed symbols never enter the 34-slot replay inventory",()=>{
 const ing=start();
 assert.equal(upload(ing,{...dataset()[0],feedSymbol:"IC:EURUSD"}).state,
  "SOURCE_MAPPING_REJECTED");
 assert.equal(ing.snapshot().length,0);
});
