#!/usr/bin/env node
// Reproducible offline-only 7-role evidence matrix for 34 market feeds.
// IMPORTANT: exit code 0 indicates offline review completeness, NOT
// external TradingView/holdout or production certification.
import {readFileSync} from "node:fs";
import {compareSevenCrtEventTraces34}
 from "../src/crt-seven-category-event-parity.mjs";
import {assessSevenCrtReadiness}
 from "../src/crt-seven-role-certification-readiness.mjs";

const [filename]=process.argv.slice(2);
if(!filename){
 process.stderr.write("Usage: npm run certify:seven:qa -- /path/to/real-evidence.json\n");
 process.stderr.write("Requires 34 independent M5 feeds, Trader Lab event traces,\n");
 process.stderr.write("authentic Pine Editor captures and seven positive/negative control suites.\n");
 process.exitCode=2;
}else{
 try{
  const x=JSON.parse(readFileSync(filename,"utf8"));
  const eventAudit=compareSevenCrtEventTraces34(x);
  const readiness=assessSevenCrtReadiness({
   eventAudit,controlCases:x.controlCases??[]
  });
  process.stdout.write(JSON.stringify({eventAudit,readiness},null,2)+"\n");
  process.exitCode=readiness.status===
   "SEVEN_OFFLINE_ROLE_CONTROLS_COMPLETE_NEEDS_EXTERNAL_CERTIFICATION"?0:1;
 }catch(e){
  process.stderr.write("Seven-role QA blocked: "+e.message+"\n");
  process.exitCode=2;
 }
}
