import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root="../../crt-radar-pro/";
const old=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10R_HISTORIAL_DETECTORES_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10S_MSS15_CAUSAL_FAMILIAS_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const txt=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10S_MSS15_CAUSAL_FAMILIAS_ANDROID_COPIAR.txt",import.meta.url),"utf8");
const count=(s,needle)=>s.split(needle).length-1;
const has=(...texts)=>texts.forEach(t=>assert.ok(pine.includes(t),"missing "+t));

test("full Android copy is byte-for-byte identical to Pine and 34 symbols unchanged",()=>{
 assert.equal(txt,pine);
 assert.equal(count(old,"request.security("),count(pine,"request.security("));
 assert.equal(count(old,"alert("),count(pine,"alert("));
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((old.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(count(pine,"plot(")<=64);
 has('useAlerts = input.bool(false','bool showQAInList = modeDashboard == "Solo CRT + QA" or allMode','bool scanCrtValid = available and st == 2');
});
test("Inside owns independent freeze at first M5 sweep, never derives core C2 pivot",()=>{
 has("float pivot15\n    int pivot15At\n    int mss15At",
 "cand.pivot15 := freshInside15 ? (cand.sweepDir == 1 ? lastHigh15 : lastLow15) : na",
 "cand.pivot15At := freshInside15 ? (cand.sweepDir == 1 ? lastHigh15At : lastLow15At) : na",
 "cand.mss15At := na",
 "cand.pivot15 := na",
 "InsideCandidate.new(insideId, c1Start2");
 assert.match(pine,/if cand\.state == "SEEKING" and barT >= cand\.c2End[\s\S]{0,900}cand\.sweepAt := barEnd/);
 assert.match(pine,/bool freshInside15 = cand\.sweepDir == 1 \? not na\(lastHigh15At\) and lastHigh15At < barT/);
});
test("Inside MSS only on complete 15m close after sweep, frozen old pivot and unbroken feed",()=>{
 has('q.state == "SWEPT" or q.state == "RATIFIED"',
 'q.pivot15At < q.sweepAt and closed15At > q.sweepAt',
 'q.sweptLow != q.sweptHigh',
 'prev15Continuous and closed15At == bucket15 and closed15At % MIN15 == 0',
 'q.sweepDir == 1 ? m15Close > q.pivot15 and prev15Close <= q.pivot15',
 'q.mss15At := closed15At');
 assert.match(pine,/if not previousM5Continuous and not na\(barT\)[\s\S]{0,1000}stale\.pivot15 := na/);
});
test("Multi-N keeps at most four prior C1 sweep candidates per terminal H4",()=>{
 has('type MultiNMssCandidate','var array<MultiNMssCandidate> qaMultiNMssCandidates',
 'if latestClosed.endAt == bucketH4',
 'for consolidationCount = 2 to 5',
 'chainOk := chainOk and currentClosed.startAt == priorClosed.endAt',
 'insideOk := insideOk and currentClosed.hi < firstClosed.hi and currentClosed.lo > firstClosed.lo',
 'validMN = chainOk and insideOk and f_allowed(hour(firstClosed.startAt, TZ), isIndex)',
 'array.push(qaMultiNMssCandidates, MultiNMssCandidate.new(firstClosed.startAt, bucketH4, candidateDir, barEnd, frozenLevel, frozenAt, na, lowSweep and highSweep))',
 'existing.doubleSweep := true','array.clear(qaMultiNMssCandidates)');
});
test("Multi-N M15 is frozen at its own first M5 sweep, then matched to the ratified C1",()=>{
 has('q.pivot15At < q.sweepAt and na(q.mss15At) and closed15At > q.sweepAt',
 'q.terminalH4Start + H4MS',
 'qaOwn.c1Start == qaMultiNC1 and qaOwn.terminalH4Start == h4Bucket',
 'qaOwn.direction == qaMultiNDir and not qaOwn.doubleSweep',
 'qaMultiNSweepAt := qaOwn.sweepAt',
 'qaMultiNPivot15 := qaOwn.pivot15',
 'qaMultiNPivot15At := qaOwn.pivot15At',
 'qaMultiNMss15At := qaOwn.mss15At',
 'eligibleRatifiedMulti',
 'if eligibleRatifiedMulti and crossedRatifiedMulti');
});
test("only own-family M15 is returned and shown QA (never classic 2C ticks)",()=>{
 has('bool extraMssCausal = extraFamily',
 'extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt',
 'extraMssAt <= lastCompleteM15CloseAt',
 'extraMssCausal ? extraMssAt : na, extraC1, qaAudit2C',
 's.extraFamilyM15C1 == s.extraFamilyC1',
 'array.set(extraM15Flags, i, family15QA ? 1 : 0)',
 'own.extraFamilyM15C1 == own.extraFamilyC1',
 'own.extraFamilyM15At <= own.qaLastClosedM15At',
 'extraConfirmedM15 ? "M15 QA" : "—"',
 'bool extraConfirmedM15 = not validMain and showQAInList',
 'table.cell(board,5,1,m15CRTConfirmed ? "✓" : showQAInList and ownFamilyM15QA and not ownCRTValid ? "M15 QA" : "—"');
 assert.doesNotMatch(pine,/if useAlerts and barstate\.isrealtime and family15QA/);
 assert.doesNotMatch(pine,/if scanCrtValid or extraValidQA\s+if m5t/);
});
test("MSS M5 and M15 original core invariants are preserved",()=>{
 for(const v of ['bool validIndependent15','bool prev15Continuous',
 'int verifiedM15At = validIndependent15 ? outM15At : na',
 'bool m15CRTConfirmed = ownCRTValid and not na(own.m15At)',
 'if scanCrtValid\n            if m5t > 0','if useAlerts and barstate.isrealtime and alert15']){
  assert.ok(pine.includes(v),v);
  assert.ok(old.includes(v),v);
 }
 const main=(s)=>s.slice(s.indexOf('    // ---- BARRIDA Y RETORNO C2'),s.indexOf('    // ---- MSS en C3 ratificada'));
 assert.equal(main(pine),main(old));
});
