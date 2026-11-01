import {deduplicateM5} from "./contracts.mjs";
import {aggregateClosedM5} from "./aggregate.mjs";

// BTCUSD uses the OWNER-APPROVED Forex H4 cycle start hours
// 01:00 / 05:00 / 21:00 in America/New_York, seven days/week.
// Candle boundaries are NY-local, NOT UTC-midnight anchored; DST folds
// or missing M5 are rejected rather than silently creating a new C1.
// Approval of a schedule does not prove Coinbase vs TradingView parity.
export function aggregateClosedCryptoM5(input,{timeframe}={}){
  if(!["H4","M15"].includes(timeframe))
    throw Error("UNSUPPORTED_CRYPTO_TIMEFRAME");
  const m5=deduplicateM5(input);
  if(m5.some(x=>x.instrumentId!=="BTCUSD"))
    throw Error("CRYPTO_AGGREGATE_BTCUSD_ONLY");
  if(m5.some(x=>x.provider!==m5[0].provider))
    throw Error("MIXED_CRYPTO_PROVIDERS");
  const output=aggregateClosedM5(m5,{timeframe,family:"crypto"});
  return Object.freeze({
    environment:"OFFLINE_REPLAY",
    family:"crypto",
    schedule:"FOREX_NY_OWNER_APPROVED",
    timeZone:"America/New_York",
    marketEquivalence:"UNVERIFIED",
    certification:"PINE_PARITY_PENDING",
    actionable:false,sendPush:false,
    complete:Object.freeze(output.complete.map(bar=>Object.freeze({
      ...bar,family:"crypto",aggregationAnchor:"NY_FOREX_H4",
      c1Schedule:"FOREX_NY_OWNER_APPROVED",
      actionable:false,sendPush:false
    }))),
    rejected:Object.freeze(output.rejected.map(entry=>Object.freeze({
      ...entry,reason:entry.reason==="INCOMPLETE_OR_DST_AMBIGUOUS"?
        "INCOMPLETE_OR_DST_AMBIGUOUS":entry.reason
    })))
  });
}
