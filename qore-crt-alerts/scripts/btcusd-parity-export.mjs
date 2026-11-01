// One-shot public BTCUSD M5 capture for a HUMAN Pine parity investigation.
// Never certifies Pine, never sends FCM, never starts a continuous listener.
import {mkdirSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
import {fetchCoinbaseBtcM5} from "../src/btcusd-coinbase-m5.mjs";
import {buildBtcParityBundle} from "../src/btcusd-parity-bundle.mjs";

const FIVE=300000,now=Date.now();
const endMs=Math.floor((now-60000)/FIVE)*FIVE;
const startMs=endMs-192*FIVE;
const target=join(dirname(fileURLToPath(import.meta.url)),
  "..","parity-artifacts");
try{
  const probe=await fetchCoinbaseBtcM5({
    startMs,endMs,receivedAt:now,finalityLagMs:30000
  });
  const packet=buildBtcParityBundle(probe);
  mkdirSync(target,{recursive:true});
  writeFileSync(join(target,"btcusd-source-m5.json"),
    JSON.stringify(packet.dataset,null,2)+"\n",{flag:"w",mode:0o600});
  writeFileSync(join(target,"btcusd-backend-audit.json"),
    JSON.stringify(packet.backend,null,2)+"\n",{flag:"w",mode:0o600});
  writeFileSync(join(target,"btcusd-pine-capture-UNVERIFIED-template.json"),
    JSON.stringify(packet.pineCaptureTemplate,null,2)+"\n",
    {flag:"w",mode:0o600});
  writeFileSync(join(target,"btcusd-packet-status.json"),
    JSON.stringify({
      schema:packet.schema,status:packet.status,
      verifiedOnTradingView:false,pineCompilation:"NOT_VERIFIED",
      market:packet.market,sourceEquivalence:packet.sourceEquivalence,
      timeZone:packet.timeZone,c1HoursNY:packet.c1HoursNY,
      sourceId:packet.dataset.sourceId,
      candleSha256:packet.dataset.candleSha256,
      completeWindow:packet.dataset.completeWindow,
      windowStartMs:packet.dataset.windowStartMs,
      windowEndMs:packet.dataset.windowEndMs,
      c1Start:packet.dataset.c1Start,
      closedM5:packet.dataset.candlesM5.length,
      backendStatus:packet.backend.status,
      backendReason:packet.backend.reason??null,
      actionable:false,sendPush:false
    },null,2)+"\n",{flag:"w",mode:0o600});
  console.log(JSON.stringify({
    state:packet.status,instrumentId:"BTCUSD",
    sourceId:packet.dataset.sourceId,
    bars:packet.dataset.candlesM5.length,
    completeWindow:packet.dataset.completeWindow,
    c1Start:packet.dataset.c1Start,
    backendStatus:packet.backend.status,
    exportFolder:"qore-crt-alerts/parity-artifacts",
    verifiedOnTradingView:false,sendPush:false,actionable:false
  }));
  // An incomplete market capture is evidence to diagnose, not a pass.
  if(!packet.dataset.completeWindow)process.exitCode=2;
}catch(e){
  console.error("BTC_PARITY_EXPORT_HELD: "+(
    /^[A-Z_]+$/.test(e?.message??"")?e.message:"UNAVAILABLE"));
  process.exitCode=1;
}
