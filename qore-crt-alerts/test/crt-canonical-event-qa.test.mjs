import test from "node:test";
import assert from "node:assert/strict";
import {resolveCanonicalCRTFamiliesQA as run} from "../src/crt-canonical-event-qa.mjs";
const t=Date.parse("2026-11-02T12:00:00.000Z"),c1=t-8*3600000;
const base={source:"IC:GBPNZD",c1Start:c1,terminalCloseAt:t,direction:1,
  geometryVerified:true,cycleVerified:true};
test("same verified broker+C1+direction+H4 close groups TRUE_3C and INSIDE as one QA candidate",()=>{
 const r=run([{...base,family:"CRT_INSIDE_RETURN"},{...base,family:"CRT_3C_TRUE"}]);
 assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].canonicalFamily,"CRT_3C_TRUE");
 assert.deepEqual(r.candidates[0].observedFamilies,["CRT_3C_TRUE","CRT_INSIDE_RETURN"]);
 assert.equal(r.candidates[0].overlap,true);
 assert.equal(r.pushEnabled,false);assert.equal(r.certified,false);assert.equal(r.actionable,false);
});
test("the same 02/11 DD/MM but distinct closed H4 times MUST remain separate",()=>{
 const r=run([{...base,family:"CRT_3C_TRUE"},{...base,family:"CRT_INSIDE_RETURN",terminalCloseAt:t+4*3600000}]);
 assert.equal(r.candidates.length,2);
});
test("same close from two brokers must never merge",()=>{
 const r=run([{...base,family:"CRT_3C_TRUE"},{...base,source:"OANDA:GBPNZD",family:"CRT_INSIDE_RETURN"}]);
 assert.equal(r.candidates.length,2);
});
test("same close in different C1 or direction must never merge",()=>{
 const r=run([{...base,family:"CRT_3C_TRUE"},{...base,c1Start:c1-4*3600000,family:"CRT_INSIDE_RETURN"},
              {...base,direction:-1,family:"CRT_MULTI_N"}]);
 assert.equal(r.candidates.length,3);
});
test("missing geometry or cycle evidence fails closed instead of inventing canonical events",()=>{
 const r=run([{...base,geometryVerified:false,family:"CRT_3C_TRUE"},
              {...base,cycleVerified:false,family:"CRT_INSIDE_RETURN"}]);
 assert.equal(r.candidates.length,0);assert.equal(r.pending.length,2);
 assert.ok(r.pending.every(x=>x.pushEnabled===false&&x.certified===false));
});
test("seven-role audit masks, retests, rejected expansions and unknown models are never valid family evidence",()=>{
 const r=run([{...base,family:"M15_RETEST",qaCatalogMask:127},
              {...base,family:"INSIDE_CONTINUATION",qaCatalogMask:16},
              {...base,family:"CRT_3C_TRUE",geometryVerified:false,qaCatalogMask:1}]);
 assert.equal(r.candidates.length,0);assert.equal(r.pending.length,3);
});
test("priority is deterministic, masks unmodified, not exposed as live alerts",()=>{
 const ev={...base,family:"CRT_MULTI_N",qaCatalogMask:32};
 const r=run([{...ev},{...base,family:"CRT_INSIDE_RETURN",qaCatalogMask:8}]);
 assert.equal(r.candidates[0].canonicalFamily,"CRT_INSIDE_RETURN");
 assert.equal(ev.qaCatalogMask,32);
 assert.equal(r.candidates[0].observations[1].qaCatalogMask,32);
 assert.equal(r.pushEnabled,false);
});
test("bad argument shape rejected without action",()=>{
 assert.throws(()=>run(null),TypeError);
 assert.throws(()=>run({}),TypeError);
});
