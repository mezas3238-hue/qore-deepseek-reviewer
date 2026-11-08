import {deduplicateM5} from "./contracts.mjs";
import {aggregateClosedM5} from "./aggregate.mjs";
import {inspectCrtH4} from "./crt-h4.mjs";

const M15_MS=900000;
const reject=(state,more={})=>Object.freeze({state,actionable:false,timeframe:"M15",...more});
const exactH4=(a,b)=>!!a&&!!b&&
  ["provider","instrumentId","timeframe","openedAt","closedAt","open","high","low","close","nyHour"]
    .every(k=>a[k]===b[k]);
const crossing=(prev,current,level,dir)=>
  dir===1 ? prev<=level&&current>level : prev>=level&&current<level;

// Reproduce the Pine QA left15/right15 strict inequalities and the last
// confirmed pivot, but never use a pivot whose right bars close after sweep.
// Segment by M15 gaps, mirroring Pine's clear-on-gap guard.
export function frozenM15Pivot(completedM15,{
  direction,sweepStart,left=2,right=2,maxPivotAgeMinutes=720
}){
  if(![1,-1].includes(direction)||![left,right].every(n=>Number.isInteger(n)&&n>=1&&n<=7)||
     !Number.isInteger(maxPivotAgeMinutes)||maxPivotAgeMinutes<15||maxPivotAgeMinutes>1440||
     !Number.isSafeInteger(sweepStart))throw Error("invalid MSS pivot settings");
  const prior=completedM15.filter(x=>x.closedAt<=sweepStart)
    .sort((a,b)=>a.openedAt-b.openedAt);
  // Only the most recent uninterrupted segment is allowed to supply a swing.
  let split=0;
  for(let i=1;i<prior.length;i++){
    if(prior[i-1].closedAt!==prior[i].openedAt)split=i;
  }
  const run=prior.slice(split);
  // The last CLOSED M15 may end 0, 5 or 10 minutes before an M5 sweep.
  // It may NOT end a full M15 (or more) earlier: that means a missing
  // M15 at the sweep boundary, and the old pivot is stale. The previous
  // test accidentally allowed every historical M15 ending before sweep.
  if(!run.length||run.at(-1).closedAt>sweepStart||
     sweepStart-run.at(-1).closedAt>=M15_MS) return null;
  let frozen=null;
  for(let end=left+right;end<run.length;end++){
    const at=end-right,center=run[at],price=direction===1?center.high:center.low;
    let ok=true;
    for(let j=at-left;j<=at+right;j++){
      if(j===at)continue;
      const other=direction===1?run[j].high:run[j].low;
      if(!(direction===1?price>other:price<other)){ok=false;break;}
    }
    if(ok)frozen={price,pivotAt:center.openedAt,confirmedAt:run[end].closedAt};
  }
  if(!frozen||frozen.pivotAt>=sweepStart||
     sweepStart-frozen.pivotAt>maxPivotAgeMinutes*60000)return null;
  return Object.freeze(frozen);
}

// Offline/replay-only: no alerts until Pine equivalence, feed mapping,
// live closed-candle verification, MSS M5, and Android E2E certification.
// c1/c2/c3 must be H4 bars re-aggregated from THESE SAME M5 candles.
export function inspectMssM15({candlesM5,c1,c2,c3=null,family,
  left=2,right=2,maxPivotAgeMinutes=720}){
  const crt=inspectCrtH4({c1,c2,c3,family});
  if(!["C2_RATIFIED_AWAITING_C3","C3_NOT_INVALIDATED","C3_INVALIDATED"].includes(crt.state))
    return reject("CRT_NOT_RATIFIED",{crtState:crt.state});
  const m5=deduplicateM5(candlesM5);
  if(!m5.length||m5.some(x=>x.provider!==c1.provider||x.instrumentId!==c1.instrumentId))
    return reject("MIXED_OR_MISSING_FEED");
  const h4=aggregateClosedM5(m5,{timeframe:"H4",family}).complete;
  if(![c1,c2,...(c3?[c3]:[])].every(source=>
    exactH4(source,h4.find(x=>x.openedAt===source.openedAt))))
    return reject("INCOMPLETE_OR_DIFFERENT_H4");
  // Only one strict-side sweep is allowed by inspectCrtH4, but its first
  // M5 close is the reference time for both MSS C2 and continuation C3.
  const first=m5.find(x=>x.openedAt>=c2.openedAt&&x.closedAt<=c2.closedAt&&
    (crt.direction===1?x.low<c1.low:x.high>c1.high));
  if(!first)return reject("SWEEP_BAR_NOT_FOUND");
  const sweepStart=first.openedAt,sweepEnd=first.closedAt;
  const segments=aggregateClosedM5(m5,{timeframe:"M15",family});
  const m15=segments.complete;
  const pivot=frozenM15Pivot(m15,{direction:crt.direction,sweepStart,
    left,right,maxPivotAgeMinutes});
  const context={cycleId:c1.provider+"|"+c1.instrumentId+"|"+c1.openedAt+"|"+crt.direction,
    direction:crt.direction,c1Start:c1.openedAt,sweepAt:sweepEnd,
    pivotAt:pivot?.pivotAt??null,pivotConfirmedAt:pivot?.confirmedAt??null,
    pivotPrice:pivot?.price??null,crtState:crt.state};
  if(!pivot)return reject("NO_FRESH_PRE_SWEEP_PIVOT",context);
  // Pine checks previous M15 CLOSE only if immediately consecutive. This
  // prevents fabricated crossing across missing bars or market reopening.
  for(let i=1;i<m15.length;i++){
    const prev=m15[i-1],bar=m15[i];
    if(prev.closedAt!==bar.openedAt||bar.closedAt<=sweepEnd)continue;
    const inC2=bar.openedAt>=c2.openedAt&&bar.closedAt<=c2.closedAt;
    // C3 can confirm MSS on completed M15 before its H4 has finished.
    // An absent c3 means its H4 is not yet fully closed; it does NOT
    // prohibit confirmed M15 events from the 4h C3 window.
    const c3Start=c2.closedAt,c3End=c3?.closedAt??(c3Start+14400000);
    const inC3=bar.openedAt>=c3Start&&bar.closedAt<=c3End;
    if(!inC2&&!inC3)continue;
    if(!crossing(prev.close,bar.close,pivot.price,crt.direction))continue;
    if(crt.state==="C3_INVALIDATED")
      return reject("CRT_INVALIDATED_C3",{...context,diagnosticMssAt:bar.closedAt});
    return reject(inC2?"MSS_CONFIRMED_C2":"MSS_CONFIRMED_C3",{
      ...context,mssAt:bar.closedAt,stage:inC2?"C2":"C3",
      eligibleAfter:Math.max(bar.closedAt,c2.closedAt)});
  }
  return reject(crt.state==="C3_INVALIDATED"?"CRT_INVALIDATED_C3":"MSS_NOT_CONFIRMED",context);
}
