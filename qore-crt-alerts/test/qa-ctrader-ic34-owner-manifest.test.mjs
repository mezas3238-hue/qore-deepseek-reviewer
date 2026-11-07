import test from "node:test";
import assert from "node:assert/strict";
import {INSTRUMENTS} from "../src/instruments.mjs";
import {buildUnapprovedIc34OwnerManifest}
 from "../src/qa-ctrader-ic34-owner-manifest.mjs";
import {performStagingProbe}
 from "../scripts/railway-ctrader-demo-entry.mjs";

const inventory=INSTRUMENTS.map((item,i)=>({
  symbolId:1001+i,symbolName:item.tvSymbol.slice(3),enabled:true
}));
const env=Object.freeze({
  QORE_CT_STAGE:"DEMO",QORE_CT_OAUTH_SCOPE:"accounts",
  QORE_PROVIDER:"IC",QORE_TRADING_ENABLED:"false",
  QORE_PUSH_ENABLED:"false",QORE_ALERT_TTL_SECONDS:"14400",
  QORE_CT_QA_PROBE:"OWNER_APPROVED_VIEW_ONLY",
  QORE_CT_CLIENT_ID:"fake_id_qa",
  QORE_CT_CLIENT_SECRET:"fake_secret_qa",
  QORE_CT_VIEW_ACCESS_TOKEN:"fake_token_qa",
  QORE_CT_DEMO_ACCOUNT_ID:"123456789",
  QORE_CT_EXPECTED_BROKER_TITLE:"Raw Trading Ltd",
  QORE_CT_QA_SYMBOL_MANIFEST:"OWNER_REVIEW_ONLY"
});
test("authenticated IC34 inventory yields 34 review-only, fingerprinted candidates",()=>{
  const a=buildUnapprovedIc34OwnerManifest({viewAccountProven:true,inventory});
  assert.equal(a.state,"IC34_CANDIDATES_OWNER_REVIEW_ONLY");
  assert.equal(a.total,34);
  assert.equal(a.rows.length,34);
  assert.equal(a.exactNameCandidates,34);
  assert.equal(a.unmapped,0);
  assert.equal(a.ambiguous,0);
  assert.equal(a.ownerApprovedMappings,0);
  assert.equal(a.sourceParityCertified,0);
  assert.equal(a.realM5BarsConfirmed,0);
  assert.equal(a.canTrade,false);
  assert.equal(a.sendPush,false);
  assert.match(a.manifestSha256,/^[a-f0-9]{64}$/);
  assert.equal(a.rows.find(x=>x.instrumentId==="NDX100").candidates[0].brokerSymbolName,"USTEC");
  assert.equal(a.rows.find(x=>x.instrumentId==="SPX500").candidates[0].brokerSymbolName,"US500");
  assert.ok(a.rows.every(row=>row.ownerApproved===false &&
    row.sourceParityCertified===false && row.candidates.length===1));
  assert.ok(Object.isFrozen(a)&&Object.isFrozen(a.rows));
  const b=buildUnapprovedIc34OwnerManifest({
    viewAccountProven:true,inventory:[...inventory].reverse()
  });
  assert.equal(b.manifestSha256,a.manifestSha256);
});
test("no proven DEMO VIEW inventory; duplicate IDs; suspect names all fail closed",()=>{
  assert.throws(()=>buildUnapprovedIc34OwnerManifest({inventory}),/PROVEN/);
  assert.throws(()=>buildUnapprovedIc34OwnerManifest({
    viewAccountProven:true,inventory:[...inventory,inventory[0]]
  }),/UNTRUSTED/);
  assert.throws(()=>buildUnapprovedIc34OwnerManifest({
    viewAccountProven:true,inventory:[{symbolId:999,
      symbolName:"EURUSD;BAD",enabled:true}]
  }),/UNTRUSTED/);
});
test("ambiguous or missing exact broker names remain unapproved",()=>{
  const sample=[...inventory.slice(1),
    {symbolId:9000,symbolName:"EURUSD",enabled:true},
    {symbolId:9001,symbolName:"EUR/USD",enabled:true}
  ];
  const out=buildUnapprovedIc34OwnerManifest({inventory:sample,viewAccountProven:true});
  assert.equal(out.ambiguous,1);
  assert.equal(out.unmapped,0);
  assert.equal(out.exactNameCandidates,33);
  assert.equal(out.rows.find(x=>x.instrumentId==="EURUSD").candidates.length,2);
  assert.equal(out.rows.find(x=>x.instrumentId==="EURUSD").ownerApproved,false);
});
test("manifest flag sends explicit probe option and never represents certified market data",async()=>{
  const manifest=buildUnapprovedIc34OwnerManifest({inventory,viewAccountProven:true});
  let called=0;
  const result=await performStagingProbe({env,probe:async({config,includeCandidateManifest})=>{
    called++;
    assert.equal(includeCandidateManifest,true);
    assert.equal(config.expectedBrokerTitle,"Raw Trading Ltd");
    return {state:"INVENTORY_QA_ONLY",count:365,
      exactNameCandidates:34,ambiguousNameCandidates:0,
      ownerReviewManifest:manifest};
  }});
  assert.equal(called,1);
  assert.equal(result.state,"INVENTORY_QA_ONLY");
  assert.equal(result.ownerReviewManifest.manifestSha256,manifest.manifestSha256);
  assert.equal(result.connected,true);
  assert.equal(result.sendPush,false);
  assert.equal(result.canTrade,false);
  assert.equal(result.sourceParityCertified,false);
  assert.ok(!JSON.stringify(result).includes("fake_secret_qa"));
  assert.ok(!JSON.stringify(result).includes("fake_token_qa"));
});
test("without exact flag, routine probes never include owner manifest",async()=>{
  const plain=await performStagingProbe({env:{
    ...env,QORE_CT_QA_SYMBOL_MANIFEST:"DISABLED"
  },probe:async({includeCandidateManifest})=>{
    assert.equal(includeCandidateManifest,false);
    return {state:"INVENTORY_QA_ONLY",count:365,
      ownerReviewManifest:buildUnapprovedIc34OwnerManifest({
        inventory,viewAccountProven:true
      })};
  }});
  assert.equal(plain.ownerReviewManifest,undefined);
  assert.equal(plain.canTrade,false);
});
