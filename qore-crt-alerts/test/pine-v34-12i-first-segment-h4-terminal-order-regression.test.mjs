import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=(n)=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const A=load("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const B=load("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const sub=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)+a.length));
const M5=300000,H4=48*M5;

test("both scripts initialize an M5 segment on the first usable closed M5 bar",()=>{
 for(const src of [A,B]){
  const engine=sub(src,"f_engine() =>","f_engine_snapshot() =>");
  assert.ok(engine.includes("int barT = time[1]"));
  assert.ok(engine.includes("int previousBarEnd = time_close[2]"));
  assert.ok(engine.includes("var int qaExtraM5SegmentStart = na"));
  assert.ok(engine.includes("if (na(qaExtraM5SegmentStart) or not previousM5Continuous) and not na(barT)"));
  assert.ok(engine.includes("qaExtraM5SegmentStart := barT"));
  assert.ok(engine.includes("lastHigh5At >= qaExtraM5SegmentStart"));
  assert.ok(engine.includes("lastLow5At >= qaExtraM5SegmentStart"));
  assert.ok(engine.includes("stale.mss5At := na"));
 }
 // Pine v6 bool cannot be na. At current chart bar #1 the previous
 // bar is valid and time_close[2] is na: previousM5Continuous = false.
 const timestamps=[0,M5,2*M5];
 let segment=null;
 let previousBarEnd=null;
 const barT=timestamps[0];
 const isContinuous=previousBarEnd!==null && barT===previousBarEnd;
 if((segment===null||!isContinuous)&&barT!==null)segment=barT;
 assert.equal(segment,0);
 // Following M5 stays on the same segment, a gap starts a new one.
 previousBarEnd=M5;
 assert.equal(timestamps[1]===previousBarEnd,true);
 const gapBarT=5*M5;
 if((segment===null||gapBarT!==previousBarEnd))segment=gapBarT;
 assert.equal(segment,5*M5);
});

test("the last terminal H4 M5 has been processed before nextH4 extracts/clears Multi-N",()=>{
 for(const src of [A,B]){
  const engine=sub(src,"f_engine() =>","f_engine_snapshot() =>");
  const indexH4=engine.indexOf("bool nextH4 =");
  const indexExtract=engine.indexOf("qaMultiNMss5At := qaOwn.mss5At");
  const indexClear=engine.indexOf("array.clear(qaMultiNMssCandidates)",indexExtract);
  const indexOwnM5=engine.indexOf("// QA M5 causal para Inside y Multi-N");
  assert.ok(indexH4>0&&indexExtract>indexH4&&indexClear>indexExtract&&indexOwnM5>indexClear);
  // barT is the PREVIOUS, fully-closed M5: not current chart time.
  assert.ok(engine.includes("int barT = time[1]"));
  assert.ok(engine.includes("int barEnd = time_close[1]"));
  assert.ok(engine.includes("barEnd <= ownN5.terminalH4Start + H4MS"));
  assert.ok(engine.includes("bucketH4 == ownN5.terminalH4Start"));
  assert.ok(engine.includes("ownN5.mss5At := barEnd"));
  assert.ok(engine.includes("qaMultiNMss5At := qaOwn.mss5At"));
 }
 const opens=Array.from({length:51},(_,i)=>i*M5);
 const trace=[];
 let previousBucket=null;
 for(let current=1;current<opens.length;current++){
  const barT=opens[current-1];
  const bucket=Math.floor(barT/H4)*H4;
  const nextH4=previousBucket!==null&&bucket!==previousBucket;
  const lastClosedM5=barT===H4-M5;
  trace.push({currentOpen:opens[current],barT,bucket,nextH4,lastClosedM5});
  previousBucket=bucket;
 }
 const terminal=trace.find(x=>x.lastClosedM5);
 assert.equal(terminal.currentOpen,H4);
 assert.equal(terminal.barT,H4-M5);
 assert.equal(terminal.nextH4,false);
 const extraction=trace.find(x=>x.nextH4);
 assert.equal(extraction.currentOpen,H4+M5);
 assert.equal(extraction.barT,H4);
 assert.equal(extraction.bucket,H4);
 assert.equal(terminal.currentOpen<extraction.currentOpen,true);
});

test("do NOT move MSS M5 ahead of nextH4: that would compute a future/incorrect event",()=>{
 for(const src of [A,B]){
  const engine=sub(src,"f_engine() =>","f_engine_snapshot() =>");
  assert.ok(engine.includes("array.clear(qaMultiNMssCandidates)"));
  assert.ok(engine.includes("barT >= ownN5.sweepAt"));
  assert.ok(engine.includes("previousM5Continuous"));
  assert.ok(engine.includes("ownN5.pivot5At < ownN5.sweepAt"));
  assert.ok(!engine.includes("qaMultiNMss5At := barEnd + MIN5"));
 }
 assert.equal(sub(A,"f_engine() =>","f_engine_snapshot() =>"),sub(B,"f_engine() =>","f_engine_snapshot() =>"));
 assert.equal(sub(A,"type Signal\n","// M3B.2"),sub(B,"type Signal\n","// M3B.2"));
});
