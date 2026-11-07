# QORE CRT ALERTS — evidencia REAL de lectura completa 34/34 de IC Markets DEMO
**7 nov 2026 | propietario: 34 instrumentos obligatorios | laboratorio STAGING únicamente. NO MERGE / NO LIVE / NO ÓRDENES / NO FCM / NO ALERTAS a usuarios.**

## Evidencia trazable
- PR de desarrollo: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/90 (DRAFT).
- SHA de ejecución: `eb03bdcf2bffd6d296995f6e15d967f9e37d759e`; dos workflows GitHub SUCCESS.
- Railway: `qore-crt-alerts-qa`, `staging`, servicio `crt-demo-readonly-worker`, despliegue `6c05624f-da46-463c-be8e-c1c98350eee5` estado SUCCESS.
- API: cTrader DEMO `Raw Trading Ltd`, permisos de solo lectura `accounts/SCOPE_VIEW`.
- Inventario autenticado: 365 símbolos; se exigieron 34 candidatos exactos fijados al SHA-256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`.
- Estado final: `CTRADER_34_M5_SAMPLES_OBSERVED_UNCERTIFIED`, `attempted=34`, `m5Observed=34`, `blocked=0`, `all34M5Observed=true`, `withUnclassifiedGaps=8`.
- Cada símbolo recibió exactamente **300 velas históricas M5 cerradas** (total **10.200**). Los 34 reportaron fase M5 = 0 minutos. **No** se interpoló ninguna vela ausente.
- Sin certificados de paridad TV, CRT, MSS M5/M15, operaciones ni FCM. Pasarela móvil `NOT_ATTEMPTED_FULL34_M5_QA`.
- Límite de conexiones: 2 conexiones read-only simultáneas; una única consulta por símbolo, sin reintentos automáticos.

## Evidencia individual

| Slot | ID soberano | Símbolo cTrader | ID cTrader | Grupo QA | M5 cerradas | Intervalos no contiguos |
|---:|---|---|---:|---|---:|---:|
| 1 | AUDJPY | AUDJPY | 11 | FOREX | 300 | 0 |
| 2 | GBPUSD | GBPUSD | 2 | FOREX | 300 | 1 |
| 3 | GBPJPY | GBPJPY | 7 | FOREX | 300 | 0 |
| 4 | XAUUSD | XAUUSD | 41 | METALS | 300 | 1 |
| 5 | NDX100 | USTEC | 10014 | INDICES | 300 | 1 |
| 6 | SPX500 | US500 | 10013 | INDICES | 300 | 1 |
| 7 | US30 | US30 | 10015 | INDICES | 300 | 1 |
| 8 | BTCUSD | BTCUSD | 10026 | BTC_INDEPENDENT | 300 | 3 |
| 9 | AUDUSD | AUDUSD | 5 | FOREX | 300 | 0 |
| 10 | USDCAD | USDCAD | 8 | FOREX | 300 | 0 |
| 11 | USDJPY | USDJPY | 4 | FOREX | 300 | 1 |
| 12 | EURUSD | EURUSD | 1 | FOREX | 300 | 0 |
| 13 | USDCHF | USDCHF | 6 | FOREX | 300 | 0 |
| 14 | NZDUSD | NZDUSD | 12 | FOREX | 300 | 0 |
| 15 | NZDJPY | NZDJPY | 21 | FOREX | 300 | 0 |
| 16 | NZDCHF | NZDCHF | 39 | FOREX | 300 | 0 |
| 17 | XAGUSD | XAGUSD | 42 | METALS | 300 | 1 |
| 18 | AUDCAD | AUDCAD | 18 | FOREX | 300 | 0 |
| 19 | AUDCHF | AUDCHF | 23 | FOREX | 300 | 0 |
| 20 | AUDNZD | AUDNZD | 20 | FOREX | 300 | 0 |
| 21 | CADCHF | CADCHF | 27 | FOREX | 300 | 0 |
| 22 | CADJPY | CADJPY | 15 | FOREX | 300 | 0 |
| 23 | CHFJPY | CHFJPY | 13 | FOREX | 300 | 0 |
| 24 | EURAUD | EURAUD | 14 | FOREX | 300 | 0 |
| 25 | EURCAD | EURCAD | 17 | FOREX | 300 | 0 |
| 26 | EURCHF | EURCHF | 10 | FOREX | 300 | 0 |
| 27 | EURGBP | EURGBP | 9 | FOREX | 300 | 0 |
| 28 | EURJPY | EURJPY | 3 | FOREX | 300 | 0 |
| 29 | EURNZD | EURNZD | 26 | FOREX | 300 | 0 |
| 30 | GBPAUD | GBPAUD | 16 | FOREX | 300 | 0 |
| 31 | GBPCAD | GBPCAD | 19 | FOREX | 300 | 0 |
| 32 | GBPCHF | GBPCHF | 40 | FOREX | 300 | 0 |
| 33 | GBPNZD | GBPNZD | 25 | FOREX | 300 | 0 |
| 34 | NZDCAD | NZDCAD | 30 | FOREX | 300 | 0 |

**Huecos todavía sin clasificar:** GBPUSD (1), XAUUSD (1), NDX100/USTEC (1), SPX500/US500 (1), US30 (1), BTCUSD (3), USDJPY (1) y XAGUSD (1). Son conteos reales de discontinuidades entre velas consecutivas. **No** indican automáticamente pérdida de datos: antes de certificarlos hay que contrastar los horarios propios de cada mercado, feriados, sesión del broker y cierre por fin de semana. No aplicar el calendario Forex a BTCUSD o índices.

## Qué significa esta prueba, y qué todavía falta
**APROBADO**: captura histórica M5 de los **34/34** instrumentos, cuenta y bróker DEMO verificados, 34 IDs reales distintos, sin sustitución de símbolos, sin órdenes ni alertas.

**NO CERTIFICADO**: segunda ventana de al menos 600 M5 por instrumento; análisis de pausas por sesiones; comprobación nativa M15/H4 por cada uno; paridad independiente con TradingView; detección causal de las siete categorías CRT del indicador; MSS M5/M15 separados; no repaint, controles de falsos positivos, holdout, envío gateway Android y widget TTL 4 h.

**BTCUSD:** conservar ruta propia de reconocimiento y horario, aunque sus 300 M5 se obtuvieron en la misma campaña.

La aprobación de cobertura M5 **no permite** emitir señales ni operar. Mantener `QORE_PUSH_ENABLED=false`, `QORE_TRADING_ENABLED=false` y GitHub como fuente soberana.
