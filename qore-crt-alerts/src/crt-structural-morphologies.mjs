import {C1_HOURS} from "./ny-clock.mjs";
import {detectFourCandleCrt} from "./crt-auxiliary-models.mjs";

// OFFLINE, EVIDENCE-FIRST QA. This deliberately does NOT feed the LIVE gate.
// Four documented H4 morphologies are structurally different from the seven
// legacy catalog categories (which include pending/invalid/entry states).
// Only closed H4 from one provider, one ticker, and consecutive timestamps.
const H4=14_400_000;
const M15=900_000;
const num=x=>typeof x==="number"&&Number.isFinite(x);
export const STRUCTURAL_MORPHOLOGIES=Object.freeze([
  "CRT_2C_RETURN","CRT_3C_REVERSAL","CRT_MULTICANDLE","CRT_INSIDE_BAR"
]);
export const LEGACY_CATEGORY_ROLES=Object.freeze({
  CRT_3C_REVERSAL:"STRUCTURAL",
  CRT_2C_CANDIDATE:"PENDING_STAGE",
  CRT_2C_EXPANSION:"REJECTED_OR_CONTEXT",
  CRT_INSIDE_RETURN:"STRUCTURAL_VARIANT",
  CRT_INSIDE_CONTINUATION:"UNAPPROVED_VARIANT",
  CRT_MULTICANDLE:"STRUCTURAL_QA",
  CRT_M15_RETEST:"ENTRY_CONFIRMATION"
});
function validBar(b){
  return b && b.timeframe==="H4" &&
    Number.isSafeInteger(b.openedAt) && Number.isSafeInteger(b.closedAt) &&
    b.closedAt-b.openedAt===H4 &&
    [b.open,b.high,b.low,b.close].every(num) &&
    b.low<=Math.min(b.open,b.close) &&
    b.high>=Math.max(b.open,b.close) &&
    typeof b.provider==="string" && !!b.provider &&
    typeof b.instrumentId==="string" && !!b.instrumentId;
}
function validSpan(bars,i,n){
  const xs=bars.slice(i,i+n);
  return xs.length===n &&
    xs.every(x=>validBar(x)&&x.provider===xs[0].provider&&x.instrumentId===xs[0].instrumentId) &&
    xs.slice(1).every((x,k)=>xs[k].closedAt===x.openedAt);
}
function sweep(c1,bar){
  const low=bar.low<c1.low, high=bar.high>c1.high;
  return low!==high ? (low?1:-1):0;
}
function inside(c1,bar){
  return bar.low>=c1.low && bar.high<=c1.high;
}
function canonical(e){
  return [e.provider,e.instrumentId,e.c1Start,e.model,e.direction].join("|");
}
function event(b0,model,dir,ratifiedAt,more={}){
  const x={
    provider:b0.provider,instrumentId:b0.instrumentId,
    c1Start:b0.openedAt,model,direction:dir,ratifiedAt,
    c1High:b0.high,c1Low:b0.low,
    state:"RATIFIED_H4_QA",timeframe:"H4",
    certified:false,actionable:false,sendPush:false,...more
  };
  return Object.freeze({...x,id:canonical(x)});
}
// Deliberate C2 agreement with existing Pine: strict SINGLE sweep and
// the completed C2 closing back into the original C1 range.
function twoC(c1,c2){
  const d=sweep(c1,c2);
  return d!==0 && c2.close>=c1.low && c2.close<=c1.high ? d : 0;
}
export function inspectCrtMorphologies({
  closedH4=[],family="forex",maxInsideLife=3,maxMultiConsolidation=5,
  includeDistributedQa=true
}={}){
  if(!C1_HOURS[family]||!Array.isArray(closedH4)||
     !Number.isInteger(maxInsideLife)||maxInsideLife<1||maxInsideLife>5||
     !Number.isInteger(maxMultiConsolidation)||
     maxMultiConsolidation<2||maxMultiConsolidation>5)
    throw Error("invalid family scanner input");
  // NEVER sort across providers/sessions and thereby manufacture continuity.
  const bars=closedH4;
  const signals=[],diagnostics=[];
  for(let i=0;i<bars.length;i++){
    const c1=bars[i];
    if(!validBar(c1)||c1.allowedC1!==true||
      !C1_HOURS[family].includes(c1.nyHour))continue;
    if(!validSpan(bars,i,2))continue;
    const c2=bars[i+1];
    const dir2=twoC(c1,c2);
    if(dir2!==0){
      const two=event(c1,"CRT_2C_RETURN",dir2,c2.closedAt,{
        c2End:c2.closedAt,c2Wick:dir2>0?c2.low:c2.high,
        distribution:"NOT_REQUIRED_2C"});
      signals.push(two);
      // 3C is the evolution of the SAME C1/C2 event, never a second
      // standalone alert or a second ticker row.
      if(validSpan(bars,i,3)){
        const c3=bars[i+2];
        const invalid=dir2===1?c3.close<c2.low:c3.close>c2.high;
        signals.push(event(c1,"CRT_3C_REVERSAL",dir2,c2.closedAt,{
          c2End:c2.closedAt,c3End:c3.closedAt,
          c2Wick:dir2>0?c2.low:c2.high,
          distribution:invalid?"C3_INVALIDATED":"C3_CLOSED_VALID",
          state:invalid?"INVALIDATED":"RATIFIED_H4_QA",
          sameStructuralCycleId:two.id
        }));
      }
    }else{
      const dirSweep=sweep(c1,c2);
      if(dirSweep!==0 && (c2.close<c1.low || c2.close>c1.high)){
        diagnostics.push(Object.freeze({model:"CRT_2C_EXPANSION",
          c1Start:c1.openedAt,at:c2.closedAt,state:"REJECTED_NON_RETURN",
          provider:c1.provider,instrumentId:c1.instrumentId,actionable:false}));
      }
    }
    // Strict Inside Bar: C2 within C1. The existing Pine ratifies a
    // returning sweep only if the sweep H4 closes within C2; DeepSeek's
    // broader close-within-C1 variant is retained as ambiguity, NOT valid.
    if(c2.high<c1.high && c2.low>c1.low){
      for(let k=2;k<Math.min(bars.length-i,maxInsideLife+2);k++){
        if(!validSpan(bars,i,k+1))break;
        const manipulation=bars[i+k];
        const dir=sweep({high:c2.high,low:c2.low},manipulation);
        if(dir===0){
          if(manipulation.low<c2.low&&manipulation.high>c2.high){
            diagnostics.push(Object.freeze({model:"CRT_INSIDE_BAR",
              c1Start:c1.openedAt,at:manipulation.closedAt,
              state:"DOUBLE_SWEEP_REJECTED",actionable:false}));
            break;
          }
          continue;
        }
        const closesWithinC2=manipulation.close>=c2.low&&manipulation.close<=c2.high;
        const closesWithinC1=manipulation.close>=c1.low&&manipulation.close<=c1.high;
        if(closesWithinC2){
          signals.push(event(c1,"CRT_INSIDE_BAR",dir,manipulation.closedAt,{
            insideVariant:"RETURN_STRICT_C2",
            c2End:c2.closedAt,sweepH4End:manipulation.closedAt}));
        }else{
          diagnostics.push(Object.freeze({
            model:"CRT_INSIDE_BAR",c1Start:c1.openedAt,
            at:manipulation.closedAt, direction:dir,
            state:closesWithinC1?"RETURN_WITHIN_C1_ONLY_UNRESOLVED":
              "CONTINUATION_NOT_APPROVED",
            actionable:false
          }));
        }
        break;
      }
    }
    // Consolidation -> terminal sweep: one documented multi-candle
    // interpretation. Existing 4-H4 distributed-sweep detector remains a
    // SEPARATE QA subtype, not silently overwritten.
    for(let count=2;count<=maxMultiConsolidation;count++){
      const n=count+2; // C1 + N interior consolidation H4 + sweep H4
      if(!validSpan(bars,i,n))break;
      const middle=bars.slice(i+1,i+1+count);
      if(!middle.every(b=>b.high<c1.high&&b.low>c1.low))break;
      const final=bars[i+1+count],dir=sweep(c1,final);
      if(dir!==0 && final.close>=c1.low&&final.close<=c1.high){
        signals.push(event(c1,"CRT_MULTICANDLE",dir,final.closedAt,{
          multiVariant:"CONSOLIDATION_THEN_SWEEP_QA",
          consolidationBars:count,sweepH4End:final.closedAt}));
        break;
      }
      // Never move forward if the first terminal bar breaks the range.
      if(final.close<c1.low||final.close>c1.high)break;
    }
    if(includeDistributedQa&&validSpan(bars,i,4)){
      // The existing detector is held as a separate hypothesis; many
      // 4-H4 structures cannot be considered approved CRT yet.
      const d=detectFourCandleCrt({h4:bars.slice(i,i+4),family});
      if(d.state==="MULTI4_BULL_QA"||d.state==="MULTI4_BEAR_QA")
        diagnostics.push(Object.freeze({
          model:"CRT_MULTICANDLE",c1Start:c1.openedAt,
          at:d.detectedAt,direction:d.direction,
          state:"DISTRIBUTED_SWEEP_FOUR_H4_QA",actionable:false
        }));
    }
  }
  return Object.freeze({
    morphologies:STRUCTURAL_MORPHOLOGIES,
    categoryRoles:LEGACY_CATEGORY_ROLES,
    signals:Object.freeze(signals),
    diagnostics:Object.freeze(diagnostics),
    scannedClosedH4:bars.length,environment:"OFFLINE_REPLAY",
    certified:false,actionable:false,sendPush:false
  });
}
// MSS M15 is a DIFFERENT proof object. A structurally valid CRT never
// inherits a tick from another C1, provider, instrument, or direction.
export function verifyMssM15ForFamily(entry,mss){
  const ok=entry?.state==="RATIFIED_H4_QA" &&
    entry.certified===false &&
    mss?.provider===entry.provider && mss?.instrumentId===entry.instrumentId &&
    mss?.c1Start===entry.c1Start && mss?.direction===entry.direction &&
    mss?.timeframe==="M15" &&
    ["MSS_CONFIRMED_C2","MSS_CONFIRMED_C3"].includes(mss?.state) &&
    mss?.cycleId === [entry.provider,entry.instrumentId,entry.c1Start,entry.direction].join("|") &&
    Number.isSafeInteger(mss?.observedUntil) &&
    Number.isSafeInteger(mss?.sweepAt) &&
    Number.isSafeInteger(mss?.pivotAt) &&
    Number.isSafeInteger(mss?.mssAt) &&
    mss.pivotAt<mss.sweepAt && mss.sweepAt<mss.mssAt &&
    mss.mssAt%M15===0 &&
    mss.mssAt<=mss.observedUntil;
  return Object.freeze({
    model:entry?.model??"NONE",eventId:entry?.id??null,
    state:ok?"MSS_M15_CLOSED_MATCH_QA":"AWAITING_OR_REJECTED_MSS_M15",
    mssAt:ok?mss.mssAt:null,
    certified:false,actionable:false,sendPush:false
  });
}
