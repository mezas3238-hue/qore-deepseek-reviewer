import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const get=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const prior=get("CRT_RADAR_PRO_V34_11F_COHORTE_33_SIN_BTC_QA.pine");
const candidate=get("CRT_RADAR_PRO_V34_11G_H4_RAZONES_33_QA.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const start=engine(candidate).indexOf("            // Last H4 timestamp/candle evidence");
const end=engine(candidate).indexOf("            // M5A: Tres H4 completas consecutivas",start);
const qBlock=engine(candidate).slice(start,end);
const beforeTitle="CRT MSS QA 4C 11F";
test("34 scanner requests, strict NY H4/M15 detector gates and BTC branch untouched",()=>{
 const nowEngine=engine(candidate);
 const noAdded=nowEngine.slice(0,start)+nowEngine.slice(end);
 const normalized=noAdded.replace(
  /    var int qaH4BadStart = 0\n[\s\S]*?    var int qaH4LastEndOffsetMin = na\n\n/,
  ""
 );
 assert.ok(normalized.includes("int bucketH4 = isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)"));
 assert.equal((candidate.match(/^\s*plot\(/gm)||[]).length,(prior.match(/^\s*plot\(/gm)||[]).length);
 assert.equal((candidate.match(/request\.security\(/g)||[]).length,(prior.match(/request\.security\(/g)||[]).length);
 assert.equal((candidate.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(candidate.includes('f_btc_crt_h4_ny(int t) =>'));
 assert.ok(candidate.includes('h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
 assert.ok(candidate.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
 assert.ok(candidate.includes("useAlerts = input.bool(false"));
 assert.ok(candidate.includes("BTC APARTE"));
});
test("Three H4 failure predicates counted independently, never a sum of all H4 BAD",()=>{
 for(const k of ["qaH4BadStart","qaH4BadEnd","qaH4BadBars"])
  assert.ok(candidate.includes("int "+k),k);
 assert.ok(qBlock.includes("if h4FirstT != h4Bucket"));
 assert.ok(qBlock.includes("if h4LastEnd != h4Bucket + H4MS"));
 assert.ok(qBlock.includes("if h4Count != 48"));
 assert.ok(candidate.includes('"MAL=NO SUM"'));
 const old=prior.slice(prior.indexOf("bool fullH4 ="));
 const now=candidate.slice(candidate.indexOf("bool fullH4 ="));
 assert.equal(old.slice(0,old.indexOf("\n")),now.slice(0,now.indexOf("\n")));
});
test("Last closed H4 real M5 count and NY start/end delta measured in minutes",()=>{
 for(const needle of [
  "qaH4LastBars := h4Count",
  "qaH4LastStartOffsetMin := na(h4FirstT) ? na : int((h4FirstT - h4Bucket) / 60000)",
  "qaH4LastEndOffsetMin := na(h4LastEnd) ? na : int((h4LastEnd - (h4Bucket + H4MS)) / 60000)",
  "array.set(auditFeedH4LastBars, i, available ? s.qaH4LastBars : na)",
  "array.set(auditFeedH4StartShift, i, available ? s.qaH4LastStartOffsetMin : na)",
  "array.set(auditFeedH4EndShift, i, available ? s.qaH4LastEndOffsetMin : na)"
 ])assert.ok(candidate.includes(needle),needle);
});
test("No H4 status can be claimed complete by weakening 48 M5 contiguous rule",()=>{
 const predicate="bool fullH4 = h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS";
 assert.ok(prior.includes(predicate));
 assert.ok(candidate.includes(predicate));
 assert.ok(candidate.includes('bool c1CompleteData = h4Continuous and h4FirstT == h4Bucket and h4LastEnd == bucketH4'));
});
test("33 feeds get their OWN initial/final/count breakdown, no copied NZDCAD values",()=>{
 for(const x of [
  "array.get(auditFeedH4StartMis,i)",
  "array.get(auditFeedH4EndMis,i)",
  "array.get(auditFeedH4BarsMis,i)"
 ])assert.ok(candidate.includes(x),x);
 assert.ok(candidate.includes('qa33RootView = input.bool(true,'));
 assert.ok(candidate.includes('qa33RootView ? "MAL INI" : "H4 CERR"'));
 assert.ok(candidate.includes('qa33RootView ? "MAL FIN" : "H4 BAD"'));
 assert.ok(candidate.includes('qa33RootView ? "NO 48" : "C1 OK"'));
 assert.equal((candidate.match(/if i != 7 and scanAll/g)||[]).length,2);
 assert.ok(candidate.includes('int nonBtcRequested = scanAll ? 33 : 0'));
});
test("Chart-specific trace follows EXACT provider and never uses BTC in 33 denominator",()=>{
 const trace=candidate.slice(candidate.indexOf("// Automatically inspect the chart's exact source"));
 assert.ok(trace.includes('i != 7 and ticker.standard(array.get(scanSymbols,i)) == ownStd'));
 assert.ok(trace.includes('int traceSlot33 = chartSlot33 >= 0 ? chartSlot33 : qaEventSlot-1'));
 assert.ok(trace.includes('bool traceAllowed33 = traceSlot33 != 7 and scanAll'));
 assert.ok(trace.includes('"H4 ULT M5"'));
 assert.ok(trace.includes('"# M5"'));
 assert.ok(trace.includes('"INICIO Δm"'));
 assert.ok(trace.includes('"FIN Δm"'));
 assert.ok(trace.includes('array.get(auditFeedH4LastBars,traceSlot33)'));
 assert.ok(trace.includes('array.get(auditFeedH4StartShift,traceSlot33)'));
 assert.ok(trace.includes('array.get(auditFeedH4EndShift,traceSlot33)'));
 assert.ok(trace.includes('array.get(scanSymbols,traceSlot33)'));
 assert.ok(!trace.includes('request.security('));
 assert.ok(!trace.split("\n").some(x=>x.trimStart().startsWith("alert(")));
});
test("Synthetic boundary failure types stay disjoint only as H4 categories, not as H4 reason predicates",()=>{
 const categories=({dst=false,continuous=true,startOk=true,endOk=true,bars=48})=>{
  const complete=continuous&&startOk&&endOk&&bars===48;
  return complete?"FULL":dst?"DST":!continuous?"INTERNAL":"PARTIAL";
 };
 assert.equal(categories({startOk:false,bars:47}),"PARTIAL");
 assert.equal(categories({continuous:false,bars:47}),"INTERNAL");
 assert.equal(categories({dst:true,bars:36}),"DST");
 assert.equal(categories({}),"FULL");
 const violations=({startOk,endOk,bars})=>Number(!startOk)+Number(!endOk)+Number(bars!==48);
 assert.equal(violations({startOk:false,endOk:false,bars:44}),3);
 assert.equal(violations({startOk:true,endOk:true,bars:48}),0);
});
