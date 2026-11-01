import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const prev=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10O_MULTIFAMILIAS_QA_ESCANEO_34_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10P_SOLO_CRT_VIGENTE_QA_SEPARADO_NO_INTEGRADO.pine",import.meta.url),"utf8");
const count=(str,needle)=>str.split(needle).length-1;
test("scanner keeps 34 slots and M5/H4/M15 engine unchanged",()=>{
  assert.equal(count(prev,"request.security("),count(pine,"request.security("));
  assert.equal((prev.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
  assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
  const core=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
  assert.equal(core(prev),core(pine));
  assert.match(pine,/useAlerts = input\.bool\(false/);
  assert.match(pine,/bool scanCrtValid = available and st == 2 and s\.isPatternValid/);
});
test("Solo CRT excludes QA independently of source data",()=>{
  assert.match(pine,/options=\["Solo CRT", "Solo CRT \+ QA", "Todos los instrumentos"\]/);
  assert.match(pine,/bool showQAInList = modeDashboard == "Solo CRT \+ QA" or allMode/);
  assert.match(pine,/if slotScanned and not sameAsChart and \(allMode or validMain or \(showQAInList and hasCRT\)\)/);
  assert.match(pine,/bool ownAnyCRT = ownCRTValid or \(showQAInList and ownExtraQA\)/);
  assert.match(pine,/array\.set\(validCoreFlags, i, scanCrtValid\)/);
  for (const [view,validMain,qa,expected] of [
    ["Solo CRT",false,true,false],
    ["Solo CRT",true,false,true],
    ["Solo CRT",false,false,false],
    ["Solo CRT + QA",false,true,true],
    ["Todos los instrumentos",false,false,true]
  ]){
    const allMode=view==="Todos los instrumentos";
    const showQAInList=view==="Solo CRT + QA"||allMode;
    const displayed=allMode||validMain||(showQAInList&&(validMain||qa));
    assert.equal(displayed,expected);
  }
});
test("CRT count distinct from QA diagnostic count; no inflated combined CRT figure",()=>{
  assert.match(pine,/if scanCrtValid\s+found \+= 1/);
  assert.match(pine,/if extraValidQA and not scanCrtValid\s+foundQA \+= 1/);
  assert.match(pine,/table\.cell\(board,1,13,"CRT:"\+str\.tostring\(found\)/);
  assert.match(pine,/table\.cell\(board,2,13,"QA:"\+str\.tostring\(foundQA\)/);
  assert.doesNotMatch(pine,/"CRT\/QA:"/);
});
test("historic C2 and inside status cannot be presented as active CRT",()=>{
  assert.match(pine,/ownCRTValid \? "C2 ACTIVA OK" : own\.qaLastC2Gate == "CRT C2 RATIFICADO" \? "ULT C2 OK \(HIST\)"/);
  assert.match(pine,/own\.insideFamilyDiag == "INSIDE RETURN" \? "INSIDE HIST"/);
  assert.match(pine,/table\.cell\(board,0,8,"BTC HIST QA"/);
  assert.match(pine,/ownAnyCRT \? openName\+" \[G\]" : "ESPERA CRT"/);
  assert.match(pine,/table\.cell\(board,0,2,allMode \? "SIN DATOS" : "SIN CRT VIGENTE"/);
});
test("QA never inherits main MSS or creates an alert",()=>{
  assert.match(pine,/table\.cell\(board,4,r,validMain and array\.get\(m5Flags,i\)==1/);
  assert.match(pine,/table\.cell\(board,5,r,validMain and array\.get\(m15Flags,i\)==1/);
  assert.match(pine,/if scanCrtValid\s+if m5t > 0/);
  assert.doesNotMatch(pine,/if useAlerts and barstate\.isrealtime and extraValidQA/);
});
