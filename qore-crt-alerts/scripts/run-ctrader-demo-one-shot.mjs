#!/usr/bin/env node
// Manual one-shot QA source probe. Never auto-deploy or use trading scope.
// Credentials are loaded ONLY from environment, never printed or logged.
// Invoking without explicit QORE_CT_QA_PROBE owner gate fails closed.
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "../src/ctrader-demo-wss-probe-qa.mjs";

async function main(){
 let config;
 try{config=readDemoViewProbeConfig(process.env);}
 catch(e){
  process.stdout.write(JSON.stringify({state:"BLOCKED",
    reason:e?.message??"CTRADER_QA_CONFIGURATION_INVALID",
    sourceParityCertified:false,sendPush:false,canTrade:false})+"\n");
  return 2;
 }
 const data=await runAuthorizedDemoWssProbe({config});
 process.stdout.write(JSON.stringify(data)+"\n");
 return data.state==="INVENTORY_QA_ONLY"||
   data.state==="HISTORICAL_M5_QA_UNCERTIFIED"?0:3;
}
process.exitCode=await main();
