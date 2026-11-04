#!/usr/bin/env node
// Takes ONLY the local sanitized output of the Python view-only probe.
// Requires local owner mapping and DEMO account environment. No token reads,
// market transport, FCM, trade requests, or promise of IC/OANDA parity.
import {readFileSync} from "node:fs";
import {auditSanitizedCtraderProbe} from "../src/ctrader-probe-coverage-qa.mjs";

try {
  if(process.argv.length<3||process.argv.length>4)
    throw Error("USAGE: node scripts/qa-ctrader-viewonly-34.mjs PROBE.json [OWNER_MAP.json]");
  const [,,probePath,mappingPath]=process.argv;
  const id=process.env.QORE_CT_DEMO_ACCOUNT_ID;
  const brokerName=process.env.QORE_CT_BROKER_LABEL;
  if(!id||!/^[1-9][0-9]{0,17}$/.test(id)||!brokerName)
    throw Error("LOCAL_DEMO_ACCOUNT_AND_BROKER_LABEL_REQUIRED");
  const read=(path)=>JSON.parse(readFileSync(path,"utf8"));
  const report=read(probePath);
  const mappings=mappingPath?read(mappingPath):[];
  if(!Array.isArray(mappings))
    throw Error("OWNER_MAP_MUST_BE_ARRAY");
  const result=auditSanitizedCtraderProbe({
    snapshot:report,
    account:{ctidTraderAccountId:Number(id),isLive:false,
      brokerName},approvedMappings:mappings
  });
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
} catch(_error) {
  // Never print file paths or runtime errors that could contain credentials.
  console.error("QORE_CTRADER_34_AUDIT_BLOCKED: invalid local report/configuration");
  process.exitCode=1;
}
