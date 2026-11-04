import test from "node:test";
import assert from "node:assert/strict";
import {buildBlockedCrtMssInboxEvents,BlockedQaInbox} from "../src/qa-market-alert-bridge.mjs";
const c1=1793336400000,sweep=c1+5*3600000,rat=c1+8*3600000;
const m5At=rat+300000,m15At=rat+900000;
const cycleId=["IC","USDCAD",c1,1].join("|");
const good=()=>({
  instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
  direction:1,c1StartMs:c1,sweepAtMs:sweep,c2RatifiedAtMs:rat,
  sourcePhaseMin:0,observedAtMs:rat+1800000,coreCrt:true,
  m5:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
      cycleId,pivotAtMs:sweep-900000,breakAtMs:m5At},
  m15:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
      cycleId,pivotAtMs:sweep-1800000,breakAtMs:m15At,
      lastClosedAtMs:m15At}
});
test("separate CRT, MSS M5 and MSS M15 events identify exact pair and family",()=>{
 const a=buildBlockedCrtMssInboxEvents(good());
 assert.deepEqual(a.map(x=>x.eventType),
  ["CRT_OBSERVED","MSS_M5_OBSERVED","MSS_M15_OBSERVED"]);
 for(const x of a){
  assert.equal(x.instrumentId,"USDCAD");
  assert.equal(x.tvSymbol,"IC:USDCAD");
  assert.equal(x.family,"CRT_2C_RETURN");
  assert.equal(x.sendPush,false);
  assert.equal(x.transport,"DISABLED");
  assert.equal(x.deliveryState,"BLOCKED_NOT_CERTIFIED");
  assert.equal(x.actionable,false);
 }
 assert.equal(a[0].mssM5,"AWAITING", "later M5 must not leak into CRT time");
 assert.equal(a[0].mssM15,"AWAITING", "later M15 must not leak into CRT time");
 assert.equal(a[1].mssM15,"AWAITING", "M5 event cannot see later M15");
 assert.equal(a[2].mssM5,"CONFIRMED", "M15 can show earlier M5");
});
test("M5 alone is not projected as an M15",()=>{
 const a=buildBlockedCrtMssInboxEvents({...good(),m15:{}});
 assert.deepEqual(a.map(x=>x.eventType),["CRT_OBSERVED","MSS_M5_OBSERVED"]);
 assert.equal(a[0].mssM15,"AWAITING");
});
test("unapproved Multi4 QA can be observed but cannot claim invented MSS",()=>{
 const a=buildBlockedCrtMssInboxEvents({...good(),family:"MULTI4",
   coreCrt:false,extraStructuralQa:true,c2RatifiedAtMs:undefined});
 assert.deepEqual(a.map(x=>x.eventType),["CRT_OBSERVED"]);
 assert.equal(a[0].mssM5,"UNVERIFIED");
 assert.equal(a[0].mssM15,"UNVERIFIED");
});
test("wrong broker, unsupported pair and fabricated cycle rejected",()=>{
 assert.throws(()=>buildBlockedCrtMssInboxEvents({...good(),tvSymbol:"OANDA:USDCAD"}));
 assert.throws(()=>buildBlockedCrtMssInboxEvents({...good(),instrumentId:"FAKE"}));
 assert.throws(()=>buildBlockedCrtMssInboxEvents({...good(),family:"BUY NOW"}));
 assert.throws(()=>buildBlockedCrtMssInboxEvents({...good(),c2RatifiedAtMs:sweep-1}));
 const a=buildBlockedCrtMssInboxEvents({...good(),m15:{...good().m15,cycleId:"IC|EURUSD|DIFFERENT|1"}});
 assert.equal(a.some(x=>x.eventType==="MSS_M15_OBSERVED"),false);
});
test("QA inbox deduplicates retransmissions and quarantines contradictory events",()=>{
 const inbox=new BlockedQaInbox();
 const a=buildBlockedCrtMssInboxEvents(good())[0];
 assert.equal(inbox.record(a).state,"QA_RECORDED_NO_DELIVERY");
 assert.equal(inbox.record(a).state,"DUPLICATE_HELD");
 assert.equal(inbox.record({...a,family:"MULTI4"}).state,"QA_RECORDED_NO_DELIVERY");
 assert.equal(inbox.record({...a,mssM5:"CONFIRMED"}).state,"CONFLICT_HELD");
 assert.equal(inbox.count,2);
 assert.deepEqual(inbox.list().map(x=>x.family).sort(),["CRT_2C_RETURN","MULTI4"]);
 assert.throws(()=>inbox.record({...a,sendPush:true}));
 assert.throws(()=>inbox.record({...a,certification:"STAGING_APPROVED"}));
});

test("wire event identity is exactly backend broker prefix expected by Android V2",()=>{
 const a=buildBlockedCrtMssInboxEvents(good());
 assert.equal(a[0].eventId,
  "IC|USDCAD|"+c1+"|1|CRT_OBSERVED|"+rat);
 assert.equal(a[1].eventId,
  "IC|USDCAD|"+c1+"|1|MSS_M5_OBSERVED|"+m5At);
 assert.equal(a[2].eventId,
  "IC|USDCAD|"+c1+"|1|MSS_M15_OBSERVED|"+m15At);
});

test("causal event snapshots allow MSS already confirmed before C2 close",()=>{
 const root=good();
 const earlyM5=sweep+300000;
 const a=buildBlockedCrtMssInboxEvents({
  ...root,m5:{...root.m5,breakAtMs:earlyM5},
  m15:{} 
 });
 assert.equal(a[0].mssM5,"CONFIRMED");
 assert.equal(a[0].mssM15,"AWAITING");
 assert.equal(a[1].eventAtMs,earlyM5);
});
