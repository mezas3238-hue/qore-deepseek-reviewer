// cTrader Open API JSON / DEMO / OAuth accounts scope (SCOPE_VIEW).
// An explicit single-symbol source probe, NOT an alerts sender or trader.
// This state machine does not open sockets, log credentials or certify
// equivalence to TradingView's IC: feed. All replies are untrusted.
import {randomUUID} from "node:crypto";
import {INSTRUMENTS} from "./instruments.mjs";
import {normalizeClosedCtraderTrendbar} from "./ctrader-readonly-m5-qa.mjs";

export const CTRADER_DEMO_JSON_URL="wss://demo.ctraderapi.com:5036";
export const VIEW_ONLY_TYPES=Object.freeze({
 APP_AUTH:2100, APP_AUTH_OK:2101,
 ACCOUNT_AUTH:2102, ACCOUNT_AUTH_OK:2103,
 SYMBOLS:2114, SYMBOLS_OK:2115,
 SYMBOL_BY_ID:2116, SYMBOL_BY_ID_OK:2117,
 HISTORY:2137, HISTORY_OK:2138,
 ACCOUNTS:2149, ACCOUNTS_OK:2150
});
const isObject=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const safeInt=v=>typeof v==="number"&&Number.isSafeInteger(v)&&v>0
  ?v:typeof v==="string"&&/^[1-9][0-9]{0,15}$/.test(v)&&
    Number.isSafeInteger(Number(v))?Number(v):null;
const safeName=v=>typeof v==="string"&&/^[a-zA-Z0-9_ ./:-]{1,80}$/.test(v);
const secret=v=>typeof v==="string"&&v.length>=4&&v.length<=4096&&
  !/[\r\n]/.test(v);
const held=(reason)=>Object.freeze({state:"HELD",reason,
  sourceParityCertified:false,sendPush:false,canTrade:false});

// Explicit allowlist from cTrader Open API model/error messages (read-only QA).
// Categorization does not trigger retry, OAuth renewal or any broker action.
const QA_API_ERROR_NAMES=Object.freeze({
 OA_AUTH_TOKEN_EXPIRED:"TOKEN_EXPIRED",
 ACCOUNT_NOT_AUTHORIZED:"ACCOUNT_NOT_AUTHORIZED",
 RET_NO_SUCH_LOGIN:"ACCOUNT_NOT_FOUND",
 ALREADY_LOGGED_IN:"ALREADY_LOGGED_IN",
 CONNECTIONS_LIMIT_EXCEEDED:"CONNECTIONS_LIMIT",
 CH_CLIENT_AUTH_FAILURE:"APP_AUTH_FAILURE",
 CH_CLIENT_NOT_AUTHENTICATED:"APP_NOT_AUTHENTICATED",
 CH_CLIENT_ALREADY_AUTHENTICATED:"APP_ALREADY_AUTHENTICATED",
 CH_ACCESS_TOKEN_INVALID:"ACCESS_TOKEN_INVALID",
 CH_SERVER_NOT_REACHABLE:"SERVER_NOT_REACHABLE",
 CH_CTID_TRADER_ACCOUNT_NOT_FOUND:"ACCOUNT_NOT_FOUND",
 CH_OA_CLIENT_NOT_FOUND:"APP_NOT_FOUND",
 REQUEST_FREQUENCY_EXCEEDED:"REQUEST_RATE_LIMIT",
 SERVER_IS_UNDER_MAINTENANCE:"SERVER_MAINTENANCE",
 BLOCKED_PAYLOAD_TYPE:"PAYLOAD_RATE_LIMIT",
 CHANNEL_IS_BLOCKED:"CHANNEL_BLOCKED"
});
export function classifyCtraderQaErrorCode(code){
 return typeof code==="string" &&
  Object.prototype.hasOwnProperty.call(QA_API_ERROR_NAMES,code)
   ?QA_API_ERROR_NAMES[code]:"UNKNOWN";
}


export class CtraderDemoViewSessionQa {
 #config;#state="NEW";#lastId=null;#expected=null;
 #fail=null;#inventory=null;#symbol=null;
 #maxBars;#now;#idFn;#historyPages;#historyPageCount=0;#historyBars=[];
 constructor({clientId,clientSecret,accessToken,demoAccountId,
  expectedBrokerTitle,sampleSymbolId=null,sampleSymbolName=null,
  sampleInstrumentId=null,
  maxBars=300,historyPages=1,now=Date.now,idFn=randomUUID}={}){
  const accountId=safeInt(demoAccountId);
  const chosenId=sampleSymbolId===null?null:safeInt(sampleSymbolId);
  if(!secret(clientId)||!secret(clientSecret)||!secret(accessToken)||
    !accountId||!safeName(expectedBrokerTitle)||!Number.isSafeInteger(maxBars)||
    maxBars<48||maxBars>500||![1,2,3].includes(historyPages)||
    (historyPages>1&&chosenId===null)||typeof now!=="function"||
    typeof idFn!=="function"||
    ((chosenId===null)!==(sampleSymbolName===null))||
    ((chosenId===null)!==(sampleInstrumentId===null))||
    (chosenId!==null&&(!safeName(sampleSymbolName)||
       !INSTRUMENTS.some(x=>x.id===sampleInstrumentId&&
         x.tvSymbol.startsWith("IC:")))))
    throw Error("CTRADER_VIEW_ONLY_DEMO_CONFIG_REQUIRED");
  this.#config={clientId,clientSecret,accessToken,demoAccountId:accountId,
    expectedBrokerTitle,sampleSymbolId:chosenId,sampleSymbolName,
    sampleInstrumentId};
  this.#maxBars=maxBars;this.#now=now;this.#idFn=idFn;
  this.#historyPages=historyPages;
 }
 #message(type,payload,state,expected){
  if(this.#state==="HELD")throw Error("CTRADER_VIEW_QA_HELD");
  const id=String(this.#idFn());
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(id))
    throw Error("CTRADER_INVALID_REQUEST_ID");
  this.#lastId=id;this.#expected=expected;this.#state=state;
  return Object.freeze({clientMsgId:id,payloadType:type,payload});
 }
 #hold(reason){this.#fail=reason;this.#state="HELD";return held(reason);}
 start(){
  if(this.#state!=="NEW")throw Error("CTRADER_QA_START_ALREADY_USED");
  const {clientId,clientSecret}=this.#config;
  return this.#message(VIEW_ONLY_TYPES.APP_AUTH,{clientId,clientSecret},
   "APP_PENDING",VIEW_ONLY_TYPES.APP_AUTH_OK);
 }
 accept(raw){
  if(this.#state==="HELD")return held(this.#fail);
  if(this.#state==="NEW"||this.#state==="COMPLETE")
    return this.#hold("CTRADER_UNEXPECTED_MESSAGE");
  const msg=typeof raw==="string"&&raw.length<=2000000?
    (()=>{try{return JSON.parse(raw);}catch{return null;}})():raw;
  // Keep remote protocol faults separate from our request-ID/response-type
  // checks. Only fixed error-code labels may appear in private QA telemetry:
  // never echo error descriptions, credentials, token, IDs or raw payloads.
  if(!isObject(msg))
    return this.#hold("CTRADER_MALFORMED_RESPONSE");
  if(msg.clientMsgId!==this.#lastId)
    return this.#hold("CTRADER_RESPONSE_ID_MISMATCH_"+this.#state);
  // ProtoOAApplicationAuthRes has no message fields. Depending on the
  // cTrader JSON encoder its 'payload' may be omitted, not just {}.
  // This exception applies ONLY to the correlated 2101 APP auth reply.
  const emptyApplicationAuth=
    this.#state==="APP_PENDING" &&
    msg.payloadType===VIEW_ONLY_TYPES.APP_AUTH_OK &&
    msg.payload===undefined;
  if(!emptyApplicationAuth&&!isObject(msg.payload))
    return this.#hold("CTRADER_MALFORMED_RESPONSE");
  if(msg.payloadType===2142){
    // Only recognized enum names from the cTrader protocol may be exposed
    // as diagnostic labels. Never emit remote description, raw errorCode,
    // arbitrary account metadata or OAuth material in logs.
    return this.#hold("CTRADER_API_ERROR_"+
      classifyCtraderQaErrorCode(msg.payload.errorCode)+"_"+this.#state);
  }
  if(msg.payloadType!==this.#expected)
    return this.#hold("CTRADER_RESPONSE_TYPE_MISMATCH_"+this.#state);
  const p=msg.payload,c=this.#config;
  if(this.#state==="APP_PENDING"){
   return this.#message(VIEW_ONLY_TYPES.ACCOUNTS,
    {accessToken:c.accessToken},"ACCOUNTS_PENDING",VIEW_ONLY_TYPES.ACCOUNTS_OK);
  }
  if(this.#state==="ACCOUNTS_PENDING"){
   // SCOPE_VIEW=0; optional proto3 default omission is NOT evidence.
   // No claiming view-only unless the API explicitly returns the scope.
   if(p.permissionScope!==0&&p.permissionScope!=="SCOPE_VIEW")
    return this.#hold("CTRADER_SCOPE_VIEW_NOT_PROVEN");
   if(!Array.isArray(p.ctidTraderAccount))return this.#hold("CTRADER_NO_ACCOUNTS");
   const accounts=p.ctidTraderAccount.filter(a=>
    isObject(a)&&safeInt(a.ctidTraderAccountId)===c.demoAccountId);
   if(accounts.length!==1)return this.#hold("CTRADER_DEMO_ACCOUNT_NOT_UNIQUE");
   const a=accounts[0];
   if(a.isLive!==false)return this.#hold("CTRADER_LIVE_OR_UNVERIFIED_BLOCKED");
   if(a.brokerTitleShort!==c.expectedBrokerTitle)
    return this.#hold("CTRADER_EXPECTED_BROKER_MISMATCH");
   return this.#message(VIEW_ONLY_TYPES.ACCOUNT_AUTH,
    {ctidTraderAccountId:c.demoAccountId,accessToken:c.accessToken},
    "ACCOUNT_PENDING",VIEW_ONLY_TYPES.ACCOUNT_AUTH_OK);
  }
  if(this.#state==="ACCOUNT_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId)
    return this.#hold("CTRADER_ACCOUNT_AUTH_MISMATCH");
   return this.#message(VIEW_ONLY_TYPES.SYMBOLS,
    {ctidTraderAccountId:c.demoAccountId,includeArchivedSymbols:false},
    "SYMBOLS_PENDING",VIEW_ONLY_TYPES.SYMBOLS_OK);
  }
  if(this.#state==="SYMBOLS_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
      !Array.isArray(p.symbol)||p.symbol.length>10000)
    return this.#hold("CTRADER_SYMBOLS_ACCOUNT_OR_SIZE_INVALID");
   const byId=new Map();
   for(const item of p.symbol){
    const id=safeInt(item?.symbolId);
    if(!id||!safeName(item.symbolName)||byId.has(id))
      return this.#hold("CTRADER_SYMBOLS_INVALID_DUPLICATE");
    byId.set(id,Object.freeze({symbolId:id,symbolName:item.symbolName,
      enabled:item.enabled===true}));
   }
   this.#inventory=Object.freeze([...byId.values()]);
   if(c.sampleSymbolId===null){
    this.#state="COMPLETE";
    return Object.freeze({state:"INVENTORY_QA_ONLY",symbols:this.#inventory,
      count:this.#inventory.length,sourceParityCertified:false,
      canTrade:false,sendPush:false});
   }
   const found=byId.get(c.sampleSymbolId);
   if(!found||found.symbolName!==c.sampleSymbolName||found.enabled!==true)
    return this.#hold("CTRADER_OWNER_APPROVED_SYMBOL_NOT_AVAILABLE");
   return this.#message(VIEW_ONLY_TYPES.SYMBOL_BY_ID,
    {ctidTraderAccountId:c.demoAccountId,symbolId:[c.sampleSymbolId]},
    "SYMBOL_DETAILS_PENDING",VIEW_ONLY_TYPES.SYMBOL_BY_ID_OK);
  }
  if(this.#state==="SYMBOL_DETAILS_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
      !Array.isArray(p.symbol)||p.symbol.length!==1)
    return this.#hold("CTRADER_SYMBOL_DETAILS_MISMATCH");
   const detail=p.symbol[0];
   if(safeInt(detail?.symbolId)!==c.sampleSymbolId||
      !Number.isSafeInteger(detail.digits)||detail.digits<0||
      detail.digits>10)
    return this.#hold("CTRADER_SYMBOL_DIGITS_INVALID");
   this.#symbol=Object.freeze({symbolId:c.sampleSymbolId,
     brokerSymbolName:c.sampleSymbolName,digits:detail.digits,
     brokerName:"IC",brokerTitleShort:c.expectedBrokerTitle,
     ownerApproved:true});
   const stamp=this.#now();
   if(!Number.isSafeInteger(stamp)||stamp<=0)
    return this.#hold("CTRADER_CLOCK_INVALID");
   return this.#message(VIEW_ONLY_TYPES.HISTORY,
    {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
     period:5,count:this.#maxBars,fromTimestamp:stamp-72*3600000,
     // Avoid querying the currently open M5 at any native phase (0..4m).
     toTimestamp:stamp-300000},"HISTORY_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
  }
  if(this.#state==="HISTORY_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
     (p.period!==5&&p.period!=="M5")||
     (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
     !Array.isArray(p.trendbar)||p.trendbar.length>this.#maxBars)
    return this.#hold("CTRADER_HISTORY_SOURCE_INVALID");
   const nowMs=this.#now();
   if(!Number.isSafeInteger(nowMs)||nowMs<=0)
    return this.#hold("CTRADER_CLOCK_INVALID");
   const candles=[];
   for(const bar of p.trendbar){
    let normalized;
    try{normalized=normalizeClosedCtraderTrendbar({
       trendbar:bar,
       binding:{...this.#symbol,instrumentId:c.sampleInstrumentId},
       observedAtMs:nowMs,provenClosedAtMs:nowMs,period:"M5"
      });}
    catch{return this.#hold("CTRADER_HISTORY_INVALID_OR_NOT_CLOSED");}
    candles.push(normalized);
   }
   candles.sort((a,b)=>a.openedAt-b.openedAt);
   const currentUnique=new Set(candles.map(x=>x.openedAt));
   if(currentUnique.size!==candles.length)
     return this.#hold("CTRADER_HISTORY_DUPLICATE_TIME");
   if(this.#historyPages>1 && candles.length===0)
     return this.#hold("CTRADER_HISTORY_EMPTY_PAGE");
   // cTrader may return trendbars latest-first. After sorting, each
   // preceding page must be strictly older; duplicates fail closed.
   if(this.#historyBars.length>0 &&
      candles.at(-1)?.openedAt>=this.#historyBars[0].openedAt)
     return this.#hold("CTRADER_HISTORY_PAGE_OVERLAP_OR_ORDER");
   this.#historyBars.unshift(...candles);
   this.#historyPageCount++;
   if(this.#historyPageCount<this.#historyPages){
     const earliest=this.#historyBars[0]?.openedAt;
     if(!Number.isSafeInteger(earliest)||earliest<72*3600000+300000)
       return this.#hold("CTRADER_HISTORY_CURSOR_INVALID");
     return this.#message(VIEW_ONLY_TYPES.HISTORY,
       {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
        period:5,count:this.#maxBars,
        fromTimestamp:earliest-72*3600000,
        toTimestamp:earliest-300000},
       "HISTORY_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   const all=this.#historyBars;
   const unique=new Set(all.map(x=>x.openedAt));
   if(unique.size!==all.length)
     return this.#hold("CTRADER_HISTORY_CROSS_PAGE_DUPLICATE");
   let gaps=0,phase=null;
   for(let i=0;i<all.length;i++){
    const current=all[i].openedAt%300000;
    if(phase!==null&&phase!==current)
      return this.#hold("CTRADER_HISTORY_PHASE_CHANGED");
    phase=current;
    if(i>0&&all[i].openedAt!==all[i-1].openedAt+300000)gaps++;
   }
   this.#state="COMPLETE";
   return Object.freeze({state:"HISTORICAL_M5_QA_UNCERTIFIED",
     symbolId:c.sampleSymbolId,symbolName:c.sampleSymbolName,
     total:all.length, gaps,pagesFetched:this.#historyPageCount,
     nativePhaseMin:phase===null?null:phase/60000,
     bars:Object.freeze(all),
     sourceParityCertified:false,sendPush:false,canTrade:false});
  }
  return this.#hold("CTRADER_UNKNOWN_STATE");
 }
 get status(){return Object.freeze({state:this.#state,
  heldReason:this.#fail,sourceParityCertified:false,
  canTrade:false,sendPush:false});}
}
