import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const old=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10N_SOLO_CRT_VALIDOS_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10O_MULTIFAMILIAS_QA_ESCANEO_34_NO_INTEGRADO.pine",import.meta.url),"utf8");
const n=(txt,s)=>txt.split(s).length-1;
test("V34.10o preserves 34-symbol dynamic request structure and disabled alerts",()=>{
 assert.equal(n(old,"request.security("),n(pine,"request.security("));
 assert.equal(n(pine,"Signal s = request.security("),1);
 assert.equal(n(pine,"Signal own = request.security("),1);
 assert.equal(n(pine,"useAlerts = input.bool(false"),1);
 assert.equal(n(pine,"if useAlerts and barstate.isrealtime"),2);
 assert.equal(n(pine,"if scanCrtValid"),1);
 assert.match(pine,/for i = 0 to 33\s+if scanAll or i == 7/);
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
});
test("existing core f_engine H4/M15 calculation preserved before additional family presentation block",()=>{
 // The new branch adds bounded QA state in f_engine; protect its
 // pre-existing causal C2/C3/MSS processing by exact section comparison.
 const core=s=>s.slice(s.indexOf("    // ---- BARRIDA Y RETORNO C2"),s.indexOf("    // Priorizar el CRT ratificado"));
 assert.equal(core(pine),core(old));
 assert.ok(pine.includes('bool validC2Data = h4Continuous'));
 assert.ok(pine.includes('c3Invalidation'));
 assert.ok(pine.includes('bool retestVisible'));
 assert.ok(pine.includes('bool m15CRTConfirmed = ownCRTValid'));
});
test("inside only after H4 ratified; C1, same pattern and tight expiry",()=>{
 assert.match(pine,/q\.state == "RATIFIED" and q\.isPatternValid/);
 assert.match(pine,/q\.sweepDir == 1 or q\.sweepDir == -1/);
 assert.match(pine,/barEnd >= closedAt and barEnd < closedAt \+ H4MS/);
 assert.match(pine,/extraInsideC1 := q\.c1Start/);
 assert.match(pine,/extraInsideDir := q\.sweepDir/);
});
test("Multi4 only existing validated complete 4H4 marker, no implied new consolidation pattern",()=>{
 assert.match(pine,/qaMulti4C1 := m1\.startAt/);
 assert.match(pine,/bool extraMulti = multiVisible and not na\(qaMulti4C1\)/);
 assert.match(pine,/qaMulti4Kind == "MULTI4 BULL QA"/);
 assert.match(pine,/extraKind = not extraFamily \? "NONE" : extraSelectInside \? "INSIDE QA" : "MULTI4 QA"/);
});
test("scan counts valid original or QA structural and never labels QA MSS as confirmed",()=>{
 assert.match(pine,/bool anyStructuralCRT = scanCrtValid or extraValidQA/);
 assert.match(pine,/array\.set\(validCrtFlags, i, anyStructuralCRT\)/);
 assert.match(pine,/array\.set\(validCoreFlags, i, scanCrtValid\)/);
 assert.match(pine,/bool validMain = array\.get\(validCoreFlags,i\)/);
 assert.match(pine,/validMain and array\.get\(m5Flags,i\)==1/);
 assert.match(pine,/validMain and array\.get\(m15Flags,i\)==1/);
 assert.match(pine,/table\.cell\(board,1,13,"CRT\/QA:"/);
 assert.doesNotMatch(pine,/table\.cell\(board,4,r,hasCRT and array\.get\(m5Flags,i\)/);
 assert.doesNotMatch(pine,/table\.cell\(board,5,r,hasCRT and array\.get\(m15Flags,i\)/);
});
test("alerts still depend exclusively on original strict C2 return core, never extra family",()=>{
 assert.match(pine,/bool scanCrtValid = available and st == 2 and s\.isPatternValid and s\.modelKind == "CRT_2C_RETURN"/);
 assert.match(pine,/if scanCrtValid\s+if m5t > 0/);
 assert.match(pine,/bool certifiedCRT = st == 2/);
 assert.doesNotMatch(pine,/bool certifiedCRT = anyStructuralCRT/);
 assert.doesNotMatch(pine,/if useAlerts and barstate\.isrealtime and extraValidQA/);
});
