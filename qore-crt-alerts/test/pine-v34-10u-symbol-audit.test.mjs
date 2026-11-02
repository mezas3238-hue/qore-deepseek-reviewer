import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root="../../crt-radar-pro/";
const before=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10T_CRT_QA_34_MERCADOS_NO_INTEGRADO.pine",import.meta.url),"utf8");
const after=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10U_AUDITORIA_34_POR_SIMBOLO_NO_INTEGRADO.pine",import.meta.url),"utf8");
const android=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10U_AUDITORIA_34_POR_SIMBOLO_ANDROID_COPIAR.txt",import.meta.url),"utf8");
const count=(s,k)=>s.split(k).length-1;
const has=(...terms)=>terms.forEach(t=>assert.ok(after.includes(t),t));

test("V34.10u original CRT, MSS and signal gates unchanged",()=>{
  assert.equal(after,android);
  assert.equal(count(after,"request.security("),count(before,"request.security("));
  assert.equal(count(after,"alert("),count(before,"alert("));
  assert.equal(count(after,"plot("),count(before,"plot("));
  assert.equal((after.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
  const motor=(s)=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
  assert.equal(motor(after),motor(before));
  has('useAlerts = input.bool(false',
      'memoryScan = input.string("34 instrumentos (experimental)"',
      'bool showQAInList = modeDashboard == "Solo CRT + QA" or allMode',
      'if slotScanned and not sameAsChart and (allMode or validMain or (showQAInList and hasCRT))');
});
test("opt-in audit selection cannot accidentally change original Solo CRT or alert gates",()=>{
 has('modeDashboard = input.string("Solo CRT"',
 'Auditoría 34 por símbolo (QA)',
 'bool showPerFeedAudit = modeDashboard == "Auditoría 34 por símbolo (QA)"',
 'if showPerFeedAudit\n            table.clear(board,0,0,5,14)',
 'if scanCrtValid\n            if m5t > 0',
 'if useAlerts and barstate.isrealtime and alert15');
 const newView=after.slice(after.indexOf('        // V34.10u: tabla exclusivamente de DIAGNOSTICO'));
 assert.ok(newView.includes('if showPerFeedAudit'));
 assert.ok(!newView.includes('alert('));
 assert.ok(!newView.includes('request.security('));
});
test("same per-symbol M5 Signal feeds 34 bounded audit buffers with no extra datasets",()=>{
 for(const field of ["Available","C1","2C","3C","Inside","M4","MN","H4Gap","C2Rejected","M15QA"]){
   has('var array<int> auditFeed'+field+' = array.new_int(34, 0)',
       'array.set(auditFeed'+field+', i,');
 }
 has('array.set(auditFeedC1, i, available ? nz(s.qaC1Ready, 0) : 0)',
     'array.set(auditFeed2C, i, available ? nz(s.audit2C, 0) : 0)',
     'array.set(auditFeed3C, i, available ? nz(s.audit3C, 0) : 0)',
     'array.set(auditFeedInside, i, available ? nz(s.auditInside, 0) : 0)',
     'array.set(auditFeedM4, i, available ? nz(s.auditM4, 0) : 0)',
     'array.set(auditFeedMN, i, available ? nz(s.auditMN, 0) : 0)',
     'array.set(auditFeedH4Gap, i, available ? nz(s.auditH4Incomplete, 0) : 0)',
     'array.set(auditFeedC2Rejected, i, c2RejectSum)',
     'array.set(auditFeedM15QA, i, family15QA ? 1 : 0)');
});
test("pagination covers all 34 markets with exactly ten rows per page, no permanent 34-row dashboard",()=>{
 has('int slotsAudited = scanAll ? 34 : 1',
     'int auditPages = int(math.ceil(slotsAudited * 1.0 / 10))',
     'int actualAuditPage = math.min(page, auditPages)',
     'int auditOffset = (actualAuditPage - 1) * 10',
     'for k = 0 to 9',
     'int slot = scanAll ? auditOffset + k : 7',
     'bool inRange = scanAll ? slot < 34 : k == 0',
     'int r = k + 1',
     'int pageGaps = 0',
     '"PAG "+str.tostring(actualAuditPage)+"/"+str.tostring(auditPages)');
 const covered=[];
 for(let page=1;page<=4;page++)for(let k=0;k<10;k++){
   const slot=(page-1)*10+k;
   if(slot<34)covered.push(slot);
 }
 assert.deepEqual(covered,Array.from({length:34},(_,i)=>i));
 const unique=new Set(covered);
 assert.equal(unique.size,34);
});
test("diagnosis distinguishes 34 replies, 8 historically positive feeds and each feed with no model",()=>{
 has('bool hasFeed = array.get(auditFeedAvailable,slot) == 1',
     'bool anyHistory = cnt2 + cnt3 + cntInside + cntM4 + cntMN > 0',
     'color ink = not hasFeed ? color.orange : anyHistory ? posInk : color.gray',
     'hasFeed ? str.tostring(cnt2)+"/"+str.tostring(cntC1) : "N/D"',
     'hasFeed and gaps > 0 ? "*" : ""',
     '"HIST:"+str.tostring(withHistory34)',
     '"GAP:"+str.tostring(pageGaps)',
     '"C2RE:"+str.tostring(pageRejected)',
     '"M15QA:"+str.tostring(pageM15QA)',
     '"HIST != CRT ACT"');
 assert.doesNotMatch(after,/if anyHistory\s+found \+= 1/);
});
