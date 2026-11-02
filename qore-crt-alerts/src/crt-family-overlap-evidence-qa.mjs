// QA-only family-history collision evaluator.
// Never treats same DD/MM, same close, or a shared C1 as proof of a valid CRT.
// Event inputs must derive from the exact same broker/M5 source and closed H4.
const positiveMs=x=>Number.isSafeInteger(x)&&x>0;
export function compare3cInsideLastEvents({
  source3c,sourceInside,close3c,closeInside,c1Start3c,c1StartInside,
  direction3c,directionInside,geometry3cVerified=false,
  geometryInsideVerified=false
}={}){
  const base={qaOnly:true,certified:false,actionable:false,sendPush:false,
    distinctTradingSignals:false,threeCAndInsideAreSevenIndependentFamilies:false};
  const output=(status,extra={})=>Object.freeze({status,...base,...extra});
  const fromSameFeed=typeof source3c==="string" && source3c.length>0 &&
    source3c===sourceInside;
  if(!fromSameFeed)return output("DIFFERENT_OR_UNKNOWN_BROKERS");
  if(!positiveMs(close3c)||!positiveMs(closeInside))
    return output("MISSING_EVENT_TIMESTAMPS");
  if(close3c!==closeInside){
    const sameDate=new Date(close3c).toISOString().slice(0,10)===
      new Date(closeInside).toISOString().slice(0,10);
    return output(sameDate?"SAME_DATE_DIFFERENT_H4_CLOSE":"DIFFERENT_H4_CLOSES",
      {sameDate,sameExactClose:false});
  }
  const sameC1=positiveMs(c1Start3c)&&positiveMs(c1StartInside)&&
    c1Start3c===c1StartInside;
  const sameDirection=[1,-1].includes(direction3c)&&
    direction3c===directionInside;
  if(!sameC1||!sameDirection)
    return output("SAME_H4_CLOSE_C1_OR_DIRECTION_UNVERIFIED",
      {sameExactClose:true,sameC1,sameDirection});
  if(!geometry3cVerified||!geometryInsideVerified)
    return output("SAME_CYCLE_GEOMETRY_REVIEW_REQUIRED",
      {sameExactClose:true,sameC1:true,sameDirection:true});
  // If the two definitions overlap, display one candidate cycle with
  // secondary family tag. The family priority must be reviewed with OHLC.
  return output("OVERLAPPING_GEOMETRIES_SINGLE_CANDIDATE_QA",
    {sameExactClose:true,sameC1:true,sameDirection:true,
     primaryCandidate:"TRUE_3C_C3_SWEEP_C1",
     secondaryCandidate:"INSIDE_C3_SWEEP_C2",
     requiresTradingViewTraderLabOHLCParity:true});
}
