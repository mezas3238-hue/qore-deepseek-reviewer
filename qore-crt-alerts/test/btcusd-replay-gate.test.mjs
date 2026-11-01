import test from "node:test";
import assert from "node:assert/strict";
import {replayCycle} from "../src/replay-cycle.mjs";
import {createReplayObservation} from "../src/observation-ledger.mjs";
const FIVE=300000,START=Date.parse("2026-10-31T00:00:00Z");
const bars=(n)=>Array.from({length:n},(_,i)=>({
 provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
 openedAt:START+i*FIVE,closedAt:START+(i+1)*FIVE,
 open:70000,high:i===49?71000:70200,low:i===48?69000:69800,
 close:70010
}));
test("BTCUSD replay exposes aggregates but never creates confluence or certification",()=>{
 const r=replayCycle({candlesM5:bars(144),c1Start:START,family:"crypto"});
 assert.equal(r.completeH4,3);
 assert.equal(r.completeM15,48);
 assert.equal(r.state,"CRYPTO_C1_NOT_APPROVED");
 assert.equal(r.c1Schedule,"NOT_APPROVED");
 assert.equal(r.confluence,null);assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
 assert.throws(()=>createReplayObservation({replay:r,audit:{}}),/non-actionable/);
});
test("BTCUSD incomplete history stays not approved, no artificial C1",()=>{
 const r=replayCycle({candlesM5:bars(143),c1Start:START,family:"crypto"});
 assert.equal(r.completeH4,2);
 assert.equal(r.rejectedH4,1);
 assert.equal(r.state,"CRYPTO_C1_NOT_APPROVED");
 assert.equal(r.sendPush,false);
});
test("UTC Bitcoin replay does not accidentally enable FX family sessions",()=>{
 const r=replayCycle({candlesM5:bars(144),
  c1Start:START,family:"crypto"});
 assert.equal(r.family,"crypto");
 assert.equal(r.c1Schedule,"NOT_APPROVED");
});
