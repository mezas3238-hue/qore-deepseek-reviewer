import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=(name)=>readFileSync(new URL("../../crt-radar-pro/"+name, import.meta.url),"utf8");
const before=load("CRT_RADAR_PRO_V34_11R_C1_PROPIO_4_MODELOS_DASHBOARD_QA_NO_LIVE.pine");
const now=load("CRT_RADAR_PRO_V34_11S_C1_LISTO_34_CRT_MSS_QA_NO_LIVE.pine");
const engine=(x)=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const signal=(x)=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const owner=(x)=>x.slice(x.indexOf("// V34.11N OWNER MODE"));

test("no changes to all four structural engines, MSS, alert gates, 34-source catalog and 60 plots",()=>{
 assert.equal(engine(now),engine(before));
 assert.equal(signal(now),signal(before));
 assert.equal((now.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((now.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((now.match(/request\.security\(/g)||[]).length,(before.match(/request\.security\(/g)||[]).length);
 assert.ok(now.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(now.includes('useAlerts = input.bool(false'));
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
});

test("chart draws only with exact C1 time/high/low and family evidence, never mask>0",()=>{
 const s=now.slice(now.indexOf("// 2C and QA 2C keep their original C1"),now.indexOf("// QA NY: estos valores"));
 for(const term of [
  'bool chartCoreC1 = chartAvailable and own.phase == 2',
  'bool chartExtraC1 = chartAvailable and not chartCoreC1',
  'own.familyVisual.structuralQA',
  'int displayC1 = chartCoreC1 ? own.c1Start',
  'float displayCRH = chartCoreC1 ? own.crh',
  'float displayCRL = chartCoreC1 ? own.crl',
  'bool visible = visualChartAligned and (chartCoreC1 or chartExtraC1)',
  'not na(displayC1) and not na(displayCRH) and not na(displayCRL)',
  'displayCRH > displayCRL and displayEnd > displayC1',
 ])assert.ok(s.includes(term),term);
 assert.ok(!s.includes('own.qaCatalogMask > 0'));
 assert.ok(now.includes('label.new(t2,displayCRH,"CRH "+displayFamily'));
 assert.ok(now.includes('label.new(t2,displayCRL,"CRL "+displayFamily'));
});

test("34 independent feed slots expose honest range readiness for actual chosen model",()=>{
 for(const term of [
  'qaCoreC1ReadyBySlot = array.new_bool(34, false)',
  'qaOtherC1ReadyBySlot = array.new_bool(34, false)',
  'qaOtherC1KindBySlot = array.new_string(34, "NONE")',
  'bool ownCoreC1Ready = structuralCoreObserved and not na(s.crh)',
  'bool ownOtherC1Ready = available and not na(s.familyVisual)',
  'array.set(qaCoreC1ReadyBySlot,i,ownCoreC1Ready)',
  'array.set(qaOtherC1ReadyBySlot,i,ownOtherC1Ready)',
  'array.set(qaOtherC1KindBySlot,i,ownOtherC1Ready ? s.familyVisual.kind : "NONE")'
 ])assert.ok(now.includes(term),term);
 const s=owner(now);
 assert.ok(s.includes('bool c1ReadyForShownRole = (core or qaCore) ? coreC1Ready'));
 assert.ok(s.includes('ownTrue3C ? otherC1Ready and otherC1Kind == "3C TRUE QA"'));
 assert.ok(s.includes('extra ? otherC1Ready and otherC1Kind == array.get(familyLabels,i)'));
 assert.ok(s.includes('bool missingC1ForCRT ='));
 assert.ok(s.includes('string visibleStage = missingC1ForCRT ? "C1 N/D" : stage'));
 assert.ok(s.includes('table.cell(board,5,rowIndex,visibleStage'));
});

test("reject/provisional/retest mask bits NEVER grant a family or C1 visualization",()=>{
 assert.ok(now.includes('bool showRejectedDiagnostics = expandFull34 and showCatalog7'));
 assert.ok(now.includes('showRejectedDiagnostics ? catExpansion or catInsideContinuation ? "RECHAZO"'));
 assert.ok(now.includes('showRejectedDiagnostics ? cat2 ? "2C*"'));
 assert.ok(now.includes('bool chartExtraC1 = chartAvailable and not chartCoreC1'));
 assert.ok(!now.includes('chartCoreC1 or chartExtraC1 or (chartAvailable and own.qaCatalogMask'));
 assert.ok(owner(now).includes('ownTrue3C ? "N/V"'));
 assert.ok(owner(now).includes('extra or structuralObservedQA ? "N/V"'));
 assert.ok(owner(now).includes('"NO PUSH"'));
 assert.ok(owner(now).includes('"NO LIVE"'));
});

test("expanded dashboard retains six columns and core requirements, no false claim of seven families",()=>{
 for(const label of ['"MERCADO"','"CRT H4"','"DIR"','"MSS M5"','"MSS M15"','"ETAPA"'])
   assert.ok(owner(now).includes(label));
 assert.ok(now.includes('if slotScanned and not sameAsChart and (allMode or hasCRT)'));
 assert.ok(now.includes('rowHasOwnC1 ? "" : " C1 N/D"'));
 assert.ok(now.includes('string familyTag = validMain ? "[2C] "'));
 assert.ok(now.includes('userFocus7 = input.bool(true'));
});
