import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root = new URL("../", import.meta.url);
const read = name => readFileSync(new URL(name,root),"utf8");
const source=read("CRT_RADAR_PRO_V34_10B_MODULO5B_SESIONES_CANDIDATO_NO_INTEGRADO.pine");
const qa=read("CRT_RADAR_PRO_V34_10B_QA_TRES_CICLOS_NO_INTEGRADO.pine");
const oldMode='scheduleMode = input.string("Todas las H4 NY", "Escaneo C1", options=["Todas las H4 NY", "Solo C1 de tres horarios NY"], group=grp, tooltip="Por defecto todas las H4: FX 01/05/09/13/17/21; indices 02/06/10/14/18/22. El modo de 3 horas es solo comparativo.")';
const newMode='scheduleMode = input.string("Solo C1 de tres horarios NY", "Escaneo C1", options=["Todas las H4 NY", "Solo C1 de tres horarios NY"], group=grp, tooltip="Por defecto SOLO tres C1: Forex 01/05/21 NY e indices 02/06/22 NY. Todas las H4 es diagnostico opcional; no usar como confirmacion oficial.")';
const FIVE=300000;
const zone=(dir=1,opt={})=>({dir,top:110,bottom:100,formedAt:0,state:"INTACTO",firstTouchAt:null,maxPenetration:0,dataGap:false,lastEvaluatedEnd:0,gapObservedAt:null,lastSessionBar:false,...opt});
const bar=(opt={})=>({start:0,end:FIVE,low:115,high:120,close:118,firstSession:false,lastSession:false,...opt});

// Independent M5B transition model: only offline rule tests. NOT a Pine compiler or real-market replay.
function transition(f,b){
 const ok=Number.isFinite(b.start)&&Number.isFinite(b.end)&&b.start>=f.formedAt&&Number.isFinite(f.lastEvaluatedEnd)&&b.end>f.lastEvaluatedEnd;
 if(!ok||f.state==="INVALIDADO"||f.state==="DATOS_INCOMPLETOS")return f;
 const pause=b.start>f.lastEvaluatedEnd&&f.lastSessionBar&&b.firstSession;
 const gap=(b.start!==f.lastEvaluatedEnd&&!pause)||b.end-b.start!==FIVE||![b.low,b.high,b.close].every(Number.isFinite);
 if(gap||f.top<=f.bottom||(f.dir!==1&&f.dir!==-1)){
   f.dataGap=true;f.gapObservedAt=b.start;f.state="DATOS_INCOMPLETOS";
 }else{
   const touched=f.dir===1?b.low<=f.top:b.high>=f.bottom;
   if(touched&&f.firstTouchAt===null)f.firstTouchAt=b.end;
   if(touched){
     const p=f.dir===1?(f.top-b.low)/(f.top-f.bottom):(b.high-f.bottom)/(f.top-f.bottom);
     f.maxPenetration=Math.max(f.maxPenetration,Math.min(1,Math.max(0,p)));
   }
   const broken=f.dir===1?b.close<f.bottom:b.close>f.top;
   f.state=broken?"INVALIDADO":f.maxPenetration>=1?"LLENADO_TOTAL":f.firstTouchAt!==null?"PARCIAL":"INTACTO";
 }
 f.lastEvaluatedEnd=b.end;f.lastSessionBar=b.lastSession;
 return f;
}
test("STATIC: original V34.10b preserved, QA copy only changes default schedule setting",()=>{
 assert.ok(source.includes(oldMode)&&qa.includes(newMode));
 assert.equal(qa.replace(newMode,oldMode),source);
});
test("STATIC: exact three C1 cycles & timezone",()=>{
 for(const s of ['//@version=6','America/New_York','hh == 1 or hh == 5 or hh == 21','hh == 2 or hh == 6 or hh == 22'])assert.ok(qa.includes(s),s);
});
test("STATIC: 34 input.symbol and two request.security expressions, no extra feeds",()=>{
 assert.equal(qa.split("\n").filter(s=>/^s\d\d = input\.symbol\(/.test(s)).length,34);
 assert.equal(qa.split("\n").filter(s=>!s.trimStart().startsWith("//")&&s.includes("request.security(")).length,2);
});
test("STATIC: Pine session, FVG, continuity guards unchanged",()=>{
 for(const s of ['session.islastbar[1]','session.islastbar[2]','session.isfirstbar[1]','start5 >= f.formedAt','end5 > f.lastEvaluatedEnd','f.lastSessionBar and firstSession5','f_update_context_fvg(zoneH1','f_update_context_fvg(zoneH4','array.size(store) > 10','f.state := "DATOS_INCOMPLETOS"','f.state := "INVALIDADO"'])
  assert.ok(qa.includes(s),s);
});
const checks=[
 ["bullish intact",1,{},{},"INTACTO",0],
 ["bearish intact",-1,{}, {low:90,high:95,close:93},"INTACTO",0],
 ["bullish edge touch 0%",1,{}, {low:110,high:120,close:113},"PARCIAL",0],
 ["bearish edge touch 0%",-1,{}, {low:95,high:100,close:99},"PARCIAL",0],
 ["bullish partial 40%",1,{}, {low:106,high:115,close:111},"PARCIAL",.4],
 ["bearish partial 60%",-1,{}, {low:92,high:106,close:103},"PARCIAL",.6],
 ["bullish full wick",1,{}, {low:100,high:115,close:105},"LLENADO_TOTAL",1],
 ["bearish full wick",-1,{}, {low:92,high:110,close:105},"LLENADO_TOTAL",1],
 ["bullish strict close invalid",1,{}, {low:95,high:120,close:99},"INVALIDADO",1],
 ["bearish strict close invalid",-1,{}, {low:96,high:115,close:111},"INVALIDADO",1],
 ["bullish close at bottom not invalid",1,{}, {low:99,high:120,close:100},"LLENADO_TOTAL",1],
 ["bearish close at top not invalid",-1,{}, {low:90,high:111,close:110},"LLENADO_TOTAL",1],
 ["deep penetration capped",1,{}, {low:50,high:120,close:105},"LLENADO_TOTAL",1],
 ["intraday missing M5",1,{}, {start:2*FIVE,end:3*FIVE},"DATOS_INCOMPLETOS",0],
 ["missing final session marker",1,{}, {start:20*FIVE,end:21*FIVE,firstSession:true},"DATOS_INCOMPLETOS",0],
 ["missing first session marker",1,{lastSessionBar:true}, {start:20*FIVE,end:21*FIVE},"DATOS_INCOMPLETOS",0],
 ["recognized weekend session pause",1,{lastSessionBar:true}, {start:20*FIVE,end:21*FIVE,firstSession:true},"INTACTO",0],
 ["unlabelled midnight pause",1,{}, {start:288*FIVE,end:289*FIVE},"DATOS_INCOMPLETOS",0],
 ["wrong M5 duration",1,{}, {end:2*FIVE},"DATOS_INCOMPLETOS",0],
 ["missing OHLC",1,{}, {low:NaN},"DATOS_INCOMPLETOS",0],
 ["zero-width zone",1,{top:100,bottom:100},{}, "DATOS_INCOMPLETOS",0],
 ["bad direction",0,{},{},"DATOS_INCOMPLETOS",0],
 ["post-formation M5 accepted",1,{formedAt:3*FIVE,lastEvaluatedEnd:3*FIVE}, {start:3*FIVE,end:4*FIVE,low:106,close:108},"PARCIAL",.4]
];
for(const [name,dir,setup,candle,expected,penetration] of checks)test("MODEL: "+name,()=>{
 const f=transition(zone(dir,setup),bar(candle));
 assert.equal(f.state,expected);
 assert.ok(Math.abs(f.maxPenetration-penetration)<1e-9);
});
test("MODEL: ignore bar before formedAt",()=>{
 const f=zone(1,{formedAt:2*FIVE,lastEvaluatedEnd:2*FIVE});
 transition(f,bar({low:95,close:95}));assert.equal(f.state,"INTACTO");assert.equal(f.lastEvaluatedEnd,2*FIVE);
});
test("MODEL: duplicate M5 end ignored",()=>{
 const f=transition(zone(),bar({low:110,close:111}));const old=structuredClone(f);
 transition(f,bar({low:95,close:95}));assert.deepEqual(f,old);
});
test("MODEL: INVALIDADO terminal",()=>{
 const f=transition(zone(),bar({low:95,close:95}));const old=structuredClone(f);
 transition(f,bar({start:FIVE,end:2*FIVE}));assert.deepEqual(f,old);
});
test("MODEL: DATOS_INCOMPLETOS terminal",()=>{
 const f=transition(zone(),bar({start:2*FIVE,end:3*FIVE}));const old=structuredClone(f);
 transition(f,bar({start:3*FIVE,end:4*FIVE}));assert.deepEqual(f,old);
});
test("MODEL: accumulated penetration monotonic, firstTouchAt immutable",()=>{
 const f=transition(zone(),bar({low:105,close:108}));
 transition(f,bar({start:FIVE,end:2*FIVE,low:109,close:113}));
 assert.equal(f.maxPenetration,.5);assert.equal(f.firstTouchAt,FIVE);
});
test("MODEL: FVG H1/H4 independent states",()=>{
 const h1=transition(zone(),bar({low:105,close:108}));
 const h4=transition(zone(),bar());
 assert.equal(h1.state,"PARCIAL");assert.equal(h4.state,"INTACTO");
});
test("MODEL: lastSessionBar updated before a legitimate pause",()=>{
 const f=transition(zone(),bar({lastSession:true}));
 transition(f,bar({start:20*FIVE,end:21*FIVE,firstSession:true}));
 assert.equal(f.state,"INTACTO");assert.equal(f.lastSessionBar,false);
});
test("MODEL: invalidation takes precedence over full penetration",()=>{
 const f=transition(zone(),bar({low:95,close:95}));
 assert.equal(f.state,"INVALIDADO");assert.equal(f.maxPenetration,1);
});
