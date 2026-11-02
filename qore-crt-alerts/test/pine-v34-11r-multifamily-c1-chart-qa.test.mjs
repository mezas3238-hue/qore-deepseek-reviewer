import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=x=>readFileSync(new URL("../../crt-radar-pro/"+x,import.meta.url),"utf8");
const q=load("CRT_RADAR_PRO_V34_11Q_TRUE3C_ROWdy_C3_SWEEP_QA_NO_LIVE.pine");
const r=load("CRT_RADAR_PRO_V34_11R_C1_PROPIO_4_MODELOS_DASHBOARD_QA_NO_LIVE.pine");
const signal=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const source=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const visual=x=>x.slice(x.indexOf("// 2C and QA 2C keep their original C1"),x.indexOf("// QA NY: estos valores"));
const owner=x=>x.slice(x.indexOf("// V34.11N OWNER MODE"));

test("R preserves 34 independent M5 feeds, 60 plots, OFF alerts and bounded Signal UDT",()=>{
 assert.equal((r.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((r.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((r.match(/request\.security\(/g)||[]).length,(q.match(/request\.security\(/g)||[]).length);
 assert.equal((signal(r).match(/^    (?:int|float|bool|string|FamilyVisual) \w+/gm)||[]).length,128);
 assert.equal((signal(q).match(/^    (?:int|float|bool|string|FamilyVisual) \w+/gm)||[]).length,127);
 assert.ok(r.includes("useAlerts = input.bool(false"));
 assert.ok(r.includes("if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15"));
 assert.ok(r.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(r.includes("calc_bars_count=1500"));
});

test("FamilyVisual comes from same feed's independent C1 for true3C, Inside, Multi4 and MultiN",()=>{
 const s=source(r);
 for(const x of [
  "type FamilyVisual","FamilyVisual familyVisual",
  "if ownTrue3CClosed and array.size(qaMultiNHistory) >= 3",
  "if visC3.endAt == math.abs(qaTrue3CSignedAt)",
  "MultiH4 visC1 = array.get(qaMultiNHistory, visI - 2)",
  "if visInside.c1Start == extraC1 and visInside.state == \"RATIFIED\" and visInside.isPatternValid",
  "familyC1Hi := visInside.c1High",
  "familyC1Lo := visInside.c1Low",
  "if visMultiN.startAt == extraC1 and visMultiN.valid",
  "if visMulti4.startAt == extraC1 and visMulti4.valid",
  "FamilyVisual outFamilyVisual = FamilyVisual.new(",
  "qaTrue3CSignedAt, outFamilyVisual)"
 ])assert.ok(r.includes(x),x);
 assert.ok(s.includes('familyVisualKind := "3C TRUE QA"'));
 assert.ok(s.includes('familyVisualKind := "INSIDE QA"'));
 assert.ok(s.includes('familyVisualKind := "MULTI-N QA"'));
 assert.ok(s.includes('familyVisualKind := "MULTI4 QA"'));
 assert.ok(s.includes("familyC1Hi > familyC1Lo"));
});

test("chart lines AND labels use current chosen family C1; never old 2C values for Extra",()=>{
 const s=r.slice(r.indexOf("if barstate.islast\n    if showLevels and visible"),r.indexOf("// ---- DASHBOARD M4B"));
 for(const x of [
  "line.new(t1,displayCRH,t2,displayCRH",
  "line.new(t1,displayCRL,t2,displayCRL",
  'label.new(t2,displayCRH,"CRH "+displayFamily',
  'label.new(t2,displayCRL,"CRL "+displayFamily',
  "line.set_xy1(hiLine,t1,displayCRH)",
  "line.set_xy2(hiLine,t2,displayCRH)",
  "line.set_xy1(loLine,t1,displayCRL)",
  "line.set_xy2(loLine,t2,displayCRL)",
  "label.set_xy(hiLabel,t2,displayCRH)",
  "label.set_xy(loLabel,t2,displayCRL)",
  "chartCoreC1 and showMssLines",
  "m15SwingAvailable = chartCoreC1 and showMssLines"
 ])assert.ok(s.includes(x),x);
 assert.ok(!s.includes('label.new(t2,own.crh'));
 assert.ok(!s.includes('label.set_xy(hiLabel,t2,own.crh)'));
 assert.ok(visual(r).includes("bool chartExtraC1"));
 assert.ok(visual(r).includes("own.familyVisual.structuralQA"));
 assert.ok(visual(r).includes('string displayFamily = chartCoreC1 ?'));
 assert.ok(visual(r).includes('chartExtraC1 ? own.familyVisual.c1High'));
 assert.ok(visual(r).includes('chartExtraC1 ? own.familyVisual.c1Low'));
});

test("main dashboard shows own-chart true3C/Inside/Multi and noncompact 34 feed QA with clear tags",()=>{
 assert.ok(r.includes("ownAnyCRT = ownCRTValid or chartCoreC1 or ownChartFamilyQA"));
 assert.ok(r.includes("own.familyVisual.direction"));
 for(const label of ['"[2C] "','"[2C QA] "','"[3C QA] "','"[INS QA] "','"[MN QA] "','"[M4 QA] "'])
   assert.ok(r.includes(label),label);
 assert.ok(r.includes('if slotScanned and not sameAsChart and (allMode or hasCRT)'));
 assert.ok(r.includes('bool real3cQA = int(math.floor(qaMask / 1)) % 2 == 1 and not validMain and not qa2C'));
 assert.ok(r.includes('bool hasCRT = array.get(validCrtFlags,i) or qa2C or real3cQA'));
 assert.ok(owner(r).includes('ownTrue3C ? "3C TRUE QA"'));
 assert.ok(owner(r).includes('ownTrue3C ? "N/V"'));
 assert.ok(owner(r).includes('string dirText = core or qaCore or ownTrue3C or extra or structuralObservedQA'));
});

test("MSS5 and MSS15 of true3C and unrelated family remain UNVERIFIED, not borrowed",()=>{
 const s=owner(r);
 assert.ok(s.includes('ownTrue3C ? "N/V"'));
 assert.ok(s.includes('extra or structuralObservedQA ? "N/V"'));
 assert.ok(s.includes('pivot5T < sweepT and break5T > sweepT'));
 assert.ok(s.includes('pivot15T < sweepT and break15T > sweepT'));
 assert.ok(s.includes('break15T <= close15T'));
 assert.ok(s.includes('f_m15_phase_ok(break15T, nativePhase)'));
 assert.ok(s.includes('"NO PUSH"'));
 assert.ok(s.includes('"NO LIVE"'));
});
