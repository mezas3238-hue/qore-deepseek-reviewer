import test from "node:test";
import assert from "node:assert/strict";
import {compare3cInsideLastEvents} from "../src/crt-family-overlap-evidence-qa.mjs";

const c1=Date.parse("2026-11-02T01:00:00Z");
const h4Close=Date.parse("2026-11-02T13:00:00Z");
const base={
 source3c:"IC:GBPNZD",sourceInside:"IC:GBPNZD",
 close3c:h4Close,closeInside:h4Close,
 c1Start3c:c1,c1StartInside:c1,
 direction3c:1,directionInside:1
};
test("same 02/11 date does NOT demonstrate same H4 close or same CRT cycle",()=>{
 const v=compare3cInsideLastEvents({...base,closeInside:h4Close+4*3600_000});
 assert.equal(v.status,"SAME_DATE_DIFFERENT_H4_CLOSE");
 assert.equal(v.sameExactClose,false);
 assert.equal(v.certified,false);
 assert.equal(v.actionable,false);
 assert.equal(v.sendPush,false);
});
test("XAUUSD last events dated 29/10 from screenshot are insufficient without timestamps",()=>{
 const v=compare3cInsideLastEvents({
   source3c:"IC:XAUUSD",sourceInside:"IC:XAUUSD"
 });
 assert.equal(v.status,"MISSING_EVENT_TIMESTAMPS");
});
test("differing or missing exact broker always fail closed, even on identical close",()=>{
 for(const x of ["OANDA:GBPNZD",null,""]){
  const v=compare3cInsideLastEvents({...base,sourceInside:x});
  assert.equal(v.status,"DIFFERENT_OR_UNKNOWN_BROKERS");
 }
});
test("same close is NOT the same cycle without confirmed C1 start and direction",()=>{
 const v=compare3cInsideLastEvents({...base,c1StartInside:c1+4*3600_000});
 assert.equal(v.status,"SAME_H4_CLOSE_C1_OR_DIRECTION_UNVERIFIED");
 assert.equal(v.sameC1,false);
 const w=compare3cInsideLastEvents({...base,directionInside:-1});
 assert.equal(w.sameDirection,false);
 assert.equal(w.certified,false);
});
test("same-close and same-C1 but unknown geometry cannot certify",()=>{
 const v=compare3cInsideLastEvents(base);
 assert.equal(v.status,"SAME_CYCLE_GEOMETRY_REVIEW_REQUIRED");
 assert.equal(v.certified,false);
 assert.equal(v.sendPush,false);
});
test("both geometries checked: one candidate QA only, never two independently certified entries",()=>{
 const v=compare3cInsideLastEvents({...base,
   geometry3cVerified:true,geometryInsideVerified:true
 });
 assert.equal(v.status,"OVERLAPPING_GEOMETRIES_SINGLE_CANDIDATE_QA");
 assert.equal(v.primaryCandidate,"TRUE_3C_C3_SWEEP_C1");
 assert.equal(v.secondaryCandidate,"INSIDE_C3_SWEEP_C2");
 assert.equal(v.distinctTradingSignals,false);
 assert.equal(v.requiresTradingViewTraderLabOHLCParity,true);
 assert.equal(v.certified,false);
 assert.equal(v.sendPush,false);
});
test("different UTC date returns different closes, never inferred conflict",()=>{
 const v=compare3cInsideLastEvents({...base,closeInside:h4Close-24*3600_000});
 assert.equal(v.status,"DIFFERENT_H4_CLOSES");
});
