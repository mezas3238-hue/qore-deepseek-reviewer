import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=n=>readFileSync(new URL("../../crt-radar-pro/"+n,import.meta.url),"utf8");
const previous=load("CRT_RADAR_PRO_V34_11L_HISTORIAL_7_CATEGORIAS_QA_NO_LIVE.pine");
const candidate=load("CRT_RADAR_PRO_V34_11M_HISTORICO_HORAS_UTC_MOVIL_QA_NO_LIVE.pine");
const section=(x,start,end)=>x.slice(x.indexOf(start),x.indexOf(end));

test("V34.11M changes presentation, not the detector, output Signal, 34 feeds or 60 plots",()=>{
 assert.equal(section(candidate,"f_engine() =>","f_engine_snapshot() =>"),
              section(previous,"f_engine() =>","f_engine_snapshot() =>"));
 assert.equal(section(candidate,"type Signal","// M3B.2"),
              section(previous,"type Signal","// M3B.2"));
 assert.equal((candidate.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
 assert.equal((candidate.match(/^\s*plot\(/gm)||[]).length,60);
 assert.equal((candidate.match(/request\.security\(/g)||[]).length,
              (previous.match(/request\.security\(/g)||[]).length);
 assert.ok(candidate.includes('if useAlerts and not qaPhase1NonBtc and barstate.isrealtime and alert15'));
 assert.ok(candidate.includes('"NO PUSH"'));
 assert.ok(candidate.includes('"SIN MSS PROOF"'));
});

test("V34.11M has default readable UTC but retains exact numeric evidence for Trader Lab",()=>{
 assert.ok(candidate.includes('qaReadableUtc = input.bool(true, "QA: mostrar fechas UTC (DD/MM HH:mm)"'));
 assert.ok(candidate.includes('qaReadableUtc ? str.format_time(t, "dd/MM HH:mm", "Etc/UTC") : str.tostring(math.round(t / 60000))'));
 assert.ok(candidate.includes('qaReadableUtc ? "DD/MM UTC" : "UTCmin"'));
 assert.ok(candidate.includes('"V34.11M"'));
 assert.ok(candidate.includes('shorttitle="CRT MSS QA 4C 11M"'));
 assert.ok(candidate.includes('qaHistoricLast = input.bool(false'));
 assert.ok(candidate.includes('table.cell(board,2,1,responded ? str.tostring(mask)'));
});

// The user's screenshot values describe a single local QA diagnostic at
// IC:NZDCAD. Converting UTCmin to wall time does NOT certify event causality.
test("UTCmin display mapping never shifts feed-native +1 minute timestamps",()=>{
 const observed={
   c2Pending:29893406,c2Ratified:29889181,
   rejectedExpansion:29893561,c3:29889421,
   insideReturn:29886541,insideContinuation:29889661,
   multi4:29889661,retest15:29888131
 };
 const fmt=n=>new Date(n*60000).toISOString().slice(5,16).replace("T"," ");
 assert.deepEqual(Object.fromEntries(Object.entries(observed).map(([k,v])=>[k,fmt(v)])),{
   c2Pending:"11-02 07:26",c2Ratified:"10-30 09:01",
   rejectedExpansion:"11-02 10:01",c3:"10-30 13:01",
   insideReturn:"10-28 13:01",insideContinuation:"10-30 17:01",
   multi4:"10-30 17:01",retest15:"10-29 15:31"
 });
 assert.equal(observed.c3-observed.c2Ratified,240);
 assert.equal(observed.retest15%15,1);
 assert.equal(observed.c2Ratified%5,1);
 // These checks are only chronology/format sanity. They never grant live eligibility.
 assert.ok(candidate.includes('"SIN CERT"'));
});
