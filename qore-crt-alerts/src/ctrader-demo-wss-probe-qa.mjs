// Real WSS one-shot transport for the strict DEMO view-only state machine.
// NEVER starts automatically. No orders, no FCM, no auto-mapping TV feeds.
// Only secrets from server environment. No logging tokens or OAuth payloads.
import {CtraderDemoViewSessionQa,CTRADER_DEMO_JSON_URL,VIEW_ONLY_TYPES}
 from "./ctrader-demo-view-session-qa.mjs";
import {auditUnapprovedIc34Candidates} from "./ctrader-ic34-candidate-audit-qa.mjs";
import {buildUnapprovedIc34OwnerManifest}
 from "./qa-ctrader-ic34-owner-manifest.mjs";

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
 return Object.freeze({
  clientId:env.QORE_CT_CLIENT_ID,
  clientSecret:env.QORE_CT_CLIENT_SECRET,
  accessToken:env.QORE_CT_VIEW_ACCESS_TOKEN,
  demoAccountId:env.QORE_CT_DEMO_ACCOUNT_ID,
  expectedBrokerTitle:env.QORE_CT_EXPECTED_BROKER_TITLE,
  ...(values.every(x=>typeof x==="string"&&x.length>0)?{
   sampleSymbolId:values[0],
   sampleSymbolName:values[1],
   sampleInstrumentId:values[2]
  }:{})
 });
}
export function runAuthorizedDemoWssProbe({
 config,WebSocketImpl=globalThis.WebSocket,timeoutMs=25_000,
 now=Date.now,idFn,includeCandidateManifest=false
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
     if(next.state==="HISTORICAL_M5_QA_UNCERTIFIED")
      return finish(Object.freeze({state:next.state,
       symbolName:next.symbolName,barCount:next.total,
       gaps:next.gaps,nativePhaseMin:next.nativePhaseMin,
       earliestClosedAtMs:next.bars[0]?.closedAt??null,
       latestClosedAtMs:next.bars.at(-1)?.closedAt??null,
       sourceParityCertified:false,sendPush:false,canTrade:false}));
     send(next);
    }catch{finish(fail("CTRADER_QA_RESPONSE_REJECTED"));}
   });
   socket.addEventListener("error",()=>finish(fail("CTRADER_DEMO_TLS_FAILED")));
   socket.addEventListener("close",()=>finish(fail("CTRADER_DEMO_DISCONNECTED")));
  }catch{finish(fail("CTRADER_DEMO_TLS_FAILED"));}
 });
}
