import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA_BTC_MEMORY} from "../src/parity-audit.mjs";
const legacy=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine",import.meta.url),"utf8");
const candidate=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10C_QA_MEMORIA_BTCUSD_NO_INTEGRADO.pine",import.meta.url),"utf8");
const extractSlots=s=>[...s.matchAll(/^s([0-9]{2})\s*=\s*input\.symbol\(/gm)].map(x=>x[1]);
test("V34.10c new QA candidate leaves all 34 configurable symbol slots intact",()=>{
 assert.equal(extractSlots(candidate).length,34);
 assert.deepEqual(extractSlots(candidate),extractSlots(legacy));
 assert.match(candidate,/s08\s*=\s*input\.symbol\("IC:BTCUSD"/);
 assert.match(candidate,/indicator\("CRT \+ MSS M5\/M15 \| V34\.10c QA MEMORIA BTCUSD NO INTEGRADO"/);
});
test("memory mode defaults to BTC-only, old 34 mode explicitly experimental",()=>{
 assert.match(candidate,/memoryScan\s*=\s*input\.string\("BTCUSD solo"/);
 assert.match(candidate,/bool scanAll = memoryScan == "34 instrumentos \(experimental\)"/);
 assert.match(candidate,/for i = 0 to 33\s+if scanAll or i == 7/);
 assert.match(candidate,/if slotScanned and not sameAsChart and \(allMode or hasCRT\)/);
 assert.match(candidate,/scanAll \? "34 FEEDS QA" : "BTC QA 1\/34"/);
});
test("snapshot wrapper still executes every closed M5 before returning only latest UDT",()=>{
 assert.match(candidate,/f_engine_snapshot\(\)\s*=>\s*Signal state = f_engine\(\)\s*barstate\.islast \? state : na/);
 assert.match(candidate,/Signal s = request\.security\(symbol, "5", f_engine_snapshot\(\), lookahead=barmerge\.lookahead_off/);
 assert.match(candidate,/Signal own = request\.security\(syminfo\.tickerid, "5", f_engine_snapshot\(\), lookahead=barmerge\.lookahead_off/);
 assert.doesNotMatch(candidate,/request\.security\([^,\n]+, "5", f_engine\(\)/);
 assert.equal((candidate.match(/calc_bars_count=1500/g)||[]).length,2);
});
test("BTC parity hour and obligatory MSS M15 unchanged while Pine signals stay off",()=>{
 assert.match(candidate,/string TZ = "America\/New_York"/);
 assert.match(candidate,/hh == 1 or hh == 5 or hh == 21/);
 assert.match(candidate,/0100-0100:1234567/);
 assert.match(candidate,/useAlerts = input\.bool\(false/);
 assert.match(candidate,/left15 = input\.int\(2/);
 assert.match(candidate,/right15 = input\.int\(2/);
 assert.match(candidate,/plot\(chartAvailable and not na\(own\.m15At\).*QA CRT MSS M15 ruptura UTC min/);
});
test("full original 34 request source not silently edited and new candidate is separate",()=>{
 assert.match(legacy,/V34\.10b QA BARRIDA ESTRICTA NO INTEGRADO/);
 assert.match(legacy,/Signal s = request\.security\(symbol, "5", f_engine\(\),/);
 assert.doesNotMatch(legacy,/memoryScan\s*=/);
});

test("BTC memory candidate exact Git blob SHA matches parity schema; not compiled",()=>{
 const sha=createHash("sha1").update(
   "blob "+Buffer.byteLength(candidate,"utf8")+"\\0"+candidate
 ).digest("hex");
 assert.equal(sha,PINE_QA_BLOB_SHA_BTC_MEMORY);
 assert.equal(sha,"3406fa3301ac7b4a65e7db5d02c14773b8c63739");
});
