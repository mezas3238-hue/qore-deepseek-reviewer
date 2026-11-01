// ONE-SHOT read-only Bitcoin public market data smoke in GitHub Actions.
// No API key, websocket subscription, database, notification or trading.
// NOT a provider equivalence certificate. Never loops or sends pushes.
import {createHash} from "node:crypto";
import {ClosedM5Ingestion} from "../src/closed-m5-ingestion.mjs";
import {BTC_PROBE,fetchCoinbaseBtcM5,stageBtcProbeM5}
 from "../src/btcusd-coinbase-m5.mjs";
import {aggregateClosedCryptoM5} from "../src/crypto-aggregate.mjs";
import {replayCycle} from "../src/replay-cycle.mjs";
const FIVE=300000,now=Date.now();
const endMs=Math.floor((now-60000)/FIVE)*FIVE;
const startMs=endMs-192*FIVE;
try{
  const data=await fetchCoinbaseBtcM5({startMs,endMs,receivedAt:now,
    finalityLagMs:30000});
  if(!data.bars.length)throw Error("NO_CLOSED_BTC_M5");
  const intake=new ClosedM5Ingestion({
    provider:BTC_PROBE.provider,instrumentId:"BTCUSD",
    feedSymbol:"BTC-USD",maxBars:256,finalityLagMs:30000
  });
  const staged=stageBtcProbeM5(intake,data,{receivedAt:now});
  const aggregate=aggregateClosedCryptoM5(intake.snapshot(),{timeframe:"H4"});
  const m15=aggregateClosedCryptoM5(intake.snapshot(),{timeframe:"M15"});
  const replay=replayCycle({candlesM5:intake.snapshot(),
    c1Start:aggregate.complete[0]?.openedAt??startMs,family:"crypto"});
  const sha=createHash("sha256").update(JSON.stringify(data.bars))
    .digest("hex");
  console.log(JSON.stringify({
    instrumentId:"BTCUSD",source:BTC_PROBE.provider,
    nativePair:BTC_PROBE.feedSymbol,environment:"OFFLINE_REPLAY",
    startUtc:new Date(startMs).toISOString(),endUtc:new Date(endMs).toISOString(),
    closedM5:data.bars.length,expectedM5:data.expected,
    completeWindow:data.completeWindow,
    intakeState:staged.state,accepted:staged.accepted,
    completeH4:aggregate.complete.length,rejectedH4:aggregate.rejected.length,
    completeM15:m15.complete.length,rejectedM15:m15.rejected.length,
    outOfWindowOmitted:data.outOfWindowOmitted,
    replayState:replay.state,
    candleSha256:sha,crtSchedule:"FOREX_NY_OWNER_APPROVED",
    marketEquivalence:"UNVERIFIED",sendPush:false,actionable:false
  }));
}catch(e){
  console.error("BTCUSD_READONLY_PROBE_HELD:",
    /^[A-Z_]+$/.test(e?.message??"")?e.message:"PROBE_UNAVAILABLE");
  process.exitCode=1;
}
