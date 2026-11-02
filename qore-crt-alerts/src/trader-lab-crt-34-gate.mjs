import {inspectCrtMorphologies} from "./crt-structural-morphologies.mjs";

const SHA256=/^[a-f0-9]{64}$/;
const ALLOWED_FAMILIES=new Set(["forex","crypto","index"]);
const strictPrices=x=>typeof x==="number"&&Number.isFinite(x);
const H4MS=14_400_000;

export function auditTraderLab34Preflight(manifest){
  if(!manifest||manifest.schema!=="qore.crt.trader_lab_34.source_preflight.v1"||
    !Array.isArray(manifest.source_catalog))throw Error("unknown preflight manifest");
  const items=manifest.source_catalog;
  const reasons=[];
  if(items.length!==34)reasons.push("REQUIRED_34_SLOTS");
  if(new Set(items.map(x=>x.slot)).size!==34||
    items.some((x,i)=>x.slot!==i+1))reasons.push("SLOT_IDENTITY_MISMATCH");
  if(new Set(items.map(x=>x.source_symbol)).size!==items.length)
    reasons.push("DUPLICATED_SOURCE_SYMBOL");
  const present=items.filter(x=>x.status==="ARTIFACT_METADATA_VERIFIED"&&!x.artifact?.expired);
  const missing=items.filter(x=>x.status!=="ARTIFACT_METADATA_VERIFIED");
  for(const x of present){
    if(!Number.isSafeInteger(x.artifact?.artifact_id)||!Number.isSafeInteger(x.artifact?.run_id)||
       !x.artifact?.expires_at||!x.artifact?.source_symbol||
       x.artifact.source_symbol!==x.source_symbol)
       reasons.push("UNTRUSTED_ARTIFACT_METADATA:"+x.source_symbol);
  }
  if(missing.length)reasons.push("MISSING_SOURCE:"+missing.map(x=>x.source_symbol).join(","));
  if(items.some(x=>x.tv_provider!==x.source_provider &&
     x.status==="ARTIFACT_METADATA_VERIFIED"))
    reasons.push("PROVIDER_PARITY_NOT_ESTABLISHED");
  if(!manifest.data_license_verified)reasons.push("LICENSE_NOT_VERIFIED");
  if(!manifest.holdout_period_frozen)reasons.push("HOLDOUT_NOT_PREREGISTERED");
  if(!manifest.immutable_methodology_binding||
     !SHA256.test(manifest.immutable_methodology_binding))
    reasons.push("CANDIDATE_COMMIT_DIGEST_UNFROZEN");
  if(!manifest.preregistration_signature ||
     !SHA256.test(manifest.preregistration_signature))
    reasons.push("PREREGISTRATION_SIGNATURE_MISSING");
  if(items.some(x=>!x.holdout_sealed || x.role!=="UNSEEN_FROZEN_HOLDOUT"))
    reasons.push("HOLDOUT_IS_NOT_INDEPENDENT");
  if(items.some(x=>x.status==="ARTIFACT_METADATA_VERIFIED" &&
     (!SHA256.test(x.data_sha256||"")||!x.content_start_utc||!x.content_end_utc)))
    reasons.push("PRICE_CONTENT_DIGEST_OR_WINDOW_UNVERIFIED");
  return Object.freeze({
    kind:"QORE_TRADER_LAB_CRT34_PREFLIGHT",
    examined:items.length,
    metadata_present:present.length,
    missing_sources:Object.freeze(missing.map(x=>x.source_symbol)),
    reasons:Object.freeze([...new Set(reasons)]),
    verdict:reasons.length?"BLOCKED_HOLDOUT":"READY_TO_REQUEST_PRIVATE_REPLAY",
    real_prices_processed:false,
    crt_models_replayed:false,
    live_authority:false
  });
}
function assertBar(b,provider,symbol){
 if(!b||b.timeframe!=="H4"||b.provider!==provider||
   b.instrumentId!==symbol||!Number.isSafeInteger(b.openedAt)||
   !Number.isSafeInteger(b.closedAt)||b.closedAt-b.openedAt!==H4MS||
   ![b.open,b.high,b.low,b.close].every(strictPrices)||
   b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close))
   throw Error("BAR_INVALID_OR_PROVIDER_MIXED");
}
export function replayCrt34StructuralQA({manifest,datasets,asOf}){
 // Pure deterministic adapter: datasets are supplied by an authorized data
 // reader, NEVER acquired here. Not a QORE Trader Lab promotion/holdout gate.
 if(!Array.isArray(datasets)||datasets.length!==34||
   !Number.isSafeInteger(asOf))throw Error("EXACTLY_34_DATASETS_REQUIRED");
 const expected=manifest?.source_catalog;
 if(!Array.isArray(expected)||expected.length!==34)
   throw Error("INVALID_FROZEN_CATALOG");
 const bySlot=new Map();
 for(const ds of datasets){
  if(!Number.isSafeInteger(ds?.slot)||bySlot.has(ds.slot))
    throw Error("DUPLICATE_OR_INVALID_SLOT");
  bySlot.set(ds.slot,ds);
 }
 const diagnostics=[];
 for(const item of expected){
  const ds=bySlot.get(item.slot);
  if(!ds||ds.source_symbol!==item.source_symbol ||
    !ALLOWED_FAMILIES.has(ds.family)||
    !Array.isArray(ds.closedH4)||!ds.closedH4.length)
     throw Error("MISSING_OR_UNBOUND_H4:"+item.source_symbol);
  for(let i=0;i<ds.closedH4.length;i++){
   const b=ds.closedH4[i];
   assertBar(b,ds.provider,ds.source_symbol);
   if(b.closedAt>asOf)throw Error("FUTURE_BAR_FORBIDDEN");
   if(i>0&&b.openedAt<ds.closedH4[i-1].closedAt)
    throw Error("OUT_OF_ORDER_OR_OVERLAP");
  }
  const result=inspectCrtMorphologies({closedH4:ds.closedH4,family:ds.family});
  diagnostics.push(Object.freeze({
   slot:item.slot,symbol:ds.source_symbol,provider:ds.provider,
   examined_closed_h4:ds.closedH4.length,
   candidate_models:result.signals.length,
   nonactionable_diagnostics:result.diagnostics.length,
   status:"STRUCTURAL_QA_ONLY",sendPush:false,live:false
  }));
 }
 return Object.freeze({
  result:"SYNTHETIC_OR_AUTHORIZED_H4_REPLAY_ONLY",
  slot_count:diagnostics.length,
  metrics:Object.freeze(diagnostics),
  holdout_qualified:false,
  no_lookahead_checked:true,
  alert_delivery_tested:false,
  pine_compiled:false
 });
}
