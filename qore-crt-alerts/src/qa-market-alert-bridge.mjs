// QORE CRT ALERTS / 34 markets / event-to-inbox bridge.
// QUARANTINED_OFFLINE only. No network, FCM, account credentials or alert().
// Runtime delivery requires an independent licensed M5 provider and Pine parity.
import {INSTRUMENTS} from "./instruments.mjs";
import {renderCrtMssQaStatus} from "./crt-seven-role-monitor-qa.mjs";

const families = new Set([
  "CRT_2C_RETURN","CRT_3C_TRUE","INSIDE_RETURN",
  "INSIDE_CONTINUATION_REJECTED","MULTI4","MULTI_N","M15_RETEST"
]);
const positive = x => Number.isSafeInteger(x) && x > 0;
const key = ({tvSymbol,instrumentId,c1StartMs,direction,kind,at}) =>
  [tvSymbol.split(":")[0],instrumentId,c1StartMs,direction,kind,at].join("|");
const freeze = x => Object.freeze(x);
// Only exact confirmed closed-bar timestamps and positive close prices can
// populate the notification detail. Pending stages expose NO future evidence.
const stageProof = (status,evidence,at,tf) =>
  status==="CONFIRMED" && positive(evidence?.breakAtMs) &&
  evidence.breakAtMs<=at && Number.isFinite(evidence.breakPrice) &&
  evidence.breakPrice>0 ? {
    [`mss${tf}AtMs`]:evidence.breakAtMs,
    [`mss${tf}Price`]:String(evidence.breakPrice)
  } : {};
const make = (ctx,kind,at,m5,m15,m5Evidence,m15Evidence) => freeze({
  schema:"QORE_CRT_MONITOR_QA_V2",mode:"OFFLINE_REPLAY",
  certification:"NOT_VERIFIED",transport:"DISABLED",
  deliveryState:"BLOCKED_NOT_CERTIFIED",sendPush:false,actionable:false,
  eventId:key({...ctx,kind,at}),eventType:kind,
  tvSymbol:ctx.tvSymbol,instrumentId:ctx.instrumentId,family:ctx.family,
  direction:ctx.direction===1?"BULLISH":"BEARISH",
  c1StartMs:ctx.c1StartMs,eventAtMs:at,
  mssM5:m5,mssM15:m15,
  ...stageProof(m5,m5Evidence,at,"M5"),
  ...stageProof(m15,m15Evidence,at,"M15"),
  // A status is not proof of an event: never promote QA to certified alerts.
  requiresRealFeedAndPineParity:true
});
export function buildBlockedCrtMssInboxEvents({
  instrumentId,tvSymbol,family,direction,c1StartMs,
  sweepAtMs,c2RatifiedAtMs,sourcePhaseMin,observedAtMs,
  coreCrt=false,extraStructuralQa=false,mask=0,m5={},m15={}
}={}){
  const market=INSTRUMENTS.find(x=>x.id===instrumentId);
  if(!market||market.tvSymbol!==tvSymbol||
     !families.has(family)||![1,-1].includes(direction)||
     !positive(c1StartMs)||!positive(observedAtMs)||observedAtMs<=c1StartMs||
     !Number.isSafeInteger(sourcePhaseMin)||sourcePhaseMin<0||sourcePhaseMin>4||
     !Number.isSafeInteger(mask)||mask<0||mask>127)
    throw Error("INVALID_QA_CRT_MARKET_IDENTITY");
  // Cross-family MSS evidence must not borrow another model's C1/pivot.
  if(coreCrt && family!=="CRT_2C_RETURN")throw Error("INVALID_CORE_FAMILY");
  if(extraStructuralQa && coreCrt)throw Error("AMBIGUOUS_QA_ROOT");
  if(!coreCrt && !extraStructuralQa)return freeze([]);
  if(coreCrt && (!positive(sweepAtMs)||!positive(c2RatifiedAtMs)||
     !(c1StartMs<sweepAtMs && sweepAtMs<c2RatifiedAtMs &&
       c2RatifiedAtMs<=observedAtMs)))throw Error("INCOMPLETE_CRT_CYCLE");
  if(extraStructuralQa && (!positive(sweepAtMs)||sweepAtMs<=c1StartMs||
      sweepAtMs>observedAtMs))throw Error("INCOMPLETE_QA_STRUCTURE");

  const provider=tvSymbol.split(":")[0];
  const projection=renderCrtMssQaStatus({
    provider,instrumentId,mask,coreCrt,extraStructuralQa,c1StartMs,
    sweepAtMs,direction,sourcePhaseMin,m5,m15,c2RatifiedAtMs
  });
  const ctx={tvSymbol,instrumentId,family,direction,c1StartMs};
  const m5Status=projection.mssM5,m15Status=projection.mssM15;
  const crtAt=coreCrt?c2RatifiedAtMs:observedAtMs;
  // Causal event snapshot: a CRT alert must NEVER see a later MSS as
  // already confirmed (offline replay can know the future otherwise).
  const atState=(status,breakAtMs,atMs)=>
    status==="CONFIRMED" && (!positive(breakAtMs)||breakAtMs>atMs)?
      "AWAITING":status;
  const out=[make(ctx,"CRT_OBSERVED",crtAt,
    atState(m5Status,m5.breakAtMs,crtAt),
    atState(m15Status,m15.breakAtMs,crtAt),m5,m15)];
  // Confirmation is for the same signed C1. A QA extra cannot claim a MSS.
  if(coreCrt && m5Status==="CONFIRMED" && positive(m5.breakAtMs) &&
      m5.breakAtMs<=observedAtMs)
    out.push(make(ctx,"MSS_M5_OBSERVED",m5.breakAtMs,"CONFIRMED",
      atState(m15Status,m15.breakAtMs,m5.breakAtMs),m5,m15));
  if(coreCrt && m15Status==="CONFIRMED" && positive(m15.breakAtMs) &&
      m15.breakAtMs<=observedAtMs)
    out.push(make(ctx,"MSS_M15_OBSERVED",m15.breakAtMs,
      atState(m5Status,m5.breakAtMs,m15.breakAtMs),"CONFIRMED",m5,m15));
  return freeze(out);
}

export class BlockedQaInbox {
  #events=new Map();
  record(event){
    if(!event || event.schema!=="QORE_CRT_MONITOR_QA_V2" ||
       event.mode!=="OFFLINE_REPLAY" ||
       event.deliveryState!=="BLOCKED_NOT_CERTIFIED"||
       event.sendPush!==false||event.actionable!==false||
       event.transport!=="DISABLED"||event.certification!=="NOT_VERIFIED"||
       event.requiresRealFeedAndPineParity!==true||
       !positive(event.eventAtMs)||
       typeof event.eventId!=="string"||
       event.eventId!==key({tvSymbol:event.tvSymbol,
         instrumentId:event.instrumentId,c1StartMs:event.c1StartMs,
         direction:event.direction==="BULLISH"?1:event.direction==="BEARISH"?-1:0,
         kind:event.eventType,at:event.eventAtMs})||
       !INSTRUMENTS.some(x=>x.id===event.instrumentId&&x.tvSymbol===event.tvSymbol))
       throw Error("NOT_A_QUARANTINED_CRT_EVENT");
    const existing=this.#events.get(event.eventId);
    if(existing)
      return freeze({state:JSON.stringify(existing)===JSON.stringify(event)?
        "DUPLICATE_HELD":"CONFLICT_HELD",sendPush:false});
    this.#events.set(event.eventId,freeze({...event}));
    return freeze({state:"QA_RECORDED_NO_DELIVERY",sendPush:false});
  }
  list(){return freeze([...this.#events.values()].sort((a,b)=>a.eventAtMs-b.eventAtMs));}
  get count(){return this.#events.size;}
}
