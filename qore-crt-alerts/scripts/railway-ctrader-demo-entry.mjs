#!/usr/bin/env node
// Railway STAGING / single authorized IC Markets DEMO probe.
// NO continuous stream, NO TRADING, NO FCM, NO LIVE, no public port.
// Finishes after one proof attempt; Railway restartPolicy NEVER.
// Missing secrets are an expected, safe "not connected" state.
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
  from "../src/ctrader-demo-wss-probe-qa.mjs";
import {publishQaProbe} from "../src/qa-ctrader-mobile-probe-bridge.mjs";
import {discoverAuthorizedDemoAccounts,DISCOVERY_OPT_IN}
  from "../src/qa-ctrader-demo-account-discovery.mjs";
import {IC34_MANIFEST_OPT_IN}
  from "../src/qa-ctrader-ic34-owner-manifest.mjs";
import {CTRADER_EURUSD_CSV_EXPORT_OPT_IN}
  from "../src/qa-ctrader-eurusd-parity-csv.mjs";

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
  const includeCandidateManifest=
    env.QORE_CT_QA_SYMBOL_MANIFEST===IC34_MANIFEST_OPT_IN;
  const includePrivateCsv=cfg.exportPrivateCsv===true;
  if((includeCandidateManifest&&includePrivateCsv)||
     (includeCandidateManifest&&cfg.compareNativeM15))
    return Object.freeze({state:"CTRADER_CONFLICTING_QA_EXPORT_MODES",
      connected:false,sourceParityCertified:false,canTrade:false,sendPush:false});
  const output=await probe({
    config:cfg,includeCandidateManifest,includePrivateCsv,
    // Two 300-bar historical pages: bounded 35s WSS, no auto retry.
    ...(cfg.historyPages>1?{timeoutMs:35_000}:{})
  });
  const success=output?.state==="INVENTORY_QA_ONLY"||
    output?.state==="HISTORICAL_M5_QA_UNCERTIFIED"||
    output?.state==="HISTORICAL_M5_M15_QA_UNCERTIFIED";
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
    m5PagesFetched:success?output.pagesFetched??null:null,
    ...(cfg.historyPages>1&&output.h4Summary?
      {h4QaSummary:output.h4Summary}:{}),
    ...(cfg.historyPages>1&&output.m15Summary?
      {m15QaSummary:output.m15Summary}:{}),
    ...(cfg.compareNativeM15===true&&output.nativeM15Summary?
      {nativeM15QaSummary:output.nativeM15Summary}:{}),
    ...(success&&includePrivateCsv&&output.privateCsv?
      {privateCsv:output.privateCsv}:{}),
    nativePhaseMin:success?output.nativePhaseMin??null:null,
    ...(includeCandidateManifest&&output?.state==="INVENTORY_QA_ONLY" &&
       output.ownerReviewManifest?.state==="IC34_CANDIDATES_OWNER_REVIEW_ONLY"?
      {ownerReviewManifest:output.ownerReviewManifest}:{})
  });
}

if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
  let result;
  if(process.env.QORE_CT_ACCOUNT_DISCOVERY===DISCOVERY_OPT_IN){
    // DEMO account discovery: no HMAC, alerts, data, orders or gateway call.
    // Only proven DEMO API IDs and broker short names go to private QA logs.
    try{result=await discoverAuthorizedDemoAccounts();}
    catch{result={state:"CTRADER_DISCOVERY_INTERNAL_FAILURE",accounts:[],
      canTrade:false,sendPush:false,sourceParityCertified:false};}
    process.stdout.write(JSON.stringify({...result,
      qaMobileProbeBridge:"NOT_ATTEMPTED_IN_DISCOVERY"})+"\n");
  }else{
    try{result=await performStagingProbe();}
    catch{result={state:"CTRADER_QA_INTERNAL_FAILURE",connected:false,
      canTrade:false,sendPush:false,sourceParityCertified:false};}
    // Owner-review symbol IDs must NEVER be published through a gateway.
    // A QA manifest is printed only to private worker logs.
    const inManifestMode=
      process.env.QORE_CT_QA_SYMBOL_MANIFEST===IC34_MANIFEST_OPT_IN;
    const inHistoricalQaMode=
      ["2","3"].includes(process.env.QORE_CT_QA_HISTORY_PAGES);
    const inCsvExportMode=
      process.env.QORE_CT_QA_M5_CSV_EXPORT===CTRADER_EURUSD_CSV_EXPORT_OPT_IN;
    const delivery=inManifestMode?
      {state:"NOT_ATTEMPTED_IN_OWNER_REVIEW_MANIFEST"}:
      inHistoricalQaMode||inCsvExportMode?
        {state:"NOT_ATTEMPTED_IN_HISTORICAL_M5_QA"}:
        await publishQaProbe({env:process.env,probe:result});
    // Never print a 600-bar OHLC record in one log line. Private
    // Railway STAGING logs receive bounded, individually numbered chunks;
    // public gateway and Firebase receive nothing.
    const {privateCsv,...slim}=result;
    if(inCsvExportMode&&privateCsv&&Array.isArray(privateCsv.chunks)){
      for(const chunk of privateCsv.chunks)
        process.stdout.write(JSON.stringify({...chunk,
          fullCsvSha256:privateCsv.sha256})+"\n");
    }
    process.stdout.write(JSON.stringify({
      ...slim,
      ...(inCsvExportMode&&privateCsv?{
       privateCsvSummary:{
        schema:privateCsv.schema,count:privateCsv.count,
        chunkCount:privateCsv.chunkCount,sha256:privateCsv.sha256,
        firstOpenedAtMs:privateCsv.firstOpenedAtMs,
        lastClosedAtMs:privateCsv.lastClosedAtMs,
        sourceParityCertified:false,sendPush:false,canTrade:false
       }}:{}),
      qaMobileProbeBridge:delivery.state
    })+"\n");
  }
  // One-shot. A missing credential is not a deploy failure.
  // No long-running process; never retry without explicit operator action.
  process.exitCode=0;
}
