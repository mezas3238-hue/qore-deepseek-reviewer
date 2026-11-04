import test from "node:test";
import assert from "node:assert/strict";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {
  CTRADER_QA_MODE,CTRADER_OPEN_API_READ_REQUESTS,
  verifyDemoScope,planReadOnlyRequest,evaluateCtrader34Coverage,
  planM5Subscription,normalizeClosedCtraderTrendbar,CtraderClosedM5QaBuffer
} from "../src/ctrader-readonly-m5-qa.mjs";

const account={ctidTraderAccountId:12345678,isLive:false,brokerName:"DemoBroker"};
const scope="accounts";
const context=()=>verifyDemoScope({account,scope});
const symbols=[{symbolId:37,symbolName:"USDCAD",digits:5},
  {symbolId:42,symbolName:"EURUSD",digits:5},
  {symbolId:88,symbolName:"BTCUSD",digits:2}];
const map=[
 {instrumentId:"USDCAD",tvSymbol:"IC:USDCAD",symbolId:37,
  brokerSymbolName:"USDCAD",ownerApproved:true},
 {instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",symbolId:42,
  brokerSymbolName:"EURUSD",ownerApproved:true},
 {instrumentId:"BTCUSD",tvSymbol:"IC:BTCUSD",symbolId:88,
  brokerSymbolName:"BTCUSD",ownerApproved:true}
];
const coverage=(o={})=>evaluateCtrader34Coverage({
 account,scope,discoveredSymbols:symbols,approvedMappings:map,...o});
const binding={instrumentId:"USDCAD",brokerName:"DemoBroker",
 brokerSymbolName:"USDCAD",symbolId:37,digits:5,ownerApproved:true};
const raw=minute=>({utcTimestampInMinutes:minute,
 low:138000,deltaHigh:250,deltaOpen:130,deltaClose:215,period:"M5"});
const t=30000000;
const candle=(minute=t,opts={})=>normalizeClosedCtraderTrendbar({
 trendbar:raw(minute),binding,
 observedAtMs:minute*60000+300000+1000,
 provenClosedAtMs:minute*60000+300000,...opts
});

test("OAuth read-only scope and explicit DEMO account: LIVE or trading rejected",()=>{
 assert.equal(context().canTrade,false);
 assert.equal(context().canSendPush,false);
 assert.throws(()=>verifyDemoScope({account,scope:"trading"}),/READ_ONLY/);
 assert.throws(()=>verifyDemoScope({account:{...account,isLive:true},scope}),/DEMO/);
 assert.throws(()=>verifyDemoScope({account:{...account,isLive:undefined},scope}),/DEMO/);
 assert.throws(()=>verifyDemoScope({account:{...account,ctidTraderAccountId:0},scope}),/DEMO/);
});
test("only read-only market requests are allowlisted, never trade/order",()=>{
 assert.deepEqual(CTRADER_OPEN_API_READ_REQUESTS.includes("ProtoOANewOrderReq"),false);
 for(const type of ["ProtoOANewOrderReq","ProtoOAAmendOrderReq","ProtoOAClosePositionReq"])
   assert.throws(()=>planReadOnlyRequest(type,{},context()),/DENIED/);
 assert.throws(()=>planReadOnlyRequest("ProtoOAGetTrendbarsReq",
  {token:"secret"},context()),/UNSAFE/);
 assert.throws(()=>planReadOnlyRequest("ProtoOAGetTrendbarsReq",
  {ctidTraderAccountId:123},context()),/SCOPE/);
 const r=planReadOnlyRequest("ProtoOASymbolsListReq",
  {ctidTraderAccountId:account.ctidTraderAccountId},context());
 assert.equal(r.transport,"NOT_CONNECTED");
 assert.equal(r.canTrade,false);
 assert.equal(r.sendPush,false);
 assert.equal(CTRADER_QA_MODE,"READ_ONLY_DEMO_OFFLINE");
});
test("real broker inventory is not silently treated as TV provider parity",()=>{
 const x=coverage();
 assert.equal(x.rows.length,34);
 assert.equal(new Set(x.rows.map(v=>v.instrumentId)).size,34);
 assert.equal(x.coverage.total,34);
 assert.equal(x.coverage.mapped,3);
 assert.equal(x.coverage.brokerCandidates,3);
 assert.equal(x.coverage.sourceParityCertified,0);
 assert.equal(x.coverage.sendPushEnabled,0);
 assert.ok(x.rows.every(v=>!v.canSendPush&&!v.sourceParityCertified));
 assert.equal(x.rows.find(v=>v.instrumentId==="EURCHF").state,"UNMAPPED");
 assert.equal(x.rows.find(v=>v.instrumentId==="BTCUSD").state,
  "DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED");
 const none=evaluateCtrader34Coverage({account,scope});
 assert.equal(none.coverage.brokerCandidates,0);
 assert.equal(none.rows.length,INSTRUMENTS.length);
 assert.equal(none.canSendPush,false);
});
test("broker symbol missing or wrongly named is blocked even if the pair looks similar",()=>{
 const missing=coverage({discoveredSymbols:symbols.filter(s=>s.symbolId!==42)});
 assert.equal(missing.coverage.brokerCandidates,2);
 assert.equal(missing.rows.find(v=>v.instrumentId==="EURUSD").state,
   "BROKER_SYMBOL_UNAVAILABLE");
 const renamed=coverage({discoveredSymbols:symbols.map(s=>s.symbolId===37?
   {...s,symbolName:"USDCAD.pro"}:s)});
 assert.equal(renamed.rows.find(v=>v.instrumentId==="USDCAD").state,
   "BROKER_SYMBOL_UNAVAILABLE");
 assert.throws(()=>coverage({approvedMappings:[map[0],{...map[0]}]}),/UNIQUE/);
 assert.throws(()=>coverage({approvedMappings:[{...map[0],ownerApproved:false}]}),/REQUIRED/);
 assert.throws(()=>coverage({approvedMappings:[{...map[0],tvSymbol:"OANDA:USDCAD"}]}),/REQUIRED/);
 assert.throws(()=>coverage({approvedMappings:[map[0],{...map[1],symbolId:37}]}),/UNIQUE/);
 assert.throws(()=>coverage({discoveredSymbols:[...symbols,symbols[0]]}),/DUPLICATE/);
});
test("subscription plan only includes spots then live M5; no network",()=>{
 const row=coverage().rows.find(x=>x.instrumentId==="USDCAD");
 const result=planM5Subscription(row,context());
 assert.deepEqual(result.requests.map(x=>x.type),[
  "ProtoOASubscribeSpotsReq","ProtoOASubscribeLiveTrendbarReq"]);
 assert.equal(result.requests[1].fields.period,"M5");
 assert.equal(result.transport,"NOT_CONNECTED");
 assert.throws(()=>planM5Subscription(coverage().rows.find(x=>
  x.instrumentId==="EURCHF"),context()),/UNMAPPED/);
});
test("decode exact relative OHLC to M5, with explicit source close evidence",()=>{
 const x=candle();
 assert.deepEqual([x.open,x.high,x.low,x.close],[1.3813,1.3825,1.38,1.38215]);
 assert.equal(x.openedAt,t*60000);
 assert.equal(x.closedAt-x.openedAt,300000);
 assert.equal(x.provider,"DemoBroker");
 assert.equal(x.source,"CTRADER_OPEN_API_DEMO");
 assert.equal(x.certified,false);
 assert.equal(x.actionable,false);
 assert.equal(x.sendPush,false);
 assert.throws(()=>candle(t,{provenClosedAtMs:t*60000+299999}),/NOT_PROVEN_CLOSED/);
 assert.throws(()=>candle(t,{observedAtMs:t*60000+299999}),/NOT_PROVEN_CLOSED/);
 assert.throws(()=>candle(t,{trendbar:{...raw(t),period:"M1"}}),/UNAPPROVED_BINDING|NOT_PROVEN_CLOSED/);
 assert.throws(()=>candle(t,{binding:{...binding,ownerApproved:false}}),/UNAPPROVED/);
 assert.throws(()=>candle(t,{trendbar:{...raw(t),deltaHigh:100}}),/RELATIVE_OHLC/);
 assert.throws(()=>candle(t,{trendbar:{...raw(t),low:0}}),/RELATIVE_OHLC/);
 assert.throws(()=>candle(t,{trendbar:{...raw(t),
  low:Number.MAX_SAFE_INTEGER}}),/RELATIVE_OHLC/);
 assert.throws(()=>candle(t,{trendbar:{...raw(t),utcTimestampInMinutes:"abc"}}),/RELATIVE_OHLC/);
});
test("native phases 0..4 are preserved, never coerced to zero",()=>{
 const start=Math.floor(t/5)*5;
 for(let phase=0;phase<5;phase++){
  const x=candle(start+phase);
  const buffer=new CtraderClosedM5QaBuffer({
    brokerName:"DemoBroker",instrumentId:"USDCAD",symbolId:37});
  const r=buffer.record(x,x.closedAt+1000);
  assert.equal(r.nativePhaseMin,phase);
  assert.equal(r.sendPush,false);
 }
});
test("QA buffer rejects duplicate conflict, gap, out-of-order, phase shift, stale and foreign source",()=>{
 const start=Math.floor(t/5)*5;
 const buf=new CtraderClosedM5QaBuffer({
    brokerName:"DemoBroker",instrumentId:"USDCAD",symbolId:37,maxAgeMs:600000});
 const x=candle(start);
 const y=candle(start+5);
 assert.equal(buf.record(x,x.closedAt+1000).status,"M5_QA_CONTIGUOUS");
 assert.equal(buf.record(x,x.closedAt+1000).status,"DUPLICATE");
 assert.equal(buf.record({...x,close:1.3819},x.closedAt+1000).status,"CONFLICT_QUARANTINED");
 assert.equal(buf.record(candle(start+10),candle(start+10).closedAt+1000).status,"M5_GAP_QUARANTINED");
 assert.equal(buf.record(candle(start+1),candle(start+1).closedAt+1000).status,
  "NATIVE_PHASE_CHANGED_QUARANTINED");
 assert.equal(buf.record(candle(start-5),candle(start-5).closedAt+1000).status,
  "OUT_OF_ORDER_QUARANTINED");
 assert.equal(buf.record(y,y.closedAt+600001).status,"STALE_M5_QUARANTINED");
 assert.equal(buf.record(y,y.closedAt+1000).status,"M5_QA_CONTIGUOUS");
 assert.equal(buf.size,2);
 assert.equal(buf.snapshot().length,2);
 assert.throws(()=>buf.record({...y,provider:"IC"},y.closedAt+1000),/CROSS_SOURCE/);
});
