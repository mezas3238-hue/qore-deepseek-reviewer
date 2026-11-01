import {validateClosedM5,M5_MS} from "./contracts.mjs";
import {instrumentById} from "./instruments.mjs";

// The source adapter accepts only a configured feed mapping for ONE listed
// ticker and stays OFFLINE_REPLAY. This is not a network subscriber.
const str=x=>typeof x==="string"&&/^[A-Za-z0-9_.:-]{1,80}$/.test(x);
const validInt=x=>Number.isSafeInteger(x)&&x>=0;
const outcome=(state,extra={})=>Object.freeze({state,actionable:false,sendPush:false,...extra});
export class ClosedM5Ingestion{
  #provider;#instrumentId;#feedSymbol;#family;#lag;#limit;
  #bars=new Map();#lastEnd=null;#held=false;
  constructor({provider,instrumentId,feedSymbol,
    mode="OFFLINE_REPLAY",finalityLagMs=0,maxBars=4096}){
    const instrument=instrumentById(instrumentId);
    if(mode!=="OFFLINE_REPLAY")throw Error("live feed ingestion is forbidden until certification");
    if(!instrument||!["forex","index","crypto"].includes(instrument.family))
      throw Error("instrument unsupported/unmapped family");
    if(!str(provider)||!str(feedSymbol)||feedSymbol===instrument.tvSymbol)
      throw Error("explicit provider/native feed mapping required; TV id not backend API");
    if(!validInt(finalityLagMs)||finalityLagMs>M5_MS||
       !Number.isSafeInteger(maxBars)||maxBars<48||maxBars>50000)
      throw Error("invalid ingestion finality or capacity");
    this.#provider=provider;this.#instrumentId=instrumentId;
    this.#feedSymbol=feedSymbol;this.#family=instrument.family;
    this.#lag=finalityLagMs;this.#limit=maxBars;
  }
  ingest(raw,{receivedAt}={}){
    if(this.#held)return outcome("HELD_REQUIRES_MANUAL_RECONCILIATION");
    if(!validInt(receivedAt))throw Error("receivedAt must be UTC epoch ms");
    const bar=validateClosedM5(raw);
    if(bar.provider!==this.#provider||bar.instrumentId!==this.#instrumentId||
       raw.feedSymbol!==this.#feedSymbol)
      return outcome("SOURCE_MAPPING_REJECTED");
    if(bar.closedAt>receivedAt-this.#lag)
      return outcome("CANDLE_NOT_FINAL",{closedAt:bar.closedAt});
    const prior=this.#bars.get(bar.openedAt);
    if(prior){
      if(JSON.stringify(prior)===JSON.stringify(bar))
        return outcome("DUPLICATE_IGNORED",{closedAt:bar.closedAt});
      this.#held=true;
      return outcome("CONFLICT_HELD",{openedAt:bar.openedAt});
    }
    if(this.#lastEnd!==null&&bar.openedAt<this.#lastEnd)
      return outcome("STALE_OR_REORDERED_HELD",{closedAt:bar.closedAt});
    if(this.#lastEnd!==null&&bar.openedAt!==this.#lastEnd){
      this.#held=true;
      return outcome("GAP_HELD_FOR_BACKFILL",
        {expectedOpenedAt:this.#lastEnd,actualOpenedAt:bar.openedAt});
    }
    if(this.#bars.size>=this.#limit){
      this.#held=true;
      return outcome("CAPACITY_HELD_FOR_RECONCILIATION",{maxBars:this.#limit});
    }
    this.#bars.set(bar.openedAt,bar);
    this.#lastEnd=bar.closedAt;
    return outcome("CLOSED_M5_ACCEPTED",{closedAt:bar.closedAt,stored:this.#bars.size});
  }
  snapshot(){
    return Object.freeze([...this.#bars.values()]);
  }
  health(){
    return outcome(this.#held?"HELD":"OFFLINE_REPLAY_ONLY",{
      provider:this.#provider,instrumentId:this.#instrumentId,
      family:this.#family,barCount:this.#bars.size,
      lastClosedAt:this.#lastEnd,feedMappingVerifiedForLive:false});
  }
}
