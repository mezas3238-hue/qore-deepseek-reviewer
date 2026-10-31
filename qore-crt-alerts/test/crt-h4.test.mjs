import test from "node:test";
import assert from "node:assert/strict";
import {inspectCrtH4} from "../src/crt-h4.mjs";
const t=Date.parse("2026-10-30T05:00:00Z");
const bar=(i,high,low,close,extra={})=>({
  provider:"OFFLINE_FIXTURE",instrumentId:"EURUSD",timeframe:"H4",
  openedAt:t+i*14400000,closedAt:t+(i+1)*14400000,open:105,
  high,low,close,nyHour:(1+4*i)%24,allowedC1:i===0||i===1,...extra});
const c1=bar(0,110,100,105);
const c2bull=bar(1,108,98,105);
const c2bear=bar(1,112,102,105);
const evalCRT=(c2,c3=null,c1in=c1)=>inspectCrtH4({c1:c1in,c2,c3,family:"forex"});
test("strict lower C2 sweep + close back into C1 ratifies provisional H4, not signal",()=>{
  const r=evalCRT(c2bull);
  assert.equal(r.state,"C2_RATIFIED_AWAITING_C3");
  assert.equal(r.direction,1);
  assert.equal(r.actionable,false);
});
test("strict upper C2 sweep + return produces bearish structure",()=>{
  const r=evalCRT(c2bear);
  assert.equal(r.state,"C2_RATIFIED_AWAITING_C3");
  assert.equal(r.direction,-1);
});
test("equal boundary touches are NOT strict sweeps",()=>{
  assert.equal(evalCRT(bar(1,110,100,105)).state,"NO_STRICT_SWEEP");
  assert.equal(evalCRT(bar(1,110,99,105)).direction,1);
  assert.equal(evalCRT(bar(1,111,100,105)).direction,-1);
});
test("strictly sweeping both C1 extremes invalidates unique-direction candidate",()=>{
  assert.equal(evalCRT(bar(1,111,99,105)).state,"DOUBLE_STRICT_SWEEP");
});
test("C2 closing beyond C1 cannot be ratified",()=>{
  assert.equal(evalCRT(bar(1,109,98,99)).state,"C2_CLOSE_OUTSIDE_C1");
});
test("C3 bullish invalidation only uses CLOSED H4 close below C2 wick",()=>{
  assert.equal(evalCRT(c2bull,bar(2,109,95,102)).state,"C3_NOT_INVALIDATED");
  assert.equal(evalCRT(c2bull,bar(2,109,95,97)).state,"C3_INVALIDATED");
});
test("C3 bearish invalidation only uses CLOSED H4 close above C2 wick",()=>{
  assert.equal(evalCRT(c2bear,bar(2,115,101,110)).state,"C3_NOT_INVALIDATED");
  assert.equal(evalCRT(c2bear,bar(2,115,101,113)).state,"C3_INVALIDATED");
});
test("nonconsecutive H4 or unauthorized C1 NY hour rejected",()=>{
  assert.equal(evalCRT(bar(1,108,98,105,{openedAt:t+5*14400000,closedAt:t+6*14400000})).state,"INVALID_CYCLE");
  assert.equal(evalCRT(c2bull,null,bar(0,110,100,105,{nyHour:9})).state,"INVALID_CYCLE");
});
test("missing or incomplete H4 cannot become a CRT",()=>{
  assert.equal(evalCRT({...c2bull,closedAt:c2bull.closedAt-1}).state,"INCOMPLETE_H4");
  assert.equal(inspectCrtH4({c1,c2:c2bull,c3:null,family:"crypto"}).state,"UNSUPPORTED_FAMILY");
});
test("mixing different providers or symbols is prohibited",()=>{
  assert.equal(evalCRT({...c2bull,provider:"OTHER"}).state,"INVALID_CYCLE");
  assert.equal(evalCRT(c2bull,{...bar(2,109,95,102),instrumentId:"GBPUSD"}).state,"INVALID_C3_SEQUENCE");
});
