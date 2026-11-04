// Full first-slice pipeline: identical-provider closed M5 -> CRT/MSS
// deterministic offline replay -> independent 4-hour QA inbox events.
// Does NOT read actual IC Markets, create public HTTP endpoints or send FCM.
import {replayClosedM5IntoBlockedInbox} from "./qa-replay-to-android-inbox.mjs";
import {QaFourHourInbox} from "./qa-four-hour-inbox.mjs";

export function replayClosedM5IntoFourHourQa({
 instrumentId,tvSymbol,c1StartMs,candlesM5,nowMs,
 inbox=new QaFourHourInbox()
}={}){
 if(!(inbox instanceof QaFourHourInbox)||
   !Number.isSafeInteger(nowMs)||nowMs<=0)
  throw Error("FOUR_HOUR_QA_INBOX_AND_CLOCK_REQUIRED");
 const replay=replayClosedM5IntoBlockedInbox({
  instrumentId,tvSymbol,c1StartMs,candlesM5
 });
 if(replay.status!=="REPLAY_EVENTS_QUARANTINED")return Object.freeze({
  state:"REPLAY_REJECTED",reason:replay.status,stored:0,
  active:inbox.active({nowMs}),sendPush:false,actionable:false
 });
 const outcomes=replay.events.map(event=>inbox.stage(event,{nowMs}));
 return Object.freeze({
  state:"QA_REPLAY_4H_STAGED",outcomes:Object.freeze(outcomes),
  stored:outcomes.filter(x=>x.state==="QA_STAGED_4H").length,
  active:inbox.active({nowMs}),sendPush:false,actionable:false,
  transport:"DISABLED",
  realMarketData:false,certification:"NOT_VERIFIED"
 });
}
