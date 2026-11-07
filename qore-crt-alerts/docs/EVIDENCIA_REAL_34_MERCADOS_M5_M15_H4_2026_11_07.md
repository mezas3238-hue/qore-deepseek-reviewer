# QORE CRT — EVIDENCIA REAL 34/34 M5 + M15 + H4 NATIVAS, sin diferencias OHLC
**7 noviembre 2026 | IC Markets cTrader DEMO | Railway STAGING | No LIVE, órdenes, merge, FCM ni push**

## Identidad y resultado del examen
- GitHub DRAFT PR #93, código SHA `737f1a2410b5dd29d53a00a5c60ac9174fd11b1e` (2/2 workflows SUCCESS).
- Railway `qore-crt-alerts-qa`, entorno `staging`, worker `crt-demo-readonly-worker`, deployment `f179666a-1452-4961-bb1c-ca1e09e0646c` STATUS **SUCCESS**.
- Cuenta comprobada IC Markets cTrader DEMO / `Raw Trading Ltd` / OAuth `accounts/SCOPE_VIEW`; cada uno de los 34 símbolos fue cotejado con el inventario nativo SHA256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`. No se enviaron órdenes ni push.
- Estado final literal: `CTRADER_34_NATIVE_M15_H4_SAMPLES_OBSERVED_UNCERTIFIED`, `attempted=34`, `m5Observed=34`, `nativeM15MarketsRead=34`, `nativeH4MarketsRead=34`, `all34NativeFramesRead=true`.
- **34/34 × 600 M5 cerradas = 20400 M5**, de dos páginas verificadas por cada mercado.
- **8500 M15** y **1019 H4** nativas obtenidas independientemente en las mismas cuentas cTrader.
- **6789 M15** y **390 H4** comparadas contra las agregaciones desde bloques completos de 3 M5 y 48 M5 cerradas, respectivamente.
- **0 / 0 discrepancias** OHLC entre las M15/H4 nativas y los bloques de M5 elegibles.
- Se excluyeron 12 bloques M15 y 22 H4 nativos situados dentro de las ventanas de M5 pero sin todas sus velas constituyentes. **No** se rellenó ninguna interrupción de sesión ni se creó un bloque artificial.
- Los datos M15/H4 fuera de las ventanas efectivamente cubiertas por las 600 M5 se registraron como lectura nativa, **no** como comparación realizada; por eso las cantidades nativas y comparadas no son iguales.
- La apertura de H4 nativa observada tiene fase UTC de 120 minutos dentro de cada ciclo de cuatro horas para los 34 símbolos en esta muestra. Esto es una observación de horario, **no** certificación eterna de anclaje ni de DST.
- **BTCUSD:** 250 M15 nativas, 29 H4 nativas, 197 M15 y 7 H4 elegibles coincidentes; sus cuatro interrupciones permanecen sin rellenar. Se mantiene reconocimiento independiente para BTC.

## Matriz individual real

| # | Instrumento | Grupo | M5 cerradas | M15 nativas | M15 comparadas | M15 excluidas | H4 nativas | H4 comparadas | H4 excluidas |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | AUDJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 2 | GBPUSD | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 3 | GBPJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 4 | XAUUSD | METALS | 600 | 250 | 200 | 0 | 30 | 11 | 2 |
| 5 | NDX100 | INDICES | 600 | 250 | 200 | 0 | 30 | 11 | 2 |
| 6 | SPX500 | INDICES | 600 | 250 | 199 | 0 | 30 | 10 | 2 |
| 7 | US30 | INDICES | 600 | 250 | 200 | 0 | 30 | 11 | 2 |
| 8 | BTCUSD | BTC_INDEPENDENT | 600 | 250 | 197 | 4 | 29 | 7 | 5 |
| 9 | AUDUSD | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 10 | USDCAD | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 11 | USDJPY | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 12 | EURUSD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 13 | USDCHF | FOREX | 600 | 250 | 199 | 2 | 30 | 11 | 1 |
| 14 | NZDUSD | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 15 | NZDJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 16 | NZDCHF | FOREX | 600 | 250 | 199 | 1 | 30 | 11 | 1 |
| 17 | XAGUSD | METALS | 600 | 250 | 200 | 0 | 30 | 11 | 2 |
| 18 | AUDCAD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 19 | AUDCHF | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 20 | AUDNZD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 21 | CADCHF | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 22 | CADJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 23 | CHFJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 24 | EURAUD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 25 | EURCAD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 26 | EURCHF | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 27 | EURGBP | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 28 | EURJPY | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 29 | EURNZD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 30 | GBPAUD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 31 | GBPCAD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 32 | GBPCHF | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 33 | GBPNZD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |
| 34 | NZDCAD | FOREX | 600 | 250 | 200 | 0 | 30 | 12 | 0 |

## Calificación de certificación
**Lecturas de M5 + M15 + H4 nativas y comparación OHLC de bloques elegibles: APROBADAS para 34/34 en la muestra DEMO.**

**NO CERTIFICADOS**:
1. Sesiones exactas por instrumento, pausas de mercado y mantenimiento (PR #92 muestra 8 interrupciones no justificadas por el horario publicado).
2. Paridad independiente entre la fuente TradingView `IC:...` y cTrader DEMO, en los 34 instrumentos.
3. Las siete categorías/roles CRT del indicador en sus versiones de Pine verificadas contra las señales del motor; ningún resultado de OHLC por sí solo certifica detección CRT.
4. MSS causal de M5 y MSS causal de M15, independientes y sin repaint.
5. Gateway móvil, widget Android y notificaciones reales con expiración de cuatro horas.

Ninguna lectura activa `sourceParityCertified`, `crtFamiliesCertified`, `mssM5Certified`, `mssM15Certified`, `canTrade` ni `sendPush`. Permanecen `false`.

## Próxima acción de arquitectura

Conservar el contrato exacto de las 7 categorías CRT y los estados de validación/rechazo; construir pruebas sobre **eventos timestamped y causalidad** sin reutilizar MSS M5 como MSS M15. Los 34 mercados deben pasar la misma batería antes de conectar señales al móvil. Mantener GitHub fuente de verdad, PR DRAFT sin merge.
