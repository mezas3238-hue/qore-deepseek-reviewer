// Read-only seven-ROLE certification readiness matrix, NEVER a live certificate.
// A seven-bit Pine panel is 7 distinct states, NOT 7 independent entry strategies.
// Genuine Pine Editor execution / externally attested same-source OHLC / holdout
// still require separately verified evidence; this script cannot self-attest.
import {CATEGORY_BITS} from "./crt-seven-category-parity-audit.mjs";

export const SEVEN_CRT_ROLES=Object.freeze([
 {id:"CRT_3C_REVERSAL",kind:"STRUCTURAL",negative:"C3_INVALIDATED"},
 {id:"CRT_2C_CANDIDATE",kind:"PROVISIONAL",negative:"C2_NOT_RATIFIED"},
 {id:"CRT_2C_EXPANSION",kind:"REJECTION",negative:"FAKE_RETURN"},
 {id:"CRT_INSIDE_RETURN",kind:"STRUCTURAL_QA",negative:"DOUBLE_SWEEP"},
 {id:"CRT_INSIDE_CONTINUATION",kind:"REJECTION",negative:"FORBIDDEN_ENTRY"},
 {id:"CRT_MULTICANDLE",kind:"STRUCTURAL_QA",negative:"INVALID_H4_CHAIN"},
 {id:"CRT_M15_RETEST",kind:"CONFIRMATION_QA",negative:"BEFORE_MSS"}
].map(x=>Object.freeze(x)));
const SHA256=/^[a-f0-9]{64}$/;
const safe=x=>Number.isSafeInteger(x)&&x>=0;
const close=(s,more={})=>Object.freeze({status:s,certified:false,
 actionable:false,sendPush:false,...more});
function validControl(x,row,role){
 if(!x||!row||x.category!==role.id||
    !["POSITIVE","NEGATIVE"].includes(x.controlType)||
    x.slot!==row.slot||x.instrumentId!==row.symbol||
    x.provider!==row.provider||x.sourcePhaseMin!==row.sourcePhaseMin||
    !SHA256.test(x.candleSha256)||x.candleSha256!==row.candleSha256||
    !safe(x.eventAtMs)||x.eventAtMs%300000!==row.sourcePhaseMin*60000||
    x.actionable!==false||x.sendPush!==false||
    typeof x.labEvidenceId!=="string"||!x.labEvidenceId.trim()||
    typeof x.pineEvidenceId!=="string"||!x.pineEvidenceId.trim()||
    x.labEvidenceId===x.pineEvidenceId)
  return false;
 if(x.controlType==="POSITIVE"){
  if(x.pineObserved!==true||x.labObserved!==true||
     x.negativeReason!==undefined)
   return false;
 } else if(x.pineObserved!==false||x.labObserved!==false||
           x.negativeReason!==role.negative)return false;
 if(role.id==="CRT_MULTICANDLE"){
  if(x.controlType==="POSITIVE"&&!["MULTI4","MULTI_N"].includes(x.variant))
   return false;
  if(x.controlType==="NEGATIVE"&&x.variant!==undefined)return false;
 }else if(x.variant!==undefined)return false;
 if(role.id==="CRT_M15_RETEST"&&x.controlType==="POSITIVE"){
  const m=x.mss15;
  if(!m||m.timeframe!=="M15"||m.provider!==x.provider||
     m.instrumentId!==x.instrumentId||
     ![m.pivotAtMs,m.sweepAtMs,m.breakAtMs,m.retestAtMs]
       .every(safe)||
     !(m.pivotAtMs<m.sweepAtMs&&m.sweepAtMs<m.breakAtMs&&
       m.breakAtMs<m.retestAtMs&&m.retestAtMs===x.eventAtMs)||
     m.breakAtMs%900000!==x.sourcePhaseMin*60000||
     m.retestAtMs%900000!==x.sourcePhaseMin*60000)
    return false;
 }
 return true;
}
// This gate only checks the completeness and internal consistency of
// non-actionable REPLAY evidence. It has no authenticated TradingView
// browser or independently attested archived data source.
export function assessSevenCrtReadiness({eventAudit,controlCases=[]}={}){
 if(!Array.isArray(controlCases))throw Error("CONTROL_CASES_MUST_BE_ARRAY");
 const roles=Object.freeze(Object.keys(CATEGORY_BITS));
 const rows=eventAudit?.results??[];
 if(!Array.isArray(rows))throw Error("INVALID_EVENT_AUDIT");
 const bySlot=new Map();
 for(const x of rows){
  if(!safe(x?.slot)||x.slot<1||x.slot>34||bySlot.has(x.slot))
   throw Error("INVALID_DUPLICATE_34_SLOT");
  bySlot.set(x.slot,x);
 }
 const auditComplete=eventAudit?.comparedSlots===34&&
   eventAudit?.matchedSlots===34&&rows.length===34&&
   rows.every(x=>["EVENT_TRACE_MATCH_UNCERTIFIED",
                      "NO_EVENTS_TO_COMPARE"].includes(x.status));
 const ids=new Set();
 const valid=[];
 let invalid=0;
 for(const control of controlCases){
  if(typeof control?.controlId!=="string"||!control.controlId.trim()||
     ids.has(control.controlId))throw Error("DUPLICATE_OR_MISSING_CONTROL_ID");
  ids.add(control.controlId);
  const role=SEVEN_CRT_ROLES.find(r=>r.id===control.category);
  if(!role||!validControl(control,bySlot.get(control.slot),role)){
   invalid++;continue;
  }
  valid.push(control);
 }
 const familyResults=SEVEN_CRT_ROLES.map(role=>{
  const roleCases=valid.filter(x=>x.category===role.id);
  const positive=roleCases.filter(x=>x.controlType==="POSITIVE");
  const negative=roleCases.filter(x=>x.controlType==="NEGATIVE");
  const observed=eventAudit?.coveredCategories?.includes(role.id)===true;
  const variants=role.id==="CRT_MULTICANDLE"?
    ["MULTI4","MULTI_N"].filter(v=>positive.some(x=>x.variant===v)):[];
  const missing=[];
  if(!auditComplete)missing.push("34_SOURCE_EVENT_PARITY");
  if(!observed)missing.push("POSITIVE_CATEGORY_EVENT_IN_MATCHED_34");
  if(!positive.length)missing.push("INDEPENDENT_POSITIVE_CONTROL");
  if(!negative.length)missing.push("INDEPENDENT_NEGATIVE_CONTROL");
  if(role.id==="CRT_MULTICANDLE"&&variants.length!==2)
   missing.push("MULTI4_AND_MULTI_N_POSITIVE_CONTROLS");
  return close(missing.length?"CONTROL_COVERAGE_INCOMPLETE":
     "OFFLINE_CASE_COVERED_EXTERNAL_CERTIFICATION_PENDING",{
    category:role.id,role:role.kind,
    distinctPositiveControls:positive.length,distinctNegativeControls:negative.length,
    multiVariantsCovered:variants,missing:Object.freeze(missing),
    realPineExecutionVerified:false,holdoutVerified:false,
    independentSameFeedOHLCVerified:false
  });
 });
 const covered=familyResults.filter(x=>x.missing.length===0).length;
 return close(!auditComplete?"34_EVENT_PARITY_NOT_READY":
  invalid>0?"INVALID_CONTROL_EVIDENCE":
  covered===roles.length?"SEVEN_OFFLINE_ROLE_CONTROLS_COMPLETE_NEEDS_EXTERNAL_CERTIFICATION":
   "SEVEN_ROLE_CONTROLS_INCOMPLETE",{
   scopeFeeds:34,roleCount:7,readyForExternalReview:covered,
   invalidControlCases:invalid,caseCount:valid.length,
   categoryReports:Object.freeze(familyResults),
   independentPineCompilerVerified:false,
   independentProviderOHLCVerified:false,
   noRepaintHoldoutVerified:false,androidPushE2eVerified:false,
   rolesAreNotSevenTradingStrategies:true,
   note:"Synthetic and user-declared evidence can pass the OFFLINE matrix but cannot certify real TradingView compilation, independent replay, holdout or real alerts."
  });
}
