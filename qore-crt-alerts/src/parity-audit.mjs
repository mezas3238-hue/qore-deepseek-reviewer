import {createHash} from "node:crypto";
import {deduplicateM5} from "./contracts.mjs";
import {replayCycle} from "./replay-cycle.mjs";

const PINESHA="9a572500608fefbc24ae89b99d2e876529d0bfa5";
export const PINE_QA_BLOB_SHA=PINESHA;
// Candidate V34.10c is BTCUSD-only memory QA. It has NOT been
// compiled or certified by TradingView; this SHA only pins exact source.
export const PINE_QA_BLOB_SHA_BTC_MEMORY="3406fa3301ac7b4a65e7db5d02c14773b8c63739";
// Separate owner-approved NY BTC H4 clock QA with strict 48-M5 DST gate.
// Exact source SHA only; NOT proof of compilation or event parity.
export const PINE_QA_BLOB_SHA_BTC_NY="31e91681dcbc19592cd346b3127b398bc4fedaff";
// BTC NY 00:00-00:00 seven-day PDH/PDL QA; only a pinned text identity,
// NEVER a TradingView compilation, source-OHLC match or push certificate.
export const PINE_QA_BLOB_SHA_BTC_PDH="3c51656418313fb51172e03657eed3bf37b0e4e1";
// QA chart-side previous confirmed D OHLC vs independent NY calendar-day
// audit. Exact source identity only, NOT Pine runtime/market certification.
export const PINE_QA_BLOB_SHA_BTC_CHART_D="e164e05b81059d6aa234d239f3cb29b1c74974e6";
// V34.10g: for BTC chart the operational previous-day high/low comes from
// the confirmed provider D candle; NY midnight liquidity remains QA-only.
// SHA pins source, not an approved external compilation or signal sender.
export const PINE_QA_BLOB_SHA_BTC_D_OFFICIAL="48de848a550ac2b9d222a554a640164774b932e9";
// BTC 01/05/21 NY H4 anchor rebuilt from individual M5 NY hour,
// not time(240) on the DST fallback weekend. Source identity only.
export const PINE_QA_BLOB_SHA_BTC_CRT_CLOCK="d254ff36c735ce071b46dc744e241ed25fb2b1ae";
// BTC: single chart-provider feed and closed M15 MSS independent of M5.
// Git source identity only; REAL TradingView runtime parity still required.
export const PINE_QA_BLOB_SHA_BTC_MSS15="e817b887a7ac9445cbee1576d07991b6972a9e96";
// V34.10j: seven-family CRT catalog; still H4+closed M15 as sole entry gate.
// Source fingerprint only; not real TradingView parity or live alert approval.
export const PINE_QA_BLOB_SHA_BTC_MODEL_CATALOG="feebb0850e2c34a6a3b6b16c1cebd45591e56665";
// V34.10k adds H4 4-candle & post-MSS M15 retest diagnostics only.
// Exact source fingerprint, NOT Pine compilation or alerts certification.
export const PINE_QA_BLOB_SHA_BTC_MULTI4_RETEST="92af8c5a85141ada91dfa139548b62b0d9fa9dd9";
export const PARITY_SCHEMA="QORE_CRT_PARITY_V1";
const FIELDS=Object.freeze(["phase","direction","c1StartMs","c2StartMs",
  "ratifiedAtMs","sweepEndMs","m5PivotPrice","m5PivotAtMs",
  "m5BreakAtMs","m15PivotPrice","m15PivotAtMs","m15BreakAtMs"]);
export const AUDIT_FIELDS=FIELDS;
const parsed=x=>typeof x==="number"&&Number.isFinite(x);
const nullableTime=x=>x===null||(Number.isSafeInteger(x)&&x>=0);
const nullablePrice=x=>x===null||parsed(x);
const stable=(rows)=>JSON.stringify(rows.map(x=>[
  x.provider,x.instrumentId,x.openedAt,x.closedAt,x.open,x.high,x.low,x.close]));
export function hashM5(rows){
  const data=deduplicateM5(rows);
  if(!data.length)throw Error("M5 evidence cannot be empty");
  if(data.some(x=>x.provider!==data[0].provider||
                    x.instrumentId!==data[0].instrumentId))
    throw Error("M5 evidence may not mix provider/instrument");
  return createHash("sha256").update(stable(data)).digest("hex");
}
export function buildBackendAudit({candlesM5,c1Start,family,sourceId}){
  if(typeof sourceId!=="string"||sourceId.length<3)
    throw Error("sourceId required, one immutable OHLC source per comparison");
  const data=deduplicateM5(candlesM5),hash=hashM5(data);
  const run=replayCycle({candlesM5:data,c1Start,family});
  if(run.state!=="REPLAY_EVALUATED")return Object.freeze({
    schema:PARITY_SCHEMA,status:"BACKEND_INCOMPLETE",sourceId,
    candleSha256:hash,reason:run.state,actionable:false});
  const {crt,mssM5,mssM15}=run;
  // Pine's chart phase can change at the full H4 close of C3; this
  // offline snapshot contract currently compares only C2 ratification
  // and C3-in-progress. Never silently label post-C3 as a matched phase.
  if(data.at(-1).closedAt>=c1Start+3*14400000)
    return Object.freeze({schema:PARITY_SCHEMA,status:"BACKEND_INCOMPLETE",
      sourceId,candleSha256:hash,reason:"POST_C3_CLOSE_PHASE_NOT_MODELED",
      actionable:false});
  if(!Number.isSafeInteger(crt.c1Start)||![1,-1].includes(crt.direction))
    return Object.freeze({schema:PARITY_SCHEMA,status:"BACKEND_INCOMPLETE",
      sourceId,candleSha256:hash,reason:crt.state,actionable:false});
  const phase=crt.state==="C2_RATIFIED_AWAITING_C3"||
    crt.state==="C3_NOT_INVALIDATED"?2:0;
  const fields={
    phase,direction:crt.direction,c1StartMs:crt.c1Start,c2StartMs:crt.c2Start,
    ratifiedAtMs:crt.c2Start+14400000,sweepEndMs:mssM15.sweepAt??mssM5.sweepAt??null,
    m5PivotPrice:mssM5.pivotPrice??null,m5PivotAtMs:mssM5.pivotAt??null,
    m5BreakAtMs:mssM5.mssAt??null,
    m15PivotPrice:mssM15.pivotPrice??null,
    m15PivotAtMs:mssM15.pivotAt??null,
    m15BreakAtMs:mssM15.mssAt??null
  };
  return Object.freeze({schema:PARITY_SCHEMA,engine:"BACKEND_REPLAY",
    status:"READY_FOR_PINE_REFERENCE",sourceId,candleSha256:hash,
    instrumentId:data[0].instrumentId,provider:data[0].provider,family,
    c1Start,windowM5Count:data.length,
    windowStartMs:data[0].openedAt,windowEndMs:data.at(-1).closedAt,
    fields:Object.freeze(fields),actionable:false,
    sendPush:false});
}
const minToMs=(v,name)=>{
  if(v===null)return null;
  if(!parsed(v))throw Error("invalid Pine minute value for "+name);
  const ms=Math.round(v*60000);
  if(Math.abs(ms/60000-v)>0.000001||ms<0||!Number.isSafeInteger(ms))
    throw Error("Pine minute precision/time range invalid for "+name);
  return ms;
};
// Map EXACT Pine plot labels (Data Window) to backend time+price fields.
// A dash/NA missing plot is NULL, not numeric zero.
const PINE_LABELS=Object.freeze({
  phase:"AUDIT estado CRT grafico (1=provisional 2=activo 3=ultimo)",
  direction:"AUDIT direccion CRT grafico (+1/-1)",
  c1StartMs:"QA CRT C1 inicio UTC min",
  c2StartMs:"QA CRT C2 inicio UTC min",
  ratifiedAtMs:"QA CRT C2 ratificacion UTC min",
  sweepEndMs:"QA CRT barrida C2 fin UTC min",
  m5PivotPrice:"QA CRT MSS M5 pivote precio",
  m5PivotAtMs:"QA CRT MSS M5 pivote UTC min",
  m5BreakAtMs:"QA CRT MSS M5 ruptura UTC min",
  m15PivotPrice:"QA CRT MSS M15 pivote precio",
  m15PivotAtMs:"QA CRT MSS M15 pivote UTC min",
  m15BreakAtMs:"QA CRT MSS M15 ruptura UTC min"
});
export const PINE_DATA_WINDOW_LABELS=PINE_LABELS;
export function normalizePineCapture(capture){
  if(!capture||capture.schema!==PARITY_SCHEMA||
     capture.engine!=="TRADINGVIEW_PINE_EDITOR_CAPTURE"||
     ![PINESHA,PINE_QA_BLOB_SHA_BTC_MEMORY,PINE_QA_BLOB_SHA_BTC_NY,PINE_QA_BLOB_SHA_BTC_PDH,PINE_QA_BLOB_SHA_BTC_CHART_D,PINE_QA_BLOB_SHA_BTC_D_OFFICIAL,PINE_QA_BLOB_SHA_BTC_CRT_CLOCK,PINE_QA_BLOB_SHA_BTC_MSS15,PINE_QA_BLOB_SHA_BTC_MODEL_CATALOG,PINE_QA_BLOB_SHA_BTC_MULTI4_RETEST].includes(capture.pineBlobSha)||
     ([PINE_QA_BLOB_SHA_BTC_MEMORY,PINE_QA_BLOB_SHA_BTC_NY,PINE_QA_BLOB_SHA_BTC_PDH,PINE_QA_BLOB_SHA_BTC_CHART_D,PINE_QA_BLOB_SHA_BTC_D_OFFICIAL,PINE_QA_BLOB_SHA_BTC_CRT_CLOCK,PINE_QA_BLOB_SHA_BTC_MSS15,PINE_QA_BLOB_SHA_BTC_MODEL_CATALOG,PINE_QA_BLOB_SHA_BTC_MULTI4_RETEST].includes(capture.pineBlobSha)&&
       capture.instrumentId!=="BTCUSD")||
     capture.verifiedOnTradingView!==true)
    throw Error("authentic Pine Editor capture provenance and candidate SHA required");
  if(!capture.sourceId||!capture.candleSha256||
     !capture.instrumentId||!capture.provider||
     !Number.isSafeInteger(capture.c1Start))
    throw Error("Pine capture missing source provenance/identity");
  if(!capture.dataWindow||typeof capture.dataWindow!=="object"||
    Array.isArray(capture.dataWindow))
    throw Error("Pine dataWindow object required");
  const fields={};
  for(const name of FIELDS){
    const label=PINE_LABELS[name];
    if(!Object.hasOwn(capture.dataWindow,label))
      throw Error("missing Pine data-window field: "+label);
    const value=capture.dataWindow[label];
    if(value!==null&&!parsed(value))
      throw Error("non-numeric Pine field: "+label+" (use null for na)");
    fields[name]=name.endsWith("Ms")?minToMs(value,name):value;
  }
  if(![0,1,2,3].includes(fields.phase)||![1,-1].includes(fields.direction))
    throw Error("Pine phase/direction unsupported");
  return {schema:PARITY_SCHEMA,engine:capture.engine,
    sourceId:capture.sourceId,candleSha256:capture.candleSha256,
    instrumentId:capture.instrumentId,provider:capture.provider,
    c1Start:capture.c1Start,fields,actionable:false,
    evidenceLocator:capture.evidenceLocator??null};
}
export function comparePineToBackend({backend,pine,priceTolerance=0}){
  if(!backend||backend.status!=="READY_FOR_PINE_REFERENCE"||
     backend.schema!==PARITY_SCHEMA)
    return {status:"BACKEND_NOT_READY",differences:[],certified:false};
  if(pine===null||pine===undefined)
    return {status:"PINE_EVIDENCE_MISSING",differences:[],certified:false};
  if(!parsed(priceTolerance)||priceTolerance<0||priceTolerance>0.01)
    throw Error("priceTolerance must be 0..0.01, explicitly selected");
  const p=normalizePineCapture(pine);
  for(const field of ["sourceId","candleSha256","instrumentId","provider","c1Start"]){
    if(p[field]!==backend[field])
      return {status:"SOURCE_OR_IDENTITY_MISMATCH",field,
        differences:[],certified:false};
  }
  const diffs=[];
  for(const field of FIELDS){
    const a=backend.fields[field],b=p.fields[field];
    if((field.includes("Price")&&a!==null&&b!==null)?
      Math.abs(a-b)>priceTolerance : a!==b)
      diffs.push({field,backend:a,pine:b});
  }
  return {status:diffs.length?"PARITY_MISMATCH":"MATCH_UNCERTIFIED",
    differences:diffs,comparedFields:FIELDS.length,
    certified:false,actionable:false,
    note:"Same-source Data Window comparison is not Pine compilation/live/repaint certification."};
}
