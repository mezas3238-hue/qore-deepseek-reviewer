import {M5_MS,deduplicateM5} from "./contracts.mjs";
import {bucketNY,nyParts} from "./ny-clock.mjs";
// Deliberately fail closed on missing bars, session gaps, or DST folds.
// Never synthesize a closed candle from an incomplete group.
export function aggregateClosedM5(input,{timeframe,family}){
  if(!["H4","M15"].includes(timeframe)||!["forex","index","crypto"].includes(family))
    throw Error("unsupported aggregate request");
  const bars=deduplicateM5(input);
  if(!bars.length)return {complete:[],rejected:[]};
  const {provider,instrumentId}=bars[0];
  if(bars.some(x=>x.provider!==provider||x.instrumentId!==instrumentId))
    throw Error("mixed provider/instrument");
  const map=new Map();
  for(const b of bars){
    const info=bucketNY(b.openedAt,timeframe,family);
    if(!map.has(info.key))map.set(info.key,{info,bars:[]});
    map.get(info.key).bars.push(b);
  }
  const complete=[],rejected=[],count=timeframe==="H4"?48:3;
  for(const {info,bars:group} of map.values()){
    group.sort((a,b)=>a.openedAt-b.openedAt);
    const first=group[0],last=group.at(-1),ny=nyParts(first.openedAt);
    const valid=group.length===count&&last.closedAt-first.openedAt===count*M5_MS&&
      ny.hour===info.hour&&ny.minute===info.minute&&
      group.every((x,i)=>i===0||group[i-1].closedAt===x.openedAt);
    if(!valid){
      rejected.push({key:info.key,observedM5:group.length,expectedM5:count,
        reason:"INCOMPLETE_OR_DST_AMBIGUOUS"});
      continue;
    }
    complete.push(Object.freeze({provider,instrumentId,timeframe,
      openedAt:first.openedAt,closedAt:last.closedAt,
      open:first.open,high:Math.max(...group.map(x=>x.high)),
      low:Math.min(...group.map(x=>x.low)),close:last.close,
      nyDate:info.date,nyHour:info.hour,allowedC1:info.allowedC1,key:info.key}));
  }
  complete.sort((a,b)=>a.openedAt-b.openedAt);
  return {complete,rejected};
}
