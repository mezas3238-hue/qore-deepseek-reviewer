// QORE CRT / cTrader DEMO ONLY: closed-broker-bar diagnostic replay.
// All 34 markets are assessed; an index clock disagreement BLOCKS its CRT.
// Preserves seven distinct catalog roles, including provisional and rejected.
// This never certifies external TradingView data, Pine, no-repaint, MSS,
// trading, FCM/push, or actionable trade entry.
import {INSTRUMENTS} from "./instruments.mjs";
import {aggregateClosedM5} from "./aggregate.mjs";
import {aggregateClosedCryptoM5} from "./crypto-aggregate.mjs";
import {replayCycle} from "./replay-cycle.mjs";
import {inspectCrtMorphologies} from "./crt-structural-morphologies.mjs";
import {SEVEN_CRT_ROLES} from "./crt-seven-role-certification-readiness.mjs";
import {inspectAll34NativeVsOwnerH4ClockQA}
 from "./qa-ctrader-34-native-vs-owner-h4-clock.mjs";
const H4=14_400_000,M5=300_000,M15=900_000;
const CONFIRMED=new Set(["MSS_CONFIRMED_C2","MSS_CONFIRMED_C3"]);
const safeMs=x=>Number.isSafeInteger(x)&&x>0;
const closed=(state,extra={})=>Object.freeze({
 state,certified:false,actionable:false,sendPush:false,canTrade:false,
 pineEventParityCertified:false,tradingViewParityCertified:false,
 sourceParityCertified:false,mssM5Certified:false,mssM15Certified:false,
 sevenCrtRolesCertified:false,noRepaintCertified:false,...extra
});
const roleCount=()=>Object.fromEntries(SEVEN_CRT_ROLES.map(r=>[r.id,0]));
const gradeRoles=counts=>Object.freeze(SEVEN_CRT_ROLES.map(r=>
 Object.freeze({role:r.id,kind:r.kind,count:counts[r.id],
  state:counts[r.id]>0?"OBSERVED_IN_DEMO_REPLAY_UNCERTIFIED":
                       "NOT_OBSERVED_IN_SAMPLE",
  independentlyVerified:false,actionable:false,sendPush:false})));
function familyOf(id){if(id==="BTCUSD")return "crypto";
 return ["NDX100","SPX500","US30"].includes(id)?"index":"forex";}
function checkSource(bars,instrumentId,symbolId,asOfMs){
 if(!Array.isArray(bars)||bars.length!==600||
    !Number.isInteger(symbolId)||symbolId<=0||!safeMs(asOfMs)||
    !INSTRUMENTS.some(x=>x.id===instrumentId))
  throw Error("CRT34_CLOSED_M5_SCOPE_INVALID");
 let last=null,phase=null;
 for(const b of bars){
  if(b?.provider!=="IC"||b.instrumentId!==instrumentId||
     b.symbolId!==symbolId||b.source!=="CTRADER_OPEN_API_DEMO"||
     b.certified!==false||b.actionable!==false||
     b.sendPush!==false||b.transport!=="DISABLED"||
     !safeMs(b.openedAt)||b.closedAt!==b.openedAt+M5||
     b.closedAt>asOfMs||b.openedAt%60_000!==0||
     (last!==null&&b.openedAt<=last)||
     ![b.open,b.high,b.low,b.close].every(v=>typeof v==="number"&&
      Number.isFinite(v)&&v>0)||
     b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close))
   throw Error("CRT34_CLOSED_M5_PROVENANCE_INVALID");
  const p=b.openedAt%M5;
  if(phase!==null&&p!==phase)
   throw Error("CRT34_CLOSED_M5_PHASE_CHANGED");
  phase=p;last=b.openedAt;
 }
 // Reuse only exactly observed closed data. No gap-filled prices.
 return Object.freeze(bars.map(b=>Object.freeze({
  provider:b.provider,instrumentId:b.instrumentId,
  openedAt:b.openedAt,closedAt:b.closedAt,
  open:b.open,high:b.high,low:b.low,close:b.close
 })));
}
function trustedNative(t,tf,id){
 return t?.periodName===tf&&t?.instrumentId===id&&
  Number.isInteger(t.nativeBarsFetched)&&t.nativeBarsFetched>0&&
  Number.isInteger(t.matchedUtcAndCompleteM5Blocks)&&
  t.matchedUtcAndCompleteM5Blocks>0&&
  t.mismatchBars===0&&t.sourceParityCertified===false&&
  t.canTrade===false&&t.sendPush===false;
}
function witness(m,tf,cycleId,barClosedTimes,asOfMs){
 if(!CONFIRMED.has(m?.state))return null;
 const dt=Number(m.mssAt);
 if(m.timeframe!==tf||m.cycleId!==cycleId||
    !safeMs(dt)||dt>asOfMs||dt%(tf==="M5"?M5:M15)!==0||
    !barClosedTimes.has(dt)||!safeMs(m.pivotAt)||
    !safeMs(m.sweepAt)||!(m.pivotAt<m.sweepAt&&m.sweepAt<dt)||
    m.actionable!==false)
   throw Error("CRT34_MSS_CAUSAL_WITNESS_INVALID_"+tf);
 return Object.freeze({timeframe:tf,at:dt});
}
export function auditCrtMss34ClosedBrokerBars({
 instrumentId,symbolId,bars,asOfMs,nativeM15,nativeH4
}={}){
 const clean=checkSource(bars,instrumentId,symbolId,asOfMs);
 const family=familyOf(instrumentId);
 if(!trustedNative(nativeM15,"M15",instrumentId)||
    !trustedNative(nativeH4,"H4",instrumentId))
  return closed("NATIVE_M15_H4_MATCH_REQUIRED",{
   instrumentId,requiredInstruments:34
  });
 const h4=(family==="crypto"?
  aggregateClosedCryptoM5(clean,{timeframe:"H4"}):
  aggregateClosedM5(clean,{timeframe:"H4",family}));
 const m15=(family==="crypto"?
  aggregateClosedCryptoM5(clean,{timeframe:"M15"}):
  aggregateClosedM5(clean,{timeframe:"M15",family}));
 const nativeOwnerClockQA=inspectAll34NativeVsOwnerH4ClockQA({
  instrumentId,symbolId,closedM5:bars,asOfMs,nativeH4
 });
 const nativePhase=nativeH4.nativeUtcH4PhasesMinutes;
 if(!Array.isArray(nativePhase)||!nativePhase.length||
    nativePhase.some(p=>!Number.isInteger(p)||p<0||p>=240))
  return closed("NATIVE_H4_PHASE_NOT_PROVEN",{
   instrumentId,group:family,h4Complete:h4.complete.length
  });
 const observedPhase=[...new Set(h4.complete.map(b=>
   (b.openedAt%H4)/60_000))].sort((a,b)=>a-b);
 if(!observedPhase.length||
    !observedPhase.every(p=>nativePhase.includes(p)))
  return closed("NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA",{
   instrumentId,group:family,h4Complete:h4.complete.length,
   nativeH4UtcPhaseMin:Object.freeze([...nativePhase]),
   configuredNyH4UtcPhaseMin:Object.freeze(observedPhase),
   nativeOwnerClockQA,
   prohibitedAutoShift:true,requiresOwnerClockReview:true,
   cyclesEvaluated:0,crtRoleObservations:gradeRoles(roleCount())
  });
 const counts=roleCount(),cycleStates={},mssStatesM5={},mssStatesM15={};
 const closes5=new Set(clean.map(x=>x.closedAt));
 const closes15=new Set(m15.complete.map(x=>x.closedAt));
 let cycles=0,mssM5=0,mssM15=0,both=0;
 for(const c1 of h4.complete){
  if(c1.allowedC1!==true)continue;
  // C2 must be a fully closed, consecutive H4 of this source.
  if(!h4.complete.some(c2=>c2.openedAt===c1.closedAt))continue;
  const r=replayCycle({candlesM5:clean,c1Start:c1.openedAt,family});
  if(r.state!=="REPLAY_EVALUATED"||
     r.crt?.actionable!==false||
     r.mssM5?.actionable!==false||
     r.mssM15?.actionable!==false||
     r.sendPush!==false)
   throw Error("CRT34_REPLAY_INTEGRITY_INVALID");
  cycles++;
  cycleStates[r.crt.state]=(cycleStates[r.crt.state]??0)+1;
  mssStatesM5[r.mssM5.state]=(mssStatesM5[r.mssM5.state]??0)+1;
  mssStatesM15[r.mssM15.state]=(mssStatesM15[r.mssM15.state]??0)+1;
  if(r.crt.state==="C2_RATIFIED_AWAITING_C3")
   counts.CRT_2C_CANDIDATE++;
  if(r.crt.state==="C2_CLOSE_OUTSIDE_C1")
   counts.CRT_2C_EXPANSION++;
  if(r.auxiliaryModels?.retestM15?.state==="RETEST_M15_OBSERVED_QA")
   counts.CRT_M15_RETEST++;
  const cycleId=["IC",instrumentId,c1.openedAt,r.crt.direction].join("|");
  const w5=witness(r.mssM5,"M5",cycleId,closes5,asOfMs);
  const w15=witness(r.mssM15,"M15",cycleId,closes15,asOfMs);
  if(w5)mssM5++;
  if(w15)mssM15++;
  if(w5&&w15)both++;
 }
 const morph=inspectCrtMorphologies({
   closedH4:h4.complete,family,includeDistributedQa:true
 });
 if(morph.certified!==false||morph.sendPush!==false||
    !Array.isArray(morph.signals)||!Array.isArray(morph.diagnostics))
  throw Error("CRT34_MORPHOLOGY_INVALID");
 counts.CRT_3C_REVERSAL+=morph.signals.filter(x=>
  x.model==="CRT_3C_REVERSAL"&&x.state==="RATIFIED_H4_QA").length;
 counts.CRT_INSIDE_RETURN+=morph.signals.filter(x=>
  x.model==="CRT_INSIDE_BAR"&&x.insideVariant==="RETURN_STRICT_C2").length;
 counts.CRT_MULTICANDLE+=morph.signals.filter(x=>
  x.model==="CRT_MULTICANDLE"&&x.state==="RATIFIED_H4_QA").length;
 counts.CRT_INSIDE_CONTINUATION+=morph.diagnostics.filter(x=>
  x.model==="CRT_INSIDE_BAR"&&x.state==="CONTINUATION_NOT_APPROVED").length;
 return closed("CLOSED_DEMO_CRT_MSS_DIAGNOSTIC_REPLAY_UNCERTIFIED",{
  instrumentId,group:family,
  observedM5:600,h4Complete:h4.complete.length,h4Rejected:h4.rejected.length,
  m15Complete:m15.complete.length,m15Rejected:m15.rejected.length,
  nativeH4UtcPhaseMin:Object.freeze([...nativePhase]),
  configuredNyH4UtcPhaseMin:Object.freeze(observedPhase),
  nativeOwnerClockQA,
  prohibitedAutoShift:true,cyclesEvaluated:cycles,
  crtStates:Object.freeze(cycleStates),
  mssStatesM5:Object.freeze(mssStatesM5),
  mssStatesM15:Object.freeze(mssStatesM15),
  mssM5ClosedWitnesses:mssM5,mssM15ClosedWitnesses:mssM15,
  sameCycleIndependentMssWitnesses:both,
  crtRoleObservations:gradeRoles(counts),
  sevenCrtRolesObserved:SEVEN_CRT_ROLES.filter(r=>counts[r.id]>0).length,
  calibrationNeeded:counts.CRT_2C_CANDIDATE===0&&
    counts.CRT_3C_REVERSAL===0,
  requiresIndependentPineEvents:true
 });
}
