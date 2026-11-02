import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const previous=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10Q_MULTIN_H4_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10R_HISTORIAL_DETECTORES_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const numberOf=(source,term)=>source.split(term).length-1;
const fields=["2C","3C","Inside","M4","MN","C2Data","C2Double","C2NoSweep","C2Outside","C2Hour","C3Invalid","InsideData","InsideDouble","InsideOther","InsideExpire","MNNoTerminal","MNDouble","MNOutside","H4Incomplete"];
test("historical audit preserves 34 instrument requests, inputs, MSS and default valid-only dashboard",()=>{
 assert.equal(numberOf(pine,"request.security("),numberOf(previous,"request.security("));
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.match(pine,/modeDashboard = input\.string\("Solo CRT"/);
 assert.match(pine,/options=\["Solo CRT", "Solo CRT \+ QA", "Auditoría histórica \(QA\)", "Todos los instrumentos"\]/);
 assert.match(pine,/bool showHistoricAudit = modeDashboard == "Auditoría histórica \(QA\)"/);
 assert.match(pine,/bool showQAInList = modeDashboard == "Solo CRT \+ QA" or allMode/);
 assert.match(pine,/if slotScanned and not sameAsChart and \(allMode or validMain or \(showQAInList and hasCRT\)\)/);
 assert.match(pine,/if scanCrtValid\s+if m5t > 0/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.match(pine,/bool validIndependent15 = not na\(outM15At\)/);
});
test("every historical counter in the Signal comes from exactly one initialized var",()=>{
 assert.equal(fields.length,19);
 for(const key of fields){
   const udt="    int audit"+key;
   const state="    var int qaAudit"+key+" = 0";
   assert.match(pine,new RegExp("    int audit"+key+"\\n"),udt);
   assert.equal(numberOf(pine,state),1,state);
   assert.match(pine,new RegExp("qaAudit"+key+"[,)]"),"return "+key);
   const match=new RegExp("own\\.audit"+key+"\\b");
   assert.match(pine,match,"dashboard "+key);
 }
 assert.match(pine,/qaAuditH4Incomplete\)\s*\/\/ V34\.10c QA/);
});
test("H4 close guard is the only place model counters are increased",()=>{
 const start=pine.indexOf("            // M5A: Tres H4 completas consecutivas");
 const end=pine.indexOf("            // La H4 que acaba de cerrar puede ser C1 del SIGUIENTE ciclo",start);
 assert.ok(start>0 && end>start);
 const core=pine.slice(start,end);
 for(const key of fields){
   const needle="qaAudit"+key+" += 1";
   assert.equal(numberOf(pine,needle), key==="InsideOther"||key==="InsideData"?2:1,needle);
   assert.ok(core.includes(needle),"H4-only "+key);
 }
 const c2=core.slice(core.indexOf("                bool exactHour3"),core.indexOf("                if validRange and exactHour3"));
 assert.match(c2,/if not validC2Data\s+qaAuditC2Data \+= 1\s+else if c2Double\s+qaAuditC2Double \+= 1\s+else if not strictSingleSweep\s+qaAuditC2NoSweep \+= 1\s+else if not inside or not c2Returned\s+qaAuditC2Outside \+= 1\s+else if not exactHour3\s+qaAuditC2Hour \+= 1/);
});
test("Multi-N rejection counted once per closed H4, not once per candidate N",()=>{
 const slice=pine.slice(pine.indexOf("if nHistory >= 4"),pine.indexOf("            // C3 solo se invalida por el CIERRE"));
 assert.ok(slice.includes("bool multiNAuditable = false"));
 assert.ok(slice.includes("bool multiNMatched = false"));
 assert.ok(slice.includes("for consolidationCount = 2 to 5"));
 assert.match(slice,/if consecutive and internalBars and validTimeC1 and \(sweepLowN != sweepHighN\) and returnN\s+multiNMatched := true\s+qaAuditMN \+= 1/);
 assert.match(slice,/if multiNAuditable and not multiNMatched\s+if multiNSawDouble\s+qaAuditMNDouble \+= 1\s+else if multiNSawOutside\s+qaAuditMNOutside \+= 1\s+else if multiNSawNoTerminal\s+qaAuditMNNoTerminal \+= 1/);
 assert.equal(numberOf(slice,"qaAuditMNNoTerminal += 1"),1);
 assert.equal(numberOf(slice,"qaAuditMNDouble += 1"),1);
 assert.equal(numberOf(slice,"qaAuditMNOutside += 1"),1);
});
test("Inside Bar counts transitions, not persistent stale last-candidate labels",()=>{
 const classification=pine.slice(pine.indexOf("            // M3B.2 INTEGRADO: clasificar solo al cierre"),pine.indexOf("            // C2 pasa a C3 solo cuando la H4 de C2 CIERRA"));
 assert.match(classification,/if closesSweepH4 and \(cand\.state == "SWEPT" or cand\.state == "AMBIGUOUS"\)/);
 assert.match(classification,/if returnC2\s+qaAuditInside \+= 1\s+cand\.state := "RATIFIED"/);
 assert.match(classification,/qaAuditInsideDouble \+= 1\s+cand\.state := "AMBIGUOUS"/);
 assert.match(classification,/qaAuditInsideExpire \+= 1\s+ageCand\.state := "EXPIRED"/);
 assert.match(classification,/qaAuditInsideOther \+= 1\s+cand\.state := "UNRESOLVED"/);
});
test("historical dashboard is opt-in and never looks like 34 certified feeds",()=>{
 const start=pine.indexOf("        // V34.10r: VISTA QA");
 const end=pine.indexOf('        table.cell(board,0,13,scanAll ? "34 SCAN QA"',start);
 assert.ok(start>0 && end>start);
 const audit=pine.slice(start,end);
 assert.match(audit,/if showHistoricAudit/);
 for(let row=7;row<=11;row++)assert.match(audit,new RegExp('table\\.cell\\(board,0,'+row+','));
 for(const label of ["HIST M5","C2 RECH","INS RECH","MN TERM","ALCANCE","GRAFICO","M5 HIST","NO 34 HIST","NO FCM","NO LIVE"])
   assert.ok(audit.includes('"'+label+'"'),label);
 assert.match(pine,/table\.cell\(board,0,13,scanAll \? "34 SCAN QA"/);
 assert.match(pine,/table\.cell\(board,1,13,"CRT:"\+str\.tostring\(found\)/);
 assert.match(pine,/table\.cell\(board,2,13,"QA:"\+str\.tostring\(foundQA\)/);
});
