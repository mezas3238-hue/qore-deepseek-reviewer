import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const earlier=load("CRT_RADAR_PRO_V34_11N_MONITOR_7_ROLES_CRT_MSS5_MSS15_QA_NO_LIVE.pine");
const candidate=load("CRT_RADAR_PRO_V34_11O_MONITOR_CRT_MSS5_MSS15_DEPURADO_QA_NO_LIVE.pine");
const engine=x=>x.slice(x.indexOf("f_engine() =>"),x.indexOf("f_engine_snapshot() =>"));
const udt=x=>x.slice(x.indexOf("type Signal"),x.indexOf("// M3B.2"));
const focus=x=>x.slice(x.indexOf("// V34.11O: focus only"));

test("11O is UI only: identical M5/H4/MSS engine, Signal, 34 feeds, 60 plots and alerts gate",()=>{
 assert.equal(engine(candidate),engine(earlier));
 assert.equal(udt(candidate),udt(earlier));
 assert.equal((candidate.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((candidate.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((candidate.match(/request\.security\(/g)||[]).length,
              (earlier.match(/request\.security\(/g)||[]).length);
 assert.ok(candidate.includes('lookahead=barmerge.lookahead_off'));
 assert.ok(candidate.includes('useAlerts = input.bool(false'));
 assert.ok(candidate.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(candidate.includes('qaPhase1NonBtc = input.bool(true'));
});

test("11O must not mislabel active C3 as a closed 3C reversal",()=>{
 const s=focus(candidate);
 assert.ok(candidate.includes('bool category3C = outPhase == 2 and outValid'));
 assert.ok(candidate.includes('int outPhase = c3Active ? 2'));
 assert.ok(s.includes('core ? "2C RAT"'));
 assert.ok(s.includes('core ? "C3 ACT"'));
 assert.ok(s.includes('cat3 ? "2C QA"'));
 assert.ok(s.includes('"C3 ACT != CERR"'));
 assert.ok(!s.includes('core ? cat3 ? "3C"'));
 assert.ok(candidate.includes('"V34.11O"'));
});

test("owner view prioritizes CRT + independent MSS5 and MSS15, not QA noise",()=>{
 const s=focus(candidate);
 assert.ok(candidate.includes('userFocus7 = input.bool(true, "Monitor principal: CRT + MSS M5/M15 (QA)"'));
 for(const v of ['"MERCADO"','"CRT H4"','"DIR"','"MSS M5"','"MSS M15"'])
   assert.ok(s.includes(v),v);
 assert.ok(s.includes('bool showRejectedDiagnostics = expandFull34 and showCatalog7'));
 assert.ok(s.includes('showRejectedDiagnostics ? cat2 ? "2C*"'));
 assert.ok(s.includes('showRejectedDiagnostics ? catExpansion or catInsideContinuation ? "RECHAZO"'));
 assert.ok(s.includes('m5Text = not (core or extra or structuralObservedQA)'));
 assert.ok(s.includes('m15Text = not (core or extra or structuralObservedQA)'));
 assert.ok(s.includes('f_m15_phase_ok(break15T, nativePhase)'));
 assert.ok(s.includes('pivot5T < sweepT and break5T > sweepT'));
 assert.ok(s.includes('pivot15T < sweepT and break15T > sweepT'));
 assert.ok(s.includes('extra and array.get(extraM15Flags,i) == 1 ? "QA" : "N/V"'));
 assert.ok(s.includes('int onPage = expandFull34 ? 10 : 2'));
 assert.ok(s.includes('NO PUSH'));
});

test("unapproved seven catalogue roles remain available for opt-in QA, not certified entries",()=>{
 const s=focus(candidate);
 for(const v of [
  'mask / 1','mask / 2','mask / 4','mask / 8','mask / 16','mask / 32','mask / 64',
  '"RETEST QA"','"EXP RECH"','"INS RECH"','"QA H4"'
 ])assert.ok(s.includes(v),v);
 assert.ok(s.includes('"7 ROLES QA" : "CRT/MSS"'));
 assert.ok(s.includes('"QA NO CERT"'));
 assert.ok(s.includes('"NO LIVE"'));
});
