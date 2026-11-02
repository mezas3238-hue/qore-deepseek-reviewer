// Conservative model of Pine H4 diagnostics; not a market-data provider.
// One outcome per *closed, observed* H4 bucket. Zero-trade changes.
export const M5_MS=300000;
export const H4_MS=14400000;
export function classifyClosedH4({bucketStart,nextBucketStart,firstAt,lastEndAt,count,continuous}){
  if(![bucketStart,nextBucketStart,firstAt,lastEndAt,count].every(Number.isSafeInteger) ||
     typeof continuous!=="boolean"||count<1||nextBucketStart<=bucketStart)
    throw new TypeError("H4 closed-bucket metadata required");
  const full=continuous&&count===48&&firstAt===bucketStart&&lastEndAt===bucketStart+H4_MS;
  if(full) return Object.freeze({kind:"FULL",valid:true});
  const span=nextBucketStart-bucketStart;
  const exactDST=(span===H4_MS+3600000||span===H4_MS-3600000)&&
    continuous&&firstAt===bucketStart&&lastEndAt===nextBucketStart&&count*M5_MS===span;
  if(exactDST) return Object.freeze({kind:"DST_COMPLETE",valid:false});
  if(!continuous) return Object.freeze({kind:"INTERNAL_M5_GAP",valid:false});
  return Object.freeze({kind:"SESSION_OR_PARTIAL",valid:false});
}
