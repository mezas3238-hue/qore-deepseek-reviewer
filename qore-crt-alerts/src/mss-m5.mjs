import {deduplicateM5} from "./contracts.mjs";
import {aggregateClosedM5} from "./aggregate.mjs";
import {inspectCrtH4} from "./crt-h4.mjs";

const reject=(state,more={})=>Object.freeze({state,timeframe:"M5",actionable:false,...more});
const exactH4=(a,b)=>!!a&&!!b&&
  ["provider","instrumentId","timeframe","openedAt","closedAt","open","high","low","close","nyHour"]
    .every(k=>a[k]===b[k]);
// Strict left/right price comparison equivalent to ta.pivothigh/low.
// Confirmed only after the rightmost closed M5; never use future M5.
export function frozenM5Pivot(m5,{direction,sweepStart,left=2,right=2,maxPivotAgeMinutes=720}){
  if(![1,-1].includes(direction)||![left,right].every(n=>Number.isInteger(n)&&n>=1&&n<=7)||
     !Number.isInteger(maxPivotAgeMinutes)||maxPivotAgeMinutes<15||maxPivotAgeMinutes>1440||
     !Number.isSafeInteger(sweepStart))throw Error("invalid M5 pivot settings");
  const prior=m5.filter(x=>x.closedAt<=sweepStart).sort((a,b)=>a.openedAt-b.openedAt);
  let split=0;
  for(let i=1;i<prior.length;i++)
    if(prior[i-1].closedAt!==prior[i].openedAt)split=i;
  const run=prior.slice(split);
  if(!run.length||run.at(-1).closedAt!==sweepStart)return null;
  let found=null;
  for(let end=left+right;end<run.length;end++){
    const at=end-right,p=run[at],price=direction===1?p.high:p.low;
    let strict=true;
    for(let j=at-left;j<=at+right;j++){
      if(j===at)continue;
      const neighbor=direction===1?run[j].high:run[j].low;
      if(!(direction===1?price>neighbor:price<neighbor)){strict=false;break;}
    }
    if(strict)found={price,pivotAt:p.openedAt,confirmedAt:run[end].closedAt};
  }
  if(!found||found.pivotAt>=sweepStart||
     sweepStart-found.pivotAt>maxPivotAgeMinutes*60000)return null;
  return Object.freeze(found);
}

// M5 is auxiliary diagnostic; MSS M15 remains the required operational
// confirmation. Return no actionable signals or push notifications.
export function inspectMssM5({candlesM5,c1,c2,c3=null,family,
  left=2,right=2,maxPivotAgeMinutes=720}){
  const crt=inspectCrtH4({c1,c2,c3,family});
  if(!["C2_RATIFIED_AWAITING_C3","C3_NOT_INVALIDATED","C3_INVALIDATED"].includes(crt.state))
    return reject("CRT_NOT_RATIFIED",{crtState:crt.state});
  const bars=deduplicateM5(candlesM5);
  if(!bars.length||bars.some(x=>x.provider!==c1.provider||x.instrumentId!==c1.instrumentId))
    return reject("MIXED_OR_MISSING_FEED");
  const source=aggregateClosedM5(bars,{timeframe:"H4",family}).complete;
  if(![c1,c2,...(c3?[c3]:[])].every(h4=>
    exactH4(h4,source.find(x=>x.openedAt===h4.openedAt))))
    return reject("INCOMPLETE_OR_DIFFERENT_H4");
  const sweep=bars.find(x=>x.openedAt>=c2.openedAt&&x.closedAt<=c2.closedAt&&
    (crt.direction===1?x.low<c1.low:x.high>c1.high));
  if(!sweep)return reject("SWEEP_BAR_NOT_FOUND");
  const pivot=frozenM5Pivot(bars,{direction:crt.direction,sweepStart:sweep.openedAt,
    left,right,maxPivotAgeMinutes});
  const ctx={cycleId:c1.provider+"|"+c1.instrumentId+"|"+c1.openedAt+"|"+crt.direction,
    direction:crt.direction,c1Start:c1.openedAt,sweepAt:sweep.closedAt,
    pivotAt:pivot?.pivotAt??null,pivotConfirmedAt:pivot?.confirmedAt??null,
    pivotPrice:pivot?.price??null,crtState:crt.state};
  if(!pivot)return reject("NO_FRESH_PRE_SWEEP_PIVOT",ctx);
  for(let i=1;i<bars.length;i++){
    const current=bars[i],prior=bars[i-1];
    // Pine guard: previous M5 ends exactly when current M5 begins.
    if(current.openedAt!==prior.closedAt || current.openedAt<sweep.closedAt)continue;
    const inC2=current.openedAt>=c2.openedAt&&current.closedAt<=c2.closedAt;
    // A closed M5 within the active C3 window is eligible even when
    // C3 H4 is still forming. H4-close invalidation stays separate.
    const c3Start=c2.closedAt,c3End=c3?.closedAt??(c3Start+14400000);
    const inC3=current.openedAt>=c3Start&&current.closedAt<=c3End;
    if(!inC2&&!inC3)continue;
    const cross=crt.direction===1?
      prior.close<=pivot.price&&current.close>pivot.price:
      prior.close>=pivot.price&&current.close<pivot.price;
    if(!cross)continue;
    if(crt.state==="C3_INVALIDATED")
      return reject("CRT_INVALIDATED_C3",{...ctx,diagnosticMssAt:current.closedAt});
    return reject(inC2?"MSS_CONFIRMED_C2":"MSS_CONFIRMED_C3",{
      ...ctx,mssAt:current.closedAt,stage:inC2?"C2":"C3",
      eligibleAfter:Math.max(current.closedAt,c2.closedAt)});
  }
  return reject(crt.state==="C3_INVALIDATED"?"CRT_INVALIDATED_C3":"MSS_NOT_CONFIRMED",ctx);
}
