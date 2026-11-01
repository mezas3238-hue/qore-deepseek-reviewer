// CRT entry-family classification for OFFLINE REPLAY only.
// "All CRT models" has no standardized finite taxonomy. This catalog
// recognizes documented families, never upgrades a non-3C H4 setup
// into a confirmed entry under the Owner's required CRT H4 + MSS M15.
// No external notification, trading, risk, or production action.
const make=(id,state,extra={})=>Object.freeze({
 id,state,environment:"OFFLINE_REPLAY",actionable:false,sendPush:false,
 certified:false,...extra
});
export const CRT_MODEL_FAMILIES=Object.freeze([
 Object.freeze({id:"CRT_3C_REVERSAL",name:"Reversion CRT H4 C1/C2/C3",entryEligible:true}),
 Object.freeze({id:"CRT_2C_CANDIDATE",name:"Barrida C2 y retorno; C3 pendiente",entryEligible:false}),
 Object.freeze({id:"CRT_2C_EXPANSION",name:"C2 rompe y cierra fuera C1",entryEligible:false}),
 Object.freeze({id:"CRT_INSIDE_RETURN",name:"Inside Bar y retorno",entryEligible:false}),
 Object.freeze({id:"CRT_INSIDE_CONTINUATION",name:"Inside Bar y continuacion",entryEligible:false}),
 Object.freeze({id:"CRT_MULTICANDLE",name:"Manipulacion en varias H4",entryEligible:false}),
 Object.freeze({id:"CRT_M15_RETEST",name:"Retest posterior al MSS M15",entryEligible:false})
]);
const RATIFIED=new Set(["C2_RATIFIED_AWAITING_C3","C3_NOT_INVALIDATED"]);
const M15=new Set(["MSS_CONFIRMED_C2","MSS_CONFIRMED_C3"]);
const diag=(id,status,reason)=>make(id,status,{reason});
function compatible({crt,mssM15,confluence}){
 if(confluence?.state!=="REPLAY_CRT_M15_CONFLUENCE"||
    !M15.has(mssM15?.state)||
    !Number.isSafeInteger(mssM15.mssAt)||
    !Number.isSafeInteger(mssM15.pivotAt)||
    !Number.isSafeInteger(mssM15.sweepAt)||
    mssM15.pivotAt>=mssM15.sweepAt||
    mssM15.mssAt<=mssM15.sweepAt||
    mssM15.mssAt%900000!==0||
    !Number.isSafeInteger(crt?.c1Start)||
    !Number.isSafeInteger(crt?.c2Start)||
    mssM15.cycleId!==[crt.provider,crt.instrumentId,crt.c1Start,crt.direction].join("|")||
    mssM15.direction!==crt.direction||
    confluence.cycleId!==mssM15.cycleId||
    confluence.mssM15At!==mssM15.mssAt)return false;
 return true;
}
export function classifyCrtEntryModels({crt,mssM15,confluence,
  insideBar=null,multicandle=null,retestM15=null,liquidity=null,fvg=null}={}){
 const primary=(()=> {
  if(!crt || typeof crt!=="object")
   return diag("NONE","NO_DATA","C1/C2/C3 no disponibles");
  if(crt.state==="C3_INVALIDATED")
   return diag("CRT_3C_REVERSAL","INVALIDATED","Cierre C3 mas alla de mecha C2");
  if(crt.state==="DOUBLE_STRICT_SWEEP")
   return diag("CRT_2C_CANDIDATE","REJECTED","Barrida doble C2 no permitida");
  if(crt.state==="C2_CLOSE_OUTSIDE_C1")
   return diag("CRT_2C_EXPANSION","DIAGNOSTIC_ONLY","C2 cerro fuera C1; no CRT valido");
  if(crt.state==="NO_STRICT_SWEEP")
   return diag("CRT_2C_CANDIDATE","REJECTED","C2 no barrio estrictamente C1");
  if(!RATIFIED.has(crt.state))
   return diag("NONE","REJECTED",crt.state);
  if(!compatible({crt,mssM15,confluence})){
   return make("CRT_3C_REVERSAL", "AWAITING_MSS_M15",{
    direction:crt.direction,c1Start:crt.c1Start,
    c2Start:crt.c2Start,stage:"C2_RATIFIED",
    reason:"M15 no confirmado con el mismo ciclo, pivot y cierre"
   });
  }
  const stage=mssM15.state==="MSS_CONFIRMED_C2"?"C2":"C3";
  return make("CRT_3C_REVERSAL", "QA_CONFIRMED_M15",{
   direction:crt.direction,c1Start:crt.c1Start,c2Start:crt.c2Start,
   stage,mssM15At:mssM15.mssAt,
   eligibleAfter:Math.max(mssM15.mssAt,crt.c2Start+14400000),
   reason:"3 velas H4 ratificadas + MSS M15 propio cerrado; pendiente paridad Pine real"
  });
 })();
 // Strictly non-actionable auxiliary families. These require independent
 // H4 history and/or LTF evidence before they could ever be proposed
 // as additional Owner-approved operational strategies.
 const auxiliaries=[];
 if(crt?.state==="C2_RATIFIED_AWAITING_C3")
  auxiliaries.push(diag("CRT_2C_CANDIDATE","AWAITING_C3","C2 cerrada; tres H4 obligatorias"));
 if(insideBar?.state){
  const id=insideBar.state==="RATIFIED"?"CRT_INSIDE_RETURN":
    insideBar.state==="CONTINUATION"?"CRT_INSIDE_CONTINUATION":"CRT_INSIDE_RETURN";
  auxiliaries.push(diag(id,"DIAGNOSTIC_ONLY","Inside Bar aislado sin certificacion de entrada"));
 }
 if(multicandle?.state)
  auxiliaries.push(diag("CRT_MULTICANDLE","DIAGNOSTIC_ONLY",
   "Multiples H4 no cumplen las tres H4 consecutivas autorizadas"));
 if(retestM15?.state)
  auxiliaries.push(diag("CRT_M15_RETEST","DIAGNOSTIC_ONLY",
   "Retest requiere evidencia de velas M15 propias posterior al MSS"));
 // Context markers must not upgrade a rejected or pending primary.
 const contexts=[];
 if(liquidity?.sameProvider===true&&
    liquidity.sameC2SweepAt===true&&
    ["PDH","PDL"].includes(liquidity.swept))
  contexts.push("PD"+(liquidity.swept==="PDH"?"H":"L")+"_SAME_SWEEP");
 if(fvg?.sameProvider===true&&fvg.confirmedAfterSweep===true&&
    ["H1","H4"].includes(fvg.timeframe))
  contexts.push("FVG_"+fvg.timeframe+"_CONTEXT");
 return Object.freeze({
  primary,auxiliaries:Object.freeze(auxiliaries),
  contexts:Object.freeze(contexts),
  familyCount:CRT_MODEL_FAMILIES.length,
  entryCondition:"CRT_H4_3C_AND_CONFIRMED_CLOSED_M15",
  environment:"OFFLINE_REPLAY",actionable:false,sendPush:false,
  certification:"NOT_CERTIFIED"
 });
}
