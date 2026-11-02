// QA-only projection of the owner's CRT + MSS M5/M15 watchlist.
// Seven legacy catalogue roles include provisional/rejected/confirmation
// states, not seven independent permitted trading setups.
// No market data, push transport, orders, external connection or authorization.
export const CRT_SEVEN_ROLES=Object.freeze([
  "CRT_3C_REVERSAL","CRT_2C_CANDIDATE","CRT_2C_EXPANSION",
  "CRT_INSIDE_RETURN","CRT_INSIDE_CONTINUATION",
  "CRT_MULTICANDLE","CRT_M15_RETEST"
]);
const BITS=Object.freeze([1,2,4,8,16,32,64]);
const validTs=x=>Number.isSafeInteger(x)&&x>0;
const result=(state,other={})=>Object.freeze({
  state,actionable:false,sendPush:false,certified:false,
  environment:"QA_REPLAY",...other
});
export function sevenRoleView({mask}={}){
  if(!Number.isSafeInteger(mask)||mask<0||mask>127)
    throw Error("INVALID_SEVEN_ROLE_MASK");
  return Object.freeze(CRT_SEVEN_ROLES.filter((_,i)=>(mask&BITS[i])!==0));
}
const phaseOk=(t,unit,phase)=>
  validTs(t)&&Number.isSafeInteger(phase)&&phase>=0&&phase<=4&&
  t%unit===phase*60_000;

export function renderCrtMssQaStatus({
  provider,instrumentId,mask=0,coreCrt=false,extraStructuralQa=false,
  c1StartMs,sweepAtMs,direction,sourcePhaseMin,
  m5={},m15={},c2RatifiedAtMs
}={}){
  if(typeof provider!=="string"||!provider||
     typeof instrumentId!=="string"||!instrumentId||
     ![1,-1,0].includes(direction))
    throw Error("INVALID_SOURCE_IDENTITY");
  const roles=sevenRoleView({mask});
  const hasRoot=coreCrt===true&&validTs(c1StartMs)&&
    validTs(sweepAtMs)&&sweepAtMs>c1StartMs&&
    validTs(c2RatifiedAtMs)&&c2RatifiedAtMs>sweepAtMs;
  const cycleId=[provider,instrumentId,c1StartMs,direction].join("|");
  const same=(m)=>m?.cycleId===cycleId&&
     m?.provider===provider&&m?.instrumentId===instrumentId&&
     m?.direction===direction&&m?.c1StartMs===c1StartMs;
  // Closed 5/15-minute evidence must come from this exact source/cycle.
  const m5Confirmed=hasRoot&&same(m5)&&validTs(m5.pivotAtMs)&&
    validTs(m5.breakAtMs)&&m5.pivotAtMs<sweepAtMs&&
    m5.breakAtMs>sweepAtMs&&phaseOk(m5.breakAtMs,300_000,sourcePhaseMin);
  const m15Confirmed=hasRoot&&same(m15)&&validTs(m15.pivotAtMs)&&
    validTs(m15.breakAtMs)&&validTs(m15.lastClosedAtMs)&&
    m15.pivotAtMs<sweepAtMs&&m15.breakAtMs>sweepAtMs&&
    m15.breakAtMs<=m15.lastClosedAtMs&&
    phaseOk(m15.breakAtMs,900_000,sourcePhaseMin);
  const crtState=hasRoot?"CRT_H4_RATIFIED_QA":
    extraStructuralQa===true?"STRUCTURE_QA_NOT_APPROVED":
    roles.includes("CRT_2C_CANDIDATE")?"C2_PENDING":
    roles.some(x=>x==="CRT_2C_EXPANSION"||x==="CRT_INSIDE_CONTINUATION")?
      "REJECTED_NOT_ENTRY":"NO_CURRENT_VALID_CRT";
  return result(crtState,{
    provider,instrumentId,roles,direction:hasRoot||extraStructuralQa?
      direction:0,crtRatified:hasRoot,
    mssM5:hasRoot?(m5Confirmed?"CONFIRMED":"AWAITING"):
      extraStructuralQa?"UNVERIFIED":"NOT_APPLICABLE",
    mssM15:hasRoot?(m15Confirmed?"CONFIRMED":"AWAITING"):
      extraStructuralQa?"UNVERIFIED":"NOT_APPLICABLE",
    // All seven roles are inspected, but a rejected/candidate bit cannot
    // be counted as an actionable structural CRT, even with forged MSS.
    matchedCycleId:hasRoot?cycleId:null,
    requiresIndependentRealFeedAndPineParity:true
  });
}
