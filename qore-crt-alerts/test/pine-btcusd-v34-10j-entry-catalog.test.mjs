import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA_BTC_MODEL_CATALOG} from "../src/parity-audit.mjs";
const previous=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10I_QA_BTC_MSS15_INDEPENDIENTE_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10J_QA_CATALOGO_MODELOS_ENTRADAS_CRT_NO_INTEGRADO.pine",import.meta.url),"utf8");
test("CRT model catalog adds no extra remote market security requests",()=>{
 assert.equal((previous.match(/request\.security\(/g)||[]).length,(pine.match(/request\.security\(/g)||[]).length);
 assert.match(pine,/showEntryCatalog = input\.bool\(true/);
 assert.match(pine,/if showEntryCatalog and btcSameChartOnly/);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.equal((pine.match(/^s\d\d\s*=\s*input\.symbol\(/gm)||[]).length,34);
});
test("three-candle reversal with MSS in C2 or C3 is separately classified",()=>{
 assert.match(pine,/outPhase == 2 and outValid and outModel == "CRT_2C_RETURN"/);
 assert.match(pine,/bool confirmedM15 = not na\(verifiedM15At\)/);
 assert.match(pine,/bool m15WasC2 = not na\(c3Start\) and verifiedM15At <= c3Start/);
 assert.match(pine,/CRT 3C REV MSS C2/);
 assert.match(pine,/CRT 3C REV MSS C3/);
 assert.match(pine,/entryStage := "M15 CONFIRMADO"/);
 assert.match(pine,/entryConfirmedAt := m15WasC2 \? c3Start : verifiedM15At/);
});
test("provisional two-candle and expansion are never presented as confirmed entry",()=>{
 assert.match(pine,/if outPhase == 1\s+entryFamily := "CRT 2C CANDIDATO"\s+entryStage := "ESPERA CIERRE C2"/);
 assert.match(pine,/else if rejectedRecent\s+entryFamily := "CRT EXPANSION"\s+entryStage := "DIAG NO ENTRADA"/);
 assert.match(pine,/else if outPhase == 3\s+entryFamily := "CRT 3C HISTORICO"\s+entryStage := "EXPIRADO"/);
});
test("Inside returns/continuations stay diagnostic even if own state RATIFIED",()=>{
 assert.match(pine,/insideLast\.modelKind == "INSIDE_RETURN_BULL"/);
 assert.match(pine,/insideLast\.state == "CONTINUATION"/);
 assert.match(pine,/insideLast\.state == "RATIFIED" \? "SOLO DIAGNOSTICO"/);
 assert.doesNotMatch(pine,/entryConfirmedAt := insideLast/);
});
test("separate model rows do not override independent M5 and M15 status",()=>{
 assert.match(pine,/table\.cell\(board,0,5,"MODELO CRT"/);
 assert.match(pine,/table\.cell\(board,0,6,"OTROS CRT QA"/);
 assert.match(pine,/table\.cell\(board,2,7,m15CRTConfirmed \? "M15 OK" : "M15 ESP"/);
 assert.match(pine,/table\.cell\(board,5,1,m15CRTConfirmed \? "✓" : "—"/);
 assert.match(pine,/table\.cell\(board,5,5,"H4 \+ M15"/);
});
test("no change to CRT NY clock, confirmed provider D PDH/PDL, alert OFF",()=>{
 assert.match(pine,/f_btc_crt_h4_ny\(barT\)/);
 assert.match(pine,/chartPdhTaken = chartDayAuditReady and own\.chartDayHighM5 > chartPrevDHigh/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.match(pine,/validIndependent15 = [^\n]*outM15At/);
});
test("exact Pine model QA source Git hash is pinned, not real TradingView certification",()=>{
 const sha=createHash("sha1").update("blob "+Buffer.byteLength(pine,"utf8")+String.fromCharCode(0)+pine).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_MODEL_CATALOG);
 assert.notEqual(sha,"e817b887a7ac9445cbee1576d07991b6972a9e96");
});
