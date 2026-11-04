import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root = new URL("../../crt-radar-pro/qa-34-feed-memory-probes/", import.meta.url);
const read = name => readFileSync(new URL(name, root), "utf8");
const old = read("QORE_CRT_RADAR_34_CHART_V34_12O_PDH_PDL_1D_REAL_QA_NO_LIVE.pine");
const full = read("QORE_CRT_RADAR_34_CHART_V34_12P_C1_TODAS_H4_24H_QA_NO_LIVE.pine");
const engine = s => s.slice(s.indexOf("f_engine() =>"), s.indexOf("f_engine_snapshot() =>"));
const op = s => s.split("\n").filter(line => !line.trimStart().startsWith("//") && line.includes("request.security("));

test("all 6 NY-anchored H4 blocks cover 24 hours; old 3-block mode is opt-in", () => {
 assert.match(full, /scheduleMode = input\.string\("Todas las H4 NY", "Escaneo C1 \(24 horas\)", options=\["Todas las H4 NY", "Solo C1 de tres horarios NY"\]/);
 assert.ok(full.includes('bool anyH4 = indexFamily ? (hh == 2 or hh == 6 or hh == 10 or hh == 14 or hh == 18 or hh == 22) : (hh == 1 or hh == 5 or hh == 9 or hh == 13 or hh == 17 or hh == 21)'));
 assert.ok(full.includes('scheduleMode == "Todas las H4 NY" ? anyH4 : exact'));
 for(const group of [[1,5,9,13,17,21],[2,6,10,14,18,22]]) {
   assert.equal(group.length,6);
   assert.equal(new Set(group).size,6);
   assert.ok(group.every((v,i)=>i===0 || (v-group[i-1])===4));
   assert.equal((group.at(-1)+4)%24,group[0]);
 }
 assert.ok(full.includes('H4 24H QA'));
});

test("detector is IDENTICAL; all sessions changes eligibility default only, not source, closed-M5 or MSS", () => {
 assert.equal(engine(full),engine(old));
 const e=engine(full);
 for(const gate of [
   "h4Continuous and h4Count == 48",
   "h4FirstT == h4Bucket",
   "h4LastEnd == h4Bucket + H4MS",
   "bool c1CompleteData = fullH4",
   "bool c1HasRange = h4High > h4Low",
   "bool c1AlignedNext",
   "if c1AllowedHour and c1AlignedNext and c1CompleteData and c1HasRange",
   "extraMssCausal",
   "extraMss5Causal"
 ]) assert.ok(e.includes(gate),gate);
 assert.equal([...full.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.equal(op(full).length,2);
 assert.ok(op(full).some(x=>x.includes('request.security(symbol, "5"')));
 assert.ok(op(full).some(x=>x.includes('request.security(syminfo.tickerid, "D"')));
 assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(full));
 assert.ok(full.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
});

test("H4 chart no longer falsely requires a time-equal NY M5 bucket; exact-feed C1 identity retained", () => {
 assert.ok(old.includes('own.nyH4Start == time'));
 assert.ok(!full.includes('own.nyH4Start == time'));
 assert.ok(full.includes('bool visualChartAligned = timeframe.isintraday and (timeframe.multiplier == 5 or timeframe.multiplier == 15 or timeframe.multiplier == 240)'));
 assert.ok(full.includes('ticker.standard(symbol) == integratedChartBroker'));
 assert.ok(full.includes('bool chartCoreC1 = chartAvailable and own.phase == 2'));
 assert.ok(full.includes('bool chartExtraC1 = chartAvailable and not chartCoreC1'));
 assert.ok(full.includes('bool visible = visualChartAligned and (chartCoreC1 or chartExtraC1)'));
 assert.ok(full.includes('int displayC1 = chartCoreC1 ? own.c1Start'));
 assert.ok(full.includes('line.new(t1,displayCRH,t2,displayCRH,xloc=xloc.bar_time'));
});

test("fix for previous real daily PDH/PDL remains; H4 FVG off unless explicitly enabled", () => {
 assert.ok(full.includes('[dailyPDH, dailyPDL, dailyPrevOpen, dailyPrevClose] = request.security(syminfo.tickerid, "D", [high[1], low[1], time[1], time_close[1]], lookahead=barmerge.lookahead_on'));
 assert.ok(full.includes('showChartH4Fvg = input.bool(false'));
 assert.ok(full.includes('"PDH 1D CONF"'));
 assert.ok(full.includes('"PDL 1D CONF"'));
 assert.ok(!full.includes('line.new(pdStart,own.nyPDH'));
 assert.ok(!full.includes('line.new(pdStart,own.nyPDL'));
});
