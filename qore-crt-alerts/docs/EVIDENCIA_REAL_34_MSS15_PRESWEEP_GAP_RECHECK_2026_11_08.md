# QORE CRT — EVIDENCIA REAL 34/34 DESPUÉS DEL ARREGLO PRE-SWEEP MSS M15
**8 noviembre 2026 UTC · Solo STAGING cTrader DEMO · NO MERGE, LIVE, órdenes ni push/FCM**

## Evidencia ejecutada
- PR #96 (DRAFT), commit desplegado `6c1144e8c97a250bf78183a7fc2138d664f5e426` (2/2 workflows CI SUCCESS).
- Railway: proyecto `qore-crt-alerts-qa`, entorno `staging`, `crt-demo-readonly-worker`, deployment `39ee5cd3-afc3-4cf4-a21e-52bcd4f2e88f` STATUS **SUCCESS**.
- 34/34 mercados únicos, 600 M5 cerradas cada uno, M15 y H4 nativas observadas (34/34), reloj propietario/nativo comparado (34/34).
- `totalCrtCyclesEvaluated=183`, `totalMssM5ClosedWitnesses=46`, `totalMssM15ClosedWitnesses=36`.
- Índices bloqueados por H4: `NDX100`, `SPX500`, `US30`. Permanecen **358** bloques H4 con la misma apertura y **62** aperturas H4 sin correspondencia de relojes.
- `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `canTrade=false`, `sendPush=false`.

## Comparación con el deployment previo del PR #95
| Indicador QA | Anterior | Nuevo |
|---|---:|---:|
| Mercados con datos M5/M15/H4 | 34 | 34 |
| Ciclos C1/C2 examinados en mercados no bloqueados | 183 | 183 |
| Testigos MSS M5 cerrados | 46 | 46 |
| Testigos MSS M15 cerrados | 36 | 36 |
| Conflictos reloj H4 índices | 3 | 3 |

En **esta ventana histórica** la corrección no alteró los conteos agregados. Es coherente con que los pivotes que habían confirmado en estos datos no dependieran de una barra M15 ausente justo antes de la barrida; **no demuestra** que el defecto anterior fuese inofensivo para otros históricos. Los tests de regresión verifican el caso defectuoso, cierres a +0/+5/+10 minutos y estabilidad de un pivote congelado al añadir barras futuras.

## Matriz real tras la corrección

| Slot | Mercado | Estado | Ciclos | MSS M5 QA | MSS M15 QA |
|---:|---|---|---:|---:|---:|
| 1 | AUDJPY | QA_REPLAY | 6 | 3 | 2 |
| 2 | GBPUSD | QA_REPLAY | 6 | 1 | 1 |
| 3 | GBPJPY | QA_REPLAY | 6 | 2 | 1 |
| 4 | XAUUSD | QA_REPLAY | 6 | 2 | 1 |
| 5 | NDX100 | CLOCK_BLOCKED | 0 | 0 | 0 |
| 6 | SPX500 | CLOCK_BLOCKED | 0 | 0 | 0 |
| 7 | US30 | CLOCK_BLOCKED | 0 | 0 | 0 |
| 8 | BTCUSD | QA_REPLAY | 3 | 2 | 1 |
| 9 | AUDUSD | QA_REPLAY | 6 | 2 | 2 |
| 10 | USDCAD | QA_REPLAY | 6 | 0 | 0 |
| 11 | USDJPY | QA_REPLAY | 6 | 1 | 0 |
| 12 | EURUSD | QA_REPLAY | 6 | 0 | 0 |
| 13 | USDCHF | QA_REPLAY | 6 | 0 | 0 |
| 14 | NZDUSD | QA_REPLAY | 6 | 0 | 0 |
| 15 | NZDJPY | QA_REPLAY | 6 | 1 | 1 |
| 16 | NZDCHF | QA_REPLAY | 6 | 1 | 1 |
| 17 | XAGUSD | QA_REPLAY | 6 | 1 | 1 |
| 18 | AUDCAD | QA_REPLAY | 6 | 0 | 0 |
| 19 | AUDCHF | QA_REPLAY | 6 | 2 | 1 |
| 20 | AUDNZD | QA_REPLAY | 6 | 1 | 1 |
| 21 | CADCHF | QA_REPLAY | 6 | 3 | 3 |
| 22 | CADJPY | QA_REPLAY | 6 | 3 | 3 |
| 23 | CHFJPY | QA_REPLAY | 6 | 2 | 2 |
| 24 | EURAUD | QA_REPLAY | 6 | 2 | 1 |
| 25 | EURCAD | QA_REPLAY | 6 | 2 | 2 |
| 26 | EURCHF | QA_REPLAY | 6 | 2 | 2 |
| 27 | EURGBP | QA_REPLAY | 6 | 1 | 1 |
| 28 | EURJPY | QA_REPLAY | 6 | 3 | 3 |
| 29 | EURNZD | QA_REPLAY | 6 | 0 | 0 |
| 30 | GBPAUD | QA_REPLAY | 6 | 3 | 1 |
| 31 | GBPCAD | QA_REPLAY | 6 | 1 | 1 |
| 32 | GBPCHF | QA_REPLAY | 6 | 1 | 1 |
| 33 | GBPNZD | QA_REPLAY | 6 | 1 | 1 |
| 34 | NZDCAD | QA_REPLAY | 6 | 3 | 2 |

## Próximas puertas bloqueantes

1. Resolver por metodología **la discrepancia H4 en USTEC, US500 y US30** sin modificar horas C1 aprobadas ni asumir que el corrimiento de una hora es constante entre verano e invierno.
2. Obtener trazas reales **Pine contra Trader Lab** de las siete categorías CRT y de MSS M5/M15 para los 34 símbolos, por ciclo, timestamp, fuente y dirección; no basta el total de eventos.
3. Exámenes positivos/negativos de `CRT_MULTICANDLE` (0 casos observados en la muestra), holdout, repintado, sesiones, cierres de mercado y BTCUSD.
4. Conectar Android y widget sólo con señales aprobadas, deduplicación y TTL 4 horas, pruebas E2E y aprobación Owner.

GitHub es la fuente de verdad. No hay señales operativas ni órdenes.
