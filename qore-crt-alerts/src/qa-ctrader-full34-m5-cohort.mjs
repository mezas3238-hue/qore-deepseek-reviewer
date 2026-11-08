// QORE CRT: complete 34/34 IC Markets cTrader DEMO native M5 survey.
// ONE SHOT ONLY. No LIVE, order requests, FCM, alerts, broker mapping approval,
// TradingView price equivalence, or automatic retry. Source: real 34-row
// owner-REVIEW manifest captured from the authenticated 365-symbol inventory.
import {INSTRUMENTS} from "./instruments.mjs";
import {buildUnapprovedIc34OwnerManifest}
 from "./qa-ctrader-ic34-owner-manifest.mjs";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "./ctrader-demo-wss-probe-qa.mjs";

export const COHORT34_OPT_IN="OWNER_APPROVED_FULL_34_DEMO_M5_QA";
export const COHORT34_MANIFEST_SHA256=
 "98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885";

// These 34 identifiers were actually observed in a cTrader DEMO VIEW
// inventory. They are NAME-ONLY CANDIDATES, not owner-approved chart mappings.
const reference=[
 ["AUDJPY","AUDJPY",11],["GBPUSD","GBPUSD",2],
 ["GBPJPY","GBPJPY",7],["XAUUSD","XAUUSD",41],
 ["NDX100","USTEC",10014],["SPX500","US500",10013],
 ["US30","US30",10015],["BTCUSD","BTCUSD",10026],
 ["AUDUSD","AUDUSD",5],["USDCAD","USDCAD",8],
 ["USDJPY","USDJPY",4],["EURUSD","EURUSD",1],
 ["USDCHF","USDCHF",6],["NZDUSD","NZDUSD",12],
 ["NZDJPY","NZDJPY",21],["NZDCHF","NZDCHF",39],
 ["XAGUSD","XAGUSD",42],["AUDCAD","AUDCAD",18],
 ["AUDCHF","AUDCHF",23],["AUDNZD","AUDNZD",20],
 ["CADCHF","CADCHF",27],["CADJPY","CADJPY",15],
 ["CHFJPY","CHFJPY",13],["EURAUD","EURAUD",14],
 ["EURCAD","EURCAD",17],["EURCHF","EURCHF",10],
 ["EURGBP","EURGBP",9],["EURJPY","EURJPY",3],
 ["EURNZD","EURNZD",26],["GBPAUD","GBPAUD",16],
 ["GBPCAD","GBPCAD",19],["GBPCHF","GBPCHF",40],
 ["GBPNZD","GBPNZD",25],["NZDCAD","NZDCAD",30]
];
export const OBSERVED_IC34_CANDIDATES=Object.freeze(reference.map(([id,nativeName,nativeId],i)=>{
 if(INSTRUMENTS[i]?.id!==id||INSTRUMENTS[i]?.tvSymbol!=="IC:"+nativeName)
  throw Error("CTRADER_34_SOVEREIGN_CATALOG_DRIFT");
 return Object.freeze({
  slot:i+1,instrumentId:id,tvSymbol:INSTRUMENTS[i].tvSymbol,
  nativeName,nativeId
 });
}));
const groupFor=id=>id==="BTCUSD"?"BTC_INDEPENDENT":
 ["NDX100","SPX500","US30"].includes(id)?"INDICES":
 ["XAUUSD","XAGUSD"].includes(id)?"METALS":"FOREX";
const safeReason=s=>typeof s==="string"&&
 /^CTRADER_[A-Z0-9_]{1,95}$/.test(s)?s:"CTRADER_COHORT_SAMPLE_BLOCKED";
const fail=(state,detail={})=>Object.freeze({
 state,expected:34,attempted:0,m5Observed:0,
 all34M5Observed:false,ownerApprovedMappings:0,
 sourceParityCertified:false,crtFamiliesCertified:false,
 mssM5Certified:false,mssM15Certified:false,
 canTrade:false,sendPush:false,...detail
});
export function verifyObservedIc34Manifest(inventory){
 const manifest=buildUnapprovedIc34OwnerManifest({
  inventory,viewAccountProven:true
 });
 const right=manifest.total===34&&manifest.rows.length===34&&
  manifest.manifestSha256===COHORT34_MANIFEST_SHA256&&
  manifest.exactNameCandidates===34&&manifest.ambiguous===0&&
  manifest.unmapped===0&&manifest.ownerApprovedMappings===0&&
  manifest.rows.every((r,i)=>{
   const expected=OBSERVED_IC34_CANDIDATES[i];
   return r.slot===expected.slot&&r.instrumentId===expected.instrumentId&&
    r.tvSymbol===expected.tvSymbol&&r.candidates.length===1&&
    r.candidates[0].ctraderSymbolId===expected.nativeId&&
    r.candidates[0].brokerSymbolName===expected.nativeName&&
    r.ownerApproved===false&&r.sourceParityCertified===false;
  });
 if(!right)throw Error("CTRADER_34_DEMO_MANIFEST_NOT_IDENTICAL");
 return manifest;
}
const envSafe=e=>e?.QORE_CT_QA_COHORT34===COHORT34_OPT_IN&&
 e.QORE_CT_STAGE==="DEMO"&&e.QORE_CT_OAUTH_SCOPE==="accounts"&&
 e.QORE_PROVIDER==="IC"&&e.QORE_CT_QA_PROBE==="OWNER_APPROVED_VIEW_ONLY"&&
 e.QORE_CT_EXPECTED_BROKER_TITLE==="Raw Trading Ltd"&&
 e.QORE_CT_ACCOUNT_DISCOVERY==="DISABLED"&&
 e.QORE_CT_QA_HISTORY_PAGES==="1"&&
 [undefined,"1","2"].includes(e.QORE_CT_QA_COHORT34_PAGES)&&
 [undefined,"DISABLED","OWNER_APPROVED_34_NATIVE_M15_H4_QA"]
   .includes(e.QORE_CT_QA_NATIVE_ALL34_TF)&&
 [undefined,"DISABLED","OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA"]
   .includes(e.QORE_CT_QA_CRT_MSS_ALL34)&&
 [undefined,"DISABLED","OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA"]
   .includes(e.QORE_CT_QA_INDEX_H4_SEASONS_2026)&&
 (e.QORE_CT_QA_INDEX_H4_SEASONS_2026!=="OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA"||
   (e.QORE_CT_QA_NATIVE_ALL34_TF==="OWNER_APPROVED_34_NATIVE_M15_H4_QA"&&
    e.QORE_CT_QA_COHORT34_PAGES==="2"))&&
 (e.QORE_CT_QA_CRT_MSS_ALL34!=="OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA"||
    e.QORE_CT_QA_NATIVE_ALL34_TF==="OWNER_APPROVED_34_NATIVE_M15_H4_QA")&&
 (e.QORE_CT_QA_NATIVE_ALL34_TF!=="OWNER_APPROVED_34_NATIVE_M15_H4_QA"||
   e.QORE_CT_QA_COHORT34_PAGES==="2")&&
 e.QORE_CT_QA_M5_CSV_EXPORT==="DISABLED"&&
 e.QORE_CT_QA_NATIVE_M15_COMPARE==="DISABLED"&&
 e.QORE_CT_QA_NATIVE_H4_AUDIT==="DISABLED"&&
 e.QORE_TRADING_ENABLED==="false"&&e.QORE_PUSH_ENABLED==="false"&&
 e.QORE_ALERT_TTL_SECONDS==="14400";
function mappedConfig(env,row){
 const pages=env.QORE_CT_QA_COHORT34_PAGES==="2"?2:1;
 const e={...env,
  QORE_CT_QA_HISTORY_PAGES:String(pages),
  QORE_CT_SAMPLE_SYMBOL_ID:String(row.nativeId),
  QORE_CT_SAMPLE_SYMBOL_NAME:row.nativeName,
  QORE_CT_SAMPLE_INSTRUMENT_ID:row.instrumentId};
 const cfg=readDemoViewProbeConfig(e);
 const tf=e.QORE_CT_QA_NATIVE_ALL34_TF==="OWNER_APPROVED_34_NATIVE_M15_H4_QA";
 const crt=e.QORE_CT_QA_CRT_MSS_ALL34===
   "OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA";
 const seasons=e.QORE_CT_QA_INDEX_H4_SEASONS_2026===
    "OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA"&&
    ["NDX100","SPX500","US30"].includes(row.instrumentId);
 if(cfg.compareSeasonalIndexH4!==seasons||
    cfg.auditCrtMssAll34!==crt||
    cfg.compareNativeAll34!==tf||cfg.historyPages!==pages||
    cfg.allowCohortPaging!==(pages===2)||
    cfg.exportPrivateCsv||cfg.compareNativeM15||
    cfg.compareNativeH4||cfg.sampleSymbolId!==String(row.nativeId)||
    cfg.sampleSymbolName!==row.nativeName||
    cfg.sampleInstrumentId!==row.instrumentId)
  throw Error("CTRADER_COHORT34_SOURCE_MAPPING_BLOCKED");
 return cfg;
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function runAuthorizedFull34M5Cohort({
 env,probe=runAuthorizedDemoWssProbe,onRow=()=>{},
 throttleMs=180
}={}){
 if(!envSafe(env)||typeof probe!=="function"||typeof onRow!=="function"||
    !Number.isInteger(throttleMs)||throttleMs<0||throttleMs>1000)
  return fail("CTRADER_34_UNSAFE_CONFIG_BLOCKED");
 let cfg;
 try{
  const e={...env};
  delete e.QORE_CT_SAMPLE_SYMBOL_ID;
  delete e.QORE_CT_SAMPLE_SYMBOL_NAME;
  delete e.QORE_CT_SAMPLE_INSTRUMENT_ID;
  // The inventory query MUST stay single-page even when symbol history is
  // two pages. Never request M5 when the manifest has not been verified.
  e.QORE_CT_QA_HISTORY_PAGES="1";
  // Inventory never requests candles. Native timeframe authorization is
  // applied ONLY after the entire real 34-ID manifest is reverified.
  e.QORE_CT_QA_NATIVE_ALL34_TF="DISABLED";
  e.QORE_CT_QA_CRT_MSS_ALL34="DISABLED";
  e.QORE_CT_QA_INDEX_H4_SEASONS_2026="DISABLED";
  cfg=readDemoViewProbeConfig(e);
 }catch{return fail("CTRADER_34_DEMO_VIEW_CONFIG_INVALID");}
 let inventory;
 try{
  const discovery=await probe({config:cfg,timeoutMs:25000,
    includeCandidateManifest:false,includePrivateCsv:false});
  if(discovery?.state!=="INVENTORY_QA_ONLY"||
     !Array.isArray(discovery.symbols))
   return fail("CTRADER_34_DISCOVERY_NOT_VIEW_AUTHENTICATED");
  verifyObservedIc34Manifest(discovery.symbols);
  inventory=discovery.symbols;
 }catch{return fail("CTRADER_34_MANIFEST_RECHECK_FAILED");}
 // The inventory is authenticated at the beginning of this exact one-shot
 // and each symbol is rechecked by the VIEW-only transport before OHLC read.
 // Up to 2 independent DEMO connections, never 34 parallel connections.
 const rows=new Array(34);
 let pointer=0;
 const work=async()=>{
  for(;;){
   const i=pointer++;
   if(i>=34)return;
   const map=OBSERVED_IC34_CANDIDATES[i];
   let out;
   try{
    // Historical M5 read only, no live subscription/CRT/MSS invocation.
    await delay(throttleMs);
    const config=mappedConfig(env,map);
    out=await probe({config,timeoutMs:
        config.historyPages===2?35_000:25_000,
      includeCandidateManifest:false,includePrivateCsv:false});
   }catch{out={state:"BLOCKED",reason:"CTRADER_COHORT_SAMPLE_BLOCKED"};}
   const pages=env.QORE_CT_QA_COHORT34_PAGES==="2"?2:1;
   const tfRequested=env.QORE_CT_QA_NATIVE_ALL34_TF===
     "OWNER_APPROVED_34_NATIVE_M15_H4_QA";
   const crtRequested=env.QORE_CT_QA_CRT_MSS_ALL34===
      "OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA";
   const crtSeen=out?.crtMss34Replay;
   const crtAllowed=crtSeen?.state===
      "CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED"||
      crtSeen?.state===
      "NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA";
   const observed=(tfRequested?
     out?.state==="HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED":
     out?.state==="HISTORICAL_M5_QA_UNCERTIFIED")&&
     (!crtRequested||crtAllowed)&&
    Number.isInteger(out.barCount)&&out.barCount>=1&&
    out.barCount<=300*pages&&out.pagesFetched===pages&&
    Number.isInteger(out.gaps)&&out.gaps>=0&&
    out.gaps<300*pages&&
    Number.isInteger(out.nativePhaseMin)&&
    out.nativePhaseMin>=0&&out.nativePhaseMin<=4&&
    out.symbolName===map.nativeName;
   const row=Object.freeze({
    slot:map.slot,instrumentId:map.instrumentId,tvSymbol:map.tvSymbol,
    brokerNativeName:map.nativeName,symbolId:map.nativeId,
    group:groupFor(map.instrumentId),
    state:observed?(out.gaps>0?
      "M5_OBSERVED_GAPS_UNCLASSIFIED_QA":
      "M5_OBSERVED_NO_GAPS_QA"):
      "M5_READ_BLOCKED_OR_EMPTY_QA",
    ...(observed?{
      closedM5:out.barCount,historyPages:pages,
      missingIntervals:out.gaps,
      ...(pages===2?{
        missingM5Bars:out.missingM5Intervals??null,
        gapsSample:Object.freeze((out.gapIntervals??[]).slice(0,16)),
        gapsTruncated:out.gapIntervalsTruncated??false
      }:{}),
      nativePhaseMin:out.nativePhaseMin,
      ...(tfRequested?{
        nativeM15QaSummary:out.native34M15Summary??null,
        nativeH4QaSummary:out.native34H4Summary??null
      }:{}),
      ...(crtRequested?{crtMssQa:crtSeen??null}:{ }),
      ...(tfRequested&&["NDX100","SPX500","US30"].includes(map.instrumentId)&&
        env.QORE_CT_QA_INDEX_H4_SEASONS_2026===
          "OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA"?
        {nativeSeasonalIndexH4:out.nativeSeasonalH4Summary??null}:{}),
      earliestClosedAtMs:out.earliestClosedAtMs??null,
      latestClosedAtMs:out.latestClosedAtMs??null
    }:{closedM5:0,missingIntervals:null,nativePhaseMin:null,
      failure: safeReason(out?.reason??out?.state)}),
    ownerApproved:false,sourceParityCertified:false,
    mssM5Certified:false,mssM15Certified:false,
    crtFamiliesCertified:false,canTrade:false,sendPush:false
   });
   rows[i]=row;
   try{onRow(row);}catch{}
  }
 };
 await Promise.all([work(),work()]);
 if(rows.some(x=>!x))return fail("CTRADER_34_COHORT_INCOMPLETE_INTERNAL");
 const scanned=Object.freeze([...rows]);
 const m5Observed=scanned.filter(r=>r.closedM5>0).length;
 const gapUnknown=scanned.filter(r=>r.missingIntervals>0).length;
 const requestedPages=env.QORE_CT_QA_COHORT34_PAGES==="2"?2:1;
 const completeRows=scanned.filter(r=>r.closedM5===300*requestedPages).length;
 const tfRequested=env.QORE_CT_QA_NATIVE_ALL34_TF===
   "OWNER_APPROVED_34_NATIVE_M15_H4_QA";
 const nativeM15Read=scanned.filter(r=>
   Number.isInteger(r.nativeM15QaSummary?.nativeBarsFetched)&&
   r.nativeM15QaSummary.nativeBarsFetched>0).length;
 const nativeH4Read=scanned.filter(r=>
   Number.isInteger(r.nativeH4QaSummary?.nativeBarsFetched)&&
   r.nativeH4QaSummary.nativeBarsFetched>0).length;
 const crtRequested=env.QORE_CT_QA_CRT_MSS_ALL34===
   "OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA";
 const crtRows=scanned.filter(r=>r.crtMssQa!==undefined&&
   r.crtMssQa!==null);
 const clockMismatchMarkets=crtRows.filter(r=>
   r.crtMssQa.state==="NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA")
   .map(r=>r.instrumentId);
 const crtAnalyzed=crtRows.filter(r=>
   r.crtMssQa.state==="CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED")
   .length;
 const clockCompared=crtRows.filter(r=>
   r.crtMssQa.nativeOwnerClockQA?.comparisonScope===
     "BROKER_DEMO_CLOSED_M5_ONLY");
 const nativeOwnerH4Conflicts=clockCompared.filter(r=>
   r.crtMssQa.nativeOwnerClockQA.state===
     "NATIVE_VS_OWNER_H4_ANCHOR_CONFLICT_QA");
 const seasonalRequested=env.QORE_CT_QA_INDEX_H4_SEASONS_2026===
   "OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA";
 const seasonalSamples=scanned.filter(r=>
   ["NDX100","SPX500","US30"].includes(r.instrumentId)&&
   r.nativeSeasonalIndexH4?.requestedWindows===5&&
   r.nativeSeasonalIndexH4.observedWindows===5&&
   r.nativeSeasonalIndexH4.nativeH4Bars>0);
 const status=seasonalRequested?
    (seasonalSamples.length===3&&crtRows.length===34&&
     nativeM15Read===34&&nativeH4Read===34?
      "CTRADER_34_WITH_3_INDEX_H4_SEASONS_OBSERVED_UNCERTIFIED":
      "CTRADER_34_INDEX_H4_SEASONAL_PARTIAL_UNCERTIFIED"):
   crtRequested?
    (crtRows.length===34&&nativeM15Read===34&&nativeH4Read===34?
     "CTRADER_34_CRT_MSS_CLOCK_AUDIT_UNCERTIFIED":
     "CTRADER_34_CRT_MSS_REPLAY_PARTIAL_UNCERTIFIED"):
   tfRequested?
    (m5Observed===34&&completeRows===34&&
     nativeM15Read===34&&nativeH4Read===34?
     "CTRADER_34_NATIVE_M15_H4_SAMPLES_OBSERVED_UNCERTIFIED":
     "CTRADER_34_NATIVE_M15_H4_PARTIAL_UNCERTIFIED"):
   m5Observed===34&&completeRows===34?
    (requestedPages===2?
      "CTRADER_34_600_M5_SAMPLES_OBSERVED_UNCERTIFIED":
      "CTRADER_34_M5_SAMPLES_OBSERVED_UNCERTIFIED"):
    "CTRADER_34_M5_SAMPLES_PARTIAL_UNCERTIFIED";
 return Object.freeze({
  state:status,manifestSha256:COHORT34_MANIFEST_SHA256,
  inventoryCount:inventory.length,
  expected:34,attempted:34,m5Observed,blocked:34-m5Observed,
  requestedM5PerInstrument:300*requestedPages,
  totalClosedM5:scanned.reduce((sum,r)=>sum+r.closedM5,0),
  completeRequestedSamples:completeRows,
  all34RequestedSamplesComplete:completeRows===34,
  nativeM15MarketsRead:nativeM15Read,
  nativeH4MarketsRead:nativeH4Read,
  all34NativeFramesRead:tfRequested&&nativeM15Read===34&&nativeH4Read===34,
  crtClockMarketsAudited:crtRows.length,
  crtCausalMarketsEvaluated:crtAnalyzed,
  clockMismatchMarketCount:clockMismatchMarkets.length,
  clockMismatchMarkets:Object.freeze(clockMismatchMarkets),
  nativeVsOwnerClockComparedMarkets:clockCompared.length,
  nativeVsOwnerClockConflictMarkets:Object.freeze(
    nativeOwnerH4Conflicts.map(r=>r.instrumentId)),
  nativeVsOwnerClockMatchedH4:clockCompared.reduce((a,r)=>
    a+r.crtMssQa.nativeOwnerClockQA.timestampMatchedCompleteH4,0),
  nativeVsOwnerClockDifferingH4:clockCompared.reduce((a,r)=>
    a+r.crtMssQa.nativeOwnerClockQA.ownerOnlyCompleteH4+
      r.crtMssQa.nativeOwnerClockQA.nativeOnlyCompleteH4,0),
  nativeVsOwnerClockCertified:false,
  indexH4SeasonalMarketsRead:seasonalSamples.length,
  indexH4SeasonalWindowsRead:seasonalSamples.reduce((a,r)=>
    a+r.nativeSeasonalIndexH4.observedWindows,0),
  indexH4SeasonalNativeBars:seasonalSamples.reduce((a,r)=>
    a+r.nativeSeasonalIndexH4.nativeH4Bars,0),
  allThreeIndexSeasonsObserved:seasonalRequested&&seasonalSamples.length===3,
  crossSeasonClockCertified:false,
  totalCrtCyclesEvaluated:crtRows.reduce((a,r)=>
    a+(r.crtMssQa?.cyclesEvaluated??0),0),
  totalMssM5ClosedWitnesses:crtRows.reduce((a,r)=>
    a+(r.crtMssQa?.mssM5ClosedWitnesses??0),0),
  totalMssM15ClosedWitnesses:crtRows.reduce((a,r)=>
    a+(r.crtMssQa?.mssM15ClosedWitnesses??0),0),
  all34CrtMssSignalsCertified:false,
  totalNativeM15Bars:scanned.reduce((a,r)=>
    a+(r.nativeM15QaSummary?.nativeBarsFetched??0),0),
  totalNativeH4Bars:scanned.reduce((a,r)=>
    a+(r.nativeH4QaSummary?.nativeBarsFetched??0),0),
  totalM15ComparedBlocks:scanned.reduce((a,r)=>
    a+(r.nativeM15QaSummary?.matchedUtcAndCompleteM5Blocks??0),0),
  totalH4ComparedBlocks:scanned.reduce((a,r)=>
    a+(r.nativeH4QaSummary?.matchedUtcAndCompleteM5Blocks??0),0),
  totalM15MismatchBars:scanned.reduce((a,r)=>
    a+(r.nativeM15QaSummary?.mismatchBars??0),0),
  totalH4MismatchBars:scanned.reduce((a,r)=>
    a+(r.nativeH4QaSummary?.mismatchBars??0),0),
  withUnclassifiedGaps:gapUnknown,
  all34M5Observed:m5Observed===34,rows:scanned,
  ownerApprovedMappings:0,sourceParityCertified:false,
  crtFamiliesCertified:false,mssM5Certified:false,mssM15Certified:false,
  all34SessionCalendarsCertified:false,canTrade:false,sendPush:false
 });
}
