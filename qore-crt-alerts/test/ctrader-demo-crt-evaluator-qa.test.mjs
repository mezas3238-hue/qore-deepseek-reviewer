import test from "node:test";
import assert from "node:assert/strict";
import {evaluateCtrader34Coverage,normalizeClosedCtraderTrendbar} from "../src/ctrader-readonly-m5-qa.mjs";
import {evaluateCtraderDemoCrtMssQA} from "../src/ctrader-demo-crt-evaluator-qa.mjs";

const start=Date.parse("2026-10-30T05:00:00Z"),five=300000;
const account={ctidTraderAccountId:888888,isLive:false,brokerName:"DemoBroker"};
const coverage=evaluateCtrader34Coverage({account,scope:"accounts",
 discoveredSymbols:[{symbolId:37,symbolName:"EURUSD",digits:5}],
 approvedMappings:[{instrumentId:"EURUSD",tvSymbol:"IC:EURUSD",
  symbolId:37,brokerSymbolName:"EURUSD",ownerApproved:true}]});
const row=coverage.rows.find(r=>r.instrumentId==="EURUSD");
const binding={instrumentId:"EURUSD",brokerName:"DemoBroker",symbolId:37,
 brokerSymbolName:"EURUSD",digits:5,ownerApproved:true};
function candles({missing=false,provider="DemoBroker"}={}){
 const out=[];
 for(let i=0;i<96;i++){
   let high=102,low=97,close=100;
   if(i===0){high=110;low=90;}
   if(i===21){high=106;low=94;}
   if(i===48){high=104;low=89;}
   if(i===49){high=109;close=108;}
   if(i===50){high=109;close=108;}
   const openedAt=start+i*five;
   // This fixture checks isolation; it is NOT an external broker feed.
   out.push({provider,instrumentId:"EURUSD",symbolId:37,
     source:"CTRADER_OPEN_API_DEMO",certified:false,sendPush:false,
     transport:"DISABLED",brokerSymbol:"EURUSD",
     openedAt,closedAt:openedAt+five,open:100,high,low,close});
 }
 if(missing)out.splice(11,1);
 return out;
}
const input=(c)=>({coverageRow:row,brokerName:"DemoBroker",
  c1StartMs:start,observedAtMs:start+96*five,candlesM5:c});
test("DEMO broker can evaluate CRT/MSS offline, but cannot masquerade as IC parity",()=>{
 const out=evaluateCtraderDemoCrtMssQA(input(candles()));
 assert.equal(out.state,"REPLAY_EVALUATED_NOT_TV_CERTIFIED");
 assert.equal(out.instrumentId,"EURUSD");
 assert.equal(out.tvComparisonSymbol,"IC:EURUSD");
 assert.equal(out.brokerName,"DemoBroker");
 assert.equal(out.sourceParityCertified,false);
 assert.equal(out.pushAuthorized,false);
 assert.equal(out.sendPush,false);
 assert.equal(out.canTrade,false);
 assert.equal(out.requiresIndependentTradingViewParity,true);
 assert.ok(typeof out.crt==="string");
 assert.ok(typeof out.mssM5.state==="string");
 assert.ok(typeof out.mssM15.state==="string");
});
test("replay blocks incomplete, gap, wrong broker, phase drift, and missing C1",()=>{
 assert.equal(evaluateCtraderDemoCrtMssQA(input(candles().slice(0,95))).state,
  "INSUFFICIENT_M5_FOR_C1_C2");
 assert.equal(evaluateCtraderDemoCrtMssQA(input(candles({missing:true}))).state,
  "INSUFFICIENT_M5_FOR_C1_C2");
 const gap=candles();gap[11]={...gap[11],openedAt:gap[11].openedAt+five*3,
   closedAt:gap[11].closedAt+five*3};
 assert.equal(evaluateCtraderDemoCrtMssQA(input(gap)).state,
  "NON_CONTIGUOUS_M5_IN_EVALUATION");
 assert.equal(evaluateCtraderDemoCrtMssQA(input(candles({provider:"IC"}))).state,
  "BROKER_SOURCE_NOT_IDENTICAL");
 const drift=candles();drift[11]={...drift[11],openedAt:drift[11].openedAt+60000,
   closedAt:drift[11].closedAt+60000};
 assert.equal(evaluateCtraderDemoCrtMssQA(input(drift)).state,
  "NATIVE_PHASE_DRIFT_IN_EVALUATION");
 const noStart=evaluateCtraderDemoCrtMssQA({...input(candles()),
   c1StartMs:start+60000});
 assert.equal(noStart.state,"C1_NOT_IN_NATIVE_SOURCE_PHASE");
 const unclosed=evaluateCtraderDemoCrtMssQA({...input(candles()),
  observedAtMs:start+95*five});
 assert.equal(unclosed.state,"UNCLOSED_M5_IN_EVALUATION");
});
test("source mismatches and forged approval cannot enable evaluation or notifications",()=>{
 const x=candles();
 assert.throws(()=>evaluateCtraderDemoCrtMssQA({...input(x),
  coverageRow:{...row,state:"UNMAPPED"}}),/SOURCE_SCOPE/);
 const y=evaluateCtraderDemoCrtMssQA(input(x.map(c=>({...c,sendPush:true}))));
 assert.equal(y.state,"BROKER_SOURCE_NOT_IDENTICAL");
 const z=evaluateCtraderDemoCrtMssQA(input(x.map(c=>({...c,symbolId:99}))));
 assert.equal(z.state,"BROKER_SOURCE_NOT_IDENTICAL");
 assert.throws(()=>evaluateCtraderDemoCrtMssQA({...input(x),
  coverageRow:{...row,tvSymbol:"OANDA:EURUSD"}}),/IDENTITY/);
});
test("relative cTrader bars can enter the same offline evaluator without conversion to IC quotes",()=>{
 const low=100000; const c1=start/five;
 const bars=[];
 for(let i=0;i<96;i++){
  const openedAt=start+i*five;
  const x=normalizeClosedCtraderTrendbar({
    trendbar:{utcTimestampInMinutes:openedAt/60000,low,
      deltaOpen:50,deltaHigh:150,deltaClose:100,period:"M5"},
    binding,observedAtMs:openedAt+five+1000,
    provenClosedAtMs:openedAt+five});
  bars.push(x);
 }
 const out=evaluateCtraderDemoCrtMssQA(input(bars));
 assert.equal(out.state,"REPLAY_EVALUATED_NOT_TV_CERTIFIED");
 assert.equal(out.brokerName,"DemoBroker");
 assert.equal(out.sourceParityCertified,false);
 assert.equal(out.sendPush,false);
});
