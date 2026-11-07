// PRIVATE QA evidence exporter: authenticated cTrader DEMO EURUSD M5.
// The output is NOT a parity certificate and MUST NOT reach Firebase or gateway.
// Only exact 600+ native CLOSED M5, symbol 1, broker Raw Trading Ltd.
// Compatible with qore-core/tools/crt_feed_parity/compare_ic_m5.py.
import {createHash} from "node:crypto";
const M5=300000;
const HEADER="origin,tv_symbol,broker,server,open_time_utc,open,high,low,close,closed";
export const CTRADER_EURUSD_CSV_EXPORT_OPT_IN="OWNER_APPROVED_PRIVATE_QA_CSV_ONLY";
export const CTRADER_EURUSD_PARITY_HEADER=HEADER;
const FEED="Raw_Trading_Ltd_DEMO_OpenAPI_EURUSD_symbol1";
const positive=x=>typeof x==="number"&&Number.isFinite(x)&&x>0;
function scaled5(value){
 if(!positive(value))throw Error("CTRADER_CSV_INVALID_PRICE");
 const scaled=Math.round(value*100000);
 if(!Number.isSafeInteger(scaled)||Math.abs(scaled/100000-value)>1e-9)
  throw Error("CTRADER_CSV_NON_NATIVE_PRICE_PRECISION");
 return (scaled/100000).toFixed(5);
}
export function buildPrivateCtraderEurusdParityCsv(bars){
 if(!Array.isArray(bars)||bars.length<600||bars.length>900)
  throw Error("CTRADER_CSV_M5_COUNT_600_TO_900_REQUIRED");
 let previous=null;
 const rows=[HEADER];
 for(const x of bars){
  if(x?.provider!=="IC"||x?.instrumentId!=="EURUSD"||
     x?.brokerSymbol!=="EURUSD"||x?.symbolId!==1||
     x?.source!=="CTRADER_OPEN_API_DEMO"||
     x?.certified!==false||x?.sendPush!==false||
     x?.actionable!==false||
     !Number.isSafeInteger(x?.openedAt)||x.openedAt<=0||
     x.openedAt%M5!==0||x.closedAt!==x.openedAt+M5)
   throw Error("CTRADER_CSV_SOURCE_OR_CLOSURE_INVALID");
  if(previous!==null&&x.openedAt!==previous+M5)
   throw Error("CTRADER_CSV_DISCONTINUITY_OR_DUPLICATE");
  previous=x.openedAt;
  if(x.low>Math.min(x.open,x.close)||
     x.high<Math.max(x.open,x.close)||
     x.high<x.low)throw Error("CTRADER_CSV_INVALID_OHLC");
  const fields=[x.open,x.high,x.low,x.close].map(scaled5);
  rows.push(["CTRADER_IC_DEMO","IC:EURUSD","IC MARKETS",FEED,
    new Date(x.openedAt).toISOString(),...fields,"true"].join(","));
 }
 const csv=rows.join("\n")+"\n";
 const sha256=createHash("sha256").update(csv,"utf8").digest("hex");
 const chunkSize=25;
 const chunks=[];
 for(let i=0;i<rows.length;i+=chunkSize){
  chunks.push(Object.freeze({
    schema:"QORE_CTRADER_IC_EURUSD_600_CLOSED_M5_QA_CHUNK_V1",
    chunkIndex:chunks.length,
    rowStart:i,
    totalCsvLines:rows.length,
    csvLines:Object.freeze(rows.slice(i,i+chunkSize))
  }));
 }
 const count=bars.length;
 return Object.freeze({
  schema:"QORE_CTRADER_IC_EURUSD_CLOSED_M5_PARITY_CSV_QA_V1",
  state:"PRIVATE_QA_CSV_NOT_PARITY_CERTIFIED",
  count,firstOpenedAtMs:bars[0].openedAt,
  lastClosedAtMs:bars.at(-1).closedAt,
  sha256,chunkCount:chunks.length,
  chunks:Object.freeze(chunks),
  sourceParityCertified:false,crtFamiliesCertified:false,
  mssCertified:false,canTrade:false,sendPush:false
 });
}
