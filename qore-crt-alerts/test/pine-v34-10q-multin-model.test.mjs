import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectCrtMorphologies} from "../src/crt-structural-morphologies.mjs";
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10Q_MULTIN_H4_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const prev=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10P_SOLO_CRT_VIGENTE_QA_SEPARADO_NO_INTEGRADO.pine",import.meta.url),"utf8");
const count=(s,v)=>s.split(v).length-1;
const H4=14_400_000, base=Date.parse("2026-11-02T06:00:00Z");
const bar=(i,open,high,low,close,overrides={})=>({
  timeframe:"H4",provider:"COINBASE_QA",instrumentId:"BTCUSD",
  openedAt:base+i*H4,closedAt:base+(i+1)*H4,
  nyHour:(1+4*i)%24,allowedC1:i===0,
  open,high,low,close,...overrides
});
const c1=bar(0,105,110,100,105);
const inner=(i)=>bar(i,105,109,101,105);
const lowFinal=i=>bar(i,105,108,98,104);
const highFinal=i=>bar(i,105,112,102,106);
const nEvents=b=>inspectCrtMorphologies({closedH4:b,family:"crypto"}).signals.filter(x=>x.model==="CRT_MULTICANDLE");
test("Multi-N detects 2, 3, 4 or 5 strict interior H4 with terminal single lower sweep",()=>{
 for(let interior=2;interior<=5;interior++){
  const list=[c1,...Array.from({length:interior},(_,i)=>inner(i+1)),lowFinal(interior+1)];
  const events=nEvents(list);
  assert.equal(events.length,1,"N="+interior);
  assert.equal(events[0].direction,1);
  assert.equal(events[0].consolidationBars,interior);
  assert.equal(events[0].ratifiedAt,list.at(-1).closedAt);
  assert.equal(events[0].state,"RATIFIED_H4_QA");
  assert.equal(events[0].actionable,false);
  assert.equal(events[0].sendPush,false);
 }
});
test("Multi-N upper sweep on N=3 is independent, bearish and closed",()=>{
 const list=[c1,inner(1),inner(2),inner(3),highFinal(4)];
 assert.equal(nEvents(list).length,1);
 assert.equal(nEvents(list)[0].direction,-1);
});
test("Multi-N refuses a gap, equality inside, mixed provider and double sweep",()=>{
 const valid=[c1,inner(1),inner(2),lowFinal(3)];
 const candidates=[
  [c1,inner(1),inner(2),lowFinal(3)],
  [c1,bar(1,105,110,101,105),inner(2),lowFinal(3)],
  [c1,bar(1,105,109,101,105,{provider:"OTHER"}),inner(2),lowFinal(3)],
  [c1,inner(1),inner(2),bar(3,105,112,98,105)],
  [c1,inner(1),inner(2),bar(3,105,108,98,99)]
 ];
 candidates[0][1]={...valid[1],openedAt:valid[1].openedAt+300000};
 for(const bars of candidates) assert.equal(nEvents(bars).length,0);
});
test("Multi-N expires rather than carrying a historical tag to the next H4",()=>{
 const current=[c1,inner(1),inner(2),lowFinal(3)];
 const extended=[...current,inner(4)];
 assert.equal(nEvents(current).length,1);
 assert.equal(nEvents(extended).length,0);
});
test("Pine Multi-N uses only closed H4, continuous 2..5 interiors and a single-sided return",()=>{
 for(const needle of [
  "var array<MultiH4> qaMultiNHistory", "if not fullH4",
  "array.clear(qaMultiNHistory)", "if array.size(qaMultiNHistory) > 7",
  "for consolidationCount = 2 to 5",
  "MultiH4 beginH4 = array.get(qaMultiNHistory, c1Idx)",
  "MultiH4 endH4 = array.get(qaMultiNHistory, nHistory - 1)",
  "consecutive := consecutive and priorH4.endAt == nextBar.startAt",
  "internalBars := internalBars and consolidate.hi < beginH4.hi and consolidate.lo > beginH4.lo",
  "bool validTimeC1 = f_allowed(hour(beginH4.startAt, TZ), isIndex)",
  "bool sweepLowN = endH4.lo < beginH4.lo and endH4.hi <= beginH4.hi",
  "bool sweepHighN = endH4.hi > beginH4.hi and endH4.lo >= beginH4.lo",
  "bool returnN = endH4.cl >= beginH4.lo and endH4.cl <= beginH4.hi",
  "(sweepLowN != sweepHighN) and returnN",
  'qaMultiNKind := sweepLowN ? "MULTI-N BULL QA" : "MULTI-N BEAR QA"',
  "qaMultiNAt := endH4.endAt",
  "qaMultiNC1 := beginH4.startAt"
 ])assert.ok(pine.includes(needle),needle);
});
test("No extra security requests and original CRT C2/C3/MSS engine preserved",()=>{
 assert.equal(count(prev,"request.security("),count(pine,"request.security("));
 assert.equal(count(prev,"Signal s = request.security("),count(pine,"Signal s = request.security("));
 assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 const section=s=>s.split("            // C3 solo se invalida por el CIERRE de su H4, NO por cierre M5.")[1]?.split("    // ---- M4B: ESTADO DE LIQUIDEZ")[0];
 assert.ok(section(prev));assert.equal(section(prev),section(pine));
 assert.match(pine,/useAlerts = input\.bool\(false/);
 assert.match(pine,/if scanCrtValid\s+if m5t > 0/);
 assert.match(pine,/bool showQAInList = modeDashboard == "Solo CRT \+ QA" or allMode/);
 assert.match(pine,/if slotScanned and not sameAsChart and \(allMode or validMain or \(showQAInList and hasCRT\)\)/);
});
test("Multi-N remains QA only and cannot claim M5/M15 from 2C/3C core",()=>{
 assert.match(pine,/extraSelectMultiN \? "MULTI-N QA"/);
 assert.match(pine,/s\.extraFamilyKind == "MULTI-N QA"/);
 assert.match(pine,/familyLabel == "MULTI-N QA" \? "MN QA "/);
 assert.match(pine,/table\.cell\(board,4,r,validMain and array\.get\(m5Flags,i\)==1/);
 assert.match(pine,/table\.cell\(board,5,r,validMain and array\.get\(m15Flags,i\)==1/);
 assert.doesNotMatch(pine,/if useAlerts and barstate\.isrealtime and extraMultiN/);
});
