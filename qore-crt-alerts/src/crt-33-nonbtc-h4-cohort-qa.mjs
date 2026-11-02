// V34.11f 33-market H4/C1 readiness audit. BTCUSD is an isolated reference,
// never part of the 33-market denominator or a substitute feed.
// Read-only; snapshots from an independently captured Pine runtime are needed.
export const PINE_33_SOURCE_BLOB_SHA="4e0d5541413fa0054c8fad827a8023929d105177";
const fail=(status,fields={})=>Object.freeze({
 status,certified:false,actionable:false,sendPush:false,...fields
});
const int=x=>Number.isSafeInteger(x)&&x>=0;
const groups=Object.freeze({forex:"FOREX",metals:"METALS",indices:"INDEX"});
const group=(slot)=>[5,6,7].includes(slot)?groups.indices:
  [4,17].includes(slot)?groups.metals:groups.forex;
function validateCounters(s){
 const keys=["h4Closed","h4Incomplete","h4Partial","h4Internal",
  "h4Dst","c1Hours","c1Ok","c1BadClock","c1BadData","c1BadRange",
  "audit2C","audit3C","auditInside","auditMulti4","auditMultiN"];
 if(!keys.every(k=>int(s[k])))return "COUNTERS_INVALID_OR_MISSING";
 if(s.h4Incomplete>s.h4Closed||
    s.h4Incomplete!==s.h4Partial+s.h4Internal+s.h4Dst)
  return "H4_COUNTERS_INCONSISTENT";
 if(s.c1Hours!==s.c1Ok+s.c1BadClock+s.c1BadData+s.c1BadRange)
  return "C1_COUNTERS_INCONSISTENT";
 if(s.c1Hours>s.h4Closed)return "C1_WITHOUT_H4";
 return null;
}
export function audit33NonBtcH4({sourceCatalog,snapshots=[],asOf,pineSourceBlobSha}={}){
 if(!Array.isArray(sourceCatalog)||sourceCatalog.length!==34||
    !Array.isArray(snapshots)||!int(asOf)||
    pineSourceBlobSha!==PINE_33_SOURCE_BLOB_SHA)
  throw Error("INVALID_33_COHORT_OR_PINE_SOURCE");
 const ids=new Set(),names=new Set();
 for(const c of sourceCatalog){
  if(!int(c.slot)||c.slot<1||c.slot>34||ids.has(c.slot)||
     typeof c.tv_symbol!=="string"||!c.tv_symbol||
     names.has(c.tv_symbol))throw Error("DUPLICATE_OR_UNKNOWN_CATALOG_SLOT");
  ids.add(c.slot);names.add(c.tv_symbol);
 }
 if(ids.size!==34||sourceCatalog.find(c=>c.slot===8)?.tv_symbol!=="IC:BTCUSD")
  throw Error("BTC_MUST_BE_OWN_SLOT_8");
 const bySlot=new Map();
 for(const s of snapshots){
  if(!int(s?.slot)||s.slot<1||s.slot>34||bySlot.has(s.slot))
   throw Error("UNKNOWN_OR_DUPLICATE_SNAPSHOT_SLOT");
  bySlot.set(s.slot,s);
 }
 const rows=[]; const tally={
  forex:0,metals:0,indices:0,responded:0,missing:0,invalid:0,
  withC1:0,blockedAllH4:0,withHistoricalCRT:0
 };
 for(const c of [...sourceCatalog].sort((a,b)=>a.slot-b.slot)){
  if(c.slot===8)continue;
  const g=group(c.slot);
  tally[g==="FOREX"?"forex":g==="METALS"?"metals":"indices"]++;
  const s=bySlot.get(c.slot);
  if(!s||s.responded!==true){
   tally.missing++;
   rows.push(fail("MISSING_OR_UNRESPONSIVE_FEED",{
    slot:c.slot,tvSymbol:c.tv_symbol,group:g
   }));
   continue;
  }
  const error=s.tvSymbol!==c.tv_symbol||
   s.pineBlobSha!==pineSourceBlobSha||s.asOf!==asOf||
   !int(s.lookbackM5)||s.lookbackM5<1||s.lookbackM5>1500||
   typeof s.evidenceLocator!=="string"||!s.evidenceLocator.trim() ?
   "SOURCE_OR_WINDOW_NOT_ATTESTED":validateCounters(s);
  if(error){
   tally.invalid++;
   rows.push(fail(error,{slot:c.slot,tvSymbol:c.tv_symbol,group:g}));
   continue;
  }
  tally.responded++;
  const validH4=s.h4Closed-s.h4Incomplete;
  const historicalCRT=s.audit2C+s.audit3C+s.auditInside+s.auditMulti4+s.auditMultiN;
  if(s.c1Ok>0)tally.withC1++;
  if(s.h4Closed>0&&validH4===0)tally.blockedAllH4++;
  if(historicalCRT>0)tally.withHistoricalCRT++;
  rows.push(fail(validH4===0?"H4_NOT_READY":
   s.c1Ok===0?"H4_VALID_BUT_NO_C1":"C1_CONTEXT_OBSERVED_UNCERTIFIED",{
    slot:c.slot,tvSymbol:c.tv_symbol,group:g,
    h4Closed:s.h4Closed,h4Incomplete:s.h4Incomplete,
    h4Valid:validH4,h4Partial:s.h4Partial,
    h4Internal:s.h4Internal,h4Dst:s.h4Dst,
    c1Ok:s.c1Ok,c1Hours:s.c1Hours,
    historicalModelCount:historicalCRT
  }));
 }
 const complete=tally.responded===33;
 return fail(complete?"33_NONBTC_SNAPSHOTS_VALID_BUT_UNCERTIFIED":
   "33_NONBTC_COHORT_INCOMPLETE_OR_BLOCKED",{
  includedNonBtc:33,btcSlotExcluded:8,
  counts:Object.freeze({...tally}),
  results:Object.freeze(rows),
  independentOHLCVerified:false,realPineCompiled:false,
  perEventParityCertified:false,noRepaintCertified:false,
  note:"33/33 responses are not 33 CRT signals, OHLC parity or a production certification. BTC is audited separately."
 });
}
