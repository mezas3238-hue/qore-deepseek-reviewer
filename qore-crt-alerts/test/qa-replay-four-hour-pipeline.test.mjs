import test from "node:test";
import assert from "node:assert/strict";
import {replayClosedM5IntoFourHourQa} from "../src/qa-replay-four-hour-pipeline.mjs";
import {QaFourHourInbox,ALERT_LIFETIME_MS} from "../src/qa-four-hour-inbox.mjs";

const start=Date.parse("2026-10-30T05:00:00Z"),FIVE=300000;
function candles({gap=false,provider="IC"}={}){
 const rows=[];
 for(let i=0;i<96;i++){
  let high=102,low=97,close=100;
  if(i===0){high=110;low=90;}
  if(i===21){high=106;low=94;}
  if(i===48){high=104;low=89;}
  if(i===49){high=109;close=108;}
  if(i===50){high=109;close=108;}
  const openedAt=start+i*FIVE;
  rows.push({provider,instrumentId:"EURUSD",openedAt,closedAt:openedAt+FIVE,
   open:100,high,low,close});
 }
 if(gap)rows.splice(11,1);
 return rows;
}
const args=()=>({instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",
 c1StartMs:start,candlesM5:candles(),nowMs:start+96*FIVE});
test("real offline M5 replay stages independent 4h CRT/MSS notices, never push",()=>{
 const inbox=new QaFourHourInbox();
 const r=replayClosedM5IntoFourHourQa({...args(),inbox});
 assert.equal(r.state,"QA_REPLAY_4H_STAGED");
 assert.equal(r.sendPush,false);
 assert.equal(r.actionable,false);
 assert.equal(r.realMarketData,false);
 assert.equal(r.outcomes.length,3);
 assert.ok(r.stored>=1,"at least last replay events must still be fresh");
 assert.ok(r.outcomes.every(x=>x.transport==="DISABLED"));
 assert.ok(r.active.every(x=>x.expiresAtMs===x.eventAtMs+ALERT_LIFETIME_MS));
 assert.ok(r.active.every(x=>x.actionable===false&&x.sendPush===false));
 const second=replayClosedM5IntoFourHourQa({...args(),inbox});
 assert.equal(second.stored,0);
 assert.ok(second.outcomes.some(x=>x.state==="DUPLICATE_NOT_RENOTIFIED"));
 assert.equal(inbox.active({nowMs:start+96*FIVE+ALERT_LIFETIME_MS}).length,0);
});
test("missing closed M5 or wrong broker prevents any alert staging",()=>{
 const bad=replayClosedM5IntoFourHourQa({...args(),
   candlesM5:candles({gap:true})});
 assert.equal(bad.state,"REPLAY_REJECTED");
 assert.equal(bad.stored,0);
 assert.equal(bad.active.length,0);
 const other=replayClosedM5IntoFourHourQa({...args(),
   candlesM5:candles({provider:"OANDA"})});
 assert.equal(other.state,"REPLAY_REJECTED");
 assert.equal(other.active.length,0);
});
test("never turn replay into an actionable event or use an impossible clock",()=>{
 assert.throws(()=>replayClosedM5IntoFourHourQa({...args(),nowMs:-1}),
  /FOUR_HOUR_QA_INBOX_AND_CLOCK_REQUIRED/);
});
