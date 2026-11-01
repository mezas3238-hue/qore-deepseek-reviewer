import {C1_HOURS} from "./ny-clock.mjs";
// QA-only autonomous structural detectors. Source is ALWAYS completed bars
// from one provider. Neither is approved as a standalone trading strategy.
// A detected 4C pattern or retest never upgrades the 3C+M15 signal gate.
const H4=14400000,M15=900000;
const out=(state,meta={})=>Object.freeze({
 state,environment:"OFFLINE_REPLAY",certified:false,
 actionable:false,sendPush:false,...meta
});
const numeric=x=>typeof x==="number"&&Number.isFinite(x);
const barOK=(b,tf,ms)=>b&&b.timeframe===tf&&
 Number.isSafeInteger(b.openedAt)&&Number.isSafeInteger(b.closedAt)&&
 b.closedAt-b.openedAt===ms&&
 [b.high,b.low,b.close].every(numeric)&&
 b.high>=b.low&&b.close>=b.low&&b.close<=b.high&&
 typeof b.provider==="string"&&typeof b.instrumentId==="string";
export function detectFourCandleCrt({h4=[],family}={}){
 if(!Array.isArray(h4)||h4.length<4||!C1_HOURS[family])
  return out("MULTI4_INCOMPLETE");
 const xs=h4.slice(-4);
 if(!xs.every(b=>barOK(b,"H4",H4))||
    !xs.every(b=>b.provider===xs[0].provider&&b.instrumentId===xs[0].instrumentId)||
    !xs.slice(1).every((b,i)=>xs[i].closedAt===b.openedAt)||
    !C1_HOURS[family].includes(xs[0].nyHour)||
    xs[0].allowedC1!==true)
  return out("MULTI4_INVALID_CONTINUITY_OR_SOURCE");
 const [c1,c2a,c2b,c3]=xs;
 const c2aReturns=c2a.close>=c1.low&&c2a.close<=c1.high;
 const c2bReturns=c2b.close>=c1.low&&c2b.close<=c1.high;
 const sweptLow=c2a.low<c1.low&&c2a.high<=c1.high&&c2b.high<=c1.high;
 const sweptHigh=c2a.high>c1.high&&c2a.low>=c1.low&&c2b.low>=c1.low;
 if(sweptLow===sweptHigh||!c2aReturns||!c2bReturns)
  return out("MULTI4_REJECTED_SWEEP_OR_RETURN");
 const bullish=sweptLow&&c2b.low<=c1.low&&
   c3.close>c2b.close&&c3.close>=c1.low;
 const bearish=sweptHigh&&c2b.high>=c1.high&&
   c3.close<c2b.close&&c3.close<=c1.high;
 if(bullish===bearish)return out("MULTI4_DISTRIBUTION_NOT_CONFIRMED");
 return out(bullish?"MULTI4_BULL_QA":"MULTI4_BEAR_QA",{
   provider:c1.provider,instrumentId:c1.instrumentId,
   direction:bullish?1:-1,c1Start:c1.openedAt,
   detectedAt:c3.closedAt,model:"CRT_MULTICANDLE",
   noEntryWithoutIndependentRule:true
 });
}
export function detectPostMssM15Retest({
 closedM15=[],provider,instrumentId,cycleId,
 direction,mssAt,pivotPrice,maxMinutes=240
}={}){
 if(![1,-1].includes(direction)||!Number.isSafeInteger(mssAt)||
   mssAt%M15!==0||!numeric(pivotPrice)||pivotPrice<=0||
   typeof provider!=="string"||!provider||
   typeof instrumentId!=="string"||!instrumentId||
   typeof cycleId!=="string"||!cycleId||
   !Number.isInteger(maxMinutes)||maxMinutes<15||maxMinutes>240||
   !Array.isArray(closedM15))
  return out("RETEST_INVALID_INPUT");
 const sorted=[...closedM15].sort((a,b)=>a.openedAt-b.openedAt);
 if(sorted.some(b=>!barOK(b,"M15",M15)||
   b.provider!==provider||b.instrumentId!==instrumentId))
  return out("RETEST_SOURCE_OR_DATA_REJECTED");
 let lastEnd=null;
 for(const bar of sorted){
  if(bar.closedAt<=mssAt)continue;
  if(bar.closedAt>mssAt+maxMinutes*60000)
   return out("RETEST_EXPIRED");
  if(lastEnd!==null&&lastEnd!==bar.openedAt)
   return out("RETEST_M15_GAP");
  // First post-MSS M15 must start exactly at event closure; otherwise
  // the last pre-event partial M15 could create a phantom retest.
  if(lastEnd===null&&bar.openedAt!==mssAt)
   return out("RETEST_M15_GAP");
  lastEnd=bar.closedAt;
  const touched=direction===1?
     bar.low<=pivotPrice&&bar.close>pivotPrice:
     bar.high>=pivotPrice&&bar.close<pivotPrice;
  if(touched)return out("RETEST_M15_OBSERVED_QA",{
    provider,instrumentId,cycleId,direction,pivotPrice,
    mssAt,retestAt:bar.closedAt,
    // Same completed M15 whose high/low touched the frozen pivot
    // and whose close independently ratified the return.
    retestHigh:bar.high,retestLow:bar.low,retestClose:bar.close,
    timeframe:"M15",model:"CRT_M15_RETEST",noIndependentEntry:true
  });
 }
 return out("RETEST_PENDING");
}
