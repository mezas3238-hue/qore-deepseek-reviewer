#!/usr/bin/env node
// Offline QA triage of persisted sanitized real IC Markets DEMO M5 gap data.
// Never calls broker, orders, Firebase or TradingView.
import {readFileSync} from "node:fs";
import {auditRealIc34SessionGapObservations}
 from "../src/qa-ic34-published-session-gap-triage.mjs";
const fixture=JSON.parse(readFileSync(new URL(
 "../fixtures/real-ic34-600-m5-gap-observations-20261107.json",
 import.meta.url),"utf8"));
const outcome=auditRealIc34SessionGapObservations(fixture);
const output={
 state:outcome.state,
 marketsReviewed:outcome.marketsReviewed,
 closedM5Reviewed:outcome.closedM5Reviewed,
 observedGapEvents:outcome.observedGapEvents,
 observedMissingM5:outcome.observedMissingM5,
 publishedWindowCandidates:outcome.publishedWindowCandidates,
 publishedWindowCandidateMissingM5:outcome.publishedWindowCandidateMissingM5,
 unresolvedGapEvents:outcome.unresolvedGapEvents,
 unresolvedMissingM5:outcome.unresolvedMissingM5,
 unresolvedSymbols:outcome.rows.filter(x=>x.unresolved>0)
  .map(x=>({id:x.instrumentId,unresolved:x.unresolved,
   missingM5Bars:x.cases.filter(y=>!y.candidateRule)
    .reduce((sum,y)=>sum+y.missingM5Intervals,0)})),
 all34SessionCalendarsCertified:false,
 sourceParityCertified:false,crtFamiliesCertified:false,
 mssM5Certified:false,mssM15Certified:false,
 canTrade:false,sendPush:false
};
process.stdout.write(JSON.stringify(output)+"\n");
