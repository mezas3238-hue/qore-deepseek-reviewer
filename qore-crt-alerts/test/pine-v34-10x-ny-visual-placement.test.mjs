import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const original=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const candidate=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10X_NY_NIVELES_MOVIL_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const engine=s=>{
 const start=s.indexOf("f_engine() =>"),stop=s.indexOf("f_engine_snapshot() =>");
 assert.ok(start>=0&&stop>start,"f_engine boundaries");
 return s.slice(start,stop);
};
const normalizedRequests=s=>s.match(/request\.security\(/g)?.length??0;

test("V34.10x preserves f_engine exact CRT/MSS/NY/DST logic",()=>{
 assert.equal(engine(candidate),engine(original));
 assert.match(original,/string TZ = "America\/New_York"/);
 assert.match(candidate,/string TZ = "America\/New_York"/);
});
test("No market source, 34 request slot or trading signal policy changes",()=>{
 assert.equal(normalizedRequests(candidate),normalizedRequests(original));
 assert.equal([...candidate.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
 assert.match(candidate,/bool scanAll = memoryScan == "34 instrumentos \(experimental\)"/);
 assert.match(candidate,/useAlerts = input\.bool\(false/);
 assert.match(candidate,/calc_bars_count=1500/);
 assert.match(candidate,/Signal own = request\.security\(syminfo\.tickerid, "5"/);
});
test("Provisional C2 cannot render CRT HIGH/LOW as a ratified CRT",()=>{
 const found=candidate.match(/bool visible = [^\n]+/);
 assert.ok(found);
 assert.match(found[0],/own\.phase == 2/);
 assert.match(found[0],/own\.isPatternValid/);
 assert.match(found[0],/own\.modelKind == "CRT_2C_RETURN"/);
 assert.match(found[0],/own\.crtRatifiedAt >= own\.crtC2Start \+ H4MS/);
 assert.match(found[0],/visualChartAligned/);
 assert.doesNotMatch(found[0],/own\.phase == 1/);
 assert.match(candidate,/if showLevels and visible/);
});
test("M5/M15 or NY-aligned H4 only; broker H4 mismatch never draws",()=>{
 const aligned=candidate.match(/bool visualChartAligned = [^\n]+/);
 assert.ok(aligned);
 assert.match(aligned[0],/timeframe\.multiplier == 5/);
 assert.match(aligned[0],/timeframe\.multiplier == 15/);
 assert.match(aligned[0],/timeframe\.multiplier == 240/);
 assert.match(aligned[0],/own\.nyH4Start == time/);
 assert.doesNotMatch(aligned[0],/timeframe\.multiplier == 60/);
});
test("Level segments use anchored NY C1 and do not extend beyond C3",()=>{
 assert.match(candidate,/int t1 = own\.c1Start/);
 assert.match(candidate,/int t2 = math\.min\(time_close, t1 \+ 3 \* H4MS\)/);
 assert.match(candidate,/line\.new\(t1,own\.crh,t2,own\.crh,xloc=xloc\.bar_time/);
 assert.match(candidate,/line\.new\(t1,own\.crl,t2,own\.crl,xloc=xloc\.bar_time/);
 assert.match(candidate,/"CRT H4 NY HIGH"/);
 assert.match(candidate,/"CRT H4 NY LOW"/);
 assert.doesNotMatch(candidate,/label\.new\(t2,own\.crh,"CRT HIGH"/);
});
test("Compact dashboard defaults enabled, preserves full 34-market scanner and QA mode",()=>{
 assert.match(candidate,/compactMobile = input\.bool\(true, "Panel compacto \(movil, 5 filas\)"/);
 assert.match(candidate,/if showDashboard and not compactMobile/);
 assert.match(candidate,/if barstate\.islast and showDashboard and compactMobile/);
 assert.match(candidate,/bool ownCore = chartAvailable and own\.phase == 2 and own\.isPatternValid/);
 assert.match(candidate,/bool matchCore = array\.get\(validCoreFlags,i\)/);
 assert.match(candidate,/if \(scanAll or i == 7\) and not sameAsChart and matchCore/);
 assert.match(candidate,/int totalPages = math\.max\(1,int\(math\.ceil\(othersTotal \* 1\.0 \/ 2\)\)\)/);
 assert.match(candidate,/table\.cell\(board,5,4,"NO PUSH"/);
 assert.match(candidate,/table\.clear\(board,0,0,5,14\)/);
});
