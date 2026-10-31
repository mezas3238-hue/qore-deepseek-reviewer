import {C1_HOURS} from "./ny-clock.mjs";
// Closed-bar, standalone preliminary CRT H4 structural evaluator.
// Not an actionable alert: MSS M15 and equivalence with Pine remain pending.
const result=(state,direction=0,extra={})=>Object.freeze({state,direction,actionable:false,...extra});
function validBar(b){
  return !!b && b.timeframe==="H4" &&
    Number.isSafeInteger(b.openedAt)&&Number.isSafeInteger(b.closedAt)&&
    b.closedAt-b.openedAt===14400000 &&
    [b.open,b.high,b.low,b.close].every(n=>typeof n==="number"&&Number.isFinite(n))&&
    b.high>=Math.max(b.open,b.close,b.low)&&
    b.low<=Math.min(b.open,b.close,b.high)&&Number.isInteger(b.nyHour);
}
const same=(x,y)=>x.provider===y.provider&&x.instrumentId===y.instrumentId;
const consecutive=(x,y)=>x.closedAt===y.openedAt &&
  y.nyHour===(x.nyHour+4)%24;
// Requires output from aggregateClosedM5 and an authorized FX/index timetable.
// A single boundary touch does NOT constitute a strict sweep.
// C3 invalidates only on its CLOSED H4 candle, not an M5 wick.
export function inspectCrtH4({c1,c2,c3=null,family}){
  if(!C1_HOURS[family])return result("UNSUPPORTED_FAMILY");
  if(!validBar(c1)||!validBar(c2))return result("INCOMPLETE_H4");
  if(!same(c1,c2)||!C1_HOURS[family].includes(c1.nyHour)||
     c1.allowedC1!==true||!consecutive(c1,c2))
    return result("INVALID_CYCLE");
  const lowSweep=c2.low<c1.low,highSweep=c2.high>c1.high;
  if(lowSweep&&highSweep)return result("DOUBLE_STRICT_SWEEP");
  if(!lowSweep&&!highSweep)return result("NO_STRICT_SWEEP");
  const direction=lowSweep?1:-1;
  if(c2.close<c1.low||c2.close>c1.high)
    return result("C2_CLOSE_OUTSIDE_C1",direction);
  const base={provider:c1.provider,instrumentId:c1.instrumentId,
    c1Start:c1.openedAt,c2Start:c2.openedAt,direction};
  if(c3===null)return result("C2_RATIFIED_AWAITING_C3",direction,base);
  if(!validBar(c3)||!same(c2,c3)||!consecutive(c2,c3))
    return result("INVALID_C3_SEQUENCE",direction,base);
  const invalid=direction===1 ? c3.close<c2.low : c3.close>c2.high;
  return result(invalid?"C3_INVALIDATED":"C3_NOT_INVALIDATED",direction,base);
}
