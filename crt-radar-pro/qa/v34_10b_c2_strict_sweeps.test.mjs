import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=n=>readFileSync(new URL(n,root),"utf8");
const original=read("CRT_RADAR_PRO_V34_10B_QA_FVG_OBSERVABILIDAD_NO_INTEGRADO.pine");
const fixed=read("CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine");
const block=s=>s.split("    // ---- BARRIDA Y RETORNO C2 (velas M5 cerradas) ----")[1].split("    // ---- MSS en C3 ratificada (misma direccion, mismo swing congelado) ----")[0];
const nameBefore='indicator("CRT + MSS M5/M15 | V34.10b QA FVG OBSERVABILIDAD NO INTEGRADO", shorttitle="CRT MSS QA FVG"';
const nameAfter='indicator("CRT + MSS M5/M15 | V34.10b QA BARRIDA ESTRICTA NO INTEGRADO", shorttitle="CRT MSS QA C2"';
test("REGRESSION: untouched CRT/FVG/MSS/alerts/UI, exact C2 block plus title changed",()=>{
 assert.equal(original.replace(nameBefore,nameAfter).replace(block(original),block(fixed)),fixed);
});
test("REGRESSION: strict C1/C2/C3 NY schedules unchanged",()=>{
 for(const p of ['scheduleMode = input.string("Solo C1 de tres horarios NY"',
   'hh == 2 or hh == 6 or hh == 22',
   'hh == 1 or hh == 5 or hh == 21',
   'hour(bucketH4, TZ) == expectedC2',
   'c3Active := true',
   'bool validC2Data = h4Continuous']) assert.ok(fixed.includes(p),p);
});
test("REGRESSION: 34 symbols, 2 lower-TF requests and 14 FVG data-window plots",()=>{
 assert.equal(fixed.split("\n").filter(x=>/^s\d\d = input\.symbol/.test(x)).length,34);
 assert.equal(fixed.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//")).length,2);
 assert.equal(fixed.split("\n").filter(x=>x.includes('title="QA FVG ')).length,14);
});
test("REGRESSION: true double sweeps only; touching one limit must not set c2Double",()=>{
 const b=block(fixed);
 assert.ok(b.includes("if strictLow and strictHigh"));
 assert.ok(b.includes("if c2StrictSweep and oppositeStrict"));
 assert.ok(b.includes("if not c2StrictSweep and oppositeStrict and not chosenStrict"));
 assert.ok(b.includes("else if allowTouches and touchLow != touchHigh"));
 assert.ok(!b.includes("bool compareOther = allowTouches"));
 assert.ok(!b.includes("c2Double := c2Double or"));
 assert.ok(b.includes("bool firstStrictSweep = not c2StrictSweep and chosenStrict"));
 assert.ok(b.includes("c2SweepEnd := barEnd"));
});
test("REGRESSION: no MSS granted from boundary touch only",()=>{
 const b=block(fixed);
 assert.ok(b.indexOf("if firstStrictSweep") < b.indexOf("c2StrictSweep := true"));
 assert.ok(b.includes("if c2StrictSweep and barT >= c2SweepEnd and cross5 and na(c2M5At)"));
});
function state(o={}){return {dir:0,strict:false,double:false,sweepEnd:null,returned:false, ...o};}
function step(s,{lo=104,hi=106,close=105,bar=0,allowTouches=true},range={lo:100,hi:110}){
 const strictLow=lo<range.lo,strictHigh=hi>range.hi;
 const touchLow=lo<=range.lo,touchHigh=hi>=range.hi;
 if(strictLow&&strictHigh) s.double=true;
 if(s.dir===0&&!s.double){
  if(strictLow!==strictHigh)s.dir=strictLow?1:-1;
  else if(allowTouches&&touchLow!==touchHigh)s.dir=touchLow?1:-1;
 }
 if(s.dir!==0&&!s.double){
  let own=s.dir===1?strictLow:strictHigh;
  let opposite=s.dir===1?strictHigh:strictLow;
  if(!s.strict&&opposite&&!own){s.dir=-s.dir;own=true;opposite=false;s.returned=false;}
  if(s.strict&&opposite)s.double=true;
  if(!s.double){
   if(!s.strict&&own){s.strict=true;s.sweepEnd=bar;s.returned=false;}
   s.returned ||= close>=range.lo&&close<=range.hi;
  }
 }
 return s;
}
const seq=bars=>bars.reduce((s,b,i)=>step(s,{...b,bar:i+1}),state());
test("REPRO original false rejection: low equal touch -> later high strict sweep = SHORT only",()=>{
 let s=seq([{lo:100,hi:105},{lo:103,hi:111,close:108}]);
 assert.deepEqual({dir:s.dir,strict:s.strict,double:s.double,sweepEnd:s.sweepEnd},{dir:-1,strict:true,double:false,sweepEnd:2});
});
test("SYMMETRIC: high equal touch -> later low strict sweep = LONG only",()=>{
 let s=seq([{hi:110,lo:105},{hi:107,lo:99,close:103}]);
 assert.deepEqual({dir:s.dir,strict:s.strict,double:s.double,sweepEnd:s.sweepEnd},{dir:1,strict:true,double:false,sweepEnd:2});
});
test("STRICT LONG + opposite exact high is not DOUBLE",()=>{
 const s=seq([{lo:99,hi:110},{lo:103,hi:109}]);
 assert.equal(s.dir,1);assert.equal(s.strict,true);assert.equal(s.double,false);
});
test("STRICT SHORT + opposite exact low is not DOUBLE",()=>{
 const s=seq([{lo:100,hi:111},{lo:101,hi:107}]);
 assert.equal(s.dir,-1);assert.equal(s.strict,true);assert.equal(s.double,false);
});
test("STRICT LOW + later STRICT HIGH means DOUBLE",()=>{
 const s=seq([{lo:99},{hi:111}]);assert.equal(s.double,true);
});
test("STRICT HIGH + later STRICT LOW means DOUBLE",()=>{
 const s=seq([{hi:111},{lo:99}]);assert.equal(s.double,true);
});
test("both extremes STRICT on one M5 means DOUBLE",()=>{
 const s=seq([{lo:99,hi:111}]);assert.equal(s.double,true);assert.equal(s.strict,false);
});
test("both edges EXACT on one M5: no strict, no double",()=>{
 const s=seq([{lo:100,hi:110}]);assert.equal(s.double,false);assert.equal(s.strict,false);assert.equal(s.dir,0);
});
test("both edges EXACT then strict up selects SHORT",()=>{
 const s=seq([{lo:100,hi:110},{lo:103,hi:111}]);assert.equal(s.double,false);assert.equal(s.dir,-1);assert.equal(s.strict,true);
});
test("touch alone remains provisional when enabled",()=>{
 const s=seq([{lo:100,hi:105}]);assert.equal(s.dir,1);assert.equal(s.strict,false);assert.equal(s.double,false);
});
test("touch alone produces no candidate when disabled",()=>{
 const s=step(state(),{lo:100,hi:105,allowTouches:false});assert.equal(s.dir,0);assert.equal(s.strict,false);
});
test("strict sweep works when touches disabled",()=>{
 const s=step(state(),{lo:99,hi:105,allowTouches:false});assert.equal(s.dir,1);assert.equal(s.strict,true);
});
test("equal touch and then same-side strict fixes sweepAt to actual bar",()=>{
 const s=seq([{lo:100},{lo:99,hi:105}]);assert.equal(s.sweepEnd,2);
});
test("multiple provisional touches same side don't get marked as strict",()=>{
 const s=seq([{lo:100},{lo:100},{lo:99}]);assert.equal(s.sweepEnd,3);assert.equal(s.double,false);
});
test("exact touches only never satisfy strict H4 ratification gate",()=>{
 const s=seq([{lo:100,hi:106,close:105},{lo:101,hi:110,close:105}]);
 assert.equal(s.strict,false);assert.equal(s.double,false);
});
test("opposite strict after preliminary touch chooses real direction and captures return",()=>{
 const s=seq([{lo:100},{hi:111,lo:102,close:105}]);assert.equal(s.dir,-1);assert.equal(s.strict,true);assert.equal(s.returned,true);assert.equal(s.double,false);
});
test("strict on same candle plus equal opposite survives",()=>{
 const s=seq([{lo:99,hi:110,close:105}]);assert.equal(s.dir,1);assert.equal(s.double,false);
});
test("strict high then strict low cannot reverse confirmed direction",()=>{
 const s=seq([{hi:111},{lo:99}]);assert.equal(s.dir,-1);assert.equal(s.double,true);
});
test("strict low then strict high cannot reverse confirmed direction",()=>{
 const s=seq([{lo:99},{hi:111}]);assert.equal(s.dir,1);assert.equal(s.double,true);
});
