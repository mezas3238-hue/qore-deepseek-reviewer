import test from "node:test";
import assert from "node:assert/strict";
import {hashM5,buildBackendAudit,normalizePineCapture,
  comparePineToBackend,PINE_QA_BLOB_SHA,PINE_DATA_WINDOW_LABELS,
  PARITY_SCHEMA,AUDIT_FIELDS} from "../src/parity-audit.mjs";
const MS=300000,START=Date.parse("2026-10-30T05:00:00Z");
function dataset(){
  const candlesM5=Array.from({length:96},(_,i)=>{
    const openedAt=START+i*MS;
    let high=102,low=97,close=100;
    if(i===0){high=110;low=90;}
    if(i===21){high=106;low=94;}
    if(i===48){low=89;}
    if(i===49){high=109;close=108;}
    if(i===50){high=109;close=108;}
    return {provider:"TEST_FIXTURE",instrumentId:"EURUSD",openedAt,
      closedAt:openedAt+MS,open:100,high,low,close};
  });
  return {candlesM5,c1Start:START,family:"forex",sourceId:"fixed-ohlc-fixture-v1"};
}
function pair(){
  const d=dataset(),backend=buildBackendAudit(d);
  const dataWindow={};
  for(const name of AUDIT_FIELDS)
    dataWindow[PINE_DATA_WINDOW_LABELS[name]]=
      name.endsWith("Ms")&&backend.fields[name]!==null?
        backend.fields[name]/60000:backend.fields[name];
  const pine={schema:PARITY_SCHEMA,engine:"TRADINGVIEW_PINE_EDITOR_CAPTURE",
    pineBlobSha:PINE_QA_BLOB_SHA,verifiedOnTradingView:true,
    sourceId:d.sourceId,candleSha256:backend.candleSha256,
    instrumentId:"EURUSD",provider:"TEST_FIXTURE",
    c1Start:START,dataWindow,evidenceLocator:"UNIT_TEST_FAKE_DO_NOT_CERTIFY"};
  return {backend,pine,d};
}
test("full cycle backend evidence is deterministically fingerprinted",()=>{
  const {backend,d}=pair();
  assert.equal(backend.status,"READY_FOR_PINE_REFERENCE");
  assert.equal(backend.fields.c1StartMs,START);
  assert.equal(backend.windowM5Count,96);
  assert.equal(backend.candleSha256,hashM5(d.candlesM5));
  assert.equal(backend.actionable,false);
});
test("no Pine data window means comparison blocked, never presumed parity",()=>{
  assert.equal(comparePineToBackend({backend:pair().backend,pine:null}).status,
    "PINE_EVIDENCE_MISSING");
});
test("synthetic Pine-shaped unit test can match but NEVER certify anything",()=>{
  const {backend,pine}=pair(),r=comparePineToBackend({backend,pine});
  assert.equal(r.status,"MATCH_UNCERTIFIED");
  assert.equal(r.comparedFields,12);
  assert.equal(r.certified,false);
  assert.equal(r.actionable,false);
});
test("same-time reproducible replays hash identically regardless of delivery order",()=>{
  const d=dataset(),base=hashM5(d.candlesM5);
  assert.equal(hashM5([...d.candlesM5].reverse()),base);
  assert.equal(hashM5([...d.candlesM5,d.candlesM5[20]]),base);
});
test("changed real candle content invalidates shared OHLC evidence",()=>{
  const {backend,pine,d}=pair();
  d.candlesM5[10]={...d.candlesM5[10],high:103};
  const newer=buildBackendAudit(d);
  assert.notEqual(newer.candleSha256,backend.candleSha256);
  assert.equal(comparePineToBackend({backend:newer,pine}).status,
    "SOURCE_OR_IDENTITY_MISMATCH");
});
test("MSS M15 timestamp difference is a hard parity failure",()=>{
  const {backend,pine}=pair();
  pine.dataWindow[PINE_DATA_WINDOW_LABELS.m15BreakAtMs]+=15;
  const r=comparePineToBackend({backend,pine});
  assert.equal(r.status,"PARITY_MISMATCH");
  assert.deepEqual(r.differences.map(x=>x.field),["m15BreakAtMs"]);
});
test("MSS M5 pivot price disagreement fails independent of same CRT",()=>{
  const {backend,pine}=pair();
  pine.dataWindow[PINE_DATA_WINDOW_LABELS.m5PivotPrice]+=0.0001;
  assert.deepEqual(comparePineToBackend({backend,pine}).differences.map(x=>x.field),
    ["m5PivotPrice"]);
});
test("optional explicit price tolerance is bounded; time remains exact",()=>{
  const {backend,pine}=pair();
  pine.dataWindow[PINE_DATA_WINDOW_LABELS.m5PivotPrice]+=0.0001;
  assert.equal(comparePineToBackend({backend,pine,priceTolerance:0.0002}).status,
    "MATCH_UNCERTIFIED");
  assert.throws(()=>comparePineToBackend({backend,pine,priceTolerance:1}),
    /priceTolerance/);
});
test("source identity rejects wrong ticker even with identical prices",()=>{
  const {backend,pine}=pair();pine.instrumentId="GBPUSD";
  assert.equal(comparePineToBackend({backend,pine}).status,
    "SOURCE_OR_IDENTITY_MISMATCH");
});
test("provider, Pine SHA and verifiedOnTradingView are mandatory",()=>{
  const {backend,pine}=pair();
  assert.throws(()=>normalizePineCapture({...pine,pineBlobSha:"BAD"}),/provenance/);
  assert.throws(()=>normalizePineCapture({...pine,verifiedOnTradingView:false}),/provenance/);
  assert.equal(comparePineToBackend({backend,pine:{...pine,provider:"OTHER"}}).status,
    "SOURCE_OR_IDENTITY_MISMATCH");
});
test("Pine missing field is rejected rather than treated as agreement",()=>{
  const {backend,pine}=pair();
  delete pine.dataWindow[PINE_DATA_WINDOW_LABELS.m15PivotAtMs];
  assert.throws(()=>comparePineToBackend({backend,pine}),/missing Pine data-window/);
});
test("numeric zero and null are not equivalent",()=>{
  const {backend,pine}=pair();
  pine.dataWindow[PINE_DATA_WINDOW_LABELS.m5BreakAtMs]=null;
  assert.equal(comparePineToBackend({backend,pine}).status,"PARITY_MISMATCH");
});
test("all source candle entries must be same provider and instrument",()=>{
  const d=dataset();d.candlesM5[10].provider="OTHER";
  assert.throws(()=>buildBackendAudit(d),/mix provider/);
});
test("incomplete C2 cannot give a backend parity-ready observation",()=>{
  const d=dataset();d.candlesM5=d.candlesM5.filter((_,i)=>i!==70);
  assert.equal(buildBackendAudit(d).status,"BACKEND_INCOMPLETE");
});
test("Pine Data Window values are UTC minutes, not milliseconds",()=>{
  const {backend,pine}=pair();
  pine.dataWindow[PINE_DATA_WINDOW_LABELS.c1StartMs]=START;
  assert.throws(()=>normalizePineCapture(pine),/time range/);
});
test("exact 12 required data-window fields in canonical order",()=>{
  assert.equal(AUDIT_FIELDS.length,12);
  assert.equal(new Set(Object.values(PINE_DATA_WINDOW_LABELS)).size,12);
});
