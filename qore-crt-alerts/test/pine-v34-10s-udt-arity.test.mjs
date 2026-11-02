import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10S_MSS15_CAUSAL_FAMILIAS_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
function fields(type){
 const begin=pine.indexOf("type "+type+"\n");
 if(begin<0)throw Error(type+" missing");
 const from=pine.slice(begin+("type "+type+"\n").length);
 const to=from.search(/\n(?:type |f_add_context_fvg\()/);
 return from.slice(0,to<0?undefined:to).split("\n")
  .filter(line=>/^    (int|float|bool|string) \w+/.test(line))
  .map(line=>line.trim().split(/\s+/)[1]);
}
function constructorArgs(type){
 const key=type+".new(";
 const p=pine.indexOf(key);if(p<0)throw Error(key+" missing");
 let depth=1,quote=false,segment="",items=[];
 for(let k=p+key.length;k<pine.length;k++){
  const c=pine[k];
  if(c==='"'&&pine[k-1]!=="\\")quote=!quote;
  if(!quote){
   if(c==="(")depth++;
   if(c===")")depth--;
   if(c===","&&depth===1){items.push(segment.trim());segment="";continue;}
   if(depth===0){items.push(segment.trim());break;}
  }
  segment+=c;
 }
 return items;
}
test("Signal own-family M15 fields cannot shift old 99-argument UDT",()=>{
 const f=fields("Signal"),args=constructorArgs("Signal");
 assert.equal(f.length,99);
 assert.equal(args.length,f.length);
 const start=f.indexOf("extraFamilySweepAt");
 assert.deepEqual(f.slice(start,start+5),
  ["extraFamilySweepAt","extraFamilyM15Pivot","extraFamilyM15PivotAt",
   "extraFamilyM15At","extraFamilyM15C1"]);
 assert.deepEqual(args.slice(start,start+5),
  ["extraSweepAt","extraPivot15","extraPivotAt",
   "extraMssCausal ? extraMssAt : na","extraC1"]);
});
test("Inside and Multi-N UDT constructors match their frozen pivot data fields",()=>{
 assert.equal(fields("InsideCandidate").length,19);
 assert.equal(constructorArgs("InsideCandidate").length,19);
 assert.deepEqual(fields("InsideCandidate").slice(-3),["pivot15","pivot15At","mss15At"]);
 assert.deepEqual(constructorArgs("InsideCandidate").slice(-3),["na","na","na"]);
 assert.equal(fields("MultiNMssCandidate").length,8);
 assert.equal(constructorArgs("MultiNMssCandidate").length,8);
});
test("keep below TradingView 64 plot-count calls; no extra request.security or live alerts",()=>{
 assert.ok((pine.match(/\bplot\(/g)||[]).length<=64);
 assert.equal((pine.match(/request\.security\(/g)||[]).length,4);
 assert.equal((pine.match(/\balert\(/g)||[]).length,1);
 assert.match(pine,/useAlerts = input\.bool\(false/);
});
