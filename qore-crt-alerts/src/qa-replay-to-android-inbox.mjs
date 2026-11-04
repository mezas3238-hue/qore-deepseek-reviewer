// Offline full path: CLOSED M5 -> CRT H4 + own M5/M15 pivots ->
// separate quarantined Android inbox rows. Never FCM, TLS or live feed.
import {INSTRUMENTS} from "./instruments.mjs";
import {replayCycle} from "./replay-cycle.mjs";
import {buildBlockedCrtMssInboxEvents,BlockedQaInbox}
  from "./qa-market-alert-bridge.mjs";
const confirmed=new Set(["MSS_CONFIRMED_C2","MSS_CONFIRMED_C3"]);
const ratified=new Set(["C2_RATIFIED_AWAITING_C3","C3_NOT_INVALIDATED"]);
const held=(reason,extra={})=>Object.freeze({
  status:reason,environment:"OFFLINE_REPLAY",sendPush:false,
  transport:"DISABLED",actionable:false,...extra
});
export function replayClosedM5IntoBlockedInbox({
  instrumentId,tvSymbol,c1StartMs,candlesM5,inbox=new BlockedQaInbox()
}={}){
  const market=INSTRUMENTS.find(x=>x.id===instrumentId);
  if(!market||market.tvSymbol!==tvSymbol||!Array.isArray(candlesM5)||
     !Number.isSafeInteger(c1StartMs)||c1StartMs<=0||
     !inbox||typeof inbox.record!=="function")
    throw Error("INVALID_OFFLINE_APP_BRIDGE_SCOPE");
  const source=tvSymbol.split(":")[0];
  if(!candlesM5.length||candlesM5.some(x=>x?.provider!==source||
     x.instrumentId!==instrumentId))
    return held("SOURCE_NOT_IDENTICAL_OR_EMPTY");
  // Rebuild entirely from supplied closed M5, not a claimed "CRT true"
  // flag or a TradingView label. Runtime feed mappings remain unverified.
  const replay=replayCycle({candlesM5,c1Start:c1StartMs,family:market.family});
  if(replay.state!=="REPLAY_EVALUATED"||!ratified.has(replay.crt.state))
    return held("NO_RATIFIED_CRT",{replayState:replay.state,
      crtState:replay.crt?.state??null});
  const crt=replay.crt;
  if(crt.provider!==source||crt.instrumentId!==instrumentId||
     crt.c1Start!==c1StartMs)
    return held("REPLAY_SOURCE_MISMATCH");
  const sweepAtMs=replay.mssM5?.sweepAt??replay.mssM15?.sweepAt;
  if(!Number.isSafeInteger(sweepAtMs)||
     sweepAtMs<=c1StartMs || sweepAtMs>crt.c2Start+14_400_000)
    return held("SWEEP_EVIDENCE_MISSING");
  const latest=Math.max(...candlesM5.map(x=>x.closedAt));
  const cycle=[source,instrumentId,c1StartMs,crt.direction].join("|");
  const fromMss=(x,timeframe)=>{
    if(!confirmed.has(x?.state))return {};
    return {provider:source,instrumentId,c1StartMs,direction:crt.direction,
      cycleId:cycle,pivotAtMs:x.pivotAt,breakAtMs:x.mssAt,
      ...(timeframe==="M15"?{lastClosedAtMs:latest-latest%900000}:{})};
  };
  const rows=buildBlockedCrtMssInboxEvents({
    instrumentId,tvSymbol,family:"CRT_2C_RETURN",
    direction:crt.direction,c1StartMs,sweepAtMs,
    c2RatifiedAtMs:crt.c2Start+14_400_000,
    sourcePhaseMin:(c1StartMs%300000)/60000,observedAtMs:latest,
    coreCrt:true,m5:fromMss(replay.mssM5,"M5"),
    m15:fromMss(replay.mssM15,"M15")
  });
  const recordOutcomes=rows.map(row=>inbox.record(row));
  return held("REPLAY_EVENTS_QUARANTINED",{
    events:rows,inboxCount:inbox.count,recordOutcomes,
    parityCertified:false,marketProviderLicensed:false,
    androidPushConfigured:false
  });
}
