import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const paths=new URL("../../crt-radar-pro/",import.meta.url);
const original=readFileSync(new URL("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine",paths),"utf8");
const dir=new URL("qa-34-feed-memory-probes/",paths);
const p300=readFileSync(new URL("QORE_CRT_RADAR_A_34_MERCADOS_PROBE_300_M5_QA_NO_LIVE.pine",dir),"utf8");
const p600=readFileSync(new URL("QORE_CRT_RADAR_A_34_MERCADOS_PROBE_600_M5_QA_NO_LIVE.pine",dir),"utf8");
const gates=JSON.parse(readFileSync(new URL("../trader-lab/34-market-rollout-gates-v34-12i-2026-11-03.json",import.meta.url),"utf8"));
const engine=s=>s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
const trimProbe=s=>s.replace(/calc_bars_count=(300|600)\)/,"calc_bars_count=1500)")
 .replace(/\/\/ QA memoria: calc_bars_count=(300|600) M5 por fuente\. [^\n]+/,"// calc_bars_count=1500 M5, por fuente, no todo el mercado.");
test("300 / 600 probes change exactly requested M5 history, never the 34-symbol engine or signal contract",()=>{
 for(const [s,n] of [[p300,300],[p600,600]]){
  assert.equal(trimProbe(s),original,"only request depth and adjacent descriptive comment changed");
  assert.equal(engine(s),engine(original));
  assert.ok(s.includes('Signal s = request.security(symbol, "5", f_engine_snapshot(), lookahead=barmerge.lookahead_off, ignore_invalid_symbol=true, calc_bars_count='+n+')'));
  assert.equal([...s.matchAll(/^s\d\d = input\.symbol\(/gm)].length,34);
  assert.ok(s.includes('memoryScan = input.string("34 instrumentos (experimental)"'));
  assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(s));
 }
});
test("7 full H4 need >300 M5; diagnostic sample cannot certify MultiN",()=>{
 assert.equal(7*48,336);
 assert.ok(300<336&&600>336);
 assert.equal(gates.slots.length,34);
 assert.deepEqual([gates.slots.filter(x=>x.source_artifact_status!=="MISSING_SOURCE").length,gates.slots.filter(x=>x.source_artifact_status==="MISSING_SOURCE").length],[33,1]);
 assert.ok(gates.slots.every(x=>!x.tradingview_runtime_verified&&!x.valid_crt_replayed&&!x.broker_price_parity_verified));
 assert.equal(gates.globalTradingviewMemoryMeasured,false);
});
test("34 market gates are unique and exact-match Pine provider symbols",()=>{
 const source=[...original.matchAll(/^s(\d\d) = input\.symbol\("([^"]+)", "([^"]+)"/gm)];
 assert.equal(source.length,34);
 const mapped=new Map(source.map((m)=>[Number(m[1]),{ticker:m[2],name:m[3]}]));
 for(const c of gates.slots){assert.equal(mapped.get(c.slot).ticker,c.tradingview_symbol);assert.equal(mapped.get(c.slot).name,c.display);}
 assert.equal(new Set(gates.slots.map(x=>x.tradingview_symbol)).size,34);
});
