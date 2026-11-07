// Pure fail-closed QA reconstruction of H4 from independently validated
// closed cTrader DEMO M5 candles. EURUSD only; Forex NY 01/05/09/13/17/21.
// Does NOT certify TradingView parity, CRT, MSS, FCM, or trading.
const M5=300_000;
const H4_BARS=48;
const isFinitePrice=x=>typeof x==="number"&&Number.isFinite(x)&&x>0;
const formatter=new Intl.DateTimeFormat("en-GB",{
  timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
});
const nyParts=timestamp=>{
  const parts=formatter.formatToParts(new Date(timestamp));
  const hour=Number(parts.find(p=>p.type==="hour")?.value);
  const minute=Number(parts.find(p=>p.type==="minute")?.value);
  if(!Number.isInteger(hour)||hour<0||hour>23||
    !Number.isInteger(minute)||minute<0||minute>59)
    throw Error("CRT_QA_NY_TIME_INVALID");
  return {hour,minute};
};
export function nyForexH4BucketStart(openedAt){
  if(!Number.isSafeInteger(openedAt)||openedAt<=0||openedAt%M5!==0)
    throw Error("CRT_QA_M5_TIMESTAMP_INVALID");
  const {hour,minute}=nyParts(openedAt);
  const sinceAnchor=((hour-1+24)%4)*60+minute;
  return openedAt-sinceAnchor*60_000;
}
export function summarizeClosedEurusdH4(candles){
  if(!Array.isArray(candles)||candles.length<1||candles.length>1500)
    throw Error("CRT_QA_H4_CANDLE_COUNT_INVALID");
  const groups=new Map();
  let prior=null;
  for(const candle of candles){
    const t=candle?.openedAt;
    if(candle.provider!=="IC"||candle.instrumentId!=="EURUSD"||
       candle.source!=="CTRADER_OPEN_API_DEMO"||
       candle.certified!==false||candle.sendPush!==false||
       !Number.isSafeInteger(t)||t<=0||t%M5!==0||
       candle.closedAt!==t+M5||
       !["open","high","low","close"].every(k=>isFinitePrice(candle[k]))||
       candle.low>Math.min(candle.open,candle.close)||
       candle.high<Math.max(candle.open,candle.close)||
       candle.low>candle.high)
      throw Error("CRT_QA_H4_INVALID_DEMO_CLOSED_M5");
    if(prior!==null&&t<=prior)
      throw Error("CRT_QA_H4_M5_DUPLICATE_OR_UNSORTED");
    prior=t;
    const bucket=nyForexH4BucketStart(t);
    if(!groups.has(bucket))groups.set(bucket,[]);
    groups.get(bucket).push(candle);
  }
  const completed=[];
  let partial=0,gapped=0;
  for(const [start,bars] of groups){
    const correctStart=bars[0].openedAt===start;
    const contiguous=bars.every((c,i)=>
      c.openedAt===start+i*M5 &&
      nyForexH4BucketStart(c.openedAt)===start);
    if(bars.length===H4_BARS&&correctStart&&contiguous){
      completed.push(Object.freeze({
        openedAt:start,closedAt:start+4*3600_000,
        open:bars[0].open,close:bars.at(-1).close,
        high:Math.max(...bars.map(b=>b.high)),
        low:Math.min(...bars.map(b=>b.low)),
        m5Bars:bars.length,sourceParityCertified:false,
        actionable:false,sendPush:false
      }));
    }else if(bars.length<H4_BARS&&
       bars.every((c,i)=>i===0||c.openedAt>bars[i-1].openedAt)){
      if(!contiguous && bars.length>1 &&
         bars.some((c,i)=>i>0&&c.openedAt!==bars[i-1].openedAt+M5))
        gapped++;
      else partial++;
    }else{
      gapped++;
    }
  }
  const frozen=Object.freeze(completed.sort((a,b)=>a.openedAt-b.openedAt));
  return Object.freeze({
    state:"EURUSD_H4_RECONSTRUCTION_QA_ONLY",
    anchor:"America/New_York Forex 01/05/09",
    closedM5Count:candles.length,
    completeH4Blocks:frozen.length,partialH4Blocks:partial,
    rejectedH4Blocks:gapped,
    firstCompleteH4OpenedAtMs:frozen[0]?.openedAt??null,
    lastCompleteH4ClosedAtMs:frozen.at(-1)?.closedAt??null,
    // Internal-only for offline checks; never export reconstructed OHLC
    // to QORE Mobile, FCM, or a public route.
    bars:frozen,sourceParityCertified:false,
    crtFamiliesCertified:false,mssCertified:false,canTrade:false,sendPush:false
  });
}
