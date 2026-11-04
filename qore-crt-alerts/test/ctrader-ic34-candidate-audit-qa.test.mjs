import test from "node:test";
import assert from "node:assert/strict";
import {auditUnapprovedIc34Candidates}
 from "../src/ctrader-ic34-candidate-audit-qa.mjs";
import {INSTRUMENTS} from "../src/instruments.mjs";

test("34 fixed IC symbols compared against DEMO native names, with no automatic approval",()=>{
 const r=auditUnapprovedIc34Candidates({
  viewAccountProven:true,inventory:[
   {symbolId:1,symbolName:"EUR/USD",enabled:true},
   {symbolId:2,symbolName:"USTEC",enabled:true},
   {symbolId:3,symbolName:"US500",enabled:true},
   {symbolId:4,symbolName:"XAUUSD",enabled:true},
   {symbolId:5,symbolName:"BTCUSD",enabled:true}
  ]});
 assert.equal(r.total,34);
 assert.equal(r.exactNameCandidates,5);
 assert.equal(r.unmapped,29);
 assert.equal(r.approvedMappings,0);
 assert.equal(r.sourceParityCertified,0);
 assert.deepEqual(r.rows.map(x=>x.tvSymbol),INSTRUMENTS.map(x=>x.tvSymbol));
 assert.ok(r.rows.every(x=>x.tvSymbol.startsWith("IC:")&&
   x.ownerApproved===false&&x.sendPush===false&&x.sourceParityCertified===false));
 assert.equal(r.rows.find(x=>x.instrumentId==="NDX100").candidates[0].brokerSymbolName,"USTEC");
 assert.equal(r.rows.find(x=>x.instrumentId==="SPX500").candidates[0].brokerSymbolName,"US500");
 assert.equal(r.rows.find(x=>x.instrumentId==="EURUSD").candidates[0].brokerSymbolName,"EUR/USD");
});
test("ambiguous or disabled native broker names never auto-map",()=>{
 const r=auditUnapprovedIc34Candidates({
  viewAccountProven:true,inventory:[
   {symbolId:1,symbolName:"EURUSD",enabled:true},
   {symbolId:2,symbolName:"EUR/USD",enabled:true},
   {symbolId:3,symbolName:"US30",enabled:false},
   {symbolId:4,symbolName:"NAS100USD",enabled:true}
  ]});
 assert.equal(r.ambiguous,1);
 assert.equal(r.rows.find(x=>x.instrumentId==="EURUSD").state,
  "AMBIGUOUS_BROKER_SYMBOL_REQUIRES_OWNER");
 assert.equal(r.rows.find(x=>x.instrumentId==="US30").state,"NO_EXACT_BROKER_CANDIDATE");
 assert.equal(r.rows.find(x=>x.instrumentId==="NDX100").state,"NO_EXACT_BROKER_CANDIDATE");
 assert.equal(r.approvedMappings,0);
});
test("no authenticated account, duplicates, invalid IDs or suspicious symbol names rejected",()=>{
 assert.throws(()=>auditUnapprovedIc34Candidates({inventory:[]}),/PROVEN/);
 assert.throws(()=>auditUnapprovedIc34Candidates({viewAccountProven:true,inventory:[
  {symbolId:2,symbolName:"EURUSD",enabled:true},{symbolId:2,symbolName:"XAUUSD",enabled:true}
 ]}),/UNTRUSTED/);
 assert.throws(()=>auditUnapprovedIc34Candidates({viewAccountProven:true,inventory:[
  {symbolId:3,symbolName:"EURUSD;DROP TABLE",enabled:true}
 ]}),/UNTRUSTED/);
});
