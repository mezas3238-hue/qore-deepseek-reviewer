import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const lines=src.split("\n");
const MIN5=300_000;
const gap=(start,prevEnd)=>start!==null&&prevEnd!==null&&start!==prevEnd;
const crossing=(previous,current,pivot,dir)=>dir===1 ? current>pivot&&previous<=pivot : current<pivot&&previous>=pivot;
const mss=(prevM5End,currentStart,prevClose,currentClose,pivot,dir,sweepEnd,barEnd)=>(
 !gap(currentStart,prevM5End) && prevM5End!==null && currentStart!==null &&
 currentStart>=sweepEnd&&barEnd>sweepEnd &&
 crossing(prevClose,currentClose,pivot,dir)
);
test("SOURCE: shared M5 continuity guard requires matching timestamp ends",()=>{
 assert.match(src,/bool previousM5Continuous = not na\(barT\) and not na\(previousBarEnd\) and barT == previousBarEnd/);
});
test("SOURCE: M5 MSS in C2 cannot cross discontinuity",()=>{
 assert.match(src,/if c2StrictSweep and previousM5Continuous and barT >= c2SweepEnd and cross5 and na\(c2M5At\)/);
});
test("SOURCE: M5 MSS in C3 cannot cross discontinuity",()=>{
 assert.match(src,/if c3Active and previousM5Continuous and barEnd > c3Start and barEnd > c3SweepEnd and cross5c3 and na\(c3M5At\)/);
});
test("SOURCE: M15 accumulator and swing history reset on missing M5",()=>{
 const a=src.split("    // QA: al aparecer una nueva M5 despues de un hueco")[1].split("    // ---- CERRAR M15 ANTERIOR ----")[0];
 assert.ok(a.includes("if not previousM5Continuous and not na(barT)"));
 for(const s of ["m15Bucket := na","m15Count := 0","m15LastEnd := na","m15Start := na","prev15Close := na","prev15End := na",
   "array.clear(highs15)","array.clear(lows15)","array.clear(times15)","lastHigh15At := na","lastLow15At := na"])assert.ok(a.includes(s),s);
});
test("SOURCE: M5 gap must reset M15 before its state transition",()=>{
 const gapIndex=src.indexOf("    // QA: al aparecer una nueva M5 despues de un hueco");
 const m15Index=src.indexOf("    // ---- CERRAR M15 ANTERIOR ----");
 assert.ok(gapIndex>0&&m15Index>gapIndex);
});
test("SOURCE: C1/C2/C3 + alerts + independent FVG unchanged",()=>{
 for(const word of ["bool strictLow = bL < c1Low2","bool strictHigh = bH > c1High2",
 "int outPhase = c3Active ? 2", "bool certifiedCRT = st == 2",
 "f_update_context_fvg(zoneH1", "f_update_context_fvg(zoneH4","session.islastbar[1]"])
 assert.ok(src.includes(word),word);
});
test("SOURCE: no added request feeds, only 34+own potential contexts",()=>{
 assert.equal(lines.filter(s=>s.includes("request.security(")&&!s.trimStart().startsWith("//")).length,2);
 assert.equal(lines.filter(s=>/^s\d\d = input\.symbol/.test(s)).length,34);
});
test("MODEL: valid M5 bullish close across consecutive bars triggers",()=>{
 assert.equal(mss(MIN5,MIN5,99,102,100,1,MIN5-10,2*MIN5),true);
});
test("MODEL: valid M5 bearish close across consecutive bars triggers",()=>{
 assert.equal(mss(MIN5,MIN5,101,98,100,-1,MIN5-10,2*MIN5),true);
});
test("MODEL: missing one M5 blocks bullish synthetic crossing",()=>{
 assert.equal(mss(MIN5,2*MIN5,99,102,100,1,MIN5-10,3*MIN5),false);
});
test("MODEL: missing one M5 blocks bearish synthetic crossing",()=>{
 assert.equal(mss(MIN5,2*MIN5,101,98,100,-1,MIN5-10,3*MIN5),false);
});
test("MODEL: missing two M5 bars blocks crossing",()=>{
 assert.equal(mss(MIN5,3*MIN5,99,102,100,1,MIN5-10,4*MIN5),false);
});
test("MODEL: legitimate weekend reopening must not cross Friday price",()=>{
 assert.equal(mss(MIN5,72*60*60_000,99,102,100,1,MIN5-10,72*60*60_000+MIN5),false);
});
test("MODEL: no previous M5 at history start must not trigger",()=>{
 assert.equal(mss(null,0,99,102,100,1,0,MIN5),false);
});
test("MODEL: strict close at pivot is not crossing",()=>{
 assert.equal(mss(MIN5,MIN5,99,100,100,1,MIN5-10,2*MIN5),false);
});
test("MODEL: no new crossing if preceding close already above pivot",()=>{
 assert.equal(mss(MIN5,MIN5,101,102,100,1,MIN5-10,2*MIN5),false);
});
test("MODEL: rejection if MSS occurs before C2 sweep",()=>{
 assert.equal(mss(MIN5,MIN5,99,102,100,1,2*MIN5,2*MIN5),false);
});
test("MODEL: first M5 following sweep is allowed if continuous",()=>{
 assert.equal(mss(MIN5,MIN5,99,101,100,1,MIN5,2*MIN5),true);
});
test("MODEL: after one gap the next contiguous M5 may produce valid fresh cross",()=>{
 assert.equal(mss(3*MIN5,3*MIN5,99,101,100,1,2*MIN5,4*MIN5),true);
});
test("MODEL: future clock gap produces no cross",()=>{
 assert.equal(mss(3*MIN5,4*MIN5,99,101,100,1,2*MIN5,5*MIN5),false);
});
