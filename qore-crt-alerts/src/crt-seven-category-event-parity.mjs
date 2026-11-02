// V34.11b: strict, read-only event evidence reconciliation for all 34 feeds.
// A seven-bit snapshot match is NOT an event match. Fail closed on missing
// independent Pine and Trader Lab event traces; never send alerts.
import {compareSevenCrtCategories34,CATEGORY_BITS}
  from "./crt-seven-category-parity-audit.mjs";

export const PINE_V34_11B_SOURCE_SHA="28c8c731c943d9c3b3f8a2cc77746dee3a02f8c6";
export const PINE_V34_11C_SOURCE_SHA="3c202bf8ff7eaec8b8f043aad8d0117cccd900ca";
export const PINE_V34_11D_SOURCE_SHA="d1c26edc67fb6554bc32f71c96c7cbdfdefa6a84";
export const PINE_V34_11E_SOURCE_SHA="d95872057233e58c128f1c6171c620bdb2524b30";
export const PINE_V34_11F_SOURCE_SHA="4e0d5541413fa0054c8fad827a8023929d105177";
export const PINE_V34_11G_SOURCE_SHA="ea619e19b271bfffed96fe05bc71fa6c584c1316";
export const PINE_V34_11H_SOURCE_SHA="638b01991bfce4901dbdfb3b9d640a8cdb896fd1";
export const PINE_V34_11I_SOURCE_SHA="ca7ad8c339a5ea82b63a316d4af95bc82abba28f";
const VERIFIED_QA_SOURCE_BLOBS=new Set([PINE_V34_11B_SOURCE_SHA,PINE_V34_11C_SOURCE_SHA,PINE_V34_11D_SOURCE_SHA,PINE_V34_11E_SOURCE_SHA,PINE_V34_11F_SOURCE_SHA,PINE_V34_11G_SOURCE_SHA,PINE_V34_11H_SOURCE_SHA,PINE_V34_11I_SOURCE_SHA]);
const statusByCategory=Object.freeze({
 CRT_3C_REVERSAL:"RATIFIED",
 CRT_2C_CANDIDATE:"PROVISIONAL",
 CRT_2C_EXPANSION:"REJECTED",
 CRT_INSIDE_RETURN:"QA_RATIFIED",
 CRT_INSIDE_CONTINUATION:"REJECTED",
 CRT_MULTICANDLE:"QA_RATIFIED",
 CRT_M15_RETEST:"QA_OBSERVED"
});
const ms=x=>Number.isSafeInteger(x)&&x>=0;
const number=x=>typeof x==="number"&&Number.isFinite(x);
const sorted=x=>[...x].sort();
const nonlive=(status,extra={})=>Object.freeze({
 status,certified:false,actionable:false,sendPush:false,...extra
});
const sourceMatch=(x,f)=>x?.instrumentId===f.instrumentId&&x.provider===f.provider;
function validM15(m,e,f,asOf,requiresRetest){
 if(!m)return false;
 if(!sourceMatch(m,f)||m.timeframe!=="M15"||
    m.c1StartMs!==e.c1StartMs||!ms(m.pivotAtMs)||
    !ms(m.sweepAtMs)||!ms(m.breakAtMs)||
    !ms(m.observedUntilMs)||!number(m.pivotPrice)||
    m.pivotAtMs>=m.sweepAtMs||m.sweepAtMs>=m.breakAtMs||
    m.breakAtMs>m.observedUntilMs||m.observedUntilMs>asOf||
    m.breakAtMs%900000!==0||m.breakAtMs>e.eventAtMs+14400000)
   return false;
 if(requiresRetest)
   return ms(m.retestAtMs)&&m.retestAtMs>m.breakAtMs&&
     m.retestAtMs<=m.observedUntilMs&&m.retestAtMs%900000===0&&
     m.retestAtMs===e.eventAtMs;
 return m.retestAtMs===undefined||m.retestAtMs===null;
}
function normalize(events,snapshot,feed,asOf){
 if(!Array.isArray(events))return {error:"EVENT_TRACE_MISSING"};
 if(events.length>300)return {error:"UNBOUNDED_EVENT_TRACE"};
 const canonical=[],seen=new Set();
 let mask=0;
 for(const e of events){
  const bit=CATEGORY_BITS[e?.category],status=statusByCategory[e?.category];
  if(!bit||e.state!==status||!sourceMatch(e,feed)||
     ![-1,1].includes(e.direction)||!ms(e.c1StartMs)||
     !ms(e.eventAtMs)||e.eventAtMs<=e.c1StartMs||
     e.eventAtMs>snapshot.windowEndMs||e.eventAtMs>asOf||
     e.c1StartMs<snapshot.windowStartMs||
     e.c1StartMs%300000!==0||e.eventAtMs%300000!==0)
   return {error:"INVALID_EVENT_IDENTITY_OR_CAUSAL_TIME"};
  if(e.category==="CRT_MULTICANDLE"&&
     !["MULTI4","MULTI_N"].includes(e.variant))
   return {error:"MULTICANDLE_VARIANT_REQUIRED"};
  if(e.category!=="CRT_MULTICANDLE"&&e.variant!==undefined&&e.variant!==null)
   return {error:"EXTRANEOUS_MODEL_VARIANT"};
  if(e.category==="CRT_3C_REVERSAL"){
    if(!ms(e.c2StartMs)||e.c2StartMs<=e.c1StartMs||
       !ms(e.ratifiedAtMs)||e.ratifiedAtMs<e.c2StartMs+14400000||
       e.eventAtMs!==e.ratifiedAtMs||
       !ms(e.sweepAtMs)||e.sweepAtMs<e.c2StartMs||
       e.sweepAtMs>e.ratifiedAtMs)
      return {error:"INVALID_3C_RATIFICATION_OR_SWEEP"};
  }
  if(e.category==="CRT_M15_RETEST"&&!validM15(e.mss15,e,feed,asOf,true))
   return {error:"RETEST_M15_CAUSAL_TRACE_MISSING"};
  if(e.category!=="CRT_M15_RETEST"&&e.mss15!==undefined&&e.mss15!==null&&
      !validM15(e.mss15,e,feed,asOf,false))
   return {error:"CROSS_CYCLE_OR_INVALID_M15"};
  const signature=[e.category,e.variant??"",e.direction,e.c1StartMs,
    e.eventAtMs].join("|");
  if(seen.has(signature))return {error:"DUPLICATE_CAUSAL_EVENT"};
  seen.add(signature);mask|=bit;
  // All meaningful event times and pivot prices are compared; no rounding
  // or tolerance can make a wrong MSS M15 pass.
  canonical.push(JSON.stringify([
   e.category,e.variant??null,e.state,e.provider,e.instrumentId,
   e.direction,e.c1StartMs,e.eventAtMs,
   e.c2StartMs??null,e.sweepAtMs??null,e.ratifiedAtMs??null,
   e.mss15?[
     e.mss15.pivotAtMs,e.mss15.pivotPrice,e.mss15.sweepAtMs,
     e.mss15.breakAtMs,e.mss15.retestAtMs??null,
     e.mss15.observedUntilMs
   ]:null
  ]));
 }
 if(mask!==snapshot.categoryMask)return {error:"MASK_NOT_RECONCILED_WITH_EVENTS"};
 return {canonical:sorted(canonical),count:events.length,mask};
}
export function compareSevenCrtEventTraces34(input={}){
 if(!VERIFIED_QA_SOURCE_BLOBS.has(input.pineSourceBlobSha))
   throw Error("UNRECOGNIZED_PINE_V34_11B_11C_11D_11E_11F_11G_11H_11I_SOURCE_SHA");
 const base=compareSevenCrtCategories34(input);
 const bySlot=arr=>new Map((arr??[]).map(x=>[x.slot,x]));
 const feeds=bySlot(input.feeds),pines=bySlot(input.pineCaptures),
  labs=bySlot(input.labSnapshots);
 const results=[],allCategories=new Set();
 let matched=0,eventsCompared=0;
 for(const row of base.results){
  if(row.status!=="SEVEN_CATEGORY_MASK_MATCH_UNCERTIFIED"){
   results.push(nonlive("MASK_OR_SOURCE_NOT_READY",{
    slot:row.slot,symbol:row.symbol,reason:row.status
   }));
   continue;
  }
  const feed=feeds.get(row.slot),pine=pines.get(row.slot),
   lab=labs.get(row.slot);
  const p=normalize(pine.events,pine,feed,input.asOf);
  const l=normalize(lab.events,lab,feed,input.asOf);
  if(p.error||l.error){
   results.push(nonlive("INVALID_OR_MISSING_EVENT_TRACE",{
    slot:row.slot,symbol:row.symbol,
    pineReason:p.error??null,labReason:l.error??null
   }));
   continue;
  }
  const labOnly=l.canonical.filter(x=>!p.canonical.includes(x));
  const pineOnly=p.canonical.filter(x=>!l.canonical.includes(x));
  if(labOnly.length||pineOnly.length){
   results.push(nonlive("EVENT_TRACE_MISMATCH",{
    slot:row.slot,symbol:row.symbol,labOnly, pineOnly
   }));
   continue;
  }
  matched++;eventsCompared+=l.count;
  for(const e of lab.events)allCategories.add(e.category);
  results.push(nonlive(l.count?"EVENT_TRACE_MATCH_UNCERTIFIED":"NO_EVENTS_TO_COMPARE",{
   slot:row.slot,symbol:row.symbol,matchedEvents:l.count
  }));
 }
 return nonlive(
  matched===34&&eventsCompared>0?
    "ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED":
    "EVENT_PARITY_BLOCKED_OR_EMPTY",{
   comparedSlots:34,matchedSlots:matched,matchedEvents:eventsCompared,
   distinctCategoriesObserved:allCategories.size,
   coveredCategories:sorted(allCategories),
   realPineCompilationCertified:false,holdoutCertified:false,
   mssM15RuntimeCertified:false,androidE2eCertified:false,
   results:Object.freeze(results),
   note:"Matching attested events are not proof of real Pine execution, no repaint, real independent source equivalence or approved signals."
 });
}
