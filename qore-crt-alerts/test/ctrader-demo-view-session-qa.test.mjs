import test from "node:test";
import assert from "node:assert/strict";
import {CtraderDemoViewSessionQa,CTRADER_DEMO_JSON_URL,
 VIEW_ONLY_TYPES as T} from "../src/ctrader-demo-view-session-qa.mjs";

const ACCOUNT=123456789,now=1_800_000_000_000;
function make(extra={}){
 let id=0;
 return new CtraderDemoViewSessionQa({
  clientId:"fake_id_qa",clientSecret:"fake_secret_qa",
  accessToken:"fake_accounts_view_token_qa",
  demoAccountId:ACCOUNT,expectedBrokerTitle:"IC Markets",
  now:()=>now,idFn:()=>"qa"+(++id),...extra
 });
}
const message=(out,payload)=>({
 clientMsgId:out.clientMsgId,payloadType:out.payloadType+1,payload
});
function throughAccounts(s){
 const req=s.start();
 assert.equal(req.payloadType,T.APP_AUTH);
 assert.ok(req.payload.clientSecret);
 let next=s.accept(message(req,{}));
 assert.equal(next.payloadType,T.ACCOUNTS);
 next=s.accept(message(next,{
   permissionScope:0,
   ctidTraderAccount:[{ctidTraderAccountId:String(ACCOUNT),
      isLive:false,brokerTitleShort:"IC Markets"}]
 }));
 return next;
}
function toInventory(s){
 let req=throughAccounts(s);
 assert.equal(req.payloadType,T.ACCOUNT_AUTH);
 req=s.accept(message(req,{ctidTraderAccountId:String(ACCOUNT)}));
 assert.equal(req.payloadType,T.SYMBOLS);
 return req;
}
test("only WSS demo JSON endpoint and non-trading, owner-approved symbol requests",()=>{
 assert.equal(CTRADER_DEMO_JSON_URL,"wss://demo.ctraderapi.com:5036");
 assert.deepEqual(Object.keys(T).filter(x=>x.includes("ORDER")||x.includes("POSITION")),[]);
 const s=make({sampleSymbolId:77,sampleSymbolName:"EURUSD",sampleInstrumentId:"EURUSD"});
 let req=toInventory(s);
 req=s.accept(message(req,{ctidTraderAccountId:String(ACCOUNT),symbol:[
   {symbolId:"77",symbolName:"EURUSD",enabled:true},
   {symbolId:"88",symbolName:"XAUUSD",enabled:true}
 ]}));
 assert.equal(req.payloadType,T.SYMBOL_BY_ID);
 assert.deepEqual(req.payload.symbolId,[77]);
 req=s.accept(message(req,{ctidTraderAccountId:String(ACCOUNT),
    symbol:[{symbolId:"77",digits:5}]}));
 assert.equal(req.payloadType,T.HISTORY);
 assert.equal(req.payload.period,5);
 assert.equal(req.payload.count,300);
 assert.equal(req.payload.symbolId,77);
 assert.equal(req.payload.ctidTraderAccountId,ACCOUNT);
 assert.equal(req.payload.toTimestamp,now);
 assert.equal(req.payload.fromTimestamp,now-72*3600000);
 const bars=Array.from({length:3},(_,i)=>({
   utcTimestampInMinutes:(now-1_200_000+i*300000)/60000,
   low:100_000,deltaHigh:350,deltaOpen:200,deltaClose:290
 }));
 const data=s.accept(message(req,{
   ctidTraderAccountId:String(ACCOUNT),symbolId:"77",trendbar:bars
 }));
 assert.equal(data.state,"HISTORICAL_M5_QA_UNCERTIFIED");
 assert.equal(data.total,3);
 assert.equal(data.gaps,0);
 assert.equal(data.nativePhaseMin,0);
 assert.ok(data.bars.every(x=>x.provider==="IC" && x.instrumentId==="EURUSD"));
 assert.ok(data.bars.every(x=>x.certified===false && x.sendPush===false));
 assert.equal(s.status.state,"COMPLETE");
 assert.equal(data.sourceParityCertified,false);
 assert.equal(data.canTrade,false);
});
test("inventory-only probe never guesses market mapping or requests bars",()=>{
 const s=make(),req=toInventory(s);
 const outcome=s.accept(message(req,{ctidTraderAccountId:String(ACCOUNT),
   symbol:[{symbolId:77,symbolName:"EURUSD",enabled:true}]}));
 assert.equal(outcome.state,"INVENTORY_QA_ONLY");
 assert.equal(outcome.count,1);
 assert.equal(outcome.sendPush,false);
 assert.equal(s.status.state,"COMPLETE");
});
test("permission TRADING / missing scope / LIVE / other broker / wrong account rejected",()=>{
 for(const input of [
  {scope:1,expected:"CTRADER_SCOPE_VIEW_NOT_PROVEN"},
  {scope:null,expected:"CTRADER_SCOPE_VIEW_NOT_PROVEN"},
  {isLive:true,expected:"CTRADER_LIVE_OR_UNVERIFIED_BLOCKED"},
  {broker:"OANDA",expected:"CTRADER_EXPECTED_BROKER_MISMATCH"}
 ]){
  const s=make();const req=s.start();
  const token=s.accept(message(req,{}));
  const payload={permissionScope:input.scope===null?undefined:input.scope??0,
    ctidTraderAccount:[{ctidTraderAccountId:String(ACCOUNT),
     isLive:input.isLive??false,brokerTitleShort:input.broker??"IC Markets"}]};
  const res=s.accept(message(token,payload));
  assert.equal(res.reason,input.expected);
  assert.equal(s.status.state,"HELD");
 }
 const s=make(),r=s.start();
 const res=s.accept({clientMsgId:"forged",payloadType:2101,payload:{}});
 assert.equal(res.reason,"CTRADER_UNEXPECTED_RESPONSE_OR_ID");
 assert.equal(s.status.state,"HELD");
 assert.equal(s.accept(message(r,{})).state,"HELD");
});
test("owner must approve both IC34 instrument and exact broker symbol",()=>{
 assert.throws(()=>make({sampleSymbolId:77,sampleSymbolName:"EURUSD"}),/CONFIG/);
 assert.throws(()=>make({sampleSymbolId:77,sampleSymbolName:"EURUSD",sampleInstrumentId:"EURTRY"}),/CONFIG/);
 const s=make({sampleSymbolId:77,sampleSymbolName:"EURUSD",sampleInstrumentId:"EURUSD"});
 const req=toInventory(s);
 const result=s.accept(message(req,{
   ctidTraderAccountId:String(ACCOUNT),
   symbol:[{symbolId:77,symbolName:"EURUSD",enabled:false}]
 }));
 assert.equal(result.reason,"CTRADER_OWNER_APPROVED_SYMBOL_NOT_AVAILABLE");
 assert.equal(s.status.state,"HELD");
});
test("malformed and future M5 or incorrect broker response cannot be certified",()=>{
 const s=make({sampleSymbolId:77,sampleSymbolName:"EURUSD",sampleInstrumentId:"EURUSD"});
 let req=toInventory(s);
 req=s.accept(message(req,{ctidTraderAccountId:ACCOUNT,
   symbol:[{symbolId:77,symbolName:"EURUSD",enabled:true}]}));
 req=s.accept(message(req,{ctidTraderAccountId:ACCOUNT,
   symbol:[{symbolId:77,digits:5}]}));
 const bad=s.accept(message(req,{
   ctidTraderAccountId:ACCOUNT,symbolId:77,
   trendbar:[{utcTimestampInMinutes:(now/60000),low:100000,
    deltaHigh:400,deltaOpen:100,deltaClose:100}]
 }));
 assert.equal(bad.reason,"CTRADER_HISTORY_INVALID_OR_NOT_CLOSED");
 assert.equal(s.status.state,"HELD");
});
test("cannot restart a completed or held session; errors are not printed",()=>{
 const s=make();
 const a=s.start();
 assert.throws(()=>s.start(),/START_ALREADY_USED/);
 const res=s.accept({clientMsgId:a.clientMsgId,payloadType:2142,
   payload:{errorCode:"TRADING_ERROR",secret:"must-not-echo"}});
 assert.equal(res.reason,"CTRADER_UNEXPECTED_RESPONSE_OR_ID");
 assert.ok(!JSON.stringify(res).includes("must-not-echo"));
 assert.equal(s.status.canTrade,false);
 assert.equal(s.status.sendPush,false);
});
