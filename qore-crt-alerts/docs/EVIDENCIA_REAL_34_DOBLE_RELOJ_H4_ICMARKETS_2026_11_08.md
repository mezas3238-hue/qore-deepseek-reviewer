# QORE CRT — EVIDENCIA REAL DEL DOBLE RELOJ H4 EN 34 INSTRUMENTOS
**Corte 8 noviembre 2026 UTC · Raw Trading Ltd / IC Markets cTrader DEMO · STAGING · SIN MERGE/LIVE/TRADING/FCM/PUSH.**

## Proveniencia
- GitHub PR #95 (DRAFT), código efectivamente desplegado `1e13725ae5b28d799122378fc606cecda3dddd06` (2 workflows CI SUCCESS).
- Railway project `qore-crt-alerts-qa`, env `staging`, service `crt-demo-readonly-worker`, deploy `ded9a6a7-23a5-4986-9d60-7d232ff0d81d`, status **SUCCESS**.
- Inventario autenticado **34/34** (365 símbolos totales; 34 IDs exactos), OAuth DEMO SCOPE_VIEW, bróker Raw Trading Ltd.
- **34/34** devuelven 600 M5 cerradas y lecturas nativas M15/H4; comparación de M5 vs M15/H4 no altera velas ni inventa huecos.
- Resultado final: `CTRADER_34_CRT_MSS_CLOCK_AUDIT_UNCERTIFIED`, `nativeVsOwnerClockComparedMarkets=34`, `nativeVsOwnerClockMatchedH4=358`, `nativeVsOwnerClockDifferingH4=62`, conflictos `NDX100`, `SPX500`, `US30`.
- **358 H4 completas** coinciden por timestamp de apertura entre agrupamiento original y el nativo cTrader; **62 aperturas H4** están solo en uno de los dos agrupamientos (30 H4 completas del reloj original y 32 del reloj nativo para los índices), no representan velas faltantes.
- El resto **31 símbolos** comparten el anclaje H4 en esta muestra, sin que ello certifique calendario para todo el año.

## Índices — bloqueo exacto confirmado

| Índice | H4 completas cTrader | H4 completas con reloj original | H4 con apertura idéntica | H4 nativas a horas C1 aprobadas NY 02/06/22 | H4 nativas en las horas contiguas, solo hipótesis |
|---|---:|---:|---:|---:|---:|
| NDX100 | 11 | 10 | 0 | 0 | 6 |
| SPX500 | 10 | 10 | 0 | 0 | 6 |
| US30 | 11 | 10 | 0 | 0 | 6 |

**El reloj aprobado `C1_HOURS.index=[2,6,22]` en America/New_York produce H4 con fase UTC 180 min (módulo 240) durante la muestra de noviembre, mientras el feed cTrader DEMO abre H4 nativas en fase UTC 120 min. No hay ninguna H4 completa compartida en esos tres índices.**

Se contaron H4 nativas en NY 01/05/21 como un **contrafactual exploratorio**, no como aprobación de nuevo horario. Esos resultados no autorizan CRT, MSS ni señales en índices.

## Matriz completa 34/34

| Slot | Instrumento | Fase UTC nativa | Fase UTC original | H4 nativas completas | H4 originales completas | H4 coincidentes | H4 solo en un reloj | Estado |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | AUDJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 2 | GBPUSD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 3 | GBPJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 4 | XAUUSD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 5 | NDX100 | 120 | 180 | 11 | 10 | 0 | 21 | BLOQUEADO |
| 6 | SPX500 | 120 | 180 | 10 | 10 | 0 | 20 | BLOQUEADO |
| 7 | US30 | 120 | 180 | 11 | 10 | 0 | 21 | BLOQUEADO |
| 8 | BTCUSD | 120 | 120 | 7 | 7 | 7 | 0 | ALINEADO QA |
| 9 | AUDUSD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 10 | USDCAD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 11 | USDJPY | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 12 | EURUSD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 13 | USDCHF | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 14 | NZDUSD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 15 | NZDJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 16 | NZDCHF | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 17 | XAGUSD | 120 | 120 | 11 | 11 | 11 | 0 | ALINEADO QA |
| 18 | AUDCAD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 19 | AUDCHF | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 20 | AUDNZD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 21 | CADCHF | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 22 | CADJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 23 | CHFJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 24 | EURAUD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 25 | EURCAD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 26 | EURCHF | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 27 | EURGBP | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 28 | EURJPY | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 29 | EURNZD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 30 | GBPAUD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 31 | GBPCAD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 32 | GBPCHF | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 33 | GBPNZD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |
| 34 | NZDCAD | 120 | 120 | 12 | 12 | 12 | 0 | ALINEADO QA |

## Continuidad y límites

El conteo original de PR #94 permanece `totalCrtCyclesEvaluated=183`, `totalMssM5ClosedWitnesses=46`, `totalMssM15ClosedWitnesses=36` sobre 31 mercados para **diagnóstico no certificado**. Los 3 índices siguen vetados.

**No constituye prueba de no repaint**, paridad con Pine o TradingView, certificación de siete roles, confirmación de MSS en la plataforma TradingView ni autorización de app/widget. `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`.

## Trabajo restante obligatorio

1. Obtener segmentos históricos nativos cTrader reales antes y después de cada transición DST y cambios de sesión para índices; un modelo con corrimiento fijo de una hora no basta.
2. Verificar en la plataforma cTrader DEMO la sesión de cada símbolo, especialmente cierres/feriados/pausas y BTCUSD, sin extrapolar.
3. Decidir explícitamente si se conserva el reloj de indicadores como metodología independiente de TradingView o se autoriza un adaptador por proveedor/sesión; **no cambiar `ny-clock.mjs` automáticamente**.
4. Ejecutar pruebas de eventos de los siete roles CRT y los dos detectores MSS con trazas reales del indicador Pine en los 34, controles positivos/negativos, holdout y verificación no repaint.
5. Conectar app/widget únicamente después de las puertas previas, con deduplicación y TTL 4h, sin LIVE ni FCM real antes de aprobación.

GitHub es la fuente soberana.
