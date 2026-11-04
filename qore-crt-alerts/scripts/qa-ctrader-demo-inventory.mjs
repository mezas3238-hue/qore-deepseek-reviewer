#!/usr/bin/env node
// Offline report for an owner-approved DEMO symbol export.
// No OAuth credentials, secrets, connection, trading, Firebase or push.
// Usage: npm run audit:ctrader-demo -- ./safe-inventory.json
import {readFileSync} from "node:fs";
import {evaluateCtrader34Coverage} from "../src/ctrader-readonly-m5-qa.mjs";

if(process.argv.length!==3){
  console.error("USAGE: npm run audit:ctrader-demo -- ./safe-inventory.json");
  process.exitCode=2;
} else {
  try{
    const file=JSON.parse(readFileSync(process.argv[2],"utf8"));
    if(!file||typeof file!=="object"||Array.isArray(file)||
       Object.keys(file).some(k=>/token|password|secret|oauth|apiKey/i.test(k)))
      throw Error("CREDENTIAL_FIELD_FORBIDDEN");
    const result=evaluateCtrader34Coverage(file);
    // Redact account ID from output; rows remain QA-only.
    process.stdout.write(JSON.stringify({
      mode:result.mode,status:result.status,brokerName:result.brokerName,
      coverage:result.coverage,rows:result.rows,
      canSendPush:false,canTrade:false,
      note:"POTENTIAL BROKER SYMBOLS ARE NOT TV-IDENTICAL FEEDS; NO FCM"
    },null,2)+"\n");
  }catch(error){
    console.error("CTRADER_INVENTORY_QA_FAIL_CLOSED:",error.message);
    process.exitCode=1;
  }
}
