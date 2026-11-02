import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_11P_MSS_M5_M15_QA_33_MERCADOS_NO_LIVE.pine");
const next=load("CRT_RADAR_PRO_V34_11Q_TRUE3C_ROWdy_C3_SWEEP_QA_NO_LIVE.pine");
const segment=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const monitor=x=>x.slice(x.indexOf("// V34.11N OWNER MODE"));

test("V34.11Q maintains same 34 source requests, 60 Pine plots, bounded 127 Signal fields",()=>{
 assert.equal((next.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((next.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((next.match(/request\.security\(/g)||[]).length,
              (old.match(/request\.security\(/g)||[]).length);
 assert.equal((segment(next).match(/^\s+(?:int|float|bool|string) \w+/gm)||[]).length,127);
 assert.ok(next.includes('calc_bars_count=1500'));
 assert.ok(next.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(next.includes('useAlerts = input.bool(false'));
 assert.ok(next.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
});

test("truly independent 3C uses closed full H4 bars: C2 no C1 sweep, C3 C1 one-sided sweep",()=>{
 const e=engine(next);
 for(const x of [
  'int nHistory = array.size(qaMultiNHistory)',
  'if nHistory >= 3',
  'MultiH4 trueC1 = array.get(qaMultiNHistory, nHistory - 3)',
  'MultiH4 trueC2 = array.get(qaMultiNHistory, nHistory - 2)',
  'MultiH4 trueC3 = array.get(qaMultiNHistory, nHistory - 1)',
  'bool threeClosed = trueC1.valid and trueC2.valid and trueC3.valid',
  'trueC1.endAt == trueC2.startAt and trueC2.endAt == trueC3.startAt',
  'bool setupNoSweep = trueC2.hi <= trueC1.hi and trueC2.lo >= trueC1.lo',
  'bool c3LowRaid = trueC3.lo < trueC1.lo and trueC3.hi <= trueC1.hi',
  'bool c3HighRaid = trueC3.hi > trueC1.hi and trueC3.lo >= trueC1.lo',
  'bool c3ClosesBack = trueC3.cl > trueC1.lo and trueC3.cl < trueC1.hi',
  '(c3LowRaid != c3HighRaid) and c3ClosesBack',
  'bool allowedTrue3C = f_allowed(hour(trueC1.startAt, TZ), isIndex)'
 ])assert.ok(e.includes(x),x);
 assert.ok(e.includes('qaTrue3CSignedAt := (c3LowRaid ? 1 : -1) * trueC3.endAt'));
 assert.ok(next.includes('array.set(qaTrue3CSignedBySlot, i, available ? s.qaTrue3CSignedAt : na)'));
});

test("legacy 2C core still active but no longer masquerades as new 3C category bit 1",()=>{
 assert.ok(next.includes('bool category2CActiveC3 = outPhase == 2 and outValid and outModel == "CRT_2C_RETURN"'));
 assert.ok(next.includes('bool categoryTrue3C = not na(qaTrue3CSignedAt)'));
 assert.ok(next.includes('int qaCatalogMask = (categoryTrue3C ? 1 : 0)'));
 assert.ok(!next.includes('bool category3C = outPhase == 2 and outValid'));
 assert.ok(next.includes('bool category2CPending = outPhase == 1'));
 assert.ok(next.includes('bool categoryInsideReturn = extraInside'));
 assert.ok(next.includes('bool categoryMultiCandle = extraMulti or extraMultiN'));
 assert.ok(next.includes('bool categoryM15Retest = retestVisible'));
});

test("fresh QA 3C can show its true direction, but no borrowed M5/M15 signal",()=>{
 const s=monitor(next);
 assert.ok(s.includes('bool ownTrue3C = cat3 and not core and not qaCore and not na(signedTrue3C)'));
 assert.ok(s.includes('int dir = ownTrue3C ? signedTrue3C > 0 ? 1 : -1'));
 assert.ok(s.includes('cat3 ? "3C TRUE QA"'));
 assert.ok(s.includes('ownTrue3C ? "N/V"'));
 assert.ok(s.includes('qaCore ? sameM15 ? "QA SI" : "QA --"'));
 assert.ok(s.includes('"NO PUSH"'));
});

test("previous C2, Inside, Multi-N and MSS source-phase logic survives as separate models",()=>{
 for(const x of [
  'bool validC2Data = fullH4',
  'string classified2C = "NONE"',
  'if classified2C == "CRT_2C_EXPANSION"',
  'InsideCandidate q = array.get(insideCandidates',
  'f_m15_phase_ok(extraMssAt, qaNativeSourcePhaseMin)',
  'qaMultiNKind := sweepLowN ? "MULTI-N BULL QA" : "MULTI-N BEAR QA"',
  'bool validIndependent15 = not na(outM15At)',
  'if useAlerts and not qaPhase1NonBtc and barstate.isrealtime'
 ])assert.ok(next.includes(x),x);
 assert.ok(next.includes('qaPhase1NonBtc = input.bool(true'));
 // This candidate is for offline/nonlive QA; no production push.
 assert.ok(next.includes('"NO LIVE"'));
});
