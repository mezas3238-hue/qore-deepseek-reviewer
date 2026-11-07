// STAGING-only review manifest of IC Markets cTrader DEMO symbol candidates.
// This does not approve mappings, certify OHLC, create alerts or send push.
// Only run after cTrader application+account auth and SCOPE_VIEW are proven.
import {createHash} from "node:crypto";
import {auditUnapprovedIc34Candidates}
  from "./ctrader-ic34-candidate-audit-qa.mjs";
import {INSTRUMENTS} from "./instruments.mjs";

const freeze=x=>Object.freeze(x);
export const IC34_MANIFEST_OPT_IN="OWNER_REVIEW_ONLY";

export function buildUnapprovedIc34OwnerManifest({
  inventory,viewAccountProven=false
}={}){
  const audit=auditUnapprovedIc34Candidates({inventory,viewAccountProven});
  if(audit.total!==34 || audit.rows.length!==INSTRUMENTS.length ||
     audit.rows.some((row,i)=>row.slot!==i+1||
       row.instrumentId!==INSTRUMENTS[i].id||
       row.ownerApproved!==false || row.sourceParityCertified!==false ||
       row.canTrade!==false || row.sendPush!==false))
    throw Error("CTRADER_IC34_MANIFEST_INVALID");

  const rows=freeze(audit.rows.map(row=>{
    if(row.matchedCount!==row.candidates.length ||
       row.candidates.length>100 ||
       row.candidates.some(x=>!Number.isSafeInteger(x.symbolId)||
         x.symbolId<=0 ||
         !/^[A-Za-z0-9_./:-]{1,80}$/.test(x.brokerSymbolName)))
      throw Error("CTRADER_IC34_MANIFEST_CANDIDATE_INVALID");
    const candidates=freeze(row.candidates.map(x=>freeze({
      ctraderSymbolId:x.symbolId,
      brokerSymbolName:x.brokerSymbolName
    })));
    return freeze({
      slot:row.slot,instrumentId:row.instrumentId,tvSymbol:row.tvSymbol,
      state:row.state,candidates,ownerApproved:false,
      sourceParityCertified:false
    });
  }));
  const uniqueIds=new Set();
  for(const row of rows)for(const c of row.candidates){
    if(uniqueIds.has(c.ctraderSymbolId))
      throw Error("CTRADER_IC34_MANIFEST_REUSED_SYMBOL_ID");
    uniqueIds.add(c.ctraderSymbolId);
  }

  const fingerprint=createHash("sha256")
    .update(JSON.stringify(rows)).digest("hex");
  return freeze({
    state:"IC34_CANDIDATES_OWNER_REVIEW_ONLY",
    total:34,exactNameCandidates:audit.exactNameCandidates,
    ambiguous:audit.ambiguous,unmapped:audit.unmapped,
    ownerApprovedMappings:0,sourceParityCertified:0,
    realM5BarsConfirmed:0,canTrade:false,sendPush:false,
    manifestSha256:fingerprint,
    rows
  });
}
