import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 classifyPublishedSessionGapCandidate,
 auditRealIc34SessionGapObservations
} from "../src/qa-ic34-published-session-gap-triage.mjs";
const fixture=JSON.parse(readFileSync(new URL(
 "../fixtures/real-ic34-600-m5-gap-observations-20261107.json",
 import.meta.url),"utf8"));
const utc=x=>Date.parse(x);
test("real 34×600-M5 QA observations are complete, timestamp-preserved and not certified",()=>{
 const r=auditRealIc34SessionGapObservations(fixture);
 assert.equal(r.state,"CTRADER_IC34_PUBLISHED_SESSION_GAP_TRIAGE_QA_ONLY");
 assert.equal(r.marketsReviewed,34);
 assert.equal(r.closedM5Reviewed,20400);
 assert.equal(r.observedGapEvents,21);
 assert.equal(r.observedMissingM5,151);
 assert.equal(r.publishedWindowCandidates,13);
 assert.equal(r.publishedWindowCandidateMissingM5,132);
 assert.equal(r.unresolvedGapEvents,8);
 assert.equal(r.unresolvedMissingM5,19);
 assert.equal(r.rows.length,34);
 assert.equal(r.rows.filter(x=>x.gapEvents>0).length,13);
 assert.equal(r.rows.find(x=>x.instrumentId==="BTCUSD").unresolved,1);
 assert.equal(r.rows.find(x=>x.instrumentId==="BTCUSD").candidates,3);
 assert.equal(r.rows.find(x=>x.instrumentId==="XAUUSD").candidates,2);
 assert.equal(r.rows.find(x=>x.instrumentId==="NDX100").candidates,2);
 assert.equal(r.rows.find(x=>x.instrumentId==="EURUSD").gapEvents,0);
 assert.equal(r.all34SessionCalendarsCertified,false);
 assert.equal(r.sourceParityCertified,false);
 assert.equal(r.crtFamiliesCertified,false);
 assert.equal(r.mssM5Certified,false);
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.canTrade,false);assert.equal(r.sendPush,false);
});
test("actual index/metals break is a published-hours candidate only",()=>{
 for(const group of ["INDICES","METALS"]){
  const out=classifyPublishedSessionGapCandidate({
   group,instrumentId:group==="INDICES"?"NDX100":"XAUUSD",
   leftClosedAtMs:utc("2026-11-05T22:00:00.000Z"),
   nextOpenedAtMs:utc("2026-11-05T23:00:00.000Z"),
   missingM5Intervals:12
  });
  assert.equal(out.state,"PUBLISHED_SCHEDULE_MATCH_CANDIDATE_QA");
  assert.equal(out.platformSessionCertified,false);
  assert.equal(out.sourceParityCertified,false);
  assert.equal(out.sendPush,false);
 }
});
test("NY DST summer changes UTC but not the published server hour candidate",()=>{
 const winter=classifyPublishedSessionGapCandidate({
  group:"INDICES",instrumentId:"SPX500",
  leftClosedAtMs:utc("2026-11-05T22:00:00Z"),
  nextOpenedAtMs:utc("2026-11-05T23:00:00Z"),
  missingM5Intervals:12
 });
 const summer=classifyPublishedSessionGapCandidate({
  group:"INDICES",instrumentId:"SPX500",
  leftClosedAtMs:utc("2026-07-07T21:00:00Z"),
  nextOpenedAtMs:utc("2026-07-07T22:00:00Z"),
  missingM5Intervals:12
 });
 assert.equal(winter.state,"PUBLISHED_SCHEDULE_MATCH_CANDIDATE_QA");
 assert.equal(summer.state,"PUBLISHED_SCHEDULE_MATCH_CANDIDATE_QA");
});
test("BTC weekend window candidate and unexplained Saturday maintenance stay separate",()=>{
 const documented=classifyPublishedSessionGapCandidate({
  group:"BTC_INDEPENDENT",instrumentId:"BTCUSD",
  leftClosedAtMs:utc("2026-11-06T21:55:00Z"),
  nextOpenedAtMs:utc("2026-11-06T22:45:00Z"),
  missingM5Intervals:10
 });
 assert.equal(documented.candidateRule,
   "PUBLISHED_BTC_FRIDAY_SATURDAY_SERVER_WINDOW");
 const unexplained=classifyPublishedSessionGapCandidate({
  group:"BTC_INDEPENDENT",instrumentId:"BTCUSD",
  leftClosedAtMs:utc("2026-11-07T09:25:00Z"),
  nextOpenedAtMs:utc("2026-11-07T10:15:00Z"),
  missingM5Intervals:10
 });
 assert.equal(unexplained.state,"UNEXPLAINED_BY_PUBLISHED_WINDOW_QA");
 assert.equal(unexplained.platformSessionCertified,false);
});
test("Forex isolated one-five-minute gaps are not called broker session holidays",()=>{
 const out=classifyPublishedSessionGapCandidate({
  group:"FOREX",instrumentId:"GBPUSD",
  leftClosedAtMs:utc("2026-11-05T22:10:00Z"),
  nextOpenedAtMs:utc("2026-11-05T22:15:00Z"),
  missingM5Intervals:1
 });
 assert.equal(out.state,"UNEXPLAINED_BY_PUBLISHED_WINDOW_QA");
 assert.equal(out.canTrade,false);
});
test("wrong historical manifest, lost row, manipulated counts or bar timestamp are rejected",()=>{
 for(const modified of [
  {...fixture,manifestSha256:"not original"},
  {...fixture,rows:fixture.rows.slice(1)},
  {...fixture,closedM5Total:20401},
  {...fixture,rows:fixture.rows.map((r,i)=>i===0?{...r,symbolId:900}:r)},
  {...fixture,rows:fixture.rows.map((r,i)=>i===3?
     {...r,missingM5Bars:r.missingM5Bars+1}:r)},
  {...fixture,rows:fixture.rows.map((r,i)=>i===3?
     {...r,gapsSample:r.gapsSample.map((g,j)=>j===0?
       {...g,nextOpenedAtMs:g.nextOpenedAtMs+60000}:g)}:r)}
 ])assert.throws(()=>auditRealIc34SessionGapObservations(modified),
   /CRT_IC34_QA/);
});
