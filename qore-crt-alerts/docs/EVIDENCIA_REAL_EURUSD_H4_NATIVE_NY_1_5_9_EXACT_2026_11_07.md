# QORE CRT ALERTS — EVIDENCIA REAL: cTrader EURUSD H4 nativa coincide con H4 NY 1/5/9
**Corte: 2026-11-07. Solo QA / DEMO / STAGING. NO MERGE, NO LIVE, NO órdenes ni PUSH.**

## Identificación del examen
- PR: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/89 (DRAFT)
- GitHub commit desplegado: `01555257d662749fea2298752c2f974e873bb35c`; dos workflows de GitHub completados en SUCCESS.
- Railway proyecto `qore-crt-alerts-qa`, entorno `staging`, servicio `crt-demo-readonly-worker`, deployment ID `c5e23d5a-9593-4fb2-8db4-f7550f6c168d`, estado `SUCCESS`.
- cTrader Open API de IC Markets DEMO, broker legal `Raw Trading Ltd`, EURUSD nativo `symbolId=1`; alcance OAuth `accounts/SCOPE_VIEW` y ninguna función de orden.

## Resultado real — extraído del JSON del worker
State: `HISTORICAL_M5_M15_H4_QA_UNCERTIFIED`, `connected=true`.

| Métrica | Resultado real |
|---|---:|
| M5 cerradas | 600 |
| Huecos M5 | 0 |
| M15 nativas / M15 reconstruidas desde M5 | 200 / 200 |
| Coincidencias M15 UTC | 200 |
| Diferencias OHLC M15 | 0 |
| H4 nativas recuperadas, period=10 | **20** |
| H4 completas reconstruidas desde 48 M5 | **12** |
| H4 nativas con apertura UTC idéntica a H4 NY 1/5/9 | **12/12** |
| Diferencias OHLC H4 en esos 12 emparejamientos | **0** |
| Grupos H4 parciales excluidos | 1 |
| Grupos H4 rechazados | 0 |
| Fase H4 nativa UTC observada en esta muestra | **120 minutos módulo 240 (UTC 02/06/10/14/18/22)** |
| Fase H4 NY reconstruida | **120 minutos módulo 240** |
| Desplazamiento de timestamps impuesto por software | 0 |

El resultado interno H4 fue `CTRADER_NATIVE_H4_NY_OHLC_MATCH_QA`, `fullAnchorAlignment=true`, `fullOhlcAlignment=true`, `forcedTimestampShiftMinutes=0`. No hubo diferencias en apertura/máximo/mínimo/cierre, ni rellenos de datos.

**Límite crítico:** esta prueba demuestra equivalencia de anclajes y OHLC **dentro del broker cTrader DEMO para esta única muestra EURUSD**. No demuestra que TradingView IC:EURUSD tenga los mismos precios, no certifica las 7 categorías CRT ni MSS M5/M15 y no es una aprobación LIVE. Los otros 33 instrumentos necesitan pruebas de su propia sesión, precios y calendario. Para BTCUSD conservar ruta de análisis específica.

En Railway: `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssCertified=false` y gateway móvil `NOT_ATTEMPTED_IN_HISTORICAL_M5_QA`. Ninguna notificación de mercado fue enviada a la app.

## Siguiente trabajo
1. Leer los contratos de detección CRT/MSS ya aprobados (fuente soberana de reglas, no reimplementar por interpretación subjetiva).
2. Preparar cronogramas y filtros por tipo de mercado (Forex, metal, índices y BTC separado), sin extrapolar H4 EURUSD a NAS100/SP500/US30/XAUUSD.
3. Ejecutar muestras DEMO nativas en cohortes limitadas y bloquear fases o precio divergentes; no aprobar automáticamente nombres de 34 símbolos.
4. Validar causalidad de CRT 7 categorías, MSS M5/M15 independientes, no repaint, deduplicación y TTL cuatro horas antes de app/widget.

Documento basado en métricas **realmente observadas** y custodiadas, no en pruebas sintéticas ni suposiciones.
