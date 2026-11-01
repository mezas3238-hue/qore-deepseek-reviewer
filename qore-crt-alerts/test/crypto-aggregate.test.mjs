import test from "node:test";
import assert from "node:assert/strict";
import {aggregateClosedCryptoM5} from "../src/crypto-aggregate.mjs";
import {inspectCrtH4} from "../src/crt-h4.mjs";
import {nyParts} from "../src/ny-clock.mjs";
const FIVE=300000;
const SATURDAY_C1=Date.parse("2026-10-31T05:00:00Z"); // Sat 01 NY EDT
const bars=(t,n)=>Array.from({length:n},(_,i)=>({
 provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
 openedAt:t+i*FIVE,closedAt:t+(i+1)*FIVE,
 open:70000,high:70200,low:69900,close:70050
}));
test("Bitcoin 48 M5 form completed H4 01:00 NY weekend C1",()=>{
 const x=aggregateClosedCryptoM5(bars(SATURDAY_C1,48),{timeframe:"H4"});
 assert.equal(x.complete.length,1);assert.equal(x.rejected.length,0);
 assert.equal(x.complete[0].openedAt,SATURDAY_C1);
 assert.equal(x.complete[0].nyHour,1);
 assert.equal(x.complete[0].allowedC1,true);
 assert.equal(x.complete[0].c1Schedule,"FOREX_NY_OWNER_APPROVED");
 assert.equal(x.complete[0].aggregationAnchor,"NY_FOREX_H4");
 assert.equal(x.sendPush,false);
});
test("BTCUSD 24x7 M15 takes exactly three M5 candles",()=>{
 const x=aggregateClosedCryptoM5(bars(SATURDAY_C1,6),{timeframe:"M15"});
 assert.equal(x.complete.length,2);
 assert.equal(x.complete[1].openedAt,SATURDAY_C1+3*FIVE);
 assert.equal(x.complete[0].actionable,false);
});
test("Bitcoin missing M5 rejects H4 without fake gap filling",()=>{
 const m=bars(SATURDAY_C1,48).filter((_,i)=>i!==12);
 const x=aggregateClosedCryptoM5(m,{timeframe:"H4"});
 assert.equal(x.complete.length,0);assert.equal(x.rejected.length,1);
 assert.equal(x.rejected[0].reason,"INCOMPLETE_OR_DST_AMBIGUOUS");
});
test("Bitcoin Sunday DST fallback repeated NY hour quarantines ambiguous H4",()=>{
 const t=Date.parse("2026-11-01T05:00:00Z"); // first 01:00 NY
 const x=aggregateClosedCryptoM5(bars(t,60),{timeframe:"H4"});
 assert.equal(x.complete.length,0);
 assert.ok(x.rejected.length>=1);
 assert.equal(x.sendPush,false);
});
test("BTCUSD winter and summer 01 NY follow IANA DST rules",()=>{
 const winter=Date.parse("2026-11-02T06:00:00Z");
 const summer=Date.parse("2026-07-04T05:00:00Z");
 for(const t of [winter,summer]){
   assert.equal(nyParts(t).hour,1);
   const x=aggregateClosedCryptoM5(bars(t,48),{timeframe:"H4"});
   assert.equal(x.complete.length,1);
   assert.equal(x.complete[0].nyHour,1);
   assert.equal(x.complete[0].allowedC1,true);
 }
});
test("BTCUSD C1 01, C2 05, C3 09 3 consecutive H4 are compatible",()=>{
 const m=bars(SATURDAY_C1,144);
 const a=aggregateClosedCryptoM5(m,{timeframe:"H4"});
 assert.equal(a.complete.length,3);
 assert.deepEqual(a.complete.map(b=>b.nyHour),[1,5,9]);
 const r=inspectCrtH4({c1:a.complete[0],c2:a.complete[1],
  c3:a.complete[2],family:"crypto"});
 assert.equal(r.state,"NO_STRICT_SWEEP");
 assert.equal(r.actionable,false);
});
test("source mismatch and another ticker rejected from BTC-only aggregator",()=>{
 const m=bars(SATURDAY_C1,48);
 assert.throws(()=>aggregateClosedCryptoM5([m[0],{...m[1],provider:"OTHER"}],
  {timeframe:"H4"}),/MIXED_CRYPTO_PROVIDERS/);
 assert.throws(()=>aggregateClosedCryptoM5([{...m[0],instrumentId:"EURUSD"}],
  {timeframe:"H4"}),/BTCUSD_ONLY/);
 assert.equal(aggregateClosedCryptoM5(m.slice(1),{timeframe:"H4"}).complete.length,0);
 assert.throws(()=>aggregateClosedCryptoM5(m,{timeframe:"H1"}),/UNSUPPORTED/);
});
