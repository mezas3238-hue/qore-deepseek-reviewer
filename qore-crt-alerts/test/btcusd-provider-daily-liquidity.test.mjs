import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditBtcProviderDailyLiquidity} from "../src/btcusd-provider-daily-liquidity.mjs";
import {PINE_QA_BLOB_SHA_BTC_D_OFFICIAL} from "../src/parity-audit.mjs";
const src=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10G_QA_BTC_PDH_1D_OFICIAL_NO_INTEGRADO.pine",import.meta.url),"utf8");
const FIVE=300000,provider="BROKER_BTCUSD_QA_ONLY";
const ref=Object.freeze({provider,instrumentId:"BTCUSD",
  openedAt:Date.parse("2026-10-31T00:00:00Z"),
  closedAt:Date.parse("2026-11-01T00:00:00Z"),
  high:77645.12,low:76954.57});
const candles=(n=4,changes=()=>({}))=>Array.from({length:n},(_,i)=>({
 provider,instrumentId:"BTCUSD",
 openedAt:ref.closedAt+i*FIVE,closedAt:ref.closedAt+(i+1)*FIVE,
 open:77500,high:77600,low:77400,close:77550,...changes(i)
}));
test("chart 1D previous PDH is operational; NY price cannot overwrite it",()=>{
 const r=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:candles(5,i=>i===4?{high:77800}:{})});
 assert.equal(r.pdh,77645.12);
 assert.equal(r.pdhState,"TAKEN");
 assert.equal(r.pdhFirstSweepAt,ref.closedAt+5*FIVE);
 assert.equal(r.pdlState,"INTACTO");
 assert.equal(r.referenceType,"PREVIOUS_PROVIDER_DAILY_CLOSED");
 assert.equal(r.sendPush,false);
 assert.equal(r.actionable,false);
});
test("exact equal previous PDH or PDL remains intact on M5 closed wick",()=>{
 const r=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:candles(3,i=>
  i===2?{high:ref.high,low:ref.low}:{})});
 assert.equal(r.pdhState,"INTACTO");
 assert.equal(r.pdlState,"INTACTO");
});
test("PDL taken strictly below previous chart 1D",()=>{
 const r=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:candles(5,i=>
  i===1?{low:76900}:{})});
 assert.equal(r.pdlState,"TAKEN");
 assert.equal(r.pdlFirstSweepAt,ref.closedAt+2*FIVE);
 assert.equal(r.pdhState,"INTACTO");
});
test("missing first M5, later M5 gap or zero bars fail closed",()=>{
 const a=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:candles(3).slice(1)});
 assert.equal(a.pdhState,"N/D");assert.equal(a.pdlState,"N/D");
 const b=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:candles(4).filter((_,i)=>i!==1)});
 assert.equal(b.pdhState,"N/D");
 const c=auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:[]});
 assert.equal(c.pdhState,"N/D");
 assert.equal(c.contiguous,false);
});
test("daily reference from one exchange cannot be reused for another exchange",()=>{
 const wrong={...candles(1)[0],provider:"OTHER_PROVIDER"};
 assert.throws(()=>auditBtcProviderDailyLiquidity({prevDaily:ref,currentM5:[wrong]}),/SOURCE_MISMATCH/);
 assert.throws(()=>auditBtcProviderDailyLiquidity({prevDaily:{...ref,instrumentId:"ETHUSD"},currentM5:[]}),/PROVENANCE_REJECTED/);
});
test("provider D can have different UTC daily alignment but no future data",()=>{
 const shifted={...ref,openedAt:ref.openedAt+2*3600000,
  closedAt:ref.closedAt+2*3600000};
 const x=[{...candles(1)[0],openedAt:shifted.closedAt,
    closedAt:shifted.closedAt+FIVE}];
 const r=auditBtcProviderDailyLiquidity({prevDaily:shifted,currentM5:x});
 assert.equal(r.pdhState,"INTACTO");
 assert.equal(r.referenceEndMs,shifted.closedAt);
});
test("BTC Pine chart day M5 strict start and D confirmed high[1], no NY masquerade",()=>{
 assert.match(src,/chartDayId = time\("D"\)\[1\]/);
 assert.match(src,/currentChartContinuous := barT == chartDayId/);
 assert.match(src,/currentChartContinuous := currentChartContinuous and previousM5Continuous/);
 assert.match(src,/chartDayAuditReady =[^\n]+own\.chartDStart == chartPrevDCloseAt/);
 assert.match(src,/chartPdhTaken = chartDayAuditReady and own\.chartDayHighM5 > chartPrevDHigh/);
 assert.match(src,/chartPdlTaken = chartDayAuditReady and own\.chartDayLowM5 < chartPrevDLow/);
 assert.match(src,/request\.security\(syminfo\.tickerid,\s*"D",\s*\[high\[1\], low\[1\], time\[1\], time_close\[1\]\], lookahead=barmerge\.lookahead_on/);
 assert.match(src,/chartBtcSymbol \? "PDH 1D" : "PDH"/);
 assert.match(src,/chartBtcSymbol \? "PDL 1D" : "PDL"/);
 assert.match(src,/table\.cell\(board,0,11,"NY SOLO QA"/);
 assert.match(src,/useAlerts = input\.bool\(false/);
 assert.equal((src.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
});
test("Pine official daily QA source Git SHA pinned and not compiled externally",()=>{
 const sha=createHash("sha1").update(
  "blob "+Buffer.byteLength(src,"utf8")+String.fromCharCode(0)+src
 ).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_D_OFFICIAL);
});
