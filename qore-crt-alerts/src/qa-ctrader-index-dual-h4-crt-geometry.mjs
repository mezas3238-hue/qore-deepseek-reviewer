// QORE CRT: non-actionable side-by-side index H4 GEOMETRY only.
// Uses one authenticated 600-M5 IC Markets cTrader DEMO source and two
// independent H4 partitions. Never feed the alternative partition to the
// approved CRT/MSS engine or infer TradingView/Pine event parity.
import {aggregateClosedM5} from "./aggregate.mjs";
import {nyParts,C1_HOURS} from "./ny-clock.mjs";
import {INDICES_FOR_SEASONAL_H4}
 from "./qa-ctrader-index-h4-seasonal-2026.mjs";
import {inspectAll34NativeVsOwnerH4ClockQA}
 from "./qa-ctrader-34-native-vs-owner-h4-clock.mjs";
const M5=300_000,H4=14_400_000;
const UNAPPROVED_NATIVE_INDEX_C1_NY=Object.freeze([1,5,21]);
const noTrade=(state,more={})=>Object.freeze({
 state,...more,analyticalOnly:true,clockChangeAuthorized:false,
 ownerC1ClockUnchanged:true,crtCertified:false,mssM5Certified:false,
 mssM15Certified:false,pineEventParityCertified:false,
 tradingViewSourceParityCertified:false,noRepaintCertified:false,
 actionable:false,canTrade:false,sendPush:false
});
const key=x=>[x.c1OpenMs,x.c2CloseMs,x.category,x.direction].join("|");
function nativeH4Partition(bars,phase,provider,instrumentId){
 const groups=new Map(),offset=phase*60_000;
 for(const x of bars){
  const start=Math.floor((x.openedAt-offset)/H4)*H4+offset;
  if(!groups.has(start))groups.set(start,[]);
  groups.get(start).push(x);
 }
 const complete=[],incomplete=[];
 for(const [start,bucket] of groups){
  if(bucket.length!==48||bucket[0].openedAt!==start||
    bucket.at(-1).closedAt!==start+H4||
    bucket.some((b,i)=>i>0&&bucket[i-1].closedAt!==b.openedAt)){
   incomplete.push(Object.freeze({at:start,observedM5:bucket.length}));
   continue;
  }
  complete.push(Object.freeze({
   openedAt:start,closedAt:start+H4,timeframe:"H4",
   provider,instrumentId,
   open:bucket[0].open,high:Math.max(...bucket.map(x=>x.high)),
   low:Math.min(...bucket.map(x=>x.low)),close:bucket.at(-1).close,
   // This is observational and cannot be interpreted as approval.
   candidateC1Only:UNAPPROVED_NATIVE_INDEX_C1_NY.includes(nyParts(start).hour)
  }));
 }
 complete.sort((a,b)=>a.openedAt-b.openedAt);
 return {complete,incomplete};
}
function oneSweep(c1,b){
 const low=b.low<c1.low,high=b.high>c1.high;
 return low===high?0:low?1:-1;
}
function inRange(price,b){return price>=b.low&&price<=b.high;}
function contiguous(bars,i,n){
 return i+n<=bars.length&&bars.slice(i+1,i+n)
   .every((b,j)=>bars[i+j].closedAt===b.openedAt);
}
function geometry(bars,c1Hours){
 const categories={
  c1WithClosedC2:0,c2SingleSweepReturn:0,c2ExpansionRejected:0,
  c2DoubleSweepRejected:0,c2NoSweep:0,
  c3ClosedValid:0,c3ClosedInvalidated:0,
  strictInsideCandidates:0,strictInsideReturn:0,
  multiConsolidationReturn:0,distributedFourH4Hypothesis:0
 };
 const witnesses=[];
 function witness(c1,c2,category,direction=0,terminalAt=c2.closedAt){
  witnesses.push(Object.freeze({
   category,direction,c1OpenMs:c1.openedAt,c2CloseMs:c2.closedAt,
   terminalClosedAtMs:terminalAt,nonActionable:true
  }));
 }
 for(let i=0;i<bars.length;i++){
  const c1=bars[i];
  if(!c1Hours.includes(nyParts(c1.openedAt).hour)||
     !contiguous(bars,i,2))continue;
  const c2=bars[i+1];categories.c1WithClosedC2++;
  const sweptLow=c2.low<c1.low,sweptHigh=c2.high>c1.high;
  const direction=oneSweep(c1,c2);
  if(sweptLow&&sweptHigh){
   categories.c2DoubleSweepRejected++;
   witness(c1,c2,"DOUBLE_SWEEP_REJECTED");
  }else if(direction&&inRange(c2.close,c1)){
   categories.c2SingleSweepReturn++;
   witness(c1,c2,"C2_SINGLE_SWEEP_RETURN_QA",direction);
   if(contiguous(bars,i,3)){
    const c3=bars[i+2];
    const invalid=direction===1?
      c3.close<c2.low:c3.close>c2.high;
    if(invalid)categories.c3ClosedInvalidated++;
    else categories.c3ClosedValid++;
    witness(c1,c2,invalid?"C3_INVALIDATED_QA":
      "C3_CLOSED_VALID_QA",direction,c3.closedAt);
   }
  }else if(direction){
   categories.c2ExpansionRejected++;
   witness(c1,c2,"C2_EXPANSION_REJECTED",direction);
  }else{
   categories.c2NoSweep++;
   witness(c1,c2,"NO_SINGLE_SWEEP");
  }
  if(c2.high<c1.high&&c2.low>c1.low){
   categories.strictInsideCandidates++;
   if(contiguous(bars,i,3)){
    const c3=bars[i+2],s=oneSweep(c2,c3);
    if(s&&inRange(c3.close,c2)){
     categories.strictInsideReturn++;
     witness(c1,c2,"INSIDE_RETURN_QA",s,c3.closedAt);
    }
   }
  }
  // C1 + N strict interior candles (N=2..5) + terminal single
  // sweep which closes back inside C1, all already closed. This is
  // only a geometry hypothesis, NOT the seven-role Pine f_engine().
  for(let n=2;n<=5;n++){
   if(!contiguous(bars,i,n+2))break;
   const middle=bars.slice(i+1,i+n+1);
   if(!middle.every(b=>b.high<c1.high&&b.low>c1.low))break;
   const last=bars[i+n+1],s=oneSweep(c1,last);
   if(s&&inRange(last.close,c1)){
    categories.multiConsolidationReturn++;
    witness(c1,c2,"MULTI_N_GEOMETRY_QA",s,last.closedAt);
    break;
   }
   if(!inRange(last.close,c1))break;
  }
  if(contiguous(bars,i,4)){
   const [c2a,c2b,c3]=bars.slice(i+1,i+4);
   // Independent four-H4 distributed-sweep hypothesis; one witness
   // only. Never promote to approved MULTI4/CRT.
   const low=c2a.low<c1.low&&c2a.high<=c1.high&&
      c2b.high<=c1.high&&c2b.low<=c1.low;
   const high=c2a.high>c1.high&&c2a.low>=c1.low&&
      c2b.low>=c1.low&&c2b.high>=c1.high;
   const returns=inRange(c2a.close,c1)&&inRange(c2b.close,c1);
   if(low!==high&&returns&&
     (low?(c3.close>c2b.close&&c3.close>=c1.low):
          (c3.close<c2b.close&&c3.close<=c1.high))){
    categories.distributedFourH4Hypothesis++;
    witness(c1,c2,"MULTI4_DISTRIBUTION_QA",low?1:-1,c3.closedAt);
   }
  }
 }
 return Object.freeze({
  counts:Object.freeze(categories),
  // The causal identity includes C1 and C2 close, not just a seven-bit mask.
  witnessKeys:Object.freeze(witnesses.map(key).sort()),
  witnessed: Object.freeze(witnesses.sort((a,b)=>
    a.c1OpenMs-b.c1OpenMs||a.terminalClosedAtMs-b.terminalClosedAtMs)),
  missingC1AndC2NotInferred:true
 });
}
export function compareIndexH4GeometryTwoClocksQA({
 instrumentId,symbolId,closedM5,asOfMs,nativeH4
}={}){
 const id=INDICES_FOR_SEASONAL_H4[instrumentId];
 if(!id||id.id!==symbolId||C1_HOURS.index.join(",")!=="2,6,22")
  throw Error("CRT_INDEX_DUAL_CLOCK_APPROVED_SCOPE_CHANGED");
 // Existing independent gate checks 600 closed M5, IC broker ID, demo
 // provenance and native-vs-M5 H4 OHLC; fail closed on missing proof.
 const base=inspectAll34NativeVsOwnerH4ClockQA({
  instrumentId,symbolId,closedM5,asOfMs,nativeH4
 });
 if(!base.comparisonScope||!Number.isInteger(base.nativeH4UtcPhaseMin))
  return noTrade("INDEX_DUAL_H4_SOURCE_OR_PHASE_NOT_PROVEN_QA",{
   instrumentId,reason:base.state
  });
 const owner=aggregateClosedM5(closedM5,{timeframe:"H4",family:"index"});
 const native=nativeH4Partition(closedM5,
   base.nativeH4UtcPhaseMin,"IC",instrumentId);
 const original=geometry(owner.complete,C1_HOURS.index);
 const alternative=geometry(native.complete,UNAPPROVED_NATIVE_INDEX_C1_NY);
 const idsOwner=new Set(original.witnessKeys);
 const idsNative=new Set(alternative.witnessKeys);
 const common=[...idsOwner].filter(x=>idsNative.has(x)).length;
 const onlyOwner=[...idsOwner].filter(x=>!idsNative.has(x));
 const onlyNative=[...idsNative].filter(x=>!idsOwner.has(x));
 return noTrade("INDEX_H4_GEOMETRY_TWO_CLOCKS_COMPARED_UNCERTIFIED",{
  instrumentId,symbolId,source:"IC_MARKETS_CTRADER_DEMO_CLOSED_M5",
  same600M5ForBoth:true,closedM5Compared:closedM5.length,
  nativeH4PhaseUtcMinutes:base.nativeH4UtcPhaseMin,
  approvedOwnerC1NY:Object.freeze([...C1_HOURS.index]),
  nativeCandidateC1NY:Object.freeze([...UNAPPROVED_NATIVE_INDEX_C1_NY]),
  ownerCompleteH4:owner.complete.length,
  nativeCompleteH4:native.complete.length,
  ownerRejectedH4:owner.rejected.length,
  nativeIncompleteH4:native.incomplete.length,
  ownerGeometry:original.counts,
  unapprovedNativeGeometry:alternative.counts,
  ownerWitnesses:original.witnessed,
  unapprovedNativeWitnesses:alternative.witnessed,
  sharedWitnessIdentities:common,ownerOnlyWitnessIdentities:onlyOwner.length,
  nativeOnlyWitnessIdentities:onlyNative.length,
  ownerClockMatchesNative:base.requiresOwnerClockReview===false,
  indexCrtMssBlocked:true,
  requiresOwnerMethodologyDecision:true,
  nativeSameWindowM5H4VerifiedOnly:true,
  seasonalNativeH4DoesNotEstablishPriceOrPineParity:true,
  sevenCategoryEventParityCertified:false
 });
}
