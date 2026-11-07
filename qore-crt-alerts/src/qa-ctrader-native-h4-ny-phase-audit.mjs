// Independent native cTrader DEMO H4 clock/OHLC audit versus 48x closed M5
// Forex New York 01/05/09 H4 reconstruction. A native H4 chart may have
// different UTC candle anchors. Never silently rephase or manufacture parity.
// NEVER feeds CRT/MSS, trading, notification or production.
const H4=14_400_000, M5=300_000;
const safeInt=v=>Number.isSafeInteger(v)&&v>=0?v:
  typeof v==="string"&&/^(0|[1-9][0-9]{0,15})$/.test(v)&&
  Number.isSafeInteger(Number(v))?Number(v):null;
const safePrice=n=>typeof n==="number"&&Number.isFinite(n)&&n>0;
const ticks=n=>{
 if(!safePrice(n))throw Error("CTRADER_NATIVE_H4_QA_PRICE_INVALID");
 const x=Math.round(n*100000);
 if(!Number.isSafeInteger(x)||Math.abs(n-x/100000)>1e-8)
  throw Error("CTRADER_NATIVE_H4_QA_PRECISION_INVALID");
 return x;
};
export function decodeClosedNativeEurusdH4({raw,nowMs,expectedDigits=5}={}){
 if(!Number.isSafeInteger(nowMs)||nowMs<=0||expectedDigits!==5)
  throw Error("CTRADER_NATIVE_H4_QA_CONFIG_INVALID");
 if(!Array.isArray(raw)||raw.length>20)
  throw Error("CTRADER_NATIVE_H4_QA_COUNT_INVALID");
 const decoded=[];
 for(const bar of raw){
  if(bar?.period!==undefined&&bar.period!==10&&bar.period!=="H4")
   throw Error("CTRADER_NATIVE_H4_QA_PERIOD_INVALID");
  const minute=safeInt(bar?.utcTimestampInMinutes),
  low=safeInt(bar?.low),o=safeInt(bar?.deltaOpen),
  hi=safeInt(bar?.deltaHigh),c=safeInt(bar?.deltaClose);
  if(minute===null||low===null||o===null||hi===null||c===null||
   minute===0||low===0||o>hi||c>hi||
   ![low+o,low+hi,low+c].every(Number.isSafeInteger))
   throw Error("CTRADER_NATIVE_H4_QA_OHLC_INVALID");
  const openedAt=minute*60000,closedAt=openedAt+H4;
  if(!Number.isSafeInteger(openedAt)||openedAt%M5!==0||
     closedAt>nowMs||!Number.isSafeInteger(closedAt))
   throw Error("CTRADER_NATIVE_H4_QA_UNCLOSED_OR_PHASE");
  const cv=t=>Number((t/100000).toFixed(5));
  const item=Object.freeze({
   openedAt,closedAt,open:cv(low+o),high:cv(low+hi),
   low:cv(low),close:cv(low+c),
   source:"CTRADER_OPEN_API_DEMO_NATIVE_H4",timeframe:"H4",
   symbolId:1,certified:false,actionable:false,sendPush:false
  });
  if(![item.open,item.high,item.low,item.close].every(safePrice)||
      item.low>Math.min(item.open,item.close)||
      item.high<Math.max(item.open,item.close))
   throw Error("CTRADER_NATIVE_H4_QA_PRICE_INVALID");
  decoded.push(item);
 }
 decoded.sort((a,b)=>a.openedAt-b.openedAt);
 for(let i=1;i<decoded.length;i++){
  if(decoded[i].openedAt<=decoded[i-1].openedAt)
    throw Error("CTRADER_NATIVE_H4_QA_DUPLICATE");
 }
 return Object.freeze(decoded);
}
export function auditNativeVsNyForexH4({nativeBars,nyBars}={}){
 if(!Array.isArray(nativeBars)||nativeBars.length>20||
    !Array.isArray(nyBars)||nyBars.length!==12)
  throw Error("CTRADER_NATIVE_H4_QA_COHORT_INVALID");
 const n=new Map(),y=new Map();
 for(const bar of nativeBars){
  if(bar?.source!=="CTRADER_OPEN_API_DEMO_NATIVE_H4"||
     bar.timeframe!=="H4"||bar.symbolId!==1||
     bar.certified!==false||bar.actionable!==false||
     bar.sendPush!==false||bar.closedAt!==bar.openedAt+H4||
     n.has(bar.openedAt))
   throw Error("CTRADER_NATIVE_H4_QA_UNTRUSTED_OR_DUPLICATE");
  n.set(bar.openedAt,bar);
 }
 for(const bar of nyBars){
  if(bar?.m5Bars!==48||bar.sourceParityCertified!==false||
     bar.actionable!==false||bar.sendPush!==false||
     bar.closedAt!==bar.openedAt+H4||y.has(bar.openedAt))
   throw Error("CTRADER_NY_H4_QA_UNTRUSTED_OR_DUPLICATE");
  y.set(bar.openedAt,bar);
 }
 const observedNativePhases=[...new Set([...n.keys()].map(t=>(t%H4)/60000))].sort((a,b)=>a-b);
 const observedNyPhases=[...new Set([...y.keys()].map(t=>(t%H4)/60000))].sort((a,b)=>a-b);
 let identicalStartTimes=0,ohlcDisagreementBars=0,maxDeltaTicks=0;
 const disagree={open:0,high:0,low:0,close:0};
 for(const [t,bar] of y){
  const match=n.get(t);
  if(!match)continue;
  identicalStartTimes++;let differs=false;
  for(const k of ["open","high","low","close"]){
   const delta=Math.abs(ticks(match[k])-ticks(bar[k]));
   if(delta){disagree[k]++;differs=true;}
   maxDeltaTicks=Math.max(maxDeltaTicks,delta);
  }
  if(differs)ohlcDisagreementBars++;
 }
 const fullAnchorAlignment=identicalStartTimes===12;
 const fullOhlcAlignment=fullAnchorAlignment&&ohlcDisagreementBars===0;
 const state=fullOhlcAlignment?"CTRADER_NATIVE_H4_NY_OHLC_MATCH_QA":
   fullAnchorAlignment?"CTRADER_NATIVE_H4_NY_OHLC_DIFFERENCE_QA":
   "CTRADER_NATIVE_H4_NY_CLOCK_MISMATCH_OR_INCOMPLETE_QA";
 return Object.freeze({
  state,nyForexAnchor:"America/New_York 01/05/09",
  nativeH4BarsObserved:nativeBars.length,derivedNyH4Bars:nyBars.length,
  matchedUtcStarts:identicalStartTimes,
  nativeH4UtcMinutePhases:Object.freeze(observedNativePhases),
  derivedNyH4UtcMinutePhases:Object.freeze(observedNyPhases),
  mismatchOhlcBars:ohlcDisagreementBars,
  mismatchOhlcByField:Object.freeze(disagree),
  maxDeltaTicks,fullAnchorAlignment,fullOhlcAlignment,
  forcedTimestampShiftMinutes:0,
  tradingViewParityCertified:false,
  nativeBrokerH4Audited:true,
  crtFamiliesCertified:false,mssCertified:false,
  sourceParityCertified:false,canTrade:false,sendPush:false
 });
}
