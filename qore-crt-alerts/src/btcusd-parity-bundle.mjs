import {hashM5,buildBackendAudit,PINE_QA_BLOB_SHA_BTC_CRT_CLOCK,
  PARITY_SCHEMA,PINE_DATA_WINDOW_LABELS} from "./parity-audit.mjs";
import {aggregateClosedCryptoM5} from "./crypto-aggregate.mjs";
import {BTC_PROBE} from "./btcusd-coinbase-m5.mjs";
import {deduplicateM5} from "./contracts.mjs";

const H4=14400000;
const blocked=Object.freeze({actionable:false,sendPush:false,
  certified:false,fcMEnabled:false});
const captureTemplate=({sourceId,candleSha256,c1Start})=>
  Object.freeze({
    schema:PARITY_SCHEMA,engine:"TRADINGVIEW_PINE_EDITOR_CAPTURE",
    pineBlobSha:PINE_QA_BLOB_SHA_BTC_CRT_CLOCK,verifiedOnTradingView:false,
    sourceId,candleSha256,instrumentId:"BTCUSD",provider:BTC_PROBE.provider,
    c1Start,evidenceLocator:null,
    dataWindow:Object.fromEntries(
      Object.values(PINE_DATA_WINDOW_LABELS).map(label=>[label,null]))
  });

// An auditable public spot-data packet for a human Pine Editor comparison.
// It is NOT an attestation that TradingView compiled the Pine, or that the
// COINBASE:BTCUSD chart necessarily has identical candles to the REST API.
export function buildBtcParityBundle(probe){
  if(!probe||probe.state!=="BTC_M5_PROBE_ONLY"||
     probe.provider!==BTC_PROBE.provider||
     probe.instrumentId!=="BTCUSD"||
     probe.feedSymbol!=="BTC-USD"||probe.sendPush!==false||
     probe.actionable!==false||!Array.isArray(probe.bars))
    throw Error("INVALID_BTC_PARITY_PROVENANCE");
  const candlesM5=deduplicateM5(probe.bars);
  if(candlesM5.length===0||
     candlesM5.some(bar=>bar.provider!==BTC_PROBE.provider||
       bar.instrumentId!=="BTCUSD"))
    throw Error("INVALID_BTC_PARITY_CANDLES");
  const candleSha256=hashM5(candlesM5);
  const sourceId="coinbase-spot-btcusd-"+candleSha256.slice(0,20);
  const h4=aggregateClosedCryptoM5(candlesM5,{timeframe:"H4"});
  // Find a complete closed C1 and C2 with a partial active C3.
  // The Pine Data Window QA contract requires taking the snapshot
  // after C2 has closed and before the C3 H4 closes.
  const lastClose=candlesM5.at(-1).closedAt;
  const cycle=[...h4.complete].reverse().find(c1=>
    c1.allowedC1===true&&
    h4.complete.some(c2=>c2.openedAt===c1.closedAt)&&
    lastClose>c1.closedAt+H4&&lastClose<c1.closedAt+2*H4);
  const c1Start=cycle?.openedAt??null;
  const dataset=Object.freeze({
    sourceId,family:"crypto",instrumentId:"BTCUSD",
    provider:BTC_PROBE.provider,feedSymbol:"BTC-USD",
    chartToVerify:"COINBASE:BTCUSD",
    c1Start,windowStartMs:candlesM5[0].openedAt,
    windowEndMs:lastClose,candleSha256,
    completeWindow:probe.completeWindow===true,
    candlesM5:Object.freeze(candlesM5)
  });
  const backend=c1Start!==null&&probe.completeWindow===true?
    buildBackendAudit({candlesM5,c1Start,family:"crypto",sourceId}):
    Object.freeze({schema:PARITY_SCHEMA,status:"BACKEND_INCOMPLETE",
      reason:probe.completeWindow===true?
        "NO_COMPLETE_C1_C2_WITH_PARTIAL_C3":"INCOMPLETE_M5_WINDOW",
      candleSha256,sourceId,actionable:false,sendPush:false});
  return Object.freeze({
    schema:"QORE_CRT_BTC_PARITY_PACKET_V1",
    instrumentId:"BTCUSD",market:"COINBASE_BTC_USD_SPOT",
    timeZone:"America/New_York",
    c1HoursNY:Object.freeze([1,5,21]),
    sourceEquivalence:"PENDING_TRADINGVIEW_OHLC_CHECK",
    verifiedOnTradingView:false,
    pineCompilation:"NOT_VERIFIED",
    status:"PINE_EVIDENCE_MISSING",
    ...blocked,
    dataset,
    backend,
    pineCaptureTemplate:captureTemplate({
      sourceId,candleSha256,c1Start})
  });
}
