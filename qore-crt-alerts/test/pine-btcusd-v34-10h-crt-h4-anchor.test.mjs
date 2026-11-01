import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {bucketNY,nyParts,C1_HOURS} from "../src/ny-clock.mjs";
import {aggregateClosedCryptoM5} from "../src/crypto-aggregate.mjs";

const path=new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10H_QA_BTC_CRT_RELOJ_NY_NO_INTEGRADO.pine",import.meta.url);
const pine=readFileSync(path,"utf8");
const earlier=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10G_QA_BTC_PDH_1D_OFICIAL_NO_INTEGRADO.pine",import.meta.url),"utf8");
const HOUR=3600000,FIVE=300000;
const mk=(start,n)=>Array.from({length:n},(_,i)=>({
 provider:"COINBASE_SPOT_PROBE",instrumentId:"BTCUSD",
 openedAt:start+i*FIVE,closedAt:start+(i+1)*FIVE,
 open:70000,high:70080,low:69920,close:70010
}));
test("owner BTC C1 is still exactly NY 01/05/21",()=>{
 assert.deepEqual(C1_HOURS.crypto,[1,5,21]);
 assert.match(pine,/hh == 1 or hh == 5 or hh == 21/);
 assert.match(pine,/str\.upper\(syminfo\.ticker\) == "BTCUSD"/);
});
test("Pine BTC derives H4 anchor from each M5 NY hour, not time(240) session DST drift",()=>{
 assert.match(pine,/f_btc_crt_h4_ny\(int t\)\s*=>/);
 assert.match(pine,/int hr = hour\(t, TZ\)/);
 assert.match(pine,/hr >= 21 \? 21 : hr >= 17 \? 17 : hr >= 13 \? 13 : hr >= 9 \? 9 : hr >= 5 \? 5 : hr >= 1 \? 1 : 21/);
 assert.match(pine,/timestamp\(TZ, year\(dateRef, TZ\), month\(dateRef, TZ\), dayofmonth\(dateRef, TZ\), bucketHr, 0\)/);
 assert.match(pine,/int bucketH4 = isBTC \? f_btc_crt_h4_ny\(barT\) : isIndex \? time\("240",/);
 assert.match(earlier,/int bucketH4 = isIndex \? time\("240",/);
});
test("2026 Nov 1 post-fallback 08 NY is NOT allowed H4 start, 09 starts correctly",()=>{
 const hour08=Date.parse("2026-11-01T13:00:00Z");
 const hour09=Date.parse("2026-11-01T14:00:00Z");
 assert.equal(nyParts(hour08).hour,8);
 assert.equal(nyParts(hour09).hour,9);
 assert.equal(bucketNY(hour08,"H4","crypto").hour,5);
 assert.equal(bucketNY(hour09,"H4","crypto").hour,9);
 assert.equal(bucketNY(hour09,"H4","crypto").allowedC1,false);
 assert.notEqual(bucketNY(hour08,"H4","crypto").hour,8);
});
test("NY after DST anchors valid 01/05/09/13/17/21 all week",()=>{
 for(const [hour,expected] of [[0,21],[1,1],[4,1],[5,5],[8,5],[9,9],
   [12,9],[13,13],[16,13],[17,17],[20,17],[21,21],[23,21]]){
   // Nov 3 2026 is EST, local midnight = 05:00Z.
   const t=Date.parse("2026-11-03T05:00:00Z")+hour*HOUR;
   assert.equal(nyParts(t).hour,hour);
   assert.equal(bucketNY(t,"H4","crypto").hour,expected);
 }
});
test("BTC H4 requires full 48 contiguous closed M5; fallback 01 repeats and is blocked",()=>{
 assert.match(pine,/isBTC \? \(h4Count == 48 and bucketH4 - h4Bucket == H4MS\)/);
 const fallbackStart=Date.parse("2026-11-01T05:00:00Z");
 const r=aggregateClosedCryptoM5(mk(fallbackStart,60),{timeframe:"H4"});
 assert.equal(r.complete.length,0);
 assert.ok(r.rejected.length>0);
 assert.equal(r.sendPush,false);
});
test("RTC QA reveals C1/C2 reason and never promotes missing MSS into validated CRT",()=>{
 for(const x of ["qaC1Ready","qaC2Ratified","qaLastC2Gate",
  "C2 SIN BARRIDA","C2 DOBLE BARRIDA","C2 CIERRE FUERA",
  "C2 M5 NO 48","C3 HORA INVALIDA","M15 REQUERIDO"])
  assert.ok(pine.includes(x),x);
 assert.match(pine,/validRange and exactHour3/);
 assert.match(pine,/f_engine_snapshot\(\)\s*=>\s*Signal state = f_engine\(\)/);
 assert.match(pine,/useAlerts = input\.bool\(false/);
});
test("BTC PDH provider D remains operational and 34 slots preserved unchanged",()=>{
 assert.match(pine,/chartBtcSymbol \? "PDH 1D" : "PDH"/);
 assert.match(pine,/table\.cell\(board,0,11,"NY SOLO QA"/);
 assert.match(pine,/chartPdhTaken = chartDayAuditReady and own\.chartDayHighM5 > chartPrevDHigh/);
 assert.equal((pine.match(/^s\d\d\s*=\s*input\.symbol\(/gm)||[]).length,34);
 assert.match(pine,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.match(pine,/left15 = input\.int\(2/);
 assert.match(pine,/right15 = input\.int\(2/);
});
test("exact V34.10h git blob SHA pinned for audit, no TradingView compilation implied",()=>{
 const sha=createHash("sha1").update(
 "blob "+Buffer.byteLength(pine,"utf8")+String.fromCharCode(0)+pine).digest("hex");
 assert.equal(sha,"d254ff36c735ce071b46dc744e241ed25fb2b1ae");
});
