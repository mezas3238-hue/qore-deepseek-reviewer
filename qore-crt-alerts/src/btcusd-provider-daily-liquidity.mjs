import {M5_MS,deduplicateM5} from "./contracts.mjs";

// Mirrors the BTC chart-D (provider 1D) operational PDH/PDL rule.
// prevDaily MUST be an independently confirmed DAILY candle from the
// exact same provider/symbol. It is not synthesized from M5.
// CLOSED M5 bars of the CURRENT daily period alone may mark a sweep.
// This is an OFFLINE reference comparison only, never notification.
export function auditBtcProviderDailyLiquidity({prevDaily,currentM5}={}){
  if(!prevDaily||typeof prevDaily!=="object"||
     prevDaily.instrumentId!=="BTCUSD"||
     typeof prevDaily.provider!=="string"||!prevDaily.provider||
     !Number.isSafeInteger(prevDaily.openedAt)||
     !Number.isSafeInteger(prevDaily.closedAt)||
     prevDaily.openedAt>=prevDaily.closedAt||
     ![276,288,300].includes((prevDaily.closedAt-prevDaily.openedAt)/M5_MS)||
     !Number.isFinite(prevDaily.high)||!Number.isFinite(prevDaily.low)||
     prevDaily.high<=0||prevDaily.low<=0||prevDaily.high<prevDaily.low||
     !Array.isArray(currentM5))
    throw Error("BTC_PROVIDER_DAILY_PROVENANCE_REJECTED");
  const bars=deduplicateM5(currentM5);
  if(bars.some(b=>b.instrumentId!=="BTCUSD"||
     b.provider!==prevDaily.provider))
    throw Error("BTC_PROVIDER_DAILY_SOURCE_MISMATCH");
  // Fail closed on missing current-day opening or a gap. Never use a
  // stale prior-day value to claim today's PDH/PDL is intact.
  const continuous=bars.length>0&&
    bars[0].openedAt===prevDaily.closedAt&&
    bars.every((b,i)=>b.openedAt===prevDaily.closedAt+i*M5_MS&&
      b.closedAt===b.openedAt+M5_MS);
  const pdhSweep=continuous?
    bars.find(b=>b.high>prevDaily.high):null;
  const pdlSweep=continuous?
    bars.find(b=>b.low<prevDaily.low):null;
  return Object.freeze({
    instrumentId:"BTCUSD",provider:prevDaily.provider,
    referenceType:"PREVIOUS_PROVIDER_DAILY_CLOSED",
    referenceStartMs:prevDaily.openedAt,
    referenceEndMs:prevDaily.closedAt,
    pdh:prevDaily.high,pdl:prevDaily.low,
    observedM5:bars.length,
    contiguous:continuous,
    pdhState:!continuous?"N/D":pdhSweep?"TAKEN":"INTACTO",
    pdlState:!continuous?"N/D":pdlSweep?"TAKEN":"INTACTO",
    pdhFirstSweepAt:pdhSweep?.closedAt??null,
    pdlFirstSweepAt:pdlSweep?.closedAt??null,
    actionable:false,sendPush:false,certified:false
  });
}
