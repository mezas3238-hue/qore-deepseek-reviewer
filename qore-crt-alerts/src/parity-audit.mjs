import {createHash} from "node:crypto";
import {deduplicateM5} from "./contracts.mjs";
import {replayCycle} from "./replay-cycle.mjs";

const PINESHA="9a572500608fefbc24ae89b99d2e876529d0bfa5";
export const PINE_QA_BLOB_SHA=PINESHA;
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
     capture.pineBlobSha!==PINESHA||capture.verifiedOnTradingView!==true)
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
