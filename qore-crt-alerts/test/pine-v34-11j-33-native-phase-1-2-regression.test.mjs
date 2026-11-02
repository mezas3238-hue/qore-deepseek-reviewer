import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>readFileSync(new URL("../../crt-radar-pro/"+name,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_11I_CATALOGO_QA_NO_SENALES_33.pine");
const now=load("CRT_RADAR_PRO_V34_11J_FASE_M5_1_2_33_QA.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const M5=300000,H4=14400000,M15=900000;
const start=Date.parse("2026-07-15T05:00:00-04:00");
const m5=(phase,count=48)=>Array.from({length:count},(_,i)=>start+phase*60000+i*M5);
function h4Valid(times,phase){
 const t0=start+phase*60000;
 return times.length===48&&times[0]===t0&&times.at(-1)+M5===t0+H4&&
   times.every((t,i)=>!i||t===times[i-1]+M5);
}
const nativePhase=(ms,btc=false,qa=true)=>{
 const m=new Date(ms).getUTCMinutes()%5;
 return qa&&!btc&&(m===1||m===2)?m:0;
};
const m15Valid=(closed,phase)=>[0,1,2].includes(phase)&&closed%M15===phase*60000;

test("33-market native phase 0/1/2 is per-feed, not copied from NZDCAD, and BTC stays at 0",()=>{
 assert.deepEqual([0,1,2,3,4].map(n=>nativePhase(start+n*60000)),[0,1,2,0,0]);
 assert.deepEqual([1,2].map(n=>nativePhase(start+n*60000,true)),[0,0]);
 assert.equal(nativePhase(start+2*60000,false,false),0);
 assert.ok(now.includes('qaLastM5PhaseMin == 1 or qaLastM5PhaseMin == 2'));
 assert.ok(now.includes('qaPhase1NonBtc and not isBTC'));
 assert.ok(now.includes('qaNativeM5OffsetMin = qaNativeM5Shifted ? qaLastM5PhaseMin : 0'));
 assert.ok(now.includes('int bucketH4 = bucketH4NY + qaNativeM5OffsetMin * 60000'));
});
test("48 strict M5 in H4 from +1 or +2 can align; 47, 49 and breaks never pass",()=>{
 for(const phase of [0,1,2]){
   const bars=m5(phase);
   assert.equal(h4Valid(bars,phase),true);
   assert.equal(h4Valid(bars,phase===2?1:2),false);
   assert.equal(h4Valid(bars.slice(0,-1),phase),false);
   assert.equal(h4Valid([...bars,bars.at(-1)+M5],phase),false);
   const bad=[...bars];bad[10]+=M5;
   assert.equal(h4Valid(bad,phase),false);
 }
 assert.ok(now.includes('h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
});
test("independent closed M15 anchors 0/1/2 never accept a wrong quarter boundary or M5-only timestamp",()=>{
 assert.ok(now.includes('f_m15_phase_ok(int closedAt, int nativePhaseMin) =>'));
 assert.ok(now.includes('nativePhaseMin == 0 or nativePhaseMin == 1 or nativePhaseMin == 2'));
 assert.ok(now.includes('closedAt % MIN15 == nativePhaseMin * 60000'));
 assert.ok(now.includes('int nativeM15Minute = int(math.floor(minute(barT, TZ) / 15)) * 15 + qaNativeM5OffsetMin'));
 assert.ok(now.includes('int bucketH1 = qaNativeM5Shifted ? timestamp('));
 assert.ok(now.includes('int bucket15 = qaNativeM5Shifted ? timestamp('));
 for(const phase of [0,1,2]){
   for(const n of [0,15,30,45]){
    const ms=(n+phase)*60000;
    assert.equal(m15Valid(ms,phase),true);
    for(const other of [0,1,2]){
      if(other!==phase)assert.equal(m15Valid(ms,other),false);
    }
    assert.equal(m15Valid(ms+5*60000,phase),false);
   }
 }
 assert.equal(m15Valid(17*60000,2),true);
 assert.equal(m15Valid(16*60000,2),false);
 assert.equal(m15Valid(17*60000,1),false);
 assert.equal(m15Valid(2*60000,3),false);
});
test("C1/C2/C3 and true MSS15 remain strict and never inherit M5 confirmation",()=>{
 assert.ok(now.includes('bool fullM15 = m15Count == 3 and m15LastEnd == bucket15 and m15Start + MIN15 == m15LastEnd'));
 assert.ok(now.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
 assert.ok(now.includes('f_m15_phase_ok(closed15At, qaNativeM5OffsetMin)'));
 assert.ok(now.includes('f_m15_phase_ok(outM15At, qaNativeM5OffsetMin)'));
 assert.ok(now.includes('f_m15_phase_ok(extraMssAt, qaNativeM5OffsetMin)'));
 for(const scope of ['s','own']){
   assert.ok(now.includes(`${scope}.qaPhase1Active ? ${scope}.qaLastM5PhaseMin : 0`));
 }
 assert.ok(now.includes('qaLastM5PhaseMin, qaNativeM5Shifted)'));
});
test("BTC/alerts/plot request budgets and 7 catalog uncertified labels stay fixed",()=>{
 assert.equal((now.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((now.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((now.match(/request\.security\(/g)||[]).length,(old.match(/request\.security\(/g)||[]).length);
 assert.ok(now.includes('f_btc_crt_h4_ny(barT)'));
 assert.ok(now.includes('bool qaNativeM5Shifted = qaPhase1NonBtc and not isBTC'));
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert5'));
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(now.includes('"3C M15 QA"'));
 assert.ok(!now.includes('"3C M15✓"'));
 assert.ok(now.includes('bool scanCrtValid = available and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(now.includes('bool visible = (not qaPhase1NonBtc or chartBtcSymbol)'));
 assert.ok(now.includes('qaPhase1NonBtc ? "QA +1/2"'));
 assert.ok(now.includes('"NO PUSH"'));
});
test("No old +1-only variables or malformed catalog Pine indentation",()=>{
 assert.ok(!now.includes('qaNativeM5Plus1'));
 const lines=now.split("\n"),i=lines.findIndex(x=>x.includes("bool catM15Observed ="));
 assert.ok(i>0);
 for(const index of [i-2,i-1,i,i+1,i+2])assert.equal(
  (lines[index].match(/^ */)||[""])[0].length,20);
});
