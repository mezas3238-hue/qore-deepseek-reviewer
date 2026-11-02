// Independent MSS M15 proof for the Inside and Multi-N structural QA models.
// Offline replay only: no price feed, no order and no push integration.
// Only a real completed M15 sequence from the SAME provider may ratify an MSS.
export const M15MS = 900_000;
const H4MS = 14_400_000;
const validPrice=x=>typeof x==="number"&&Number.isFinite(x);
const sameSource=(a,b)=>a.provider===b.provider&&a.instrumentId===b.instrumentId;
export function freezeFamilyPivot({candidate,pivot,sweepAt,sweepEndM5,strictLow,strictHigh}){
  if(!candidate||!pivot||!Number.isSafeInteger(sweepAt)||
     !Number.isSafeInteger(sweepEndM5)||sweepEndM5-sweepAt!==300_000||
     (strictLow===strictHigh)||
     (candidate.direction!==1&&candidate.direction!==-1)||
     (strictLow?1:-1)!==candidate.direction||
     !validPrice(pivot.price)||!Number.isSafeInteger(pivot.at)||
     !Number.isSafeInteger(pivot.confirmedAt)||
     pivot.at>=sweepAt||pivot.confirmedAt>sweepAt||
     !Number.isSafeInteger(candidate.c1Start)||
     !Number.isSafeInteger(candidate.terminalH4Start)||
     !sameSource(candidate,pivot)||candidate.c1Start>=sweepAt||
     candidate.terminalH4Start>sweepAt||
     sweepAt>=candidate.terminalH4Start+H4MS)
    return Object.freeze({state:"REJECTED_NO_CAUSAL_PIVOT",actionable:false,sendPush:false});
  const eventId=[candidate.provider,candidate.instrumentId,candidate.model,candidate.c1Start,
                 candidate.terminalH4Start,candidate.direction,sweepEndM5].join("|");
  return Object.freeze({...candidate,eventId,sweepAt:sweepEndM5,
    pivotPrice:pivot.price,pivotAt:pivot.at,pivotConfirmedAt:pivot.confirmedAt,
    mssAt:null,state:"AWAITING_M15_CLOSE",actionable:false,sendPush:false});
}
export function confirmFamilyMss15({frozen,closedM15,observedUntil,ratifiedH4At,
  dataGap=false}){
  const reject=(reason)=>Object.freeze({
    eventId:frozen?.eventId??null,state:reason,mssAt:null,
    actionable:false,sendPush:false
  });
  if(!frozen||frozen.state!=="AWAITING_M15_CLOSE"||
     frozen.model!=="CRT_INSIDE_BAR"&&frozen.model!=="CRT_MULTICANDLE"||
     !Number.isSafeInteger(frozen.c1Start)||!Number.isSafeInteger(frozen.sweepAt)||
     !Number.isSafeInteger(frozen.pivotAt)||
     frozen.pivotAt>=frozen.sweepAt||
     !validPrice(frozen.pivotPrice)||dataGap) return reject("REJECTED_CYCLE_OR_GAP");
  if(!Number.isSafeInteger(ratifiedH4At)||
     ratifiedH4At<frozen.sweepAt||ratifiedH4At>frozen.sweepAt+H4MS)
    return reject("REJECTED_UNRATIFIED_H4");
  if(!Array.isArray(closedM15)||!Number.isSafeInteger(observedUntil))
    return reject("REJECTED_DATA");
  let previous=null;
  let lastAt=null;
  for(const bar of closedM15){
    if(!bar||bar.timeframe!=="M15"||!sameSource(frozen,bar)||
       !Number.isSafeInteger(bar.openedAt)||!Number.isSafeInteger(bar.closedAt)||
       bar.closedAt-bar.openedAt!==M15MS||bar.closedAt%M15MS!==0||
       [bar.open,bar.high,bar.low,bar.close].some(x=>!validPrice(x))||
       bar.high<Math.max(bar.open,bar.close)||
       bar.low>Math.min(bar.open,bar.close)||
       bar.high<bar.low || bar.closedAt>observedUntil||
       (lastAt!==null&&bar.openedAt!==lastAt))
      return reject("REJECTED_FEED_OR_CONTINUITY");
    if(previous!==null&&bar.closedAt>frozen.sweepAt&&
       bar.closedAt<=ratifiedH4At+H4MS &&
       (frozen.direction===1?
         bar.close>frozen.pivotPrice&&previous.close<=frozen.pivotPrice:
         bar.close<frozen.pivotPrice&&previous.close>=frozen.pivotPrice)){
      return Object.freeze({
        ...frozen,state:"MSS_M15_CONFIRMED_QA",mssAt:bar.closedAt,
        ratifiedH4At,actionable:false,sendPush:false
      });
    }
    previous=bar;lastAt=bar.closedAt;
  }
  return reject("AWAITING_MSS_M15");
}
