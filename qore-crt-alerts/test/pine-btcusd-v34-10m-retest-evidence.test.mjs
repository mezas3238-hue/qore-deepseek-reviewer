import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const before=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10L_QA_PANEL_34_MODELOS_NO_INTEGRADO.pine",import.meta.url),"utf8");
const pine=readFileSync(new URL("../../crt-radar-pro/CRT_RADAR_PRO_V34_10M_RETEST_EVIDENCIA_M15_QA_NO_INTEGRADO.pine",import.meta.url),"utf8");
test("V34.10m does not alter chart OHLC PDH/PDL, CRT, FVG or MSS entry code",()=>{
  assert.equal((before.match(/request\.security\(/g)||[]).length,(pine.match(/request\.security\(/g)||[]).length);
  for(const needle of [
    'f_btc_crt_h4_ny(barT)','f_add_context_fvg(fvgsH4','bool validIndependent15',
    'bool m15CRTConfirmed = chartActive','bool chartPdhTaken =',
    'bool chartPdlTaken =','useAlerts = input.bool(false',
    'memoryScan = input.string("BTCUSD solo"'
  ])assert.ok(pine.includes(needle),needle);
  assert.equal((pine.match(/^s\d\d = input\.symbol\(/gm)||[]).length,34);
});
test("retest records exactly its own completed M15 OHLC, not latest candle",()=>{
  assert.match(pine,/qaRetest15At := closed15At\s+qaRetest15High := m15High\s+qaRetest15Low := m15Low\s+qaRetest15Close := m15Close\s+qaRetest15Pivot := qaLevel/);
  assert.match(pine,/bool postMss15 = closed15At > qaMssAt and closed15At <= qaMssAt \+ 4 \* 3600000/);
  assert.match(pine,/qaRetestSourceMssAt == verifiedM15At/);
  assert.match(pine,/qaRetest15Pivot == outM15Level/);
  assert.match(pine,/qaRetest15At <= qaRetestSourceMssAt \+ 4 \* 3600000/);
  assert.match(pine,/qaRetest15High >= qaRetest15Pivot and qaRetest15Close < qaRetest15Pivot/);
  assert.match(pine,/qaRetest15Low <= qaRetest15Pivot and qaRetest15Close > qaRetest15Pivot/);
});
test("retest capture clears all four prices on cycle change and no-MSS",()=>{
  for(const field of ['High','Low','Close','Pivot']){
    const pattern='qaRetest15'+field+' := na';
    assert.equal(pine.split(pattern).length-1,2,pattern);
  }
  assert.match(pine,/outRetest15At, retestVisible \? qaRetest15High : na, retestVisible \? qaRetest15Low : na, retestVisible \? qaRetest15Close : na, retestVisible \? qaRetest15Pivot : na\)/);
});
test("Android row 4 uses frozen event not last closed M15 and protects other-symbol page",()=>{
  assert.match(pine,/int maxOtherRows = showEntryCatalog and chartBtcSymbol \? 2 : 5/);
  assert.match(pine,/table\.cell\(board,0,4,"RETEST M15"/);
  assert.match(pine,/str\.format_time\(own\.retest15At,"dd\/MM HH:mm",TZ\)/);
  assert.match(pine,/own\.retest15High : na/);
  assert.match(pine,/own\.retest15Pivot,format\.mintick/);
  assert.match(pine,/own\.retest15Close,format\.mintick/);
  for(const catalog of [true,false])for(let requested=3;requested<=12;requested++){
    const others=Math.max(1,Math.min(requested-1,catalog?2:5));
    const occupied=Array.from({length:others},(_,i)=>i+2);
    const reserved=catalog?[4,5,6,7,8,9,10,11,12,13,14]:[7,8,9,10,11,12,13,14];
    assert.equal(occupied.some(r=>reserved.includes(r)),false);
  }
});
test("Data Window exposes high, low, close, pivot and event closure for independent audit",()=>{
  for(const label of ["QA CRT RETEST M15 cierre UTC min","QA CRT RETEST M15 vela maximo","QA CRT RETEST M15 vela minimo","QA CRT RETEST M15 vela cierre precio","QA CRT RETEST M15 pivote congelado"])
    assert.ok(pine.includes(label),label);
  assert.match(pine,/table\.cell\(board,5,6,"SOLO QA"/);
});
