#!/usr/bin/env node
// Railway STAGING / single authorized IC Markets DEMO probe.
// NO continuous stream, NO TRADING, NO FCM, NO LIVE, no public port.
// Finishes after one proof attempt; Railway restartPolicy NEVER.
// Missing secrets are an expected, safe "not connected" state.
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
  from "../src/ctrader-demo-wss-probe-qa.mjs";

export function stagingGuard(env) {
  if(env.QORE_CT_STAGE!=="DEMO"||
      env.QORE_CT_OAUTH_SCOPE!=="accounts"||
      env.QORE_PROVIDER!=="IC"||
      env.QORE_TRADING_ENABLED!=="false"||
      env.QORE_PUSH_ENABLED!=="false"||
      env.QORE_ALERT_TTL_SECONDS!=="14400")
    return "BLOCKED_UNSAFE_STAGE_CONFIG";
  if(env.QORE_CT_QA_PROBE!=="OWNER_APPROVED_VIEW_ONLY")
    return "AWAITING_OWNER_VIEW_ONLY_AUTHORIZATION";
  const keys=["QORE_CT_CLIENT_ID","QORE_CT_CLIENT_SECRET",
    "QORE_CT_VIEW_ACCESS_TOKEN","QORE_CT_DEMO_ACCOUNT_ID",
    "QORE_CT_EXPECTED_BROKER_TITLE"];
  if(keys.some(k=>typeof env[k]!=="string"||!env[k].trim()))
    return "AWAITING_SECURE_CTRADER_CREDENTIALS";
  return "AUTHORIZED_QA_PROBE_READY";
}

export async function performStagingProbe({
  env=process.env,probe=runAuthorizedDemoWssProbe
}={}){
  const gate=stagingGuard(env);
  if(gate!=="AUTHORIZED_QA_PROBE_READY")
    return Object.freeze({state:gate,canTrade:false,sendPush:false,
      sourceParityCertified:false,connected:false});
  let cfg;
  try{cfg=readDemoViewProbeConfig(env);}
  catch{return Object.freeze({state:"BLOCKED_INVALID_DEMO_OAUTH_CONFIG",
      canTrade:false,sendPush:false,sourceParityCertified:false,
      connected:false});}
  const output=await probe({config:cfg});
  const success=output?.state==="INVENTORY_QA_ONLY"||
    output?.state==="HISTORICAL_M5_QA_UNCERTIFIED";
  // Keep response slim: no access/refresh tokens, no raw OHLC, no credentials.
  return Object.freeze({
    state:success?output.state:output?.reason||"CTRADER_QA_PROBE_FAILED",
    connected:success,sourceParityCertified:false,
    canTrade:false,sendPush:false,
    symbolsObserved:success?output.count??null:null,
    icExactNameCandidates:success?output.exactNameCandidates??null:null,
    ambiguityCount:success?output.ambiguousNameCandidates??null:null,
    m5ClosedBars:success?output.barCount??null:null,
    m5Gaps:success?output.gaps??null:null,
    nativePhaseMin:success?output.nativePhaseMin??null:null
  });
}

if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
  let result;
  try{result=await performStagingProbe();}
  catch{result={state:"CTRADER_QA_INTERNAL_FAILURE",connected:false,
    canTrade:false,sendPush:false,sourceParityCertified:false};}
  process.stdout.write(JSON.stringify(result)+"\n");
  // One-shot. A missing credential is not a deploy failure.
  // No long-running process; never retry without explicit operator action.
  process.exitCode=0;
}
