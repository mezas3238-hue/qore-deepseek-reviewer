import test from "node:test";
import assert from "node:assert/strict";
import {QaFourHourInbox,ALERT_LIFETIME_MS} from "../src/qa-four-hour-inbox.mjs";
import {buildBlockedCrtMssInboxEvents} from "../src/qa-market-alert-bridge.mjs";

const c1=1793336400000,sweep=c1+5*3600000,rat=c1+8*3600000;
const m5At=rat+300000,m15At=rat+900000;
const cycleId=["IC","USDCAD",c1,1].join("|");
function events(){
 return buildBlockedCrtMssInboxEvents({
  instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",family:"CRT_2C_RETURN",
  direction:1,c1StartMs:c1,sweepAtMs:sweep,c2RatifiedAtMs:rat,
  sourcePhaseMin:0,observedAtMs:rat+1800000,coreCrt:true,
  m5:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
      cycleId,pivotAtMs:sweep-900000,breakAtMs:m5At},
  m15:{provider:"IC",instrumentId:"USDCAD",direction:1,c1StartMs:c1,
       cycleId,pivotAtMs:sweep-1800000,breakAtMs:m15At,
       lastClosedAtMs:m15At}
 });
}
test("TTL exactly 4 hours from event closure, not when inserted or fetched",()=>{
 const inbox=new QaFourHourInbox(),crt=events()[0],now=crt.eventAtMs+60000;
 const staged=inbox.stage(crt,{nowMs:now});
 assert.equal(ALERT_LIFETIME_MS,14_400_000);
 assert.equal(staged.state,"QA_STAGED_4H");
 assert.equal(staged.confirmedAtMs,crt.eventAtMs);
 assert.equal(staged.expiresAtMs,crt.eventAtMs+ALERT_LIFETIME_MS);
 assert.equal(inbox.active({nowMs:now}).length,1);
 const later=crt.eventAtMs+ALERT_LIFETIME_MS-1;
 assert.equal(inbox.active({nowMs:later})[0].remainingMs,1);
 assert.equal(inbox.active({nowMs:later+1}).length,0);
 assert.equal(inbox.stagingCount,0);
 assert.equal(inbox.stage(crt,{nowMs:later+1}).state,"EXPIRED_NOT_RECORDED");
});
test("CRT, MSS M5 and MSS M15 each get their own 4-hour clock",()=>{
 const inbox=new QaFourHourInbox(),rows=events(),now=rat+1_200_000;
 assert.deepEqual(rows.map(x=>x.eventType),["CRT_OBSERVED","MSS_M5_OBSERVED","MSS_M15_OBSERVED"]);
 const staged=rows.map(x=>inbox.stage(x,{nowMs:now}));
 assert.ok(staged.every(x=>x.state==="QA_STAGED_4H"));
 assert.deepEqual(staged.map(x=>x.expiresAtMs),rows.map(x=>x.eventAtMs+ALERT_LIFETIME_MS));
 assert.equal(new Set(staged.map(x=>x.expiresAtMs)).size,3);
 assert.equal(inbox.active({nowMs:now}).length,3);
 assert.equal(inbox.active({nowMs:now})[0].actionable,false);
 assert.equal(inbox.active({nowMs:now})[0].sendPush,false);
});
test("duplicate cannot renew a 4-hour clock; conflicting report held",()=>{
 const inbox=new QaFourHourInbox(),row=events()[0],now=row.eventAtMs+20_000;
 const x=inbox.stage(row,{nowMs:now});
 assert.equal(inbox.stage(row,{nowMs:now+30_000}).state,"DUPLICATE_NOT_RENOTIFIED");
 const conflicting={...row,mssM5:"CONFIRMED"};
 assert.equal(inbox.stage(conflicting,{nowMs:now+30_000}).state,"CONFLICT_HELD");
 assert.equal(inbox.stagingCount,1);
 assert.equal(inbox.active({nowMs:now+100_000})[0].expiresAtMs,x.expiresAtMs);
});
test("early structural invalidation removes alert immediately but holds a tombstone until original expiry",()=>{
 const inbox=new QaFourHourInbox(),row=events()[0],now=row.eventAtMs+60_000;
 const staged=inbox.stage(row,{nowMs:now});
 assert.equal(inbox.invalidate({scopedKey:staged.scopedKey,nowMs:now+30_000}).state,"INVALIDATED_EARLY");
 assert.equal(inbox.active({nowMs:now+30_000}).length,0);
 assert.equal(inbox.stage(row,{nowMs:now+60_000}).state,"DUPLICATE_NOT_RENOTIFIED");
 assert.equal(inbox.invalidate({scopedKey:staged.scopedKey,nowMs:now+90_000}).state,"ALREADY_INVALIDATED");
 assert.equal(inbox.sweep({nowMs:staged.expiresAtMs}).state,"QA_EXPIRED_PURGED");
 assert.equal(inbox.stagingCount,0);
});
test("future event, stale event, live-claim and broker mutation all rejected",()=>{
 const inbox=new QaFourHourInbox(),event=events()[0],now=event.eventAtMs;
 assert.equal(inbox.stage(event,{nowMs:now-1}).state,"FUTURE_OR_MISSING_CONFIRMATION");
 assert.equal(inbox.stage(event,{nowMs:now+ALERT_LIFETIME_MS}).state,"EXPIRED_NOT_RECORDED");
 assert.equal(inbox.stage({...event,sendPush:true},{nowMs:now}).state,"INVALID_QA_EVIDENCE");
 assert.equal(inbox.stage({...event,certification:"STAGING_APPROVED"},{nowMs:now}).state,"INVALID_QA_EVIDENCE");
 assert.equal(inbox.stage({...event,tvSymbol:"OANDA:USDCAD"},{nowMs:now}).state,"INVALID_QA_EVIDENCE");
 assert.equal(inbox.stage(event,{nowMs:0}).state,"INVALID_SERVER_CLOCK");
 assert.throws(()=>inbox.active({nowMs:0}),/INVALID_SERVER_CLOCK/);
});
test("bounded store does not evict a still-valid alert just to accept another",()=>{
 const inbox=new QaFourHourInbox({maxEvents:1}),[first,second]=events();
 const now=second.eventAtMs+500;
 assert.equal(inbox.stage(first,{nowMs:now}).state,"QA_STAGED_4H");
 assert.equal(inbox.stage(second,{nowMs:now}).state,"INBOX_CAPACITY_BLOCKED");
 assert.equal(inbox.stagingCount,1);
 assert.equal(inbox.active({nowMs:now})[0].eventId,first.eventId);
});
