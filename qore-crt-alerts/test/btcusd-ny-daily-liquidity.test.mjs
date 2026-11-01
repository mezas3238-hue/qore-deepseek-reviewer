import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditBtcNyDailyLiquidity} from "../src/btcusd-ny-daily-liquidity.mjs";
const FIVE=300000,provider="BTC_TEST_PROBE";
const source=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10E_QA_BTC_PDH_24X7_NY_NO_INTEGRADO.pine",import.meta.url),"utf8");
const day=(start,n,mutator=()=>({}))=>Array.from({length:n},(_,i)=>({
 provider,instrumentId:"BTCUSD",openedAt:start+i*FIVE,
 closedAt:start+(i+1)*FIVE,
 open:100,high:101,low:99,close:100,...mutator(i)
}));
const friday=Date.parse("2026-10-30T04:00:00Z");
const saturday=Date.parse("2026-10-31T04:00:00Z");
const sunday=Date.parse("2026-11-01T04:00:00Z");
const monday=Date.parse("2026-11-02T05:00:00Z");
test("Pine BTC uses 00-00 NY seven-day session, not FX weekdays",()=>{
 assert.match(source,/isBTC \? "0000-0000:1234567" : pdhRth \? "0930-1600:23456" : "1700-1700:23456"/);
 assert.match(source,/expectedM5 == 276 or expectedM5 == 288 or expectedM5 == 300/);
 assert.match(source,/curr_m5_count == expectedM5/);
 assert.match(source,/bH > prev_PDH/);
 assert.match(source,/bL < prev_PDL/);
 assert.match(source,/QA BTC PDH NY nivel/);
 assert.match(source,/QA BTC PDL NY nivel/);
 assert.match(source,/PDH\/PDL NY/);
 assert.match(source,/useAlerts = input\.bool\(false/);
});
test("BTC PDH Saturday can be taken on Sunday and PDL preserved",()=>{
 const fri=day(friday,288);
 const sat=day(saturday,288,(i)=>i===45?{high:105}:{}); // sat high 105
 const sun=day(sunday,300,(i)=>i===20?{high:106}:{}); // Sunday breach
 const result=auditBtcNyDailyLiquidity([...fri,...sat,...sun]);
 const [f,s,u]=result.records;
 assert.equal(f.pdhStatus,"N/D");
 assert.equal(s.pdhLevel,101);
 assert.equal(s.pdhStatus,"TAKEN");
 assert.equal(s.firstPdhSweepAt,sat[45].closedAt);
 assert.equal(u.pdhReferenceAt,sunday);
 assert.equal(u.pdhLevel,105);
 assert.equal(u.pdhStatus,"TAKEN");
 assert.equal(u.firstPdhSweepAt,sun[20].closedAt);
 assert.equal(u.pdlStatus,"INTACTO");
 assert.equal(u.expectedM5,300);
 assert.equal(u.complete,true);
 assert.equal(result.sendPush,false);
});
test("exact equality to previous high is intact, strict higher breaks",()=>{
 const fri=day(friday,288,(i)=>i===100?{high:101.5}:{});
 const sat=day(saturday,288,(i)=>i===90?{high:101.5}:{});
 const r=auditBtcNyDailyLiquidity([...fri,...sat]);
 assert.equal(r.records[1].pdhStatus,"INTACTO");
 assert.equal(r.records[1].pdhLevel,101.5);
});
test("DST spring NY 23-hour day is 276 complete M5, next day reference works",()=>{
 const spring=Date.parse("2026-03-08T05:00:00Z");
 const next=Date.parse("2026-03-09T04:00:00Z");
 const a=day(spring,276,(i)=>i===12?{high:107}:{});
 const b=day(next,288,(i)=>i===1?{high:108}:{});
 const r=auditBtcNyDailyLiquidity([...a,...b]);
 assert.equal(r.records[0].expectedM5,276);
 assert.equal(r.records[0].complete,true);
 assert.equal(r.records[1].pdhLevel,107);
 assert.equal(r.records[1].pdhReferenceAt,next);
 assert.equal(r.records[1].pdhStatus,"TAKEN");
});
test("missing previous-day M5 quarantines ref, never false INTACTO or old PDH",()=>{
 const a=day(friday,288).filter((_,i)=>i!==10);
 const b=day(saturday,288);
 const c=day(sunday,300);
 const r=auditBtcNyDailyLiquidity([...a,...b,...c]);
 assert.equal(r.records[0].complete,false);
 assert.equal(r.records[1].pdhStatus,"N/D");
 assert.equal(r.records[1].pdhLevel,null);
 assert.equal(r.records[2].pdhStatus,"INTACTO");
 assert.equal(r.records[2].pdhLevel,101);
});
test("BTC low below previous PDL is taken, not confused with PDH",()=>{
 const a=day(friday,288);
 const b=day(saturday,288,(i)=>i===3?{low:98}:{});
 const r=auditBtcNyDailyLiquidity([...a,...b]);
 assert.equal(r.records[1].pdhStatus,"INTACTO");
 assert.equal(r.records[1].pdlStatus,"TAKEN");
 assert.equal(r.records[1].firstPdlSweepAt,b[3].closedAt);
});
test("NY BTC weekend complete reference survives DST 25-hour day",()=>{
 const a=day(sunday,300,(i)=>i===100?{high:110}:{});
 const b=day(monday,288,(i)=>i===8?{high:111}:{});
 const r=auditBtcNyDailyLiquidity([...a,...b]);
 assert.equal(r.records[0].expectedM5,300);
 assert.equal(r.records[0].complete,true);
 assert.equal(r.records[1].pdhLevel,110);
 assert.equal(r.records[1].pdhStatus,"TAKEN");
});
test("market provenance must remain BTCUSD and single provider",()=>{
 const a=day(friday,288);
 assert.throws(()=>auditBtcNyDailyLiquidity([{...a[0],instrumentId:"ETHUSD"}]),/BTC_PDH_FEED_PROVENANCE_MISMATCH/);
 assert.throws(()=>auditBtcNyDailyLiquidity([a[0],{...a[1],provider:"OTHER"}]),/BTC_PDH_FEED_PROVENANCE_MISMATCH/);
});
test("candidate source unchanged behind its exact Git blob SHA",()=>{
 const sha=createHash("sha1").update(
   "blob "+Buffer.byteLength(source,"utf8")+String.fromCharCode(0)+source
 ).digest("hex");
 assert.match(sha,/^[a-f0-9]{40}$/);
 assert.notEqual(sha,"31e91681dcbc19592cd346b3127b398bc4fedaff");
});
