import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_11J_FASE_NATIVA_33_QA_NO_LIVE.pine");
const now=load("CRT_RADAR_PRO_V34_11K_CRT_48M5_H4_CERRADA_QA_NO_LIVE.pine");
const M5=300000,H4=14400000;
const make=(start,n=48)=>Array.from({length:n},(_,i)=>start+i*M5);
function complete(t,anchor){
 return t.length===48&&t[0]===anchor&&t.at(-1)+M5===anchor+H4&&
 t.every((time,i)=>i===0||time===t[i-1]+M5);
}
test("V34.11j falsely allows >=25 M5 for non-BTC C1/C2 despite fullH4 false",()=>{
 assert.ok(old.includes('minBarsC1 = input.int(25'));
 assert.ok(old.includes('minBarsC2 = input.int(25'));
 assert.ok(old.includes('h4Count >= minBarsC1'));
 assert.ok(old.includes('h4Count >= minBarsC2'));
 const phase1=Date.parse("2026-07-15T05:01:00-04:00");
 const partial=make(phase1,27);
 assert.equal(partial.length>=25,true);
 assert.equal(complete(partial,phase1),false);
});
test("C1,C2,C3,Inside close, and Inside lifecycle ALL reuse exactly one strict fullH4",()=>{
 const expected=[
 'bool c1CompleteData = fullH4',
 'bool validC2Data = fullH4',
 'bool validC3Close = fullH4',
 'bool closedH4Complete = fullH4',
 'bool insideH4Closed = fullH4',
 ];
 for(const x of expected)assert.ok(now.includes(x),x);
 assert.ok(now.includes('bool fullH4 = h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
 assert.ok(!now.includes('minBarsC1'));
 assert.ok(!now.includes('minBarsC2'));
 assert.ok(!now.includes('h4Count >='));
 assert.ok(now.includes('if invalidAtC3Close or not validC3Close'));
 assert.ok(now.includes('if (invalidAtC3Close or not validC3Close) and lastC1 == c1Start3'));
});
test("Every native source phase 0..4 needs 48 CLOSED contiguous M5, no truncation",()=>{
 const base=Date.parse("2026-07-15T05:00:00-04:00");
 for(let phase=0;phase<=4;phase++){
  const a=base+phase*60000;
  const full=make(a);
  assert.equal(complete(full,a),true);
  assert.equal(complete(make(a,25),a),false);
  assert.equal(complete(make(a,47),a),false);
  assert.equal(complete(make(a,49),a),false);
  assert.equal(complete(make(a+M5,48),a),false);
  const gap=[...full];gap[16]+=M5;
  assert.equal(complete(gap,a),false);
  const wrong=[...full];wrong[0]+=60000;
  assert.equal(complete(wrong,a),false);
 }
});
test("BTC independent calendar and 33 unique providers persist, no artificial alerts or plots",()=>{
 assert.ok(now.includes('int bucketH4NY = isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)'));
 assert.ok(now.includes('int bucketH4 = bucketH4NY + qaNativeSourcePhaseMin * 60000'));
 assert.ok(now.includes('qaPhase1NonBtc and not isBTC'));
 assert.ok(now.includes('f_m15_phase_ok(int closedAt, int sourcePhaseMin)'));
 assert.ok(now.includes('sourcePhaseMin >= 0 and sourcePhaseMin <= 4'));
 assert.ok(now.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
 assert.equal((now.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((now.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((now.match(/request\.security\(/g)||[]).length,(old.match(/request\.security\(/g)||[]).length);
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert5'));
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(now.includes('"NO PUSH"'));
});
test("The five strict replaces are the only changed H4 detection gates from V34.11j",()=>{
 const normalize=s=>s
  .replace('bool c1CompleteData = fullH4',
   'bool c1CompleteData = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4 and (isBTC ? (h4Count == 48 and bucketH4 - h4Bucket == H4MS) : h4Count >= minBarsC1)')
  .replace('bool validC2Data = fullH4',
   'bool validC2Data = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4 and (isBTC ? (h4Count == 48 and bucketH4 - h4Bucket == H4MS) : h4Count >= minBarsC2)')
  .replace('bool validC3Close = fullH4',
   'bool validC3Close = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4 and (isBTC ? (h4Count == 48 and bucketH4 - h4Bucket == H4MS) : h4Count >= minBarsC2)')
  .replace('bool closedH4Complete = fullH4',
   'bool closedH4Complete = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4 and h4Count >= minBarsC2')
  .replace('bool insideH4Closed = fullH4',
   'bool insideH4Closed = h4Continuous and h4FirstT == h4Bucket and h4Count >= minBarsC2 and (h4LastEnd == bucketH4 or h4LastEnd == h4Bucket + H4MS)')
  .replaceAll('if invalidAtC3Close or not validC3Close','if invalidAtC3Close or (isBTC and not validC3Close)')
  .replaceAll('if (invalidAtC3Close or not validC3Close) and lastC1 == c1Start3','if (invalidAtC3Close or (isBTC and not validC3Close)) and lastC1 == c1Start3');
 const engine=s=>s.slice(s.indexOf('f_engine() =>'),s.indexOf('f_engine_snapshot() =>'));
 assert.equal(normalize(engine(now)),engine(old));
});
