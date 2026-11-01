import test from "node:test";
import assert from "node:assert/strict";
import {replayCycle} from "../src/replay-cycle.mjs";
import {buildBackendAudit} from "../src/parity-audit.mjs";
import {createReplayObservation,ReplayObservationLedger,
 REPLAY_DELIVERY_BLOCK} from "../src/observation-ledger.mjs";
const start=Date.parse("2026-10-30T05:00:00Z"),FIVE=300000;
function scenario(){
  const candlesM5=[];
  for(let i=0;i<96;i++){
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;}
    if(i===21){high=106;low=94;}
    if(i===48){low=89;}
    if(i===49){high=109;close=108;}
    if(i===50){high=109;close=108;}
    const openedAt=start+i*FIVE;
    candlesM5.push({provider:"TEST_FIXTURE",instrumentId:"EURUSD",openedAt,
     closedAt:openedAt+FIVE,open:100,high,low,close});
  }
  return {candlesM5,c1Start:start,family:"forex",sourceId:"fixture-immutable-v1"};
}
function evidence(d=scenario()){
  const replay=replayCycle(d),audit=buildBackendAudit(d);
  return {replay,audit,record:createReplayObservation({replay,audit})};
}
test("only genuine same-engine replay observations are accepted",()=>{
 const e=evidence();
 assert.equal(e.record.status,"QUARANTINED_REPLAY");
 assert.equal(e.record.deliveryState,REPLAY_DELIVERY_BLOCK);
 assert.equal(e.record.sendPush,false);
 assert.equal(e.record.actionable,false);
 assert.equal(e.record.mssM15AtMs,e.replay.confluence.mssM15At);
});
test("the same event is idempotent even when M5 duplicate packets replay",()=>{
 const d=scenario(),a=evidence(d).record;
 const b=evidence({...d,candlesM5:[...d.candlesM5,d.candlesM5[50]]}).record;
 assert.deepEqual(b,a);
 const ledger=new ReplayObservationLedger();
 assert.equal(ledger.record(a).state,"QUARANTINED_RECORDED");
 assert.equal(ledger.record(b).state,"DUPLICATE_IGNORED");
 assert.equal(ledger.count,1);
 assert.equal(ledger.list().length,1);
});
test("same signal with different OHLC evidence is held as a conflict",()=>{
 const d=scenario(),recordA=evidence(d).record;
 d.candlesM5[20]={...d.candlesM5[20],high:103};
 const recordB=evidence(d).record;
 assert.equal(recordA.eventKey,recordB.eventKey);
 assert.notEqual(recordA.fingerprint,recordB.fingerprint);
 const ledger=new ReplayObservationLedger();
 ledger.record(recordA);
 assert.equal(ledger.record(recordB).state,"CONFLICT_HELD_FOR_REVIEW");
 assert.equal(ledger.count,1);
 assert.deepEqual(ledger.get(recordA.eventKey),recordA);
});
test("cannot record M5-only preliminary observation",()=>{
 const d=scenario();d.candlesM5[50]={...d.candlesM5[50],close:100};
 const replay=replayCycle(d),audit=buildBackendAudit(d);
 assert.equal(replay.confluence.state,"AWAITING_MSS_M15");
 assert.throws(()=>createReplayObservation({replay,audit}),/only held-offline/);
});
test("cannot record unaudited or forged identity results",()=>{
 const {replay,audit}=evidence();
 assert.throws(()=>createReplayObservation({replay,audit:null}),/audit/);
 assert.throws(()=>createReplayObservation({replay,audit:{...audit,provider:"OTHER"}}),/identity/);
 assert.throws(()=>createReplayObservation({replay,audit:{...audit,candleSha256:"bad"}}),/audit/);
});
test("actionable or sendPush booleans can never be granted",()=>{
 const {replay,audit}=evidence();
 assert.throws(()=>createReplayObservation({replay:{...replay,sendPush:true},audit}),/non-actionable/);
 assert.throws(()=>createReplayObservation({replay:{...replay,confluence:
  {...replay.confluence,actionable:true}},audit}),/held-offline/);
 const ledger=new ReplayObservationLedger();
 assert.throws(()=>ledger.record({...evidence().record,sendPush:true}),/quarantined/);
});
test("tampered observation field or claimed fingerprint cannot enter ledger",()=>{
 const a=evidence().record,ledger=new ReplayObservationLedger();
 assert.throws(()=>ledger.record({...a,mssM15AtMs:a.mssM15AtMs+900000}),/integrity/);
 assert.throws(()=>ledger.record({...a,fingerprint:"f".repeat(64)}),/integrity/);
 assert.equal(ledger.count,0);
});
test("ledger read results do not grant mutable write access",()=>{
 const ledger=new ReplayObservationLedger(),a=evidence().record;
 ledger.record(a);
 assert.ok(Object.isFrozen(ledger.get(a.eventKey)));
 assert.ok(Object.isFrozen(ledger.list()));
 assert.equal(ledger.get("missing"),null);
});
test("outbox record creation is deterministic across processes and replays",()=>{
 const a=evidence().record,b=evidence().record;
 assert.equal(a.eventKey,b.eventKey);
 assert.equal(a.fingerprint,b.fingerprint);
 assert.equal(a.ohlcSha256,b.ohlcSha256);
});
test("two distinct M15 events keep distinct keys and do not overwrite",()=>{
 const ledger=new ReplayObservationLedger(),a=evidence().record;
 ledger.record(a);
 const event={...a,eventKey:a.eventKey+"-fake",fingerprint:"f".repeat(64)};
 assert.throws(()=>ledger.record(event),/integrity/);
 assert.equal(ledger.count,1);
});
