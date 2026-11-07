# QORE CRT ALERTS — examen REAL 34/34 mercados cTrader DEMO M5
**Fecha: 2026-11-07 | Solo STAGING y SCOPE_VIEW | sin LIVE, órdenes, merge, alertas ni FCM**

## Corrección de alcance solicitada por Owner
**OBLIGATORIAMENTE 34 instrumentos.** Las primeras lecturas de EURUSD, NAS100/USTEC, SP500/US500, US30 y oro/XAUUSD fueron únicamente el piloto de 5. No se permite certificar el proyecto, su indicador, sus siete categorías CRT ni su app/widget a partir de 5/34.

El inventario realmente autenticado de `Raw Trading Ltd` cTrader DEMO contiene 365 símbolos. Se observaron 34 correspondencias de nombre exacto, sin ambiguos. Huella SHA-256 del manifiesto recuperado desde logs privados originales: `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`. Los IDs **NO** están aprobados como equivalencias TradingView/OHLC ni originan señales.

## Examen de lectura M5 de 34/34 en un único job

La variable STAGING explícita `QORE_CT_QA_COHORT34=OWNER_APPROVED_FULL_34_DEMO_M5_QA` selecciona una ejecución de laboratorio de alcance completo.

1. Comprueba `DEMO`, OAuth `accounts/SCOPE_VIEW`, nombre exacto del broker, `QORE_TRADING_ENABLED=false`, `QORE_PUSH_ENABLED=false`, TTL 14400, exportación CSV y auditoría nativa EURUSD deshabilitadas.
2. Obtiene **un inventario nuevo de la API**, verifica los 34 nombres/IDs contra el manifiesto real previamente obtenido y su huella SHA256. Si falta uno, cambia un ID o aparecen ambigüedades, **NO** realiza peticiones históricas.
3. Consulta 34 instrumentos cTrader DEMO nativos, incluido BTCUSD, cada uno con **hasta 300 M5 cerradas** y un límite de 25 s por sesión. Máximo **dos conexiones** read-only simultáneas y ninguna reintento automático. Cada sesión valida nuevamente el mismo broker/cuenta DEMO, el ámbito VIEW y el nombre/ID de ese símbolo antes de solicitar M5. Cada respuesta solo expone contadores; nunca OHLC a gateway.
4. Escribe una línea `CTRADER_34_M5_QA_ROW` por instrumento, con `slot`, `instrumentId`, `tvSymbol`, `brokerNativeName`, `symbolId`, grupo (FOREX, METALS, INDICES o BTC_INDEPENDENT), barras M5 devueltas, fase e intervalos no contiguos. Un fallo de un símbolo queda explícitamente `M5_READ_BLOCKED_OR_EMPTY_QA`. **Nunca** se sustituye un símbolo por otro ni se inventan velas.
5. Al terminar emite `CTRADER_34_M5_QA_FINAL` con `attempted=34`, `m5Observed`, `blocked`, `withUnclassifiedGaps`, `all34M5Observed`, y los gates `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sendPush=false`, `canTrade=false`.
6. **Nunca** publica en `publishQaProbe`, QORE Mobile, Android widget, Firebase o Supabase. El worker no abre port público. Railway restartPolicy = NEVER y no ejecuta loop infinito.

La ejecución no prueba que todos tengan 300 M5; la disponibilidad real puede variar por horario de sesiones, mercados cerrados, feriados o rate limits. Se reportarán hechos y fallos, no resultados inventados.

## Tabla soberana 34 (nombre cTrader, identificador de inventario real)

| Slot | Instrumento | Nombre broker | ID |
|---:|---|---|---:|
| 1 | AUDJPY | AUDJPY | 11 |
| 2 | GBPUSD | GBPUSD | 2 |
| 3 | GBPJPY | GBPJPY | 7 |
| 4 | XAUUSD | XAUUSD | 41 |
| 5 | NDX100 | USTEC | 10014 |
| 6 | SPX500 | US500 | 10013 |
| 7 | US30 | US30 | 10015 |
| 8 | BTCUSD | BTCUSD | 10026 |
| 9 | AUDUSD | AUDUSD | 5 |
| 10 | USDCAD | USDCAD | 8 |
| 11 | USDJPY | USDJPY | 4 |
| 12 | EURUSD | EURUSD | 1 |
| 13 | USDCHF | USDCHF | 6 |
| 14 | NZDUSD | NZDUSD | 12 |
| 15 | NZDJPY | NZDJPY | 21 |
| 16 | NZDCHF | NZDCHF | 39 |
| 17 | XAGUSD | XAGUSD | 42 |
| 18 | AUDCAD | AUDCAD | 18 |
| 19 | AUDCHF | AUDCHF | 23 |
| 20 | AUDNZD | AUDNZD | 20 |
| 21 | CADCHF | CADCHF | 27 |
| 22 | CADJPY | CADJPY | 15 |
| 23 | CHFJPY | CHFJPY | 13 |
| 24 | EURAUD | EURAUD | 14 |
| 25 | EURCAD | EURCAD | 17 |
| 26 | EURCHF | EURCHF | 10 |
| 27 | EURGBP | EURGBP | 9 |
| 28 | EURJPY | EURJPY | 3 |
| 29 | EURNZD | EURNZD | 26 |
| 30 | GBPAUD | GBPAUD | 16 |
| 31 | GBPCAD | GBPCAD | 19 |
| 32 | GBPCHF | GBPCHF | 40 |
| 33 | GBPNZD | GBPNZD | 25 |
| 34 | NZDCAD | NZDCAD | 30 |

## Gates posteriores (no confundir)
- **Lectura M5 34/34**: solo confirma existencia de datos históricos cTrader por símbolo, con la discontinuidad reportada.
- **Causalidad multi-timeframe 34/34**: completar M5/M15/H4 con perfiles de sesiones y DST verdaderos; BTCUSD no usa automáticamente la estructura Forex.
- **Paridad TradingView ↔ cTrader 34/34**: comparar dos fuentes OHLC independientes cuando sea técnicamente posible; un nombre de símbolo no certifica equivalencia.
- **Siete roles CRT**: no son siete estrategias independientes; algunos modelos son provisionales/rechazados. Mantener contratos existentes sin interpretar que todo estado es una oportunidad operable.
- **MSS M5 y MSS M15**: detectores separados y causalmente corroborados, no dos alias del mismo evento. Solo tras controles positivos/negativos, no repaint, expiración de 4 horas, dedup y Android QA corresponde planificar notificaciones.
- Sin intervención en servicios de Movete Fácil, QORE Core LIVE, FundedNext ni VPS.
