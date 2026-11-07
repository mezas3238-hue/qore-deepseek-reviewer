import test from "node:test";
import assert from "node:assert/strict";
import {decodeClosedNativeEurusdH4,auditNativeVsNyForexH4}
 from "../src/qa-ctrader-native-h4-ny-phase-audit.mjs";
import {summarizeClosedEurusdH4} from "../src/qa-eurusd-ny-h4-reconstruction.mjs";
const M5=300000, NOW=1_800_000_000_000;
function ny(){
 const initial=Date.parse("2026-11-04T20:00:00.000Z");
 const bars=Array.from({length:600},(_,i)=>{
  const t=initial+i*M5,base=1.1223+i/100000;
  return {provider:"IC",instrumentId:"EURUSD",source:"CTRADER_OPEN_API_DEMO",
   certified:false,sendPush:false,openedAt:t,closedAt:t+M5,
   open:base,high:base+0.0004,low:base-0.0001,close:base+0.0002};
 });
 const d=summarizeClosedEurusdH4(bars);
 assert.equal(d.completeH4Blocks,12);
 return d.bars;
}
const raw=(bars,shift=0)=>bars.map(b=>{
 const low=Math.round(b.low*1e5);
 return {utcTimestampInMinutes:(b.openedAt+shift)/60000,low,
  deltaOpen:Math.round(b.open*1e5)-low,
  deltaHigh:Math.round(b.high*1e5)-low,
  deltaClose:Math.round(b.close*1e5)-low};
});
test("12 native H4 aligned to NY 1/5/9 match exactly when true UTC timestamps and OHLC agree",()=>{
 const derived=ny(),native=decodeClosedNativeEurusdH4({raw:raw(derived),nowMs:NOW});
 const x=auditNativeVsNyForexH4({nativeBars:native,nyBars:derived});
 assert.equal(x.matchedUtcStarts,12);
 assert.equal(x.state,"CTRADER_NATIVE_H4_NY_OHLC_MATCH_QA");
 assert.equal(x.mismatchOhlcBars,0);
 assert.equal(x.fullAnchorAlignment,true);
 assert.equal(x.fullOhlcAlignment,true);
 assert.equal(x.forcedTimestampShiftMinutes,0);
 assert.equal(x.tradingViewParityCertified,false);
 assert.equal(x.mssCertified,false);
 assert.equal(x.canTrade,false);
 assert.equal(x.sendPush,false);
});
test("shifted native H4 clock is diagnosed; never rephase its timestamps to force 1/5/9",()=>{
 const derived=ny(),native=decodeClosedNativeEurusdH4({
  raw:raw(derived,2*60*60000),nowMs:NOW
 });
 const r=auditNativeVsNyForexH4({nativeBars:native,nyBars:derived});
 assert.equal(r.matchedUtcStarts,0);
 assert.equal(r.fullAnchorAlignment,false);
 assert.equal(r.fullOhlcAlignment,false);
 assert.equal(r.forcedTimestampShiftMinutes,0);
 assert.equal(r.state,"CTRADER_NATIVE_H4_NY_CLOCK_MISMATCH_OR_INCOMPLETE_QA");
 assert.equal(r.nativeH4UtcMinutePhases.length,1);
 assert.notDeepEqual(r.nativeH4UtcMinutePhases,r.derivedNyH4UtcMinutePhases);
 assert.equal(r.sendPush,false);
});
test("same timestamps with one tick OHLC mismatch remains quarantined",()=>{
 const derived=ny(),candles=raw(derived);
 candles[3]={...candles[3],deltaClose:candles[3].deltaClose+1};
 const native=decodeClosedNativeEurusdH4({raw:candles,nowMs:NOW});
 const r=auditNativeVsNyForexH4({nativeBars:native,nyBars:derived});
 assert.equal(r.state,"CTRADER_NATIVE_H4_NY_OHLC_DIFFERENCE_QA");
 assert.equal(r.mismatchOhlcBars,1);
 assert.equal(r.mismatchOhlcByField.close,1);
 assert.equal(r.maxDeltaTicks,1);
 assert.equal(r.canTrade,false);
});
test("incomplete native H4 never implies a chart match",()=>{
 const derived=ny(),native=decodeClosedNativeEurusdH4({
  raw:raw(derived).slice(0,11),nowMs:NOW
 });
 const r=auditNativeVsNyForexH4({nativeBars:native,nyBars:derived});
 assert.equal(r.matchedUtcStarts,11);
 assert.equal(r.fullAnchorAlignment,false);
 assert.equal(r.fullOhlcAlignment,false);
});
test("native H4 rejects wrong period, price, duplicates, future candles and non-five-minute phase",()=>{
 const derived=ny(),bars=raw(derived);
 const bad=[
  [{...bars[0],period:7},...bars.slice(1)],
  [{...bars[0],low:0},...bars.slice(1)],
  [{...bars[0],deltaOpen:bars[0].deltaHigh+1},...bars.slice(1)],
  [{...bars[0],utcTimestampInMinutes:bars[0].utcTimestampInMinutes+1},...bars.slice(1)],
  [...bars.slice(0,1),bars[0],...bars.slice(2)],
  [{...bars[0],utcTimestampInMinutes:NOW/60000},...bars.slice(1)]
 ];
 for(const sample of bad)
  assert.throws(()=>decodeClosedNativeEurusdH4({raw:sample,nowMs:NOW}),/CTRADER_NATIVE_H4_QA/);
});
