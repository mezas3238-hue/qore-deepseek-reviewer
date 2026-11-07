import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {buildPrivateCtraderEurusdParityCsv,
 CTRADER_EURUSD_CSV_EXPORT_OPT_IN,CTRADER_EURUSD_PARITY_HEADER}
 from "../src/qa-ctrader-eurusd-parity-csv.mjs";
import {readDemoViewProbeConfig,runAuthorizedDemoWssProbe}
 from "../src/ctrader-demo-wss-probe-qa.mjs";
import {performStagingProbe}
 from "../scripts/railway-ctrader-demo-entry.mjs";
const M5=300000,NOW=1_800_000_000_000;
const env={
 QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
 QORE_PROVIDER:"IC",QORE_TRADING_ENABLED:"false",QORE_PUSH_ENABLED:"false",
 QORE_ALERT_TTL_SECONDS:"14400",QORE_CT_CLIENT_ID:"fake_id",
 QORE_CT_CLIENT_SECRET:"fake_secret_no_logging",
 QORE_CT_VIEW_ACCESS_TOKEN:"fake_token_no_logging",
 QORE_CT_DEMO_ACCOUNT_ID:"123456789",QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
 QORE_CT_SAMPLE_SYMBOL_ID:"1",QORE_CT_SAMPLE_SYMBOL_NAME:"EURUSD",
 QORE_CT_SAMPLE_INSTRUMENT_ID:"EURUSD",QORE_CT_QA_HISTORY_PAGES:"2",
 QORE_CT_QA_M5_CSV_EXPORT:CTRADER_EURUSD_CSV_EXPORT_OPT_IN
};
const rows=(count=600)=>Array.from({length:count},(_,i)=>{
 const t=NOW-(count-i)*M5;
 return {provider:"IC",instrumentId:"EURUSD",brokerSymbol:"EURUSD",
  symbolId:1,source:"CTRADER_OPEN_API_DEMO",
  certified:false,actionable:false,sendPush:false,
  openedAt:t,closedAt:t+M5,open:1.01200,
  high:1.01400,low:1.01100,close:1.01300};
});
test("600 real-shaped closed EURUSD M5 rows export exact comparator CSV, checksum and 25-line chunks",()=>{
 const x=buildPrivateCtraderEurusdParityCsv(rows());
 assert.equal(x.count,600);
 assert.equal(x.state,"PRIVATE_QA_CSV_NOT_PARITY_CERTIFIED");
 assert.equal(x.chunkCount,25);
 assert.equal(x.chunks[0].csvLines[0],CTRADER_EURUSD_PARITY_HEADER);
 assert.ok(x.chunks.every((c,i)=>c.chunkIndex===i&&c.csvLines.length<=25));
 const all=x.chunks.flatMap(c=>c.csvLines);
 assert.equal(all.length,601);
 assert.ok(all.slice(1).every(line=>line.startsWith("CTRADER_IC_DEMO,IC:EURUSD,IC MARKETS,Raw_Trading_Ltd_DEMO_OpenAPI_EURUSD_symbol1,")));
 assert.ok(all.slice(1).every(line=>line.endsWith(",true")));
 assert.equal(all[1].split(",")[5],"1.01200");
 assert.equal(all[1].split(",")[6],"1.01400");
 assert.equal(all[1].split(",")[7],"1.01100");
 assert.equal(all[1].split(",")[8],"1.01300");
 assert.equal(all[1].split(",")[4],new Date(rows()[0].openedAt).toISOString());
 assert.equal(x.sha256,createHash("sha256").update(all.join("\n")+"\n").digest("hex"));
 assert.ok(!JSON.stringify(x).includes("fake_secret_no_logging"));
 assert.equal(x.canTrade,false);
 assert.equal(x.sendPush,false);
 assert.equal(x.sourceParityCertified,false);
});
test("CSV source gates reject 599 rows, duplicates, gaps, non-DEMO, unclosed and bad OHLC",()=>{
 const cases=[
  rows(599),
  [...rows().slice(0,1),rows()[0],...rows().slice(1)],
  rows().map((x,i)=>i===40?{...x,openedAt:x.openedAt+M5}:x),
  rows().map((x,i)=>i===20?{...x,source:"TRADINGVIEW_IC"}:x),
  rows().map((x,i)=>i===20?{...x,symbolId:2}:x),
  rows().map((x,i)=>i===20?{...x,closedAt:x.closedAt-1000}:x),
  rows().map((x,i)=>i===20?{...x,certified:true}:x),
  rows().map((x,i)=>i===20?{...x,high:1.001}:x),
  rows().map((x,i)=>i===20?{...x,open:1.01234567}:x)
 ];
 for(const invalid of cases)
   assert.throws(()=>buildPrivateCtraderEurusdParityCsv(invalid),/CTRADER_CSV/);
});
test("export flag only for scoped EURUSD symbol 1, demo app, exact broker, two pages",()=>{
 const cfg=readDemoViewProbeConfig(env);
 assert.equal(cfg.exportPrivateCsv,true);
 for(const variation of [
  {QORE_CT_QA_HISTORY_PAGES:"1"},
  {QORE_CT_QA_HISTORY_PAGES:"3"},
  {QORE_CT_SAMPLE_SYMBOL_ID:"9"},
  {QORE_CT_SAMPLE_SYMBOL_NAME:"GBPUSD"},
  {QORE_CT_EXPECTED_BROKER_TITLE:"Other Broker"},
  {QORE_CT_QA_M5_CSV_EXPORT:"UNKNOWN"},
  {QORE_CT_STAGE:"LIVE"},
  {QORE_CT_OAUTH_SCOPE:"trading"}
 ]){
  assert.throws(()=>readDemoViewProbeConfig({...env,...variation}));
 }
 const disabled=readDemoViewProbeConfig({...env,QORE_CT_QA_M5_CSV_EXPORT:"DISABLED"});
 assert.equal(disabled.exportPrivateCsv,false);
});
test("private CSV never enters generic QA response when export mode is disabled",async()=>{
 const response=await performStagingProbe({
  env:{...env,QORE_CT_QA_M5_CSV_EXPORT:"DISABLED"},
  probe:async ({includePrivateCsv})=>{
   assert.equal(includePrivateCsv,false);
   return {state:"HISTORICAL_M5_QA_UNCERTIFIED",barCount:600,
    pagesFetched:2,gaps:0,privateCsv:{fake:true}};
  }
 });
 assert.equal(response.privateCsv,undefined);
 assert.equal(response.sendPush,false);
});
test("the export path is wired to WSS only after explicit scope and full 600 bars",async()=>{
 const response=await performStagingProbe({env,
  probe:async ({config,includePrivateCsv})=>{
   assert.equal(config.exportPrivateCsv,true);
   assert.equal(includePrivateCsv,true);
   const privateCsv=buildPrivateCtraderEurusdParityCsv(rows());
   return {state:"HISTORICAL_M5_QA_UNCERTIFIED",
     symbolName:"EURUSD",barCount:600,pagesFetched:2,
     gaps:0,privateCsv};
  }
 });
 assert.equal(response.privateCsv.count,600);
 assert.equal(response.m5ClosedBars,600);
 assert.equal(response.sendPush,false);
 assert.equal(response.sourceParityCertified,false);
});

test("Railway export emits true newline-separated JSON log records",async()=>{
 const {readFileSync}=await import("node:fs");
 const source=readFileSync(new URL("../scripts/railway-ctrader-demo-entry.mjs",
   import.meta.url),"utf8");
 assert.equal(source.includes(String.raw`+"\\n"`),false);
 assert.ok(source.includes(String.raw`+"\n"`));
});
