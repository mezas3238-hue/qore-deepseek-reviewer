const formatter=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",
  hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",
  hour:"2-digit",minute:"2-digit"});
export const C1_HOURS=Object.freeze({forex:[1,5,21],index:[2,6,22]});
export function nyParts(ms){
  if(!Number.isSafeInteger(ms)||ms<0)throw Error("invalid UTC milliseconds");
  const p=Object.fromEntries(formatter.formatToParts(new Date(ms))
    .filter(v=>v.type!=="literal").map(v=>[v.type,Number(v.value)]));
  return {year:p.year,month:p.month,day:p.day,hour:p.hour,minute:p.minute};
}
export function bucketNY(ms,tf,family){
  if(tf!=="H4"&&tf!=="M15")throw Error("unsupported timeframe");
  if(!C1_HOURS[family])throw Error("unsupported family");
  const p=nyParts(ms),origin=family==="forex"?1:2;
  let hour,minute,day=Date.UTC(p.year,p.month-1,p.day);
  if(tf==="H4"){
    hour=(origin+4*Math.floor(((p.hour-origin+24)%24)/4))%24;
    minute=0;
    if(p.hour<origin)day-=86400000;
  }else{hour=p.hour;minute=Math.floor(p.minute/15)*15;}
  const date=new Date(day).toISOString().slice(0,10);
  return {key:date+"T"+String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0"),
    date,hour,minute,allowedC1:tf==="H4"&&C1_HOURS[family].includes(hour),
    c2Hour:(hour+4)%24,c3Hour:(hour+8)%24};
}
