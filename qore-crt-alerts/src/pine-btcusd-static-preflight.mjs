import {createHash} from "node:crypto";
import {PINE_QA_BLOB_SHA,PINE_DATA_WINDOW_LABELS}
 from "./parity-audit.mjs";

const shaBlob=source=>createHash("sha1").update(
  "blob "+Buffer.byteLength(source,"utf8")+"\0"+source
).digest("hex");

export function preflightBtcPineSource(pineSource){
  if(typeof pineSource!=="string"||pineSource.length<100)
    throw Error("PINE_SOURCE_REQUIRED");
  const checks=Object.freeze({
    exactQaCandidateSha:shaBlob(pineSource)===PINE_QA_BLOB_SHA,
    pineV6:/^\/\/@version=6(?:\r?\n)/.test(pineSource),
    btc34Slot:/s08\s*=\s*input\.symbol\("IC:BTCUSD",\s*"BTCUSD"/.test(pineSource),
    timezoneNY:/string\s+TZ\s*=\s*"America\/New_York"/.test(pineSource),
    indexClassifier:/f_index\(\)\s*=>/.test(pineSource)&&
      /syminfo\.type\s*==\s*"index"/.test(pineSource),
    forexC1Hours:/hh\s*==\s*1\s+or\s+hh\s*==\s*5\s+or\s+hh\s*==\s*21/.test(pineSource),
    forexH4Bucket:/time\("240",\s*"0100-0100:1234567",\s*TZ\)\[1\]/.test(pineSource),
    closedM5Source:/request\.security\(syminfo\.tickerid,\s*"5",\s*f_engine\(\),\s*lookahead=barmerge\.lookahead_off/.test(pineSource),
    closedM5IndicatorData:/int\s+bucketH4\s*=\s*isIndex\s*\?/.test(pineSource)&&
      /barT/.test(pineSource),
    qaAlertsDisabledByDefault:/useAlerts\s*=\s*input\.bool\(false/.test(pineSource),
    everyParityAuditPlot:Object.values(PINE_DATA_WINDOW_LABELS).every(label=>
      pineSource.includes('title="'+label+'"'))
  });
  return Object.freeze({
    instrumentId:"BTCUSD",
    chartInputDefault:"IC:BTCUSD",
    suggestedSameSourceQaChart:"COINBASE:BTCUSD",
    sourceSha:shaBlob(pineSource),
    sourceShaMatchesAudit:checks.exactQaCandidateSha,
    checks,
    staticSourceOk:Object.values(checks).every(Boolean),
    indicatorCompiledOnTradingView:false,
    livePineParityVerified:false,
    certification:"NOT_CERTIFIED",
    actionable:false,
    sendPush:false,
    note:"Text-only Pine source inspection. TradingView compiler/runtime not invoked."
  });
}
