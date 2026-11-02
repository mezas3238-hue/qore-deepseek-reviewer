import test from "node:test";
import assert from "node:assert/strict";
import {freezeFamilyPivot,confirmFamilyMss15,M15MS} from "../src/crt-family-mss15-causal.mjs";
const t=Date.parse("2026-11-02T06:00:00Z"),M5=300_000,H4=14_400_000;
const base={provider:"COINBASE",instrumentId:"BTCUSD",model:"CRT_INSIDE_BAR",
 c1Start:t-H4,terminalH4Start:t,direction:1};
const pivot={provider:"COINBASE",instrumentId:"BTCUSD",at:t-2*M15MS,
 confirmedAt:t-M15MS,price:110};
const frozen=(options={})=>{
 const {candidate:overrideCandidate,pivot:overridePivot,...other}=options;
 return freezeFamilyPivot({
  candidate:{...base,...overrideCandidate},pivot:{...pivot,...overridePivot},
  sweepAt:t+5*M5,sweepEndM5:t+6*M5,strictLow:true,strictHigh:false,...other
 });
};
const b=(i,c,provider="COINBASE")=>({
 provider,instrumentId:"BTCUSD",timeframe:"M15",
 openedAt:t+i*M15MS,closedAt:t+(i+1)*M15MS,
 open:c,high:c+2,low:c-2,close:c
});
const confirm=(f,series,override={})=>confirmFamilyMss15({
 frozen:f,closedM15:series,observedUntil:series.at(-1)?.closedAt||t+H4,
 ratifiedH4At:t+H4,...override
});
test("Inside keeps frozen pre-sweep pivot and confirms only subsequent M15 close crossing",()=>{
 const f=frozen();
 assert.equal(f.state,"AWAITING_M15_CLOSE");
 assert.equal(f.pivotAt,pivot.at);
 const prior=b(1,109),after=b(2,112);
 const result=confirm(f,[prior,after]);
 assert.equal(result.state,"MSS_M15_CONFIRMED_QA");
 assert.equal(result.mssAt,after.closedAt);
 assert.equal(result.actionable,false);assert.equal(result.sendPush,false);
});
test("Multi-N is separately identified, not inherited from Inside or classic CRT",()=>{
 const f=frozen({candidate:{model:"CRT_MULTICANDLE",c1Start:t-3*H4}});
 assert.equal(f.state,"AWAITING_M15_CLOSE");
 const r=confirm(f,[b(1,109),b(2,112)]);
 assert.equal(r.state,"MSS_M15_CONFIRMED_QA");
 assert.ok(r.eventId.includes("CRT_MULTICANDLE"));
 assert.equal(r.c1Start,t-3*H4);
});
test("no M15 confirmation without real crossing AFTER strict sweep",()=>{
 assert.equal(confirm(frozen(),[b(1,111),b(2,112)]).state,"AWAITING_MSS_M15");
 assert.equal(confirm(frozen(),[b(1,109),b(2,109)]).state,"AWAITING_MSS_M15");
 assert.equal(confirm(frozen(),[b(1,111),b(2,109)]).state,"AWAITING_MSS_M15");
});
test("rejects pivot formed or confirmed at/after manipulation, opposite direction or double sweep",()=>{
 for(const options of [
  {pivot:{at:t+M5}},
  {pivot:{confirmedAt:t+10*M5}},
  {pivot:{provider:"OTHER"}},
  {strictHigh:true},
  {strictLow:false},
  {candidate:{direction:-1}}
 ]) assert.equal(frozen(options).state,"REJECTED_NO_CAUSAL_PIVOT");
});
test("cross-provider and stale/out-of-order M15 fail closed",()=>{
 const f=frozen();
 for(const series of [
  [b(1,109),b(2,112,"OTHER")],
  [b(0,109),b(2,112)],
  [b(2,112),b(1,109)]
 ]) assert.equal(confirm(f,series).state,"REJECTED_FEED_OR_CONTINUITY");
 assert.equal(confirm(f,[b(1,109),b(2,112)],{observedUntil:t+2*M15MS}).state,"REJECTED_FEED_OR_CONTINUITY");
 assert.equal(confirm(f,[b(1,109),b(2,112)],{dataGap:true}).state,"REJECTED_CYCLE_OR_GAP");
});
test("no MSS claim until H4 closed and ratified in same terminal window",()=>{
 const f=frozen();
 assert.equal(confirm(f,[b(1,109),b(2,112)],{ratifiedH4At:null}).state,"REJECTED_UNRATIFIED_H4");
 assert.equal(confirm(f,[b(1,109),b(2,112)],{ratifiedH4At:t+2*H4}).state,"REJECTED_UNRATIFIED_H4");
});
test("last complete M15 must be after sweep and exactly aligned",()=>{
 const f=frozen();
 const after=b(2,112);
 assert.equal(after.closedAt%M15MS,0);
 const misplaced={...after,closedAt:after.closedAt+M5};
 assert.equal(confirm(f,[b(1,109),misplaced]).state,"REJECTED_FEED_OR_CONTINUITY");
});
test("ratification without crossing must not create entry or send Android notification",()=>{
 const r=confirm(frozen(),[b(1,109),b(2,109)]);
 assert.equal(r.state,"AWAITING_MSS_M15");
 assert.equal(r.actionable,false);assert.equal(r.sendPush,false);
});
