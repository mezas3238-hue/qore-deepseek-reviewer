import {M5_MS,deduplicateM5} from "./contracts.mjs";
import {nyParts} from "./ny-clock.mjs";
const atMidnightUtc=({year,month,day})=>{
  const base=Date.UTC(year,month-1,day);
  const matches=[4,5].map(h=>base+h*3600000).filter(ms=>{
    const x=nyParts(ms);
    return x.year===year&&x.month===month&&x.day===day&&
      x.hour===0&&x.minute===0;
  });
  if(matches.length!==1)throw Error("NY_MIDNIGHT_AMBIGUOUS");
  return matches[0];
};
const dayText=x=>[x.year,String(x.month).padStart(2,"0"),String(x.day).padStart(2,"0")].join("-");
const nextCalendarDay=({year,month,day})=>{
  const t=new Date(Date.UTC(year,month-1,day+1));
  return {year:t.getUTCFullYear(),month:t.getUTCMonth()+1,day:t.getUTCDate()};
};

// Offline BTC PDH/PDL mirror of Pine v34.10e: previous COMPLETED
// New York civil day (00:00 to 00:00), including Saturdays, Sundays and
// DST 23/25 hour days. Never a market signal, FCM sender or order.
export function auditBtcNyDailyLiquidity(candlesM5){
  const bars=deduplicateM5(candlesM5);
  if(bars.some(b=>b.instrumentId!=="BTCUSD")||
     bars.some(b=>b.provider!==bars[0].provider))
    throw Error("BTC_PDH_FEED_PROVENANCE_MISMATCH");
  const groups=new Map();
  for(const b of bars){
    const parts=nyParts(b.openedAt),id=dayText(parts);
    if(!groups.has(id))groups.set(id,{id,parts,bars:[]});
    groups.get(id).bars.push(b);
  }
  const days=[];
  for(const g of groups.values()){
    const startMs=atMidnightUtc(g.parts),
      endMs=atMidnightUtc(nextCalendarDay(g.parts));
    const expectedM5=(endMs-startMs)/M5_MS;
    if(![276,288,300].includes(expectedM5))
      throw Error("NY_CIVIL_DAY_DURATION_UNEXPECTED");
    const bs=g.bars;
    const complete=bs.length===expectedM5&&bs[0].openedAt===startMs&&
      bs.at(-1).closedAt===endMs&&bs.every((b,i)=>
        b.openedAt===startMs+i*M5_MS&&b.closedAt===b.openedAt+M5_MS);
    days.push(Object.freeze({
      date:g.id,startMs,endMs,expectedM5,observedM5:bs.length,
      complete,
      pdh:complete?Math.max(...bs.map(b=>b.high)):null,
      pdl:complete?Math.min(...bs.map(b=>b.low)):null,
      bars:Object.freeze(bs)
    }));
  }
  const records=days.map((d,i)=>{
    const prior=days[i-1];
    const eligible=prior?.complete===true&&prior.endMs===d.startMs;
    const intraday=d.bars;
    const sweptPdh=eligible&&intraday.some(b=>b.high>prior.pdh);
    const sweptPdl=eligible&&intraday.some(b=>b.low<prior.pdl);
    return Object.freeze({
      date:d.date,startMs:d.startMs,endMs:d.endMs,
      complete:d.complete,expectedM5:d.expectedM5,observedM5:d.observedM5,
      pdhReferenceAt:eligible?prior.endMs:null,
      pdhLevel:eligible?prior.pdh:null,
      pdlLevel:eligible?prior.pdl:null,
      pdhStatus:eligible?(sweptPdh?"TAKEN":"INTACTO"):"N/D",
      pdlStatus:eligible?(sweptPdl?"TAKEN":"INTACTO"):"N/D",
      firstPdhSweepAt:eligible?(intraday.find(b=>b.high>prior.pdh)?.closedAt??null):null,
      firstPdlSweepAt:eligible?(intraday.find(b=>b.low<prior.pdl)?.closedAt??null):null,
      actionable:false,sendPush:false
    });
  });
  return Object.freeze({source:"BTC_M5_OFFLINE_NY_CIVIL_DAY",
    timezone:"America/New_York",daySession:"0000-0000:1234567",
    family:"crypto",actionable:false,sendPush:false,
    records:Object.freeze(records)});
}
