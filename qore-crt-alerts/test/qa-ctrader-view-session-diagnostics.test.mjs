import test from "node:test";
import assert from "node:assert/strict";
import {CtraderDemoViewSessionQa,VIEW_ONLY_TYPES}
  from "../src/ctrader-demo-view-session-qa.mjs";

const credentials={
  clientId:"fake-client-id",clientSecret:"fake-secret",
  accessToken:"fake-access-token",demoAccountId:"48270058",
  expectedBrokerTitle:"Raw Trading Ltd"
};
function fresh(){
  let request=0;
  const session=new CtraderDemoViewSessionQa({...credentials,
    idFn:()=>String(++request)});
  const initial=session.start();
  return {session,initial};
}
test("untrusted API error is fail closed with sanitized stage and code",()=>{
  const {session,initial}=fresh();
  const rejected=session.accept({
    clientMsgId:initial.clientMsgId,
    payloadType:2142,
    payload:{errorCode:"CH_CLIENT_AUTH_FAILURE",
      description:"fake-secret fake-access-token should never be leaked"}
  });
  assert.equal(rejected.state,"HELD");
  assert.equal(rejected.reason,"CTRADER_API_ERROR_APP_AUTH_FAILURE_APP_PENDING");
  assert.equal(rejected.canTrade,false);
  assert.equal(rejected.sendPush,false);
  assert.ok(!JSON.stringify(rejected).includes("fake-secret"));
  assert.ok(!JSON.stringify(rejected).includes("fake-access-token"));
});
test("mismatched request ID, response type and malformed messages report safe categories",()=>{
  const a=fresh();
  assert.equal(a.session.accept({clientMsgId:"another",payloadType:2101,payload:{}})
    .reason,"CTRADER_RESPONSE_ID_MISMATCH_APP_PENDING");
  const b=fresh();
  assert.equal(b.session.accept({clientMsgId:b.initial.clientMsgId,
    payloadType:2115,payload:{}}).reason,
    "CTRADER_RESPONSE_TYPE_MISMATCH_APP_PENDING");
  const c=fresh();
  assert.equal(c.session.accept({clientMsgId:c.initial.clientMsgId,
    payloadType:2101,payload:null}).reason,
    "CTRADER_MALFORMED_RESPONSE");
});
test("unknown API code never leaks raw strings",()=>{
  const {session,initial}=fresh();
  const result=session.accept({clientMsgId:initial.clientMsgId,
    payloadType:2142,payload:{errorCode:"very-private-token",
      description:"unexpected PII"}});
  assert.equal(result.reason,"CTRADER_API_ERROR_UNKNOWN_APP_PENDING");
  assert.ok(!JSON.stringify(result).includes("very-private-token"));
  assert.ok(!JSON.stringify(result).includes("unexpected PII"));
});
test("view-only account list is a prerequisite for any account authorization",()=>{
  const {session,initial}=fresh();
  const req=session.accept({clientMsgId:initial.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK,payload:{}});
  assert.equal(req.payloadType,VIEW_ONLY_TYPES.ACCOUNTS);
  const held=session.accept({clientMsgId:req.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.ACCOUNTS_OK,payload:{
      permissionScope:1,ctidTraderAccount:[
        {ctidTraderAccountId:"48270058",isLive:false,
          brokerTitleShort:"Raw Trading Ltd"}
      ]}});
  assert.equal(held.reason,"CTRADER_SCOPE_VIEW_NOT_PROVEN");
  assert.equal(held.canTrade,false);
});
test("expired token is recognized while preserving an independent permission gate",()=>{
  const {session,initial}=fresh();
  const req=session.accept({clientMsgId:initial.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK,payload:{}});
  const result=session.accept({clientMsgId:req.clientMsgId,
    payloadType:2142,payload:{errorCode:"OA_AUTH_TOKEN_EXPIRED"}});
  assert.equal(result.reason,"CTRADER_API_ERROR_TOKEN_EXPIRED_ACCOUNTS_PENDING");
  assert.equal(result.sourceParityCertified,false);
  assert.equal(result.sendPush,false);
});

test("empty application-auth response may omit payload but must correlate exactly",()=>{
  const first=fresh();
  const accepted=first.session.accept({clientMsgId:first.initial.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK});
  assert.equal(accepted.payloadType,VIEW_ONLY_TYPES.ACCOUNTS);
  assert.equal(accepted.payload.accessToken,"fake-access-token");

  const forged=fresh();
  const held=forged.session.accept({clientMsgId:"wrong",
    payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK});
  assert.equal(held.reason,"CTRADER_RESPONSE_ID_MISMATCH_APP_PENDING");

  const emptyAccounts=fresh();
  const req=emptyAccounts.session.accept({clientMsgId:emptyAccounts.initial.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.APP_AUTH_OK});
  const denied=emptyAccounts.session.accept({clientMsgId:req.clientMsgId,
    payloadType:VIEW_ONLY_TYPES.ACCOUNTS_OK});
  assert.equal(denied.reason,"CTRADER_MALFORMED_RESPONSE");
  assert.equal(denied.canTrade,false);
});
