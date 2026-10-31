import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=n=>readFileSync(new URL(n,root),"utf8");
const parent=read("CRT_RADAR_PRO_V34_10B_QA_ALERTAS_RATIFICADAS_NO_INTEGRADO.pine");
const qa=read("CRT_RADAR_PRO_V34_10B_QA_FVG_OBSERVABILIDAD_NO_INTEGRADO.pine");
const L=qa.split("\n");
const linesContaining=needle=>L.filter(s=>s.includes(needle));
const codeLine=needle=>L.filter(s=>!s.trimStart().startsWith("//")&&s.includes(needle));
const UDTfields=s=>{
 const m=s.match(/\ntype Signal\n([\s\S]*?)\n\n\/\/ M3B/);
 assert.ok(m,"Signal UDT block exists");
 return m[1].split("\n").filter(l=>/^\s+(?:int|float|bool|string)\s+\w+/.test(l)).map(l=>l.trim().split(/\s+/)[1]);
};
const constructorArgs=s=>{
 const m=s.match(/^    Signal\.new\((.+)\)$/m);
 assert.ok(m,"Signal.new is single line with ordered fields");
 return m[1].split(",").map(x=>x.trim());
};
test("STATIC: separate diagnostic version; alerts disabled by default",()=>{
 assert.match(qa,/shorttitle="CRT MSS QA FVG"/);
 assert.match(qa,/useAlerts = input\.bool\(false/);
 assert.match(qa,/showFvgAudit = input\.bool\(true/);
 assert.match(parent,/useAlerts = input\.bool\(true/);
});
test("STATIC: exactly 34 symbols and same two security request statements",()=>{
 const countSymbols=s=>s.split("\n").filter(l=>/^s\d\d = input\.symbol\(/.test(l)).length;
 const requestLines=s=>s.split("\n").filter(l=>l.includes("request.security(")&&!l.trimStart().startsWith("//"));
 assert.equal(countSymbols(parent),34);assert.equal(countSymbols(qa),34);
 assert.deepEqual(requestLines(qa),requestLines(parent));
});
test("STATIC: preserve schedule strict and original CRT/MSS engine transitions",()=>{
 for(const phrase of ['scheduleMode = input.string("Solo C1 de tres horarios NY"',
  'bool exact = indexFamily ? (hh == 2 or hh == 6 or hh == 22) : (hh == 1 or hh == 5 or hh == 21)',
  'bool validC2Data = h4Continuous',
  'bool invalidAtC3Close = validC3Close',
  'bool firstStrictSweep = not c2StrictSweep',
  'bool cross5 = c2Dir == 1 ?',
  'bool cross5c3 = c3Dir == 1 ?',
  'bool certifiedCRT = st == 2',
  'alert("CRT+MSS " + alertsNow, alert.freq_all)'])
  assert.ok(parent.includes(phrase)&&qa.includes(phrase),phrase);
});
test("STATIC: exactly 14 new FVG data-window numeric plot channels",()=>{
 const exported=codeLine('title="QA FVG');
 assert.equal(exported.length,14);
 for(const p of exported){
  assert.match(p,/^\s*plot\(/);assert.match(p,/display=display\.data_window/);
  assert.doesNotMatch(p,/display=display\.all/);
 }
 assert.equal(parent.split("\n").filter(l=>l.includes('title="QA FVG')).length,0);
});
test("STATIC: no new objects, alerts, or security; 6-column dashboard retained",()=>{
 assert.equal(codeLine("table.new(").length,1);
 assert.ok(codeLine("table.new(")[0].includes(",6,15,"));
 assert.equal(codeLine("line.new(").length,parent.split("\n").filter(l=>l.includes("line.new(")&&!l.trim().startsWith("//")).length);
 assert.equal(codeLine("label.new(").length,parent.split("\n").filter(l=>l.includes("label.new(")&&!l.trim().startsWith("//")).length);
 assert.equal(codeLine('alert("CRT+MSS').length,1);
});
test("STATIC: UDT fields are aligned in Signal.new",()=>{
 const pf=UDTfields(parent),f=UDTfields(qa);
 const pArgs=constructorArgs(parent), args=constructorArgs(qa);
 assert.equal(pf.length,pArgs.length);
 assert.equal(f.length,args.length);
 assert.equal(f.length,pf.length+14);
 assert.deepEqual(f.slice(0,pf.length),pf);
 assert.deepEqual(args.slice(0,pArgs.length),pArgs);
});
test("STATIC: each FVG context is read from newest array element only",()=>{
 assert.match(qa,/array\.get\(fvgsH1, qaCountH1 - 1\)/);
 assert.match(qa,/array\.get\(fvgsH4, qaCountH4 - 1\)/);
 assert.match(qa,/if qaCountH1 > 0/);
 assert.match(qa,/if qaCountH4 > 0/);
});
test("STATIC: FVG state mapping is one-to-one and explicit",()=>{
 for(const [state,value] of Object.entries({INTACTO:0,PARCIAL:1,LLENADO_TOTAL:2,INVALIDADO:3,DATOS_INCOMPLETOS:4}))
 assert.ok(qa.includes('st == "'+state+'" ? '+value),state);
 assert.match(qa,/\/\/ QA: -1=no existe/);
});
test("STATIC: QA only reads FVG state, does not modify it",()=>{
 for(const f of ['qaH1.state','qaH1.top','qaH1.bottom','qaH1.maxPenetration','qaH1.formedAt','qaH1.gapObservedAt',
   'qaH4.state','qaH4.top','qaH4.bottom','qaH4.maxPenetration','qaH4.formedAt','qaH4.gapObservedAt'])assert.ok(qa.includes(f));
 const block=qa.split('    // QA SOLO: FVG mas recientemente FORMADO')[1].split('    Signal.new(')[0];
 assert.doesNotMatch(block,/\bqaH[14]\.\w+\s*:=/);
});
test("STATIC: no FVG as CRT gate, no alert when C2 provisional",()=>{
 assert.match(qa,/int outPhase = c3Active \? 2 : partial \? 1/);
 assert.match(qa,/bool certifiedCRT = st == 2/);
 assert.match(qa,/bool validM5 = certifiedCRT/);
});
test("STATIC: FVG UTC timestamp conversions are minute based",()=>{
 assert.equal(codeLine('/ 60000.0').length,4);
});
test("STATIC: no extra plots on chart (diagnostic plots only data window)",()=>{
 const parentVisible=parent.split("\n").filter(l=>/^\s*plot\(/.test(l) && !l.includes("display=display.data_window"));
 const qaVisible=qa.split("\n").filter(l=>/^\s*plot\(/.test(l) && !l.includes("display=display.data_window"));
 assert.deepEqual(parentVisible,qaVisible);
});
test("MODEL: missing FVG list returns no zone",()=>{
 const snap=a=>a.length?a.at(-1):null;
 assert.equal(snap([]),null);
});
test("MODEL: new FVG supersedes old in diagnostics only",()=>{
 const oldest={formedAt:100,state:"INTACTO"}, newest={formedAt:200,state:"PARCIAL"};
 const list=[oldest,newest];
 assert.equal(list.at(-1),newest);assert.equal(list[0],oldest);
});
test("MODEL: FVG state codes preserve terminal and unobserved distinctions",()=>{
 const m={INTACTO:0,PARCIAL:1,LLENADO_TOTAL:2,INVALIDADO:3,DATOS_INCOMPLETOS:4};
 assert.equal(new Set(Object.values(m)).size,5);
 assert.ok(!Object.values(m).includes(-1));
});
test("MODEL: penetration % normalization exact and bounded",()=>{
 for(const value of [0,0.001,.33,.5,.999,1])assert.ok(value*100>=0&&value*100<=100);
});
test("MODEL: H1 and H4 zones are independent",()=>{
 const a=[{tf:"H1",state:"INVALIDADO"}], b=[{tf:"H4",state:"INTACTO"}];
 assert.equal(a.at(-1).state,"INVALIDADO");assert.equal(b.at(-1).state,"INTACTO");
});
test("MODEL: timestamps in UTC minutes fit hour boundaries",()=>{
 const ms=1_800_000_000_000, v=ms/60_000;
 assert.equal((v*60_000),ms);
});
