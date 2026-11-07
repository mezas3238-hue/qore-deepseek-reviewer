// cTrader DEMO-only account identity bootstrap. No account authentication,
// market subscriptions, orders, trade capability, FCM, or persistence.
// Owner must explicitly opt in. Tokens are never emitted to the output.
import {randomUUID} from "node:crypto";
import {CTRADER_DEMO_JSON_URL,VIEW_ONLY_TYPES}
  from "./ctrader-demo-view-session-qa.mjs";

export const DISCOVERY_OPT_IN="OWNER_APPROVED_READONLY_DISCOVERY";
const permittedSend=new Set([VIEW_ONLY_TYPES.APP_AUTH,VIEW_ONLY_TYPES.ACCOUNTS]);
const safeText=v=>typeof v==="string" && /^[A-Za-z0-9_ .:/()-]{1,80}$/.test(v);
const safeId=v=>{
  const text=typeof v==="number" && Number.isSafeInteger(v)?String(v):v;
  return typeof text==="string" && /^[1-9][0-9]{0,15}$/.test(text) &&
    Number.isSafeInteger(Number(text))?text:null;
};
const fail=reason=>Object.freeze({state:reason,accounts:[],
  canTrade:false,sendPush:false,sourceParityCertified:false,connected:false});

export function accountDiscoveryGuard(env={}){
  if(env.QORE_CT_STAGE!=="DEMO"||
     env.QORE_CT_OAUTH_SCOPE!=="accounts"||
     env.QORE_PROVIDER!=="IC"||
     env.QORE_TRADING_ENABLED!=="false"||
     env.QORE_PUSH_ENABLED!=="false"||
     env.QORE_ALERT_TTL_SECONDS!=="14400")
    return "BLOCKED_UNSAFE_STAGE_CONFIG";
  if(env.QORE_CT_QA_PROBE!=="OWNER_APPROVED_VIEW_ONLY"||
     env.QORE_CT_ACCOUNT_DISCOVERY!==DISCOVERY_OPT_IN)
    return "AWAITING_OWNER_READONLY_DISCOVERY_APPROVAL";
  for(const key of ["QORE_CT_CLIENT_ID","QORE_CT_CLIENT_SECRET",
                    "QORE_CT_VIEW_ACCESS_TOKEN"]){
    if(typeof env[key]!=="string" || env[key].length<4 ||
       env[key].length>4096 || /[\r\n]/.test(env[key]))
      return "AWAITING_SECURE_CTRADER_CREDENTIALS";
  }
  return "AUTHORIZED_DEMO_DISCOVERY_READY";
}

// A reply can contain LIVE accounts; they must never appear in output.
// Only accounts explicitly proven isLive=false and with stable broker name
// are candidates for manual Owner selection in a *private* Railway variable.
export function parseProvenDemoAccountCandidates(raw,expectedId){
  if(!raw || raw.payloadType!==VIEW_ONLY_TYPES.ACCOUNTS_OK ||
     raw.clientMsgId!==expectedId ||
     !raw.payload || typeof raw.payload!=="object" ||
     (raw.payload.permissionScope!==0 &&
      raw.payload.permissionScope!=="SCOPE_VIEW") ||
     !Array.isArray(raw.payload.ctidTraderAccount) ||
     raw.payload.ctidTraderAccount.length>1000)
    return fail("CTRADER_SCOPE_VIEW_OR_ACCOUNT_REPLY_UNVERIFIED");
  const ids=new Set(),candidates=[];
  let skipped=0;
  for(const account of raw.payload.ctidTraderAccount){
    if(!account || account.isLive!==false){skipped++;continue;}
    const id=safeId(account.ctidTraderAccountId);
    const broker=account.brokerTitleShort;
    if(!id || !safeText(broker) || ids.has(id))
      return fail("CTRADER_DEMO_ACCOUNT_IDENTITY_AMBIGUOUS");
    ids.add(id);
    candidates.push(Object.freeze({
      ctidTraderAccountId:id,brokerTitleShort:broker,
      isLive:false
    }));
  }
  candidates.sort((a,b)=>a.ctidTraderAccountId.localeCompare(b.ctidTraderAccountId));
  return Object.freeze({
    state:candidates.length?"DEMO_ACCOUNT_CANDIDATES_FOR_OWNER":
      "NO_VERIFIED_DEMO_ACCOUNTS",
    accounts:Object.freeze(candidates),
    accountsWithoutProvenDemo:skipped,
    scope:"accounts",canTrade:false,sendPush:false,
    sourceParityCertified:false,connected:false
  });
}

export function discoverAuthorizedDemoAccounts({
  env=process.env,WebSocketImpl=globalThis.WebSocket,
  timeoutMs=25000,idFn=randomUUID
}={}){
  const gate=accountDiscoveryGuard(env);
  if(gate!=="AUTHORIZED_DEMO_DISCOVERY_READY")
    return Promise.resolve(fail(gate));
  if(typeof WebSocketImpl!=="function" ||
     !Number.isSafeInteger(timeoutMs) || timeoutMs<3000 ||
     timeoutMs>40000 || typeof idFn!=="function")
    return Promise.resolve(fail("CTRADER_DISCOVERY_TRANSPORT_INVALID"));
  return new Promise(resolve=>{
    let socket,finished=false,activeId=null,phase="OPENING",heartbeat;
    const finish=value=>{
      if(finished)return;
      finished=true;
      clearTimeout(timer);
      if(heartbeat)clearInterval(heartbeat);
      try{socket?.close(1000,"QA_DONE");}catch{}
      resolve(value);
    };
    const timer=setTimeout(()=>finish(fail("CTRADER_DISCOVERY_TIMEOUT")),timeoutMs);
    const send=(payloadType,payload)=>{
      if(!permittedSend.has(payloadType))
        return finish(fail("CTRADER_DISCOVERY_NON_READONLY_REQUEST"));
      const id=String(idFn());
      if(!/^[A-Za-z0-9_-]{1,80}$/.test(id))
        return finish(fail("CTRADER_DISCOVERY_REQUEST_ID_INVALID"));
      activeId=id;
      try{socket.send(JSON.stringify({payloadType,payload,clientMsgId:id}));}
      catch{finish(fail("CTRADER_DISCOVERY_SEND_FAILED"));}
    };
    try{
      // NEVER accept caller-provided hosts: cTrader's DEMO WSS only.
      socket=new WebSocketImpl(CTRADER_DEMO_JSON_URL);
      socket.addEventListener("open",()=>{
        if(finished)return;
        phase="APPLICATION_AUTH";
        heartbeat=setInterval(()=>{
          if(finished)return;
          try{socket.send(JSON.stringify({payloadType:51,payload:{},
            clientMsgId:"qa_discovery_heartbeat"}));}
          catch{finish(fail("CTRADER_DISCOVERY_HEARTBEAT_FAILED"));}
        },10000);
        send(VIEW_ONLY_TYPES.APP_AUTH,{
          clientId:env.QORE_CT_CLIENT_ID,
          clientSecret:env.QORE_CT_CLIENT_SECRET
        });
      });
      socket.addEventListener("message",e=>{
        if(finished)return;
        let msg;
        try{
          if(typeof e.data!=="string"||e.data.length>1500000)
            return finish(fail("CTRADER_DISCOVERY_REPLY_INVALID"));
          msg=JSON.parse(e.data);
        }catch{return finish(fail("CTRADER_DISCOVERY_REPLY_INVALID"));}
        if(msg?.payloadType===51)return;
        if(msg?.clientMsgId!==activeId)
          return finish(fail("CTRADER_DISCOVERY_UNCORRELATED_RESPONSE"));
        if(phase==="APPLICATION_AUTH" &&
           msg.payloadType===VIEW_ONLY_TYPES.APP_AUTH_OK){
          phase="ACCOUNT_LIST";
          return send(VIEW_ONLY_TYPES.ACCOUNTS,{
            accessToken:env.QORE_CT_VIEW_ACCESS_TOKEN
          });
        }
        if(phase==="ACCOUNT_LIST"){
          return finish(parseProvenDemoAccountCandidates(msg,activeId));
        }
        return finish(fail("CTRADER_DISCOVERY_UNEXPECTED_RESPONSE"));
      });
      socket.addEventListener("error",()=>finish(fail("CTRADER_DISCOVERY_TLS_FAILED")));
      socket.addEventListener("close",()=>finish(fail("CTRADER_DISCOVERY_DISCONNECTED")));
    }catch{finish(fail("CTRADER_DISCOVERY_TLS_FAILED"));}
  });
}
