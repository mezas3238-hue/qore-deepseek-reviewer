// QORE CRT / cTrader DEMO VIEW-only QA: native vs causally derived M15 and H4
// for ALL 34 instruments. Instrument-specific gaps remain unfilled and
// unverifiable sessions are not treated as market data. BTC is independent.
// No CRT/MSS signals, API orders, LIVE, FCM, push, or production access.
const M5=300000, M15=900000, H4=14400000;
const freeze=Object.freeze;
const safeUnsigned=v=>{
 if(typeof v==="number")return Number.isSafeInteger(v)&&v>=0?v:null;
 if(typeof v==="string"&&/^(?:0|[1-9][0-9]{0,15})$/.test(v)){
  const x=Number(v);return Number.isSafeInteger(x)?x:null;
 }
 return null;
};
const ticks=v=>{
 if(typeof v!=="number"||!Number.isFinite(v)||v<=0)
  throw Error("CTRADER_34_NATIVE_PRICE_INVALID");
 const x=Math.round(v*100000);
 if(!Number.isSafeInteger(x)||Math.abs(x/100000-v)>1e-8)
  throw Error("CTRADER_34_NATIVE_PRICE_NON_INTEGER_TICK");
 return x;
};
const values=["open","high","low","close"];
export function decodeNative34Trendbars({
 raw,period,symbolId,nowMs,maxBars
}={}){
 if(![7,10].includes(period)||!Number.isSafeInteger(symbolId)||
    symbolId<=0||!Number.isSafeInteger(nowMs)||nowMs<=0||
    !Number.isInteger(maxBars)||maxBars<1||maxBars>300||
    !Array.isArray(raw)||raw.length>maxBars)
  throw Error("CTRADER_34_NATIVE_CONFIG_INVALID");
 const span=period===7?M15:H4,phase=period===7?M15:M5;
 const decoded=raw.map(bar=>{
  if(bar?.period!==undefined&&bar.period!==period&&
     bar.period!==(period===7?"M15":"H4"))
   throw Error("CTRADER_34_NATIVE_PERIOD_INVALID");
  const min=safeUnsigned(bar?.utcTimestampInMinutes),
   lo=safeUnsigned(bar?.low),o=safeUnsigned(bar?.deltaOpen),
   hi=safeUnsigned(bar?.deltaHigh),cl=safeUnsigned(bar?.deltaClose);
  if(min===null||lo===null||o===null||hi===null||cl===null||
     lo<=0||o>hi||cl>hi||![lo+o,lo+hi,lo+cl].every(Number.isSafeInteger))
   throw Error("CTRADER_34_NATIVE_DELTA_INVALID");
  const openedAt=min*60000,closedAt=openedAt+span;
  if(!Number.isSafeInteger(openedAt)||openedAt<=0||
     openedAt%phase!==0||closedAt>nowMs||
     !Number.isSafeInteger(closedAt))
   throw Error("CTRADER_34_NATIVE_TIME_INVALID");
  const result=freeze({
   openedAt,closedAt,symbolId,period,
   open:lo+o,high:lo+hi,low:lo,close:lo+cl
  });
  if(result.low>Math.min(result.open,result.close)||
     result.high<Math.max(result.open,result.close))
   throw Error("CTRADER_34_NATIVE_OHLC_INVALID");
  return result;
 }).sort((a,b)=>a.openedAt-b.openedAt);
 for(let i=1;i<decoded.length;i++)if(decoded[i].openedAt<=decoded[i-1].openedAt)
  throw Error("CTRADER_34_NATIVE_DUPLICATE_TIME");
 return freeze(decoded);
}
function verifyM5(bars,instrumentId,symbolId){
 if(!Array.isArray(bars)||bars.length!==600||
    typeof instrumentId!=="string"||
    !Number.isInteger(symbolId)||symbolId<=0)
  throw Error("CTRADER_34_M5_COHORT_INCOMPLETE");
 let previous=null;
 for(const bar of bars){
  if(bar?.source!=="CTRADER_OPEN_API_DEMO"||
     bar.provider!=="IC"||bar.instrumentId!==instrumentId||
     bar.symbolId!==symbolId||bar.certified!==false||
     bar.actionable!==false||bar.sendPush!==false||
     !Number.isSafeInteger(bar.openedAt)||
     bar.openedAt<=0||bar.openedAt%M5!==0||
     bar.closedAt!==bar.openedAt+M5||
     (previous!==null&&bar.openedAt<=previous))
   throw Error("CTRADER_34_M5_PROVENANCE_INVALID");
  for(const key of values)ticks(bar[key]);
  if(bar.low>Math.min(bar.open,bar.close)||
     bar.high<Math.max(bar.open,bar.close))
   throw Error("CTRADER_34_M5_OHLC_INVALID");
  previous=bar.openedAt;
 }
}
export function compareNative34AgainstClosedM5({
 m5Bars,nativeBars,period,instrumentId,symbolId
}={}){
 verifyM5(m5Bars,instrumentId,symbolId);
 if(!Array.isArray(nativeBars)||nativeBars.length>300||
    ![7,10].includes(period))
  throw Error("CTRADER_34_COMPARE_NATIVE_INVALID");
 const span=period===7?M15:H4,count=span/M5;
 const byM5=new Map(m5Bars.map(x=>[x.openedAt,x]));
 const nativeTimes=new Set();
 let eligibleFromM5=0,matched=0,mismatched=0,maxDifferenceTicks=0;
 const fields={open:0,high:0,low:0,close:0};
 const phases=new Set();
 let phaseMatched=0;
 const first=m5Bars[0].openedAt,last=m5Bars.at(-1).closedAt;
 let nativeInWindow=0;
 for(const n of nativeBars){
  if(n?.symbolId!==symbolId||n.period!==period||
     !Number.isSafeInteger(n.openedAt)||
     n.closedAt!==n.openedAt+span||nativeTimes.has(n.openedAt)||
     values.some(k=>!Number.isSafeInteger(n[k])))
   throw Error("CTRADER_34_COMPARE_NATIVE_SOURCE_INVALID");
  nativeTimes.add(n.openedAt);
  phases.add(Math.floor((n.openedAt%H4)/60000));
  if(n.openedAt<first||n.closedAt>last)continue;
  nativeInWindow++;
  // The group must contain precisely 3 or 48 consecutive *closed*
  // actual broker M5. Any absent M5 => this block is ineligible.
  const group=Array.from({length:count},(_,i)=>
    byM5.get(n.openedAt+i*M5));
  if(group.some(x=>!x))continue;
  eligibleFromM5++;
  const expected={
   open:ticks(group[0].open),
   high:Math.max(...group.map(x=>ticks(x.high))),
   low:Math.min(...group.map(x=>ticks(x.low))),
   close:ticks(group.at(-1).close)
  };
  matched++;let different=false;
  for(const k of values){
   const delta=Math.abs(expected[k]-n[k]);
   if(delta!==0){different=true;fields[k]++;}
   maxDifferenceTicks=Math.max(maxDifferenceTicks,delta);
  }
  if(different)mismatched++;
  if(n.openedAt%span===0)phaseMatched++;
 }
 const status=matched===0?
  "NO_COMPLETE_CLOSED_M5_BLOCKS_AT_NATIVE_ANCHORS_QA":
  mismatched>0?"NATIVE_DERIVED_OHLC_DIFFERENCE_QA":
  "NATIVE_DERIVED_MATCHED_ELIGIBLE_BLOCKS_QA";
 return freeze({
  state:status,periodName:period===7?"M15":"H4",
  instrumentId,nativeBarsFetched:nativeBars.length,
  nativeBarsWithinM5Window:nativeInWindow,
  eligibleNativeAnchoredM5Blocks:eligibleFromM5,
  matchedUtcAndCompleteM5Blocks:matched,
  skippedNativeBlocks:nativeInWindow-matched,
  mismatchBars:mismatched,mismatchByField:freeze(fields),
  maxDifferenceTicks,nativeUtcH4PhasesMinutes:freeze([...phases].sort((a,b)=>a-b)),
  nativeAnchorUtcModuloPeriodMatches:phaseMatched,
  // Never promote M5->M15/H4 OHLC consistency to TV or CRT/MSS parity.
  nativeDerivedFullCoverageCertified:false,
  tradingViewParityCertified:false,
  sourceParityCertified:false,crtFamiliesCertified:false,
  mssM5Certified:false,mssM15Certified:false,canTrade:false,sendPush:false
 });
}
