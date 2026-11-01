import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {nyParts,C1_HOURS,bucketNY} from "../src/ny-clock.mjs";
import {PINE_QA_BLOB_SHA_BTC_NY} from "../src/parity-audit.mjs";
const read=name=>readFileSync(
  new URL("../../crt-radar-pro/"+name,import.meta.url),"utf8");
const previous=read("CRT_RADAR_PRO_V34_10C_QA_MEMORIA_BTCUSD_NO_INTEGRADO.pine");
const corrected=read("CRT_RADAR_PRO_V34_10D_QA_BTC_HORARIO_NY_NO_INTEGRADO.pine");
test("BTC CRT local NY hours remain 01 05 09 / 05 09 13 / 21 01 05",()=>{
 assert.deepEqual(C1_HOURS.crypto,[1,5,21]);
 for(const h of [1,5,21])assert.equal(C1_HOURS.crypto.includes(h),true);
 assert.equal(bucketNY(Date.parse("2026-10-31T05:00:00Z"),"H4","crypto").hour,1);
 assert.equal(bucketNY(Date.parse("2026-11-02T06:00:00Z"),"H4","crypto").hour,1);
});
test("Paraguay timestamps legitimately move at NY DST: Oct31 02 local vs Nov2 03 local",()=>{
 assert.equal(nyParts(Date.parse("2026-10-31T05:00:00Z")).hour,1);
 assert.equal(nyParts(Date.parse("2026-11-02T06:00:00Z")).hour,1);
 // UTC-03 Paraguay: 05:00Z = 02:00 PY (summer NY), 06:00Z = 03:00 PY (winter NY).
 assert.equal(new Date(Date.parse("2026-10-31T05:00:00Z")-3*3600000).getUTCHours(),2);
 assert.equal(new Date(Date.parse("2026-11-02T06:00:00Z")-3*3600000).getUTCHours(),3);
});
test("NY fallback repeated 01 is two UTC timestamps, both remain NY local hour 01",()=>{
 const first=nyParts(Date.parse("2026-11-01T05:00:00Z"));
 const second=nyParts(Date.parse("2026-11-01T06:00:00Z"));
 assert.equal(first.hour,1);assert.equal(second.hour,1);
 assert.equal(first.day,second.day);
});
test("V34.10d keeps 34 slots but defaults BTC-only with minimal memory snapshots",()=>{
 assert.equal((corrected.match(/^s\d\d = input\.symbol/gm)||[]).length,34);
 assert.match(corrected,/memoryScan = input\.string\("BTCUSD solo"/);
 assert.match(corrected,/f_engine_snapshot\(\)\s*=>\s*Signal state = f_engine\(\)/);
 assert.match(corrected,/V34\.10d QA BTC HORARIO NY NO INTEGRADO/);
 assert.match(previous,/V34\.10c QA MEMORIA BTCUSD NO INTEGRADO/);
});
test("BTC C1/C2/C3 completeness requires exactly 48 M5 across 4 real UTC hours",()=>{
 assert.match(corrected,/bool isBTC = str\.upper\(syminfo\.ticker\) == "BTCUSD"/);
 assert.match(corrected,/bool validC2Data = [^\n]+isBTC \? \(h4Count == 48 and bucketH4 - h4Bucket == H4MS\)/);
 assert.match(corrected,/bool validC3Close = [^\n]+isBTC \? \(h4Count == 48 and bucketH4 - h4Bucket == H4MS\)/);
 assert.match(corrected,/if f_allowed\(lastC1Hour, isIndex\)[^\n]+isBTC \? \(h4Count == 48 and bucketH4 - h4Bucket == H4MS\)/);
 assert.match(corrected,/invalidAtC3Close or \(isBTC and not validC3Close\)/);
 assert.doesNotMatch(previous,/bool isBTC = str\.upper\(syminfo\.ticker\) == "BTCUSD"/);
});
test("NY engine H4 bucket and broker chart H4 difference explicitly shown in dashboard",()=>{
 assert.match(corrected,/nyH4Start/);
 assert.match(corrected,/nyH4M5Count/);
 assert.match(corrected,/str\.format_time\(own\.nyH4Start, "dd\/MM HH:mm", TZ\)/);
 assert.match(corrected,/H4 BROKER != NY/);
 assert.match(corrected,/QA BTC H4 NY inicio UTC min/);
 assert.match(corrected,/QA BTC H4 M5 cerradas/);
 assert.match(corrected,/C1:01\/05\/21/);
});
test("new NY schedule QA Pine SHA immutable, noncertified and FCM still OFF",()=>{
 const sha=createHash("sha1").update(
   "blob "+Buffer.byteLength(corrected,"utf8")+String.fromCharCode(0)+corrected
 ).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_NY);
 assert.match(corrected,/useAlerts = input\.bool\(false/);
 assert.match(corrected,/America\/New_York/);
 assert.match(corrected,/left15 = input\.int\(2/);
 assert.match(corrected,/right15 = input\.int\(2/);
});
