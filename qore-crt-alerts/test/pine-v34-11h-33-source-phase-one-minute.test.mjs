import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const path="../../crt-radar-pro/";
const load=n=>readFileSync(new URL(path+n,import.meta.url),"utf8");
const before=load("CRT_RADAR_PRO_V34_11G_H4_RAZONES_33_QA.pine");
const after=load("CRT_RADAR_PRO_V34_11H_FASE_PROVEEDOR_33_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const candle=300000,block=14400000,qaShift=60000;
const phase=t=>new Date(t).getUTCMinutes()%5;
function bucketNY_UTC(t,origin){ // dates far from DST jumps, UTC anchor = NY anchor + fixed 4h
 const ny=new Date(t-4*3600000),h=ny.getUTCHours();
 const n=h<origin?Math.floor((h+24-origin)/4)-6:Math.floor((h-origin)/4);
 return Date.UTC(ny.getUTCFullYear(),ny.getUTCMonth(),ny.getUTCDate(),
    origin+4*n+4,0,0);
}
function fullH4(times,anchor){
 const h4Start=times[0],h4End=times.at(-1)+candle;
 return times.length===48&&h4Start===anchor&&h4End===anchor+block&&
   times.every((t,i)=>i===0||t===times[i-1]+candle);
}
function fixture(start,minutes=48,step=candle){
 return Array.from({length:minutes},(_,i)=>start+i*step);
}
const nominal=Date.parse("2026-07-15T05:00:00-04:00");
const shifted=fixture(nominal+qaShift);
const btc=fixture(nominal);

test("Non-BTC has a guarded provider-native phase +1m experiment but BTC remains untouched",()=>{
 assert.ok(after.includes('qaPhase1NonBtc = input.bool(true, "QA: probar desfase +1m M5 en 33 (SIN ALERTAS)"'));
 assert.ok(after.includes('bool qaNativeM5Plus1 = qaPhase1NonBtc and not isBTC'));
 assert.ok(after.includes('minute(barT, TZ) % 5 == 1 and second(barT, TZ) == 0'));
 assert.ok(after.includes('int bucketH4 = bucketH4NY + (qaNativeM5Plus1 ? 60000 : 0)'));
 assert.ok(after.includes('isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)'));
 assert.ok(after.includes('f_btc_crt_h4_ny(int t) =>'));
 assert.ok(!engine(before).includes("qaNativeM5Plus1"));
});
test("Synthetic 48 contiguous +1m M5 make source-native 4h only, never falsely pass original :00",()=>{
 assert.equal(shifted.length,48);
 assert.equal(phase(shifted[0]),1);
 assert.equal(shifted[0]-nominal,60000);
 assert.equal(shifted.at(-1)+candle-(nominal+block),60000);
 assert.equal(fullH4(shifted,nominal),false);
 assert.equal(fullH4(shifted,nominal+qaShift),true);
 assert.equal(fullH4(btc,nominal),true);
 assert.equal(fullH4(btc,nominal+qaShift),false);
});
test("One missing/extra/non-consecutive closed M5 is rejected even after +1m phase alignment",()=>{
 const missing=shifted.filter((_,i)=>i!==13);
 assert.equal(fullH4(missing,nominal+qaShift),false);
 const extra=[...shifted,shifted.at(-1)+candle];
 assert.equal(fullH4(extra,nominal+qaShift),false);
 const broken=[...shifted];broken[19]+=candle;
 assert.equal(fullH4(broken,nominal+qaShift),false);
});
test("Only phase +1m is tested; +2m or +4m cannot be silently normalized",()=>{
 for(const value of [0,1,2,3,4]){
  const bar=nominal+value*60000;
  const allowed=value===1;
  assert.equal(phase(bar)===1,allowed);
  if(value!==1)assert.equal(fullH4(fixture(bar),nominal+60000),false);
 }
});
test("No new security calls or plots, historical QC gates remain strict",()=>{
 assert.equal((after.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((after.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((after.match(/request\.security\(/g)||[]).length,(before.match(/request\.security\(/g)||[]).length);
 assert.ok(after.includes('bool fullH4 = h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
 assert.ok(after.includes('bool c1CompleteData = h4Continuous and h4FirstT == h4Bucket'));
 assert.ok(after.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
 assert.ok(after.includes('useAlerts = input.bool(false'));
});
test("All realtime alerts remain impossible in QA phase mode EVEN if user enables alerts",()=>{
 assert.equal((after.match(/if useAlerts and not qaPhase1NonBtc and barstate\.isrealtime and alert5/g)||[]).length,1);
 assert.equal((after.match(/if useAlerts and not qaPhase1NonBtc and barstate\.isrealtime and alert15/g)||[]).length,1);
 assert.ok(after.includes('bool visible = (not qaPhase1NonBtc or chartBtcSymbol) and chartAvailable'));
 assert.ok(after.includes('"NO PUSH"'));
});
test("All 33 non-BTC rows report independently observed raw provider phase",()=>{
 assert.ok(after.includes('var array<int> auditFeedPhaseMin = array.new_int(34, na)'));
 assert.ok(after.includes('array.set(auditFeedPhaseMin, i, available ? s.qaLastM5PhaseMin : na)'));
 assert.ok(after.includes('int phase33 = array.get(auditFeedPhaseMin,i)'));
 assert.ok(after.includes('string clsWithPhase = cls33 + (not na(phase33) ? "+"+str.tostring(phase33) : "?")'));
 assert.ok(after.includes('if i != 7 and scanAll'));
 assert.ok(after.includes('int nonBtcRequested = scanAll ? 33 : 0'));
 assert.ok(after.includes('qaPhase1NonBtc ? "QA +1m" : "QA NY:00"'));
 assert.ok(after.includes('traceAllowed33 ? qaPhase1NonBtc ? "QA+1m" : "NY:00"'));
 assert.ok(!after.includes('input.float(1.0, "Tolerancia M5"'));
});
test("MSS15 cannot inherit M5 pivot after nonBTC source clock adjustment",()=>{
 assert.ok(after.includes('int bucket15 = qaNativeM5Plus1 ? timestamp(TZ, year(barT, TZ), month(barT, TZ), dayofmonth(barT, TZ), hour(barT, TZ), nativeM15Minute, 0) : time("15")[1]'));
 assert.ok(after.includes('bool fullM15 = m15Count == 3 and m15LastEnd == bucket15 and m15Start + MIN15 == m15LastEnd'));
 assert.ok(after.includes('int qaLastM5PhaseMin = not na(barT) ? minute(barT, TZ) % 5 : na'));
});

test("source native +1m M15 quarter buckets are :01/:16/:31/:46, not normal NY :00/:15",()=>{
 const quarter=m=>Math.floor(m/15)*15+1;
 assert.deepEqual([1,6,11,16,21,26,31,36,41,46,51,56].map(quarter),
  [1,1,1,16,16,16,31,31,31,46,46,46]);
 assert.ok(after.includes('int nativeM15Minute = int(math.floor(minute(barT, TZ) / 15)) * 15 + 1'));
 assert.ok(after.includes('int bucketH1 = qaNativeM5Plus1 ? timestamp(TZ, year(barT, TZ), month(barT, TZ), dayofmonth(barT, TZ), hour(barT, TZ), 1, 0) : time("60")[1]'));
});
test("Independent MSS M15 causal times require matching closed native phase without tolerating M5-only timestamps",()=>{
 assert.ok(after.includes('f_m15_phase_ok(int closedAt, bool sourcePhase1Qa) =>'));
 assert.ok(after.includes('closedAt % MIN15 == (sourcePhase1Qa ? 60000 : 0)'));
 assert.ok(after.includes('f_m15_phase_ok(outM15At, qaNativeM5Plus1)'));
 assert.ok(after.includes('f_m15_phase_ok(extraMssAt, qaNativeM5Plus1)'));
 assert.ok(after.includes('f_m15_phase_ok(s.extraFamilyM15At, s.qaPhase1Active)'));
 assert.ok(after.includes('f_m15_phase_ok(own.m15At, own.qaPhase1Active)'));
 assert.ok(after.includes('closed15At == bucket15 and f_m15_phase_ok(closed15At, qaNativeM5Plus1)'));
 assert.ok(after.includes('bool fullM15 = m15Count == 3 and m15LastEnd == bucket15 and m15Start + MIN15 == m15LastEnd'));
 for(const t of [1,16,31,46]){
  const ms=t*60000;
  assert.equal(ms%900000,60000);
  assert.notEqual(ms%900000,0);
 }
});
test("If native M15 phase differs from observed M5 phase, no invented MSS passes",()=>{
 const proof=(closedAt,phase)=>closedAt%900000===(phase===1?60000:0);
 assert.equal(proof(16*60000,1),true);
 assert.equal(proof(15*60000,1),false);
 assert.equal(proof(16*60000,0),false);
 assert.equal(proof(15*60000,0),true);
 assert.equal(proof(5*60000,1),false);
});
