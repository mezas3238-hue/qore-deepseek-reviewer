#!/usr/bin/env node
// Offline comparison utility. Never sends signals or performs API calls.
import {readFileSync} from "node:fs";
import {buildBackendAudit,comparePineToBackend} from "../src/parity-audit.mjs";

const [datasetFile,captureFile]=process.argv.slice(2);
if(!datasetFile){
  process.stderr.write("Usage: node scripts/compare-parity.mjs dataset.json [pine-capture.json]\n");
  process.exitCode=2;
}else{
  try{
    const d=JSON.parse(readFileSync(datasetFile,"utf8"));
    const evidence=buildBackendAudit({
      candlesM5:d.candlesM5,c1Start:d.c1Start,family:d.family,sourceId:d.sourceId});
    const pine=captureFile?JSON.parse(readFileSync(captureFile,"utf8")):null;
    const result=comparePineToBackend({backend:evidence,pine});
    process.stdout.write(JSON.stringify({backend:evidence,comparison:result},null,2)+"\n");
    // Only comparative diagnostic match returns 0; never production certification.
    process.exitCode=result.status==="MATCH_UNCERTIFIED"?0:
      result.status==="PARITY_MISMATCH"?1:2;
  }catch(e){
    process.stderr.write("PARITY BLOCKED: "+e.message+"\n");process.exitCode=2;
  }
}
