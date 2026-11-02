import {bucketNY,nyParts} from "./ny-clock.mjs";
import {inspectCrtMorphologies} from "./crt-structural-morphologies.mjs";

const M5=300000;
const H4=14_400_000;
const okNumber=n=>typeof n==="number"&&Number.isFinite(n);
const safeInt=n=>Number.isSafeInteger(n);
const families=Object.freeze({forex:true,index:true,crypto:true});

// cTrader has provider-relative integer prices. Structural comparisons use
// those exact integer units; NEVER assume an unverified decimal scale.
// This module is read-only and returns no prices in reports or artifacts.
export function decodeCTraderRawM5(row,identity){
 if(!row||!identity||typeof identity.source_symbol!=="string"||
   !safeInt(identity.provider_symbol_id) || identity.provider_symbol_id<=0||
   typeof identity.provider_tag!=="string" || !identity.provider_tag ||
   !safeInt(identity.digits)||identity.digits<0||identity.digits>12)
   throw Error("SOURCE_IDENTITY_UNVERIFIED");
 if(row.canonical_symbol!==identity.source_symbol ||
    row.provider_symbol!==identity.provider_symbol ||
    row.provider_symbol_id!==identity.provider_symbol_id ||
    row.digits!==identity.digits)
   throw Error("PROVIDER_SYMBOL_IDENTITY_MISMATCH");
 const fields=["utc_timestamp_in_minutes","low_relative","delta_open",
  "delta_high","delta_close","open_relative","high_relative","close_relative"];
 if(fields.some(k=>!safeInt(row[k]))||row.low_relative<=0||
   row.delta_open<0||row.delta_high<0||row.delta_close<0)
   throw Error("INVALID_NATIVE_TRENDBAR");
 if(row.open_relative!==row.low_relative+row.delta_open ||
    row.high_relative!==row.low_relative+row.delta_high ||
    row.close_relative!==row.low_relative+row.delta_close ||
    row.high_relative<Math.max(row.open_relative,row.close_relative))
   throw Error("NATIVE_OHLC_RELATIVE_MISMATCH");
 const openedAt=row.utc_timestamp_in_minutes*60000;
 if(!safeInt(openedAt)||openedAt%M5!==0 ||
    !row.opened_at||Date.parse(row.opened_at)!==openedAt)
   throw Error("M5_TIMESTAMP_OR_ALIGNMENT_INVALID");
 return Object.freeze({
  timeframe:"M5",openedAt,closedAt:openedAt+M5,
  provider:identity.provider_tag,instrumentId:identity.source_symbol,
  providerSymbolId:identity.provider_symbol_id,
  open:row.open_relative,high:row.high_relative,
  low:row.low_relative,close:row.close_relative,
  priceUnit:"CTRADER_NATIVE_INTEGER",
  observedFrom:"LICENSED_ARCHIVE_IF_APPROVED"
 });
}
function barGuard(b,identity){
 return !!b&&b.timeframe==="M5"&&b.provider===identity.provider&&
 b.instrumentId===identity.instrumentId&&safeInt(b.openedAt)&&
 safeInt(b.closedAt)&&b.closedAt-b.openedAt===M5&&
 [b.open,b.high,b.low,b.close].every(okNumber)&&
 b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close)&&
 b.openedAt%M5===0;
}

// NY-clock-complete, fail-closed conversion of M5 to H4 for historical QA.
// 48 contiguous M5 required: 36/60 DST, sessions, weekends and source gaps
// are OBSERVABLE but NEVER silently promoted into a valid CRT.
export function buildNyH4FromClosedM5({closedM5,family,provider,instrumentId,asOf}){
 if(!families[family]||typeof provider!=="string"||!provider||
   typeof instrumentId!=="string"||!instrumentId||
   !safeInt(asOf)||!Array.isArray(closedM5))throw Error("INVALID_M5_REPLAY_INPUT");
 const identity={provider,instrumentId},groups=[],seen=new Set();
 let current=null,prev=null;
 for(const bar of closedM5){
  if(!barGuard(bar,identity))throw Error("M5_OHLC_OR_IDENTITY_INVALID");
  if(bar.closedAt>asOf)throw Error("LOOKAHEAD_OR_OPEN_M5_FORBIDDEN");
  if(prev&&bar.openedAt<=prev.openedAt)throw Error("DUPLICATE_OR_UNSORTED_M5");
  const bucket=bucketNY(bar.openedAt,"H4",family);
  // A time-zone transition can create 36/60-bar buckets, never force 48.
  if(!current||bucket.key!==current.key){
   current={key:bucket.key,nyHour:bucket.hour,allowedC1:bucket.allowedC1,bars:[]};
   if(seen.has(current.key))throw Error("DUPLICATE_H4_BUCKET_OR_CLOCK_REVERSAL");
   seen.add(current.key);groups.push(current);
  }
  current.bars.push(bar);prev=bar;
 }
 const h4=[],rejected=[];
 for(const g of groups){
  const bars=g.bars,first=bars[0],last=bars[bars.length-1];
  const startNY=nyParts(first.openedAt);
  let contiguous=true;
  for(let i=1;i<bars.length;i++){
   if(bars[i].openedAt-bars[i-1].openedAt!==M5){contiguous=false;break;}
  }
  const correctStart=startNY.hour===g.nyHour&&startNY.minute===0;
  const valid=correctStart&&contiguous&&bars.length===48&&
   last.closedAt===first.openedAt+H4;
  if(!valid){
   const reason=!contiguous?"INTERNAL_M5_DISCONTINUITY":
    !correctStart?"SESSION_OR_HISTORY_PARTIAL":
    (bars.length===36||bars.length===60)?"DST_OR_UNUSUAL_NY_BUCKET":
    "H4_PARTIAL_OR_NONSTANDARD_SESSION";
   rejected.push(Object.freeze({key:g.key,reason,observedM5:bars.length,
    nyHour:g.nyHour,provider,instrumentId}));
   continue;
  }
  h4.push(Object.freeze({
   timeframe:"H4",openedAt:first.openedAt,closedAt:last.closedAt,
   provider,instrumentId,nyHour:g.nyHour,allowedC1:g.allowedC1,
   open:first.open,close:last.close,
   high:Math.max(...bars.map(x=>x.high)),low:Math.min(...bars.map(x=>x.low))
  }));
 }
 return Object.freeze({
  closedH4:Object.freeze(h4),
  excludedH4:Object.freeze(rejected),
  scannedM5:closedM5.length,priceUnit:"UNCHANGED_SOURCE_UNITS",
  certified:false,sendPush:false
 });
}

// Exact 34-scope smoke/parity QA: no real data acquired by this function.
// Input must already be authorized, immutable, and source-separated.
export function run34CrtM5ContextQA({catalog,feeds,asOf}){
 if(!Array.isArray(catalog)||catalog.length!==34||
   !Array.isArray(feeds)||feeds.length!==34||!safeInt(asOf))
   throw Error("34_INDEPENDENT_SOURCES_REQUIRED");
 const byId=new Map();
 for(const f of feeds){
  if(!safeInt(f.slot)||byId.has(f.slot))throw Error("DUPLICATE_SOURCE_SLOT");
  byId.set(f.slot,f);
 }
 const results=[];
 for(const entry of catalog){
  const f=byId.get(entry.slot);
  if(!f||f.instrumentId!==entry.source_symbol||!families[f.family]||
     typeof f.provider!=="string"||!f.provider||
     !Array.isArray(f.closedM5))throw Error("UNBOUND_SOURCE:"+entry.source_symbol);
  const built=buildNyH4FromClosedM5({...f,asOf});
  // No stitching sessions or providers: existing morphologies validate
  // contiguous closed H4 for CRT C1/C2/C3.
  const inspected=inspectCrtMorphologies({closedH4:built.closedH4,family:f.family});
  results.push(Object.freeze({
   slot:entry.slot,symbol:f.instrumentId,provider:f.provider,
   historicalH4:built.closedH4.length,
   ignoredPartialH4:built.excludedH4.length,
   structuralQaCandidates:inspected.signals.length,
   diagnosticPatterns:inspected.diagnostics.length,
   holdoutStatus:"NOT_SEALED",
   live:false,sendPush:false
  }));
 }
 return Object.freeze({
  symbolCount:34,results:Object.freeze(results),
  status:"OFFLINE_M5_H4_STRUCTURAL_QA",
  actualHoldoutCertified:false,sourceLicenseCertified:false,
  pineCompiled:false,pushE2e:false
 });
}
