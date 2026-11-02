import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditTraderLab34Preflight,replayCrt34StructuralQA} from "../src/trader-lab-crt-34-gate.mjs";

const manifest=JSON.parse(readFileSync(new URL("../trader-lab/34-instrument-source-preflight-2026-11-01.json",import.meta.url),"utf8"));
const H4=14_400_000;
const start=Date.parse("2026-01-02T06:00:00Z");
const asOf=start+H4*2;
function dataset(item){
 const symbol=item.source_symbol,provider="FIXTURE_SOURCE_"+item.slot;
 const family=["NAS100","SP500","US30"].includes(symbol)?"index":symbol==="BTCUSD"?"crypto":"forex";
 const bar=(i,o,h,l,c)=>({provider,instrumentId:symbol,timeframe:"H4",
  openedAt:start+i*H4,closedAt:start+(i+1)*H4,open:o,high:h,low:l,close:c,
  ...(i===0?{nyHour:family==="index"?2:1,allowedC1:true}:{})});
 return {slot:item.slot,source_symbol:symbol,provider,family,
  closedH4:[bar(0,105,110,100,104),bar(1,104,108,98,105)]};
}
const make=()=>manifest.source_catalog.map(dataset);

test("Trader Lab source preflight has exact 34 named inputs with 33 unexpired M5 archive artifacts",()=>{
 const r=auditTraderLab34Preflight(manifest);
 assert.equal(r.examined,34);
 assert.equal(r.metadata_present,33);
 assert.deepEqual(r.missing_sources,["BTCUSD"]);
 assert.equal(r.verdict,"BLOCKED_HOLDOUT");
 for(const reason of ["MISSING_SOURCE:BTCUSD","LICENSE_NOT_VERIFIED",
 "HOLDOUT_NOT_PREREGISTERED","CANDIDATE_COMMIT_DIGEST_UNFROZEN",
 "HOLDOUT_IS_NOT_INDEPENDENT"])
  assert.ok(r.reasons.includes(reason),reason);
 assert.equal(r.real_prices_processed,false);
 assert.equal(r.crt_models_replayed,false);
 assert.equal(r.live_authority,false);
 assert.equal(manifest.real_price_replay_executed,false);
 assert.equal(manifest.pine_compiler_executed,false);
});
test("catalog matches 34 Pine input.symbol symbols including exact normalized index aliases",()=>{
 const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
 const values=[...pine.matchAll(/^s(\d\d) = input\.symbol\("([^"]+)", "([^"]+)"/gm)];
 assert.equal(values.length,34);
 for(let i=0;i<34;i++){
  assert.equal(manifest.source_catalog[i].slot,Number(values[i][1]));
  assert.equal(manifest.source_catalog[i].tv_symbol,values[i][2]);
  assert.equal(manifest.source_catalog[i].dashboard_name,values[i][3]);
 }
 assert.equal(manifest.source_catalog[4].source_symbol,"NAS100");
 assert.equal(manifest.source_catalog[5].source_symbol,"SP500");
 assert.equal(manifest.source_catalog[7].source_symbol,"BTCUSD");
 assert.equal(manifest.source_catalog[7].status,"MISSING_SOURCE");
});
test("34 independent source contexts replay synthetic 2C closed-H4 without signalling LIVE",()=>{
 const result=replayCrt34StructuralQA({manifest,datasets:make(),asOf});
 assert.equal(result.slot_count,34);
 assert.equal(result.metrics.length,34);
 assert.equal(new Set(result.metrics.map(m=>m.symbol)).size,34);
 for(const m of result.metrics){
  assert.equal(m.candidate_models,1,m.symbol);
  assert.equal(m.status,"STRUCTURAL_QA_ONLY");
  assert.equal(m.sendPush,false);
  assert.equal(m.live,false);
 }
 assert.equal(result.holdout_qualified,false);
 assert.equal(result.alert_delivery_tested,false);
 assert.equal(result.pine_compiled,false);
});
test("real-OHLC absence is blocking, even when metadata inventory is 33/34",()=>{
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:[],asOf}),/EXACTLY_34_DATASETS_REQUIRED/);
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:make().slice(0,33),asOf}),/EXACTLY_34_DATASETS_REQUIRED/);
});
test("missing source / duplicate slot / source confusion fail closed",()=>{
 const wrong=make();wrong[0].source_symbol="BTCUSD";
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:wrong,asOf}),/MISSING_OR_UNBOUND_H4/);
 const duplicate=make();duplicate[1].slot=1;
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:duplicate,asOf}),/DUPLICATE_OR_INVALID_SLOT/);
 const provider=make();provider[3].closedH4[0].provider="MIXED";
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:provider,asOf}),/PROVIDER_MIXED/);
});
test("no future H4 or overlapping time series accepted into holdout-style replay",()=>{
 const future=make();future[0].closedH4[1].closedAt=asOf+H4;
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:future,asOf}),/BAR_INVALID/);
 const overlap=make();
 overlap[0].closedH4[1].openedAt=start+H4-300000;
 overlap[0].closedH4[1].closedAt=start+2*H4-300000;
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:overlap,asOf}),/OUT_OF_ORDER_OR_OVERLAP/);
 const cutoff=asOf-H4;
 assert.throws(()=>replayCrt34StructuralQA({manifest,datasets:make(),asOf:cutoff}),/FUTURE_BAR_FORBIDDEN/);
});
test("source manifest refuses substituted evidence or retroactively invented holdout",()=>{
 const copy=structuredClone(manifest);
 copy.source_catalog[0].artifact.source_symbol="FAKE";
 const r=auditTraderLab34Preflight(copy);
 assert.ok(r.reasons.some(x=>x.startsWith("UNTRUSTED_ARTIFACT_METADATA:")));
 assert.equal(r.verdict,"BLOCKED_HOLDOUT");
 const missing=structuredClone(manifest);missing.source_catalog.pop();
 assert.ok(auditTraderLab34Preflight(missing).reasons.includes("REQUIRED_34_SLOTS"));
});
