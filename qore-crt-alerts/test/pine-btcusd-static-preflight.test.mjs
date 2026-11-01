import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {preflightBtcPineSource} from "../src/pine-btcusd-static-preflight.mjs";
import {PINE_QA_BLOB_SHA} from "../src/parity-audit.mjs";

const path=new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine",import.meta.url);
const source=readFileSync(path,"utf8");

test("exact BTC Pine QA candidate source passes structural preflight, NOT compilation",()=>{
 const r=preflightBtcPineSource(source);
 assert.equal(r.sourceSha,PINE_QA_BLOB_SHA);
 assert.equal(r.sourceShaMatchesAudit,true);
 assert.equal(r.staticSourceOk,true);
 assert.deepEqual(Object.keys(r.checks).length,11);
 assert.equal(Object.values(r.checks).every(Boolean),true);
 assert.equal(r.suggestedSameSourceQaChart,"COINBASE:BTCUSD");
 assert.equal(r.chartInputDefault,"IC:BTCUSD");
 assert.equal(r.indicatorCompiledOnTradingView,false);
 assert.equal(r.livePineParityVerified,false);
 assert.equal(r.certification,"NOT_CERTIFIED");
 assert.equal(r.sendPush,false);
});

test("changing BTC chart input in source invalidates exact Pine SHA",()=>{
 const r=preflightBtcPineSource(source.replace(
   'input.symbol("IC:BTCUSD", "BTCUSD"',
   'input.symbol("COINBASE:BTCUSD", "BTCUSD"'));
 assert.equal(r.sourceShaMatchesAudit,false);
 assert.equal(r.checks.btc34Slot,false);
 assert.equal(r.staticSourceOk,false);
 assert.equal(r.indicatorCompiledOnTradingView,false);
});

test("a deleted MSS M15 audit plot invalidates static parity readiness",()=>{
 const r=preflightBtcPineSource(source.replace(
   'title="QA CRT MSS M15 ruptura UTC min"',
   'title="REMOVED QA M15 LABEL"'));
 assert.equal(r.checks.everyParityAuditPlot,false);
 assert.equal(r.staticSourceOk,false);
 assert.equal(r.sendPush,false);
});

test("TradingView lookahead ON cannot pass source preflight",()=>{
 const r=preflightBtcPineSource(source.replace(
   'request.security(syminfo.tickerid, "5", f_engine(), lookahead=barmerge.lookahead_off',
   'request.security(syminfo.tickerid, "5", f_engine(), lookahead=barmerge.lookahead_on'));
 assert.equal(r.checks.closedM5Source,false);
 assert.equal(r.staticSourceOk,false);
});

test("preflight refuses empty and malformed source, not a substitute for compiler",()=>{
 assert.throws(()=>preflightBtcPineSource(""),/PINE_SOURCE_REQUIRED/);
 const r=preflightBtcPineSource("not a Pine script".repeat(20));
 assert.equal(r.staticSourceOk,false);
 assert.equal(r.indicatorCompiledOnTradingView,false);
});
