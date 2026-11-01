import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const before=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10M_RETEST_EVIDENCIA_M15_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10N_CRT_VALIDOS_34_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");

test("radar filters only genuine, active, ratified H4 CRT before displaying symbols",()=>{
 assert.match(pine,/f_genuineCRT\(Signal x\) =>/);
 for(const clause of [
  "x.phase == 2","x.isPatternValid",
  'x.modelKind == "CRT_2C_RETURN"',
  "x.crtC2Start == x.c1Start + H4MS",
  "x.crtRatifiedAt == x.crtC2Start + H4MS",
  "x.sweepAt > x.crtC2Start","x.sweepAt <= x.crtRatifiedAt",
  "x.crh > x.crl"
 ])assert.ok(pine.includes(clause),clause);
 assert.match(pine,/int st = genuineCRT \? 2 : 0/);
 assert.match(pine,/if genuineCRT\s+found \+= 1/);
 assert.match(pine,/if slotScanned and not sameAsChart and hasCRT/);
 assert.doesNotMatch(pine,/allMode or hasCRT/);
});
test("dashboard shows no unratified chart symbol and no standalone MSS check",()=>{
 assert.match(pine,/if ownRatified\s+table\.cell\(board,0,1,openName/);
 assert.match(pine,/bool m15CRTConfirmed = ownRatified and/);
 assert.match(pine,/int m15t = genuineCRT and/);
 assert.match(pine,/s\.m15PivotAt < s\.sweepAt and s\.m15At > s\.sweepAt and s\.m15At % MIN15 == 0 and s\.m15At <= s\.qaLastClosedM15At/);
 assert.match(pine,/if shown == 0 and passed == 0 and not ownRatified\s+table\.cell\(board,0,2,"SIN CRT H4 RATIFICADO"/);
 assert.match(pine,/bool certifiedCRT = genuineCRT/);
});
test("full 34-feed discovery is kept but there is no SHOW ALL dashboard option",()=>{
 assert.match(pine,/modeDashboard = input\.string\("Solo CRT", "Vista", options=\["Solo CRT"\]/);
 assert.doesNotMatch(pine,/"Todos los instrumentos"/);
 assert.match(pine,/for i = 0 to 33\s+if scanAll or i == 7/);
 assert.match(pine,/int maxOtherRows = showEntryCatalog and chartBtcSymbol and ownRatified \? 2 : 5/);
 assert.match(pine,/page = input\.int\(1, "Pagina si hay mas CRT", minval=1, maxval=18/);
 assert.match(pine,/scanAll \? symbol : array\.get\(scanNames,i\)/);
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
});
test("no new data requests and all inherited M15 retest, FVG, daily provider data stay",()=>{
 assert.equal((before.match(/request\.security\(/g)||[]).length,(pine.match(/request\.security\(/g)||[]).length);
 for(const part of [
  "f_btc_crt_h4_ny(barT)","bool retestOHLCValid",
  "qaRetest15High := m15High","qaRetest15Close := m15Close",
  "bool chartPdhTaken =","bool chartPdlTaken =",
  "f_add_context_fvg(fvgsH4",'useAlerts = input.bool(false',
  'memoryScan = input.string("BTCUSD solo"'
 ])assert.ok(pine.includes(part),part);
});
