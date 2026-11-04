import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>readFileSync(new URL("../../crt-radar-pro/"+p,import.meta.url),"utf8");
const previous=get("CRT_RADAR_PRO_V34_11E_ANCLA_NY_H4_DIAGNOSTICO_QA.pine");
const current=get("CRT_RADAR_PRO_V34_11F_COHORTE_33_SIN_BTC_QA.pine");
const between=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert.ok(i>=0&&j>i);return s.slice(i,j);};
const engine=s=>between(s,"f_engine() =>","f_engine_snapshot() =>");
const previousAnchor='int bucketH4 = isIndex ? f_index_crt_h4_ny(barT) : f_btc_crt_h4_ny(barT)';
const currentAnchor='int bucketH4 = isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)';
const report=current.slice(current.indexOf("// V34.11f: group-wide QA for all 33 markets"));
const defaults=[...current.matchAll(/^s(\d\d) = input\.symbol\("([^"]+)"/gm)]
 .map(([,slot,ticker])=>({slot:Number(slot),ticker}));
const bySlot=slot=>defaults.find(x=>x.slot===slot);
const fxSlots=defaults.filter(x=>x.slot!==8&&![4,5,6,7,17].includes(x.slot));
const metalSlots=[4,17];
const indexSlots=[5,6,7];

test("34 exact default symbols: 33 non-BTC split 28 FX, 2 metals, 3 indices",()=>{
 assert.equal(defaults.length,34);
 assert.equal(bySlot(8).ticker,"IC:BTCUSD");
 assert.equal(fxSlots.length,28);
 assert.equal(metalSlots.length,2);
 assert.equal(indexSlots.length,3);
 assert.equal(bySlot(4).ticker,"IC:XAUUSD");
 assert.equal(bySlot(17).ticker,"IC:XAGUSD");
 assert.deepEqual(indexSlots.map(i=>bySlot(i).ticker),
   ["OANDA:NAS100USD","IC:US500","IC:US30"]);
 assert.equal(new Set(defaults.map(x=>x.ticker)).size,34);
});
test("BTC engine dispatch remains independent from all 33 non-BTC anchors",()=>{
 assert.ok(current.includes("f_btc_crt_h4_ny(int t) =>"));
 assert.ok(current.includes("f_forex_metal_crt_h4_ny(int t) =>"));
 assert.ok(current.includes("f_index_crt_h4_ny(int t) =>"));
 assert.ok(current.includes(currentAnchor));
 assert.equal(engine(current).replace(currentAnchor,previousAnchor),engine(previous));
 assert.ok(!current.includes("int bucketH4 = isIndex ? f_index_crt_h4_ny(barT) : f_btc_crt_h4_ny(barT)"));
 const btcBlock=between(current,"f_btc_crt_h4_ny(int t) =>","// V34.11f: NON-BTC");
 assert.equal(btcBlock,between(previous,"f_btc_crt_h4_ny(int t) =>","// V34.11e: deterministic index"));
});
test("33 non-BTC results are iterated twice independently; BTC slot index 7 skipped",()=>{
 assert.ok(report.includes('showNonBtcCohortQA'));
 assert.ok(report.includes('int nonBtcRequested = scanAll ? 33 : 0'));
 assert.equal((report.match(/for i = 0 to 33/g)||[]).length,2);
 assert.equal((report.match(/if i != 7 and scanAll/g)||[]).length,2);
 assert.ok(report.includes("int visiblePage33 = math.min(page,lastPage33)"));
 assert.ok(report.includes("int lastPage33 = math.max(1,int(math.ceil(nonBtcRequested * 1.0 / 4)))"));
 assert.ok(report.includes("int ordinal33 = 0"));
 assert.ok(report.includes('"BTC APARTE"'));
 assert.ok(!report.includes("request.security("));
});
test("Every non-BTC row reports per-symbol H4 and C1 rather than NZDCAD only",()=>{
 assert.ok(report.includes("table.cell(board,0,rr,array.get(scanNames,i)"));
 for(const key of ["auditFeedAvailable","auditFeedH4Closed","auditFeedH4Gap","auditFeedC1",
   "auditFeedH4Internal","auditFeedH4Session","auditFeed2C","auditFeed3C","auditFeedInside","auditFeedM4","auditFeedMN"]){
   assert.ok(report.includes("array.get("+key+",i)"),key);
 }
 assert.ok(report.includes('"H4 BLOQ"'));
 assert.ok(report.includes('"SIN C1"'));
 assert.ok(report.includes('"SIN FEED"'));
 assert.ok(report.includes('"3C HIST"'));
 assert.ok(report.includes('"2C HIST"'));
 assert.ok(report.includes('"C1 LISTA"'));
 assert.ok(report.includes('"P "+str.tostring(visiblePage33)+"/"+str.tostring(lastPage33)'));
});
test("Cohort totals separate responded, C1 eligible, blocked, partial and internal gaps",()=>{
 for(const symbol of ["nonBtcResponded","nonBtcWithC1","nonBtcZeroC1",
  "nonBtcBlockedH4","nonBtcInternalGaps","nonBtcPartialGaps",
  "nonBtcWithCrtHistory","nonBtcHistory"]){
   assert.ok(report.includes(symbol),symbol);
 }
 assert.ok(report.includes('if c1Ok > 0'));
 assert.ok(report.includes('if h4Observed > 0 and h4Bad >= h4Observed'));
 assert.ok(report.includes('if array.get(auditFeed2C,i) > 0 or array.get(auditFeed3C,i) > 0'));
});
test("Visual slot classification covers 28 FX, 2 metals and 3 indexes with no BTC",()=>{
 assert.ok(report.includes('bool metalSlot = i == 3 or i == 16'));
 assert.ok(report.includes('bool indexSlot = i == 4 or i == 5 or i == 6'));
 assert.ok(report.includes('bool index33 = i == 4 or i == 5 or i == 6'));
 assert.ok(report.includes('bool metal33 = i == 3 or i == 16'));
 assert.ok(report.includes('string cls33 = index33 ? "IND" : metal33 ? "MET" : "FX"'));
 assert.ok(report.includes('"FX:"+str.tostring(fxAsked)'));
 assert.ok(report.includes('"MET:"+str.tostring(metalAsked)'));
 assert.ok(report.includes('"IND:"+str.tostring(indexAsked)'));
});
test("No alert/plot/request changes, strict H4/MSS rules untouched",()=>{
 assert.equal((current.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal(current.split("request.security(").length,previous.split("request.security(").length);
 assert.equal((current.match(/table\.new\(/g)||[]).length,(previous.match(/table\.new\(/g)||[]).length);
 assert.ok(current.includes('useAlerts = input.bool(false'));
 assert.ok(current.includes('calc_bars_count=1500'));
 assert.ok(current.includes('h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS'));
 assert.ok(current.includes('extraPivotAt < extraSweepAt and extraMssAt > extraSweepAt'));
 assert.ok(report.includes('"NO CERT"'));
 assert.ok(report.includes('"NO PUSH"'));
});
