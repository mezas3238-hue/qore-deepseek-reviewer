# Trader Lab — auditoría de integridad del contenido M5 de 33 archivos (2 nov 2026)

**Alcance:** sólo archivos originales de CALIBRACIÓN descargados desde los artefactos GitHub Actions referenciados en `34-instrument-source-preflight-2026-11-01.json`. Esto **NO ES** sellado de holdout ni paridad con TradingView.

## Evidencia ejecutada
- **33/33 ZIP encontrados y abiertos** en contenedor local; sus hashes SHA-256 de archivo ZIP completo coinciden con el catálogo preflight.
- **33/33 verificación criptográfica de contenido interno satisfactoria**: se leyeron y calcularon SHA-256 de los ficheros indicados en `MANIFEST_SHA256SUMS.txt`, `SYMBOL_SHA256SUMS.txt` o `SOURCE_SHA256SUMS.txt`, y `PARTITION_MANIFEST/YYYY.sha256` para cada año 2016–2026, incluyendo los registros `RAW_M5_LEDGER/YYYY.jsonl`. 12 archivos tienen 47 comprobaciones de miembro y 21 tienen 45. **Cero hashes inconsistentes**.
- Los 33 archivos contienen JSONL RAW M5 con campos `opened_at`, `open_relative`, `high_relative`, `low_relative`, `close_relative`; el total de velas **declaradas en los 33 manifiestos** es **24.377.420**. Los hashes comprueban bytes, pero ese total no es una validación independiente de todos los conteos fila por fila.
- 12 archivos usan identidad interna `CIBO_MARKET_ATLAS_10Y_CONSUMPTION_V1`; 21 `QORE_NATIVE_ICMARKETS_DEMO_UNIVERSE33_M5_10Y_NEW_CAPTURE_V1`. La denominación `ICMARKETS` no demuestra identidad de cuenta con el símbolo exacto de TradingView.
- Los manifiestos siguen declarando `demo_eligible:false`, `live_authorized:false` y `UNVERIFIED_PROVIDER_SESSION_CALENDAR`. **BTCUSD falta**.

## Dictamen estricto
**PASS únicamente de integridad del archivo 33/33; certificación general BLOQUEADA.** El dato de 24.377.420 es cobertura histórica declarada y no implica 34 mercados homologados. No se modificó el preflight existente ni se pusieron a `true` indicadores de licencia, contenido de fuente homologada, holdout congelado, Pine compilado, replay o FCM. Los 33 archivos pertenecen a investigación/calibración previa (no aptos para nuevo holdout sin preregistro).

Bloqueos: licencia de uso y acceso autorizado; BTCUSD; identidad efectiva de cuenta/broker; sesiones DST; diferencia de precios cTrader demo ↔ TradingView IC/OANDA; derivación del OHLC utilizable desde los valores relativos; sellado del holdout verdaderamente no consultado; paridad señal por señal Pine A ↔ Pine B ↔ Trader Lab; Android FCM real. **NO MERGE / NO LIVE / NO PUSH.**

## Tabla de hashes
| Mercado | SHA-256 ZIP comprobado | Hashes miembros | M5 manifiesto |
|---|---|---:|---:|
| AUDJPY | `a416085cfcef04003ae89debaad360304a0c4c8bac65b3bf2b439a8a4b7098bf` | 47 | 745468 |
| GBPUSD | `77d5b65ce3c6763e3ac5f620e4167d4ef071bfe1c13746cd5ca7ad9788268dcf` | 47 | 745274 |
| GBPJPY | `b68e74b2afa54295f891c11cde19e12e92db4192930496036c7ebb372474e415` | 47 | 745478 |
| XAUUSD | `dcb905b11380e3d4e1a4dc621e269bb75d2886806dd662e260d21d1d15362e08` | 47 | 707716 |
| NAS100 | `87ae8095feadce23c5026cda4dada49765d44d0baa2237b5bd7704ccc8deb863` | 47 | 701457 |
| SP500 | `f27147a8d8b262e231198120ecd9dff6e856c5f64336e39aa202bad4f0200ac7` | 47 | 693064 |
| US30 | `8786e856ca2c8c97aa2be86504f20a9864b2b981d15e7f64dc8ccce61f15733c` | 47 | 700856 |
| AUDUSD | `ac72aaf438c164cd79691a7cf1f3f0a68f4c65aa6a91a921a721c7a04ebdc2f0` | 47 | 745283 |
| USDCAD | `35d57d024121dcfbbbfd201bd6bfd5f5250895cdfe7c47a817e58de32392ee50` | 47 | 745088 |
| USDJPY | `e3ac9a45f3000c3e3bd93e50c730c952ddd08f77f1c857b5c4b3a67679fcaa51` | 47 | 745327 |
| EURUSD | `e0fa9e316b79ba61c338161a57508359d4c6afe2fbf97d3f50f1e27c2d359a86` | 47 | 745458 |
| USDCHF | `f0ecff960b4ae47d1b16f273ba0790ad46c4cba945a5c638812062397aed9d20` | 45 | 744755 |
| NZDUSD | `02ebacefcb0baefdcd75d067aa7ab627059f4ee44fa76bdbd233ccc1d6a20d62` | 45 | 744980 |
| NZDJPY | `f759d64f0cf3bcd27829e9574589c6f002b62a84ff99c59638791b098b801219` | 45 | 745313 |
| NZDCHF | `234cf9a45720933ecac5fb38b1f3d3ac0b3b5d0f0f1ca8bc0ea398641be23f7f` | 45 | 745174 |
| XAGUSD | `cadfb896b65ce58b27f0389cb624ba53d93a12f813a60792087bb5b94ff5d971` | 47 | 706516 |
| AUDCAD | `0e8cf82a4b43c9083efd487b469dfc9f2d5db6c2d6049b9bc77504f805e71789` | 45 | 745423 |
| AUDCHF | `b9237743cc9cd8ca1e879cb4f68bdea249a5efc080c59bcd976ddc37333575c3` | 45 | 745393 |
| AUDNZD | `8fddb6a28df06df4ad0aca1bb057a7319be27007ed61841b8037c6da0d1c9a8b` | 45 | 745285 |
| CADCHF | `f28fc6ed76c20f7b50b8ae45578dafa7443d3f48b0a8ea51c1287716c985ff69` | 45 | 745098 |
| CADJPY | `8806a77c936e87d2d42bc206f47ef0f9c2f5f2c407654fdb67ab0df30d7afe4b` | 45 | 745391 |
| CHFJPY | `b9bb72d3c7d1a754720dba49ab2ce7cbe47145177b6d67c4b50683170ac83f72` | 45 | 745339 |
| EURAUD | `34f76af17c009d04d4a0bc0c20f60814c27cdf43df2a5fda342522752f33b953` | 45 | 745503 |
| EURCAD | `51902e560497f12b7b61b1fa927ffbe7396d1c71a65b6515ab76c2ac35fc3bd6` | 45 | 744886 |
| EURCHF | `bac43daba94ae239387a3fb6da735f7c92cad2c04d5de52f9993933ab78a8e6d` | 45 | 745092 |
| EURGBP | `c30dbb78ad134b83829820452d30ebf734328a8e10d7dd53eae5398e6d08317d` | 45 | 745331 |
| EURJPY | `5e830c81f20be78be64c9758822f0f7192f64f00097d30261deb294c380e9a33` | 45 | 745509 |
| EURNZD | `ae4419f0f420120bb90bb4ab765ee7344f8b9c17f773f7f1b3ad859ce256a8d1` | 45 | 745327 |
| GBPAUD | `f301451afe0074b79c168a6f62098c5de8a30ae235d8b34e6ceaf9158f3b2f55` | 45 | 745432 |
| GBPCAD | `aafac69de06965036159e6a5747814dab24c582de40d760adebe6284877c3279` | 45 | 745397 |
| GBPCHF | `7b80682fb013e6c8509173bfe9203257f4c8e19472d0c91dbfe3a24ef15a8db6` | 45 | 745370 |
| GBPNZD | `11976de066db0bdb56e7f46a5c862e25ccf33a0b6b47a7548b835868b1eb631a` | 45 | 745203 |
| NZDCAD | `7cc75531ea0472424b0fbaba8ac83c6c6e35ec67c86c6115ec20ac4c2f03e159` | 45 | 745234 |

Datos máquina: [`33-archive-content-integrity-audit-2026-11-02.json`](./33-archive-content-integrity-audit-2026-11-02.json). Fuente de metadatos inmutable: [`34-instrument-source-preflight-2026-11-01.json`](./34-instrument-source-preflight-2026-11-01.json).
