import test from "node:test";
import assert from "node:assert/strict";
import {buildBlockedCrtMssInboxEvents} from "../src/qa-market-alert-bridge.mjs";
import {replayClosedM5IntoBlockedInbox} from "../src/qa-replay-to-android-inbox.mjs";

const c1=1793336400000, sweep=c1+5*3600000, rat=c1+8*3600000;
const m5At=rat+300000, m15At=rat+900000;
const cycleId=["IC","USDCAD",c1,1].join("|");
const base=()=>({
  instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
  direction:1,c1StartMs:c1,sweepAtMs:sweep,c2RatifiedAtMs:rat,
  sourcePhaseMin:0,observedAtMs:rat+1800000,coreCrt:true,
  m5:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
    cycleId,pivotAtMs:sweep-900000,breakAtMs:m5At,breakPrice:1.38215},
  m15:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
    cycleId,pivotAtMs:sweep-1800000,breakAtMs:m15At,
    lastClosedAtMs:m15At,breakPrice:1.38340}
});
test("CRT alert is pending and does not reveal prices of future MSS",()=>{
 const x=buildBlockedCrtMssInboxEvents(base());
 assert.equal(x.length,3);
 assert.equal(x[0].eventType,"CRT_OBSERVED");
 assert.equal(x[0].mssM5,"AWAITING");
 assert.equal(x[0].mssM15,"AWAITING");
 assert.equal(x[0].mssM5AtMs,undefined);
 assert.equal(x[0].mssM15Price,undefined);
 assert.equal(x[1].mssM5AtMs,m5At);
 assert.equal(x[1].mssM5Price,"1.38215");
 assert.equal(x[1].mssM15AtMs,undefined);
 assert.equal(x[2].mssM5AtMs,m5At);
 assert.equal(x[2].mssM15AtMs,m15At);
 assert.equal(x[2].mssM15Price,"1.3834");
 assert.ok(x.every(v=>v.sendPush===false && v.transport==="DISABLED"));
});
test("fabricated MSS price, wrong source and wrong cycle cannot produce confirmation details",()=>{
 const a=base();
 const noPrice=buildBlockedCrtMssInboxEvents({...a,m5:{...a.m5,breakPrice:-4}});
 assert.equal(noPrice[1].mssM5Price,undefined);
 const cross=buildBlockedCrtMssInboxEvents({...a,m5:{...a.m5,cycleId:"IC|EURUSD|123|1"}});
 assert.equal(cross.some(e=>e.eventType==="MSS_M5_OBSERVED"),false);
 assert.throws(()=>buildBlockedCrtMssInboxEvents({...a,tvSymbol:"OANDA:USDCAD"}));
});
const start=Date.parse("2026-10-30T05:00:00Z"),five=300000;
function bars(){
 const rows=[];
 for(let i=0;i<96;i++){
  let high=102,low=97,close=100;
  if(i===0){high=110;low=90;}
  if(i===21){high=106;low=94;}
  if(i===48){high=104;low=89;}
  if(i===49){high=109;close=108;}
  if(i===50){high=109;close=108;}
  const openedAt=start+i*five;
  rows.push({provider:"IC",instrumentId:"EURUSD",openedAt,closedAt:openedAt+five,
    open:100,high,low,close});
 }
 return rows;
}
test("replay attaches only the exact closed M5 candle price for each MSS",()=>{
 const candlesM5=bars();
 const result=replayClosedM5IntoBlockedInbox({instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",
   c1StartMs:start,candlesM5});
 assert.equal(result.status,"REPLAY_EVENTS_QUARANTINED");
 for(const event of result.events.filter(e=>e.eventType.startsWith("MSS_"))){
  const tf=event.eventType==="MSS_M5_OBSERVED"?"M5":"M15";
  const evidenceAt=event["mss"+tf+"AtMs"];
  const proofPrice=event["mss"+tf+"Price"];
  const bar=candlesM5.find(x=>x.closedAt===evidenceAt);
  assert.ok(bar,"evidence timestamp must match exact M5 close");
  assert.equal(proofPrice,String(bar.close));
  assert.equal(event.sendPush,false);
 }
});
