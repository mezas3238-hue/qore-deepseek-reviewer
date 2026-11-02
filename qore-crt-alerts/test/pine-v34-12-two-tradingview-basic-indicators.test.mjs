import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const original=read("CRT_RADAR_PRO_V34_11S_C1_LISTO_34_CRT_MSS_QA_NO_LIVE.pine");
const radar=read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_QA_NO_LIVE.pine");
const chart=read("QORE_CRT_CHART_B_C1_MSS_V34_12_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const types=x=>x.slice(x.indexOf("type MultiH4"),x.indexOf("f_engine() =>"));
const count=(x,r)=>(x.match(r)||[]).length;

test("Both Basic slots retain byte-identical CRT 2C, true 3C, Inside, Multi and MSS engine",()=>{
 assert.equal(engine(radar),engine(original));
 assert.equal(engine(chart),engine(original));
 assert.equal(types(radar),types(original));
 assert.equal(types(chart),types(original));
 assert.match(radar,/bool categoryTrue3C =/);
 assert.match(chart,/bool categoryTrue3C =/);
 assert.match(radar,/categoryInsideReturn = extraInside/);
 assert.match(chart,/categoryMultiCandle = extraMulti or extraMultiN/);
});

test("Radar A has 34 independent security slots and minimal one-screen CRT/MSS only UI",()=>{
 assert.equal(count(radar,/^s\d\d = input\.symbol\(/gm),34);
 assert.equal(count(radar,/^\s*Signal s = request\.security\(/gm),1);
 assert.equal(count(radar,/^\s*plot\(/gm),1);
 assert.ok(radar.includes('f_renderRadarDashboard() =>'));
 assert.ok(radar.includes('f_renderRadarDashboard()'));
 for(const x of ['"MERCADO"','"CRT H4"','"DIR"','"MSS M5"','"MSS M15"','"ETAPA"'])
  assert.ok(radar.includes(x));
 assert.ok(radar.includes("qaCoreC1ReadyBySlot"));
 assert.ok(radar.includes("qaTrue3CSignedBySlot"));
 assert.ok(!radar.includes("Signal own = request.security"));
 assert.ok(!radar.includes("line.new("));
 assert.ok(!radar.includes("label.new("));
 assert.ok(!radar.includes('alert("CRT+MSS'));
});

test("Chart B reads ONLY the open chart's feed and draws matching family CRH/CRL + MSS",()=>{
 assert.equal(count(chart,/^s\d\d = input\.symbol\(/gm),0);
 assert.equal(count(chart,/^\s*plot\(/gm),60);
 assert.equal(count(chart,/^Signal own = request\.security\(/gm),1);
 assert.equal(count(chart,/^\[chartPrevDHigh, chartPrevDLow, chartPrevDOpenAt, chartPrevDCloseAt\] = request\.security\(/gm),1);
 assert.ok(!chart.includes("scanSymbols"));
 assert.ok(!chart.includes("var table board ="));
 assert.ok(!chart.includes("f_renderRadarDashboard"));
 for(const x of [
  "bool chartCoreC1 = chartAvailable",
  "bool chartExtraC1 = chartAvailable",
  "own.familyVisual.structuralQA",
  "displayCRH > displayCRL and displayEnd > displayC1",
  "line.new(t1,displayCRH,t2,displayCRH",
  "line.new(t1,displayCRL,t2,displayCRL",
  'label.new(t2,displayCRH,"CRH "+displayFamily',
  'label.new(t2,displayCRL,"CRL "+displayFamily',
  "bool extraOwnM15 = chartExtraC1",
  "own.extraFamilyKind == own.familyVisual.kind"
 ])assert.ok(chart.includes(x),x);
 assert.ok(!chart.includes("alert("));
});

test("each script has one Pine v6 declaration, and all plot calls remain at global scope",()=>{
 for(const x of [radar,chart]){
  assert.ok(x.startsWith("//@version=6\n"));
  assert.equal(count(x,/^indicator\(/gm),1);
  assert.equal(count(x,/^\s*plot\(/gm),count(x,/^plot\(/gm));
  assert.equal(count(x,/^request\.security\(/gm),0);
  assert.ok(x.includes("lookahead=barmerge.lookahead_off"));
  assert.ok(x.includes("useAlerts = input.bool(false"));
  assert.ok(!x.includes("strategy.entry("));
  assert.ok(!x.includes("alertcondition("));
 }
});

test("A's expanded 34 symbols and B's chart must use same broker; neither claims seven certified structures",()=>{
 assert.match(radar,/QORE CRT RADAR/);
 assert.match(chart,/QORE CRT CHART/);
 assert.ok(radar.includes("qaPhase1NonBtc = input.bool(true"));
 assert.ok(chart.includes("qaPhase1NonBtc = input.bool(true"));
 assert.ok(radar.includes('bool selectedPriority = expandFull34'));
 assert.ok(radar.includes('"NO PUSH"'));
 assert.ok(radar.includes('"NO LIVE"'));
 assert.ok(chart.includes('"3C TRUE QA"'));
 assert.equal(count(radar,/^s\d\d = input\.symbol\(/gm),34);
});
