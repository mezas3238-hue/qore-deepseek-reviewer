import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const prev=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10M_RETEST_EVIDENCIA_M15_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10N_SOLO_CRT_VALIDOS_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const confirmed=({phase,valid,model="CRT_2C_RETURN",c1=100,c2=101,ratified=101+14400000})=>
 phase===2 && valid && model==="CRT_2C_RETURN" && c1>0 && c2>0 && ratified>=c2+14400000;
test("filter refuses provisional (C2), historical and rejected families",()=>{
  for(const phase of [0,1,3])assert.equal(confirmed({phase,valid:true}),false);
  assert.equal(confirmed({phase:2,valid:false}),false);
  assert.equal(confirmed({phase:2,valid:true,model:"CRT_2C_EXPANSION"}),false);
  assert.equal(confirmed({phase:2,valid:true,model:"PENDING"}),false);
  assert.equal(confirmed({phase:2,valid:true,ratified:101}),false);
  assert.equal(confirmed({phase:2,valid:true}),true);
});
test("scan 34 stays active and displays only actually ratified CRT",()=>{
  assert.match(pine,/bool scanAll = memoryScan == "34 instrumentos \(experimental\)"/);
  assert.match(pine,/var array<bool> validCrtFlags = array\.new_bool\(34, false\)/);
  assert.match(pine,/bool scanCrtValid = available and st == 2 and s\.isPatternValid and s\.modelKind == "CRT_2C_RETURN"/);
  assert.match(pine,/array\.set\(validCrtFlags, i, scanCrtValid\)/);
  assert.match(pine,/if scanCrtValid\s+found \+= 1/);
  assert.match(pine,/bool hasCRT = array\.get\(validCrtFlags,i\)/);
  assert.match(pine,/if slotScanned and not sameAsChart and \(allMode or hasCRT\)/);
  assert.doesNotMatch(pine,/bool hasCRT = st > 0/);
});
test("graph symbol has no dashboard signal until qualified valid CRT",()=>{
  assert.match(pine,/bool ownCRTValid = chartAvailable and own\.phase == 2 and own\.isPatternValid/);
  assert.match(pine,/ownCRTValid \? openName\+" \[G\]" : "ESPERA CRT"/);
  assert.match(pine,/ownCRTValid and not na\(own\.m5At\)/);
  assert.match(pine,/bool m15CRTConfirmed = ownCRTValid/);
  assert.match(pine,/scanAll \? "34 SCAN QA" : "BTC QA 1\/34"/);
  assert.match(pine,/"VALID:"\+str\.tostring\(found\)/);
});
test("valid CRT H4 visibility does not require MSS M15, independent ✓ status",()=>{
  const qualified=confirmed({phase:2,valid:true});
  const m15=false;
  assert.equal(qualified,true);assert.equal(qualified && m15,false);
  assert.match(pine,/bool scanCrtValid = available and st == 2 and s\.isPatternValid and s\.modelKind == "CRT_2C_RETURN"/);
  assert.doesNotMatch(pine,/bool scanCrtValid =[^\n]*m15t/);
});
test("retest and rest of engine retain same source; alerts OFF",()=>{
  const start=s=>s.slice(s.indexOf("f_index() =>"),s.indexOf("var array<int> statuses ="));
  assert.equal(start(pine),start(prev));
  assert.equal((prev.match(/request\.security\(/g)||[]).length,(pine.match(/request\.security\(/g)||[]).length);
  assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
  assert.match(pine,/useAlerts = input\.bool\(false/);
  for(const marker of ["QA CRT RETEST M15 vela maximo","QA CRT RETEST M15 vela cierre precio","f_btc_crt_h4_ny","bool validIndependent15"])assert.ok(pine.includes(marker));
});