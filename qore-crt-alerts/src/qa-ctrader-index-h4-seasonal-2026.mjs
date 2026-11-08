// QORE CRT QA: fixed-window read-only seasonal H4 evidence from cTrader
// DEMO for THREE index symbols, inside the authenticated 34/34 cohort.
// No candle editing, C1 override, inferred summer phase, trading or push.
import {nyParts,C1_HOURS} from "./ny-clock.mjs";
import {decodeNative34Trendbars} from "./qa-ctrader-ic34-native-timeframes.mjs";
const asMs=x=>Date.parse(x);
export const INDICES_FOR_SEASONAL_H4=Object.freeze({
 NDX100:Object.freeze({name:"USTEC",id:10014}),
 SPX500:Object.freeze({name:"US500",id:10013}),
 US30:Object.freeze({name:"US30",id:10015})
});
export const IC34_H4_SEASON_WINDOWS=Object.freeze([
 ["WINTER_PRE_SPRING_2026","2026-02-23T00:00:00Z","2026-03-02T00:00:00Z"],
 ["SUMMER_POST_SPRING_2026","2026-03-16T00:00:00Z","2026-03-23T00:00:00Z"],
 ["SUMMER_JULY_2026","2026-07-06T00:00:00Z","2026-07-13T00:00:00Z"],
 ["SUMMER_PRE_AUTUMN_2026","2026-10-19T00:00:00Z","2026-10-26T00:00:00Z"],
 ["WINTER_POST_AUTUMN_2026","2026-11-02T00:00:00Z","2026-11-07T00:00:00Z"]
].map(([id,from,to])=>Object.freeze({
 id,fromMs:asMs(from),toMs:asMs(to),maxBars:48
})));
const guard=(instrumentId,symbolId,nowMs)=>{
 const ref=INDICES_FOR_SEASONAL_H4[instrumentId];
 return !!ref&&ref.id===symbolId&&Number.isSafeInteger(nowMs)&&
   nowMs>IC34_H4_SEASON_WINDOWS.at(-1).toMs+300000;
};
export function seasonH4HistoryRequest({instrumentId,symbolId,index,nowMs}={}){
 if(!guard(instrumentId,symbolId,nowMs)||
    !Number.isInteger(index)||index<0||
    index>=IC34_H4_SEASON_WINDOWS.length)
  throw Error("CRT34_SEASON_SCOPE_OR_INDEX_INVALID");
 const w=IC34_H4_SEASON_WINDOWS[index];
 return Object.freeze({period:10,count:w.maxBars,
  fromTimestamp:w.fromMs,toTimestamp:w.toMs-1});
}
export function summarizeVerifiedIndexH4Season({
 instrumentId,symbolId,index,nowMs,trendbars
}={}){
 if(!guard(instrumentId,symbolId,nowMs)||
    !Number.isInteger(index)||index<0||
    index>=IC34_H4_SEASON_WINDOWS.length||
    !Array.isArray(trendbars)||trendbars.length>48)
  throw Error("CRT34_SEASON_RESPONSE_SCOPE_INVALID");
 const w=IC34_H4_SEASON_WINDOWS[index];
 const bars=decodeNative34Trendbars({raw:trendbars,period:10,
  symbolId,nowMs,maxBars:48});
 const phases=new Set(),openingNYHours=new Set();
 let approvedC1Opens=0,unapprovedEarlierOpens=0;
 const approved=C1_HOURS.index;
 for(const b of bars){
  if(b.openedAt<w.fromMs||b.openedAt>=w.toMs||
     b.closedAt>nowMs)
   throw Error("CRT34_SEASON_H4_OUTSIDE_REQUESTED_WINDOW");
  phases.add(b.openedAt%14_400_000/60_000);
  const h=nyParts(b.openedAt).hour;
  openingNYHours.add(h);
  if(approved.includes(h))approvedC1Opens++;
  if(approved.map(x=>(x+23)%24).includes(h))
   unapprovedEarlierOpens++;
 }
 return Object.freeze({
  windowId:w.id,requestedFromMs:w.fromMs,requestedToMs:w.toMs,
  instrumentId,symbolId,closedNativeH4:bars.length,
  nativeH4UtcPhaseMinutes:Object.freeze([...phases].sort((a,b)=>a-b)),
  observedOpenHoursNY:Object.freeze([...openingNYHours].sort((a,b)=>a-b)),
  nativeAtOwnerC1HoursNY:approvedC1Opens,
  nativeAtUnapprovedEarlierHoursNY:unapprovedEarlierOpens,
  samplesWithoutNativeH4:bars.length===0,
  multiPhaseInOneWindow:phases.size>1,
  crossSeasonClockCertified:false,
  priceParityForHistoricalWindowCertified:false,
  sourceParityCertified:false,crtFamiliesCertified:false,
  mssM5Certified:false,mssM15Certified:false,
  canTrade:false,sendPush:false
 });
}
export function evaluateIndexH4SeasonalEvidence({
 instrumentId,symbolId,windows
}={}){
 if(!INDICES_FOR_SEASONAL_H4[instrumentId]||
    INDICES_FOR_SEASONAL_H4[instrumentId].id!==symbolId||
    !Array.isArray(windows)||windows.length!==IC34_H4_SEASON_WINDOWS.length)
  throw Error("CRT34_SEASON_RESULTS_INCOMPLETE");
 for(let i=0;i<windows.length;i++){
  const w=windows[i],ref=IC34_H4_SEASON_WINDOWS[i];
  if(w?.windowId!==ref.id||w.instrumentId!==instrumentId||
     w.symbolId!==symbolId||
     !Number.isInteger(w.closedNativeH4)||
     w.closedNativeH4<=0||w.closedNativeH4>48||
     !Array.isArray(w.nativeH4UtcPhaseMinutes)||
     w.nativeH4UtcPhaseMinutes.length!==1||
     w.sourceParityCertified!==false||w.canTrade!==false||
     w.sendPush!==false)
   throw Error("CRT34_SEASON_MISSING_OR_MIXED_PHASE");
 }
 const winter=windows.filter(x=>x.windowId.startsWith("WINTER_"));
 const summer=windows.filter(x=>x.windowId.startsWith("SUMMER_"));
 const winterPhases=[...new Set(winter.flatMap(x=>x.nativeH4UtcPhaseMinutes))].sort();
 const summerPhases=[...new Set(summer.flatMap(x=>x.nativeH4UtcPhaseMinutes))].sort();
 const stableWithinWindows=winterPhases.length===1&&summerPhases.length===1;
 return Object.freeze({
  state:stableWithinWindows?
   "HISTORICAL_NATIVE_INDEX_H4_PHASES_OBSERVED_QA":
   "HISTORICAL_NATIVE_INDEX_H4_PHASE_CONFLICT_QA",
  instrumentId,symbolId,windows:Object.freeze([...windows]),
  requestedWindows:5,observedWindows:windows.length,
  nativeH4Bars:windows.reduce((a,x)=>a+x.closedNativeH4,0),
  winterH4PhaseMinutes:Object.freeze(winterPhases),
  summerH4PhaseMinutes:Object.freeze(summerPhases),
  nativeH4PhaseDiffersByNYSeason:
   winterPhases.length===1&&summerPhases.length===1&&
   winterPhases[0]!==summerPhases[0],
  approvedC1Matches:windows.reduce((a,x)=>a+x.nativeAtOwnerC1HoursNY,0),
  unapprovedAdjacentMatches:windows.reduce((a,x)=>
    a+x.nativeAtUnapprovedEarlierHoursNY,0),
  // Seasonal H4 opens are not enough to certify the correct CRT trading clock:
  // requires same-period 48 closed M5 + actual Pine chart event comparison.
  clockCertified:false,sourceParityCertified:false,
  sevenCrtRolesCertified:false,mssM5Certified:false,
  mssM15Certified:false,canTrade:false,sendPush:false
 });
}
