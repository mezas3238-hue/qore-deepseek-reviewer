// Compare the 34 sovereign IC TradingView slots with an observed,
// authenticated IC Markets cTrader DEMO symbol inventory.
// This only produces CANDIDATES. Never silently approves broker mappings
// or claims historical OHLC parity or active alert subscription.
import {INSTRUMENTS} from "./instruments.mjs";

const key=s=>typeof s==="string"?s.toUpperCase().replaceAll("/",""):"";
const validId=x=>Number.isSafeInteger(x)&&x>0;
const frozen=x=>Object.freeze(x);
export function auditUnapprovedIc34Candidates({inventory,viewAccountProven=false}={}){
 if(viewAccountProven!==true||!Array.isArray(inventory)||
    inventory.length>10_000)
  throw Error("CTRADER_QA_PROVEN_VIEW_INVENTORY_REQUIRED");
 const mapped=new Map(),seenIds=new Set();
 for(const row of inventory){
  if(!validId(row?.symbolId)||typeof row.symbolName!=="string"||
    !/^[A-Za-z0-9_./:-]{1,80}$/.test(row.symbolName)||
    typeof row.enabled!=="boolean"||seenIds.has(row.symbolId))
    throw Error("CTRADER_QA_SYMBOL_INVENTORY_UNTRUSTED");
  seenIds.add(row.symbolId);
  if(!row.enabled)continue;
  const canonical=key(row.symbolName);
  if(!mapped.has(canonical))mapped.set(canonical,[]);
  mapped.get(canonical).push({symbolId:row.symbolId,
    brokerSymbolName:row.symbolName});
 }
 const rows=INSTRUMENTS.map(instrument=>{
  const expected=instrument.tvSymbol.slice(3); // only fixed "IC:"
  const hits=mapped.get(key(expected))??[];
  const state=hits.length===0?"NO_EXACT_BROKER_CANDIDATE":
    hits.length===1?"EXACT_NAME_CANDIDATE_UNVERIFIED":
      "AMBIGUOUS_BROKER_SYMBOL_REQUIRES_OWNER";
  return frozen({
   slot:instrument.slot,instrumentId:instrument.id,
   tvSymbol:instrument.tvSymbol,
   expectedNativeName:expected,
   state,matchedCount:hits.length,
   candidates:frozen(hits.map(h=>frozen({...h}))),
   ownerApproved:false,sourceParityCertified:false,
   sendPush:false,canTrade:false
  });
 });
 return frozen({
  state:"IC34_DEMO_INVENTORY_CANDIDATES_ONLY",
  total:34,exactNameCandidates:rows.filter(x=>
   x.state==="EXACT_NAME_CANDIDATE_UNVERIFIED").length,
  ambiguous:rows.filter(x=>
   x.state==="AMBIGUOUS_BROKER_SYMBOL_REQUIRES_OWNER").length,
  unmapped:rows.filter(x=>
   x.state==="NO_EXACT_BROKER_CANDIDATE").length,
  sourceParityCertified:0,approvedMappings:0,
  canTrade:false,sendPush:false,rows:frozen(rows)
 });
}
