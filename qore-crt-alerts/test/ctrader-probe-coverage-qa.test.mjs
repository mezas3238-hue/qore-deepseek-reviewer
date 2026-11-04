import test from "node:test";
import assert from "node:assert/strict";
import {auditSanitizedCtraderProbe} from "../src/ctrader-probe-coverage-qa.mjs";

const account={ctidTraderAccountId:99112,isLive:false,brokerName:"DemoBroker"};
const symbols=[
  {symbolId:101,symbolName:"USDCAD",enabled:true},
  {symbolId:202,symbolName:"EURUSD",enabled:false},
  {symbolId:303,symbolName:"BTCUSD",enabled:true}
];
const snapshot=()=>({
  status:"DEMO_VIEW_ONLY_INVENTORY_OBSERVED",
  mode:"READ_ONLY_DEMO",
  brokerLabel:"DemoBroker",
  symbolCount:3,enabledSymbolCount:2,sourceParityCertified:0,
  sendPush:false,canTrade:false,instrumentMappingsApproved:0,
  notes:"Symbols are not proof of TradingView IC/OANDA OHLC parity.",
  discoveredSymbols:symbols.map(x=>({...x}))
});
const approvedMappings=[
  {instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",symbolId:101,
   brokerSymbolName:"USDCAD",ownerApproved:true},
  {instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",symbolId:202,
   brokerSymbolName:"EURUSD",ownerApproved:true},
  {instrumentId:"BTCUSD",tvSymbol:"IC:BTCUSD",symbolId:303,
   brokerSymbolName:"BTCUSD",ownerApproved:true}
];

test("sanitized SCOPE_VIEW inventory reports 34 candidates without certifying IC/OANDA",()=>{
 const result=auditSanitizedCtraderProbe({
  snapshot:snapshot(),account,approvedMappings
 });
 assert.equal(result.coverage.total,34);
 assert.equal(result.coverage.brokerCandidates,2);
 assert.equal(result.coverage.mapped,3);
 assert.equal(result.coverage.sourceParityCertified,0);
 assert.equal(result.coverage.sendPushEnabled,0);
 assert.equal(result.rows.length,34);
 assert.equal(result.rows.find(x=>x.instrumentId==="EURUSD").state,"BROKER_SYMBOL_DISABLED");
 assert.equal(result.rows.find(x=>x.instrumentId==="USDCAD").state,
  "DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED");
 assert.ok(result.rows.every(x=>x.canSendPush===false && x.sourceParityCertified===false));
 assert.equal(result.sendPush,false);
 assert.equal(result.canTrade,false);
});

test("no mappings means 0/34 even if symbols exist at broker",()=>{
 const result=auditSanitizedCtraderProbe({snapshot:snapshot(),account});
 assert.equal(result.coverage.brokerCandidates,0);
 assert.equal(result.coverage.mapped,0);
 assert.equal(result.rows.length,34);
});

test("untrusted token, trade flag, spoofed counters or source are blocked",()=>{
 const value=snapshot();
 for(const bad of [
  {...value,canTrade:true},
  {...value,sendPush:true},
  {...value,sourceParityCertified:1},
  {...value,symbolCount:2},
  {...value,enabledSymbolCount:3},
  {...value,discoveredSymbols:[...value.discoveredSymbols,
    {symbolId:707,symbolName:"AUDJPY",enabled:true,accessToken:"secret"}],
    symbolCount:4,enabledSymbolCount:3},
  {...value,status:"PRODUCTION_APPROVED"},
  {...value,accountId:"123"},
  {...value,mode:"LIVE"},
  {...value,discoveredSymbols:null}
 ]) {
  assert.throws(()=>auditSanitizedCtraderProbe({
   snapshot:bad,account,approvedMappings
  }),/CTRADER_PROBE_/);
 }
 assert.throws(()=>auditSanitizedCtraderProbe({
  snapshot:value,account:{...account,isLive:true},approvedMappings
 }),/BROKER_OR_ACCOUNT_MISMATCH/);
 assert.throws(()=>auditSanitizedCtraderProbe({
  snapshot:value,account:{...account,brokerName:"IC"},approvedMappings
 }),/BROKER_OR_ACCOUNT_MISMATCH/);
});

test("mapping never silently turns another broker into same-provider parity",()=>{
 const value=snapshot();
 assert.throws(()=>auditSanitizedCtraderProbe({
  snapshot:value,account,approvedMappings:[
   {...approvedMappings[0],tvSymbol:"OANDA:USDCAD"}]
 }),/CTRADER_OWNER_MAPPING_REQUIRED/);
});

test("historical cTrader one-symbol M5 proof is QA-only and preserves gaps",()=>{
 const start=1793336400000;
 const candle=(i)=>({openedAtMs:start+i*300000,closedAtMs:start+(i+1)*300000,
  lowRelative:138000,deltaHigh:250,deltaOpen:130,deltaClose:215});
 const h={
  status:"HISTORICAL_CLOSED_M5_QA_NOT_CERTIFIED",
  accountMatches:true,symbolId:101,observedAtMs:start+1500000,
  nativePhaseMin:(start%300000)/60000,barCount:2,
  sourceHasMore:true,
  gaps:[{afterMs:start+300000,nextAtMs:start+900000}],
  bars:[candle(0),candle(3)],
  sourceParityCertified:false,sendPush:false,canTrade:false
 };
 const r=auditSanitizedCtraderProbe({snapshot:{...snapshot(),historicalM5:h},
  account,approvedMappings});
 assert.equal(r.sampleM5QA.barCount,2);
 assert.equal(r.sampleM5QA.gapCount,1);
 assert.equal(r.sampleM5QA.hasMore,true);
 assert.equal(r.sampleM5QA.sendPush,false);
 assert.equal(r.coverage.sourceParityCertified,0);
 for(const bad of [
  {...h,sendPush:true},
  {...h,symbolId:999},
  {...h,gaps:[]},
  {...h,barCount:3},
  {...h,bars:[candle(0),candle(1)]},
  {...h,bars:[{...candle(0),apiKey:"private"},candle(3)]},
  {...h,bars:[candle(0),{...candle(3),closedAtMs:start+3000000}]}
 ]) {
   assert.throws(()=>auditSanitizedCtraderProbe({
    snapshot:{...snapshot(),historicalM5:bad},account,approvedMappings
   }),/CTRADER_PROBE_/);
 }
});
