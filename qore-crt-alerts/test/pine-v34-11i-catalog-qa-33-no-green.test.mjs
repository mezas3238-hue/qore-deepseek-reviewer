import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const before=load("CRT_RADAR_PRO_V34_11H_FASE_PROVEEDOR_33_QA_NO_LIVE.pine");
const after=load("CRT_RADAR_PRO_V34_11I_CATALOGO_QA_NO_SENALES_33.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const catalog=after.slice(after.indexOf('// V34.10z: COMPACTO by default'),after.indexOf("// V34.11b: read-only event snapshot"));

test("V34.11i never modifies 33-source CRT H4 + MSS M15 engine, BTC logic or data requests",()=>{
 assert.equal(engine(after),engine(before));
 assert.equal((after.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((after.match(/request\.security\(/g)||[]).length,(before.match(/request\.security\(/g)||[]).length);
 assert.equal((after.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(after.includes('h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
 assert.ok(after.includes('bool qaNativeM5Plus1 = qaPhase1NonBtc and not isBTC'));
});
test("Native +1minute 3C/M15 is never promoted to an operational CRT on any of the 33 slots",()=>{
 assert.ok(after.includes('bool scanCrtValid = available and (not qaPhase1NonBtc or i == 7) and st == 2'));
 assert.ok(after.includes('bool certifiedCRT = (not qaPhase1NonBtc or i == 7) and st == 2'));
 assert.ok(after.includes('bool ownCRTValid = (not qaPhase1NonBtc or chartBtcSymbol) and chartAvailable and own.phase == 2'));
 assert.ok(catalog.includes('bool good = requested and (not qaPhase1NonBtc or i == 7) and array.get(validCoreFlags,i)'));
 assert.ok(catalog.includes('bool core = (not qaPhase1NonBtc or i == 7) and array.get(validCoreFlags,i)'));
 assert.ok(catalog.includes('expandFull34 or core'));
});
test("The expanded seven-category screen never uses a green confirmed M15 check for 3C",()=>{
 assert.ok(catalog.includes('bool catM15Observed = cat3C and array.get(m15Flags,i) == 1'));
 assert.ok(catalog.includes('catM15Observed ? "3C M15 QA" : "3C ESP QA"'));
 assert.ok(catalog.includes('text_color=catalogExpanded ? cat3C ? color.orange : color.gray : stateTint'));
 assert.ok(!catalog.includes('"3C M15✓"'));
 assert.ok(catalog.includes('"EXP RECH"'));
 assert.ok(catalog.includes('"RT M15 QA"'));
 assert.ok(catalog.includes('"7 CAT QA"'));
 assert.ok(catalog.includes('expandFull34 ? "34 QA"'));
 assert.ok(catalog.includes('qaPhase1NonBtc ? "QA +1m"'));
});
test("BTCUSD remains a separate, unshifted reference and no push is activated",()=>{
 assert.ok(after.includes('bool qaNativeM5Plus1 = qaPhase1NonBtc and not isBTC'));
 assert.ok(after.includes('f_btc_crt_h4_ny(barT)'));
 assert.equal((after.match(/if useAlerts and not qaPhase1NonBtc and barstate\.isrealtime and alert5/g)||[]).length,1);
 assert.equal((after.match(/if useAlerts and not qaPhase1NonBtc and barstate\.isrealtime and alert15/g)||[]).length,1);
 assert.ok(after.includes('"NO PUSH"'));
});
test("Simple static simulation: experimental nonBTC never contributes to operational CRT count",()=>{
 const eligible=(nativeQa,slot,detected)=>detected&&(!nativeQa||slot===7);
 assert.equal(eligible(true,0,true),false); // AUDJPY
 assert.equal(eligible(true,33,true),false); // NZDCAD
 assert.equal(eligible(true,7,true),true); // BTCUSD (distinct engine)
 assert.equal(eligible(false,0,true),true); // candidate previous normal :00 path
 assert.equal(eligible(true,1,false),false);
});

test("Pine editor reported two syntax errors at bool/string: both declarations align with their enclosing block",()=>{
 const lines=after.split("\n");
 const i=lines.findIndex(line=>line.includes("bool catM15Observed ="));
 assert.ok(i>1);
 const indent=line=>(line.match(/^ */)||[""])[0].length;
 assert.equal(indent(lines[i-2]),20); // comment
 assert.equal(indent(lines[i-1]),20); // comment
 assert.equal(indent(lines[i]),20); // bool
 assert.equal(indent(lines[i+1]),20); // string
 assert.equal(indent(lines[i+2]),20); // adjacent same scope
 assert.equal(lines.filter(line=>line.includes("bool catM15Observed =")).length,1);
 assert.equal(lines.filter(line=>line.includes("string cat3Label =")).length,1);
});
test("Only V34.11i presentation changes: no irregular +1-space declarations in CRT catalog",()=>{
 const lines=after.split("\n");
 const begin=lines.findIndex(x=>x.includes("int categoryMask = array.get(qaCatalogPerFeed,i)"));
 const end=lines.findIndex((x,i)=>i>begin&&x.includes("displayedMobile += 1"));
 assert.ok(begin>0&&end>begin);
 for(const x of lines.slice(begin,end)){
  if(x.trim()&&!x.trim().startsWith("//")){
   assert.equal((x.match(/^ */)||[""])[0].length,20,
     "Unexpected scope indentation: "+x.trim().slice(0,65));
  }
 }
});
