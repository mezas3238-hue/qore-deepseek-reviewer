// IC Markets cTrader DEMO QA: independent native M15 OHLC vs strictly
// reconstructed 3x closed M5. Never certificate for CRT, MSS, TradingView,
// mobile notifications, account trading or provider equivalence.
const M15=900000;
const safeInt=v=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0?v:
  typeof v==="string"&&/^(0|[1-9][0-9]{0,15})$/.test(v)&&
  Number.isSafeInteger(Number(v))?Number(v):null;
const finitePrice=n=>typeof n==="number"&&Number.isFinite(n)&&n>0;
export function decodeClosedNativeEurusdM15({
  raw,nowMs,expectedDigits=5
}={}){
 if(!Number.isSafeInteger(nowMs)||nowMs<=0||expectedDigits!==5)
  throw Error("CTRADER_NATIVE_M15_QA_CONFIG_INVALID");
 if(!Array.isArray(raw)||raw.length>200||raw.length<1)
  throw Error("CTRADER_NATIVE_M15_QA_COUNT_INVALID");
 const rows=[];
 for(const bar of raw){
  if(bar?.period!==undefined&&bar.period!==7&&bar.period!=="M15")
   throw Error("CTRADER_NATIVE_M15_QA_PERIOD_INVALID");
  const minute=safeInt(bar?.utcTimestampInMinutes),
    low=safeInt(bar?.low),o=safeInt(bar?.deltaOpen),
    h=safeInt(bar?.deltaHigh),c=safeInt(bar?.deltaClose);
  if(minute===null||low===null||o===null||h===null||c===null||
     low<=0||o>h||c>h||![low+o,low+h,low+c].every(Number.isSafeInteger))
   throw Error("CTRADER_NATIVE_M15_QA_OHLC_INVALID");
  const openedAt=minute*60000,closedAt=openedAt+M15;
  if(!Number.isSafeInteger(openedAt)||openedAt<=0||
     openedAt%M15!==0||closedAt>nowMs)
   throw Error("CTRADER_NATIVE_M15_QA_NOT_CLOSED_OR_PHASE");
  const decode=x=>Number((x/100000).toFixed(5));
  const item=Object.freeze({
   openedAt,closedAt,open:decode(low+o),high:decode(low+h),
   low:decode(low),close:decode(low+c),
   source:"CTRADER_OPEN_API_DEMO_NATIVE_M15",timeframe:"M15",
   symbolId:1,certified:false,actionable:false,sendPush:false
  });
  if(![item.open,item.high,item.low,item.close].every(finitePrice)||
     item.high<Math.max(item.open,item.close)||
     item.low>Math.min(item.open,item.close))
   throw Error("CTRADER_NATIVE_M15_QA_PRICE_INVALID");
  rows.push(item);
 }
 rows.sort((a,b)=>a.openedAt-b.openedAt);
 for(let i=1;i<rows.length;i++)
  if(rows[i].openedAt<=rows[i-1].openedAt)
   throw Error("CTRADER_NATIVE_M15_QA_DUPLICATE_OR_REORDER");
 return Object.freeze(rows);
}
const q5=n=>{
 if(!finitePrice(n))throw Error("CTRADER_M15_QA_PRICE_NOT_FINITE");
 const p=Math.round(n*1e5);
 if(!Number.isSafeInteger(p)||Math.abs(p/1e5-n)>1e-8)
  throw Error("CTRADER_M15_QA_PRICE_PRECISION");
 return p;
};
export function compareNativeDerivedEurusdM15({nativeBars,derivedBars}={}){
 if(!Array.isArray(nativeBars)||!Array.isArray(derivedBars)||
   derivedBars.length!==200||derivedBars.some(x=>
    x?.source!=="CTRADER_OPEN_API_DEMO_DERIVED_M15"||
    x.timeframe!=="M15"||x.sourceM5Count!==3||
    x.certified!==false||x.sendPush!==false)||
   !Array.isArray(nativeBars)||nativeBars.length>200)
  throw Error("CTRADER_M15_QA_PROVEN_DERIVED_200_REQUIRED");
 const nativeByTs=new Map(),derivedByTs=new Map();
 for(const bar of nativeBars){
  if(bar?.source!=="CTRADER_OPEN_API_DEMO_NATIVE_M15"||
     bar.timeframe!=="M15"||bar.symbolId!==1||
     bar.certified!==false||bar.sendPush!==false||
     nativeByTs.has(bar.openedAt))
   throw Error("CTRADER_NATIVE_M15_QA_SOURCE_OR_DUPLICATE");
  nativeByTs.set(bar.openedAt,bar);
 }
 for(const bar of derivedBars){
  if(derivedByTs.has(bar.openedAt))
   throw Error("CTRADER_DERIVED_M15_QA_DUPLICATE");
  derivedByTs.set(bar.openedAt,bar);
 }
 let compared=0,unpairedNative=0,unpairedDerived=0,ohlcMismatchBars=0;
 const differences={open:0,high:0,low:0,close:0};
 let maxDifferenceTicks=0;
 for(const [t,derived] of derivedByTs){
  const native=nativeByTs.get(t);
  if(!native){unpairedDerived++;continue;}
  if(native.closedAt!==derived.closedAt)
   throw Error("CTRADER_M15_QA_CLOSED_AT_MISMATCH");
  compared++;let differs=false;
  for(const key of ["open","high","low","close"]){
   const delta=Math.abs(q5(native[key])-q5(derived[key]));
   if(delta){differences[key]++;differs=true;}
   maxDifferenceTicks=Math.max(maxDifferenceTicks,delta);
  }
  if(differs)ohlcMismatchBars++;
 }
 for(const t of nativeByTs.keys())if(!derivedByTs.has(t))unpairedNative++;
 const complete=compared===200&&nativeBars.length===200&&
  unpairedNative===0&&unpairedDerived===0;
 const pricesMatch=complete&&ohlcMismatchBars===0;
 return Object.freeze({
  state:!complete?"CTRADER_M15_NATIVE_COHORT_INCOMPLETE_QA":
   pricesMatch?"CTRADER_M15_NATIVE_DERIVED_OHLC_MATCH_QA":
     "CTRADER_M15_NATIVE_DERIVED_OHLC_DIFFERENCE_QA",
  nativeBarsReceived:nativeBars.length,derivedM15Count:200,
  sameTimestampBars:compared,unpairedNative,unpairedDerived,
  ohlcMismatchBars,ohlcMismatchByField:Object.freeze(differences),
  maxDifferenceTicks,
  nativeM15Compared:true,nativeDerivedOhlcMatch:pricesMatch,
  // Intra-cTrader comparison never certifies independent TradingView feed.
  tradingViewParityCertified:false,crtFamiliesCertified:false,
  mssM5Certified:false,mssM15Certified:false,
  sourceParityCertified:false,canTrade:false,sendPush:false
 });
}
