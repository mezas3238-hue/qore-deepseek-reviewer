# QORE CRT — evidencia REAL de horarios H4 nativos (34 mercados; USTEC, US500, US30)
**Corte 8 de noviembre de 2026 UTC | IC Markets / Raw Trading Ltd cTrader DEMO | Railway STAGING**  
**Estado obligatorio:** NO LIVE, NO ÓRDENES, NO PUSH/FCM, NO MERGE, NO CAMBIO C1.

## Evidencia directa trazable
- PR #97 DRAFT: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/97
- Código efectivamente desplegado: `cbb54e66baa7a6f5d858ee9ec316f55532663c19` (2 GitHub Actions SUCCESS antes del despliegue).
- Railway despliegue `c98a2d32-bf17-45ab-b63a-9fa0ea5943d3`, `qore-crt-alerts-qa / staging / crt-demo-readonly-worker`, **SUCCESS**.
- Cuenta cTrader DEMO `Raw Trading Ltd` SCOPE_VIEW; inventario observado 365 símbolos y manifiesto exacto de 34 nativos sha256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`.
- Todos los **34/34** símbolos devolvieron 600 M5 cerradas y datos nativos M15 y H4; 34 diagnósticos de reloj CRT, ninguna operación o notificación.
- El modo adicional exclusivo de índices recibió **15/15** ventanas de H4 históricas, 5 por índice, **447 H4 nativas dentro de las ventanas** (149 USTEC, 149 US500, 149 US30).
- Estado final literal: `CTRADER_34_WITH_3_INDEX_H4_SEASONS_OBSERVED_UNCERTIFIED`; `m5Observed=34`, `nativeM15MarketsRead=34`, `nativeH4MarketsRead=34`, `indexH4SeasonalMarketsRead=3`, `indexH4SeasonalWindowsRead=15`, `indexH4SeasonalNativeBars=447`.
- El resultado de reloj/CRT en 34 mercados sigue: `NDX100`, `SPX500`, `US30` bloqueados, `totalCrtCyclesEvaluated=183`, testigos M5 `46` y M15 `36` en los 31 restantes — diagnóstico no certificado.
- `sendPush=false`, `canTrade=false`, `sourceParityCertified=false`.

## Resultado contrastado en cinco ventanas de 2026

| Instrumento | Ventana 2026 | H4 nativas dentro de ventana | Fase UTC H4 (min módulo 240) | Horas de apertura New York | H4 a las C1 aprobadas 02/06/22 NY | H4 a 01/05/21 NY (NO aprobadas) | H4 anteriores a ventana descartadas |
|---|---|---:|---|---|---:|---:|---:|
| NDX100 | WINTER_PRE_SPRING_2026 | 30 | 120 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| NDX100 | SUMMER_POST_SPRING_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| NDX100 | SUMMER_JULY_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| NDX100 | SUMMER_PRE_AUTUMN_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| NDX100 | WINTER_POST_AUTUMN_2026 | 29 | 120 | 1,5,9,13,17,21 | 0 | 15 | 19 |
| SPX500 | WINTER_PRE_SPRING_2026 | 30 | 120 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| SPX500 | SUMMER_POST_SPRING_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| SPX500 | SUMMER_JULY_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| SPX500 | SUMMER_PRE_AUTUMN_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| SPX500 | WINTER_POST_AUTUMN_2026 | 29 | 120 | 1,5,9,13,17,21 | 0 | 15 | 19 |
| US30 | WINTER_PRE_SPRING_2026 | 30 | 120 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| US30 | SUMMER_POST_SPRING_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| US30 | SUMMER_JULY_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| US30 | SUMMER_PRE_AUTUMN_2026 | 30 | 60 | 1,5,9,13,17,21 | 0 | 15 | 18 |
| US30 | WINTER_POST_AUTUMN_2026 | 29 | 120 | 1,5,9,13,17,21 | 0 | 15 | 19 |

**Conclusión estrictamente descriptiva:**
- En invierno (febrero y noviembre) los tres índices abrieron sus H4 nativas en fase UTC de **120 minutos**; en verano (marzo, julio y octubre) en fase UTC de **60 minutos**.
- A pesar de esta conversión de UTC por DST, **las horas de apertura de las H4 nativas en Nueva York fueron `01/05/09/13/17/21` todo el período observado**.
- De las 447 H4, coincidencias de apertura con las horas C1 de índices del Owner `[02,06,22] NY`: **0**. Coincidencias con las horas alternativas `[01,05,21] NY`: **225**, **hipótesis diagnóstica sin aprobación**. Estos contadores son aperturas observadas, no entradas ni 447 señales.
- Se descartaron **273 H4 anteriores al inicio declarado de las ventanas** devueltas por el servicio al solicitar `count` desde `toTimestamp`. No se usaron para inferir fase ni se interpolaron huecos. Cualquier H4 posterior a ventana, abierta/no cerrada, o más de 14 días antes del inicio habría sido rechazada.
- El fallo previo de límite `BLOCKED_PAYLOAD_TYPE` fue resuelto con espaciamiento de 600 ms entre consultas históricas por conexión, sin reintentos. Esto no amplía permisos.
- **El anclaje soberano aún es** `C1_HOURS.index=[2,6,22]` NY; **NO fue cambiado**. Los tres índices permanecen vetados para CRT/MSS porque cTrader usa otras H4. El cambio de estación está ahora caracterizado, pero no hay decisión metodológica aprobada ni paridad de eventos con Pine.
- Este experimento obtiene H4 nativas en fechas históricas, **NO** descargó las 48 M5 constituyentes de cada una de estas H4 históricas, y **NO** certifica la geometría CRT histórica, la estrategia, ni equivalencia de la fuente TradingView.

## Matriz global real de los 34 mercados

| Slot | Instrumento | Símbolo cTrader | M5 cerradas | M15 nativas | H4 nativas | Ventanas estacionales extra | Estado CRT/MSS |
|---:|---|---|---:|---:|---:|---:|---|
| 1 | AUDJPY | AUDJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 2 | GBPUSD | GBPUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 3 | GBPJPY | GBPJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 4 | XAUUSD | XAUUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 5 | NDX100 | USTEC | 600 | 250 | 30 | 5 | CLOCK_BLOCKED |
| 6 | SPX500 | US500 | 600 | 250 | 30 | 5 | CLOCK_BLOCKED |
| 7 | US30 | US30 | 600 | 250 | 30 | 5 | CLOCK_BLOCKED |
| 8 | BTCUSD | BTCUSD | 600 | 250 | 29 | — | QA_DIAGNOSTIC |
| 9 | AUDUSD | AUDUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 10 | USDCAD | USDCAD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 11 | USDJPY | USDJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 12 | EURUSD | EURUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 13 | USDCHF | USDCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 14 | NZDUSD | NZDUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 15 | NZDJPY | NZDJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 16 | NZDCHF | NZDCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 17 | XAGUSD | XAGUSD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 18 | AUDCAD | AUDCAD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 19 | AUDCHF | AUDCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 20 | AUDNZD | AUDNZD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 21 | CADCHF | CADCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 22 | CADJPY | CADJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 23 | CHFJPY | CHFJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 24 | EURAUD | EURAUD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 25 | EURCAD | EURCAD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 26 | EURCHF | EURCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 27 | EURGBP | EURGBP | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 28 | EURJPY | EURJPY | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 29 | EURNZD | EURNZD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 30 | GBPAUD | GBPAUD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 31 | GBPCAD | GBPCAD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 32 | GBPCHF | GBPCHF | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 33 | GBPNZD | GBPNZD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |
| 34 | NZDCAD | NZDCAD | 600 | 250 | 30 | — | QA_DIAGNOSTIC |

## Puertas para continuar
1. **Decisión de metodología de índices**: verificar si el Owner conserva C1 NY `02/06/22` como estrategia independiente o **autoriza explícitamente** un adaptador cTrader `01/05/21`. Prohibido modificar la C1 soberana automáticamente.
2. Obtener, si se justifica, M5 originales de las ventanas históricas (48 por H4) para certificar reconstrucción y eventos por C1, incluyendo sesiones de índice y DST, no solo fase temporal.
3. Comparación evento a evento con Pine (34 instrumentos, misma OHLC, timestamp, dirección, C1, categoría y MSS M5/M15), controles MULTI4/MULTI_N, holdout y no repaint. El hecho de que 34 instrumentos reciban OHLC no acredita paridad con TradingView.
4. Mobile app y widget solo con señales certificadas, TTL 4 h, deduplicación, pruebas E2E, sin FCM real hasta la autorización específica.

**GitHub es fuente soberana, PR DRAFT sin merge; sin LIVE ni operaciones.**
