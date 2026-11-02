#!/usr/bin/env node
// QA offline: compare attested 33 non-BTC H4/C1 snapshots ONLY.
// No market network access, TradingView execution, orders or push.
import {readFileSync} from "node:fs";
import {audit33NonBtcH4} from "../src/crt-33-nonbtc-h4-cohort-qa.mjs";
const [filename]=process.argv.slice(2);
if(!filename){
 process.stderr.write("Uso: npm run audit:33-h4 -- /ruta/evidencia-33-h4.json\n");
 process.stderr.write("Requiere snapshots originales de los 33 feeds; BTCUSD se audita aparte.\n");
 process.exitCode=2;
}else{
 try{
  const data=JSON.parse(readFileSync(filename,"utf8"));
  const r=audit33NonBtcH4(data);
  process.stdout.write(JSON.stringify(r,null,2)+"\n");
  // Exit 0 is snapshot cohort completeness, NEVER real CRT certification.
  process.exitCode=r.status==="33_NONBTC_SNAPSHOTS_VALID_BUT_UNCERTIFIED"?0:1;
 }catch(e){
  process.stderr.write("33 NON-BTC QA BLOCKED: "+e.message+"\n");
  process.exitCode=2;
 }
}
