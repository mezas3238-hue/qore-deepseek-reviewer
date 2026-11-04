import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const radar=file("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const chart=file("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const oldRadar=file("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_H_6_FILAS_PRIORITARIAS_QA_NO_LIVE.pine");
const oldChart=file("QORE_CRT_CHART_B_C1_MSS_V34_12_QA_NO_LIVE.pine");
const between=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)+start.length));
const fields=s=>between(s,"type Signal\n","// M3B.2").split("\n").filter(line=>/^    (?:int|float|bool|string|FamilyVisual)\s+\w+/.test(line)).length;
const args=s=>{
 const start=s.indexOf("Signal.new(");
 assert.ok(start>0);
 let depth=1,quotes=false,escaped=false,n=1;
 for(let i=start+"Signal.new(".length;i<s.length;i++){
  const c=s[i];
  if(quotes){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')quotes=false;continue;}
  if(c==='"'){quotes=true;continue;}
  if(c==="("){depth++;continue;}
  if(c===")"){depth--;if(depth===0)return n;continue;}
  if(c===","&&depth===1)n++;
 }
 throw new Error("Unclosed Signal.new");
};
test("two indicators: identical engine, UDT, and 132-field constructor with no schema shift",()=>{
 assert.equal(fields(radar),132); assert.equal(fields(chart),132);
 assert.equal(args(radar),132); assert.equal(args(chart),132);
 assert.equal(between(radar,"type Signal\n","// M3B.2"),between(chart,"type Signal\n","// M3B.2"));
 assert.equal(between(radar,"f_engine() =>","f_engine_snapshot() =>"),between(chart,"f_engine() =>","f_engine_snapshot() =>"));
 const constructor=x=>x.split("\n").find(l=>l.includes("Signal.new("));
 assert.equal(constructor(radar),constructor(chart));
 assert.equal((radar.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((chart.match(/^s\d\d = input\.symbol\(/gm)||[]).length,0);
 assert.equal((radar.match(/request\.security\(/g)||[]).length,(oldRadar.match(/request\.security\(/g)||[]).length);
 assert.equal((chart.match(/request\.security\(/g)||[]).length,(oldChart.match(/request\.security\(/g)||[]).length);
 assert.ok(!radar.includes("useAlerts = input.bool("));
 assert.ok(!chart.includes("useAlerts = input.bool("));
});
test("Inside first M5 sweep freezes pivot from same contiguous segment, not M15 or 2C",()=>{
 const s=between(radar,"// ---- M3B.2 INTEGRADO: PRIMERA BARRIDA M5 DE INSIDE BAR ----","// Multi-N propio:");
 for(const expected of ["cand.sweepAt := barEnd","cand.pivot5 := freshInside5","cand.pivot5At := freshInside5","cand.mss5At := na","cand.sweptLow and cand.sweptHigh","cand.pivot5 := na","lastHigh5At >= qaExtraM5SegmentStart","lastLow5At >= qaExtraM5SegmentStart"]){
  assert.ok(s.includes(expected),expected);
 }
 assert.ok(radar.includes("if (na(qaExtraM5SegmentStart) or not previousM5Continuous) and not na(barT)\n        qaExtraM5SegmentStart := barT"));
 assert.ok(radar.includes("stale.mss5At := na"));
});
test("Multi-N 5m own freeze and double-sweep rejection; gets discarded on new H4",()=>{
 const s=between(radar,"// Multi-N propio: antes de cerrar H4 terminal","// ---- M5B CANDIDATO");
 for(const expected of ["bool freshMN5","float frozenLevel5","int frozenAt5","frozenLevel5, frozenAt5, na","existing.doubleSweep := true","existing.mss5At := na","existing.pivot5 := na","existing.pivot5At := na"])assert.ok(s.includes(expected),expected);
 const full=between(radar,"// ---- M5B CANDIDATO","// FIN QA CRT CICLO")||radar;
 for(const expected of ["qaMultiNMss5At := qaOwn.mss5At","array.clear(qaMultiNMssCandidates)"])assert.ok(radar.includes(expected),expected);
});
test("M5 break only AFTER frozen pre-sweep pivot, closed contiguous M5 and within own cycle",()=>{
 const s=between(radar,"// QA M5 causal para Inside y Multi-N","// Actualizar swing M5 DESPUES de la barrida:");
 for(const expected of ["previousM5Continuous","own5.pivot5At < own5.sweepAt","barT >= own5.sweepAt","barEnd <= own5.sweepH4Start + 2 * H4MS","prevClose <= own5.pivot5","prevClose >= own5.pivot5","own5.mss5At := barEnd","not ownN5.doubleSweep","ownN5.pivot5At < ownN5.sweepAt","bucketH4 == ownN5.terminalH4Start","ownN5.mss5At := barEnd"])assert.ok(s.includes(expected),expected);
 assert.ok(radar.includes("extraMss5Causal ? extraC1 : na"));
 assert.ok(radar.includes("bool extraMss5Causal = extraFamily and not na(extraC1)"));
 assert.ok(radar.includes('bool extraDisplayed = extra and (not true3c or array.get(qaExtraKindBySlot,i) == "3C TRUE QA")'));
 assert.ok(radar.includes('bool ownExtraM15 = extra and (not true3c or array.get(qaExtraKindBySlot,i) == "3C TRUE QA")'));
 // Coincident 3C TRUE and INSIDE must not display INSIDE's MSS as 3C.
 assert.ok(radar.includes('bool ownExtraM5 = extra and (not true3c or array.get(qaExtraKindBySlot,i) == "3C TRUE QA")'));
 assert.ok(radar.includes("extraMss5At % MIN5 == qaNativeSourcePhaseMin * 60000"));
 assert.ok(radar.includes("qaMulti4Mss5At := q4.mss5At"));
});
test("Radar displays QA SI for M5 only on same-family cause, not true3C or Multi4 inferred",()=>{
 for(const expected of ["var array<int> extraM5Flags =","bool family5QA = extraValidQA","s.extraFamilyM5C1 == s.extraFamilyC1","s.extraFamilyM5PivotAt < s.extraFamilySweepAt","s.extraFamilyM5At > s.extraFamilySweepAt","array.set(extraM5Flags, i, family5QA ? 1 : 0)",'bool ownExtraM5 = extra and (not true3c or array.get(qaExtraKindBySlot,i) == "3C TRUE QA") and array.get(extraM5Flags,i) == 1',"ownExtraM5 ? \"QA SI\"","extraM5 and extraM15 ? 0"]){assert.ok(radar.includes(expected),expected);}
});
test("Chart B draws extra M5 level only when same family & same C1 as its C1 lines",()=>{
 const s=between(chart,"bool extraOwnM5 =","// Visual independiente:");
 for(const expected of ["own.extraFamilyC1 == own.familyVisual.c1Start","own.extraFamilyKind == own.familyVisual.kind","own.extraFamilyM5C1 == own.extraFamilyC1","own.extraFamilyM5PivotAt < own.extraFamilySweepAt","own.extraFamilyM5At > own.extraFamilySweepAt","if coreOwnM5 or extraOwnM5","int own5PivotT","float own5PivotPrice","line.set_color(m5Line,own5Ink)"])assert.ok(s.includes(expected),expected);
 assert.ok(chart.includes('title="QA familia extra MSS M5 cierre UTC min"'));
 assert.ok(chart.includes('title="QA familia extra pivote M5 precio"'));
 assert.ok(chart.includes('bool extraOwnM15 ='));
});

test("Chart B stays within basic 64 Pine plot-count budget on authored visual calls",()=>{
 const lines=chart.split("\n").map(x=>x.trimStart());
 const plotCount=lines.filter(x=>x.startsWith("plot(")).length;
 const extraNames=["plotshape(","plotchar(","plotarrow(","plotbar(","plotcandle(","alertcondition(","bgcolor(","barcolor(","fill("];
 const extraCount=lines.filter(x=>extraNames.some(n=>x.startsWith(n))).length;
 assert.equal(plotCount,63);
 assert.equal(extraCount,0);
 assert.ok(plotCount+extraCount<=64);
 assert.ok(!lines.filter(x=>x.startsWith("plot(")).some(x=>x.includes("color=input.")||x.includes("color=isUp")));
});
