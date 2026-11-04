// Accept a locally generated, sanitized cTrader DEMO SCOPE_VIEW inventory.
// Treat JSON as untrusted input: this adapter is a COVERAGE CANDIDATE REPORT,
// never independent proof of OAuth, IC/OANDA parity, certification or FCM.
import {evaluateCtrader34Coverage} from "./ctrader-readonly-m5-qa.mjs";

const plain=x=>x!==null && typeof x==="object"&&!Array.isArray(x);
const fail=s=>{throw Error("CTRADER_PROBE_"+s)};
const same=(a,b)=>a===b;
const fields=new Set(["status","mode","brokerLabel","symbolCount",
  "enabledSymbolCount","sourceParityCertified","sendPush",
  "canTrade","instrumentMappingsApproved","notes","discoveredSymbols",
  "historicalM5"]);
const histFields=new Set(["status","accountMatches","symbolId","observedAtMs",
  "nativePhaseMin","barCount","sourceHasMore","gaps","bars",
  "sourceParityCertified","sendPush","canTrade"]);
const barFields=new Set(["openedAtMs","closedAtMs","lowRelative",
  "deltaHigh","deltaOpen","deltaClose"]);
const gapFields=new Set(["afterMs","nextAtMs"]);
const safe=n=>Number.isSafeInteger(n)&&n>0;
const limitedKeys=(x,allowed)=>plain(x)&&Object.keys(x).every(k=>allowed.has(k));
function auditSampleHistory(history,symbols){
  if(!limitedKeys(history,histFields)||
     history.status!=="HISTORICAL_CLOSED_M5_QA_NOT_CERTIFIED"||
     history.accountMatches!==true||history.sourceParityCertified!==false||
     history.sendPush!==false||history.canTrade!==false||
     !safe(history.symbolId)||!safe(history.observedAtMs)||
     typeof history.sourceHasMore!=="boolean"||
     !Array.isArray(history.bars)||!Array.isArray(history.gaps)||
     !Number.isSafeInteger(history.barCount)||
     history.barCount!==history.bars.length||history.barCount>2000||
     !symbols.some(x=>x.symbolId===history.symbolId&&x.enabled===true))
    fail("HISTORICAL_M5_NOT_TRUSTED");
  let phase=null,previous=null;
  const gaps=[];
  for(const bar of history.bars){
    if(!limitedKeys(bar,barFields)||!safe(bar.openedAtMs)||
       bar.openedAtMs%60000!==0||bar.closedAtMs!==bar.openedAtMs+300000||
       bar.closedAtMs>history.observedAtMs||
       !safe(bar.lowRelative)||
       !["deltaHigh","deltaOpen","deltaClose"].every(k=>
          Number.isSafeInteger(bar[k])&&bar[k]>=0)||
       bar.deltaOpen>bar.deltaHigh||bar.deltaClose>bar.deltaHigh)
      fail("HISTORICAL_M5_BAR_INVALID");
    const current=(bar.openedAtMs%300000)/60000;
    if(phase!==null&&phase!==current)fail("HISTORICAL_M5_PHASE_CHANGED");
    if(previous!==null){
      if(bar.openedAtMs<=previous)fail("HISTORICAL_M5_ORDER");
      if(bar.openedAtMs!==previous+300000)
        gaps.push({afterMs:previous+300000,nextAtMs:bar.openedAtMs});
    }
    phase=current;previous=bar.openedAtMs;
  }
  if(history.nativePhaseMin!==phase||history.gaps.length!==gaps.length||
     history.gaps.some((g,i)=>!limitedKeys(g,gapFields)||
       g.afterMs!==gaps[i].afterMs||g.nextAtMs!==gaps[i].nextAtMs))
    fail("HISTORICAL_M5_GAPS_INVALID");
  return Object.freeze({symbolId:history.symbolId,barCount:history.barCount,
    gapCount:gaps.length,nativePhaseMin:phase,
    hasMore:history.sourceHasMore,certified:false,sendPush:false});
}

export function auditSanitizedCtraderProbe({
  snapshot,account,approvedMappings=[]
}={}){
  if(!plain(snapshot)||Object.keys(snapshot).some(k=>!fields.has(k))||
     snapshot.status!=="DEMO_VIEW_ONLY_INVENTORY_OBSERVED" ||
     snapshot.mode!=="READ_ONLY_DEMO"||snapshot.sendPush!==false ||
     snapshot.canTrade!==false||snapshot.sourceParityCertified!==0 ||
     snapshot.instrumentMappingsApproved!==0 ||
     !Array.isArray(snapshot.discoveredSymbols)||
     !Number.isInteger(snapshot.symbolCount)||
     snapshot.symbolCount!==snapshot.discoveredSymbols.length||
     !Number.isInteger(snapshot.enabledSymbolCount))
    fail("UNTRUSTED_SNAPSHOT");
  const count=snapshot.discoveredSymbols.filter(x=>x?.enabled===true).length;
  if(!same(count,snapshot.enabledSymbolCount) ||
     snapshot.discoveredSymbols.some(x=>!plain(x) ||
      Object.keys(x).some(k=>!["symbolId","symbolName","enabled"].includes(k)) ||
      typeof x.enabled!=="boolean"))
    fail("INVENTORY_COUNTERS_OR_FIELDS_MISMATCH");
  if(!plain(account)||account.isLive!==false||
     account.brokerName!==snapshot.brokerLabel)
    fail("BROKER_OR_ACCOUNT_MISMATCH");
  const sample=snapshot.historicalM5===undefined?null:
    auditSampleHistory(snapshot.historicalM5,snapshot.discoveredSymbols);
  const coverage=evaluateCtrader34Coverage({
    account,scope:"accounts",
    discoveredSymbols:snapshot.discoveredSymbols,
    approvedMappings
  });
  return Object.freeze({
    source:"LOCAL_PROBE_REPORT_NOT_INDEPENDENT_AUTH_PROOF",
    status:coverage.status,mode:coverage.mode,
    brokerName:coverage.brokerName,
    coverage:coverage.coverage,rows:coverage.rows,
    sampleM5QA:sample,
    canTrade:false,sendPush:false,sourceParityCertified:false,
    // The runtime still needs independent authenticated session evidence.
    requiresBrokerAndPineParity:true
  });
}
