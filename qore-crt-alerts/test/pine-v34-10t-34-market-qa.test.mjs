import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root="../../crt-radar-pro/";
const old=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10S_MSS15_CAUSAL_FAMILIAS_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10T_CRT_QA_34_MERCADOS_NO_INTEGRADO.pine",import.meta.url),"utf8");
const android=readFileSync(new URL(root+"CRT_RADAR_PRO_V34_10T_CRT_QA_34_MERCADOS_ANDROID_COPIAR.txt",import.meta.url),"utf8");
const n=(s,x)=>s.split(x).length-1;
const need=(...xs)=>xs.forEach(x=>assert.ok(pine.includes(x),x));
const countInputs=s=>(s.match(/^s\d\d = input\.symbol\(/gm)||[]).length;

test("V34.10t 34 feeds selected by default; single ticker is explicit override only",()=>{
 need('memoryScan = input.string("34 instrumentos (experimental)"',
 'bool scanAll = memoryScan == "34 instrumentos (experimental)"',
 'for i = 0 to 33\n    if scanAll or i == 7',
 'Signal s = request.security(symbol, "5", f_engine_snapshot()',
 'bool btcSameChart = str.upper(syminfo.ticker) == "BTCUSD"');
 assert.equal(n(pine,'memoryScan = input.string("34 instrumentos (experimental)"'),1);
 assert.equal(countInputs(pine),34);
 assert.equal(countInputs(old),34);
});
test("BTC slot uses actual chart provider with all 34 enabled and is never duplicated in 34 index",()=>{
 need('bool btcSameChart = str.upper(syminfo.ticker) == "BTCUSD"',
 'if btcSameChart\n    array.set(scanSymbols, 7, syminfo.tickerid)',
 'bool sameAsChart = ticker.standard(sym) == ownStd',
 'if slotScanned and not sameAsChart');
 assert.doesNotMatch(pine,/not scanAll and str\.upper\(syminfo\.ticker\) == "BTCUSD"/);
});
test("Solo CRT + QA does NOT disable full 34 scan; view filters only displayed candidates",()=>{
 need('bool showQAInList = modeDashboard == "Solo CRT + QA" or allMode',
 'if slotScanned and not sameAsChart and (allMode or validMain or (showQAInList and hasCRT))',
 'bool extraValidQA = available and s.extraFamilyValid',
 's.extraFamilyKind == "INSIDE QA"',
 's.extraFamilyKind == "MULTI4 QA"',
 's.extraFamilyKind == "MULTI-N QA"',
 'bool family15QA = extraValidQA and not na(s.extraFamilyC1)',
 'family15QA ? 1 : 0');
 const shouldShow=(view,hasCore,hasQA)=>
  view==="Todos los instrumentos"||hasCore||
  (view==="Solo CRT + QA"&&(hasCore||hasQA));
 for(const [view,core,qa,want] of [
  ["Solo CRT",false,false,false],
  ["Solo CRT",false,true,false],
  ["Solo CRT",true,false,true],
  ["Solo CRT + QA",false,true,true],
  ["Solo CRT + QA",false,false,false],
  ["Solo CRT + QA",true,false,true],
  ["Todos los instrumentos",false,false,true]
 ])assert.equal(shouldShow(view,core,qa),want);
});
test("historical QA aggregates per 34 scanned feed, never promotes historical counts to live signals",()=>{
 need('int hist2C34 = 0','int hist3C34 = 0','int histInside34 = 0',
 'int histM434 = 0','int histMN34 = 0',
 'int withHistory34 = 0','int familyQA15Count = 0',
 'hist2C34 += h2','hist3C34 += h3','histInside34 += hi',
 'histM434 += hm4','histMN34 += hmn',
 'if h2 + h3 + hi + hm4 + hmn > 0',
 'table.cell(board,0,11,scanAll ? "34 HIST QA" : "BTC HIST QA"',
 'table.cell(board,0,12,"COBERT 34"',
 '"M15QA:"+str.tostring(familyQA15Count)');
 const loop=pine.slice(pine.indexOf('for i = 0 to 33\n    if scanAll or i == 7'),pine.indexOf('if str.length(alertsNow) > 0'));
 const histPos=loop.indexOf('hist2C34 += h2'),corePos=loop.indexOf('if scanCrtValid\n            found += 1');
 assert.ok(histPos>=0&&histPos<corePos);
 assert.doesNotMatch(loop,/if (hist2C34|histInside34|histMN34) > 0\s+found/);
 assert.match(pine,/if showHistoricAudit[\s\S]*table\.cell\(board,0,11,scanAll \? "34 HIST QA"/);
});
test("catalog is no longer restricted to BTC and pagination can reach 34 results",()=>{
 assert.equal(n(pine,'if showEntryCatalog\n'),2);
 assert.equal(n(pine,'if showEntryCatalog and chartBtcSymbol'),0);
 need('int maxOtherRows = showEntryCatalog ? 2 : 5',
 'page = input.int(1, "Pagina si hay mas senales", minval=1, maxval=34',
 'table.cell(board,0,7,"MSS QA [G]"',
 'table.cell(board,0,8,"HIST QA [G]"');
});
test("opened indices display C1 02/06/22 NY instead of the old BTC/Forex hours",()=>{
 need('bool indexChartQA = f_index()',
 'string c1ClocksQA = indexChartQA ? "C1:02/06/22" : "C1:01/05/21"',
 'table.cell(board,2,12,c1ClocksQA');
 assert.doesNotMatch(pine,/table\\.cell\\(board,2,12,"C1:01\\/05\\/21"/);
 assert.match(pine,/own\\.nyH4M5Count > 48 \\? \\(btcScope \\? "H4 EXTRA\\/DST" : "H4 EXTRA"\\)/);
});
test("no change to MSS 2C/3C, FVG/PDH, event alerts or security budget",()=>{
 assert.equal(android,pine);
 assert.equal(n(old,"request.security("),n(pine,"request.security("));
 assert.equal(n(old,"alert("),n(pine,"alert("));
 assert.equal(n(old,"plot("),n(pine,"plot("));
 need('useAlerts = input.bool(false',
 'if scanCrtValid\n            if m5t > 0',
 'if useAlerts and barstate.isrealtime and alert15',
 'f_engine_snapshot() =>',
 'bool extraMssCausal = extraFamily');
 const engine=s=>s.slice(s.indexOf('f_engine() =>'),s.indexOf('f_engine_snapshot() =>'));
 assert.equal(engine(old),engine(pine),"original CRT engine must not change");
});
