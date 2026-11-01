import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const prev = readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10K_QA_MULTICANDLE_RETEST_M15_NO_INTEGRADO.pine", import.meta.url),"utf8");
const pine = readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10L_QA_PANEL_34_MODELOS_NO_INTEGRADO.pine", import.meta.url),"utf8");
test("V34.10l preserves the full CRT/MSS/FVG/PDH/PDL engine",()=>{
 const engine=s=>s.split("f_index() =>")[1].split("var table board =")[0];
 assert.equal(engine(pine),engine(prev));
 assert.equal((prev.match(/request\.security\(/g)||[]).length,(pine.match(/request\.security\(/g)||[]).length);
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
});
test("catalog always follows chart source in BTC when 34-scan is selected",()=>{
 assert.match(pine,/if showEntryCatalog and chartBtcSymbol/);
 assert.doesNotMatch(pine,/if showEntryCatalog and btcSameChartOnly/);
 assert.match(pine,/table\.cell\(board,0,5,"MODELO CRT"/);
 assert.match(pine,/table\.cell\(board,0,6,"OTROS CRT QA"/);
 assert.match(pine,/table\.cell\(board,3,6,chartAvailable \? own\.multi4Kind/);
 assert.match(pine,/table\.cell\(board,4,6,chartAvailable \? own\.retest15State/);
});
test("max rows cannot overwrite model or audit lines in 15-row board",()=>{
 assert.match(pine,/int maxOtherRows = showEntryCatalog and chartBtcSymbol \? 3 : 5/);
 assert.match(pine,/int othersOnPage = math\.max\(1,math\.min\(rowsToShow-1,maxOtherRows\)\)/);
 for(let requested=3;requested<=12;requested++)for(const catalog of [true,false]){
  const maxOtherRows=catalog?3:5;
  const n=Math.max(1,Math.min(requested-1,maxOtherRows));
  const occupied=Array.from({length:n},(_,i)=>i+2);
  const reserved=catalog?[5,6,7,8,9,10,11,12,13,14]:[7,8,9,10,11,12,13,14];
  assert.equal(occupied.some(row=>reserved.includes(row)),false);
 }
});
test("M15 status is real QA status, responses are not feed certification",()=>{
 assert.match(pine,/m15CRTConfirmed \? "M15 OK \(QA\)" : "M15 REQUERIDO"/);
 assert.match(pine,/scanAll \? "34 SNAP QA" : "BTC QA 1\/34"/);
 assert.match(pine,/"RESP:"\+str\.tostring\(checked\)/);
 assert.match(pine,/table\.cell\(board,5,6,"SOLO QA"/);
});
