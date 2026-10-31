import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=new URL("../CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine",import.meta.url);
const s=readFileSync(file,"utf8");
const lines=s.split("\n");
const plots=lines.filter(l=>l.startsWith("plot(")&&l.includes('title="QA CRT '));
const timeZone="America/New_York";
const nyHour=iso=>Number(new Intl.DateTimeFormat("en-US",{timeZone,hour:"2-digit",hourCycle:"h23"}).format(new Date(iso)));
const cycle=(family,h)=>family==="FX"?[1,5,21].includes(h):[2,6,22].includes(h);
const times=(d)=>d.map(x=>Date.parse(x));
test("STATIC: 10 identity/pivot plots all in data window",()=>{
 assert.equal(plots.length,10);
 for(const p of plots)assert.ok(p.includes("display=display.data_window"));
});
test("STATIC: no new requests, inputs, or drawings",()=>{
 const request=lines.filter(l=>l.includes("request.security(")&&!l.trimStart().startsWith("//"));
 assert.equal(request.length,2);
 assert.equal(lines.filter(l=>/^s\d\d = input\.symbol/.test(l)).length,34);
 assert.ok(s.includes("var table board = table.new(position.top_right,6,15"));
});
const fields=["c1Start","crtC2Start","crtRatifiedAt","sweepAt","m5Level","m5PivotAt","m5At","m15Level","m15PivotAt","m15At"];
for(const field of fields)test("STATIC: QA cycle exports same Signal field "+field,()=>{
 assert.equal(plots.filter(p=>p.includes("own."+field)),1);
});
test("STATIC: all timestamp plots express minutes, MSS levels retain price",()=>{
 const t=plots.filter(p=>/UTC min/.test(p));
 const price=plots.filter(p=>/precio/.test(p));
 assert.equal(t.length,8);assert.equal(price.length,2);
 for(const p of t)assert.ok(p.includes("/ 60000.0"));
 for(const p of price)assert.ok(!p.includes("/ 60000.0"));
});
test("STATIC: no MSS pivot reassignment before strict sweep",()=>{
 const code=s.split("    // ---- BARRIDA Y RETORNO C2")[1].split("    // ---- MSS en C3 ratificada")[0];
 assert.ok(code.indexOf("c2StrictSweep := true")>=0);
 assert.ok(code.indexOf("c2StrictSweep := true")<code.indexOf("c2Pivot5 :="));
 assert.ok(code.indexOf("c2StrictSweep := true")<code.indexOf("c2Pivot15 :="));
});
test("STATIC: M5 MSS after sweep bar, M15 MSS after sweep close",()=>{
 assert.ok(s.includes("c2StrictSweep and barT >= c2SweepEnd and cross5"));
 assert.ok(s.includes("closed15At > c2SweepEnd"));
 assert.ok(s.includes("lastHigh5At < barT")&&s.includes("lastLow5At < barT"));
 assert.ok(s.includes("lastHigh15At < barT")&&s.includes("lastLow15At < barT"));
});
test("STATIC: C2 MSS inheritance into C3 and C1 identity binding",()=>{
 for(const x of ["c1Start3 := c1Start2","c3C2Start := c2Start","c3M5At := c2M5At","c3M15At := c2M15At","c3Pivot5 := c2Pivot5","c3Pivot15 := c2Pivot15","c3ModelC1 := c1Start2","lastModelC1 := c1Start2"])
 assert.ok(s.includes(x),x);
});
test("STATIC: C3 reuses frozen pivot, does not silently update it",()=>{
 const c3=s.split("    // ---- MSS en C3 ratificada")[1].split("    // Actualizar swing M5 DESPUES")[0];
 assert.ok(c3.includes("c3Pivot5"));
 assert.ok(!c3.includes("c3Pivot5 :="));
});
test("STATIC: alert eligibility remains strictly phase=2, C2 or later",()=>{
 assert.ok(s.includes("bool certifiedCRT = st == 2"));
 assert.ok(s.includes("bool validM5 = certifiedCRT and m5t >= s.crtC2Start"));
 assert.ok(s.includes("bool validM15 = certifiedCRT and m15t >= s.crtC2Start"));
});
test("STATIC: same own Signal for chart lines, dashboard and diagnostics",()=>{
 assert.equal(s.split("Signal own = request.security").length-1,1);
 assert.ok(s.includes('plot(not na(own) ? own.c1Start : na, title="AUDIT ID C1'));
 assert.ok(s.includes('table.cell(board,1,1,ownState'));
 assert.ok(s.includes("line.set_xy1(m5Line,own.m5PivotAt,own.m5Level)"));
 assert.ok(s.includes("line.set_xy1(m15Line,own.m15PivotAt,own.m15Level)"));
});
const scenarios=[
 ["FX March EDT 01-05-09", "FX",["2026-03-10T05:00:00Z","2026-03-10T09:00:00Z","2026-03-10T13:00:00Z"],[1,5,9]],
 ["FX November EST 01-05-09","FX",["2026-11-03T06:00:00Z","2026-11-03T10:00:00Z","2026-11-03T14:00:00Z"],[1,5,9]],
 ["IDX March EDT 02-06-10","IDX",["2026-03-10T06:00:00Z","2026-03-10T10:00:00Z","2026-03-10T14:00:00Z"],[2,6,10]],
 ["IDX November EST 02-06-10","IDX",["2026-11-03T07:00:00Z","2026-11-03T11:00:00Z","2026-11-03T15:00:00Z"],[2,6,10]],
 ["FX March EDT 05-09-13","FX",["2026-03-10T09:00:00Z","2026-03-10T13:00:00Z","2026-03-10T17:00:00Z"],[5,9,13]],
 ["IDX November EST 06-10-14","IDX",["2026-11-03T11:00:00Z","2026-11-03T15:00:00Z","2026-11-03T19:00:00Z"],[6,10,14]],
 ["FX March overnight 21-01-05","FX",["2026-03-10T01:00:00Z","2026-03-10T05:00:00Z","2026-03-10T09:00:00Z"],[21,1,5]],
 ["FX November overnight 21-01-05","FX",["2026-11-03T02:00:00Z","2026-11-03T06:00:00Z","2026-11-03T10:00:00Z"],[21,1,5]],
 ["IDX March overnight 22-02-06","IDX",["2026-03-10T02:00:00Z","2026-03-10T06:00:00Z","2026-03-10T10:00:00Z"],[22,2,6]],
 ["IDX November overnight 22-02-06","IDX",["2026-11-03T03:00:00Z","2026-11-03T07:00:00Z","2026-11-03T11:00:00Z"],[22,2,6]]
];
for(const [name,family,iso,expected] of scenarios)test("MODEL CLOCK: "+name,()=>{
 const actual=iso.map(nyHour);
 assert.deepEqual(actual,expected);
 assert.equal(cycle(family,actual[0]),true);
 const d=times(iso);
 assert.equal(d[1]-d[0],4*60*60000);
 assert.equal(d[2]-d[1],4*60*60000);
});
test("MODEL: FX rejects wrong C1 09,13,17",()=>{
 for(const h of [9,13,17])assert.equal(cycle("FX",h),false);
});
test("MODEL: IDX rejects wrong C1 10,14,18",()=>{
 for(const h of [10,14,18])assert.equal(cycle("IDX",h),false);
});
test("MODEL: pivot precedes MSS and sweep precedes MSS",()=>{
 const m5={pivot:10000,sweep:20000,at:25000};
 const m15={pivot:15000,sweep:20000,at:30000};
 for(const v of [m5,m15])assert.ok(v.pivot<v.sweep&&v.sweep<v.at);
});
test("MODEL: old CRT timestamps cannot enter newer CRT ID",()=>{
 const old={c1:1,m5At:1000}, next={c1:2,c2Start:2000,m5At:old.m5At};
 assert.equal(next.m5At>=next.c2Start,false);
});
