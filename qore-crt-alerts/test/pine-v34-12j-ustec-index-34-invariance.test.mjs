import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {OBSERVED_IC34_CANDIDATES}
 from "../src/qa-ctrader-full34-m5-cohort.mjs";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {C1_HOURS} from "../src/ny-clock.mjs";

const FILES=Object.freeze([
 {title:"Radar A",old:"QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine",
  neu:"QORE_CRT_RADAR_A_34_MERCADOS_V34_12_J_USTEC_INDEX_QA_NO_LIVE.pine",
  prev:'indicator("QORE CRT RADAR | 34 mercados MSS5 EXTRA V34.12I QA", shorttitle="QORE CRT Radar 12I",',
  next:'indicator("QORE CRT RADAR | 34 mercados USTEC INDEX V34.12J QA", shorttitle="QORE CRT Radar 12J",'},
 {title:"Chart B",old:"QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine",
  neu:"QORE_CRT_CHART_B_C1_MSS_V34_12_J_USTEC_INDEX_QA_NO_LIVE.pine",
  prev:'indicator("QORE CRT CHART | MSS5 EXTRA V34.12I QA", shorttitle="QORE CRT Chart 12I",',
  next:'indicator("QORE CRT CHART | USTEC INDEX V34.12J QA", shorttitle="QORE CRT Chart 12J",'}
]);
const load=filename=>readFileSync(new URL("../../crt-radar-pro/"+filename,import.meta.url),"utf8");
function replaceOne(text,from,to){
 assert.equal(text.split(from).length-1,1,"replacement precondition "+from);
 return text.replace(from,to);
}
const MARKER="// V34.12J QA: exact IC:USTEC identifier must resolve to index even if\n"+
"// TradingView exposes the CFD feed as a non-index syminfo.type. This only\n"+
"// fixes chart-family classification, NOT the sovereign 02/06/22 H4 C1.\n";
function modeledIndexRouting(source,ticker,{type="cfd",userCsv}={}){
 const fnStart=source.indexOf("f_index() =>");
 const fnEnd=source.indexOf("\nf_allowed(",fnStart);
 assert.ok(fnStart>0&&fnEnd>fnStart);
 const fn=source.slice(fnStart,fnEnd);
 const defaults=source.match(/idxList\s*=\s*input\.string\("([^"]+)"/);
 assert.ok(defaults);
 const candidates=(userCsv??defaults[1]).toUpperCase().replace(/\s+/g,"").split(",");
 const terms=[...fn.matchAll(/str\.contains\(name,\s*"([^"]+)"\)/g)]
   .map(x=>x[1]);
 const tickerUpper=ticker.toUpperCase();
 return type==="index"||candidates.includes(tickerUpper)||
   terms.some(x=>tickerUpper.includes(x))||
   (/name\s*==\s*"USTEC"/.test(fn)&&tickerUpper==="USTEC");
}
test("A and B new Pine are byte-for-byte V34.12I except identity fallback, roster and metadata",()=>{
 for(const x of FILES){
  const old=load(x.old),now=load(x.neu);
  let expected=replaceOne(old,x.prev,x.next);
  expected=replaceOne(expected,"NAS100USD,US500,US30,US100,SPX500,US2000,DE40",
    "NAS100USD,USTEC,US500,US30,US100,SPX500,US2000,DE40");
  expected=replaceOne(expected,'or str.contains(name,"HK50")',
    'or str.contains(name,"HK50") or name == "USTEC"');
  expected=replaceOne(expected,"f_index() =>\n    string name",
    MARKER+"f_index() =>\n    string name");
  assert.equal(now,expected, x.title+" must preserve every other source byte");
  assert.ok(now.startsWith("//@version=6"));
  assert.ok(now.includes('bool exact = indexFamily ? (hh == 2 or hh == 6 or hh == 22)'));
  assert.ok(now.includes('bool anyH4 = indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22)'));
  assert.ok(now.includes("f_index_crt_h4_ny(int t) =>"));
  assert.ok(now.includes('qaPhase1NonBtc = input.bool(false,'));
  assert.ok(!/\b(strategy\.entry|strategy\.order|alert\(|alertcondition\()/.test(now));
 }
});
test("all 34 observed native symbols stay in their original families except only exact IC:USTEC correction",()=>{
 assert.equal(INSTRUMENTS.length,34);
 assert.equal(OBSERVED_IC34_CANDIDATES.length,34);
 assert.deepEqual(INSTRUMENTS.map(x=>x.id),
  OBSERVED_IC34_CANDIDATES.map(x=>x.instrumentId));
 for(const x of FILES){
  const old=load(x.old),now=load(x.neu);
  const diffs=[];
  for(const row of OBSERVED_IC34_CANDIDATES){
   assert.equal(row.tvSymbol,"IC:"+row.nativeName);
   const prior=modeledIndexRouting(old,row.nativeName,{type:"cfd"});
   const after=modeledIndexRouting(now,row.nativeName,{type:"cfd"});
   if(prior!==after)diffs.push(row.instrumentId);
   if(["NDX100","SPX500","US30"].includes(row.instrumentId))
    assert.equal(after,true,row.instrumentId+" must be index");
   else assert.equal(after,false,row.instrumentId+" must not turn index");
  }
  assert.deepEqual(diffs,["NDX100"]);
 }
});
test("USTEC remains an index even after customizing CSV and even with non-index syminfo.type",()=>{
 for(const x of FILES){
  const content=load(x.neu);
  for(const type of ["cfd","forex","crypto","stock","undefined"]){
   assert.equal(modeledIndexRouting(content,"USTEC",{
    type,userCsv:"NAS100,US500,US30"
   }),true);
   assert.equal(modeledIndexRouting(content,"NOTUSTEC",{
    type,userCsv:"NAS100,US500,US30"
   }),false);
  }
 }
 assert.deepEqual(C1_HOURS.index,[2,6,22]);
 assert.deepEqual(C1_HOURS.forex,[1,5,21]);
 assert.deepEqual(C1_HOURS.crypto,[1,5,21]);
});
test("Radar scans 34 by default, Chart scans its own chart only; neither file permits alerts",()=>{
 const a=load(FILES[0].neu),b=load(FILES[1].neu);
 assert.ok(a.includes('memoryScan = input.string("34 instrumentos (experimental)"'));
 assert.ok(a.includes("f_engine() =>"));
 assert.ok(b.includes("f_engine() =>"));
 assert.ok(b.includes("CHART B: no escanea otros 33 feeds ni muestra dashboard."));
 assert.ok(a.includes("Esta version NO autoriza enviar alertas a Android o trading live."));
 assert.ok(b.includes("Esta version NO autoriza enviar alertas a Android o trading live."));
});
