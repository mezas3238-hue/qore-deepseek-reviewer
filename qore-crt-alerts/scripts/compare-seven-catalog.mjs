#!/usr/bin/env node
// Read-only CLI. Requires TWO independently produced evidence snapshots:
// Trader Lab and TradingView Pine v6. Never sends alerts or places orders.
import {readFileSync} from "node:fs";
import {compareSevenCrtCategories34} from "../src/crt-seven-category-parity-audit.mjs";
const [inputFile]=process.argv.slice(2);
if(!inputFile){
 process.stderr.write("Usage: npm run parity:seven -- full-34-evidence.json\n");
 process.stderr.write("No capture? Parity cannot be certified. Never use fixture tests as evidence.\n");
 process.exitCode=2;
}else{
 try{
  const data=JSON.parse(readFileSync(inputFile,"utf8"));
  const result=compareSevenCrtCategories34(data);
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  process.exitCode=result.status==="CATALOG_34_MASKS_MATCH_BUT_UNCERTIFIED"?0:1;
 }catch(err){
  process.stderr.write("CATALOG QA BLOCKED: "+err.message+"\n");
  process.exitCode=2;
 }
}
