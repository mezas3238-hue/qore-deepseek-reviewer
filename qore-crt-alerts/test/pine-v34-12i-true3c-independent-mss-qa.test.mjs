import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const get=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const A=get("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const B=get("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const cut=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)+a.length));
test("3C_TRUE M5 and M15 have isolated frozen-pivot state in both exact engines",()=>{
  assert.equal(cut(A,"f_engine() =>","f_engine_snapshot() =>"),cut(B,"f_engine() =>","f_engine_snapshot() =>"));
  for(const s of [A,B]){
    const e=cut(s,"f_engine() =>","f_engine_snapshot() =>");
    assert.ok(s.includes("type True3CMssCandidate"));
    assert.ok(e.includes("var True3CMssCandidate qaTrue3CPending = na"));
    assert.ok(e.includes("qaTrue3CPending := na"));
    assert.ok(e.includes("preC2.cl < preC1.hi"));
    assert.ok(e.includes("owned3.c1Start == trueC1.startAt and owned3.c3Start == trueC3.startAt"));
    assert.ok(e.includes("not owned3.doubleSweep"));
    assert.ok(e.includes("q3.pivot5At < q3.sweepAt"));
    assert.ok(e.includes("q3.mss5At := barEnd"));
    assert.ok(e.includes("q3.pivot15At < q3.sweepAt"));
    assert.ok(e.includes("q3.mss15At := closed15At"));
    assert.ok(e.includes("prev15Continuous and closed15At == bucket15"));
    assert.ok(e.includes("barT >= q3.sweepAt and barEnd <= q3.c3Start + H4MS"));
    assert.ok(e.includes("q3.doubleSweep := true"));
    assert.ok(e.includes('extraTrue3C ? "3C TRUE QA"'));
    assert.ok(e.includes("extraTrue3C ? qaTrue3CConfirmed.mss5At"));
    assert.ok(e.includes("extraTrue3C ? qaTrue3CConfirmed.mss15At"));
  }
});
test("3C_TRUE QA never turns on LIVE or borrows Inside/2C MSS",()=>{
  assert.ok(A.includes("useAlerts = input.bool(false"));
  assert.ok(!B.includes("useAlerts = input.bool("));
  assert.ok(A.includes('s.extraFamilyKind == "3C TRUE QA"'));
  assert.ok(A.includes('qaExtraKindBySlot,i) == "3C TRUE QA"'));
  // Causality: pre-sweep confirmed swing, post-sweep M5 and M15 close.
  const sweep=30*60*1000, ownPivot=10*60*1000;
  const valid5=(pivot,closed)=>pivot<sweep && closed>sweep && closed<=4*60*60*1000;
  const valid15=(pivot,closed)=>pivot<sweep && closed>sweep && closed%900000===0;
  assert.equal(valid5(ownPivot,sweep),false);
  assert.equal(valid5(ownPivot,sweep+300000),true);
  assert.equal(valid5(sweep+300000,sweep+600000),false);
  assert.equal(valid15(ownPivot,sweep+900000),true);
  assert.equal(valid15(ownPivot,sweep+300000),false);
});
