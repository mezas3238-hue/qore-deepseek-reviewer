import test from "node:test";
import assert from "node:assert/strict";
import {normalizeCoinbaseBtcM5,fetchCoinbaseBtcM5,
  stageBtcProbeM5,BTC_PROBE} from "../src/btcusd-coinbase-m5.mjs";
import {ClosedM5Ingestion} from "../src/closed-m5-ingestion.mjs";
const FIVE=300000,START=Date.parse("2026-10-31T00:00:00Z");
const candle=i=>({start:String((START+i*FIVE)/1000),
 open:"70100.1",high:"70125.5",low:"70090.0",close:"70111.2",volume:"3.1"});
const args=(n=3)=>({startMs:START,endMs:START+n*FIVE,
 receivedAt:START+n*FIVE+30000});
const payload=(n=3)=>({candles:Array.from({length:n},(_,i)=>candle(n-1-i))});
const intake=()=>new ClosedM5Ingestion({
 provider:BTC_PROBE.provider,instrumentId:"BTCUSD",feedSymbol:"BTC-USD",
 finalityLagMs:30000,maxBars:200
});
test("Coinbase public 5-minute spot candles normalized UTC, sorted and immutable",()=>{
 const p=normalizeCoinbaseBtcM5(payload(),args());
 assert.equal(p.state,"BTC_M5_PROBE_ONLY");assert.equal(p.completeWindow,true);
 assert.equal(p.bars.length,3);assert.equal(p.bars[0].openedAt,START);
 assert.equal(p.bars[0].high,70125.5);assert.equal(p.bars[0].low,70090);
 assert.ok(Object.isFrozen(p.bars));assert.ok(Object.isFrozen(p.bars[0]));
 assert.equal(p.sendPush,false);assert.equal(p.crtSchedule,"NOT_APPROVED");
});
test("window validation, positive OHLC and no silent interpolated candles",()=>{
 assert.throws(()=>normalizeCoinbaseBtcM5(payload(),{
  ...args(),endMs:START+FIVE/2}),/INVALID_PROBE_WINDOW/);
 assert.throws(()=>normalizeCoinbaseBtcM5({candles:[{
  ...candle(0),close:"NaN"}]},args(1)),/INVALID_COINBASE_PRICE/);
 const p=normalizeCoinbaseBtcM5({candles:[candle(0),candle(2)]},args(3));
 assert.equal(p.completeWindow,false);assert.equal(p.bars.length,2);
 const state=stageBtcProbeM5(intake(),p,{receivedAt:args().receivedAt});
 assert.equal(state.state,"GAP_HELD_FOR_BACKFILL");
 assert.equal(state.sendPush,false);
});
test("partially forming M5 cannot enter a CRT candidate",()=>{
 const p=normalizeCoinbaseBtcM5({candles:[candle(0),candle(1)]},{
  ...args(2),receivedAt:START+2*FIVE+1000});
 assert.equal(p.bars.length,1);assert.equal(p.formingOmitted,1);
 assert.equal(p.completeWindow,false);
});
test("duplicate different Coinbase OHLC at same timestamp fails closed",()=>{
 const conflict={...candle(0),close:"70112.2"};
 assert.throws(()=>normalizeCoinbaseBtcM5({
  candles:[candle(0),conflict]},args(1)),/conflicting replay/);
});
test("read-only GET uses fixed provider URL, API FIVE_MINUTE and no credentials",async()=>{
 let checked=false;
 const p=await fetchCoinbaseBtcM5({...args(),fetchImpl:async(url,options)=>{
  const u=new URL(url);checked=true;
  assert.equal(u.hostname,"api.coinbase.com");
  assert.equal(u.pathname,"/api/v3/brokerage/market/products/BTC-USD/candles");
  assert.equal(u.searchParams.get("granularity"),"FIVE_MINUTE");
  assert.equal(u.searchParams.get("limit"),"3");
  assert.equal(options.method,"GET");assert.equal(options.redirect,"error");
  assert.ok(!Object.keys(options.headers).some(h=>/auth|secret|key/i.test(h)));
  return {ok:true,json:async()=>payload()};
 }});
 assert.ok(checked);assert.equal(p.bars.length,3);
 const staged=stageBtcProbeM5(intake(),p,{receivedAt:args().receivedAt});
 assert.equal(staged.state,"BTC_M5_PROBE_STAGED");assert.equal(staged.accepted,3);
 assert.equal(staged.sendPush,false);
});
test("network/HTTP errors do not leak URLs, form fake data or authorize push",async()=>{
 await assert.rejects(fetchCoinbaseBtcM5({...args(),
  fetchImpl:async()=>{throw Error("private-secret")}}),/NETWORK_UNAVAILABLE/);
 await assert.rejects(fetchCoinbaseBtcM5({...args(),
  fetchImpl:async()=>({ok:false})}),/HTTP_REJECTED/);
 await assert.rejects(fetchCoinbaseBtcM5({...args(),receivedAt:START+FIVE}),
  /WINDOW_NOT_FINAL/);
});
test("untrusted payload and wrong feed symbols do not get staged",()=>{
 const p=normalizeCoinbaseBtcM5(payload(1),args(1));
 assert.throws(()=>stageBtcProbeM5(intake(),{...p,sendPush:true},
  {receivedAt:args(1).receivedAt}),/INVALID_BTC_PROBE_STAGING/);
 const other=new ClosedM5Ingestion({provider:BTC_PROBE.provider,
  instrumentId:"BTCUSD",feedSymbol:"BTC.OTHER",maxBars:100});
 assert.equal(stageBtcProbeM5(other,p,{
  receivedAt:args(1).receivedAt}).state,"SOURCE_MAPPING_REJECTED");
});
