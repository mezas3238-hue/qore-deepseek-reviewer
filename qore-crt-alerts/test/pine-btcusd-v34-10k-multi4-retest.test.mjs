import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA_BTC_MULTI4_RETEST} from "../src/parity-audit.mjs";
const prev=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10J_QA_CATALOGO_MODELOS_ENTRADAS_CRT_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10K_QA_MULTICANDLE_RETEST_M15_NO_INTEGRADO.pine",import.meta.url),"utf8");
test("MULTI4 reads only four completed contiguous H4 from same M5 engine",()=>{
 assert.match(pine,/type MultiH4[\s\S]*?int startAt[\s\S]*?int endAt[\s\S]*?float hi[\s\S]*?float lo[\s\S]*?float cl[\s\S]*?bool valid/);
 assert.match(pine,/var array<MultiH4> qaFourH4 = array\.new<MultiH4>\(\)/);
 assert.match(pine,/if not fullH4\s+array\.clear\(qaFourH4\)/);
 assert.match(pine,/if array\.size\(qaFourH4\) > 4\s+array\.shift\(qaFourH4\)/);
 assert.match(pine,/m1\.endAt == m2\.startAt and m2\.endAt == m3\.startAt and m3\.endAt == m4\.startAt/);
 assert.match(pine,/f_allowed\(hour\(m1\.startAt, TZ\), isIndex\)/);
 assert.match(pine,/m2\.lo < m1\.lo/);
 assert.match(pine,/m2\.hi > m1\.hi/);
 assert.match(pine,/m3\.lo <= m1\.lo/);
 assert.match(pine,/m3\.hi >= m1\.hi/);
 assert.match(pine,/MULTI4 BULL QA/);
 assert.match(pine,/MULTI4 BEAR QA/);
});
test("retest from independent completed M15 only AFTER its own MSS and with 4h expiry",()=>{
 assert.match(pine,/int qaMssAt = c3Active \? c3M15At : c2Active \? c2M15At : na/);
 assert.match(pine,/float qaLevel = c3Active \? c3Pivot15 : c2Active \? c2Pivot15 : na/);
 assert.match(pine,/bool postMss15 = closed15At > qaMssAt and closed15At <= qaMssAt \+ 4 \* 3600000/);
 assert.match(pine,/bool touchedRetest = qaDir == 1 \? m15Low <= qaLevel and m15Close > qaLevel : qaDir == -1 \? m15High >= qaLevel and m15Close < qaLevel : false/);
 assert.match(pine,/if na\(qaRetest15At\) and postMss15 and prev15Continuous and touchedRetest/);
 assert.doesNotMatch(pine,/qaRetest15At := barEnd/);
});
test("two new diagnostics cannot replace the approved 3C H4 + M15 entry rule",()=>{
 assert.match(pine,/entryFamily := "CRT 3C REVERSAL"/);
 assert.match(pine,/entryStage := "ESPERA MSS M15"/);
 assert.match(pine,/entryStage := "M15 CONFIRMADO"/);
 assert.match(pine,/outPhase == 2 and outValid and outModel == "CRT_2C_RETURN"/);
 assert.match(pine,/bool retestVisible = outPhase == 2 and/);
 assert.match(pine,/string outRetest15State = retestVisible \? "RETEST M15 QA"/);
 assert.match(pine,/string outMulti4Kind = multiVisible \? qaMulti4Kind : "MULTI4 ESP"/);
});
test("panel shows fresh MULTI4 and M15 retest as SOLO QA",()=>{
 assert.match(pine,/table\.cell\(board,3,6,chartAvailable \? own\.multi4Kind/);
 assert.match(pine,/table\.cell\(board,4,6,chartAvailable \? own\.retest15State/);
 assert.match(pine,/table\.cell\(board,5,6,"SOLO QA"/);
 assert.match(pine,/title="QA CRT MULTI4 cierre cuarta H4 UTC min"/);
 assert.match(pine,/title="QA CRT RETEST M15 cierre UTC min"/);
});
test("preserves NY anchor, broker 1D PDH, isolated MSS M15, Android memory cap",()=>{
 assert.match(pine,/f_btc_crt_h4_ny\(barT\)/);
 assert.match(pine,/chartPdhTaken = chartDayAuditReady and own\.chartDayHighM5 > chartPrevDHigh/);
 assert.match(pine,/bool m15CRTConfirmed = chartActive and/);
 assert.match(pine,/array\.set\(scanSymbols, 7, syminfo\.tickerid\)/);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((prev.match(/request\.security\(/g)||[]).length,
              (pine.match(/request\.security\(/g)||[]).length);
});
test("exact source identity of 10k QA only (not TradingView compilation)",()=>{
 const sha=createHash("sha1").update("blob "+Buffer.byteLength(pine,"utf8")+String.fromCharCode(0)+pine).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_MULTI4_RETEST);
});
