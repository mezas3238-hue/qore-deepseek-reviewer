// Confluence is a REPLAY classification, NEVER a real push signal.
// Requires RATIFIED C2 and same-cycle M15 MSS; M5 is optional context.
// Maintains owner rule: CRT H4 + MSS M15 > MSS M5 alone.
const recognizedMSS=new Set(["MSS_CONFIRMED_C2","MSS_CONFIRMED_C3"]);
const ratified=new Set(["C2_RATIFIED_AWAITING_C3","C3_NOT_INVALIDATED"]);
const result=(state,extra={})=>Object.freeze({
  state,actionable:false,sendPush:false,environment:"OFFLINE_REPLAY",...extra});
export function classifyReplayConfluence({crt,mssM15,mssM5=null}){
  if(!crt || typeof crt!=="object" || !ratified.has(crt.state))
    return result("CRT_NOT_VALID");
  if(!mssM15||mssM15.timeframe!=="M15"||
     !recognizedMSS.has(mssM15.state))
    return result("AWAITING_MSS_M15");
  const expected=[crt.provider,crt.instrumentId,crt.c1Start,crt.direction].join("|");
  if(!crt.provider||!crt.instrumentId||!Number.isSafeInteger(crt.c1Start)||
     ![1,-1].includes(crt.direction)||mssM15.cycleId!==expected||
     mssM15.c1Start!==crt.c1Start||mssM15.direction!==crt.direction||
     !Number.isSafeInteger(mssM15.mssAt)||mssM15.mssAt<=crt.c2Start)
    return result("IDENTITY_OR_TIME_MISMATCH");
  const hasM5=!!mssM5 && mssM5.timeframe==="M5"&&
    recognizedMSS.has(mssM5.state)&&mssM5.cycleId===expected&&
    mssM5.c1Start===crt.c1Start&&mssM5.direction===crt.direction;
  // Stable identifier for future persistence. No storage or FCM integration yet.
  const key=expected+"|MSS_M15|"+mssM15.mssAt;
  return result("REPLAY_CRT_M15_CONFLUENCE",{
    cycleId:expected,signalId:key,direction:crt.direction,
    instrumentId:crt.instrumentId,mssM15At:mssM15.mssAt,
    mssM5At:hasM5?mssM5.mssAt:null,
    eligibleAfter:mssM15.eligibleAfter??null,
    requiresRealFeedAndPineParity:true});
}
