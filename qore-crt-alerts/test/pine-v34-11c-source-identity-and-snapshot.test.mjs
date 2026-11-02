import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const get=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const prior=get("CRT_RADAR_PRO_V34_11B_34_SLOT_CAUSAL_TRACE_QA.pine");
const next=get("CRT_RADAR_PRO_V34_11C_FEED_AUDIT_GRAFICO_QA.pine");
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const audits=s=>s.slice(s.indexOf("// V34.11b: read-only event snapshot"));
const audit=audits(next);
const plotCount=s=>(s.match(/^\s*plot\(/gm)||[]).length;

test("V34.11c preserves H4/C2/MSS5/MSS15 engine and 34-feed request graph",()=>{
 assert.equal(engine(next),engine(prior));
 assert.equal(next.split("request.security(").length,prior.split("request.security(").length);
 assert.equal((next.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal(plotCount(next),plotCount(prior));
 assert.equal(plotCount(next),60);
 assert.match(next,/useAlerts = input\.bool\(false/);
 assert.match(next,/calc_bars_count=1500/);
});

test("The audit defaults to exact-provider auto-follow and never matches an alias only",()=>{
 assert.ok(next.includes('qaFollowChart = input.bool(true, "QA: seguir grafico solo si proveedor coincide"'));
 assert.ok(audit.includes('int chartExactSlot = -1'));
 assert.ok(audit.includes('ticker.standard(array.get(scanSymbols,scanI)) == ownStd'));
 assert.ok(audit.includes('int slot = qaFollowChart and chartExactSlot >= 0 ? chartExactSlot : qaEventSlot - 1'));
 assert.ok(audit.includes('bool sameProviderFeed = ticker.standard(selectedFeed) == ownStd'));
 assert.ok(!audit.includes('str.upper(syminfo.ticker) == str.upper(array.get(scanNames,slot))'));
});

test("The same chart label is not used to infer same original provider",()=>{
 assert.ok(audit.includes('syminfo.tickerid'));
 assert.ok(audit.includes('selectedFeed'));
 assert.ok(audit.includes('"FEED!=CHART"'));
 assert.ok(audit.includes('"PROV DIF"'));
 assert.ok(audit.includes('"MISMO ORIGEN"'));
 assert.ok(audit.includes('qaFollowChart ? chartExactSlot >= 0 ? "AUTO" : "SIN MATCH" : "MANUAL"'));
 assert.ok(audit.includes('"FEED=CHART"'));
});

test("No live CRT state is presented as a historical event or a mask/event mismatch",()=>{
 assert.ok(audit.includes('"SIN CRT ACT"'));
 assert.ok(audit.includes('"MASK=EST"'));
 assert.ok(audit.includes('"EST ACTUAL"'));
 assert.ok(audit.includes('"R=RESP"'));
 assert.ok(audit.includes('"NO=OHLC QA"'));
 assert.ok(audit.includes('"NO LIVE"'));
 assert.ok(audit.includes('"NO PUSH"'));
 assert.ok(!next.includes('"MASK != EV"'));
});

test("QA symbol-specific pivot display never re-formats NZDCAD with BTCUSD tick size",()=>{
 assert.ok(audit.includes('str.tostring(p, "#.##########")'));
 assert.ok(!audit.includes('str.tostring(p, format.mintick)'));
 assert.ok(audit.includes('qaPivot15PriceBySlot'));
 assert.ok(audit.includes('qaExtraPivot15PriceBySlot'));
});

test("The only on-chart CRT H4 lines have unambiguous labels, strict C2 ratification and aligned NY time",()=>{
 assert.ok(next.includes('"CRT H4 NY HIGH"'));
 assert.ok(next.includes('"CRT H4 NY LOW"'));
 assert.ok(!next.includes('label.new(t2,own.crh,"CRH"'));
 assert.ok(!next.includes('label.new(t2,own.crl,"CRL"'));
 assert.ok(next.includes('bool visible = chartAvailable and own.phase == 2 and own.isPatternValid'));
 assert.ok(next.includes('own.crtRatifiedAt >= own.crtC2Start + H4MS'));
 assert.ok(next.includes('and visualChartAligned'));
});

test("The audit is opt-in, reuses a single 6x15 table, no additional lines/plots/alerts",()=>{
 assert.ok(next.includes('showSlotEventAudit = input.bool(false'));
 assert.ok(audit.includes('if barstate.islast and showDashboard and showSlotEventAudit'));
 assert.ok(audit.includes('table.clear(board,0,0,5,14)'));
 assert.equal((next.match(/table\.new\(/g)||[]).length,1);
 assert.equal((next.match(/request\.security\(/g)||[]).length,(prior.match(/request\.security\(/g)||[]).length);
 assert.ok(!audit.split("\n").some(x=>x.trimStart().startsWith("plot(")||x.trimStart().startsWith("alert(")));
});
