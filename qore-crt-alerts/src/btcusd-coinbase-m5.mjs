import {M5_MS,validateClosedM5,deduplicateM5} from "./contracts.mjs";

// Read-only BTC-USD Coinbase SPOT exploration. Not IC:BTCUSD, MT5, a
// licensed redistributed feed, a CRT certification or an FCM sender.
// Official public API: /api/v3/brokerage/market/products/BTC-USD/candles.
// All clocks are UTC. The latest forming M5 is NEVER admitted.
export const BTC_PROBE=Object.freeze({
  provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
  feedSymbol:"BTC-USD",family:"crypto",environment:"OFFLINE_REPLAY",
  marketEquivalence:"UNVERIFIED",crtSchedule:"NOT_APPROVED",
  sendPush:false,actionable:false
});
const URL="https://api.coinbase.com/api/v3/brokerage/market/products/BTC-USD/candles";
const finiteNumber=x=>{
  if(typeof x!=="string"&&typeof x!=="number")throw Error("INVALID_COINBASE_PRICE");
  if(String(x).trim()==="")throw Error("INVALID_COINBASE_PRICE");
  const n=Number(x);
  if(!Number.isFinite(n)||n<=0)throw Error("INVALID_COINBASE_PRICE");
  return n;
};
const validMs=x=>Number.isSafeInteger(x)&&x>=0&&x%M5_MS===0;

export function normalizeCoinbaseBtcM5(payload,{startMs,endMs,receivedAt,finalityLagMs=30000}={}){
  if(!validMs(startMs)||!validMs(endMs)||endMs<=startMs||
     endMs-startMs>300*M5_MS||!Number.isSafeInteger(receivedAt)||
     receivedAt<0||!Number.isSafeInteger(finalityLagMs)||
     finalityLagMs<0||finalityLagMs>M5_MS)
    throw Error("INVALID_PROBE_WINDOW");
  if(!payload||!Array.isArray(payload.candles)||payload.candles.length>350)
    throw Error("INVALID_COINBASE_RESPONSE");
  const accepted=[];
  let formingOmitted=0,outOfWindowOmitted=0;
  for(const raw of payload.candles){
    if(!raw||typeof raw!=="object"||Array.isArray(raw)||
       typeof raw.start!=="string"||!/^(0|[1-9][0-9]*)$/.test(raw.start))
      throw Error("INVALID_COINBASE_CANDLE");
    const seconds=Number(raw.start),openedAt=seconds*1000,closedAt=openedAt+M5_MS;
    if(!validMs(openedAt))throw Error("INVALID_COINBASE_CANDLE_TIME");
    // Coinbase can include a boundary/extra bucket outside the requested
    // window. Count/omit it, NEVER treat it as continuity or a closed bar.
    if(openedAt<startMs||openedAt>=endMs){
      outOfWindowOmitted++;continue;
    }
    const candle=validateClosedM5({
      provider:BTC_PROBE.provider,instrumentId:"BTCUSD",
      openedAt,closedAt,
      open:finiteNumber(raw.open),high:finiteNumber(raw.high),
      low:finiteNumber(raw.low),close:finiteNumber(raw.close)
    });
    if(closedAt>receivedAt-finalityLagMs){
      formingOmitted++;continue;
    }
    accepted.push(candle);
  }
  const bars=deduplicateM5(accepted);
  // Missing intervals never become fabricated candles. A consumer must
  // quarantine gaps before attempting any aggregate or CRT processing.
  const expected=(endMs-startMs)/M5_MS;
  return Object.freeze({
    ...BTC_PROBE,state:"BTC_M5_PROBE_ONLY",
    bars:Object.freeze(bars),returned:payload.candles.length,
    formingOmitted,outOfWindowOmitted,
    expected,completeWindow:bars.length===expected,
    requiresTradingViewParity:true
  });
}

export async function fetchCoinbaseBtcM5({
  startMs,endMs,receivedAt,fetchImpl=globalThis.fetch,finalityLagMs=30000
}={}){
  if(!validMs(startMs)||!validMs(endMs)||endMs<=startMs||
     endMs-startMs>300*M5_MS||!Number.isSafeInteger(receivedAt)||
     receivedAt<0||!Number.isSafeInteger(finalityLagMs)||
     finalityLagMs<0||finalityLagMs>M5_MS||
     typeof fetchImpl!=="function")
    throw Error("INVALID_PROBE_WINDOW");
  // Never request future/unclosed candles; require a verifiable wall clock.
  if(endMs>receivedAt-finalityLagMs)throw Error("WINDOW_NOT_FINAL");
  const query=new URLSearchParams({
    start:String(startMs/1000),end:String(endMs/1000),
    granularity:"FIVE_MINUTE",
    limit:String((endMs-startMs)/M5_MS)
  });
  let response;
  try{
    response=await fetchImpl(URL+"?"+query.toString(),{
      method:"GET",headers:{"accept":"application/json"},
      redirect:"error",signal:AbortSignal.timeout(8000)
    });
  }catch{throw Error("COINBASE_PROBE_NETWORK_UNAVAILABLE");}
  if(!response||response.ok!==true)throw Error("COINBASE_PROBE_HTTP_REJECTED");
  let data;
  try{data=await response.json();}catch{throw Error("INVALID_COINBASE_RESPONSE");}
  return normalizeCoinbaseBtcM5(data,{startMs,endMs,receivedAt,finalityLagMs});
}

export function stageBtcProbeM5(ingestion,probe,{receivedAt}={}){
  if(!ingestion||typeof ingestion.ingest!=="function"||
     !probe||probe.provider!==BTC_PROBE.provider||
     probe.instrumentId!=="BTCUSD"||probe.feedSymbol!=="BTC-USD"||
     probe.state!=="BTC_M5_PROBE_ONLY"||probe.sendPush!==false||
     !Array.isArray(probe.bars)||!Number.isSafeInteger(receivedAt))
    throw Error("INVALID_BTC_PROBE_STAGING");
  let accepted=0;
  for(const bar of probe.bars){
    const r=ingestion.ingest({...bar,feedSymbol:"BTC-USD"},{receivedAt});
    if(r.state==="CLOSED_M5_ACCEPTED")accepted++;
    else if(r.state!=="DUPLICATE_IGNORED")
      return Object.freeze({state:r.state,accepted,actionable:false,sendPush:false});
  }
  return Object.freeze({state:probe.completeWindow?
    "BTC_M5_PROBE_STAGED":"BTC_M5_INCOMPLETE_HELD",
    accepted,actionable:false,sendPush:false});
}
