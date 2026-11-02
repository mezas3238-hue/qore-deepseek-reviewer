import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {classifyClosedH4,H4_MS,M5_MS} from "../src/crt-h4-completeness-qa.mjs";

const t=Date.parse("2026-11-01T05:00:00Z");
const full=({bucketStart=t,...overrides}={})=>({
 bucketStart,nextBucketStart:bucketStart+H4_MS,
 firstAt:bucketStart,lastEndAt:bucketStart+H4_MS,
 count:48,continuous:true,...overrides
});
const kind=d=>classifyClosedH4(d).kind;

test("48 continuous M5 in ordinary 4h closes as full",()=>{
 assert.deepEqual(classifyClosedH4(full()),{kind:"FULL",valid:true});
});
test("2026 NY fall-back 01–05 has 60 M5; DST not internal gap",()=>{
 assert.equal(kind(full({
  nextBucketStart:t+H4_MS+3600000,lastEndAt:t+H4_MS+3600000,count:60
 })),"DST_COMPLETE");
});
test("NY spring forward 01–05 has 36 M5; still blocked as CRT H4",()=>{
 assert.equal(kind(full({
  nextBucketStart:t+H4_MS-3600000,lastEndAt:t+H4_MS-3600000,count:36
 })),"DST_COMPLETE");
 assert.equal(classifyClosedH4(full({
  nextBucketStart:t+H4_MS-3600000,lastEndAt:t+H4_MS-3600000,count:36
 })).valid,false);
});
test("Forex session opening/closing and left edge of loaded history are partial, NOT internal lost-M5",()=>{
 assert.equal(kind(full({firstAt:t+M5_MS,count:47})),"SESSION_OR_PARTIAL");
 assert.equal(kind(full({lastEndAt:t+H4_MS-M5_MS,count:47})),"SESSION_OR_PARTIAL");
 assert.equal(kind(full({nextBucketStart:t+48*H4_MS,count:30,lastEndAt:t+30*M5_MS})),"SESSION_OR_PARTIAL");
});
test("a genuine M5 hole inside a time-bounded H4 is isolated",()=>{
 const hole=full({count:47,continuous:false});
 assert.equal(kind(hole),"INTERNAL_M5_GAP");
 assert.equal(kind({...hole,nextBucketStart:t+H4_MS+3600000,count:59,continuous:false,lastEndAt:t+H4_MS+3600000}),"INTERNAL_M5_GAP");
});
test("unknown/invalid metadata fails closed instead of producing a CRT",()=>{
 assert.throws(()=>kind(full({count:0})),TypeError);
 assert.throws(()=>kind(full({continuous:null})),TypeError);
});
const root="../../crt-radar-pro/";
const old=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10U_AUDITORIA_34_POR_SIMBOLO_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10V_C1_SESIONES_H4_NO_INTEGRADO.pine",import.meta.url),"utf8");
const txt=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10V_C1_SESIONES_H4_ANDROID_COPIAR.txt",import.meta.url),"utf8");
const count=(s,k)=>s.split(k).length-1;
test("Fix C1 count for ALL feeds without modifying CRT acceptance gate",()=>{
 assert.equal(txt,pine);
 assert.equal(count(pine,"request.security("),count(old,"request.security("));
 assert.equal(count(pine,"alert("),count(old,"alert("));
 assert.equal(count(pine,"plot("),count(old,"plot("));
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.match(pine,/if f_allowed\(lastC1Hour, isIndex\) and hour\(bucketH4, TZ\) == expectedC2[^\n]+\n\s*c2Active := true\n\s*\/\/ BUG corregido V34\.10v:[^\n]+\n\s*\/\/ Antes solo incrementaba en BTC pero audit2C sí\n\s*\/\/ sumaba Forex\/índices, generando el imposible 5\/0\.\n\s*qaC1Ready \+= 1\n\s*if isBTC\n\s*qaLastC2Gate/);
 const oldC1Branch='                if isBTC\n                    qaC1Ready += 1';
 assert.ok(old.includes(oldC1Branch));
 assert.ok(!pine.includes(oldC1Branch));
 assert.match(pine,/array\.set\(auditFeedC1, i, available \? nz\(s\.qaC1Ready, 0\) : 0\)/);
});
test("Three mutually exclusive H4 reasons; preserve conservative fullH4 gate",()=>{
 assert.match(pine,/bool fullH4 = h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket \+ H4MS/);
 assert.match(pine,/if not fullH4\n\s*qaAuditH4Incomplete \+= 1/);
 assert.match(pine,/bool exactDSTBlock = \(spanH4Ms == H4MS \+ 3600000 or spanH4Ms == H4MS - 3600000\)[^\n]+/);
 assert.match(pine,/if exactDSTBlock\n[^\n]+\n\s*qaAuditH4DST \+= 1\n\s*else if not h4Continuous\n[^\n]+\n\s*qaAuditH4Internal \+= 1\n\s*else\n[^\n]+\n[^\n]+\n\s*qaAuditH4Session \+= 1/);
 for(const key of ["DST","Session","Internal"]){
  assert.match(pine,new RegExp("    int auditH4"+key+"\\n"));
  assert.match(pine,new RegExp("    var int qaAuditH4"+key+" = 0"));
  assert.match(pine,new RegExp("qaAuditH4"+key+"[,)]"));
  assert.match(pine,new RegExp("array\\.set\\(auditFeedH4"+key+", i, available"));
 }
});
test("Per-market QA audit shows H4 reason labels and original per-symbol models",()=>{
 for(const label of ['"! M5 INTERNO"','"~ SES/PARC"','"D = DST"','"!M5:"','"~PAR:"','"DST:"']){
  assert.ok(pine.includes(label),label);
 }
 assert.match(pine,/string marker = internalH4 > 0 \? "!" : dstH4 > 0 \? "D" : sessionH4 > 0 \? "~" : ""/);
 assert.match(pine,/int auditPages = int\(math\.ceil\(slotsAudited \* 1\.0 \/ 10\)\)/);
 assert.match(pine,/bool showPerFeedAudit = modeDashboard == "Auditoría 34 por símbolo \(QA\)"/);
 assert.ok(pine.includes('modeDashboard = input.string("Solo CRT"'));
 assert.ok(pine.includes('useAlerts = input.bool(false'));
});
