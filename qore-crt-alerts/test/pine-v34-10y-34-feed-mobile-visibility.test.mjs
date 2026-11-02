import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const old=load("CRT_RADAR_PRO_V34_10X_NY_NIVELES_MOVIL_QA_NO_INTEGRADO.pine");
const now=load("CRT_RADAR_PRO_V34_10Y_34_FEEDS_PANEL_MOVIL_QA_NO_INTEGRADO.pine");
const part=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i); assert.ok(i>=0&&j>i);return s.slice(i,j)};
const engine=s=>part(s,"f_engine() =>","f_engine_snapshot() =>");
const scan=s=>part(s,"for i = 0 to 33\n    if scanAll or i == 7\n        string symbol",'if str.length(alertsNow) > 0');
test("V34.10y does not rewrite CRT detection, time anchors, MSS or alerts",()=>{
 assert.equal(engine(now),engine(old));
 assert.equal(scan(now),scan(old));
 assert.equal((now.match(/request\.security\(/g)||[]).length,(old.match(/request\.security\(/g)||[]).length);
 assert.equal((now.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.match(now,/useAlerts = input\.bool\(false/);
});
test("34 feed QA view is default and Solo CRT/Solo CRT QA remain user-selectable",()=>{
 assert.match(now,/compactScope = input\.string\("34 feeds \(QA\)"/);
 assert.match(now,/options=\["34 feeds \(QA\)", "Solo CRT", "Solo CRT \+ QA"\]/);
 assert.match(now,/bool showAllFeedsMobile = compactScope == "34 feeds \(QA\)"/);
 assert.match(now,/bool eligibleRow = requestedSlot and \(showAllFeedsMobile or mainCRT or \(showExtrasMobile and qaCRT\)\)/);
 assert.match(now,/int totalPagesMobile = math\.max\(1,int\(math\.ceil\(totalVisibleMobile \* 1\.0 \/ 4\)\)\)/);
 assert.match(now,/table\.cell\(board,0,rr,array\.get\(scanNames,i\)/);
 assert.doesNotMatch(now,/table\.cell\(board,0,1,openName/);
});
test("QA view represents 34 slots even when no CRT is active",()=>{
 const src=now.slice(now.indexOf("// Mobile table reuses board;"));
 assert.match(src,/bool requestedSlot = scanAll or i == 7/);
 assert.match(src,/if requestedSlot and \(showAllFeedsMobile or mainCRT or \(showExtrasMobile and qaCRT\)\)/);
 assert.match(src,/int requestedTotalMobile = scanAll \? 34 : 1/);
 assert.match(src,/R:"\+str\.tostring\(checked\)/);
 assert.match(src,/SIN:"\+str\.tostring\(missing\)/);
 assert.match(src,/HIST:"\+str\.tostring\(withHistory34\)/);
 assert.match(src,/CRT:"\+str\.tostring\(found\)/);
 assert.match(src,/QA:"\+str\.tostring\(foundQA\)/);
 assert.match(src,/"BTC SOLO"/);
});
test("no false operational MSS assigned to provisional C2, Inside or Multi",()=>{
 const src=now.slice(now.indexOf("// Mobile table reuses board;"));
 assert.match(src,/bool m5Confirmed = mainCRT and array\.get\(m5Flags,i\) == 1/);
 assert.match(src,/bool m15Confirmed = mainCRT and array\.get\(m15Flags,i\) == 1/);
 assert.match(src,/bool m15QA = qaCRT and array\.get\(extraM15Flags,i\) == 1/);
 assert.match(src,/phase == 1 \? "C2\*"/);
 assert.match(src,/"NO PUSH"/);
});
test("Mobile view does not claim historical patterns are live CRT",()=>{
 const src=now.slice(now.indexOf("// Mobile table reuses board;"));
 assert.match(src,/mainCRT \? direction == 1 \? "ALC" : "BAJ"/);
 assert.match(src,/qaCRT \? qaKind == "INSIDE QA"/);
 assert.match(src,/not responded \? "SIN FEED"/);
 assert.match(src,/"QA!=CRT"/);
 assert.match(src,/table\.cell\(board,4,6,visualChartAligned/);
});
