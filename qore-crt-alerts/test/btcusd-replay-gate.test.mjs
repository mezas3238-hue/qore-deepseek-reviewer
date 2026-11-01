import test from "node:test";
import assert from "node:assert/strict";
import {replayCycle} from "../src/replay-cycle.mjs";
import {createReplayObservation} from "../src/observation-ledger.mjs";
const FIVE=300000,START=Date.parse("2026-10-31T05:00:00Z"); // Sat 01 NY
const bars=(n=144)=>{
 const a=Array.from({length:n},(_,i)=>({
  provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
  openedAt:START+i*FIVE,closedAt:START+(i+1)*FIVE,
  open:100,high:101,low:99,close:100
 }));
 // C1 range [98, 102]. Pre-sweep confirmed M15 pivot 101.7.
 if(n>0)a[0].high=102;
 if(n>1)a[1].low=98;
 for(const i of [30,31,32])if(i<n)a[i].high=101.7;
 // C2 strictly sweeps C1 low and closes within [98, 102].
 if(n>54)a[54].low=97;
 // MSS M15 closes strictly above frozen swing after C2 sweep.
 if(n>65){a[65].high=101.9;a[65].close=101.8;}
 return a;
};
test("approved BTC Forex NY cycle: C1 01, C2 05, C3 09, MSS M15 C2",()=>{
 const r=replayCycle({candlesM5:bars(),c1Start:START,family:"crypto"});
 assert.equal(r.state,"REPLAY_EVALUATED");
 assert.equal(r.family,"crypto");
 assert.equal(r.instrumentId,"BTCUSD");
 assert.equal(r.c1Schedule,"FOREX_NY_OWNER_APPROVED");
 assert.equal(r.crt.state,"C3_NOT_INVALIDATED");
 assert.equal(r.crt.direction,1);
 assert.equal(r.mssM15.state,"MSS_CONFIRMED_C2");
 assert.equal(r.mssM15.timeframe,"M15");
 assert.equal(r.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
 assert.equal(r.confluence.instrumentId,"BTCUSD");
 assert.equal(r.actionable,false);assert.equal(r.sendPush,false);
 assert.equal(r.confluence.sendPush,false);
});
test("C3 H4 close beyond C2 wick invalidates even if C2 MSS was seen",()=>{
 const a=bars();
 a[143].low=96.5;a[143].close=96.8;
 const r=replayCycle({candlesM5:a,c1Start:START,family:"crypto"});
 assert.equal(r.crt.state,"C3_INVALIDATED");
 assert.equal(r.mssM15.state,"CRT_INVALIDATED_C3");
 assert.equal(r.confluence.state,"CRT_NOT_VALID");
 assert.equal(r.actionable,false);assert.equal(r.sendPush,false);
});
test("weekend BTC incomplete history cannot fake confirmed C3",()=>{
 const r=replayCycle({candlesM5:bars(143),c1Start:START,family:"crypto"});
 assert.equal(r.state,"REPLAY_EVALUATED");
 assert.equal(r.crt.state,"C2_RATIFIED_AWAITING_C3");
 assert.equal(r.actionable,false);
 assert.equal(r.sendPush,false);
});
test("no C1/C2 source, wrong C1 hour, and market opening gaps fail safely",()=>{
 const r=replayCycle({candlesM5:bars(47),c1Start:START,family:"crypto"});
 assert.equal(r.state,"INCOMPLETE_C1_C2");assert.equal(r.sendPush,false);
 const bad=replayCycle({candlesM5:bars(240),c1Start:START+96*FIVE,
   family:"crypto"});
 assert.equal(bad.crt?.state??bad.state,"INVALID_CYCLE");
 const hole=bars().filter((_,i)=>i!==54);
 const missing=replayCycle({candlesM5:hole,c1Start:START,family:"crypto"});
 assert.equal(missing.state,"INCOMPLETE_C1_C2");
});
test("a valid offline BTC replay stays an immutable, non-sendable observation",()=>{
 const r=replayCycle({candlesM5:bars(),c1Start:START,family:"crypto"});
 assert.equal(r.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
 assert.throws(()=>createReplayObservation({replay:r,audit:{}}),
   /audit of identical M5/);
 assert.equal(r.confluence.actionable,false);
 assert.equal(r.confluence.sendPush,false);
});


test("BTCUSD weekend overnight NY 21 -> 01 -> 05 remains valid and M15-linked",()=>{
 // Sat Nov 7 21 NY EST -> Sun Nov 8 02:00 UTC, no DST fold.
 const target=Date.parse("2026-11-08T02:00:00Z");
 const offset=target-START;
 const m5=bars().map(b=>({...b,
   openedAt:b.openedAt+offset,closedAt:b.closedAt+offset}));
 const r=replayCycle({candlesM5:m5,c1Start:target,family:"crypto"});
 assert.equal(r.state,"REPLAY_EVALUATED");
 assert.equal(r.crt.state,"C3_NOT_INVALIDATED");
 assert.equal(r.mssM15.state,"MSS_CONFIRMED_C2");
 assert.equal(r.confluence.state,"REPLAY_CRT_M15_CONFLUENCE");
 assert.equal(r.actionable,false);assert.equal(r.sendPush,false);
});
test("ambiguous BTC DST fallback 01 NY cannot produce a CRT replay",()=>{
 const target=Date.parse("2026-11-01T05:00:00Z");
 const offset=target-START;
 const m5=bars(60).map(b=>({...b,
   openedAt:b.openedAt+offset,closedAt:b.closedAt+offset}));
 const r=replayCycle({candlesM5:m5,c1Start:target,family:"crypto"});
 assert.equal(r.state,"INCOMPLETE_C1_C2");
 assert.equal(r.sendPush,false);
});
