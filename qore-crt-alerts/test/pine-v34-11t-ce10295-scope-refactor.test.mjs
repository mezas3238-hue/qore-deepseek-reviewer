import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=(n)=>readFileSync(new URL("../../crt-radar-pro/"+n, import.meta.url),"utf8");
const before=load("CRT_RADAR_PRO_V34_11S_C1_LISTO_34_CRT_MSS_QA_NO_LIVE.pine");
const after=load("CRT_RADAR_PRO_V34_11T_COMPILER_CE10295_REFAC_QA_NO_LIVE.pine");
const nameBlocks=[
 ["f_renderLegacyDashboard","if barstate.islast\n    table.clear(board,0,0,5,14)\n    if showDashboard and not compactMobile","if barstate.islast and showDashboard and compactMobile and not userFocus7"],
 ["f_renderCompactLegacy","if barstate.islast and showDashboard and compactMobile and not userFocus7","f_qaUtcMin(int t) =>"],
 ["f_renderSlotAudit","if barstate.islast and showDashboard and showSlotEventAudit","if barstate.islast and showDashboard and showNonBtcCohortQA"],
 ["f_renderNonBtcAudit","if barstate.islast and showDashboard and showNonBtcCohortQA","// V34.11N OWNER MODE"],
 ["f_renderCrtMssMonitor","if barstate.islast and showDashboard and compactMobile and userFocus7 and not showSlotEventAudit and not showNonBtcCohortQA",null],
];
const originalBody=(start,end)=>{
 const i=before.indexOf(start);
 assert.ok(i>=0,"old anchor missing "+start);
 const j=end?before.indexOf(end,i+start.length):before.length;
 assert.ok(j>i,"old end missing "+end);
 return before.slice(i,j).trimEnd();
};
const functionBody=(name)=>{
 const start=name+"() =>\n";
 const i=after.indexOf(start);
 assert.ok(i>=0,"new UDF missing "+name);
 const j=after.indexOf("\n\n"+name+"()\n",i+start.length);
 assert.ok(j>i,"new function call missing "+name);
 const source=after.slice(i+start.length,j);
 return source.split("\n").map(line=>line?line.replace(/^    /,""):line).join("\n").trimEnd();
};

test("5 presentation scopes moved verbatim into Pine UDF; no changes to dashboard behavior",()=>{
 for(const [name,start,end] of nameBlocks){
  assert.equal(functionBody(name),originalBody(start,end),"changed logic in "+name);
  assert.equal(after.split("\n"+name+"()\n").length-1,1,
    "expected exactly one global invocation of "+name);
 }
});

test("root-level CRT engine, scanner and all 34 data requests retained unchanged",()=>{
 const a=before.slice(0,before.indexOf("var table board ="));
 const b=after.slice(0,after.indexOf("var table board ="));
 assert.equal(
  b.replace('indicator("CRT + MSS M5/M15 | V34.11T CE10295 SCOPE QA", shorttitle="CRT MSS QA 4C 11T"',
            'indicator("CRT + MSS M5/M15 | V34.11S C1 LISTO 34 CRT QA", shorttitle="CRT MSS QA 4C 11S"'),
  a);
 assert.equal((after.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((after.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((after.match(/request\.security\(/g)||[]).length,
              (before.match(/request\.security\(/g)||[]).length);
 assert.ok(after.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(after.includes('useAlerts = input.bool(false'));
 assert.ok(after.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
});

test("no Pine global-only builtins or nested functions relocated into presentation scopes",()=>{
 for(const [name] of nameBlocks){
  const body=functionBody(name);
  assert.doesNotMatch(body,/^\s*(?:plot|plotshape|plotchar|alertcondition|indicator|input)\(/m);
  assert.doesNotMatch(body,/^\s*\w+\([^\n]*\)\s*=>/m);
  assert.ok(body.includes("table.cell(")||body.includes("table.clear("),name);
 }
});

test("default dashboard continues to show CRT source, direction, independent M5/M15, never QA alerts",()=>{
 const body=functionBody("f_renderCrtMssMonitor");
 for(const t of ['"MERCADO"','"CRT H4"','"DIR"','"MSS M5"','"MSS M15"','"NO PUSH"','"NO LIVE"'])
  assert.ok(body.includes(t),t);
 assert.ok(body.includes('pivot5T < sweepT and break5T > sweepT'));
 assert.ok(body.includes('pivot15T < sweepT and break15T > sweepT'));
 assert.ok(body.includes('"C1 N/D"'));
 assert.ok(after.includes('displayCRH > displayCRL and displayEnd > displayC1'));
});
