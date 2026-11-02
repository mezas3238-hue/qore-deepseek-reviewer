import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=read("CRT_RADAR_PRO_V34_11O_MONITOR_CRT_MSS5_MSS15_DEPURADO_QA_NO_LIVE.pine");
const now=read("CRT_RADAR_PRO_V34_11P_MSS_M5_M15_QA_33_MERCADOS_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const signal=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const main=x=>x.slice(x.indexOf("// V34.11N OWNER MODE"));

test("11P changes only QA monitor projection, not Pine CRT/MSS feed engine or notifications",()=>{
 assert.equal(engine(now),engine(old));
 assert.equal(signal(now),signal(old));
 assert.equal((now.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((now.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((now.match(/request\.security\(/g)||[]).length,(old.match(/request\.security\(/g)||[]).length);
 assert.ok(now.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(now.includes('qaPhase1NonBtc = input.bool(true'));
 assert.ok(now.includes('useAlerts = input.bool(false'));
 assert.ok(now.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
});

test("nonBTC core H4 can display 2C QA without bypassing original certification gate",()=>{
 const s=now.slice(now.indexOf("for i = 0 to 33\n    if scanAll or i == 7"));
 assert.ok(s.includes('bool structuralCoreObserved = available and st == 2 and s.isPatternValid'));
 assert.ok(s.includes('s.modelKind == "CRT_2C_RETURN"'));
 assert.ok(s.includes('s.crtRatifiedAt >= s.crtC2Start + H4MS'));
 assert.ok(s.includes('bool scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)'));
 assert.ok(s.includes('bool observedCoreQA = structuralCoreObserved and not scanCrtValid'));
 assert.ok(s.includes('array.set(qaCoreObservedFlags, i, observedCoreQA)'));
 assert.ok(main(now).includes('qaCore = array.get(qaCoreObservedFlags,i)'));
 assert.ok(main(now).includes('qaCore ? "2C QA"'));
 assert.ok(main(now).includes('qaCore ? "C3 QA"'));
 assert.ok(main(now).includes('"QA H4"'));
});

test("MSS 5 and 15 QA statuses have distinct causal pivot, breakout and native-close checks",()=>{
 const s=main(now);
 assert.equal(s.split('bool cycleRoot = (core or qaCore)').length-1,2);
 assert.equal(s.split('pivot5T < sweepT and break5T > sweepT').length-1,2);
 assert.equal(s.split('pivot15T < sweepT and break15T > sweepT').length-1,2);
 assert.equal(s.split('break5T % MIN5 == nativePhase * 60000').length-1,2);
 assert.equal(s.split('f_m15_phase_ok(break15T, nativePhase)').length-1,2);
 assert.equal(s.split('break15T <= close15T').length-1,2);
 assert.ok(s.includes('qaCore ? sameM5 ? "QA SI" : "QA --"'));
 assert.ok(s.includes('qaCore ? sameM15 ? "QA SI" : "QA --"'));
 assert.ok(s.includes('core ? sameM5 ? "SI" : "NO"'));
 assert.ok(s.includes('core ? sameM15 ? "SI" : "NO"'));
 assert.ok(s.includes('extra or structuralObservedQA ? "N/V" : "—"'));
 assert.ok(s.includes('core and sameM5 ? posInk : qaCore and sameM5 ? color.orange'));
 assert.ok(s.includes('core and sameM15 ? posInk : qaCore or extra ? color.orange'));
});

test("never green-light rejected/provisional patterns or map M5 automatically to M15",()=>{
 const s=main(now);
 assert.ok(s.includes('bool showRejectedDiagnostics = expandFull34 and showCatalog7'));
 assert.ok(s.includes('showRejectedDiagnostics ? cat2 ? "2C*"'));
 assert.ok(s.includes('showRejectedDiagnostics ? catExpansion or catInsideContinuation ? "RECHAZO"'));
 assert.ok(s.includes('bool extra = array.get(validCrtFlags,i) and not core and not qaCore'));
 assert.ok(s.includes('bool structuralObservedQA = not core and not qaCore and not extra'));
 assert.ok(s.includes('int sweepT = array.get(qaSweepBySlot,i)'));
 assert.ok(s.includes('int ratT = array.get(qaRatBySlot,i)'));
 assert.ok(s.includes('ratT >= sweepT'));
 assert.ok(s.includes('"NO PUSH"'));
 assert.ok(s.includes('"NO LIVE"'));
});
