// cTrader Open API JSON / DEMO / OAuth accounts scope (SCOPE_VIEW).
// An explicit single-symbol source probe, NOT an alerts sender or trader.
// This state machine does not open sockets, log credentials or certify
// equivalence to TradingView's IC: feed. All replies are untrusted.
import {randomUUID} from "node:crypto";
import {INSTRUMENTS} from "./instruments.mjs";
import {normalizeClosedCtraderTrendbar} from "./ctrader-readonly-m5-qa.mjs";
import {deriveClosedEurusdM15Context}
 from "./qa-eurusd-closed-m15-context.mjs";
import {decodeClosedNativeEurusdM15,compareNativeDerivedEurusdM15}
 from "./qa-ctrader-native-m15-compare.mjs";
import {summarizeClosedEurusdH4}
 from "./qa-eurusd-ny-h4-reconstruction.mjs";
import {decodeClosedNativeEurusdH4,auditNativeVsNyForexH4}
 from "./qa-ctrader-native-h4-ny-phase-audit.mjs";
import {decodeNative34Trendbars,compareNative34AgainstClosedM5}
 from "./qa-ctrader-ic34-native-timeframes.mjs";
import {IC34_H4_SEASON_WINDOWS,seasonH4HistoryRequest,
 summarizeVerifiedIndexH4Season,evaluateIndexH4SeasonalEvidence,
 INDICES_FOR_SEASONAL_H4}
 from "./qa-ctrader-index-h4-seasonal-2026.mjs";

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
 #nativeM15Summary=null;
 #cohortM15Summary=null;#cohortH4Summary=null;#cohortGaps=null;
 #seasonResults=[];#seasonIndex=0;
 constructor({clientId,clientSecret,accessToken,demoAccountId,
  expectedBrokerTitle,sampleSymbolId=null,sampleSymbolName=null,
  sampleInstrumentId=null,
  maxBars=300,historyPages=1,compareNativeM15=false,
  compareNativeH4=false,allowCohortPaging=false,
  compareNativeAll34=false,compareSeasonalIndexH4=false,
  now=Date.now,idFn=randomUUID}={}){
  const accountId=safeInt(demoAccountId);
  const chosenId=sampleSymbolId===null?null:safeInt(sampleSymbolId);
  if(!secret(clientId)||!secret(clientSecret)||!secret(accessToken)||
    !accountId||!safeName(expectedBrokerTitle)||!Number.isSafeInteger(maxBars)||
    maxBars<48||maxBars>500||![1,2,3].includes(historyPages)||
    (historyPages>1&&chosenId===null)||
    typeof allowCohortPaging!=="boolean"||
    typeof compareNativeAll34!=="boolean"||
    typeof compareSeasonalIndexH4!=="boolean"||
    (compareSeasonalIndexH4&&(!compareNativeAll34||
      INDICES_FOR_SEASONAL_H4[sampleInstrumentId]?.id!==chosenId||
      INDICES_FOR_SEASONAL_H4[sampleInstrumentId]?.name!==sampleSymbolName))||
    (compareNativeAll34&&
      (!allowCohortPaging||historyPages!==2||maxBars!==300||
       compareNativeM15||compareNativeH4||
       !INSTRUMENTS.some(x=>x.id===sampleInstrumentId&&
        x.tvSymbol==="IC:"+sampleSymbolName)))||
    (allowCohortPaging&&!(
      historyPages===2&&maxBars===300&&chosenId!==null&&
      expectedBrokerTitle==="Raw Trading Ltd"&&
      !compareNativeM15&&!compareNativeH4&&
      INSTRUMENTS.some(x=>x.id===sampleInstrumentId&&
        x.tvSymbol==="IC:"+sampleSymbolName)
    ))||
    typeof compareNativeM15!=="boolean"||
    typeof compareNativeH4!=="boolean"||
    (compareNativeH4&&!compareNativeM15)||
    (compareNativeM15&&!(chosenId===1&&
      sampleSymbolName==="EURUSD"&&sampleInstrumentId==="EURUSD"&&
      expectedBrokerTitle==="Raw Trading Ltd"&&historyPages===2&&
      maxBars===300))||
    typeof now!=="function"||
    typeof idFn!=="function"||
    ((chosenId===null)!==(sampleSymbolName===null))||
    ((chosenId===null)!==(sampleInstrumentId===null))||
    (chosenId!==null&&(!safeName(sampleSymbolName)||
       !INSTRUMENTS.some(x=>x.id===sampleInstrumentId&&
         x.tvSymbol.startsWith("IC:")))))
    throw Error("CTRADER_VIEW_ONLY_DEMO_CONFIG_REQUIRED");
  this.#config={clientId,clientSecret,accessToken,demoAccountId:accountId,
    expectedBrokerTitle,sampleSymbolId:chosenId,sampleSymbolName,
    sampleInstrumentId,compareNativeM15,compareNativeH4,
    compareNativeAll34,compareSeasonalIndexH4};
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
 #finishNativeAll34(){
  this.#state="COMPLETE";
  const seasonal=this.#config.compareSeasonalIndexH4?
    evaluateIndexH4SeasonalEvidence({
      instrumentId:this.#config.sampleInstrumentId,
      symbolId:this.#config.sampleSymbolId,
      windows:this.#seasonResults
    }):null;
  return Object.freeze({
   state:"HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED",
   symbolId:this.#config.sampleSymbolId,
   symbolName:this.#config.sampleSymbolName,
   total:this.#historyBars.length,
   pagesFetched:this.#historyPageCount,nativePhaseMin:0,
   ...this.#cohortGaps,bars:Object.freeze(this.#historyBars),
   native34M15Summary:this.#cohortM15Summary,
   native34H4Summary:this.#cohortH4Summary,
   ...(seasonal?{nativeSeasonalH4Summary:seasonal}:{}),
   sourceParityCertified:false,canTrade:false,sendPush:false
  });
 }
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
   let gaps=0,phase=null,missingM5Intervals=0;
   const gapIntervals=[];
   for(let i=0;i<all.length;i++){
    const current=all[i].openedAt%300000;
    if(phase!==null&&phase!==current)
      return this.#hold("CTRADER_HISTORY_PHASE_CHANGED");
    phase=current;
    if(i>0&&all[i].openedAt!==all[i-1].openedAt+300000){
      const diff=all[i].openedAt-all[i-1].openedAt;
      if(diff<=300000||diff%300000!==0)
        return this.#hold("CTRADER_HISTORY_NON_INTEGRAL_M5_GAP");
      gaps++;
      missingM5Intervals+=diff/300000-1;
      if(gapIntervals.length<16)gapIntervals.push(Object.freeze({
        leftClosedAtMs:all[i-1].closedAt,
        nextOpenedAtMs:all[i].openedAt,
        missingM5Intervals:diff/300000-1
      }));
    }
   }
   if(c.compareNativeAll34){
     if(all.length!==600||phase!==0||
        !Number.isSafeInteger(all[0]?.openedAt)||
        !Number.isSafeInteger(all.at(-1)?.closedAt))
       return this.#hold("CTRADER_34_NATIVE_M5_BASE_INCOMPLETE");
     this.#cohortGaps=Object.freeze({
       gaps,missingM5Intervals,
       gapIntervals:Object.freeze(gapIntervals),
       gapIntervalsTruncated:gaps>gapIntervals.length
     });
     return this.#message(VIEW_ONLY_TYPES.HISTORY,
       {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
        period:7,count:250,
        fromTimestamp:all[0].openedAt-900000,
        toTimestamp:all.at(-1).closedAt-1},
       "COHORT34_M15_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   if(c.compareNativeM15){
     if(all.length!==600||gaps!==0||phase!==0||
        all[0].openedAt%900000!==0||
        (all.at(-1).closedAt%900000)!==0)
       return this.#hold("CTRADER_NATIVE_M15_QA_M5_COHORT_REQUIRED");
     const start=all[0].openedAt,finish=all.at(-1).closedAt;
     if(!Number.isSafeInteger(start)||!Number.isSafeInteger(finish)||
        finish-start!==600*300000)
       return this.#hold("CTRADER_NATIVE_M15_QA_WINDOW_INVALID");
     return this.#message(VIEW_ONLY_TYPES.HISTORY,
       {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
        period:7,count:200,
        fromTimestamp:start,toTimestamp:finish-1},
       "NATIVE_M15_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   this.#state="COMPLETE";
   return Object.freeze({state:"HISTORICAL_M5_QA_UNCERTIFIED",
     symbolId:c.sampleSymbolId,symbolName:c.sampleSymbolName,
     total:all.length, gaps,pagesFetched:this.#historyPageCount,
     missingM5Intervals,
     gapIntervals:Object.freeze(gapIntervals),
     gapIntervalsTruncated:gaps>gapIntervals.length,
     nativePhaseMin:phase===null?null:phase/60000,
     bars:Object.freeze(all),
     sourceParityCertified:false,sendPush:false,canTrade:false});
  }
  if(this.#state==="COHORT34_M15_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
      (p.period!==7&&p.period!=="M15")||
      (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
      !Array.isArray(p.trendbar)||p.trendbar.length>250||
      !this.#cohortGaps||this.#historyBars.length!==600)
    return this.#hold("CTRADER_34_NATIVE_M15_RESPONSE_SCOPE_INVALID");
   try{
    const native=decodeNative34Trendbars({
      raw:p.trendbar,period:7,symbolId:c.sampleSymbolId,
      nowMs:this.#now(),maxBars:250
    });
    this.#cohortM15Summary=compareNative34AgainstClosedM5({
      m5Bars:this.#historyBars,nativeBars:native,
      period:7,instrumentId:c.sampleInstrumentId,
      symbolId:c.sampleSymbolId
    });
   }catch{return this.#hold("CTRADER_34_NATIVE_M15_INVALID_OR_UNCLOSED");}
   const all=this.#historyBars;
   return this.#message(VIEW_ONLY_TYPES.HISTORY,
     {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
      period:10,count:30,
      fromTimestamp:all[0].openedAt-14400000,
      toTimestamp:all.at(-1).closedAt-1},
      "COHORT34_H4_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
  }
  if(this.#state==="COHORT34_H4_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
      (p.period!==10&&p.period!=="H4")||
      (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
      !Array.isArray(p.trendbar)||p.trendbar.length>30||
      !this.#cohortM15Summary||!this.#cohortGaps)
    return this.#hold("CTRADER_34_NATIVE_H4_RESPONSE_SCOPE_INVALID");
   let summary;
   try{
     const native=decodeNative34Trendbars({
      raw:p.trendbar,period:10,symbolId:c.sampleSymbolId,
      nowMs:this.#now(),maxBars:30
     });
     summary=compareNative34AgainstClosedM5({
       m5Bars:this.#historyBars,nativeBars:native,
       period:10,instrumentId:c.sampleInstrumentId,
       symbolId:c.sampleSymbolId
     });
   }catch{return this.#hold("CTRADER_34_NATIVE_H4_INVALID_OR_UNCLOSED");}
   this.#cohortH4Summary=summary;
   if(c.compareSeasonalIndexH4){
    let request;
    try{request=seasonH4HistoryRequest({
      instrumentId:c.sampleInstrumentId,symbolId:c.sampleSymbolId,
      index:this.#seasonIndex,nowMs:this.#now()
    });}catch{return this.#hold("CTRADER_34_SEASONAL_H4_WINDOW_INVALID");}
    return this.#message(VIEW_ONLY_TYPES.HISTORY,{
      ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
      ...request
    },"COHORT34_SEASONAL_H4_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   return this.#finishNativeAll34();
  }
  if(this.#state==="COHORT34_SEASONAL_H4_PENDING"){
   if(!c.compareSeasonalIndexH4||
      safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
      (p.period!==10&&p.period!=="H4")||
      (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
      !Array.isArray(p.trendbar)||p.trendbar.length>48||
      this.#seasonIndex>=IC34_H4_SEASON_WINDOWS.length)
     return this.#hold("CTRADER_34_SEASONAL_H4_RESPONSE_SCOPE_INVALID");
   try{
    const result=summarizeVerifiedIndexH4Season({
      instrumentId:c.sampleInstrumentId,symbolId:c.sampleSymbolId,
      index:this.#seasonIndex,nowMs:this.#now(),trendbars:p.trendbar
    });
    this.#seasonResults.push(result);
   }catch(error){
    // Error descriptions or received OHLC must NEVER enter logs. Only
    // compile-time enumerated structural reasons and 0..4 window index.
    const category=({
      CRT34_SEASON_H4_OUTSIDE_REQUESTED_WINDOW:"OUTSIDE_WINDOW",
      CTRADER_34_NATIVE_TIME_INVALID:"NATIVE_TIME",
      CTRADER_34_NATIVE_CONFIG_INVALID:"NATIVE_CONFIG",
      CTRADER_34_NATIVE_PERIOD_INVALID:"NATIVE_PERIOD",
      CTRADER_34_NATIVE_DELTA_INVALID:"NATIVE_DELTA",
      CTRADER_34_NATIVE_OHLC_INVALID:"NATIVE_OHLC",
      CTRADER_34_NATIVE_DUPLICATE_TIME:"NATIVE_DUPLICATE",
      CRT34_SEASON_RESPONSE_SCOPE_INVALID:"SOURCE_SCOPE"
    })[error?.message]??"UNKNOWN";
    return this.#hold("CTRADER_34_SEASON_"+category+
      "_W"+this.#seasonIndex);
   }
   this.#seasonIndex++;
   if(this.#seasonIndex<IC34_H4_SEASON_WINDOWS.length){
    let request;
    try{request=seasonH4HistoryRequest({
      instrumentId:c.sampleInstrumentId,symbolId:c.sampleSymbolId,
      index:this.#seasonIndex,nowMs:this.#now()
    });}catch{return this.#hold("CTRADER_34_SEASONAL_H4_WINDOW_INVALID");}
    return this.#message(VIEW_ONLY_TYPES.HISTORY,{
      ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
      ...request
    },"COHORT34_SEASONAL_H4_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   try{return this.#finishNativeAll34();}
   catch{return this.#hold("CTRADER_34_SEASONAL_H4_EVIDENCE_INCOMPLETE");}
  }
  if(this.#state==="NATIVE_M15_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
     (p.period!==7&&p.period!=="M15")||
     (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
     !Array.isArray(p.trendbar)||p.trendbar.length>200)
    return this.#hold("CTRADER_NATIVE_M15_RESPONSE_SCOPE_INVALID");
   let summary;
   try{
     const derived=deriveClosedEurusdM15Context(this.#historyBars);
     if(derived.completeM15!==200||derived.partialM15!==0||
        derived.rejectedM15!==0)
       return this.#hold("CTRADER_NATIVE_M15_DERIVED_COHORT_NOT_READY");
     const native=decodeClosedNativeEurusdM15({
       raw:p.trendbar,nowMs:this.#now(),expectedDigits:this.#symbol.digits
     });
     summary=compareNativeDerivedEurusdM15({
       nativeBars:native,derivedBars:derived.bars
     });
   }catch{return this.#hold("CTRADER_NATIVE_M15_QA_INVALID_HISTORY");}
   if(c.compareNativeH4&&summary.nativeDerivedOhlcMatch===true){
     let derived;
     try{derived=summarizeClosedEurusdH4(this.#historyBars);}
     catch{return this.#hold("CTRADER_NATIVE_H4_QA_NY_DERIVED_INVALID");}
     if(derived.completeH4Blocks!==12||derived.rejectedH4Blocks!==0||
        derived.bars[0].openedAt<14_400_000)
       return this.#hold("CTRADER_NATIVE_H4_QA_COHORT_NOT_READY");
     this.#nativeM15Summary=summary;
     return this.#message(VIEW_ONLY_TYPES.HISTORY,
       {ctidTraderAccountId:c.demoAccountId,symbolId:c.sampleSymbolId,
        period:10,count:20,
        fromTimestamp:derived.bars[0].openedAt-14_400_000,
        toTimestamp:derived.bars.at(-1).closedAt-1},
       "NATIVE_H4_PENDING",VIEW_ONLY_TYPES.HISTORY_OK);
   }
   this.#state="COMPLETE";
   return Object.freeze({
     state:"HISTORICAL_M5_M15_QA_UNCERTIFIED",
     symbolId:c.sampleSymbolId,symbolName:c.sampleSymbolName,
     total:this.#historyBars.length,gaps:0,
     pagesFetched:this.#historyPageCount,nativePhaseMin:0,
     bars:Object.freeze(this.#historyBars),
     nativeM15Summary:summary,
     sourceParityCertified:false,sendPush:false,canTrade:false
   });
  }
  if(this.#state==="NATIVE_H4_PENDING"){
   if(safeInt(p.ctidTraderAccountId)!==c.demoAccountId||
     (p.period!==10&&p.period!=="H4")||
     (p.symbolId!==undefined&&safeInt(p.symbolId)!==c.sampleSymbolId)||
     !Array.isArray(p.trendbar)||p.trendbar.length>20||
     this.#nativeM15Summary?.nativeDerivedOhlcMatch!==true)
    return this.#hold("CTRADER_NATIVE_H4_QA_RESPONSE_SCOPE_INVALID");
   let summary;
   try{
     const derived=summarizeClosedEurusdH4(this.#historyBars);
     const native=decodeClosedNativeEurusdH4({
       raw:p.trendbar,nowMs:this.#now(),expectedDigits:this.#symbol.digits
     });
     summary=auditNativeVsNyForexH4({
       nativeBars:native,nyBars:derived.bars
     });
   }catch{return this.#hold("CTRADER_NATIVE_H4_QA_INVALID_HISTORY");}
   this.#state="COMPLETE";
   return Object.freeze({
     state:"HISTORICAL_M5_M15_H4_QA_UNCERTIFIED",
     symbolId:c.sampleSymbolId,symbolName:c.sampleSymbolName,
     total:this.#historyBars.length,gaps:0,
     pagesFetched:this.#historyPageCount,nativePhaseMin:0,
     bars:Object.freeze(this.#historyBars),
     nativeM15Summary:this.#nativeM15Summary,
     nativeH4Summary:summary,
     sourceParityCertified:false,sendPush:false,canTrade:false
   });
  }
  return this.#hold("CTRADER_UNKNOWN_STATE");
 }
 get status(){return Object.freeze({state:this.#state,
  heldReason:this.#fail,sourceParityCertified:false,
  canTrade:false,sendPush:false});}
}
