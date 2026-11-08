# QORE CRT — EVIDENCIA REAL: DOS RELOJES H4 SOBRE LAS MISMAS M5, 34 MERCADOS
**Fecha:** 8 noviembre 2026 UTC · **Origen:** IC Markets (Raw Trading Ltd) cTrader DEMO VIEW · **Infra:** Railway STAGING · **Control:** NO MERGE, LIVE, trading, FCM ni push.

## Trazabilidad
- PR: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/98 (DRAFT, hijo de #97).
- Commit de código ejecutado en Railway: `3f305520a56c08af72647ad30cb82679a829231d`. Dos GitHub Actions **SUCCESS** previos a la ejecución.
- Railway deployment `6aaaab60-9526-442e-8a92-ff919636f1dc`: `qore-crt-alerts-qa / staging / crt-demo-readonly-worker`, **SUCCESS**.
- Invoca exclusivamente el inventario autenticado de 34 instrumentos, 600 M5 cerradas cada uno (total **20.400**), con M15/H4 nativas; `sourceParityCertified=false` significa que **no** está certificada igualdad con TradingView.
- Mismas 600 M5 por índice → reloj **A Owner**, H4 reconstruidas 02/06/22 NY; reloj **B de diagnóstico no aprobado**, H4 completas cTrader (48 M5 contiguas) 01/05/21 NY.
- La salida final Railway `CTRADER_34_WITH_3_INDEX_H4_SEASONS_OBSERVED_UNCERTIFIED` registró `indexH4TwoClockGeometryMarkets=3`, `indexH4OwnerC2Returns=2`, `indexH4NativeCandidateC2Returns=5`, `indexH4TwoClockSharedWitnesses=0`, `indexH4TwoClockOwnerOnlyWitnesses=19`, `indexH4TwoClockNativeOnlyWitnesses=24`.
- La auditoría estacional ya existente también respondió con **15/15** ventanas históricas en los 3 índices.
- Indicadores de los 31 mercados no bloqueados de esta corrida: `totalCrtCyclesEvaluated=182`, testigos MSS M5 `45`, MSS M15 `36`. Los números difieren ligeramente de la corrida previa 183/46/36 porque la ventana de 600 M5 avanza con el tiempo; **no afirmar una regresión por código sin congelar exactamente la ventana**.

## Geometría observada: A (reloj autorizado) contra B (nativo no autorizado)

| Símbolo | C1/C2 completas A | C1/C2 completas B | Barridas C2 con retorno A | Barridas C2 con retorno B | Expansiones rechazadas A | Expansiones rechazadas B | Barridas dobles rechazadas A | Barridas dobles rechazadas B | C3 cerradas válidas A | C3 cerradas válidas B | Inside retorno A | Inside retorno B | Multi4 distribuido QA A | Multi4 distribuido QA B | Identidades compartidas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| NDX100 | 6 | 6 | 1 | 1 | 3 | 1 | 2 | 2 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |
| SPX500 | 6 | 6 | 0 | 3 | 3 | 2 | 2 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| US30 | 6 | 6 | 1 | 1 | 3 | 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 |

**Total:** A: 2 geometrías de C2 con retorno; B: 5; identidades compartidas 0; 19 testigos exclusivos A y 24 B. Un testigo se identifica por inicio de C1, cierre de C2, categoría y dirección; **la comparación incluye rechazo, contexto y patrones QA**, no solo oportunidades. Dos testigos con distintas C1 no son la misma entrada. Los patrones MULTI4/MULTI_N son hipótesis geométricas; **no** cumplen por sí solos los siete roles Pine.

## Matriz de 34 mercados (misma corrida real)

| Slot | Instrumento | M5 cerradas | Estado CRT/MSS | Retornos C2 A | Retornos C2 B |
|---:|---|---:|---|---:|---:|
| 1 | AUDJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 2 | GBPUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 3 | GBPJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 4 | XAUUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 5 | NDX100 | 600 | VETO + A/B QA | 1 | 1 |
| 6 | SPX500 | 600 | VETO + A/B QA | 0 | 3 |
| 7 | US30 | 600 | VETO + A/B QA | 1 | 1 |
| 8 | BTCUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 9 | AUDUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 10 | USDCAD | 600 | REPLAY NO CERTIFICADO | — | — |
| 11 | USDJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 12 | EURUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 13 | USDCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 14 | NZDUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 15 | NZDJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 16 | NZDCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 17 | XAGUSD | 600 | REPLAY NO CERTIFICADO | — | — |
| 18 | AUDCAD | 600 | REPLAY NO CERTIFICADO | — | — |
| 19 | AUDCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 20 | AUDNZD | 600 | REPLAY NO CERTIFICADO | — | — |
| 21 | CADCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 22 | CADJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 23 | CHFJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 24 | EURAUD | 600 | REPLAY NO CERTIFICADO | — | — |
| 25 | EURCAD | 600 | REPLAY NO CERTIFICADO | — | — |
| 26 | EURCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 27 | EURGBP | 600 | REPLAY NO CERTIFICADO | — | — |
| 28 | EURJPY | 600 | REPLAY NO CERTIFICADO | — | — |
| 29 | EURNZD | 600 | REPLAY NO CERTIFICADO | — | — |
| 30 | GBPAUD | 600 | REPLAY NO CERTIFICADO | — | — |
| 31 | GBPCAD | 600 | REPLAY NO CERTIFICADO | — | — |
| 32 | GBPCHF | 600 | REPLAY NO CERTIFICADO | — | — |
| 33 | GBPNZD | 600 | REPLAY NO CERTIFICADO | — | — |
| 34 | NZDCAD | 600 | REPLAY NO CERTIFICADO | — | — |

## Puertas NO aprobadas

1. **Los 3 índices mantienen el veto `NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA`, `cyclesEvaluated=0`, `indexCrtMssBlocked=true`**, sin ejecutar MSS sobre reloj B ni producir alertas.
2. **No cambiar C1**: `C1_HOURS.index=[2,6,22]` permanece. El Owner debe decidir de forma explícita si los índices usarán el calendario independiente actual o si se permite un adaptador específico cTrader; la paridad de eventos aún no está probada.
3. TradingView/Pine: capturar eventos originales en la misma ventana OHLC, fuente y timezone por ciclo; comparar inicio C1, barrida C2, ratificación, dirección, pivot MSS M5/M15 y primer break. El espejo geométrico no reimplementa `f_engine()`; las siete categorías no están certificadas.
4. MULTI4 y MULTI_N requieren suficientes positivos y negativos en muestra más amplia y holdout preestablecido. Las 600 M5 de esta corrida no bastan para concluir comportamiento anual, no repaint ni robustez.
5. La app Android y widget con TTL 4 horas continúan sin FCM ni señales reales; pruebas E2E solo después de certificaciones.

**Fuente de verdad GitHub, PR DRAFT, sin merge ni acceso LIVE.**
