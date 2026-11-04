// Accept a locally generated, sanitized cTrader DEMO SCOPE_VIEW inventory.
// Treat JSON as untrusted input: this adapter is a COVERAGE CANDIDATE REPORT,
// never independent proof of OAuth, IC/OANDA parity, certification or FCM.
import {evaluateCtrader34Coverage} from "./ctrader-readonly-m5-qa.mjs";

const plain=x=>x!==null && typeof x==="object"&&!Array.isArray(x);
const fail=s=>{throw Error("CTRADER_PROBE_"+s)};
const same=(a,b)=>a===b;
const fields=new Set(["status","mode","brokerLabel","symbolCount",
  "enabledSymbolCount","sourceParityCertified","sendPush",
  "canTrade","instrumentMappingsApproved","notes","discoveredSymbols"]);

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
    canTrade:false,sendPush:false,sourceParityCertified:false,
    // The runtime still needs independent authenticated session evidence.
    requiresBrokerAndPineParity:true
  });
}
