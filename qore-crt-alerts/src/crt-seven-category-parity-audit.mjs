// Replay-only 34-feed seven-category parity protocol.
// NEVER converts matching test fixtures into real TradingView certification.
// Lab and TradingView inputs must originate independently; this does not
// reproduce f_engine() and is NOT a market data collector or push sender.
import {hashM5} from "./parity-audit.mjs";

export const CATEGORY_BITS=Object.freeze({
 CRT_3C_REVERSAL:1,CRT_2C_CANDIDATE:2,CRT_2C_EXPANSION:4,
 CRT_INSIDE_RETURN:8,CRT_INSIDE_CONTINUATION:16,
 CRT_MULTICANDLE:32,CRT_M15_RETEST:64
});
const keys=Object.keys(CATEGORY_BITS);
const fail=(status,extra={})=>Object.freeze({
 status,certified:false,actionable:false,sendPush:false,...extra
});
const safe=x=>Number.isSafeInteger(x)&&x>=0;
const sha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const pineSha=x=>typeof x==="string"&&/^[a-f0-9]{40}$/.test(x);
const validMask=x=>safe(x)&&x<=127;
// Every feed has one exact native M5 phase in {0,1,2,3,4} minutes.
// No tolerances, borrowing BTC's phase or shifting OHLC timestamps.
const sourcePhase=x=>Number.isSafeInteger(x)&&x>=0&&x<=4;
const phaseOf=t=>t%300000/60000;
export function decodeSevenCrtCategoryMask(mask){
 if(!validMask(mask))throw Error("INVALID_SEVEN_CATEGORY_MASK");
 return Object.freeze(Object.fromEntries(keys.map(k=>[k,Math.floor(mask/CATEGORY_BITS[k])%2===1])));
}
function verifySnapshot(x,{symbol,provider,sha256,asOf,count,start,end,pineSourceBlobSha,sourcePhaseMin},isPine){
 if(!x)return "MISSING_"+(isPine?"PINE":"LAB")+"_EVIDENCE";
 if(x.instrumentId!==symbol||x.provider!==provider||
    x.candleSha256!==sha256||x.asOf!==asOf||
    x.windowM5Count!==count||x.windowStartMs!==start||
    x.windowEndMs!==end)return "SOURCE_OHLC_WINDOW_MISMATCH";
 if(!validMask(x.categoryMask)||x.sendPush!==false||
    x.actionable!==false)return "UNSAFE_OR_INVALID_CATEGORY_EVIDENCE";
 if(isPine){
   if(x.engine!=="TRADINGVIEW_PINE_V6_CAPTURE"||
      x.verifiedOnTradingView!==true||
      x.pineBlobSha!==pineSourceBlobSha||
      typeof x.evidenceLocator!=="string"||!x.evidenceLocator.trim())
     return "PINE_PROVENANCE_NOT_VERIFIED";
 }else if(x.engine!=="INDEPENDENT_TRADER_LAB_SEVEN_CATALOG_REPLAY"||
          typeof x.evidenceLocator!=="string"||!x.evidenceLocator.trim())
   return "LAB_PROVENANCE_NOT_VERIFIED";
 if(x.sourcePhaseMin!==undefined&&x.sourcePhaseMin!==sourcePhaseMin)
   return "SOURCE_PHASE_MISMATCH";
 if((x.categoryMask&64)!==0){
   const p=x.mss15Proof;
   if(!p||p.timeframe!=="M15"||p.instrumentId!==symbol||
      p.provider!==provider||!safe(p.c1StartMs)||!safe(p.sweepAtMs)||
      !safe(p.pivotAtMs)||!safe(p.mssAtMs)||!safe(p.retestAtMs)||
      !safe(p.observedUntilMs)||p.pivotAtMs>=p.sweepAtMs||
      p.sweepAtMs>=p.mssAtMs||p.mssAtMs>=p.retestAtMs||
      p.mssAtMs>p.observedUntilMs||p.retestAtMs>p.observedUntilMs||
      p.mssAtMs%900000!==sourcePhaseMin*60000||
      p.retestAtMs%900000!==sourcePhaseMin*60000)
     return "M15_RETEST_CAUSAL_PROOF_MISSING";
 }
 return null;
}
export function compareSevenCrtCategories34({
 catalog,feeds,pineCaptures=[],labSnapshots=[],asOf,pineSourceBlobSha
}={}){
 if(!Array.isArray(catalog)||catalog.length!==34||
    !Array.isArray(feeds)||feeds.length!==34||
    !Array.isArray(pineCaptures)||!Array.isArray(labSnapshots)||
    !safe(asOf)||!pineSha(pineSourceBlobSha))
  throw Error("34_SCOPE_OR_PINE_SOURCE_INVALID");
 const slots=new Set(),symbols=new Set();
 for(const c of catalog){
  if(!safe(c?.slot)||typeof c.source_symbol!=="string"||
     !c.source_symbol||slots.has(c.slot)||symbols.has(c.source_symbol))
   throw Error("DUPLICATE_CATALOG_SOURCE");
  slots.add(c.slot);symbols.add(c.source_symbol);
 }
 const read=(items,kind)=>{
  const m=new Map();
  for(const x of items){
   if(!slots.has(x?.slot)||m.has(x.slot))throw Error("DUPLICATE_OR_UNKNOWN_"+kind+"_SLOT");
   m.set(x.slot,x);
  }
  return m;
 };
 const byFeed=read(feeds,"FEED"),byPine=read(pineCaptures,"PINE"),
  byLab=read(labSnapshots,"LAB");
 const rows=[];
 for(const entry of catalog){
  const f=byFeed.get(entry.slot);
  if(!f||f.instrumentId!==entry.source_symbol||
     typeof f.provider!=="string"||!f.provider||
     !Array.isArray(f.closedM5)||!f.closedM5.length)
   throw Error("MISSING_OR_UNBOUND_M5_SOURCE:"+entry.source_symbol);
  const window=f.closedM5.slice(-1500);
  const sourcePhaseMin=phaseOf(window[0].openedAt);
  if(!sourcePhase(sourcePhaseMin))
   throw Error("INVALID_SOURCE_NATIVE_M5_PHASE");
  for(let i=0;i<window.length;i++){
   const x=window[i],previous=i>0?window[i-1]:null;
   if(x?.provider!==f.provider||x.instrumentId!==f.instrumentId||
      !safe(x.openedAt)||!safe(x.closedAt)||
      x.closedAt!==x.openedAt+300000||x.closedAt>asOf||
      (previous&&x.openedAt<=previous.openedAt))
    throw Error("OPEN_FUTURE_UNSORTED_OR_MIXED_M5");
    if(phaseOf(x.openedAt)!==sourcePhaseMin)
      throw Error("M5_SOURCE_PHASE_DRIFT");
  }
  const sha256=hashM5(window);
  if(!sha(sha256))throw Error("INVALID_M5_DIGEST");
  const expected={symbol:f.instrumentId,provider:f.provider,sha256,asOf,
    count:window.length,start:window[0].openedAt,end:window.at(-1).closedAt,
    pineSourceBlobSha,sourcePhaseMin};
  const pine=byPine.get(entry.slot),lab=byLab.get(entry.slot);
  const labReason=verifySnapshot(lab,expected,false);
  const pineReason=verifySnapshot(pine,expected,true);
  if(labReason||pineReason){
   rows.push(fail(labReason||pineReason,{slot:entry.slot,symbol:f.instrumentId,
    missingOrInvalidSide:labReason?"LAB":"PINE"}));
   continue;
  }
  const diffs=keys.filter(k=>decodeSevenCrtCategoryMask(lab.categoryMask)[k]!==
    decodeSevenCrtCategoryMask(pine.categoryMask)[k]);
  rows.push(fail(diffs.length?"SEVEN_CATEGORY_PARITY_MISMATCH":"SEVEN_CATEGORY_MASK_MATCH_UNCERTIFIED",{
   slot:entry.slot,symbol:f.instrumentId,provider:f.provider,
   comparedCategories:7,differences:Object.freeze(diffs),
   candleSha256:sha256,windowM5Count:window.length,sourcePhaseMin,
   // A mask match is not proof that both independently computed timestamps
   // and MSS pivot/first-break events are the same.
   requiresPerEventMss15Parity:true
  }));
 }
 const matched=rows.filter(r=>r.status==="SEVEN_CATEGORY_MASK_MATCH_UNCERTIFIED").length;
 return fail(matched===34?"CATALOG_34_MASKS_MATCH_BUT_UNCERTIFIED":"CATALOG_34_PARITY_BLOCKED",{
  comparedSlots:34,matchedSlots:matched,blockedOrMismatched:34-matched,
  results:Object.freeze(rows),pineCompilationVerified:false,
  eventByEventMss15Verified:false,androidPushE2eVerified:false,
  note:"Masks/contract only. Real editor, OHLC provenance and timestamped MSS events are mandatory."
 });
}
