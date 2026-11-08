// CTrader DEMO QA: compare the sovereign NY H4 clock with *observed*
// native cTrader H4 opening-phase, for ALL 34 symbols.
// Explicitly diagnostic: NEVER alter C1_HOURS, shift/insert M5 candles,
// activate CRT/MSS, claim Pine parity, trade, or send notifications.
import {INSTRUMENTS} from "./instruments.mjs";
import {C1_HOURS,nyParts} from "./ny-clock.mjs";
import {aggregateClosedM5} from "./aggregate.mjs";
import {aggregateClosedCryptoM5} from "./crypto-aggregate.mjs";
const H4=14_400_000,M5=300_000;
const INDEX=new Set(["NDX100","SPX500","US30"]);
const safe=x=>Number.isSafeInteger(x)&&x>=0;
const make=(state,extra={})=>Object.freeze({
 state,...extra,clockReconciled:false,
 approvedC1ClockUnchanged:true,needsIndependentSeasonalSample:true,
 feedParityCertified:false,crtCertified:false,
 mssM5Certified:false,mssM15Certified:false,noRepaintCertified:false,
 actionable:false,canTrade:false,sendPush:false
});
const familyOf=id=>id==="BTCUSD"?"crypto":INDEX.has(id)?"index":"forex";
function verifyBars({bars,id,symbolId,asOfMs}){
 if(!INSTRUMENTS.some(x=>x.id===id)||
    !Number.isSafeInteger(symbolId)||symbolId<=0||
    !safe(asOfMs)||!Array.isArray(bars)||bars.length!==600)
  throw Error("CRT34_CLOCK_SOURCE_SCOPE_INVALID");
 let last=-1,phase=null;
 for(const b of bars){
  if(!b||b.provider!=="IC"||b.instrumentId!==id||
     b.symbolId!==symbolId||b.source!=="CTRADER_OPEN_API_DEMO"||
     b.certified!==false||b.actionable!==false||
     b.sendPush!==false||b.transport!=="DISABLED"||
     !safe(b.openedAt)||b.openedAt<=last||
     b.closedAt!==b.openedAt+M5||b.closedAt>asOfMs||
     b.openedAt%60_000!==0||
     ![b.open,b.high,b.low,b.close].every(x=>
       typeof x==="number"&&Number.isFinite(x)&&x>0)||
     b.low>Math.min(b.open,b.close)||
     b.high<Math.max(b.open,b.close))
   throw Error("CRT34_CLOCK_SOURCE_BAR_INVALID");
  const next=b.openedAt%M5;
  if(phase!==null&&phase!==next)
   throw Error("CRT34_CLOCK_SOURCE_PHASE_DRIFT");
  phase=next;last=b.openedAt;
 }
 return bars;
}
function nativeClockGroups(bars,phase){
 const groups=new Map(),phaseMs=phase*60_000;
 for(const b of bars){
  const start=Math.floor((b.openedAt-phaseMs)/H4)*H4+phaseMs;
  if(!groups.has(start))groups.set(start,[]);
  groups.get(start).push(b);
 }
 const complete=[],incomplete=[];
 for(const [start,g] of groups){
  g.sort((a,b)=>a.openedAt-b.openedAt);
  if(g.length!==48||g[0].openedAt!==start||
     g.at(-1).closedAt!==start+H4||
     g.some((b,i)=>i>0&&g[i-1].closedAt!==b.openedAt)){
    incomplete.push({openedAt:start,observedM5:g.length});
    continue;
  }
  complete.push(Object.freeze({
   openedAt:start,closedAt:start+H4,
   open:g[0].open,high:Math.max(...g.map(x=>x.high)),
   low:Math.min(...g.map(x=>x.low)),close:g.at(-1).close
  }));
 }
 complete.sort((a,b)=>a.openedAt-b.openedAt);
 return {complete,incomplete};
}
export function inspectAll34NativeVsOwnerH4ClockQA({
 instrumentId,symbolId,closedM5,asOfMs,nativeH4
}={}){
 const bars=verifyBars({bars:closedM5,id:instrumentId,symbolId,asOfMs});
 const family=familyOf(instrumentId);
 const ownerH4=family==="crypto"?
    aggregateClosedCryptoM5(bars,{timeframe:"H4"}):
    aggregateClosedM5(bars,{timeframe:"H4",family});
 const raw=nativeH4?.nativeUtcH4PhasesMinutes;
 if(nativeH4?.periodName!=="H4"||
    nativeH4?.instrumentId!==instrumentId||
    nativeH4?.sourceParityCertified!==false||
    nativeH4?.canTrade!==false||nativeH4?.sendPush!==false||
    !Number.isSafeInteger(nativeH4?.matchedUtcAndCompleteM5Blocks)||
    nativeH4.matchedUtcAndCompleteM5Blocks<1||
    nativeH4.mismatchBars!==0||
    !Array.isArray(raw)||raw.length<1||
    raw.some(p=>!Number.isInteger(p)||p<0||p>=240))
  return make("NATIVE_H4_PROOF_NOT_ACCEPTED_QA",{
   instrumentId,group:family
  });
 const nativePhases=[...new Set(raw)].sort((a,b)=>a-b);
 if(nativePhases.length!==1)
  return make("MULTI_PHASE_REQUIRES_SEGMENTED_DST_AUDIT_QA",{
   instrumentId,group:family,nativePhases:Object.freeze(nativePhases)
  });
 const phase=nativePhases[0];
 const native=nativeClockGroups(bars,phase);
 const ownerOpen=new Set(ownerH4.complete.map(x=>x.openedAt));
 const nativeOpen=new Set(native.complete.map(x=>x.openedAt));
 const overlap=native.complete.filter(x=>ownerOpen.has(x.openedAt)).length;
 const ownerOnly=ownerH4.complete.length-overlap;
 const nativeOnly=native.complete.length-overlap;
 const configuredPhases=[...new Set(ownerH4.complete.map(x=>
  Math.floor((x.openedAt%H4)/60_000)))].sort((a,b)=>a-b);
 const ownerHours=C1_HOURS[family];
 const nativeAtApprovedC1Hours=native.complete.filter(x=>
   ownerHours.includes(nyParts(x.openedAt).hour)).length;
 const nativeHours=[...new Set(native.complete.map(x=>
  nyParts(x.openedAt).hour))].sort((a,b)=>a-b);
 // Never call an unapproved aligned hour "C1". We only count the
 // observable alternative opens for the Owner's explicit clock review.
 const oneHourEarlierWindows=ownerHours.map(h=>(h+23)%24);
 const nativeAtEarlierHourCandidate=native.complete.filter(x=>
   oneHourEarlierWindows.includes(nyParts(x.openedAt).hour)).length;
 const mismatch=ownerOnly>0||nativeOnly>0||
    (configuredPhases.length>0&&
     configuredPhases.some(p=>p!==phase));
 return make(mismatch?
   "NATIVE_VS_OWNER_H4_ANCHOR_CONFLICT_QA":
   "SAMPLED_H4_ANCHOR_ALIGNED_BUT_NOT_CERTIFIED_QA",{
  instrumentId,group:family,
  nativeH4UtcPhaseMin:phase,
  configuredH4UtcPhasesMin:Object.freeze(configuredPhases),
  ownerC1HoursNY:Object.freeze([...ownerHours]),
  observedNativeH4OpeningHoursNY:Object.freeze(nativeHours),
  nativeCompleteH4:native.complete.length,
  nativeIncompleteH4:native.incomplete.length,
  ownerCompleteH4:ownerH4.complete.length,
  ownerIncompleteH4:ownerH4.rejected.length,
  timestampMatchedCompleteH4:overlap,
  ownerOnlyCompleteH4:ownerOnly,
  nativeOnlyCompleteH4:nativeOnly,
  nativeAtApprovedC1Hours,
  unapprovedOneHourEarlierHoursNY:Object.freeze(oneHourEarlierWindows),
  nativeAtUnapprovedEarlierHours:nativeAtEarlierHourCandidate,
  // Deliberately no OHLC or event payload in the report.
  requiresOwnerClockReview:mismatch,
  comparisonScope:"BROKER_DEMO_CLOSED_M5_ONLY",
  timezoneCrossSeasonCertified:false
 });
}
