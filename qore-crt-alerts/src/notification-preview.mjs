// Shared wire-contract preview. This does NOT use firebase-admin, HTTP,
// credentials, device tokens or remote messaging. OFFLINE_REPLAY only.
const isHex=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
export function createBlockedAndroidPreview(observation){
  if(!observation||observation.status!=="QUARANTINED_REPLAY"||
     observation.deliveryState!=="BLOCKED_NOT_CERTIFIED"||
     observation.sendPush!==false||observation.actionable!==false||
     !isHex(observation.ohlcSha256))
    throw Error("only blocked replay observations may be previewed");
  const fields=observation.eventKey?.split("|");
  if(!fields||fields.length!==6||fields[0]!==observation.provider||
     fields[1]!==observation.instrumentId||
     fields[2]!==String(observation.c1StartMs)||
     fields[4]!=="MSS_M15"||fields[5]!==String(observation.mssM15AtMs)||
     !["1","-1"].includes(fields[3]))
    throw Error("invalid event cycle identity");
  const direction=fields[3]==="1"?"BULLISH":"BEARISH";
  return Object.freeze({
    environment:"OFFLINE_REPLAY",transport:"DISABLED",
    certification:"NOT_VERIFIED",deliverable:false,sendPush:false,
    data:Object.freeze({
      schema:"QORE_CRT_STAGING_V1",
      mode:"OFFLINE_REPLAY",
      certified:"false",
      timeframe:"M15",
      kind:"CRT_MSS",
      eventId:observation.eventKey,
      instrumentId:observation.instrumentId,
      direction,
      ohlcSha256:observation.ohlcSha256,
      mssAtMs:String(observation.mssM15AtMs)
    })
  });
}
