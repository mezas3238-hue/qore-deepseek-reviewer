import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const dir="../../crt-radar-pro/";
const read=n=>readFileSync(new URL(dir+n,import.meta.url),"utf8");
const previous=read("CRT_RADAR_PRO_V34_10Z_COMPACTO_EXPANDIR_34_QA_NO_INTEGRADO.pine");
const current=read("CRT_RADAR_PRO_V34_11A_SIETE_CATEGORIAS_34_FEEDS_QA.pine");
const part=(s,start,end)=>{const i=s.indexOf(start),j=s.indexOf(end,i);assert.ok(i>=0&&j>i);return s.slice(i,j);};
const request=(s)=>part(s,"for i = 0 to 33\n    if scanAll or i == 7\n        string symbol","if str.length(alertsNow) > 0");
const sc=request(current),old=request(previous);
const render=current.slice(current.indexOf("// V34.10z: COMPACTO by default"));
const flags=[
 ["3C","category3C ? 1 : 0","cat3C = int(math.floor(categoryMask / 1)) % 2 == 1"],
 ["2C","category2CPending ? 2 : 0","cat2C = int(math.floor(categoryMask / 2)) % 2 == 1"],
 ["EXP","category2CExpansion ? 4 : 0","catExpansion = int(math.floor(categoryMask / 4)) % 2 == 1"],
 ["INS R","categoryInsideReturn ? 8 : 0","catInsideR = int(math.floor(categoryMask / 8)) % 2 == 1"],
 ["INS C","categoryInsideContinuation ? 16 : 0","catInsideC = int(math.floor(categoryMask / 16)) % 2 == 1"],
 ["MULTI","categoryMultiCandle ? 32 : 0","catMulti = int(math.floor(categoryMask / 32)) % 2 == 1"],
 ["RETEST","categoryM15Retest ? 64 : 0","catRetest = int(math.floor(categoryMask / 64)) % 2 == 1"]
];
test("Seven categories are an explicit mask per feed, without collapsing into one selected QA family",()=>{
 assert.ok(current.includes("int qaCatalogMask"));
 assert.ok(current.includes("var array<int> qaCatalogPerFeed = array.new_int(34, 0)"));
 assert.ok(sc.includes("array.set(qaCatalogPerFeed, i, available ? nz(s.qaCatalogMask, 0) : 0)"));
 assert.ok(current.includes("qaAuditC1BadClock, qaAuditC1BadData, qaAuditC1BadRange, qaCatalogMask)"));
 assert.ok(current.includes('plot(chartAvailable ? own.qaCatalogMask : na'));
 for(const [role,flag,decoder] of flags){
   assert.ok(current.includes(flag),role+" missing encoder");
   assert.ok(render.includes(decoder),role+" missing decoder");
 }
});
test("The 34 exact per-feed M5 requests and live alert conditions are preserved",()=>{
 assert.equal((sc.match(/request\.security\(/g)||[]).length,1);
 const clean=sc.replace("        array.set(qaCatalogPerFeed, i, available ? nz(s.qaCatalogMask, 0) : 0)\n","");
 assert.equal(clean,old);
 assert.equal((current.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((current.match(/request\.security\(/g)||[]).length,(previous.match(/request\.security\(/g)||[]).length);
 assert.ok(current.includes('useAlerts = input.bool(false,'));
 assert.ok(current.includes('calc_bars_count=1500'));
});
test("Only confirmed 3C contributes operational CRT; rejected/provisional classifications remain separate",()=>{
 assert.ok(current.includes('bool category3C = outPhase == 2 and outValid and outModel == "CRT_2C_RETURN"'));
 assert.ok(current.includes('bool category2CPending = outPhase == 1 and not na(outC1)'));
 assert.ok(current.includes('bool category2CExpansion = rejectedRecent'));
 assert.ok(current.includes('bool categoryInsideContinuation = insideContinuationNow'));
 assert.ok(current.includes('bool categoryM15Retest = retestVisible'));
 assert.ok(current.includes('if q.state == "CONTINUATION" and not na(endOfInsideH4)'));
 assert.ok(render.includes('"EXP RECH"'));
 assert.ok(render.includes('"CONT RECH"'));
 assert.ok(render.includes('"2C*"'));
});
test("Multicandle is independent from Inside return and records its separate taxonomy",()=>{
 assert.ok(current.includes('bool categoryInsideReturn = extraInside'));
 assert.ok(current.includes('bool categoryMultiCandle = extraMulti or extraMultiN'));
 assert.ok(current.includes('bool extraMssCausal = extraFamily'));
 assert.ok(current.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt and extraMssAt <= lastCompleteM15CloseAt'),
   "auxiliary MSS M15 must follow its own sweep; never recycle a pre-sweep confirmation");
 assert.ok(render.includes('catInsideR ? "RET QA"'));
 assert.ok(render.includes('catMulti ? "MULTI QA"'));
 assert.ok(render.includes('catRetest ? "RT M15 QA"'));
});
test("Compact mode stays focused on ratified 3C with M15 priority; seven QA only opt-in on expanded panel",()=>{
 assert.ok(current.includes('showCatalog7 = input.bool(false, "Ampliado: inspeccionar 7 categorias CRT (QA)"'));
 assert.ok(render.includes('bool catalogExpanded = expandFull34 and showCatalog7'));
 assert.ok(render.includes('int itemsPerPage = expandFull34 ? 4 : 2'));
 assert.ok(render.includes('bool core = array.get(validCoreFlags,i)'));
 assert.ok(render.includes('bool m15 = core and array.get(m15Flags,i) == 1'));
 assert.ok(render.includes('bool eligible = requested and rightPriority and (expandFull34 or core)'));
 assert.ok(render.includes('table.cell(board,1,0,catalogExpanded ? "3C/M15" : "CRT H4"'));
 assert.ok(render.includes('table.cell(board,5,0,catalogExpanded ? "RETEST" : "M15"'));
});
test("Mask encoding/decoding has independent 7-bit coverage for all 34 slots",()=>{
 const encode=values=>values.reduce((n,active,i)=>n+(active?2**i:0),0);
 const decode=(mask,bit)=>Math.floor(mask/bit)%2===1;
 for(let k=0;k<34;k++){
   const bits=Array.from({length:7},(_,i)=>(k+i)%3===0);
   const mask=encode(bits);
   assert.ok(mask>=0&&mask<=127);
   bits.forEach((expected,i)=>assert.equal(decode(mask,2**i),expected,`slot ${k} bit ${i}`));
 }
 assert.equal(encode([true,true,true,true,true,true,true]),127);
 assert.equal(encode([false,false,false,false,false,false,false]),0);
});
