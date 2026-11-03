import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../../crt-radar-pro/",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const base=read("qa-34-feed-memory-probes/QORE_CRT_RADAR_A_34_MERCADOS_PROBE_600_M5_QA_NO_LIVE.pine");
const combined=read("qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_QA_NO_LIVE.pine");
const chart=read("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const draw=x=>x.slice(x.lastIndexOf("if barstate.islast\n    if show"),x.length).trim();
test("radar with chart preserves exact same engine and 34 feed contracts",()=>{
 assert.equal(engine(combined),engine(base));
 assert.equal(engine(combined),engine(chart));
 assert.equal([...combined.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.match(combined,/for i = 0 to 33/);
 assert.match(combined,/calc_bars_count=600\)/);
 assert.equal([...combined.matchAll(/^\s*Signal s = request\.security\(symbol, "5", f_engine_snapshot\(\)/gm)].length,1,"one dynamic request expression, comments excluded");
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(combined));
 assert.ok(combined.includes('qaPhase1NonBtc = input.bool(true,'));
 assert.ok(base.includes('qaPhase1NonBtc = input.bool(false,'), 'published 600 M5 backup remains strict by default');
 assert.ok(combined.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
});
test("chart plots ONLY from Signal of the exact provider-and-symbol match",()=>{
 assert.match(combined,/Signal integratedOwn = na/);
 assert.match(combined,/int integratedSlot = -1/);
 assert.match(combined,/ticker\.standard\(symbol\) == integratedChartBroker/);
 assert.match(combined,/integratedOwn := s/);
 assert.match(combined,/integratedSlot := i/);
 assert.match(combined,/Signal own = integratedOwn/);
 assert.match(combined,/bool chartAvailable = integratedSlot >= 0 and not na\(own\)/);
 assert.match(combined,/chartCoreC1 = chartAvailable and own\.phase == 2/);
 assert.match(combined,/chartExtraC1 = chartAvailable and not chartCoreC1/);
 assert.match(combined,/if showIntegratedChart and showLevels and visible/);
 assert.match(combined,/showIntegratedChart and visible \? displayCRH : na/);
 assert.match(combined,/showIntegratedChart and visible \? displayCRL : na/);
 assert.ok(!combined.includes("request.security(syminfo.tickerid"));
 assert.ok(!combined.includes("f_engine()\n    barstate.islast ? state : na\n\nSignal own = request"));
});
test("Chart B exact drawing block adapted only for user toggle",()=>{
 const b=draw(chart);
 const begin=combined.lastIndexOf("if barstate.islast\n    if showIntegratedChart and showLevels and visible");
 const end=combined.indexOf("// V34.12N: CONTEXTO VISUAL adicional",begin);
 assert.ok(begin>=0 && end>begin,"bound original Chart B rendering before new QA context");
 const a=combined.slice(begin,end).trim().replace("if showIntegratedChart and showLevels and visible","if showLevels and visible");
 assert.equal(a,b,"same Chart B CRH/CRL & MSS M5/M15 lines and cleanup, with only visibility toggle");
 assert.ok(combined.includes("q4.mss15At := closed15At"),"Multi4 M15 remains independent");
 assert.ok(combined.includes('max_lines_count=8'));
 assert.ok(combined.includes('max_labels_count=8'));
});
test("new integrated script remains distinct from proved Radar A backup",()=>{
 assert.ok(!base.includes("Signal integratedOwn = na"));
 assert.ok(!base.includes('showIntegratedChart = input.bool('));
 assert.ok(combined.length>base.length);
});

test("Native feed phase is QA by default ONLY in integrated candidate, strict RAT gate preserved",()=>{
 assert.ok(combined.includes('qaPhase1NonBtc = input.bool(true,'));
 assert.ok(combined.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(combined.includes('bool observedCoreQA = structuralCoreObserved and not scanCrtValid'));
 assert.ok(combined.includes('role = not feedOK ? "SIN FEED" : core ? "2C RAT" : qaCore ? "2C QA"'));
 assert.ok(combined.includes('displayFamily = chartCoreC1 ? ((not qaPhase1NonBtc or chartBtcSymbol) ? "2C RAT" : "2C QA")'));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(combined));
});
test("H-K2 is refuted: M15 swing history is cleared at M5 gaps before Multi4, no stale Friday pivots",()=>{
 const reset=engine(combined).slice(engine(combined).indexOf('if (na(qaExtraM5SegmentStart) or not previousM5Continuous)'),engine(combined).indexOf('// ---- CERRAR M15 ANTERIOR ----'));
 for(const gate of ['array.clear(highs15)','array.clear(lows15)','array.clear(times15)','lastHigh15At := na','lastLow15At := na','array.clear(qaMulti4MssCandidates)'])
  assert.ok(reset.includes(gate),"reset missing "+gate);
 assert.ok(combined.includes('lastHigh15At >= qaExtraM5SegmentStart'));
 assert.ok(combined.includes('lastLow15At >= qaExtraM5SegmentStart'));
 assert.ok(combined.includes('q4.pivot15At < q4.sweepAt'));
});
test("historical window documents 600 not 1500, indicator still 34 slots",()=>{
 assert.ok(combined.includes("this feed's 600-bar M5 lookback"));
 assert.ok(!combined.includes("this feed's 1500-bar M5 lookback"));
 assert.equal([...combined.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
});

test("USDCAD QA Multi4 audit exposes exact-source sweep/pivot15/confirmation without assuming a cross",()=>{
 const audit=combined.slice(combined.indexOf('f_renderSlotEventAudit() =>'),combined.indexOf('f_renderNonBtcAudit() =>'));
 assert.ok(audit.includes('array.get(qaExtraKindBySlot,slot) == "MULTI4 QA"'));
 assert.ok(audit.includes('array.get(qaExtraSweepBySlot,slot)'));
 assert.ok(audit.includes('array.get(qaExtraPivot15AtBySlot,slot)'));
 assert.ok(audit.includes('array.get(qaExtraPivot15PriceBySlot,slot)'));
 assert.ok(audit.includes('array.get(qaExtraBreak15BySlot,slot)'));
 assert.ok(audit.includes('array.get(extraM5Flags,slot) == 1'));
 assert.ok(audit.includes('array.get(extraM15Flags,slot) == 1'));
 assert.ok(audit.includes('m4Pivot15At < m4Sweep'));
 for(const stage of ['NO MULTI4','SIN SWEEP','SIN PIV15','SIN MSS15','GATE M15'])
  assert.ok(audit.includes(stage),stage);
 assert.ok(audit.includes('else\n            // QA 12M'));
 assert.ok(!audit.includes('request.security('));
});
test("Multi4 QA diagnostics do not certify a visually annotated MSS or change scan/source conditions",()=>{
 assert.equal(engine(combined),engine(base));
 assert.equal(engine(combined),engine(chart));
 assert.equal([...combined.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.ok(combined.includes('calc_bars_count=600)'));
 assert.ok(combined.includes('qaPhase1NonBtc = input.bool(true,'));
 assert.ok(combined.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(!combined.includes('request.security(syminfo.tickerid'));
});

test("V34.12N draws PDH/PDL and last nearby H4 FVG from existing SAME-SLOT Signal",()=>{
 assert.ok(combined.includes("showChartPDHPDL = input.bool(true,"));
 assert.ok(combined.includes("showChartH4Fvg = input.bool(true,"));
 assert.ok(combined.includes('max_lines_count=8, max_labels_count=8, max_boxes_count=2'));
 assert.ok(combined.includes("own.pdhStatus != \"N/D\""));
 assert.ok(combined.includes("own.pdlStatus != \"N/D\""));
 assert.ok(combined.includes("own.nyPDHReferenceAt <= time_close"));
 assert.ok(combined.includes("own.fvgH4StateCode == 0 or own.fvgH4StateCode == 1"));
 assert.ok(combined.includes("own.fvgH4FormAt <= displayEnd"));
 assert.ok(combined.includes("own.fvgH4FormAt >= displayC1 - chartFvgLookbackH4 * H4MS"));
 assert.ok(combined.includes("fvgH4Distance <= crtC1Range * chartFvgRangeMult"));
 assert.ok(combined.includes("pdStart = math.max(own.nyPDHReferenceAt"));
 assert.ok(combined.includes("box.new(left=fvgStart"));
 assert.ok(combined.includes("box.set_lefttop(fvgH4ChartBox"));
 assert.ok(combined.includes("box.set_rightbottom(fvgH4ChartBox"));
 assert.ok(!combined.includes("request.security(syminfo.tickerid"));
});
test("V34.12N remains offline QA no new request, no motor/MSS changes or live promotion",()=>{
 assert.equal(engine(combined),engine(base));
 assert.equal(engine(combined),engine(chart));
 assert.equal([...combined.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.equal([...combined.matchAll(/^\s*Signal s = request\.security\(symbol, "5", f_engine_snapshot\(\)/gm)].length,1);
 assert.ok(combined.includes('qaPhase1NonBtc = input.bool(true,'));
 assert.ok(combined.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(combined));
});

test("V34.12N PDH/PDL exported for ALL valid sessions via Signal constructor positions 44-46",()=>{
 const declaration=combined.slice(combined.indexOf("type Signal\n")+"type Signal\n".length,combined.indexOf("\n//",combined.indexOf("type Signal\n")));
 const fields=declaration.split("\n").map(line=>line.match(/^\s+(?:int|float|bool|string|FamilyVisual)\s+(\w+)/)).filter(Boolean).map(match=>match[1]);
 const argsLine=combined.split("\n").find(line=>line.trim().startsWith("Signal.new("));
 assert.ok(argsLine,"Signal constructor exists");
 const args=argsLine.trim().slice("Signal.new(".length,-1).split(",").map(x=>x.trim());
 assert.equal(fields.length,132);
 assert.equal(args.length,132);
 for(const [name,position,value] of [
  ["pdhStatus",15,"outPdhStatus"],["pdlStatus",16,"outPdlStatus"],
  ["nyPDH",44,"hasLiquidityRef ? prev_PDH : na"],
  ["nyPDL",45,"hasLiquidityRef ? prev_PDL : na"],
  ["nyPDHReferenceAt",46,"hasLiquidityRef ? prev_timestamp : na"]]){
   assert.equal(fields[position-1],name,name+" Signal field at "+position);
   assert.equal(args[position-1],value,name+" value at "+position);
 }
 const f=engine(combined);
 assert.ok(f.includes("if isBTC"));
 assert.ok(f.includes("else\n        // Sesiones originales de Forex e indices: no alterarlas."));
 assert.ok(f.includes("prev_PDH := curr_H"));
 assert.ok(f.includes("prev_PDL := curr_L"));
 assert.ok(f.includes("bool hasLiquidityRef = prev_valid and not na(prev_timestamp) and not na(prev_PDH) and not na(prev_PDL)"));
 assert.ok(combined.includes("own.nyPDH > own.nyPDL"));
 assert.ok(combined.includes('own.pdhStatus != "N/D"'));
 assert.ok(combined.includes('own.pdlStatus != "N/D"'));
});
test("M15 pivots and Multi4 candidates never bridge a gap M5; H-K2 friday pivots cannot survive",()=>{
 const f=engine(combined);
 const from=f.indexOf("if (na(qaExtraM5SegmentStart) or not previousM5Continuous)");
 const to=f.indexOf("// ---- CERRAR M15 ANTERIOR ----",from);
 assert.ok(from>=0 && to>from);
 const reset=f.slice(from,to);
 for(const gate of ["array.clear(highs15)","array.clear(lows15)","array.clear(times15)",
  "lastHigh15 := na","lastLow15 := na","lastHigh15At := na","lastLow15At := na",
  "array.clear(qaMulti4MssCandidates)"]) assert.ok(reset.includes(gate),gate);
 assert.ok(f.includes("lastHigh15At >= qaExtraM5SegmentStart"));
 assert.ok(f.includes("lastLow15At >= qaExtraM5SegmentStart"));
});
