// Real WSS one-shot transport for the strict DEMO view-only state machine.
// NEVER starts automatically. No orders, no FCM, no auto-mapping TV feeds.
// Only secrets from server environment. No logging tokens or OAuth payloads.
import {CtraderDemoViewSessionQa,CTRADER_DEMO_JSON_URL,VIEW_ONLY_TYPES}
 from "./ctrader-demo-view-session-qa.mjs";
import {auditUnapprovedIc34Candidates} from "./ctrader-ic34-candidate-audit-qa.mjs";
import {buildUnapprovedIc34OwnerManifest}
 from "./qa-ctrader-ic34-owner-manifest.mjs";
import {summarizeClosedEurusdH4}
 from "./qa-eurusd-ny-h4-reconstruction.mjs";
import {deriveClosedEurusdM15Context}
 from "./qa-eurusd-closed-m15-context.mjs";
import {buildPrivateCtraderEurusdParityCsv,
 CTRADER_EURUSD_CSV_EXPORT_OPT_IN}
 from "./qa-ctrader-eurusd-parity-csv.mjs";
import {auditCrtMss34ClosedBrokerBars}
 from "./qa-ctrader-34-crt-mss-closed-replay.mjs";

const isPositive=v=>typeof v==="string"&&/^[1-9][0-9]{0,15}$/.test(v);
const legalName=v=>typeof v==="string"&&/^[A-Za-z0-9_./:-]{1,80}$/.test(v);
const fail=reason=>Object.freeze({state:"BLOCKED",reason,
 sendPush:false,canTrade:false,sourceParityCertified:false});
const allowedOutbound=new Set([
 VIEW_ONLY_TYPES.APP_AUTH,VIEW_ONLY_TYPES.ACCOUNTS,
 VIEW_ONLY_TYPES.ACCOUNT_AUTH,VIEW_ONLY_TYPES.SYMBOLS,
 VIEW_ONLY_TYPES.SYMBOL_BY_ID,VIEW_ONLY_TYPES.HISTORY
]);
export function readDemoViewProbeConfig(env={}){
 if(env.QORE_CT_QA_PROBE!=="OWNER_APPROVED_VIEW_ONLY"||
    env.QORE_CT_STAGE!=="DEMO"||env.QORE_CT_OAUTH_SCOPE!=="accounts")
  throw Error("CTRADER_QA_PROBE_NOT_EXPLICITLY_ENABLED");
 const necessary=["QORE_CT_CLIENT_ID","QORE_CT_CLIENT_SECRET",
  "QORE_CT_VIEW_ACCESS_TOKEN","QORE_CT_DEMO_ACCOUNT_ID",
  "QORE_CT_EXPECTED_BROKER_TITLE"];
 if(necessary.some(k=>typeof env[k]!=="string"||
   env[k].length<1||env[k].length>4096))
  throw Error("CTRADER_VIEW_ONLY_SERVER_SECRETS_MISSING");
 if(!isPositive(env.QORE_CT_DEMO_ACCOUNT_ID))
  throw Error("CTRADER_DEMO_ACCOUNT_ID_INVALID");
 const opt=["QORE_CT_SAMPLE_SYMBOL_ID","QORE_CT_SAMPLE_SYMBOL_NAME",
  "QORE_CT_SAMPLE_INSTRUMENT_ID"];
 const values=opt.map(k=>env[k]);
 if(values.some(x=>x!==undefined&&x!=="") &&
    (values.some(x=>typeof x!=="string"||x==="")||
     !isPositive(values[0])||!legalName(values[1])||
     !legalName(values[2])))
  throw Error("CTRADER_OWNER_SYMBOL_MAPPING_INCOMPLETE");
 // More than one historical query requires a named sample symbol and
 // a separately enabled QA-only page count; default remains one page.
 const pageOption=env.QORE_CT_QA_HISTORY_PAGES;
 const historyPages=pageOption===undefined?1:Number(pageOption);
 const all34NativeMode=env.QORE_CT_QA_NATIVE_ALL34_TF;
 if(all34NativeMode!==undefined&&all34NativeMode!=="DISABLED"&&
   all34NativeMode!=="OWNER_APPROVED_34_NATIVE_M15_H4_QA")
  throw Error("CTRADER_34_NATIVE_TF_INVALID_OPT_IN");
 const cohort34TwoPages=
   env.QORE_CT_QA_COHORT34==="OWNER_APPROVED_FULL_34_DEMO_M5_QA"&&
   env.QORE_CT_QA_COHORT34_PAGES==="2"&&
   historyPages===2&&
   env.QORE_CT_EXPECTED_BROKER_TITLE==="Raw Trading Ltd"&&
   env.QORE_CT_QA_M5_CSV_EXPORT==="DISABLED"&&
   env.QORE_CT_QA_NATIVE_M15_COMPARE==="DISABLED"&&
   env.QORE_CT_QA_NATIVE_H4_AUDIT==="DISABLED";
 if(![1,2,3].includes(historyPages)||
    (pageOption!==undefined&&
      !["1","2","3"].includes(pageOption))||
    (historyPages>1&&
      !(values.every(x=>typeof x==="string"&&x.length>0)&&
        ((values[2]==="EURUSD"&&values[1]==="EURUSD")||
          cohort34TwoPages))))
  throw Error("CTRADER_QA_HISTORY_PAGES_NOT_AUTHORIZED_FOR_EURUSD");
 const exportMode=env.QORE_CT_QA_M5_CSV_EXPORT;
 if(exportMode!==undefined&&exportMode!=="DISABLED"&&
   exportMode!==CTRADER_EURUSD_CSV_EXPORT_OPT_IN)
  throw Error("CTRADER_QA_PRIVATE_CSV_OPT_IN_INVALID");
 const exportPrivateCsv=exportMode===CTRADER_EURUSD_CSV_EXPORT_OPT_IN;
 const compareNativeAll34=
   all34NativeMode==="OWNER_APPROVED_34_NATIVE_M15_H4_QA";
 const crtReplayMode=env.QORE_CT_QA_CRT_MSS_ALL34;
 if(crtReplayMode!==undefined&&crtReplayMode!=="DISABLED"&&
    crtReplayMode!=="OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA")
  throw Error("CTRADER_34_CRT_MSS_REPLAY_FLAG_INVALID");
 const auditCrtMssAll34=
   crtReplayMode==="OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA";
 if(auditCrtMssAll34&&!compareNativeAll34)
  throw Error("CTRADER_34_CRT_MSS_REQUIRES_NATIVE_34_FRAMES");
 if(compareNativeAll34&&(!cohort34TwoPages||
    env.QORE_CT_STAGE!=="DEMO"||
    env.QORE_CT_OAUTH_SCOPE!=="accounts"||
    env.QORE_TRADING_ENABLED!=="false"||
    env.QORE_PUSH_ENABLED!=="false"||
    exportPrivateCsv))
  throw Error("CTRADER_34_NATIVE_TF_DEMO_PAGES_REQUIRED");
 const nativeOption=env.QORE_CT_QA_NATIVE_M15_COMPARE;
 if(nativeOption!==undefined&&nativeOption!=="DISABLED"&&
    nativeOption!=="OWNER_APPROVED_NATIVE_M15_COMPARE")
  throw Error("CTRADER_QA_NATIVE_M15_COMPARE_OPT_IN_INVALID");
 const compareNativeM15=nativeOption==="OWNER_APPROVED_NATIVE_M15_COMPARE";
 const h4Option=env.QORE_CT_QA_NATIVE_H4_AUDIT;
 if(h4Option!==undefined&&h4Option!=="DISABLED"&&
    h4Option!=="OWNER_APPROVED_NATIVE_H4_PHASE_AUDIT")
  throw Error("CTRADER_QA_NATIVE_H4_AUDIT_OPT_IN_INVALID");
 const compareNativeH4=h4Option==="OWNER_APPROVED_NATIVE_H4_PHASE_AUDIT";
 if(compareNativeH4&&!compareNativeM15)
  throw Error("CTRADER_QA_NATIVE_H4_REQUIRES_PROVEN_M15");
 if(compareNativeM15&&
    (exportPrivateCsv||historyPages!==2||values[0]!=="1"||
     values[1]!=="EURUSD"||values[2]!=="EURUSD"||
     env.QORE_CT_EXPECTED_BROKER_TITLE!=="Raw Trading Ltd"))
  throw Error("CTRADER_QA_NATIVE_M15_REQUIRES_VERIFIED_EURUSD_DEMO");
 if(exportPrivateCsv&&
    (historyPages!==2||values[0]!=="1"||values[1]!=="EURUSD"||
     values[2]!=="EURUSD"||
     env.QORE_CT_EXPECTED_BROKER_TITLE!=="Raw Trading Ltd"))
  throw Error("CTRADER_QA_PRIVATE_CSV_REQUIRES_VERIFIED_EURUSD_DEMO");
 return Object.freeze({
  clientId:env.QORE_CT_CLIENT_ID,
  clientSecret:env.QORE_CT_CLIENT_SECRET,
  accessToken:env.QORE_CT_VIEW_ACCESS_TOKEN,
  demoAccountId:env.QORE_CT_DEMO_ACCOUNT_ID,
  expectedBrokerTitle:env.QORE_CT_EXPECTED_BROKER_TITLE,
  historyPages,exportPrivateCsv,compareNativeM15,compareNativeH4,
  compareNativeAll34,auditCrtMssAll34,
  allowCohortPaging:cohort34TwoPages,
  ...(values.every(x=>typeof x==="string"&&x.length>0)?{
   sampleSymbolId:values[0],
   sampleSymbolName:values[1],
   sampleInstrumentId:values[2]
  }:{})
 });
}
export function runAuthorizedDemoWssProbe({
 config,WebSocketImpl=globalThis.WebSocket,timeoutMs=25_000,
 now=Date.now,idFn,includeCandidateManifest=false,
 includePrivateCsv=false
}={}){
 if(typeof WebSocketImpl!=="function"||
    !Number.isSafeInteger(timeoutMs)||timeoutMs<3000||timeoutMs>40_000||
    typeof now!=="function")
  return Promise.resolve(fail("CTRADER_QA_TRANSPORT_CONFIG_INVALID"));
 let session;
 try{session=new CtraderDemoViewSessionQa({...config,now,...(idFn?{idFn}:{})});}
 catch{return Promise.resolve(fail("CTRADER_VIEW_ONLY_CONFIG_INVALID"));}
 return new Promise(resolve=>{
  let socket,finished=false,heartbeat=null;
  const finish=value=>{
   if(finished)return;
   finished=true;clearTimeout(timer);if(heartbeat!==null)clearInterval(heartbeat);
   try{socket?.close(1000,"QA_COMPLETE");}catch{}
   resolve(value);
  };
  const timer=setTimeout(()=>finish(fail("CTRADER_DEMO_PROBE_TIMEOUT")),timeoutMs);
  const send=msg=>{
   if(!msg||!allowedOutbound.has(msg.payloadType)||
      typeof msg.clientMsgId!=="string"||!msg.payload)
    return finish(fail("CTRADER_NON_READ_REQUEST_BLOCKED"));
   try{socket.send(JSON.stringify(msg));}
   catch{finish(fail("CTRADER_DEMO_SEND_FAILED"));}
  };
  try{
   // Never use the LIVE endpoint, including via caller options.
   socket=new WebSocketImpl(CTRADER_DEMO_JSON_URL);
   socket.addEventListener("open",()=>{
    if(finished)return;
    // cTrader recommends a heartbeat each 10 seconds on idle sockets.
    // Heartbeat (51) carries no market/order data or authentication fields.
    heartbeat=setInterval(()=>{
      if(finished)return;
      try{socket.send(JSON.stringify({payloadType:51,payload:{},
        clientMsgId:"qa_heartbeat"}));}
      catch{finish(fail("CTRADER_DEMO_HEARTBEAT_FAILED"));}
    },10_000);
    try{send(session.start());}
    catch{finish(fail("CTRADER_QA_HANDSHAKE_REJECTED"));}
   });
   socket.addEventListener("message",event=>{
    if(finished)return;
    try{
     if(typeof event.data!=="string"||event.data.length>2_000_000)
      return finish(fail("CTRADER_QA_MESSAGE_INVALID"));
     // Heartbeats are unsolicited common events; they are NOT a reply
     // to our correlated application/account request.
     let parsed;
     try{parsed=JSON.parse(event.data);}catch{
       return finish(fail("CTRADER_QA_MESSAGE_INVALID"));
     }
     if(parsed?.payloadType===51)return;
     const next=session.accept(parsed);
     if(next.state==="HELD")return finish(fail(next.reason));
     if(next.state==="INVENTORY_QA_ONLY"){
      // Only after DEMO+SCOPE_VIEW+expected broker is proven.
      // Exact native spelling produces OWNER-REVIEW candidates, never
      // approved mappings or certified TradingView source equivalence.
      let candidateAudit=null,ownerReviewManifest=null;
      try{
        candidateAudit=auditUnapprovedIc34Candidates({
          inventory:next.symbols,viewAccountProven:true
        });
        if(includeCandidateManifest===true)
          ownerReviewManifest=buildUnapprovedIc34OwnerManifest({
            inventory:next.symbols,viewAccountProven:true
          });
      }catch{
        if(includeCandidateManifest===true)
          return finish(fail("CTRADER_QA_MANIFEST_VALIDATION_FAILED"));
      }
      return finish(Object.freeze({state:next.state,
       count:next.count,enabled:next.symbols.filter(x=>x.enabled).length,
       exactNameCandidates:candidateAudit?.exactNameCandidates??null,
       ambiguousNameCandidates:candidateAudit?.ambiguous??null,
       pendingOwnerApproval:34,
       ...(includeCandidateManifest===true?
         {ownerReviewManifest}:{}),
       // Sanitized native names and IDs are not secrets; no OAuth data.
       symbols:Object.freeze(next.symbols.filter(x=>x.enabled).slice(0,1000)),
       sendPush:false,canTrade:false,sourceParityCertified:false}));
     }
     if(next.state==="HISTORICAL_M5_QA_UNCERTIFIED"||
        next.state==="HISTORICAL_M5_M15_QA_UNCERTIFIED"||
        next.state==="HISTORICAL_M5_M15_H4_QA_UNCERTIFIED"||
        next.state==="HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED"){
      let h4=null,m15=null,privateCsv=null;
      if(next.symbolName==="EURUSD"&&next.pagesFetched>=2){
        try{
          h4=summarizeClosedEurusdH4(next.bars);
          m15=deriveClosedEurusdM15Context(next.bars);
        }catch{return finish(fail("CTRADER_MULTI_TIMEFRAME_QA_RECONSTRUCTION_INVALID"));}
      }
      if(includePrivateCsv===true){
        if(config?.exportPrivateCsv!==true||
           next.symbolName!=="EURUSD"||
           next.pagesFetched!==2||next.total!==600||next.gaps!==0)
          return finish(fail("CTRADER_PRIVATE_CSV_SOURCE_GATE_FAILED"));
        try{privateCsv=buildPrivateCtraderEurusdParityCsv(next.bars);}
        catch{return finish(fail("CTRADER_PRIVATE_CSV_VALIDATION_FAILED"));}
      }
      let crtMss34Replay=null;
      if(config?.auditCrtMssAll34===true){
        if(next.state!=="HISTORICAL_34_M5_M15_H4_QA_UNCERTIFIED"||
           !next.native34M15Summary||!next.native34H4Summary)
          return finish(fail("CTRADER_34_CRT_MSS_NATIVE_SOURCE_REQUIRED"));
        try{
         crtMss34Replay=auditCrtMss34ClosedBrokerBars({
          instrumentId:config.sampleInstrumentId,
          symbolId:Number(config.sampleSymbolId),bars:next.bars,
          asOfMs:now(),nativeM15:next.native34M15Summary,
          nativeH4:next.native34H4Summary
         });
        }catch{
         return finish(fail("CTRADER_34_CRT_MSS_CAUSAL_INTEGRITY_FAILED"));
        }
      }
      return finish(Object.freeze({state:next.state,
       symbolName:next.symbolName,barCount:next.total,
       pagesFetched:next.pagesFetched??1,
       gaps:next.gaps,
       ...(config?.allowCohortPaging===true?{
         missingM5Intervals:next.missingM5Intervals,
         gapIntervals:next.gapIntervals,
         gapIntervalsTruncated:next.gapIntervalsTruncated
       }:{}),
       nativePhaseMin:next.nativePhaseMin,
       earliestClosedAtMs:next.bars[0]?.closedAt??null,
       latestClosedAtMs:next.bars.at(-1)?.closedAt??null,
       ...(privateCsv?{privateCsv}:{}),
       ...(next.nativeM15Summary?{
         nativeM15Summary:next.nativeM15Summary
       }:{}),
       ...(next.native34M15Summary?{
         native34M15Summary:next.native34M15Summary
       }:{}),
       ...(next.native34H4Summary?{
         native34H4Summary:next.native34H4Summary
       }:{}),
       ...(crtMss34Replay?{crtMss34Replay}:{}),
       ...(next.nativeH4Summary?{
         nativeH4Summary:next.nativeH4Summary
       }:{}),
       ...(m15?{m15Summary:Object.freeze({
         closedM5Inputs:m15.m5ClosedInputs,
         completeM15:m15.completeM15,
         partialM15:m15.partialM15,
         rejectedM15:m15.rejectedM15,
         nativeBrokerM15Compared:false,
         mssM5Certified:false,mssM15Certified:false,
         sourceParityCertified:false,canTrade:false,sendPush:false
       })}:{}),
       ...(h4?{h4Summary:Object.freeze({
         anchor:h4.anchor,completeH4Blocks:h4.completeH4Blocks,
         partialH4Blocks:h4.partialH4Blocks,
         rejectedH4Blocks:h4.rejectedH4Blocks,
         sourceParityCertified:false,crtFamiliesCertified:false,
         mssCertified:false,canTrade:false,sendPush:false
       })}:{}),
       sourceParityCertified:false,sendPush:false,canTrade:false}));
     }
     send(next);
    }catch{finish(fail("CTRADER_QA_RESPONSE_REJECTED"));}
   });
   socket.addEventListener("error",()=>finish(fail("CTRADER_DEMO_TLS_FAILED")));
   socket.addEventListener("close",()=>finish(fail("CTRADER_DEMO_DISCONNECTED")));
  }catch{finish(fail("CTRADER_DEMO_TLS_FAILED"));}
 });
}
