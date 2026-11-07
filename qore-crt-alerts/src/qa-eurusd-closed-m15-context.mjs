// Pure QA M15 context built from THREE independently closed, consecutive
// cTrader DEMO M5 candles. Never reuse M5 MSS as an M15 MSS signal.
// This is a derived M15 series, NOT a native independent cTrader M15 feed.
// No orders, no push, no live source, no CRT/MSS certification.
const M5_MS=300000,M15_MS=900000;
const finite=x=>typeof x==="number"&&Number.isFinite(x)&&x>0;
const freeze=Object.freeze;
const valid=x=>x?.source==="CTRADER_OPEN_API_DEMO"&&
  x.provider==="IC"&&x.instrumentId==="EURUSD"&&
  x.brokerSymbol==="EURUSD"&&x.symbolId===1&&
  x.certified===false&&x.actionable===false&&
  x.sendPush===false&&Number.isSafeInteger(x.openedAt)&&
  x.openedAt>0&&x.openedAt%M5_MS===0&&
  x.closedAt===x.openedAt+M5_MS&&
  [x.open,x.high,x.low,x.close].every(finite)&&
  x.low<=Math.min(x.open,x.close)&&
  x.high>=Math.max(x.open,x.close);

export function deriveClosedEurusdM15Context(candles=[]){
  if(!Array.isArray(candles)||candles.length<3||candles.length>1500)
    throw Error("CTRADER_QA_M15_BOUNDED_CLOSED_M5_REQUIRED");
  const groups=new Map();let last=null;
  for(const x of candles){
    if(!valid(x))throw Error("CTRADER_QA_M15_INVALID_SOURCE_OR_UNCLOSED_M5");
    if(last!==null&&x.openedAt<=last)
      throw Error("CTRADER_QA_M15_DUPLICATE_OR_OUT_OF_ORDER");
    last=x.openedAt;
    const start=x.openedAt-(x.openedAt%M15_MS);
    if(!groups.has(start))groups.set(start,[]);
    groups.get(start).push(x);
  }
  const bars=[];let partial=0,rejected=0;
  for(const [start,three] of groups){
    const exact=three.length===3&&three.every((x,i)=>
      x.openedAt===start+i*M5_MS);
    if(!exact){
      const contiguous=three.every((x,i)=>i===0||
        x.openedAt===three[i-1].openedAt+M5_MS);
      if(three.length<3&&contiguous)partial++;
      else rejected++;
      continue;
    }
    bars.push(freeze({
      source:"CTRADER_OPEN_API_DEMO_DERIVED_M15",
      provider:"IC",instrumentId:"EURUSD",brokerSymbol:"EURUSD",
      symbolId:1,timeframe:"M15",
      openedAt:start,closedAt:start+M15_MS,
      open:three[0].open,high:Math.max(...three.map(x=>x.high)),
      low:Math.min(...three.map(x=>x.low)),close:three[2].close,
      sourceM5Count:3,certified:false,actionable:false,sendPush:false,
      mss15Certified:false,crtFamiliesCertified:false
    }));
  }
  const output=freeze(bars);
  return freeze({
    state:"EURUSD_M15_DERIVED_CONTEXT_QA_UNCERTIFIED",
    sourceTimeframe:"M5",derivedTimeframe:"M15",
    m5ClosedInputs:candles.length,
    completeM15:output.length,partialM15:partial,rejectedM15:rejected,
    bars:output,
    nativeBrokerM15Compared:false,
    mssM5Certified:false,mssM15Certified:false,
    crtFamiliesCertified:false,sourceParityCertified:false,
    canTrade:false,sendPush:false
  });
}
