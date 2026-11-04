import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const pine=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=pine("CRT_RADAR_PRO_V34_11I_CATALOGO_QA_NO_SENALES_33.pine");
const next=pine("CRT_RADAR_PRO_V34_11J_FASE_NATIVA_33_QA_NO_LIVE.pine");
const H4=14400000,M5=300000,M15=900000;
const sourcePhase=t=>new Date(t).getUTCMinutes()%5;
const observed=(base,p)=>Array.from({length:48},(_,i)=>base+p*60000+i*M5);
const valid=(bars,base,p)=>bars.length===48&&bars[0]===base+p*60000&&
 bars.at(-1)+M5===base+p*60000+H4&&
 bars.every((x,i)=>i===0||x===bars[i-1]+M5);
const phaseM15=(closeAt,p)=>closeAt%M15===p*60000;

test("All 33 non-BTC feeds have their own 0..4 observed source minute, independent BTC path",()=>{
 assert.ok(next.includes('int qaLastM5PhaseMin = not na(barT) ? minute(barT, TZ) % 5 : na'));
 assert.ok(next.includes('int qaNativeSourcePhaseMin = qaPhase1NonBtc and not isBTC and not na(barT) and second(barT, TZ) == 0 ? qaLastM5PhaseMin : 0'));
 assert.ok(next.includes('isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)'));
 assert.ok(next.includes('int bucketH4 = bucketH4NY + qaNativeSourcePhaseMin * 60000'));
 assert.ok(!next.includes('bool qaNativeM5Plus1'));
 assert.ok(next.includes('i != 7 and scanAll'));
 assert.ok(next.includes('int nonBtcRequested = scanAll ? 33 : 0'));
});
test("Forex +1 and XAUUSD +2 are distinct, exact 48-M5 H4 cohorts",()=>{
 const base=Date.parse("2026-07-15T05:00:00-04:00");
 const fx=observed(base,1),metal=observed(base,2);
 assert.equal(fx.length,48);assert.equal(metal.length,48);
 assert.equal(sourcePhase(fx[0]),1);
 assert.equal(sourcePhase(metal[0]),2);
 assert.equal(valid(fx,base,1),true);assert.equal(valid(fx,base,2),false);
 assert.equal(valid(metal,base,2),true);assert.equal(valid(metal,base,1),false);
 assert.equal(valid(metal,base,0),false);
});
test("Zero through four native phases are evaluated per source without a cross-feed correction",()=>{
 const base=Date.parse("2026-07-15T05:00:00-04:00");
 for(let p=0;p<5;p++){
  const bars=observed(base,p);
  assert.equal(valid(bars,base,p),true);
  for(let other=0;other<5;other++){
   if(other!==p)assert.equal(valid(bars,base,other),false);
  }
  assert.equal(sourcePhase(bars[0]),p);
 }
});
test("Never certify a native source H4 when any M5 is missing, extra or discontinuous",()=>{
 const base=Date.parse("2026-07-15T05:00:00-04:00");
 for(const phase of [0,1,2,3,4]){
  const bars=observed(base,phase);
  assert.equal(valid(bars.filter((_,i)=>i!==13),base,phase),false);
  assert.equal(valid([...bars,bars.at(-1)+M5],base,phase),false);
  const broken=[...bars];broken[25]+=60000;
  assert.equal(valid(broken,base,phase),false);
 }
});
test("M15 native source phase closes exactly :02/:17/:32/:47 for +2",()=>{
 const floorToQuarter=(minute,phase)=>Math.floor(minute/15)*15+phase;
 assert.deepEqual([2,7,12,17,22,27,32,37,42,47,52,57].map(m=>floorToQuarter(m,2)),
  [2,2,2,17,17,17,32,32,32,47,47,47]);
 assert.ok(next.includes('int nativeM15Minute = int(math.floor(minute(barT, TZ) / 15)) * 15 + qaNativeSourcePhaseMin'));
 assert.ok(next.includes('int bucket15 = qaNativeSourcePhaseMin > 0 ? timestamp(TZ'));
 assert.ok(next.includes('int bucketH1 = qaNativeSourcePhaseMin > 0 ? timestamp(TZ'));
 assert.ok(next.includes('hour(barT, TZ), qaNativeSourcePhaseMin, 0) : time("60")[1]'));
 for(const p of [0,1,2,3,4]){
  for(const minute of [0,15,30,45]){
   assert.equal(phaseM15((minute+p)*60000,p),true);
   assert.equal(phaseM15((minute+(p+1)%5)*60000,p),false);
  }
 }
});
test("Every independent MSS15 gate consumes int source phase; no M5/M15 conflation",()=>{
 assert.ok(next.includes('f_m15_phase_ok(int closedAt, int sourcePhaseMin) =>'));
 assert.ok(next.includes('sourcePhaseMin >= 0 and sourcePhaseMin <= 4'));
 assert.ok(next.includes('closedAt % MIN15 == sourcePhaseMin * 60000'));
 assert.ok(next.includes('f_m15_phase_ok(closed15At, qaNativeSourcePhaseMin)'));
 assert.ok(next.includes('f_m15_phase_ok(extraMssAt, qaNativeSourcePhaseMin)'));
 assert.ok(next.includes('f_m15_phase_ok(s.extraFamilyM15At, s.qaSourcePhaseMin)'));
 assert.ok(next.includes('f_m15_phase_ok(own.m15At, own.qaSourcePhaseMin)'));
 assert.ok(next.includes('int qaSourcePhaseMin'));
 assert.ok(!next.includes('bool qaPhase1Active'));
 assert.ok(next.includes('m15Count == 3 and m15LastEnd == bucket15'));
 assert.ok(next.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
});
test("BTCUSD original H4 and MSS source 0; QA experiment never becomes a live signal",()=>{
 assert.ok(next.includes('qaPhase1NonBtc and not isBTC'));
 assert.ok(next.includes('bool scanCrtValid = available and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(next.includes('bool certifiedCRT = (not qaPhase1NonBtc or i == 7)'));
 assert.ok(next.includes('bool ownCRTValid = (not qaPhase1NonBtc or chartBtcSymbol)'));
 assert.ok(next.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert5'));
 assert.ok(next.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(next.includes('"3C M15 QA"'));
 assert.ok(!next.includes('"3C M15✓"'));
 assert.ok(next.includes('"NO PUSH"'));
});
test("No request/plot budget regression or runtime claims from unit tests",()=>{
 assert.equal((next.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((next.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((old.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((next.match(/request\.security\(/g)||[]).length,(old.match(/request\.security\(/g)||[]).length);
 assert.ok(next.includes('calc_bars_count=1500'));
 assert.ok(next.includes('useAlerts = input.bool(false'));
 assert.ok(next.includes('"QA FASE"'));
 assert.ok(next.includes('int phase33 = array.get(auditFeedPhaseMin,i)'));
 assert.ok(next.includes('string clsWithPhase = cls33 + (not na(phase33) ? "+"+str.tostring(phase33) : "?")'));
});
