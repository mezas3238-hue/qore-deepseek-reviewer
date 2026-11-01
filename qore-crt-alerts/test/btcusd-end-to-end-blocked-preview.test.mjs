import test from "node:test";
import assert from "node:assert/strict";
import {ClosedM5Ingestion} from "../src/closed-m5-ingestion.mjs";
import {replayCycle} from "../src/replay-cycle.mjs";
import {buildBackendAudit} from "../src/parity-audit.mjs";
import {createReplayObservation,ReplayObservationLedger}
  from "../src/observation-ledger.mjs";
import {createBlockedAndroidPreview} from "../src/notification-preview.mjs";

const FIVE=300000,START=Date.parse("2026-10-31T05:00:00Z");
const provider="BTC_STAGING_FIXTURE",feedSymbol="BTCUSD.QA_NATIVE";
const sourceId="btc-ny-forex-hour-saturday-test-20261031";
function fixture(n=100){
 const out=[];
 for(let i=0;i<n;i++){
   const high=i===0?102:i===30||i===31||i===32?101.7:
     i===65?101.9:101;
   const low=i===1?98:i===54?97:99;
   const close=i===65?101.8:100;
   out.push({provider,instrumentId:"BTCUSD",feedSymbol,
     openedAt:START+i*FIVE,closedAt:START+(i+1)*FIVE,
     open:100,high,low,close});
 }
 return out;
}
function feed(){
 return new ClosedM5Ingestion({provider,instrumentId:"BTCUSD",feedSymbol,
   finalityLagMs:1000,maxBars:240,mode:"OFFLINE_REPLAY"});
}
function process(bars=fixture()){
 const intake=feed();
 for(const bar of bars){
   const outcome=intake.ingest(bar,{receivedAt:bar.closedAt+1000});
   if(outcome.state!=="CLOSED_M5_ACCEPTED")
     return {state:outcome.state,intake};
 }
 const candlesM5=intake.snapshot();
 const d={candlesM5,c1Start:START,family:"crypto",sourceId};
 const replay=replayCycle(d),audit=buildBackendAudit(d);
 return {state:"EVALUATED",intake,replay,audit};
}
test("BTC 24x7: 100 M5 -> CRT C2 -> MSS M15 -> audit -> ledger -> Android blocked preview",()=>{
 const {intake,replay,audit}=process();
 assert.equal(intake.snapshot().length,100);
 assert.equal(replay.crt.state,"C2_RATIFIED_AWAITING_C3");
 assert.equal(replay.mssM15.state,"MSS_CONFIRMED_C2");
 assert.equal(replay.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
 assert.equal(audit.status,"READY_FOR_PINE_REFERENCE");
 assert.equal(audit.family,"crypto");
 const observation=createReplayObservation({replay,audit});
 const ledger=new ReplayObservationLedger();
 assert.equal(ledger.record(observation).state,"QUARANTINED_RECORDED");
 assert.equal(ledger.record(observation).state,"DUPLICATE_IGNORED");
 assert.equal(ledger.count,1);
 const preview=createBlockedAndroidPreview(observation);
 assert.equal(preview.data.instrumentId,"BTCUSD");
 assert.equal(preview.data.direction,"BULLISH");
 assert.equal(preview.data.kind,"CRT_MSS");
 assert.equal(preview.data.timeframe,"M15");
 assert.equal(preview.data.eventId,observation.eventKey);
 assert.equal(preview.data.ohlcSha256,observation.ohlcSha256);
 assert.equal(preview.data.certified,"false");
 assert.equal(preview.transport,"DISABLED");
 assert.equal(preview.deliverable,false);
 assert.equal(preview.sendPush,false);
});
test("BTCUSD incomplete C2 cannot write an observation or Android payload",()=>{
 const {replay,audit}=process(fixture(95));
 assert.equal(replay.state,"INCOMPLETE_C1_C2");
 assert.equal(audit.status,"BACKEND_INCOMPLETE");
 assert.throws(()=>createReplayObservation({replay,audit}),/non-actionable/);
});
test("BTCUSD mismatched OHLC in previous candle permanently holds intake",()=>{
 const intake=feed(),bars=fixture();
 for(const bar of bars.slice(0,55))
   assert.equal(intake.ingest(bar,{receivedAt:bar.closedAt+1000}).state,
    "CLOSED_M5_ACCEPTED");
 const modified={...bars[54],low:96};
 assert.equal(intake.ingest(modified,{receivedAt:modified.closedAt+1000}).state,
  "CONFLICT_HELD");
 assert.equal(intake.ingest(bars[55],{
   receivedAt:bars[55].closedAt+1000}).state,
   "HELD_REQUIRES_MANUAL_RECONCILIATION");
 assert.equal(intake.health().sendPush,false);
});
test("BTCUSD disabled Android preview rejects modified/quarantined event",()=>{
 const {replay,audit}=process();
 const obs=createReplayObservation({replay,audit});
 assert.throws(()=>createBlockedAndroidPreview({...obs,sendPush:true}),/blocked/);
 assert.throws(()=>createBlockedAndroidPreview({...obs,
  eventKey:obs.eventKey.replace("|BTCUSD|","|EURUSD|")}),/identity/);
});
