import {createHash} from "node:crypto";

// Strictly OFFLINE records. No delivery queue, FCM sender, webhook, or
// production-certificate semantics are accessible through this module.
export const REPLAY_DELIVERY_BLOCK="BLOCKED_NOT_CERTIFIED";
const dig=(x)=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const isSha=(x)=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const posInt=(x)=>Number.isSafeInteger(x)&&x>0;
function checkedString(x,name,max=256){
  if(typeof x!=="string"||x.trim().length===0||x.length>max)throw Error("invalid "+name);
  return x;
}
// Produces append-only, immutable observation records, never messages.
export function createReplayObservation({replay,audit}){
  if(!replay||replay.state!=="REPLAY_EVALUATED"||
     replay.actionable!==false||replay.sendPush!==false)
    throw Error("replay must be evaluated and non-actionable");
  const signal=replay.confluence;
  if(!signal||signal.state!=="REPLAY_CRT_M15_CONFLUENCE"||
     signal.actionable!==false||signal.sendPush!==false||
     signal.environment!=="OFFLINE_REPLAY"||
     signal.requiresRealFeedAndPineParity!==true)
    throw Error("only held-offline CRT plus M15 confluence is recordable");
  if(!audit||audit.status!=="READY_FOR_PINE_REFERENCE"||
     audit.schema!=="QORE_CRT_PARITY_V1"||
     audit.actionable!==false||audit.sendPush!==false||
     !isSha(audit.candleSha256))
    throw Error("audit of identical M5 is mandatory");
  const provider=checkedString(audit.provider,"provider"),
    instrumentId=checkedString(audit.instrumentId,"instrumentId"),
    sourceId=checkedString(audit.sourceId,"sourceId");
  const expected=[provider,instrumentId,audit.c1Start,signal.direction].join("|");
  if(![1,-1].includes(signal.direction)||
     !posInt(audit.c1Start)||signal.cycleId!==expected||
     signal.instrumentId!==instrumentId||
     !posInt(signal.mssM15At)||
     audit.fields?.m15BreakAtMs!==signal.mssM15At||
     audit.fields?.c1StartMs!==audit.c1Start||
     audit.fields?.direction!==signal.direction||
     typeof signal.signalId!=="string"||
     signal.signalId!==expected+"|MSS_M15|"+signal.mssM15At)
    throw Error("cycle identity, M15 timestamp, or audit mismatch");
  const eventKey=checkedString(signal.signalId,"eventKey",512);
  const immutable={eventKey,sourceId,provider,instrumentId,
    family:checkedString(audit.family,"family"),
    c1StartMs:audit.c1Start,mssM15AtMs:signal.mssM15At,
    ohlcSha256:audit.candleSha256,
    mssM5AtMs:signal.mssM5At??null};
  const fingerprint=dig(immutable);
  return Object.freeze({...immutable,fingerprint,
    status:"QUARANTINED_REPLAY",
    deliveryState:REPLAY_DELIVERY_BLOCK,actionable:false,sendPush:false});
}

export class ReplayObservationLedger{
  #observations=new Map();
  record(observation){
    if(!observation||observation.status!=="QUARANTINED_REPLAY"||
       observation.deliveryState!==REPLAY_DELIVERY_BLOCK||
       observation.actionable!==false||observation.sendPush!==false||
       !isSha(observation.fingerprint)||!isSha(observation.ohlcSha256))
      throw Error("invalid quarantined observation");
    // Never accept mutated data or forged fingerprints into ledger.
    const {eventKey,sourceId,provider,instrumentId,family,c1StartMs,
      mssM15AtMs,ohlcSha256,mssM5AtMs,fingerprint}=observation;
    checkedString(eventKey,"eventKey",512);
    const expected=dig({eventKey,sourceId,provider,instrumentId,family,
      c1StartMs,mssM15AtMs,ohlcSha256,mssM5AtMs});
    if(fingerprint!==expected)throw Error("observation integrity mismatch");
    const previous=this.#observations.get(eventKey);
    if(previous){
      return Object.freeze({state:previous.fingerprint===fingerprint?
        "DUPLICATE_IGNORED":"CONFLICT_HELD_FOR_REVIEW",eventKey,
        inserted:false,deliveryState:REPLAY_DELIVERY_BLOCK});
    }
    this.#observations.set(eventKey,Object.freeze({...observation}));
    return Object.freeze({state:"QUARANTINED_RECORDED",eventKey,inserted:true,
      deliveryState:REPLAY_DELIVERY_BLOCK});
  }
  get(eventKey){
    return this.#observations.get(eventKey)??null;
  }
  list(){
    return Object.freeze([...this.#observations.values()]);
  }
  get count(){return this.#observations.size;}
}
