#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {auditTraderLab34Preflight} from "../src/trader-lab-crt-34-gate.mjs";

const filepath=new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url);
const manifest=JSON.parse(readFileSync(filepath,"utf8"));
const report=auditTraderLab34Preflight(manifest);
process.stdout.write(JSON.stringify(report,null,2)+"\n");

// In CI we deliberately EXPECT a holdout BLOCK. This only certifies that
// absent real BTC / license / preregistration CANNOT be laundered into PASS.
// A real release must use the default (fail-closed) invocation without args.
if(process.argv.includes("--expect-blocked")){
 if(report.verdict!=="BLOCKED_HOLDOUT"||report.metadata_present!==33||
    report.missing_sources.join(",")!=="BTCUSD")process.exitCode=1;
}else if(report.verdict!=="READY_TO_REQUEST_PRIVATE_REPLAY"){
 process.exitCode=2;
}
