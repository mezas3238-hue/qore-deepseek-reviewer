import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const file=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const before=file("CRT_RADAR_PRO_V34_11D_HISTORIAL_POR_FEED_QA.pine");
const after=file("CRT_RADAR_PRO_V34_11E_ANCLA_NY_H4_DIAGNOSTICO_QA.pine");
const between=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert.ok(i>=0&&j>i);return s.slice(i,j)};
const engine=x=>between(x,"f_engine() =>","f_engine_snapshot() =>");
const anchorOld='int bucketH4 = isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? time("240", "0200-0200:1234567", TZ)[1] : time("240", "0100-0100:1234567", TZ)[1]';
const anchorNew='int bucketH4 = isIndex ? f_index_crt_h4_ny(barT) : f_btc_crt_h4_ny(barT)';
const newAnchorBlock=[
 "    // Same explicit NY clock used by BTC now also anchors Forex (01/05/21).",
 "    // Indices use 02/06/22. Do not infer a custom-session \"240\" boundary;",
 "    // it may not coincide with the actual NY calendar clock on this feed.",
 "    "+anchorNew
].join("\n");
const engineNoAnchor=engine(after).replace(newAnchorBlock,"    "+anchorOld);
const fmt=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit"});
function NYParts(ms){
 const o=Object.fromEntries(fmt.formatToParts(new Date(ms)).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
 return o;
}
function bucketByClock(ms,index){
 const t=NYParts(ms),h=t.hour,origin=index?2:1;
 const day=new Date(Date.UTC(t.year,t.month-1,t.day));
 let hh;
 if(h<origin){hh=index?22:21;day.setUTCDate(day.getUTCDate()-1)}
 else hh=origin+4*Math.floor((h-origin)/4);
 return [day.toISOString().slice(0,10),hh].join("T");
}

test("Engine is changed only in NY bucket choice; CRT sweep/MSS15 rules remain identical",()=>{
 assert.equal(engineNoAnchor,engine(before));
 assert.ok(after.includes(anchorNew));
 assert.ok(!after.includes('int bucketH4 = isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? time("240"'));
 assert.ok(after.includes('f_btc_crt_h4_ny(int t) =>'));
 assert.ok(after.includes('f_index_crt_h4_ny(int t) =>'));
 assert.ok(after.includes('int bucketHr = hr >= 22 ? 22 : hr >= 18 ? 18 : hr >= 14 ? 14 : hr >= 10 ? 10 : hr >= 6 ? 6 : hr >= 2 ? 2 : 22'));
 assert.ok(after.includes('int dateRef = hr < 2 ? t - 12 * 3600000 : t'));
});
test("No new plots, 34 requests, alerts or changes in M5/M15 gate",()=>{
 assert.equal((after.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((after.match(/^\s*plot\(/gm)||[]).length,(before.match(/^\s*plot\(/gm)||[]).length);
 assert.equal(after.split("request.security(").length,before.split("request.security(").length);
 assert.equal((after.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.ok(after.includes("h4Continuous and h4Count == 48 and h4FirstT == h4Bucket and h4LastEnd == h4Bucket + H4MS"));
 assert.ok(after.includes("c1CompleteData = h4Continuous"));
 assert.ok(after.includes("m15PivotAt <"));
 assert.ok(after.includes("useAlerts = input.bool(false"));
 assert.ok(after.includes('calc_bars_count=1500'));
});
test("Forex H4 NY keys follow 01/05/09/13/17/21, never broker's H4 start",()=>{
 const times=["2026-10-29T00:30:00-04:00","2026-10-29T01:05:00-04:00",
 "2026-10-29T04:59:00-04:00","2026-10-29T05:00:00-04:00",
 "2026-10-29T09:01:00-04:00","2026-10-29T21:00:00-04:00",
 "2026-10-29T23:30:00-04:00"];
 const expected=["2026-10-28T21","2026-10-29T1","2026-10-29T1","2026-10-29T5","2026-10-29T9","2026-10-29T21","2026-10-29T21"];
 assert.deepEqual(times.map(x=>bucketByClock(Date.parse(x),false)),expected);
});
test("Indices NY H4 keys follow 02/06/10/14/18/22 and previous-day 22 on midnight",()=>{
 const times=["2026-10-29T00:30:00-04:00","2026-10-29T01:59:00-04:00",
 "2026-10-29T02:00:00-04:00","2026-10-29T05:59:00-04:00",
 "2026-10-29T06:00:00-04:00","2026-10-29T22:01:00-04:00"];
 assert.deepEqual(times.map(x=>bucketByClock(Date.parse(x),true)),
 ["2026-10-28T22","2026-10-28T22","2026-10-29T2",
  "2026-10-29T2","2026-10-29T6","2026-10-29T22"]);
});
test("Normal winter and summer 4-hour closed M5 windows hold exactly 48 chronological bars",()=>{
 for(const start of ["2026-01-15T01:00:00-05:00","2026-07-15T05:00:00-04:00"]){
  const first=Date.parse(start);
  const slots=Array.from({length:48},(_,i)=>first+i*300000);
  assert.equal(new Set(slots.map(x=>bucketByClock(x,false))).size,1);
  assert.equal(bucketByClock(first+48*300000,false),
    bucketByClock(first+48*300000+300000,false));
  assert.notEqual(bucketByClock(first,false),bucketByClock(first+48*300000,false));
 }
});
test("QA now exposes whether all H4 incomplete are partial, truly internally broken, or C1 timing",()=>{
 const audit=after.slice(after.indexOf("// V34.11b: read-only event snapshot"));
 for(const x of ["auditFeedH4Gap","auditFeedH4Session","auditFeedH4Internal","auditFeedC1Hours","auditFeedC1Data","auditFeedC1Clock","auditFeedH4DST","auditFeedC2Rejected"])
  assert.ok(audit.includes("array.get("+x+",slot)"),x);
 assert.ok(audit.includes('"H4 PARC"'));
 assert.ok(audit.includes('"H4 INT"'));
 assert.ok(audit.includes('"C1 CLK"'));
 assert.ok(audit.includes('"NO PUSH"'));
 assert.ok(!audit.split("\n").some(x=>x.trimStart().startsWith("plot(")||x.trimStart().startsWith("alert(")));
});
