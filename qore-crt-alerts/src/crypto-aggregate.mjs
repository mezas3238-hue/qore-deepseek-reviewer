import {M5_MS,deduplicateM5} from "./contracts.mjs";

// Exploratory 24/7 BTC aggregation anchored at 00:00 UTC (not a proposed
// CRT C1 schedule). H4/M15 OHLC values can be inspected, but every H4
// has allowedC1:false until the owner approves and Pine verifies the
// exact crypto session calendar. No alerts or valid CRT are emitted here.
export function aggregateClosedCryptoM5(input,{timeframe}={}){
  if(timeframe!=="H4"&&timeframe!=="M15")
    throw Error("UNSUPPORTED_CRYPTO_TIMEFRAME");
  const m5=deduplicateM5(input);
  if(m5.some(b=>b.instrumentId!=="BTCUSD"))
    throw Error("CRYPTO_AGGREGATE_BTCUSD_ONLY");
  if(m5.some(b=>b.provider!==m5[0].provider))
    throw Error("MIXED_CRYPTO_PROVIDERS");
  const n=timeframe==="H4"?48:3,period=n*M5_MS;
  const groups=new Map();
  for(const bar of m5){
    const start=Math.floor(bar.openedAt/period)*period;
    if(!groups.has(start))groups.set(start,[]);
    groups.get(start).push(bar);
  }
  const complete=[],rejected=[];
  for(const [openedAt,bars] of groups){
    bars.sort((a,b)=>a.openedAt-b.openedAt);
    if(bars.length!==n||bars[0].openedAt!==openedAt||
       bars.at(-1).closedAt!==openedAt+period||
       bars.some((b,i)=>b.openedAt!==openedAt+i*M5_MS)){
      rejected.push(Object.freeze({openedAt,observedM5:bars.length,
        expectedM5:n,reason:"INCOMPLETE_CRYPTO_M5"}));continue;
    }
    complete.push(Object.freeze({
      provider:bars[0].provider,instrumentId:"BTCUSD",family:"crypto",
      timeframe,openedAt,closedAt:openedAt+period,
      open:bars[0].open,high:Math.max(...bars.map(b=>b.high)),
      low:Math.min(...bars.map(b=>b.low)),close:bars.at(-1).close,
      aggregationAnchor:"UTC_00_PROBE_ONLY",
      c1Schedule:"NOT_APPROVED",allowedC1:false,
      actionable:false,sendPush:false
    }));
  }
  complete.sort((a,b)=>a.openedAt-b.openedAt);
  rejected.sort((a,b)=>a.openedAt-b.openedAt);
  return Object.freeze({
    environment:"OFFLINE_REPLAY",family:"crypto",
    certification:"NOT_APPROVED",actionable:false,sendPush:false,
    complete:Object.freeze(complete),rejected:Object.freeze(rejected)
  });
}
