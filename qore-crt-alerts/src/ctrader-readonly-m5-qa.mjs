// cTrader Open API -> QORE CRT ALERTS / 34-market source gate.
// OFFLINE / QA adapter ONLY: no HTTP/WebSocket, secrets, OAuth, FCM or orders.
// TV symbols are display/comparison references, NOT broker feed identities.
// Source: https://help.ctrader.com/open-api/symbol-data/
import {INSTRUMENTS} from "./instruments.mjs";
import {validateClosedM5, M5_MS} from "./contracts.mjs";

const allowedRequests=Object.freeze(new Set([
  "ProtoOASymbolsListReq", "ProtoOASymbolByIdReq",
  "ProtoOAGetTrendbarsReq", "ProtoOASubscribeSpotsReq",
  "ProtoOASubscribeLiveTrendbarReq",
  "ProtoOAUnsubscribeSpotsReq", "ProtoOAUnsubscribeLiveTrendbarsReq"
]));
const freeze=x=>Object.freeze(x);
const pos=x=>Number.isSafeInteger(x)&&x>0;
const plain=x=>x && typeof x==="object" && !Array.isArray(x);
const name=x=>typeof x==="string" && /^[A-Za-z0-9_./:-]{1,80}$/.test(x);
const int=x=>{
  if(typeof x==="number" && Number.isSafeInteger(x)) return x;
  if(typeof x==="string" && /^(0|[1-9][0-9]*)$/.test(x)) {
    const n=Number(x);
    if(Number.isSafeInteger(n)) return n;
  }
  return null;
};
export const CTRADER_QA_MODE="READ_ONLY_DEMO_OFFLINE";
export const CTRADER_OPEN_API_READ_REQUESTS=freeze([...allowedRequests]);

export function verifyDemoScope({account,scope}={}){
  // Open API OAuth "accounts" is the view-only scope. An explicitly
  // identified DEMO account is required; do not infer from endpoint host.
  if(scope!=="accounts") throw Error("CTRADER_SCOPE_MUST_BE_ACCOUNTS_READ_ONLY");
  if(!plain(account)||!pos(int(account.ctidTraderAccountId))||
      account.isLive!==false||!name(account.brokerName))
    throw Error("CTRADER_VERIFIED_DEMO_ACCOUNT_REQUIRED");
  return freeze({accountId:int(account.ctidTraderAccountId),
    brokerName:account.brokerName,scope:"accounts",mode:CTRADER_QA_MODE,
    canTrade:false,canSendPush:false});
}

export function planReadOnlyRequest(type,fields={},context){
  if(!allowedRequests.has(type))throw Error("CTRADER_REQUEST_DENIED_READ_ONLY");
  if(!context||context.mode!==CTRADER_QA_MODE||
      context.scope!=="accounts"||context.canTrade!==false)
    throw Error("CTRADER_READ_ONLY_CONTEXT_REQUIRED");
  if(!plain(fields)) throw Error("CTRADER_REQUEST_FIELDS_INVALID");
  // The OAuth and account-authentication handshake belongs to the
  // future approved transport. This function NEVER sends a request.
  if(Object.keys(fields).some(k=>/token|password|secret|order|volume|position/i.test(k)))
    throw Error("CTRADER_UNSAFE_FIELDS");
  if(fields.ctidTraderAccountId!==undefined &&
      int(fields.ctidTraderAccountId)!==context.accountId)
    throw Error("CTRADER_ACCOUNT_SCOPE_MISMATCH");
  return freeze({type,fields:freeze({...fields}),mode:CTRADER_QA_MODE,
    transport:"NOT_CONNECTED",sendPush:false,canTrade:false});
}

export function evaluateCtrader34Coverage({
  account,scope,discoveredSymbols=[],approvedMappings=[]
}={}){
  const context=verifyDemoScope({account,scope});
  if(!Array.isArray(discoveredSymbols)||!Array.isArray(approvedMappings))
    throw Error("CTRADER_INVENTORY_MUST_BE_ARRAY");
  const byId=new Map();
  for(const symbol of discoveredSymbols){
    const symbolId=int(symbol?.symbolId);
    const symbolName=symbol?.symbolName;
    if(!pos(symbolId)||!name(symbolName)||byId.has(symbolId))
      throw Error("CTRADER_SYMBOL_INVENTORY_INVALID_OR_DUPLICATE");
    byId.set(symbolId,freeze({symbolId,symbolName,
      enabled:symbol.enabled===true,digits:symbol.digits}));
  }
  const mappingByMarket=new Map(),mappingBySymbol=new Set();
  for(const m of approvedMappings){
    if(!plain(m)||!INSTRUMENTS.some(x=>x.id===m.instrumentId &&
         x.tvSymbol===m.tvSymbol) ||
       !pos(int(m.symbolId))||!name(m.brokerSymbolName)||
       m.ownerApproved!==true ||
       mappingByMarket.has(m.instrumentId)||mappingBySymbol.has(int(m.symbolId)))
      throw Error("CTRADER_OWNER_MAPPING_REQUIRED_AND_UNIQUE");
    mappingByMarket.set(m.instrumentId,m);
    mappingBySymbol.add(int(m.symbolId));
  }
  const rows=INSTRUMENTS.map(m=>{
    const binding=mappingByMarket.get(m.id),found=binding && byId.get(int(binding.symbolId));
    const named=!!(found && found.symbolName===binding.brokerSymbolName);
    const available=named && found.enabled===true;
    const state=!binding?"UNMAPPED":!named?"BROKER_SYMBOL_UNAVAILABLE":
      !available?"BROKER_SYMBOL_DISABLED":"DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED";
    return freeze({slot:m.slot,instrumentId:m.id,tvSymbol:m.tvSymbol,
      ctraderSymbolId:available?found.symbolId:null,
      brokerSymbol:available?found.symbolName:null,
      state,sourceParityCertified:false,canSendPush:false,
      // Even an exact broker symbol name is NOT proof of IC/OANDA OHLC parity.
      tvSourceEquivalence:"UNVERIFIED"});
  });
  const candidates=rows.filter(x=>x.state==="DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED").length;
  return freeze({mode:CTRADER_QA_MODE,brokerName:context.brokerName,
    coverage:freeze({total:34,mapped:approvedMappings.length,
      brokerCandidates:candidates,sourceParityCertified:0,sendPushEnabled:0}),
    rows:freeze(rows),canTrade:false,canSendPush:false,
    status:"AWAITING_REAL_BROKER_INVENTORY_AND_PINE_PARITY"});
}

export function planM5Subscription(coverageRow,context){
  if(!coverageRow||coverageRow.state!=="DEMO_FEED_CANDIDATE_PARITY_UNVERIFIED"||
     coverageRow.sourceParityCertified!==false||!pos(coverageRow.ctraderSymbolId))
    throw Error("CTRADER_CANNOT_SUBSCRIBE_UNMAPPED_MARKET");
  const symbolId=coverageRow.ctraderSymbolId;
  const common={ctidTraderAccountId:context?.accountId,symbolId};
  // Spec mandates spots first, live trendbars second. No connection attempted.
  // ProtoOASubscribeSpotsReq.symbolId is REPEATED int64.
  // LiveTrendbarReq.symbolId is scalar; ProtoOATrendbarPeriod.M5 = 5.
  const spots=planReadOnlyRequest("ProtoOASubscribeSpotsReq",
    {ctidTraderAccountId:context.accountId,symbolId:[symbolId],
     subscribeToSpotTimestamp:true},context);
  const bars=planReadOnlyRequest("ProtoOASubscribeLiveTrendbarReq",
    {...common,period:5},context);
  return freeze({requests:freeze([spots,bars]),transport:"NOT_CONNECTED",
    sendPush:false,mode:CTRADER_QA_MODE});
}

export function normalizeClosedCtraderTrendbar({
  trendbar,binding,observedAtMs,provenClosedAtMs,period="M5"
}={}){
  if(!plain(binding)||!name(binding.instrumentId)||
     !name(binding.brokerName)||!name(binding.brokerSymbolName)||
     !pos(int(binding.symbolId))||
     !Number.isInteger(binding.digits)||binding.digits<0||binding.digits>10 ||
     binding.ownerApproved!==true||period!=="M5")
    throw Error("CTRADER_M5_UNAPPROVED_BINDING");
  const t=int(trendbar?.utcTimestampInMinutes), low=int(trendbar?.low);
  const dh=int(trendbar?.deltaHigh),do_=int(trendbar?.deltaOpen),
    dc=int(trendbar?.deltaClose);
  if(!pos(t)||low===null||low<=0||[dh,do_,dc].some(v=>v===null||v<0)||
      ![low+dh,low+do_,low+dc].every(Number.isSafeInteger)||
      dh<do_||dh<dc)
    throw Error("CTRADER_M5_INVALID_RELATIVE_OHLC");
  const openedAt=t*60_000,closedAt=openedAt+M5_MS;
  if(!Number.isSafeInteger(openedAt)||!pos(observedAtMs)||
     !pos(provenClosedAtMs)||observedAtMs<closedAt ||
     provenClosedAtMs<closedAt||provenClosedAtMs>observedAtMs ||
     (trendbar?.period!==undefined&&trendbar.period!=="M5"))
    throw Error("CTRADER_M5_NOT_PROVEN_CLOSED");
  const decode=v=>Number(((low+v)/100_000).toFixed(binding.digits));
  const candle=validateClosedM5({provider:binding.brokerName,
    instrumentId:binding.instrumentId,openedAt,closedAt,
    low:decode(0),high:decode(dh),open:decode(do_),close:decode(dc)});
  return freeze({...candle,source:"CTRADER_OPEN_API_DEMO",brokerSymbol:binding.brokerSymbolName,
    symbolId:int(binding.symbolId),certified:false,actionable:false,
    sendPush:false,transport:"DISABLED"});
}

export class CtraderClosedM5QaBuffer {
  #seen=new Map();
  #last=null;
  #phase=null;
  #state="EMPTY";
  constructor({brokerName,instrumentId,symbolId,maxAgeMs=600_000}={}){
    if(!name(brokerName)||!INSTRUMENTS.some(x=>x.id===instrumentId)||
      !pos(int(symbolId))||!pos(maxAgeMs))
      throw Error("CTRADER_INVALID_BUFFER_SCOPE");
    this.brokerName=brokerName;
    this.instrumentId=instrumentId;
    this.symbolId=int(symbolId);
    this.maxAgeMs=maxAgeMs;
  }
  record(candle,observedAtMs){
    if(!candle||candle.provider!==this.brokerName ||
       candle.instrumentId!==this.instrumentId||
       candle.symbolId!==this.symbolId||candle.certified!==false||
       candle.sendPush!==false||candle.source!=="CTRADER_OPEN_API_DEMO")
      throw Error("CTRADER_CROSS_SOURCE_M5_BLOCKED");
    validateClosedM5(candle);
    if(!pos(observedAtMs)||candle.closedAt>observedAtMs)
      throw Error("CTRADER_UNCLOSED_M5_BLOCKED");
    const key=candle.openedAt,old=this.#seen.get(key);
    if(old){
      if(JSON.stringify(old)!==JSON.stringify(candle))
        return freeze({status:"CONFLICT_QUARANTINED",sendPush:false});
      return freeze({status:"DUPLICATE",sendPush:false});
    }
    const phase=candle.openedAt%M5_MS;
    if(this.#phase!==null&&phase!==this.#phase)
      return freeze({status:"NATIVE_PHASE_CHANGED_QUARANTINED",sendPush:false});
    if(this.#last!==null&&key!==this.#last+M5_MS)
      return freeze({status:key<this.#last?"OUT_OF_ORDER_QUARANTINED":
        "M5_GAP_QUARANTINED",sendPush:false});
    if(observedAtMs-candle.closedAt>this.maxAgeMs)
      return freeze({status:"STALE_M5_QUARANTINED",sendPush:false});
    this.#seen.set(key,candle);
    this.#phase=phase;this.#last=key;this.#state="M5_QA_CONTIGUOUS";
    return freeze({status:this.#state,rows:this.#seen.size,
      nativePhaseMin:phase/60_000,sendPush:false});
  }
  get size(){return this.#seen.size;}
  get status(){return this.#state;}
  snapshot(){return freeze([...this.#seen.values()]);}
}
