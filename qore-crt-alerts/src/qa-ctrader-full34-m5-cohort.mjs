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
 e.QORE_CT_QA_M5_CSV_EXPORT==="DISABLED"&&
 e.QORE_CT_QA_NATIVE_M15_COMPARE==="DISABLED"&&
 e.QORE_CT_QA_NATIVE_H4_AUDIT==="DISABLED"&&
 e.QORE_TRADING_ENABLED==="false"&&e.QORE_PUSH_ENABLED==="false"&&
 e.QORE_ALERT_TTL_SECONDS==="14400";
function mappedConfig(env,row){
 const e={...env,
  QORE_CT_SAMPLE_SYMBOL_ID:String(row.nativeId),
  QORE_CT_SAMPLE_SYMBOL_NAME:row.nativeName,
  QORE_CT_SAMPLE_INSTRUMENT_ID:row.instrumentId};
 const cfg=readDemoViewProbeConfig(e);
 if(cfg.historyPages!==1||cfg.exportPrivateCsv||cfg.compareNativeM15||
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
    out=await probe({config,timeoutMs:25000,
      includeCandidateManifest:false,includePrivateCsv:false});
   }catch{out={state:"BLOCKED",reason:"CTRADER_COHORT_SAMPLE_BLOCKED"};}
   const observed=out?.state==="HISTORICAL_M5_QA_UNCERTIFIED"&&
    Number.isInteger(out.barCount)&&out.barCount>=1&&out.barCount<=300&&
    Number.isInteger(out.gaps)&&out.gaps>=0&&out.gaps<300&&
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
      closedM5:out.barCount,missingIntervals:out.gaps,
      nativePhaseMin:out.nativePhaseMin,
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
 const status=m5Observed===34?
  "CTRADER_34_M5_SAMPLES_OBSERVED_UNCERTIFIED":
  "CTRADER_34_M5_SAMPLES_PARTIAL_UNCERTIFIED";
 return Object.freeze({
  state:status,manifestSha256:COHORT34_MANIFEST_SHA256,
  inventoryCount:inventory.length,
  expected:34,attempted:34,m5Observed,blocked:34-m5Observed,
  withUnclassifiedGaps:gapUnknown,
  all34M5Observed:m5Observed===34,rows:scanned,
  ownerApprovedMappings:0,sourceParityCertified:false,
  crtFamiliesCertified:false,mssM5Certified:false,mssM15Certified:false,
  all34SessionCalendarsCertified:false,canTrade:false,sendPush:false
 });
}
