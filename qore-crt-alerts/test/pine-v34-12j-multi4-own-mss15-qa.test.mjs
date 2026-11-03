import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>readFileSync(new URL("../../crt-radar-pro/"+p,import.meta.url),"utf8");
const A=get("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const B=get("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const P=get("qa-34-feed-memory-probes/QORE_CRT_RADAR_A_34_MERCADOS_PROBE_600_M5_QA_NO_LIVE.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const has=(s,parts)=>parts.forEach(p=>assert.ok(s.includes(p),"Missing "+p));
test("Multi4 M15 owns exact C1 C2a direction and sweep, not other family MSS",()=>{
 assert.equal(engine(A),engine(B)); assert.equal(engine(A),engine(P));
 for(const s of [A,B,P]){
  has(s,[
   "float pivot15","int pivot15At","int mss15At",
   "var int qaMulti4Mss15At = na",
   "q4.pivot15At < q4.sweepAt","q4.sweepAt > q4.c2aStart",
   "closed15At > q4.sweepAt","closed15At <= q4.c2aStart + 3 * H4MS",
   "prev15Continuous and closed15At == bucket15 and f_m15_phase_ok(closed15At, qaNativeSourcePhaseMin)",
   "m15Close > q4.pivot15 and prev15Close <= q4.pivot15",
   "m15Close < q4.pivot15 and prev15Close >= q4.pivot15",
   "q4.mss15At := closed15At",
   "q4.pivot15At := fresh4M15",
   "q4.pivot15 := fresh4M15",
   "q4.mss15At := na","q4.pivot15 := na","q4.pivot15At := na",
   "q4.c1Start == m1.startAt and q4.c2aStart == m2.startAt and q4.direction == dir4 and not q4.doubleSweep",
   "qaMulti4Pivot15 := q4.pivot15","qaMulti4Pivot15At := q4.pivot15At","qaMulti4Mss15At := q4.mss15At",
   "extraSelectMultiN ? qaMultiNPivot15 : qaMulti4Pivot15",
   "extraSelectMultiN ? qaMultiNPivot15At : qaMulti4Pivot15At",
   "extraSelectMultiN ? qaMultiNMss15At : qaMulti4Mss15At"
  ]);
  assert.ok(!s.includes("Aun no hay MSS15 Multi4."));
  assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(s));
 }
});
test("Multi4 own M15 temporal contract: positive and negative causal cases",()=>{
 const H4=4*3600000,M15=15*60000,c1=0,c2a=H4,terminal=c2a+3*H4;
 const valid=({dir=1,pivot=H4-M15,sweep=H4+M15,mss=H4+2*M15,prev=100,close=101,level=100.5,phase=0,double=false,continuous=true,correctC1=true})=>{
   const crossed=dir===1?close>level&&prev<=level:dir===-1?close<level&&prev>=level:false;
   return dir!==0&&!double&&continuous&&correctC1&&pivot<sweep&&sweep>c2a&&sweep<=c2a+H4&&mss>sweep&&mss<=terminal&&mss%M15===phase&&crossed;
 };
 assert.equal(valid({}),true);
 assert.equal(valid({dir:-1,prev:101,close:99,level:100}),true);
 assert.equal(valid({pivot:H4+2*M15}),false,"pivot after sweep");
 assert.equal(valid({mss:H4+M15}),false,"M15 same as sweep");
 assert.equal(valid({mss:terminal+M15}),false,"M15 after last H4");
 assert.equal(valid({double:true}),false,"double sweep");
 assert.equal(valid({continuous:false}),false,"M15 gap");
 assert.equal(valid({correctC1:false}),false,"wrong family C1");
 assert.equal(valid({dir:1,prev:100,close:100.4}),false,"no close cross");
 assert.equal(valid({dir:0}),false,"no directional sweep");
});
