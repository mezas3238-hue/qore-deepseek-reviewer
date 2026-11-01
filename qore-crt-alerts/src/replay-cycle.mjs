import {aggregateClosedM5} from "./aggregate.mjs";
import {aggregateClosedCryptoM5} from "./crypto-aggregate.mjs";
import {inspectCrtH4} from "./crt-h4.mjs";
import {inspectMssM5} from "./mss-m5.mjs";
import {inspectMssM15} from "./mss-m15.mjs";
import {classifyReplayConfluence} from "./signal-gate.mjs";
import {classifyCrtEntryModels} from "./crt-entry-model-catalog.mjs";

// Deterministic offline integration harness. Does not call external APIs.
// Given one completed C1, derives C2/C3 from the SAME series of closed M5.
// No live notifications or trades can be sent through this module.
export function replayCycle({candlesM5,c1Start,family}){
  if(!Number.isSafeInteger(c1Start))throw Error("c1Start must be UTC milliseconds");
  // Owner authorized BTCUSD 01/05/21 NY C1, like Forex. The crypto
  // path still requires Pine/provider equivalence before FCM is enabled.
  const crypto=family==="crypto";
  const cryptoMeta=crypto?{
    family:"crypto",instrumentId:"BTCUSD",
    c1Schedule:"FOREX_NY_OWNER_APPROVED",requiresPineParity:true,
    marketEquivalence:"UNVERIFIED",environment:"OFFLINE_REPLAY"
  }:{};
  const candles=(crypto?
    aggregateClosedCryptoM5(candlesM5,{timeframe:"H4"}):
    aggregateClosedM5(candlesM5,{timeframe:"H4",family})).complete;
  const c1=candles.find(x=>x.openedAt===c1Start);
  const c2=c1&&candles.find(x=>x.openedAt===c1.closedAt);
  if(!c1||!c2)
    return Object.freeze({state:"INCOMPLETE_C1_C2",...cryptoMeta,actionable:false,sendPush:false});
  const c3=candles.find(x=>x.openedAt===c2.closedAt)??null;
  const args={candlesM5,c1,c2,c3,family};
  const crt=inspectCrtH4(args);
  const mssM5=inspectMssM5(args);
  const mssM15=inspectMssM15(args);
  const confluence=classifyReplayConfluence({crt,mssM15,mssM5});
  const modelCatalog=classifyCrtEntryModels({crt,mssM15,confluence});
  return Object.freeze({state:"REPLAY_EVALUATED",...cryptoMeta,actionable:false,sendPush:false,
    c1Start,crt,mssM5,mssM15,confluence,modelCatalog});
}
