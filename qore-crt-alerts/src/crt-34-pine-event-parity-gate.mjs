// Offline-only 34-symbol, same-OHLC event parity gate.
// No trading, market acquisition, Android delivery or live certification.
import {hashM5} from "./parity-audit.mjs";
import {buildNyH4FromClosedM5} from "./trader-lab-raw-m5-causal-bridge.mjs";
import {inspectCrtMorphologies,STRUCTURAL_MORPHOLOGIES}
  from "./crt-structural-morphologies.mjs";

const PINE_SHA=/^[a-f0-9]{40}$/;
const SHA256=/^[a-f0-9]{64}$/;
const FAMILIES=new Set(["forex","index","crypto"]);
const MODELS=new Set(STRUCTURAL_MORPHOLOGIES);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const identity=e=>[e.model,e.direction,e.c1Start,e.ratifiedAt].join("|");
const gate=(status,more={})=>Object.freeze({
  status,certified:false,actionable:false,sendPush:false,...more
});
function eventSet(rows,provider,instrumentId){
  if(!Array.isArray(rows))throw Error("INVALID_EVENT_ARRAY");
  const ids=new Set();
  for(const e of rows){
    if(!e||e.provider!==provider||e.instrumentId!==instrumentId||
       !MODELS.has(e.model)||![1,-1].includes(e.direction)||
       !integer(e.c1Start)||!integer(e.ratifiedAt)||
       e.c1Start>=e.ratifiedAt)
      throw Error("INVALID_EVENT_IDENTITY");
    const id=identity(e);
    if(ids.has(id))throw Error("DUPLICATE_EVENT");
    ids.add(id);
  }
  return ids;
}
// The capture is a *claim* of Pine runtime provenance, not a certificate.
// It must be corroborated externally with original M5 and editor evidence.
function compareCapture({capture,source,sha,pineBlobSha,window,asOf,expected}){
  if(!capture)return gate("PINE_CAPTURE_MISSING",{expectedH4Events:expected.size});
  if(capture.sendPush!==false||capture.actionable!==false||
     capture.verifiedOnTradingView!==true||
     capture.engine!=="TRADINGVIEW_PINE_V6_CAPTURE"||
     typeof capture.evidenceLocator!=="string"||!capture.evidenceLocator.trim()||
     capture.pineBlobSha!==pineBlobSha)
    return gate("PINE_PROVENANCE_BLOCKED");
  if(capture.provider!==source.provider||capture.instrumentId!==source.instrumentId||
     capture.candleSha256!==sha||capture.windowM5Count!==window.length||
     capture.windowStartMs!==window[0].openedAt||
     capture.windowEndMs!==window.at(-1).closedAt||
     capture.asOf!==asOf)
    return gate("SOURCE_WINDOW_OR_ASOF_MISMATCH");
  let observed;
  try{observed=eventSet(capture.events,source.provider,source.instrumentId);}
  catch(err){return gate("INVALID_PINE_EVENT_EVIDENCE",{reason:err.message});}
  const missingInPine=[...expected].filter(x=>!observed.has(x));
  const unexpectedInPine=[...observed].filter(x=>!expected.has(x));
  if(missingInPine.length||unexpectedInPine.length)
    return gate("H4_EVENT_MISMATCH",{missingInPine,unexpectedInPine});
  return gate("H4_EVENTS_MATCH_MSS15_PENDING",{
    comparedH4Events:expected.size,
    note:"Structural H4 only; MSS M15, FVG, PDH/PDL, real Pine execution and push not certified."
  });
}
// Interpret only the last 1500 CLOSED M5 (or the available smaller prefix).
// This is a comparability protocol, NOT a reimplementation of Pine f_engine().
export function compare34PineTraderLabEvents({
  catalog,feeds,captures=[],asOf,pineBlobSha
}={}){
  if(!Array.isArray(catalog)||catalog.length!==34||
     !Array.isArray(feeds)||feeds.length!==34||
     !Array.isArray(captures)||!integer(asOf)||!PINE_SHA.test(pineBlobSha||""))
    throw Error("PARITY_SCOPE_OR_PINE_SHA_INVALID");
  const slots=new Set(),symbols=new Set();
  for(const c of catalog){
    if(!integer(c?.slot)||typeof c.source_symbol!=="string"||!c.source_symbol||
       slots.has(c.slot)||symbols.has(c.source_symbol))
      throw Error("DUPLICATE_OR_INVALID_CATALOG_IDENTITY");
    slots.add(c.slot);symbols.add(c.source_symbol);
  }
  const sources=new Map();
  for(const f of feeds){
    if(!slots.has(f?.slot)||sources.has(f.slot))
      throw Error("DUPLICATE_OR_UNKNOWN_FEED_SLOT");
    sources.set(f.slot,f);
  }
  const pineBySlot=new Map();
  for(const c of captures){
    if(!slots.has(c?.slot)||pineBySlot.has(c.slot))
      throw Error("DUPLICATE_OR_UNKNOWN_PINE_SLOT");
    pineBySlot.set(c.slot,c);
  }
  const results=[];
  for(const slot of catalog){
    const f=sources.get(slot.slot);
    if(!f||f.instrumentId!==slot.source_symbol||
       typeof f.provider!=="string"||!f.provider||
       !FAMILIES.has(f.family)||!Array.isArray(f.closedM5)||
       !f.closedM5.length)
      throw Error("SOURCE_NOT_BOUND:"+slot.source_symbol);
    const window=f.closedM5.slice(-1500);
    // Throws on open/future bars, invalid OHLC, unsorted timestamps or mixed providers.
    const built=buildNyH4FromClosedM5({
      closedM5:window,family:f.family,provider:f.provider,
      instrumentId:f.instrumentId,asOf
    });
    const sha=hashM5(window);
    if(!SHA256.test(sha))throw Error("INVALID_M5_DIGEST");
    const h4=inspectCrtMorphologies({closedH4:built.closedH4,family:f.family});
    const expected=eventSet(h4.signals,f.provider,f.instrumentId);
    const comparison=compareCapture({
      capture:pineBySlot.get(slot.slot),source:f,sha,pineBlobSha,window,asOf,expected
    });
    results.push(Object.freeze({
      slot:slot.slot,symbol:f.instrumentId,provider:f.provider,
      observedWindowM5:window.length,
      excludedH4:built.excludedH4.length,
      labH4Events:expected.size,
      ...comparison
    }));
  }
  const matched=results.filter(x=>x.status==="H4_EVENTS_MATCH_MSS15_PENDING").length;
  return gate(matched===34?"H4_34_MATCH_BUT_UNCERTIFIED":"PARITY_BLOCKED_OR_MISMATCH",{
    scope:34,matchedH4Slots:matched,blockedOrDifferent:34-matched,
    expectedPineBlobSha:pineBlobSha,
    results:Object.freeze(results),
    mssM15Certified:false,pineRuntimeCertified:false,
    sourceEquivalenceCertified:false,androidE2eCertified:false
  });
}
