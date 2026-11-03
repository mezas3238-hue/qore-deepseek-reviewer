// No-live QA policy for CRT family overlaps.
// Keep all underlying family observations; select one preferred label
// only when BOTH event candidates have independently verified geometry,
// a frozen C1, a closed H4 and exactly the same provider and cycle.
// This module MUST NOT trigger or authorize any orders/FCM notifications.
const PRIORITY = Object.freeze({
  CRT_2C_RETURN: 0,
  CRT_3C_TRUE: 1,
  CRT_INSIDE_RETURN: 2,
  CRT_MULTI_N: 3,
  CRT_MULTI4: 4,
});
const integerMS=x=>Number.isSafeInteger(x) && x>0;
const string=x=>typeof x==="string" && x.length>0;
const valid=e=>e && string(e.source) && string(e.family) &&
  Object.hasOwn(PRIORITY,e.family) && integerMS(e.c1Start) &&
  integerMS(e.terminalCloseAt) && (e.direction===1 || e.direction===-1) &&
  e.geometryVerified===true && e.cycleVerified===true;
// event identity includes C1, terminal H4 close and direction; not
// merely date DD/MM or the 7 audit-bit mask. Broker is mandatory.
function id(e){return [e.source,e.c1Start,e.terminalCloseAt,e.direction].join("|");}
export function resolveCanonicalCRTFamiliesQA(observations){
  if(!Array.isArray(observations))throw new TypeError("observations must be an array");
  const groups=new Map(),pending=[];
  for(const observation of observations){
    const e=observation;
    if(!valid(e)){
      pending.push(Object.freeze({reason:"INSUFFICIENT_GEOMETRY_OR_CYCLE_EVIDENCE",
        observation:e,certified:false,pushEnabled:false}));
      continue;
    }
    const k=id(e);
    if(!groups.has(k))groups.set(k,[]);
    groups.get(k).push(e);
  }
  const candidates=Array.from(groups,([cycleKey,events])=>{
    const ordered=[...events].sort((a,b)=>PRIORITY[a.family]-PRIORITY[b.family]);
    return Object.freeze({
      cycleKey,
      canonicalFamily:ordered[0].family,
      observedFamilies:Object.freeze(ordered.map(e=>e.family)),
      observations:Object.freeze(ordered),
      overlap:ordered.length>1,
      certified:false,
      pushEnabled:false,
      actionable:false,
    });
  });
  return Object.freeze({
    candidates:Object.freeze(candidates),
    pending:Object.freeze(pending),
    finalVerdict:"QA_ONLY_SOURCE_AND_GEOMETRY_EVIDENCE_PENDING",
    certified:false,
    pushEnabled:false,
    actionable:false,
  });
}
