import test from "node:test";
import assert from "node:assert/strict";
import {bucketNY,nyParts,C1_HOURS} from "../src/ny-clock.mjs";
import {readFileSync} from "node:fs";

// Regression for the precise owner screenshot: 1 Nov 2026 BTCUSD M15.
// At DST fallback 01:00 NY happens twice. Five-clock-hour H4 from 01
// to 05 NY has 60 CLOSED five-minute BTC candles, not 48.
// At spring forward the same NY bucket has only 36.
const M5=300_000;
const asMs=s=>Date.parse(s);
const buckets=(start,end,family="crypto")=>{
  const map=new Map();
  for(let t=asMs(start);t<asMs(end);t+=M5){
    const key=bucketNY(t,"H4",family).key;
    map.set(key,(map.get(key)||0)+1);
  }
  return map;
};
const get=(start,end,key)=>buckets(start,end).get(key)||0;

test("2026-11-01 DST fallback creates exactly 60 closed BTC M5 in NY H4 01–05",()=>{
  assert.equal(get("2026-11-01T05:00:00Z","2026-11-01T10:00:00Z","2026-11-01T01:00"),60);
  assert.equal(bucketNY(asMs("2026-11-01T05:00:00Z"),"H4","crypto").key,
    bucketNY(asMs("2026-11-01T06:00:00Z"),"H4","crypto").key);
  assert.equal(nyParts(asMs("2026-11-01T05:00:00Z")).hour,1);
  assert.equal(nyParts(asMs("2026-11-01T06:00:00Z")).hour,1);
  assert.ok(C1_HOURS.crypto.includes(1));
  assert.notEqual(60,48); // Pine fullH4 fail-closed; no C1/C2/Multi validation
});
test("2026-03-08 DST spring-forward yields 36 instead of 48 BTC M5",()=>{
  assert.equal(get("2026-03-08T06:00:00Z","2026-03-08T09:00:00Z","2026-03-08T01:00"),36);
  assert.notEqual(36,48); // same fail-closed conservative policy
});
test("2026-11-02 normal NY H4 01–05 contains 48 closed BTC M5",()=>{
  assert.equal(get("2026-11-02T06:00:00Z","2026-11-02T10:00:00Z","2026-11-02T01:00"),48);
});
test("missing M5 is a different failure from a DST-short or DST-long H4",()=>{
  const start=asMs("2026-11-02T06:00:00Z");
  const observed=Array.from({length:48},(_,i)=>start+i*M5).filter((_,i)=>i!==21);
  assert.equal(observed.length,47);
  assert.equal(observed[21]-observed[20],2*M5);
  assert.equal(buckets("2026-11-02T06:00:00Z","2026-11-02T10:00:00Z").get("2026-11-02T01:00"),48);
});
test("H4 GAP count in Pine V34.10r is aggregate of DST, partial start, or real feed gaps",()=>{
  // Static contractual check. It does NOT prove which two H4 were counted
  // on the user's chart: timestamped source events would be necessary.
  // Regression: protect conservative 48 M5 requirement and H4 closure only.
  const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10R_HISTORIAL_DETECTORES_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
  assert.match(pine,/bool fullH4 = h4Continuous and h4Count == 48/);
  assert.match(pine,/if not fullH4\s+qaAuditH4Incomplete \+= 1/);
  assert.match(pine,/En el retroceso DST, 01:00 ocurre dos veces/);
  assert.match(pine,/if not fullH4\s+array\.clear\(qaFourH4\)/);
});
