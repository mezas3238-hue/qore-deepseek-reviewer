import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const MIN15=900_000;
const module=src.split("    // ---- CERRAR M15 ANTERIOR ----")[1].split("    // ---- M5A: CIERRE H1, FVG SIN LOOKAHEAD ----")[0];
const verify=(p,label)=>assert.ok(module.includes(p),label||p);
test("SOURCE: only a complete 15-minute candle can be processed",()=>{
 verify("bool fullM15 = m15Count == 3 and m15LastEnd == bucket15 and m15Start + MIN15 == m15LastEnd");
});
test("SOURCE: previous M15 must be temporally adjacent",()=>{
 assert.ok(src.includes("var int prev15End = na"));
 verify("bool prev15Continuous = not na(prev15End) and prev15End == m15Start and not na(prev15Close)");
});
test("SOURCE: absence of prior close cannot trigger bullish or bearish cross",()=>{
 assert.ok(!module.includes("na(prev15Close) or"));
 verify("bool eligible15 = prev15Continuous and (c2Dir == 1");
 verify("bool eligible15 = prev15Continuous and (c3Dir == 1");
});
test("SOURCE: valid closure retains last end and last close",()=>{
 verify("prev15Close := m15Close");
 verify("prev15End := m15LastEnd");
});
test("SOURCE: missing bars reset previous close/end and pivot history",()=>{
 assert.equal(module.split("prev15Close := na").length-1,2);
 assert.equal(module.split("prev15End := na").length-1,2);
 assert.equal(module.split("array.clear(highs15)").length-1,2);
 assert.equal(module.split("array.clear(lows15)").length-1,2);
 assert.equal(module.split("array.clear(times15)").length-1,2);
});
test("SOURCE: both M15 and M5 paths remain distinct",()=>{
 assert.ok(src.includes("bool cross5c3"));
 assert.ok(src.includes("c2M5At := barEnd"));
 assert.ok(src.includes("c3M5At := barEnd"));
 assert.ok(src.includes("if eligible15 and na(c2M15At)"));
 assert.ok(src.includes("if eligible15 and na(c3M15At)"));
});
test("SOURCE: 34 feeds + chart, strict C1 sessions, FVG QA payload preserved",()=>{
 assert.equal(src.split("\n").filter(x=>/^s\d\d = input\.symbol/.test(x)).length,34);
 assert.equal(src.split("\n").filter(x=>x.includes("request.security(")&&!x.trimStart().startsWith("//")).length,2);
 assert.equal(src.split("\n").filter(x=>x.includes('title="QA FVG ')).length,14);
 assert.equal(src.split("\n").filter(x=>x.includes('title="QA CRT ')).length,10);
 assert.ok(src.includes('scheduleMode = input.string("Solo C1 de tres horarios NY"'));
});
test("SOURCE: any invalid M15 invalidates swings, not the CRT/M5",()=>{
 const reset=module.split("if barT != m15LastEnd")[1].split("else if m15Count >= 0")[0];
 for(const word of ["prev15Close := na","prev15End := na","array.clear(highs15)","array.clear(lows15)","array.clear(times15)","lastHigh15At := na","lastLow15At := na"])assert.ok(reset.includes(word),word);
 assert.ok(!reset.includes("c2Active := false"));
 assert.ok(!reset.includes("c3Active := false"));
});
function state(){return {prevClose:null,prevEnd:null,pivots:[98,100,103],events:[]};}
function close15(s,{start,end=start+MIN15,close,valid=true,pivot=100,dir=1,stage="C2",sweepEnd=start-5*60_000}){
 const complete=valid && end-start===MIN15;
 if(!complete){
  s.prevClose=null;s.prevEnd=null;s.pivots=[];
  return false;
 }
 const consecutive=s.prevEnd!==null&&s.prevEnd===start&&s.prevClose!==null;
 const eligible=consecutive && end>sweepEnd && (dir===1 ? close>pivot && s.prevClose<=pivot : close<pivot && s.prevClose>=pivot);
 s.prevClose=close;s.prevEnd=end;
 if(eligible)s.events.push({at:end,stage,dir});
 return eligible;
}
test("MODEL: contiguous two closed M15 bullish crossing is valid",()=>{
 const s=state();
 assert.equal(close15(s,{start:0,close:99}),false);
 assert.equal(close15(s,{start:MIN15,close:101,sweepEnd:MIN15+60_000}),true);
 assert.equal(s.events.length,1);
});
test("MODEL: contiguous two closed M15 bearish crossing is valid",()=>{
 const s=state();
 close15(s,{start:0,close:101,dir:-1});
 assert.equal(close15(s,{start:MIN15,close:99,dir:-1,sweepEnd:MIN15+60_000}),true);
});
test("MODEL: no crossing with missing previous M15 even when price is beyond pivot",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 assert.equal(close15(s,{start:2*MIN15,close:101}),false);
 assert.equal(s.events.length,0);
});
test("MODEL: after gap, next complete M15 starts new chain, not synthetic break",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 close15(s,{start:MIN15,valid:false,close:100});
 assert.equal(s.pivots.length,0);
 assert.equal(close15(s,{start:2*MIN15,close:102}),false);
 assert.equal(close15(s,{start:3*MIN15,close:102}),false);
});
test("MODEL: after gap, real new crossing is allowed with two adjacent M15",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 close15(s,{start:MIN15,valid:false,close:100});
 close15(s,{start:2*MIN15,close:99});
 assert.equal(close15(s,{start:3*MIN15,close:101,sweepEnd:3*MIN15+60_000}),true);
});
test("MODEL: weekend opening cannot use Friday closing price as crossing",()=>{
 const s=state();
 close15(s,{start:0,close:98});
 assert.equal(close15(s,{start:3*24*60*60_000,close:102}),false);
});
test("MODEL: M15 candle with incomplete duration cannot validate or advance chain",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 assert.equal(close15(s,{start:MIN15,end:MIN15+600_000,close:101}),false);
 assert.equal(s.prevEnd,null);
});
test("MODEL: crossing only counts after strict sweep",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 assert.equal(close15(s,{start:MIN15,close:101,sweepEnd:3*MIN15}),false);
});
test("MODEL: C3 MSS uses same continuity and pivot criteria",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 const ok=close15(s,{start:MIN15,close:101,stage:"C3",sweepEnd:60_000});
 assert.equal(ok,true);
 assert.deepEqual(s.events.map(e=>e.stage),["C3"]);
});
test("MODEL: bear crossing after gap similarly must not fire",()=>{
 const s=state();
 close15(s,{start:0,close:101,dir:-1});
 assert.equal(close15(s,{start:2*MIN15,close:99,dir:-1}),false);
});
test("MODEL: same-side continuation isn't a new crossing",()=>{
 const s=state();
 close15(s,{start:0,close:101});
 assert.equal(close15(s,{start:MIN15,close:102}),false);
});
test("MODEL: equal threshold doesn't count as a cross close",()=>{
 const s=state();
 close15(s,{start:0,close:99});
 assert.equal(close15(s,{start:MIN15,close:100}),false);
});
test("MODEL: previous close on exactly pivot can yield valid upward crossing",()=>{
 const s=state();
 close15(s,{start:0,close:100});
 assert.equal(close15(s,{start:MIN15,close:101,sweepEnd:MIN15+60_000}),true);
});
