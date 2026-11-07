# CRT QORE: evidencia real EURUSD cTrader DEMO M5/H4 — 7 nov 2026

**Estado:** Lectura histórica y reconstrucción H4 confirmadas en QA; **equivalencia TV NO certificada**. **NO MERGE / NO LIVE / NO TRADING / NO FCM / NO PUSH / NO producción**.

## Fuente y custodia

- Repositorio: `mezas3238-hue/qore-deepseek-reviewer`, DRAFT PR #85; rama `feature/crt-demo-eurusd-paged-m5-h4-qa-20261107`.
- Commit probado y desplegado: `ceafad90106cb0140b15bd2edd32cd59ab5d0709`.
- Railway proyecto QA `qore-crt-alerts-qa`, entorno `staging`, servicio `crt-demo-readonly-worker`; despliegue **SUCCESS** `0654bf3f-7ffb-4fba-884a-40f7288c618c`.
- Cuenta: cTrader DEMO validada previamente con `SCOPE_VIEW` / OAuth `accounts`, broker title exacto `Raw Trading Ltd`. Sin credenciales ni ID de cuenta en este reporte.
- Instrumento: catálogo fijo `IC:EURUSD`; broker-native `EURUSD`, símbolo cTrader **1**, previamente identificado en manifiesto de 34 candidatos SHA-256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`. El nombre exacto no certifica por sí solo la paridad con TradingView.

## Evidencia del worker

Resultado normalizado en Railway: `HISTORICAL_M5_QA_UNCERTIFIED` / `connected=true`.

| Control | Observado |
|---|---:|
| Llamadas históricas | 2 |
| Velas M5 cerradas | **600** |
| Huecos M5 dentro de muestra | **0** |
| Fase nativa M5 (min) | **0** |
| H4 Forex NY 1/5/9 completas (48 M5 cada una) | **12** |
| Grupos H4 parciales excluidos | **1** |
| Grupos H4 rechazados | **0** |
| CRT seven-family certificado | **No** |
| MSS certificado | **No** |
| TV/cTrader OHLC pareado verificado | **No** |
| Órdenes, push, alertas de mercado | **Ninguno** |

Hubo una primera ejecución de la versión de dos páginas en la que cTrader devolvió `CTRADER_API_ERROR_UNKNOWN_ACCOUNT_PENDING` durante autenticación. Se hizo **una sola repetición manual** autorizada de la misma versión; la segunda produjo los 600 datos reales indicados arriba. El error inicial no permite concluir que la API sea estable en todas las sesiones. Ningún retry automático está habilitado.

La respuesta del worker expone **solo contadores y estado**, no credenciales ni las 600 velas OHLC; por ello **aún no existe aquí un archivo CSV reutilizable** para el comparador de `qore-core`.

## Dependencias antes de activar alertas de mercado

1. Obtención independiente y autenticada de **600+ velas M5 OHLC de TradingView `IC:EURUSD`**, con UTC, bróker y feed original identificados.
2. Exportación autorizada de los **600 OHLC reales cTrader DEMO** con timestamps (no solo contadores), manteniendo custodia privada y sin enviar al gateway ni a usuarios.
3. Comparador existente: `mezas3238-hue/qore-core/tools/crt_feed_parity/compare_ic_m5.py`, esquema `origin,tv_symbol,broker,server,open_time_utc,open,high,low,close,closed`; exige 600 timestamps M5 emparejados. Ningún dato artificial o muestra de pantalla sustituye el par real.
4. Replicar las pruebas por los otros 33 instrumentos; los índices y BTCUSD tienen controles específicos de sesión/ciclos. El manifiesto de 34 nombres sigue siendo solo `ownerApprovedMappings=0` para certificación.
5. Solo después: revisar los siete modelos CRT y MSS de 5/15 minutos, confrontarlos con el motor Pine, conectar gateway QA y widget Android con TTL 4 h.

**Interpretación:** 600 velas M5 coherentes y 12 H4 completas prueban la ingesta causal y reconstrucción de EURUSD **en cTrader DEMO**, pero no certifican la igualdad de velas con TradingView ni que el indicador de 34 mercados sea operativo. La app y widget aún no reciben alertas reales.
