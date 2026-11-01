import {aggregateClosedM5} from "./aggregate.mjs";
import {aggregateClosedCryptoM5} from "./crypto-aggregate.mjs";
import {inspectCrtH4} from "./crt-h4.mjs";
import {inspectMssM5} from "./mss-m5.mjs";
import {inspectMssM15} from "./mss-m15.mjs";
import {classifyReplayConfluence} from "./signal-gate.mjs";

// Deterministic offline integration harness. Does not call external APIs.
// Given one completed C1, derives C2/C3 from the SAME series of closed M5.
// No live notifications or trades can be sent through this module.
export function replayCycle({candlesM5,c1Start,family}){
  if(!Number.isSafeInteger(c1Start))throw Error("c1Start must be UTC milliseconds");
  // BTC has no approved owner/Pine C1 schedule. Its 24/7 market observations
  // may be aggregated and audited, but MUST NOT reach CRT/MSS signal gates.
  if(family==="crypto"){
    const h4=aggregateClosedCryptoM5(candlesM5,{timeframe:"H4"});
    const m15=aggregateClosedCryptoM5(candlesM5,{timeframe:"M15"});
    return Object.freeze({
      state:"CRYPTO_C1_NOT_APPROVED",environment:"OFFLINE_REPLAY",
      family:"crypto",instrumentId:"BTCUSD",c1Start,
      completeH4:h4.complete.length,rejectedH4:h4.rejected.length,
      completeM15:m15.complete.length,rejectedM15:m15.rejected.length,
      c1Schedule:"NOT_APPROVED",requiresPineParity:true,
      confluence:null,actionable:false,sendPush:false
    });
  }
  const candles=aggregateClosedM5(candlesM5,{timeframe:"H4",family}).complete;
  const c1=candles.find(x=>x.openedAt===c1Start);
  const c2=c1&&candles.find(x=>x.openedAt===c1.closedAt);
  if(!c1||!c2)
    return Object.freeze({state:"INCOMPLETE_C1_C2",actionable:false,sendPush:false});
  const c3=candles.find(x=>x.openedAt===c2.closedAt)??null;
  const args={candlesM5,c1,c2,c3,family};
  const crt=inspectCrtH4(args);
  const mssM5=inspectMssM5(args);
  const mssM15=inspectMssM15(args);
  const confluence=classifyReplayConfluence({crt,mssM15,mssM5});
  return Object.freeze({state:"REPLAY_EVALUATED",actionable:false,sendPush:false,
    c1Start,crt,mssM5,mssM15,confluence});
}
