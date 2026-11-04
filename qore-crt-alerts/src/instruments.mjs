// Sovereign fixed IC Markets-only 34-slot inventory from CRT RADAR V34.12T.
// No live-provider fallback, no chart-triggered source substitution.
// TradingView symbols are NOT a backend feed entitlement or proof of coverage.
const rows = [
["AUDJPY","IC:AUDJPY","forex"],["GBPUSD","IC:GBPUSD","forex"],
["GBPJPY","IC:GBPJPY","forex"],["XAUUSD","IC:XAUUSD","forex"],
["NDX100","IC:USTEC","index"],["SPX500","IC:US500","index"],
["US30","IC:US30","index"],["BTCUSD","IC:BTCUSD","crypto"],
["AUDUSD","IC:AUDUSD","forex"],["USDCAD","IC:USDCAD","forex"],
["USDJPY","IC:USDJPY","forex"],["EURUSD","IC:EURUSD","forex"],
["USDCHF","IC:USDCHF","forex"],["NZDUSD","IC:NZDUSD","forex"],
["NZDJPY","IC:NZDJPY","forex"],["NZDCHF","IC:NZDCHF","forex"],
["XAGUSD","IC:XAGUSD","forex"],["AUDCAD","IC:AUDCAD","forex"],
["AUDCHF","IC:AUDCHF","forex"],["AUDNZD","IC:AUDNZD","forex"],
["CADCHF","IC:CADCHF","forex"],["CADJPY","IC:CADJPY","forex"],
["CHFJPY","IC:CHFJPY","forex"],["EURAUD","IC:EURAUD","forex"],
["EURCAD","IC:EURCAD","forex"],["EURCHF","IC:EURCHF","forex"],
["EURGBP","IC:EURGBP","forex"],["EURJPY","IC:EURJPY","forex"],
["EURNZD","IC:EURNZD","forex"],["GBPAUD","IC:GBPAUD","forex"],
["GBPCAD","IC:GBPCAD","forex"],["GBPCHF","IC:GBPCHF","forex"],
["GBPNZD","IC:GBPNZD","forex"],["NZDCAD","IC:NZDCAD","forex"]
];
export const INSTRUMENTS=Object.freeze(rows.map(([id,tvSymbol,family],i)=>
Object.freeze({slot:i+1,id,tvSymbol,family,feedSymbol:null,feedStatus:"UNVERIFIED"})));
export const instrumentById=id=>INSTRUMENTS.find(x=>x.id===id)??null;
