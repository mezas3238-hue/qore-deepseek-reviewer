// Independent DEMO-broker CRT/MSS research path.
// This NEVER impersonates IC/OANDA TV data or writes to the Android inbox.
// External push is disabled even if a synthetic fixture looks profitable.
import {INSTRUMENTS} from "./instruments.mjs";
import {validateClosedM5,M5_MS} from "./contracts.mjs";
import {replayCycle} from "./replay-cycle.mjs";

const fail=(reason,detail={})=>Object.freeze({state:reason,
  mode:"OFFLINE_CTRADER_DEMO_QA",sourceParityCertified:false,
  pushAuthorized:false,sendPush:false,canTrade:false,actionable:false,
  ...detail});
const pos=n=>Number.isSafeInteger(n)&&n>0;

export function evaluateCtraderDemoCrtMssQA({
  coverageRow,brokerName,candlesM5,c1StartMs,observedAtMs
}={}){
  if(!coverageRow||coverageRow.state!=="DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED"||
     coverageRow.sourceParityCertified!==false||coverageRow.canSendPush!==false||
     !pos(coverageRow.ctraderSymbolId)||!pos(c1StartMs)||
     !pos(observedAtMs)||!Array.isArray(candlesM5)||
     typeof brokerName!=="string"||brokerName.length===0)
    throw Error("CTRADER_DEMO_QA_SOURCE_SCOPE_REQUIRED");
  const market=INSTRUMENTS.find(x=>x.id===coverageRow.instrumentId&&
    x.tvSymbol===coverageRow.tvSymbol);
  if(!market)throw Error("CTRADER_TV_MARKET_IDENTITY_MISMATCH");
  if(candlesM5.length<96)
    return fail("INSUFFICIENT_M5_FOR_C1_C2",{m5Count:candlesM5.length});
  const timestamps=new Set();
  let last=null,phase=null;
  for(const c of candlesM5){
    if(c.provider!==brokerName||c.instrumentId!==market.id||
       c.symbolId!==coverageRow.ctraderSymbolId||
       c.source!=="CTRADER_OPEN_API_DEMO"||c.certified!==false||
       c.sendPush!==false||c.transport!=="DISABLED")
      return fail("BROKER_SOURCE_NOT_IDENTICAL");
    validateClosedM5(c);
    if(c.closedAt>observedAtMs)return fail("UNCLOSED_M5_IN_EVALUATION");
    if(timestamps.has(c.openedAt))return fail("DUPLICATE_M5_IN_EVALUATION");
    timestamps.add(c.openedAt);
    const currentPhase=c.openedAt%M5_MS;
    if(phase!==null&&phase!==currentPhase)
      return fail("NATIVE_PHASE_DRIFT_IN_EVALUATION");
    if(last!==null&&c.openedAt!==last+M5_MS)
      return fail("NON_CONTIGUOUS_M5_IN_EVALUATION");
    last=c.openedAt;phase=currentPhase;
  }
  if(!timestamps.has(c1StartMs)||c1StartMs%M5_MS!==phase)
    return fail("C1_NOT_IN_NATIVE_SOURCE_PHASE");
  const replay=replayCycle({candlesM5,c1Start:c1StartMs,family:market.family});
  if(replay.state!=="REPLAY_EVALUATED")
    return fail("REPLAY_INCOMPLETE",{replayState:replay.state,m5Count:candlesM5.length});
  const exactClosedPrice=(at)=>{
    if(!pos(at))return null;
    const bar=candlesM5.find(x=>x.closedAt===at);
    return bar?bar.close:null;
  };
  const stage=(s)=>Object.freeze({state:s?.state??"UNAVAILABLE",
    timeMs:pos(s?.mssAt)?s.mssAt:null,
    closePrice:exactClosedPrice(s?.mssAt),
    certified:false});
  return fail("REPLAY_EVALUATED_NOT_TV_CERTIFIED",{
    instrumentId:market.id,tvComparisonSymbol:market.tvSymbol,
    brokerSymbol:coverageRow.brokerSymbol,brokerName,
    nativePhaseMin:phase/60000,m5Count:candlesM5.length,
    crt:replay.crt?.state??"UNAVAILABLE",
    mssM5:stage(replay.mssM5),mssM15:stage(replay.mssM15),
    catalog:replay.modelCatalog??null,
    // Replay findings are not permissions for notifications/trading.
    requiresIndependentTradingViewParity:true
  });
}
