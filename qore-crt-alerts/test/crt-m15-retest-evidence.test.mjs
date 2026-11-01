import test from "node:test";
import assert from "node:assert/strict";
import {detectPostMssM15Retest} from "../src/crt-auxiliary-models.mjs";

const MIN15=900000;
const mssAt=Date.parse("2026-11-01T17:30:00Z");
const provider="COINBASE_QA",instrumentId="BTCUSD";
const m15=(i,high,low,close)=>({
  provider,instrumentId,timeframe:"M15",
  openedAt:mssAt+i*MIN15,closedAt:mssAt+(i+1)*MIN15,
  open:close,high,low,close
});
const audit=(direction,closedM15,pivotPrice=77829.21)=>detectPostMssM15Retest({
 provider,instrumentId,cycleId:"COINBASE_QA|BTCUSD|1793541600000|-1",
 direction,mssAt,pivotPrice,closedM15
});

test("bearish retest records the exact CLOSED M15 that actually touched and closed below pivot",()=>{
 const ignored=m15(0,77800,77700,77750);
 const matched=m15(1,77880,77730,77790);
 const last=m15(2,77900,77750,77800);
 const x=audit(-1,[ignored,matched,last]);
 assert.equal(x.state,"RETEST_M15_OBSERVED_QA");
 assert.equal(x.retestAt,matched.closedAt);
 assert.equal(x.retestHigh,matched.high);
 assert.equal(x.retestLow,matched.low);
 assert.equal(x.retestClose,matched.close);
 assert.equal(x.pivotPrice,77829.21);
 assert.equal(x.timeframe,"M15");
 assert.equal(x.actionable,false);assert.equal(x.sendPush,false);
});
test("bullish retest records first closed M15 after MSS; never current or M5",()=>{
 const matched=m15(0,77900,77810,77850);
 const x=audit(1,[matched,m15(1,78000,77700,77880)]);
 assert.equal(x.state,"RETEST_M15_OBSERVED_QA");
 assert.equal(x.retestAt,matched.closedAt);
 assert.equal(x.retestLow,77810);
 assert.equal(x.retestClose,77850);
});
test("crossing pivot without correct side close must not produce retest evidence",()=>{
 const x=audit(-1,[m15(0,77880,77720,77840)]);
 assert.equal(x.state,"RETEST_PENDING");
 assert.equal(x.retestAt,undefined);
 assert.equal(x.retestHigh,undefined);
});
test("missing M15 between MSS and touch invalidates all QA evidence",()=>{
 const x=audit(-1,[m15(1,77888,77800,77820)]);
 assert.equal(x.state,"RETEST_M15_GAP");
 assert.equal(x.retestHigh,undefined);
});
test("wrong provider must never carry foreign candle evidence",()=>{
 const x=audit(-1,[{...m15(0,77885,77780,77820),provider:"OTHER"}]);
 assert.equal(x.state,"RETEST_SOURCE_OR_DATA_REJECTED");
 assert.equal(x.retestClose,undefined);
});
