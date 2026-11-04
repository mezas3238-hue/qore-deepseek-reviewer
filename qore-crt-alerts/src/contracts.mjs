export const M5_MS=300000;
const fin=n=>typeof n==="number"&&Number.isFinite(n);
const label=s=>typeof s==="string"&&/^[A-Za-z0-9_.:-]{1,80}$/.test(s);
// Provider candles may begin at :01/:02/:03/:04 (one whole minute phase).
// Do NOT round/shift them to :00. Each audit enforces one immutable phase
// per provider and 48 actual consecutive M5 to form an eligible H4.
export function validateClosedM5(x){
  if(!x||typeof x!=="object"||Array.isArray(x))throw Error("invalid M5 payload");
  const {provider,instrumentId,openedAt,closedAt,open,high,low,close}=x;
  if(!label(provider)||!label(instrumentId))throw Error("invalid provider/instrument");
  if(!Number.isSafeInteger(openedAt)||!Number.isSafeInteger(closedAt)||
      openedAt<0||openedAt%60000!==0||closedAt-openedAt!==M5_MS)
    throw Error("invalid M5 UTC timestamps or duration");
  if(![open,high,low,close].every(fin)||high<Math.max(open,close,low)||
     low>Math.min(open,close,high))throw Error("invalid M5 OHLC");
  return Object.freeze({provider,instrumentId,openedAt,closedAt,open,high,low,close});
}
export function deduplicateM5(items){
  const seen=new Map();
  for(const raw of items){
    const x=validateClosedM5(raw),key=x.provider+"|"+x.instrumentId+"|"+x.openedAt;
    if(seen.has(key)&&JSON.stringify(seen.get(key))!==JSON.stringify(x))
      throw Error("conflicting replay for "+key);
    seen.set(key,x);
  }
  return [...seen.values()].sort((a,b)=>a.openedAt-b.openedAt);
}
