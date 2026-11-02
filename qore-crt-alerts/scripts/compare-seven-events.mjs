#!/usr/bin/env node
// Offline QA only: no access to TradingView, broker or Firebase APIs.
import {readFileSync} from "node:fs";
import {compareSevenCrtEventTraces34} from "../src/crt-seven-category-event-parity.mjs";
const [file]=process.argv.slice(2);
if(!file){
 process.stderr.write("Usage: npm run parity:events -- /path/to/34-source-evidence.json\n");
 process.stderr.write("Requires independently captured Pine and Trader Lab events, not mask-only snapshots.\n");
 process.exitCode=2;
}else{
 try{
  const input=JSON.parse(readFileSync(file,"utf8"));
  const result=compareSevenCrtEventTraces34(input);
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  // 0 means comparative QA candidate ONLY. Never live certification.
  process.exitCode=result.status==="ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED"?0:1;
 }catch(error){
  process.stderr.write("EVENT QA BLOCKED: "+error.message+"\n");
  process.exitCode=2;
 }
}
