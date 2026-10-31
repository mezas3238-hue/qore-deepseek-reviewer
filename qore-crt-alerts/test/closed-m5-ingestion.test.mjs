import test from "node:test";
import assert from "node:assert/strict";
import {ClosedM5Ingestion} from "../src/closed-m5-ingestion.mjs";
const START=Date.parse("2026-10-30T05:00:00Z"),FIVE=300000;
const make=()=>new ClosedM5Ingestion({provider:"LOCAL_TEST",instrumentId:"EURUSD",
  feedSymbol:"EURUSD.TEST.FEED",finalityLagMs:1000,maxBars:48});
const bar=(i,extra={})=>({provider:"LOCAL_TEST",instrumentId:"EURUSD",
  feedSymbol:"EURUSD.TEST.FEED",openedAt:START+i*FIVE,closedAt:START+(i+1)*FIVE,
  open:100,high:105,low:95,close:101,...extra});
test("closed M5 feed normalization accepts only the configured mapped provider",()=>{
 const ing=make(),v=ing.ingest(bar(0),{receivedAt:START+FIVE+1000});
 assert.equal(v.state,"CLOSED_M5_ACCEPTED");
 assert.equal(ing.health().barCount,1);
 assert.equal(ing.health().feedMappingVerifiedForLive,false);
 assert.equal(ing.health().sendPush,false);
});
test("forming M5 candle rejected even with valid-looking OHLC",()=>{
 const ing=make();
 assert.equal(ing.ingest(bar(0),{receivedAt:START+FIVE-1}).state,"CANDLE_NOT_FINAL");
 assert.equal(ing.ingest(bar(0),{receivedAt:START+FIVE}).state,"CANDLE_NOT_FINAL");
 assert.equal(ing.health().barCount,0);
});
test("duplicate exactly the same M5 cannot create a second event",()=>{
 const ing=make(),x=bar(0),at=START+FIVE+1000;
 assert.equal(ing.ingest(x,{receivedAt:at}).state,"CLOSED_M5_ACCEPTED");
 assert.equal(ing.ingest(x,{receivedAt:at}).state,"DUPLICATE_IGNORED");
 assert.equal(ing.health().barCount,1);
});
test("different OHLC at same timestamp permanently holds ingestion until manual reconciliation",()=>{
 const ing=make(),at=START+FIVE+1000;
 ing.ingest(bar(0),{receivedAt:at});
 assert.equal(ing.ingest(bar(0,{high:106}),{receivedAt:at}).state,"CONFLICT_HELD");
 assert.equal(ing.ingest(bar(1),{receivedAt:START+2*FIVE+1000}).state,
  "HELD_REQUIRES_MANUAL_RECONCILIATION");
 assert.equal(ing.health().state,"HELD");
});
test("one absent M5 blocks the contiguous series, no synthetic candle fill",()=>{
 const ing=make();
 ing.ingest(bar(0),{receivedAt:START+FIVE+1000});
 const r=ing.ingest(bar(2),{receivedAt:START+3*FIVE+1000});
 assert.equal(r.state,"GAP_HELD_FOR_BACKFILL");
 assert.equal(r.expectedOpenedAt,START+FIVE);
 assert.equal(ing.snapshot().length,1);
});
test("out-of-order stale M5 is not appended and not used to fake a new H4",()=>{
 const ing=make();
 ing.ingest(bar(0),{receivedAt:START+FIVE+1000});
 ing.ingest(bar(1),{receivedAt:START+2*FIVE+1000});
 assert.equal(ing.ingest(bar(-1),{receivedAt:START+2*FIVE+1000}).state,
  "STALE_OR_REORDERED_HELD");
 assert.equal(ing.health().barCount,2);
});
test("feed symbol aliases do not become implicitly approved providers",()=>{
 const ing=make();
 assert.equal(ing.ingest(bar(0,{feedSymbol:"IC:EURUSD"}),{
  receivedAt:START+FIVE+1000}).state,"SOURCE_MAPPING_REJECTED");
 assert.equal(ing.ingest(bar(0,{provider:"SOMEONE_ELSE"}),{
  receivedAt:START+FIVE+1000}).state,"SOURCE_MAPPING_REJECTED");
});
test("reject LIVE mode and an unsupported crypto ticker without fabricated schedule",()=>{
 assert.throws(()=>new ClosedM5Ingestion({provider:"X",instrumentId:"EURUSD",
  feedSymbol:"EURUSD.REAL",mode:"LIVE"}),/forbidden/);
 assert.throws(()=>new ClosedM5Ingestion({provider:"X",instrumentId:"BTCUSD",
  feedSymbol:"BTCUSD.TEST"}),/unsupported/);
});
test("never accept an ordinary TradingView symbol as native backend feed mapping",()=>{
 assert.throws(()=>new ClosedM5Ingestion({provider:"X",instrumentId:"EURUSD",
  feedSymbol:"IC:EURUSD"}),/explicit provider/);
});
test("snapshot and health are read-only and do not imply live capability",()=>{
 const ing=make();
 ing.ingest(bar(0),{receivedAt:START+FIVE+1000});
 assert.ok(Object.isFrozen(ing.snapshot()));
 assert.ok(Object.isFrozen(ing.snapshot()[0]));
 assert.equal(ing.health().actionable,false);
});
test("capacity limit forces manual reconciliation rather than silently discarding history",()=>{
 const ing=make();
 for(let i=0;i<48;i++){
  assert.equal(ing.ingest(bar(i),{receivedAt:START+(i+1)*FIVE+1000}).state,
   "CLOSED_M5_ACCEPTED");
 }
 assert.equal(ing.ingest(bar(48),{receivedAt:START+49*FIVE+1000}).state,
  "CAPACITY_HELD_FOR_RECONCILIATION");
 assert.equal(ing.snapshot().length,48);
});
test("closed-bar UTC timestamp validation forbids malformed provider data",()=>{
 const ing=make();
 assert.throws(()=>ing.ingest(bar(0,{closedAt:START+FIVE+1}),{
  receivedAt:START+FIVE+1000}),/UTC timestamps/);
});
