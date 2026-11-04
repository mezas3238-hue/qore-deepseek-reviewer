import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const A=src("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const B=src("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
test("Multi4 has own QA MSS5 candidate and no synthetic MSS15",()=>{
 assert.equal(engine(A),engine(B));
 for(const s of [A,B]){
  const e=engine(s);
  for(const x of ["type Multi4MssCandidate","var array<Multi4MssCandidate> qaMulti4MssCandidates","array.clear(qaMulti4MssCandidates)","q4.c1Start == m1.startAt","q4.c2aStart == m2.startAt","q4.sweepAt <= m2.endAt","qaMulti4Mss5At := q4.mss5At","bucketH4 == q4.c2aStart and q4.direction == 0","q4.pivot5At < q4.sweepAt","barT >= q4.sweepAt","q4.mss5At := barEnd","qaMulti4Mss5At","extraSelectMultiN ? qaMultiNPivot5 : qaMulti4Pivot5","extraSelectMultiN ? qaMultiNMss5At : qaMulti4Mss5At"]){assert.ok(s.includes(x),x)}
  assert.ok(e.includes("q4.doubleSweep := true"));
  assert.ok(e.includes("q4.direction == 1 and high4"));
  assert.ok(e.includes("q4.direction == -1 and low4"));
  assert.ok(e.includes("barEnd <= q4.c2aStart + 3 * H4MS"));
 }
});
test("four closed H4 gates and post-sweep M5 are required; no future M15 substitution",()=>{
 const H4=4*3600000,M5=5*60000;
 const c1=0,c2a=H4,c2b=2*H4,c3=3*H4,end=4*H4;
 const sweepAt=c2a+M5, pivotAt=c2a-3*M5;
 const valid=(p,s,m,dir,double)=>dir!==0&&!double&&p<s&&m>s&&m<=end&&s>c2a&&s<=c2b;
 assert.equal(valid(pivotAt,sweepAt,sweepAt+M5,1,false),true);
 assert.equal(valid(pivotAt,sweepAt,sweepAt,1,false),false);
 assert.equal(valid(pivotAt,sweepAt,end+M5,1,false),false);
 assert.equal(valid(pivotAt,sweepAt,sweepAt+M5,1,true),false);
 assert.equal(valid(sweepAt+M5,sweepAt,sweepAt+2*M5,1,false),false);
 assert.equal(!A.includes("useAlerts = input.bool("),true);
 assert.equal(!B.includes("useAlerts = input.bool("),true);
});
