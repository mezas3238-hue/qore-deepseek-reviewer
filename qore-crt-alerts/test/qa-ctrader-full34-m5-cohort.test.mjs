import test from "node:test";
import assert from "node:assert/strict";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {
 COHORT34_OPT_IN,COHORT34_MANIFEST_SHA256,OBSERVED_IC34_CANDIDATES,
 verifyObservedIc34Manifest,runAuthorizedFull34M5Cohort
} from "../src/qa-ctrader-full34-m5-cohort.mjs";
const inventory=OBSERVED_IC34_CANDIDATES.map(x=>({
 symbolId:x.nativeId,symbolName:x.nativeName,enabled:true
}));
const env={
 QORE_CT_QA_COHORT34:COHORT34_OPT_IN,
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",QORE_PROVIDER:"IC",
 QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_CT_ACCOUNT_DISCOVERY:"DISABLED",
 QORE_CT_CLIENT_ID:"fake_client",QORE_CT_CLIENT_SECRET:"private_do_not_emit",
 QORE_CT_VIEW_ACCESS_TOKEN:"private_token_do_not_emit",
 QORE_CT_DEMO_ACCOUNT_ID:"123456789",
 QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_CT_SAMPLE_SYMBOL_ID:"41",QORE_CT_SAMPLE_SYMBOL_NAME:"XAUUSD",
 QORE_CT_SAMPLE_INSTRUMENT_ID:"XAUUSD",
 QORE_CT_QA_HISTORY_PAGES:"1",QORE_CT_QA_M5_CSV_EXPORT:"DISABLED",
 QORE_CT_QA_NATIVE_M15_COMPARE:"DISABLED",
 QORE_CT_QA_NATIVE_H4_AUDIT:"DISABLED"
};
function fake({failInstrument=null,oneGap=null,calls=[]}={}){
 return async({config,includeCandidateManifest,includePrivateCsv})=>{
   assert.equal(includePrivateCsv,false);
   assert.equal(config.expectedBrokerTitle,"Raw Trading Ltd");
   assert.equal(config.historyPages,1);
   assert.equal(config.exportPrivateCsv,false);
   assert.equal(config.compareNativeM15,false);
   assert.equal(config.compareNativeH4,false);
   if(!config.sampleSymbolId){
     assert.equal(includeCandidateManifest,false);
     calls.push("inventory");
     return {state:"INVENTORY_QA_ONLY",symbols:inventory,count:34};
   }
   const requested=OBSERVED_IC34_CANDIDATES.find(x=>
     String(x.nativeId)===config.sampleSymbolId);
   assert.ok(requested);
   assert.equal(requested.instrumentId,config.sampleInstrumentId);
   assert.equal(requested.nativeName,config.sampleSymbolName);
   calls.push(requested.instrumentId);
   if(requested.instrumentId===failInstrument)
     return {state:"BLOCKED",reason:"CTRADER_HISTORY_EMPTY_PAGE"};
   return {state:"HISTORICAL_M5_QA_UNCERTIFIED",
    symbolName:requested.nativeName,barCount:300,
    gaps:requested.instrumentId===oneGap?1:0,nativePhaseMin:0,
    earliestClosedAtMs:1800000000000-90000000,
    latestClosedAtMs:1800000000000};
 };
}
test("all 34 sovereign slots and native IDs match the original DEMO manifest SHA",()=>{
 assert.equal(OBSERVED_IC34_CANDIDATES.length,34);
 assert.equal(new Set(OBSERVED_IC34_CANDIDATES.map(x=>x.nativeId)).size,34);
 assert.deepEqual(OBSERVED_IC34_CANDIDATES.map(x=>x.instrumentId),
  INSTRUMENTS.map(x=>x.id));
 const manifest=verifyObservedIc34Manifest(inventory);
 assert.equal(manifest.manifestSha256,COHORT34_MANIFEST_SHA256);
 assert.equal(manifest.exactNameCandidates,34);
 assert.equal(manifest.ownerApprovedMappings,0);
 assert.equal(manifest.sourceParityCertified,0);
 assert.equal(manifest.rows.find(x=>x.instrumentId==="BTCUSD").candidates[0].ctraderSymbolId,10026);
});
test("authenticated DEMO inventory drives exactly 34 bounded read-only queries with one QA row each",async()=>{
 const calls=[],seen=[];
 const r=await runAuthorizedFull34M5Cohort({
  env,probe:fake({calls}),onRow:row=>seen.push(row),throttleMs:0
 });
 assert.equal(r.state,"CTRADER_34_M5_SAMPLES_OBSERVED_UNCERTIFIED");
 assert.equal(r.inventoryCount,34);
 assert.equal(r.expected,34);assert.equal(r.attempted,34);
 assert.equal(r.m5Observed,34);assert.equal(r.blocked,0);
 assert.equal(r.all34M5Observed,true);
 assert.equal(r.rows.length,34);assert.equal(seen.length,34);
 assert.equal(calls.length,35);
 assert.equal(calls[0],"inventory");
 assert.deepEqual(r.rows.map(x=>x.instrumentId),INSTRUMENTS.map(x=>x.id));
 assert.equal(r.rows.find(x=>x.instrumentId==="BTCUSD").group,"BTC_INDEPENDENT");
 assert.equal(r.rows.find(x=>x.instrumentId==="NDX100").group,"INDICES");
 assert.equal(r.rows.find(x=>x.instrumentId==="XAUUSD").group,"METALS");
 assert.ok(r.rows.every(x=>x.closedM5===300&&x.ownerApproved===false));
 assert.equal(r.sourceParityCertified,false);
 assert.equal(r.crtFamiliesCertified,false);
 assert.equal(r.mssM5Certified,false);
 assert.equal(r.mssM15Certified,false);
 assert.equal(r.canTrade,false);
 assert.equal(r.sendPush,false);
 assert.ok(!JSON.stringify(r).includes("private_do_not_emit"));
 assert.ok(!JSON.stringify(r).includes("private_token_do_not_emit"));
});
test("one failed symbol cannot be covered by other 33 or marked certified",async()=>{
 const r=await runAuthorizedFull34M5Cohort({
  env,probe:fake({failInstrument:"AUDJPY",oneGap:"US30"}),
  throttleMs:0
 });
 assert.equal(r.attempted,34);
 assert.equal(r.m5Observed,33);
 assert.equal(r.blocked,1);
 assert.equal(r.all34M5Observed,false);
 assert.equal(r.state,"CTRADER_34_M5_SAMPLES_PARTIAL_UNCERTIFIED");
 assert.equal(r.withUnclassifiedGaps,1);
 assert.equal(r.rows.find(x=>x.instrumentId==="AUDJPY").closedM5,0);
 assert.equal(r.rows.find(x=>x.instrumentId==="AUDJPY").failure,
  "CTRADER_HISTORY_EMPTY_PAGE");
 assert.equal(r.rows.find(x=>x.instrumentId==="US30").state,
  "M5_OBSERVED_GAPS_UNCLASSIFIED_QA");
 assert.equal(r.canTrade,false);assert.equal(r.sendPush,false);
});
test("a rotated broker symbol id or disabled candidate invalidates the entire cohort",()=>{
 assert.throws(()=>verifyObservedIc34Manifest(inventory.map((x,i)=>i===0?
  {...x,symbolId:900}:x)),/MANIFEST_NOT_IDENTICAL/);
 assert.throws(()=>verifyObservedIc34Manifest(inventory.map((x,i)=>i===0?
  {...x,enabled:false}:x)),/MANIFEST_NOT_IDENTICAL/);
 assert.throws(()=>verifyObservedIc34Manifest([...inventory,inventory[0]]),
  /UNTRUSTED/);
});
test("no trading scope, missing explicit opt-in, production, Firebase or other broker",async()=>{
 const forbidden=[
  {QORE_CT_QA_COHORT34:"DISABLED"},{QORE_CT_STAGE:"LIVE"},
  {QORE_CT_OAUTH_SCOPE:"trading"},{QORE_PROVIDER:"OTHER"},
  {QORE_TRADING_ENABLED:"true"},{QORE_PUSH_ENABLED:"true"},
  {QORE_CT_QA_HISTORY_PAGES:"2"},{QORE_CT_QA_M5_CSV_EXPORT:"OWNER_APPROVED_PRIVATE_QA_CSV_ONLY"},
  {QORE_CT_QA_NATIVE_M15_COMPARE:"OWNER_APPROVED_NATIVE_M15_COMPARE"},
  {QORE_CT_QA_NATIVE_H4_AUDIT:"OWNER_APPROVED_NATIVE_H4_PHASE_AUDIT"},
  {QORE_CT_EXPECTED_BROKER_TITLE:"Not IC"}
 ];
 for(const variation of forbidden){
  let calls=0;
  const r=await runAuthorizedFull34M5Cohort({
   env:{...env,...variation},probe:async()=>{calls++;throw Error("UNSAFE_NETWORK");},
   throttleMs:0
  });
  assert.equal(calls,0);
  assert.equal(r.state,"CTRADER_34_UNSAFE_CONFIG_BLOCKED");
  assert.equal(r.canTrade,false);assert.equal(r.sendPush,false);
 }
});
test("manifest verification fails closed before historical requests",async()=>{
 const calls=[];
 const out=await runAuthorizedFull34M5Cohort({
   env,probe:async({config})=>{
    if(!config.sampleSymbolId){
     calls.push("inventory");
     return {state:"INVENTORY_QA_ONLY",
       symbols:inventory.map((x,i)=>i===4?{...x,symbolId:900}:x)};
    }
    calls.push(config.sampleInstrumentId);
    return {state:"HISTORICAL_M5_QA_UNCERTIFIED",barCount:300};
   },throttleMs:0
 });
 assert.deepEqual(calls,["inventory"]);
 assert.equal(out.state,"CTRADER_34_MANIFEST_RECHECK_FAILED");
 assert.equal(out.attempted,0);
 assert.equal(out.sendPush,false);
});
