# QORE CRT ALERTS — evidencia real: 34 × 600 velas M5 cTrader DEMO
**Corte: 7 de noviembre de 2026 · Solo Railway STAGING · Sin trading, LIVE, push, FCM, merge ni producción**

## Prueba real completa
- Repo: `mezas3238-hue/qore-deepseek-reviewer`, DRAFT PR #91, commit desplegado `925b99fd43106e3065f66d82f4c010aa6c4d5086`.
- Railway: proyecto `qore-crt-alerts-qa`, entorno `staging`, worker `crt-demo-readonly-worker`, deployment `5543e9fd-79b8-4a11-9635-944a2da6095c` estado **SUCCESS**.
- Autenticación: **IC Markets cTrader DEMO**, bróker `Raw Trading Ltd`, OAuth `accounts/SCOPE_VIEW` validado por el worker, ningún endpoint de órdenes.
- Inventario: 365 símbolos cTrader; 34/34 IDs nativos de nombre exacto cotejados con manifiesto SHA256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`. Sin mapeo TradingView aprobado.
- Resultado de lectura: `CTRADER_34_600_M5_SAMPLES_OBSERVED_UNCERTIFIED`; `attempted=34`; `completeRequestedSamples=34`; `m5Observed=34`; `blocked=0`; `totalClosedM5=20400`; `all34RequestedSamplesComplete=true`.
- **20.400 M5 cerradas reales: 600 por cada uno de los 34 símbolos (2 páginas de 300).** Los 34 reportaron fase M5 de 0 minutos, sin duplicados ni overlap entre páginas.
- **13 mercados** con discontinuidades temporales entre velas; **151 intervalos M5 ausentes entre barras observadas** en total. Los contadores representan intervalos sin barras, **no** un juicio de integridad o un calendario certificado.
- BTCUSD: mantiene ruta de sesión/CRT independiente; no asimilar automáticamente a Forex.
- `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`; gateway móvil no se invocó.

## Instrumentos y pruebas individuales
| # | ID soberano | Broker | Native ID | Grupo | M5 cerradas | Saltos | Intervalos M5 ausentes |
|---:|---|---|---:|---|---:|---:|---:|
| 1 | AUDJPY | AUDJPY | 11 | FOREX | 600 | 0 | 0 |
| 2 | GBPUSD | GBPUSD | 2 | FOREX | 600 | 1 | 1 |
| 3 | GBPJPY | GBPJPY | 7 | FOREX | 600 | 0 | 0 |
| 4 | XAUUSD | XAUUSD | 41 | METALS | 600 | 2 | 24 |
| 5 | NDX100 | USTEC | 10014 | INDICES | 600 | 2 | 24 |
| 6 | SPX500 | US500 | 10013 | INDICES | 600 | 2 | 24 |
| 7 | US30 | US30 | 10015 | INDICES | 600 | 2 | 24 |
| 8 | BTCUSD | BTCUSD | 10026 | BTC_INDEPENDENT | 600 | 4 | 22 |
| 9 | AUDUSD | AUDUSD | 5 | FOREX | 600 | 1 | 1 |
| 10 | USDCAD | USDCAD | 8 | FOREX | 600 | 1 | 1 |
| 11 | USDJPY | USDJPY | 4 | FOREX | 600 | 1 | 1 |
| 12 | EURUSD | EURUSD | 1 | FOREX | 600 | 0 | 0 |
| 13 | USDCHF | USDCHF | 6 | FOREX | 600 | 1 | 3 |
| 14 | NZDUSD | NZDUSD | 12 | FOREX | 600 | 1 | 1 |
| 15 | NZDJPY | NZDJPY | 21 | FOREX | 600 | 0 | 0 |
| 16 | NZDCHF | NZDCHF | 39 | FOREX | 600 | 1 | 1 |
| 17 | XAGUSD | XAGUSD | 42 | METALS | 600 | 2 | 24 |
| 18 | AUDCAD | AUDCAD | 18 | FOREX | 600 | 0 | 0 |
| 19 | AUDCHF | AUDCHF | 23 | FOREX | 600 | 0 | 0 |
| 20 | AUDNZD | AUDNZD | 20 | FOREX | 600 | 0 | 0 |
| 21 | CADCHF | CADCHF | 27 | FOREX | 600 | 0 | 0 |
| 22 | CADJPY | CADJPY | 15 | FOREX | 600 | 0 | 0 |
| 23 | CHFJPY | CHFJPY | 13 | FOREX | 600 | 0 | 0 |
| 24 | EURAUD | EURAUD | 14 | FOREX | 600 | 0 | 0 |
| 25 | EURCAD | EURCAD | 17 | FOREX | 600 | 0 | 0 |
| 26 | EURCHF | EURCHF | 10 | FOREX | 600 | 0 | 0 |
| 27 | EURGBP | EURGBP | 9 | FOREX | 600 | 0 | 0 |
| 28 | EURJPY | EURJPY | 3 | FOREX | 600 | 0 | 0 |
| 29 | EURNZD | EURNZD | 26 | FOREX | 600 | 0 | 0 |
| 30 | GBPAUD | GBPAUD | 16 | FOREX | 600 | 0 | 0 |
| 31 | GBPCAD | GBPCAD | 19 | FOREX | 600 | 0 | 0 |
| 32 | GBPCHF | GBPCHF | 40 | FOREX | 600 | 0 | 0 |
| 33 | GBPNZD | GBPNZD | 25 | FOREX | 600 | 0 | 0 |
| 34 | NZDCAD | NZDCAD | 30 | FOREX | 600 | 0 | 0 |

## Interrupciones exactas UTC (pendientes de clasificación de calendario)
La hora inicial es el cierre de la última vela disponible; la final es la apertura de la siguiente. Nunca se fabrican barras intermedias.

| Instrumento | Última M5: cierre UTC | Siguiente M5: apertura UTC | Intervalos M5 ausentes |
|---|---|---|---:|
| GBPUSD | 2026-11-05T22:10:00.000Z | 2026-11-05T22:15:00.000Z | 1 |
| XAUUSD | 2026-11-04T22:00:00.000Z | 2026-11-04T23:00:00.000Z | 12 |
| XAUUSD | 2026-11-05T22:00:00.000Z | 2026-11-05T23:00:00.000Z | 12 |
| NDX100 | 2026-11-04T22:00:00.000Z | 2026-11-04T23:00:00.000Z | 12 |
| NDX100 | 2026-11-05T22:00:00.000Z | 2026-11-05T23:00:00.000Z | 12 |
| SPX500 | 2026-11-04T22:00:00.000Z | 2026-11-04T23:00:00.000Z | 12 |
| SPX500 | 2026-11-05T22:00:00.000Z | 2026-11-05T23:00:00.000Z | 12 |
| US30 | 2026-11-04T22:00:00.000Z | 2026-11-04T23:00:00.000Z | 12 |
| US30 | 2026-11-05T22:00:00.000Z | 2026-11-05T23:00:00.000Z | 12 |
| BTCUSD | 2026-11-05T22:00:00.000Z | 2026-11-05T22:05:00.000Z | 1 |
| BTCUSD | 2026-11-06T21:55:00.000Z | 2026-11-06T22:45:00.000Z | 10 |
| BTCUSD | 2026-11-07T09:25:00.000Z | 2026-11-07T10:15:00.000Z | 10 |
| BTCUSD | 2026-11-07T22:00:00.000Z | 2026-11-07T22:05:00.000Z | 1 |
| AUDUSD | 2026-11-04T22:25:00.000Z | 2026-11-04T22:30:00.000Z | 1 |
| USDCAD | 2026-11-04T22:35:00.000Z | 2026-11-04T22:40:00.000Z | 1 |
| USDJPY | 2026-11-05T22:05:00.000Z | 2026-11-05T22:10:00.000Z | 1 |
| USDCHF | 2026-11-04T22:05:00.000Z | 2026-11-04T22:20:00.000Z | 3 |
| NZDUSD | 2026-11-04T22:15:00.000Z | 2026-11-04T22:20:00.000Z | 1 |
| NZDCHF | 2026-11-04T22:15:00.000Z | 2026-11-04T22:20:00.000Z | 1 |
| XAGUSD | 2026-11-04T22:00:00.000Z | 2026-11-04T23:00:00.000Z | 12 |
| XAGUSD | 2026-11-05T22:00:00.000Z | 2026-11-05T23:00:00.000Z | 12 |

**Lectura provisional:** XAUUSD, XAGUSD, USTEC, US500 y US30 presentan pausas regulares de 22:00–23:00 UTC en 4 y 5 de noviembre. Esto es *compatible* con pausas diarias, pero **falta contrastar el horario oficial aplicable a Raw Trading Ltd/IC Markets en esas fechas**. En Forex, las interrupciones pequeñas alrededor de 22:00 UTC requieren confirmación de liquidez/sesión del feed. BTCUSD muestra interrupciones de ~50 minutos y barras dispersas que tampoco pueden etiquetarse como normales sin el calendario específico de crypto.

## Certificaciones NO cumplidas
Este hito es **cobertura M5 34/34**, NO 34/34 señales:
1. Verificar sesiones reales, cierres, feriados, DST e interpretar discontinuidades por mercado, sin relleno artificial.
2. Comparar M15/H4 **nativas** vs derivadas de M5 por instrumento, con reglas de sesión independientes; los tests EURUSD no se transfieren automáticamente.
3. Comparar, cuando exista una fuente independiente fiable, cTrader vs TradingView IC: símbolo por símbolo.
4. Certificar los siete **roles/categorías CRT** de contrato, sus estados provisional/rechazado y detectores MSS M5/M15 causales separados. Holdout, no repaint, negativos, evento a evento y TTL 4 horas.
5. Conectar gateway QORE Mobile / Android widget solo con pruebas positivas. Mantener bloqueados LIVE, órdenes y notificaciones a usuarios.

**Estado de gobernanza:** PR DRAFT sin merge, worker DEMO de una sola pasada, máximo dos sesiones read-only simultáneas, GitHub fuente de verdad.
