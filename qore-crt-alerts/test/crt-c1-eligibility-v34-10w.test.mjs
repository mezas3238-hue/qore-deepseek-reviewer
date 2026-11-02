import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectC1H4} from "../src/crt-c1-eligibility-qa.mjs";
const H4=14_400_000, M5=300_000, base=Date.parse("2026-11-02T06:00:00Z");
const f=(override={})=>inspectC1H4({
 startHourNY:1,allowedHoursNY:[1,5,21],
 nextHourNY:5,firstAt:base,bucketAt:base,endAt:base+H4,
 nextBucketAt:base+H4,count:48,minBars:25,continuous:true,
 high:110,low:100,isBTC:false,...override
});
test("C1 eligible for all providers with correct NY clock and H4 continuity",()=>{
 assert.equal(f().result,"C1_READY");
 assert.equal(f({isBTC:true}).result,"C1_READY");
 assert.equal(f({startHourNY:2,allowedHoursNY:[2,6,22],nextHourNY:6}).result,"C1_READY");
});
test("one and only one rejection category for a C1-hour bucket",()=>{
 assert.equal(f({startHourNY:9}).result,"NOT_C1_HOUR");
 assert.equal(f({nextHourNY:6,continuous:false}).result,"REJECT_CLOCK");
 assert.equal(f({continuous:false,high:50,low:50}).result,"REJECT_DATA");
 assert.equal(f({high:100,low:100}).result,"REJECT_RANGE");
 assert.equal(f({firstAt:base+M5}).result,"REJECT_DATA");
 assert.equal(f({count:15}).result,"REJECT_DATA");
});
test("BTC fail-closed exactly 48 M5 while Forex uses minimum bars and alignment",()=>{
 assert.equal(f({count:30,isBTC:false}).result,"C1_READY");
 assert.equal(f({count:30,isBTC:true}).result,"REJECT_DATA");
 assert.equal(f({isBTC:true,endAt:base+H4-M5}).result,"REJECT_DATA");
});
test("missing metadata cannot silently pass eligibility",()=>{
 assert.throws(()=>f({count:NaN}),TypeError);
 assert.throws(()=>f({continuous:null}),TypeError);
});
const root="../../crt-radar-pro/";
const before=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10V_C1_SESIONES_H4_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const android=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_ANDROID_COPIAR.txt",import.meta.url),"utf8");
const count=(s,key)=>s.split(key).length-1;
test("No new requests/alerts/plots, keep 34 tickers, preserve default Solo CRT",()=>{
 assert.equal(pine,android);
 for(const v of ["request.security(","alert(","plot("])assert.equal(count(pine,v),count(before,v),v);
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(pine.includes('modeDashboard = input.string("Solo CRT"'));
 assert.ok(pine.includes('useAlerts = input.bool(false'));
 assert.ok(pine.includes('memoryScan = input.string("34 instrumentos (experimental)"'));
 assert.ok(pine.includes('if scanCrtValid\n            if m5t > 0'));
});
test("C1 structural gate unchanged, only split into exclusive QA causes",()=>{
 const old=before.match(/if f_allowed\(lastC1Hour, isIndex\) and hour\(bucketH4, TZ\) == expectedC2[^\n]+/);
 assert.ok(old);
 for(const needle of [
  'bool c1AllowedHour = f_allowed(lastC1Hour, isIndex)',
  'bool c1AlignedNext = hour(bucketH4, TZ) == expectedC2',
  'bool c1CompleteData = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4 and (isBTC ? (h4Count == 48 and bucketH4 - h4Bucket == H4MS) : h4Count >= minBarsC1)',
  'bool c1HasRange = h4High > h4Low',
  'if c1AllowedHour and c1AlignedNext and c1CompleteData and c1HasRange',
  'c2Active := true\n                // BUG corregido V34.10v:',
  'qaC1Ready += 1',
  'qaAuditC1H4Closed += 1',
  'if not c1AlignedNext\n                    qaAuditC1BadClock += 1',
  'else if not c1CompleteData\n                    qaAuditC1BadData += 1',
  'else if not c1HasRange\n                    qaAuditC1BadRange += 1'
 ]) assert.ok(pine.includes(needle),needle);
});
test("Every per-34 Signal field and dashboard metric is populated from same 34 requests",()=>{
 for(const field of ["C1H4Closed","C1HourCandidates","C1BadClock","C1BadData","C1BadRange"]){
  assert.ok(pine.includes("    int audit"+field+"\n"),field+" UDT");
  assert.ok(pine.includes("    var int qaAudit"+field+" = 0"),field+" state");
  assert.ok(pine.includes("qaAudit"+field),field+" returned");
 }
 for(const f of ["H4Closed","C1Hours","C1Clock","C1Data","C1Range"]){
  assert.ok(pine.includes("var array<int> auditFeed"+f+" = array.new_int(34, 0)"),f);
  assert.ok(pine.includes("array.set(auditFeed"+f+", i, available ? nz(s."),f);
 }
 assert.ok(pine.includes('if showC1Audit\n            table.clear(board,0,0,5,14)'));
 for(const label of ['"H4/CAND"','"C1 OK"','"HORA"','"DATOS"','"RANGO"','"NO SENAL"'])
  assert.ok(pine.includes(label),label);
});
test("C1 audit remains opt-in and scans only four pages of ten slots",()=>{
 assert.ok(pine.includes('bool showC1Audit = modeDashboard == "Auditoría C1 34 (QA)"'));
 assert.ok(pine.includes('int c1AuditedCount = scanAll ? 34 : 1'));
 assert.ok(pine.includes('int c1Pages = int(math.ceil(c1AuditedCount * 1.0 / 10))'));
 assert.ok(pine.includes('int slot = scanAll ? c1Offset + k : 7'));
 let slots=[];for(let page=1;page<=4;page++)for(let k=0;k<10;k++){const index=(page-1)*10+k;if(index<34)slots.push(index);}
 assert.deepEqual(slots,Array.from({length:34},(_,i)=>i));
});
