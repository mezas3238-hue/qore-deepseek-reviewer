import test from "node:test";
import assert from "node:assert/strict";
import {replayClosedM5IntoBlockedInbox} from "../src/qa-replay-to-android-inbox.mjs";
import {BlockedQaInbox} from "../src/qa-market-alert-bridge.mjs";
const start=Date.parse("2026-10-30T05:00:00Z"), FIVE=300000;
function bars({m15Break=true,missing=false,provider="IC"}={}){
 const out=[];
 for(let i=0;i<96;i++){
  let high=102,low=97,close=100;
  if(i===0){high=110;low=90;}
  if(i===21){high=106;low=94;}
  if(i===48){high=104;low=89;}
  if(i===49){high=109;close=108;}
  if(i===50&&m15Break){high=109;close=108;}
  const openedAt=start+i*FIVE;
  out.push({provider,instrumentId:"EURUSD",openedAt,closedAt:openedAt+FIVE,
    open:100,high,low,close});
 }
 if(missing)out.splice(11,1);
 return out;
}
const args=(opts={})=>({instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",
 c1StartMs:start,candlesM5:bars(opts)});
test("replay of closed M5 produces CRT + separate M5 and M15 for exact broker",()=>{
 const result=replayClosedM5IntoBlockedInbox(args());
 assert.equal(result.status,"REPLAY_EVENTS_QUARANTINED");
 assert.deepEqual(result.events.map(x=>x.eventType),[
  "CRT_OBSERVED","MSS_M5_OBSERVED","MSS_M15_OBSERVED"]);
 assert.equal(result.inboxCount,3);
 assert.ok(result.events.every(x=>x.sendPush===false&&x.actionable===false));
});
test("M5-only historical cross leaves MSS M15 awaiting, no false promotion",()=>{
 const result=replayClosedM5IntoBlockedInbox(args({m15Break:false}));
 assert.equal(result.status,"REPLAY_EVENTS_QUARANTINED");
 assert.deepEqual(result.events.map(x=>x.eventType),[
  "CRT_OBSERVED","MSS_M5_OBSERVED"]);
 assert.equal(result.events[0].mssM15,"AWAITING");
});
test("mismatch broker and incomplete source block the entire pipeline",()=>{
 assert.equal(replayClosedM5IntoBlockedInbox(args({provider:"OANDA"})).status,
  "SOURCE_NOT_IDENTICAL_OR_EMPTY");
 assert.equal(replayClosedM5IntoBlockedInbox(args({missing:true})).status,
  "NO_RATIFIED_CRT");
 assert.throws(()=>replayClosedM5IntoBlockedInbox({
  ...args(),tvSymbol:"OANDA:EURUSD"
 }));
});
test("same M5 replay never creates duplicate inbox notices",()=>{
 const inbox=new BlockedQaInbox();
 const a=replayClosedM5IntoBlockedInbox({...args(),inbox});
 const b=replayClosedM5IntoBlockedInbox({...args(),inbox});
 assert.equal(a.inboxCount,3);
 assert.equal(b.inboxCount,3);
 assert.ok(b.recordOutcomes.every(x=>x.state==="DUPLICATE_HELD"));
});
