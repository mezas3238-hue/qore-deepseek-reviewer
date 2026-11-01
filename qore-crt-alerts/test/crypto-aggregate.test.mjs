import test from "node:test";
import assert from "node:assert/strict";
import {aggregateClosedCryptoM5} from "../src/crypto-aggregate.mjs";
import {inspectCrtH4} from "../src/crt-h4.mjs";
const FIVE=300000;
const start=Date.parse("2026-10-31T00:00:00Z");
const bars=(t,n)=>Array.from({length:n},(_,i)=>({
 provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
 openedAt:t+i*FIVE,closedAt:t+(i+1)*FIVE,
 open:70000,high:70200,low:69900,close:70050
}));
test("48 BTC M5 exactly aggregate to UTC 4h probe, never approved C1",()=>{
 const x=aggregateClosedCryptoM5(bars(start,48),{timeframe:"H4"});
 assert.equal(x.complete.length,1);assert.equal(x.rejected.length,0);
 assert.equal(x.complete[0].openedAt,start);
 assert.equal(x.complete[0].closedAt,start+48*FIVE);
 assert.equal(x.complete[0].allowedC1,false);
 assert.equal(x.complete[0].c1Schedule,"NOT_APPROVED");
 assert.equal(x.sendPush,false);
});
test("BTC 24x7 M15 takes precisely three 5min observations",()=>{
 const x=aggregateClosedCryptoM5(bars(start,6),{timeframe:"M15"});
 assert.equal(x.complete.length,2);assert.equal(x.complete[1].openedAt,start+3*FIVE);
 assert.equal(x.complete[0].actionable,false);
});
test("missing BTC M5 rejects 4h rather than inventing a candle",()=>{
 const m=bars(start,48).filter((_,i)=>i!==12);
 const x=aggregateClosedCryptoM5(m,{timeframe:"H4"});
 assert.equal(x.complete.length,0);assert.equal(x.rejected.length,1);
 assert.equal(x.rejected[0].reason,"INCOMPLETE_CRYPTO_M5");
});
test("crypto time grouping UTC does not create or double a bar at NY DST fallback",()=>{
 const t=Date.parse("2026-11-01T04:00:00Z");
 const x=aggregateClosedCryptoM5(bars(t,48),{timeframe:"H4"});
 assert.equal(x.complete.length,1);assert.equal(x.complete[0].openedAt,t);
 assert.equal(x.complete[0].allowedC1,false);
});
test("BTCUSD C1/C2/C3 cannot ratify without a separately approved session",()=>{
 const t=start;
 const source=bars(t,144);
 const a=aggregateClosedCryptoM5(source,{timeframe:"H4"});
 assert.equal(a.complete.length,3);
 const r=inspectCrtH4({c1:a.complete[0],c2:a.complete[1],
  c3:a.complete[2],family:"crypto"});
 assert.equal(r.state,"UNSUPPORTED_FAMILY");
 assert.equal(r.actionable,false);
});
test("mixed providers, other instruments and unclosed groups rejected",()=>{
 const m=bars(start,48);
 assert.throws(()=>aggregateClosedCryptoM5([m[0],{...m[1],provider:"OTHER"}],
  {timeframe:"H4"}),/MIXED_CRYPTO_PROVIDERS/);
 assert.throws(()=>aggregateClosedCryptoM5([{...m[0],instrumentId:"EURUSD"}],
  {timeframe:"H4"}),/BTCUSD_ONLY/);
 assert.equal(aggregateClosedCryptoM5(m.slice(1),{timeframe:"H4"}).complete.length,0);
 assert.throws(()=>aggregateClosedCryptoM5(m,{timeframe:"H1"}),/UNSUPPORTED/);
});
