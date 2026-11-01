import test from "node:test";
import assert from "node:assert/strict";
import {buildBtcParityBundle} from "../src/btcusd-parity-bundle.mjs";
import {BTC_PROBE} from "../src/btcusd-coinbase-m5.mjs";
import {hashM5,PINE_DATA_WINDOW_LABELS,
 comparePineToBackend} from "../src/parity-audit.mjs";

const FIVE=300000,C1=Date.parse("2026-10-31T05:00:00Z");
const mk=(n=108,start=C1)=>Array.from({length:n},(_,i)=>({
 provider:BTC_PROBE.provider,instrumentId:"BTCUSD",
 openedAt:start+i*FIVE,closedAt:start+(i+1)*FIVE,
 open:70000,high:i===0?70200:70100,
 low:i===48?69800:69900,close:70000
}));
const probe=(candlesM5=mk(),more={})=>({
 ...BTC_PROBE,state:"BTC_M5_PROBE_ONLY",bars:candlesM5,
 completeWindow:true,...more
});
test("BTC parity bundle exports full exact M5 and a non-attested Pine template",()=>{
 const bars=mk(),p=buildBtcParityBundle(probe(bars));
 assert.equal(p.schema,"QORE_CRT_BTC_PARITY_PACKET_V1");
 assert.equal(p.dataset.family,"crypto");
 assert.equal(p.dataset.chartToVerify,"COINBASE:BTCUSD");
 assert.equal(p.dataset.c1Start,C1);
 assert.equal(p.dataset.candleSha256,hashM5(bars));
 assert.equal(p.dataset.candlesM5.length,108);
 assert.equal(p.pineCaptureTemplate.verifiedOnTradingView,false);
 assert.equal(p.pineCaptureTemplate.c1Start,C1);
 assert.equal(Object.keys(p.pineCaptureTemplate.dataWindow).length,12);
 assert.equal(p.status,"PINE_EVIDENCE_MISSING");
 assert.equal(p.backend.status,"READY_FOR_PINE_REFERENCE");
 assert.equal(comparePineToBackend({backend:p.backend,pine:null}).status,
  "PINE_EVIDENCE_MISSING");
 assert.equal(p.actionable,false);assert.equal(p.sendPush,false);
});
test("BTC parity cannot be mislabeled compiled by editing only bundle flags",()=>{
 const p=buildBtcParityBundle(probe());
 assert.equal(p.verifiedOnTradingView,false);
 assert.equal(p.pineCompilation,"NOT_VERIFIED");
 assert.equal(p.pineCaptureTemplate.pineBlobSha.length,40);
 assert.ok(Object.values(PINE_DATA_WINDOW_LABELS).every(
  label=>p.pineCaptureTemplate.dataWindow[label]===null));
});
test("nonconsecutive dataset never yields a fabricated certified Pine reference",()=>{
 const m=mk().filter((_,i)=>i!==15);
 const p=buildBtcParityBundle(probe(m,{completeWindow:false}));
 assert.equal(p.backend.status,"BACKEND_INCOMPLETE");
 assert.equal(p.backend.reason,"INCOMPLETE_M5_WINDOW");
 assert.equal(p.sendPush,false);
});
test("no completed C2 + started C3 returns an honest incomplete packet",()=>{
 const p=buildBtcParityBundle(probe(mk(90)));
 assert.equal(p.backend.status,"BACKEND_INCOMPLETE");
 assert.equal(p.backend.reason,"NO_COMPLETE_C1_C2_WITH_PARTIAL_C3");
 assert.equal(p.dataset.c1Start,null);
 assert.equal(p.sendPush,false);
});
test("crypto wallet/foreign ticker and untrusted spoofed provider are rejected",()=>{
 assert.throws(()=>buildBtcParityBundle(probe([])),/INVALID_BTC_PARITY_CANDLES/);
 assert.throws(()=>buildBtcParityBundle({...probe(),sendPush:true}),
  /INVALID_BTC_PARITY_PROVENANCE/);
 assert.throws(()=>buildBtcParityBundle(probe([{...mk(1)[0],
  instrumentId:"ETHUSD"}])),/INVALID_BTC_PARITY_CANDLES/);
});
test("BTC same 108 bars hash independent of reversed Coinbase delivery order",()=>{
 const p=buildBtcParityBundle(probe());
 const q=buildBtcParityBundle(probe(mk().reverse()));
 assert.equal(p.dataset.candleSha256,q.dataset.candleSha256);
 assert.equal(p.dataset.c1Start,q.dataset.c1Start);
 assert.equal(p.pineCaptureTemplate.sourceId,q.pineCaptureTemplate.sourceId);
});
