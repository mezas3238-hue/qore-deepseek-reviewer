// Independent C1–C2(setup, NO C1 sweep)–C3(C1 single-sided sweep) detector.
// This is the distinct 3-vela shape in the owner's Rowdy FX dossier.
// DO NOT confuse with the existing C1–C2(sweep)–C3(delivery) model.
// No live alerts, advice, orders, network, certification or signal promotion.
const H4=14_400_000, M5=300_000, M15=900_000;
const integer=x=>Number.isSafeInteger(x)&&x>0;
const closeInside=(p,lo,hi)=>p>lo&&p<hi;
const result=(state,details={})=>Object.freeze({
  state,model:"CRT_TRUE_3C_C3_SWEEP_QA",
  qaOnly:true,certified:false,actionable:false,sendPush:false,
  mssM5:"NOT_APPLICABLE",mssM15:"NOT_APPLICABLE",...details
});
const validH4=c=>c&&integer(c.startAt)&&integer(c.endAt)&&
  c.endAt-c.startAt===H4&&c.m5Count===48&&
  c.continuous===true&&[c.high,c.low,c.close].every(Number.isFinite)&&
  c.high>c.low&&c.close>=c.low&&c.close<=c.high;
const phaseOk=(t,period,phase)=>integer(t)&&
  Number.isInteger(phase)&&phase>=0&&phase<=4&&
  t%period===phase*60_000;
const sameProof=(p,cycleId,provider,instrumentId,direction,c1StartAt)=>
  p&&p.cycleId===cycleId&&p.provider===provider&&
  p.instrumentId===instrumentId&&p.direction===direction&&
  p.c1StartAt===c1StartAt;
const mss=(e,period,phase,cycleId,provider,instrumentId,direction,c1StartAt,sweepAt,c3End)=>
  sameProof(e,cycleId,provider,instrumentId,direction,c1StartAt)&&
  integer(e.pivotAt)&&integer(e.breakAt)&&
  e.pivotAt<sweepAt&&e.breakAt>sweepAt&&e.breakAt<=c3End&&
  phaseOk(e.breakAt,period,phase)&&
  (period===M5||integer(e.lastClosedAt)&&e.breakAt<=e.lastClosedAt);

// A visual pivot line alone is not an MSS. sweepAt and breakAt must be
// witnessed in closed M5/M15 data and bind to this SAME C1 / source.
export function inspectTrue3cRowdyQa({
  provider,instrumentId,h4,m5Evidence,m15Evidence,
  sweepAt,sourcePhaseMin
}={}){
  if(typeof provider!=="string"||!provider||
     typeof instrumentId!=="string"||!instrumentId)
    throw Error("SOURCE_REQUIRED");
  if(!Array.isArray(h4)||h4.length!==3)
    return result("NEED_EXACTLY_THREE_CLOSED_H4");
  const [c1,c2,c3]=h4;
  if(!h4.every(validH4))return result("CLOSED_H4_OR_48_M5_REQUIRED");
  if(c1.endAt!==c2.startAt||c2.endAt!==c3.startAt)
    return result("NOT_CONSECUTIVE");
  if(!closeInside(c2.close,c1.low,c1.high)||
     c2.low<c1.low||c2.high>c1.high)
    return result("C2_MUST_BE_SETUP_NO_SWEEP");
  const sweptLow=c3.low<c1.low,sweptHigh=c3.high>c1.high;
  if(sweptLow&&sweptHigh)return result("REJECT_DOUBLE_SWEEP");
  if(!sweptLow&&!sweptHigh){
    const c2LevelSweep=c3.low<c2.low||c3.high>c2.high;
    return result(c2LevelSweep?"INSIDE_C2_SWEEP_ONLY":"NO_C3_C1_SWEEP");
  }
  if(!closeInside(c3.close,c1.low,c1.high))
    return result("REJECT_C3_CLOSE_OUTSIDE_C1");
  const direction=sweptLow?1:-1;
  const cycleId=[provider,instrumentId,c1.startAt,direction,"TRUE3C"].join("|");
  const trueInsideC2=c2.high<c1.high&&c2.low>c1.low;
  const metadata={
    provider,instrumentId,cycleId,direction,
    c1StartAt:c1.startAt,c2StartAt:c2.startAt,c3StartAt:c3.startAt,
    c3ClosedAt:c3.endAt,strictInsideC2:trueInsideC2,
    sweepSide:sweptLow?"C1_LOW":"C1_HIGH",
    // If strictly Inside too, disambiguation is based on the
    // raided reference level: swept C1, not merely C2.
    priority:"C3_SWEEP_C1_BEFORE_INSIDE_C2"
  };
  if(!integer(sweepAt)||sweepAt<=c3.startAt||
     sweepAt>c3.endAt||!phaseOk(sweepAt,M5,sourcePhaseMin))
    return result("TRUE_3C_STRUCTURE_MSS_UNVERIFIED",{
      ...metadata,mssM5:"UNVERIFIED",mssM15:"UNVERIFIED"
    });
  const m5Ok=mss(m5Evidence,M5,sourcePhaseMin,cycleId,
    provider,instrumentId,direction,c1.startAt,sweepAt,c3.endAt);
  const m15Ok=mss(m15Evidence,M15,sourcePhaseMin,cycleId,
    provider,instrumentId,direction,c1.startAt,sweepAt,c3.endAt);
  return result("TRUE_3C_STRUCTURE_CLOSED_QA",{
    ...metadata,sweepAt,mssM5:m5Ok?"QA_CONFIRMED":"QA_PENDING",
    mssM15:m15Ok?"QA_CONFIRMED":"QA_PENDING"
  });
}
