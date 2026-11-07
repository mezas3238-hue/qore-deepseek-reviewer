// QA-only classification of observed IC Markets DEMO M5 gaps against
// public IC Markets Global *indicative* trading-hours windows.
// Not an attestation of the exact platform session on any historical day.
// Source: https://www.icmarkets-global.com/en/trading-pricing/trading-hours
// Says platform account specifications have the most accurate details.
// NEVER fills missing candles, shifts UTC timestamps, certifies CRT/MSS,
// triggers orders, or publishes mobile alerts.
import {OBSERVED_IC34_CANDIDATES,COHORT34_MANIFEST_SHA256}
 from "./qa-ctrader-full34-m5-cohort.mjs";
const M5_MS=300000;
const nyFormat=new Intl.DateTimeFormat("en-US",{
 timeZone:"America/New_York",year:"numeric",month:"2-digit",
 day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
});
function publishedServerLocal(utcMs){
 if(!Number.isSafeInteger(utcMs)||utcMs<=0||utcMs%M5_MS!==0)
  throw Error("CRT_IC34_QA_GAP_TIMESTAMP_INVALID");
 const parts=Object.fromEntries(nyFormat.formatToParts(
  new Date(utcMs)).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
 if(["year","month","day","hour","minute"].some(x=>
    !Number.isInteger(parts[x])))
  throw Error("CRT_IC34_QA_NY_CLOCK_INVALID");
 // Public IC Global says server GMT+2/+3; NY close-aligned server is
 // 7 hours ahead of America/New_York. Candidate ONLY; may vary by account.
 const serverMs=Date.UTC(parts.year,parts.month-1,parts.day,
  parts.hour,parts.minute)+7*3600000;
 const d=new Date(serverMs);
 return Object.freeze({
  day:d.getUTCDay(),minute:d.getUTCHours()*60+d.getUTCMinutes(),
  serverDate:d.toISOString().slice(0,10)
 });
}
export function classifyPublishedSessionGapCandidate({
 group,instrumentId,leftClosedAtMs,nextOpenedAtMs,missingM5Intervals
}={}){
 if(!["FOREX","METALS","INDICES","BTC_INDEPENDENT"].includes(group)||
    !Number.isSafeInteger(leftClosedAtMs)||
    !Number.isSafeInteger(nextOpenedAtMs)||
    !Number.isSafeInteger(missingM5Intervals)||
    missingM5Intervals<=0||
    (nextOpenedAtMs-leftClosedAtMs)!==missingM5Intervals*M5_MS)
  throw Error("CRT_IC34_QA_GAP_OBSERVATION_INVALID");
 const start=publishedServerLocal(leftClosedAtMs);
 const end=publishedServerLocal(nextOpenedAtMs);
 let rule=null;
 if((group==="INDICES"||group==="METALS")&&
     start.minute===0&&end.minute===60&&
     start.serverDate===end.serverDate&&missingM5Intervals===12)
  rule=group==="INDICES"?
   "PUBLISHED_INDEX_0000_0100_SERVER_WINDOW":
   "PUBLISHED_METAL_0000_0100_SERVER_WINDOW";
 else if(group==="BTC_INDEPENDENT"&&instrumentId==="BTCUSD"){
  if(start.minute===0&&end.minute===5&&
     start.serverDate===end.serverDate&&missingM5Intervals===1)
   rule="PUBLISHED_BTC_DAILY_0000_0005_SERVER_WINDOW";
  else if(start.day===5&&start.minute===23*60+55&&
      end.day===6&&end.minute===45&&
      missingM5Intervals===10)
   rule="PUBLISHED_BTC_FRIDAY_SATURDAY_SERVER_WINDOW";
 }
 return Object.freeze({
  state:rule?"PUBLISHED_SCHEDULE_MATCH_CANDIDATE_QA":
   "UNEXPLAINED_BY_PUBLISHED_WINDOW_QA",
  ...(rule?{candidateRule:rule}:{}),
  leftClosedAtMs,nextOpenedAtMs,missingM5Intervals,
  platformSessionCertified:false,
  sourceParityCertified:false,canTrade:false,sendPush:false
 });
}
export function auditRealIc34SessionGapObservations(data){
 if(data?.schema!=="CTRADER_IC34_REAL_CLOSED_600_M5_GAP_FIXTURE_V1"||
    data?.manifestSha256!==COHORT34_MANIFEST_SHA256||
    data?.all34RequestedSamplesComplete!==true||
    data?.closedM5Total!==20400||
    !Array.isArray(data?.rows)||data.rows.length!==34)
  throw Error("CRT_IC34_QA_GAP_EVIDENCE_INVALID");
 let expectedMissing=0,observedEvents=0,candidates=0,unresolved=0;
 let candidateMissingM5=0,unresolvedMissingM5=0;
 const rows=data.rows.map((row,i)=>{
  const known=OBSERVED_IC34_CANDIDATES[i];
  const type=known.instrumentId==="BTCUSD"?"BTC_INDEPENDENT":
    ["NDX100","SPX500","US30"].includes(known.instrumentId)?"INDICES":
    ["XAUUSD","XAGUSD"].includes(known.instrumentId)?"METALS":"FOREX";
  if(row.slot!==i+1||row.instrumentId!==known.instrumentId||
     row.tvSymbol!==known.tvSymbol||row.symbolId!==known.nativeId||
     row.brokerNativeName!==known.nativeName||row.group!==type||
     row.closedM5!==600||row.historyPages!==2||
     row.sourceParityCertified!==false||row.canTrade!==false||
     row.sendPush!==false||!Array.isArray(row.gapsSample)||
     row.gapsTruncated!==false||
     !Number.isSafeInteger(row.missingIntervals)||
     row.missingIntervals!==row.gapsSample.length||
     !Number.isSafeInteger(row.missingM5Bars)||row.missingM5Bars<0)
   throw Error("CRT_IC34_QA_GAP_ROW_INVALID");
  const evaluated=row.gapsSample.map(g=>{
   const out=classifyPublishedSessionGapCandidate({
     group:type,instrumentId:known.instrumentId,
     leftClosedAtMs:g.leftClosedAtMs,
     nextOpenedAtMs:g.nextOpenedAtMs,
     missingM5Intervals:g.missingM5Intervals
   });
   observedEvents++;
   if(out.candidateRule){
    candidates++;candidateMissingM5+=out.missingM5Intervals;
   }else{
    unresolved++;unresolvedMissingM5+=out.missingM5Intervals;
   }
   return out;
  });
  const missing=evaluated.reduce((sum,x)=>sum+x.missingM5Intervals,0);
  if(missing!==row.missingM5Bars)
   throw Error("CRT_IC34_QA_GAP_ROW_MISSING_COUNT_MISMATCH");
  expectedMissing+=missing;
  return Object.freeze({
   slot:row.slot,instrumentId:known.instrumentId,group:type,
   observedM5:600,gapEvents:evaluated.length,missingM5Bars:missing,
   candidates:evaluated.filter(x=>!!x.candidateRule).length,
   unresolved:evaluated.filter(x=>!x.candidateRule).length,
   cases:Object.freeze(evaluated),sessionCertified:false,
   sourceParityCertified:false,canTrade:false,sendPush:false
  });
 });
 return Object.freeze({
  state:"CTRADER_IC34_PUBLISHED_SESSION_GAP_TRIAGE_QA_ONLY",
  marketsReviewed:34,closedM5Reviewed:20400,
  observedGapEvents:observedEvents,observedMissingM5:expectedMissing,
  publishedWindowCandidates:candidates,
  publishedWindowCandidateMissingM5:candidateMissingM5,
  unresolvedGapEvents:unresolved,
  unresolvedMissingM5,
  all34SessionCalendarsCertified:false,
  sourceParityCertified:false,crtFamiliesCertified:false,
  mssM5Certified:false,mssM15Certified:false,
  canTrade:false,sendPush:false,rows:Object.freeze(rows)
 });
}
