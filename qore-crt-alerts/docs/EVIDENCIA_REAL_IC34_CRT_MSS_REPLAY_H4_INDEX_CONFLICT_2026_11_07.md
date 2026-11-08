# QORE CRT — INFORME REAL: 34 mercados, diagnóstico causal CRT/MSS y bloqueo H4 de índices

**Fecha de corte:** 2026-11-07/08 UTC. **Estado:** Railway STAGING cTrader DEMO SCOPE_VIEW. **NO MERGE, LIVE, órdenes, push/FCM ni señales operables.**

## Identidad de evidencia

- GitHub PR #94 (DRAFT): https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/94
- SHA desplegado: `2cfb2bfe1361e67cc54745914d13576c5044f0ca`
- Railway proyecto `qore-crt-alerts-qa`, entorno `staging`, worker `crt-demo-readonly-worker`, despliegue `3bc3d264-4ab9-4ad9-ac74-9dc639b40fcc` en estado SUCCESS.
- cTrader IC Markets DEMO, cuenta Raw Trading Ltd, OAuth SCOPE_VIEW, manifest de 34 IDs reales SHA-256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`.
- Precondición real cumplida: 34/34 con 600 M5 cerradas, M15 y H4 nativas leídas y comparadas previamente en bloques elegibles; NO paridad independiente con TradingView.

## Resultado real del motor actual — no confundir con certificación

| Medida | Resultado |
|---|---:|
| Símbolos únicos consultados | 34/34 |
| Auditorías de reloj/identidad CRT/MSS | **34/34** |
| Símbolos evaluados por el motor de diagnóstico | **31** |
| Índices bloqueados por incompatibilidad de H4 | **3** |
| Ciclos CRT con C1/C2 cerradas revisados | **183** |
| Testigos diagnósticos de MSS M5 en velas cerradas | **46** |
| Testigos diagnósticos de MSS M15 en velas cerradas | **36** |
| Certificación de señales de los 34 | **NO** |

**Bloqueos comprobados:** `NDX100`, `SPX500`, `US30`. Los anclajes de las H4 nativas de cTrader son UTC fase 120 minutos módulo 240; el reloj actual del agrupador para índices es fase UTC 180 minutos en la muestra de noviembre. Prohibido desplazar velas en secreto; cada mercado se etiqueta `NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA` y genera **cero ciclos CRT/MSS** en este examen.

Las confirmaciones MSS son hallazgos del algoritmo en un conjunto pequeño de velas cerradas y **no han sido corroboradas evento a evento por Pine**. Tampoco demuestran que el motor no repinte al avanzar en tiempo real. `mssM5Certified=false`, `mssM15Certified=false`, `sevenCrtRolesCertified=false`, `noRepaintCertified=false`, `tradingViewParityCertified=false`.

## Observaciones de las siete categorías del catálogo

| Categoría existente | Observaciones de laboratorio |
|---|---:|
| CRT_3C_REVERSAL | 8 |
| CRT_2C_CANDIDATE | 1 |
| CRT_2C_EXPANSION | 83 |
| CRT_INSIDE_RETURN | 1 |
| CRT_INSIDE_CONTINUATION | 4 |
| CRT_MULTICANDLE | 0 |
| CRT_M15_RETEST | 23 |

**Interpretación:** CRT_2C_CANDIDATE es provisional; CRT_2C_EXPANSION y CRT_INSIDE_CONTINUATION son estados de rechazo/contexto, no entradas. **CRT_MULTICANDLE=0** en esta muestra limitada significa que no se observaron casos compatibles, NO que la implementación esté certificada o falsificada. No se suma directamente el total de roles como si fueran oportunidades operables. CRT_M15_RETEST también es un rol de confirmación diagnóstica, no autorización de ejecución.

## Matriz individual de los 34 mercados

| Slot | Mercado | Estado diagnóstico | Ciclos H4 evaluados | Testigos MSS M5 | Testigos MSS M15 | Roles distintos observados |
|---:|---|---|---:|---:|---:|---:|
| 1 | AUDJPY | QA_REPLAY_UNCERTIFIED | 6 | 3 | 2 | 2 |
| 2 | GBPUSD | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 1 |
| 3 | GBPJPY | QA_REPLAY_UNCERTIFIED | 6 | 2 | 1 | 1 |
| 4 | XAUUSD | QA_REPLAY_UNCERTIFIED | 6 | 2 | 1 | 3 |
| 5 | NDX100 | CLOCK_MISMATCH_BLOCKED | 0 | 0 | 0 | 0 |
| 6 | SPX500 | CLOCK_MISMATCH_BLOCKED | 0 | 0 | 0 | 0 |
| 7 | US30 | CLOCK_MISMATCH_BLOCKED | 0 | 0 | 0 | 0 |
| 8 | BTCUSD | QA_REPLAY_UNCERTIFIED | 3 | 2 | 1 | 2 |
| 9 | AUDUSD | QA_REPLAY_UNCERTIFIED | 6 | 2 | 2 | 2 |
| 10 | USDCAD | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 1 |
| 11 | USDJPY | QA_REPLAY_UNCERTIFIED | 6 | 1 | 0 | 2 |
| 12 | EURUSD | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 2 |
| 13 | USDCHF | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 2 |
| 14 | NZDUSD | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 1 |
| 15 | NZDJPY | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 3 |
| 16 | NZDCHF | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 2 |
| 17 | XAGUSD | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 2 |
| 18 | AUDCAD | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 1 |
| 19 | AUDCHF | QA_REPLAY_UNCERTIFIED | 6 | 2 | 1 | 1 |
| 20 | AUDNZD | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 2 |
| 21 | CADCHF | QA_REPLAY_UNCERTIFIED | 6 | 3 | 3 | 2 |
| 22 | CADJPY | QA_REPLAY_UNCERTIFIED | 6 | 3 | 3 | 2 |
| 23 | CHFJPY | QA_REPLAY_UNCERTIFIED | 6 | 2 | 2 | 2 |
| 24 | EURAUD | QA_REPLAY_UNCERTIFIED | 6 | 2 | 1 | 2 |
| 25 | EURCAD | QA_REPLAY_UNCERTIFIED | 6 | 2 | 2 | 2 |
| 26 | EURCHF | QA_REPLAY_UNCERTIFIED | 6 | 2 | 2 | 2 |
| 27 | EURGBP | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 3 |
| 28 | EURJPY | QA_REPLAY_UNCERTIFIED | 6 | 3 | 3 | 2 |
| 29 | EURNZD | QA_REPLAY_UNCERTIFIED | 6 | 0 | 0 | 2 |
| 30 | GBPAUD | QA_REPLAY_UNCERTIFIED | 6 | 3 | 1 | 3 |
| 31 | GBPCAD | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 3 |
| 32 | GBPCHF | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 2 |
| 33 | GBPNZD | QA_REPLAY_UNCERTIFIED | 6 | 1 | 1 | 2 |
| 34 | NZDCAD | QA_REPLAY_UNCERTIFIED | 6 | 3 | 2 | 2 |

## Trabajos bloqueantes siguientes

1. **Reloj de índices:** confrontar el H4 nativo y la definición de C1 aprobada por el Owner. Preparar alternativa en QA que compare ambos relojes, sin modificar silenciosamente `ny-clock.mjs` ni habilitar señales.
2. **Pine vs Trader Lab:** guardar y comparar trazas por C1, categoría, dirección, tiempo exacto, MSS M5/M15 y estado provisional/rechazado sobre el **mismo OHLC**. No basta coincidir 7 bits de dashboard.
3. **Holdout y no repaint:** controles positivos/negativos para 7 roles, incluyendo MULTI4 y MULTI_N, ventanas históricas amplias y control de eventos antes/después de cierre.
4. **Sesiones:** resolver huecos de 13 mercados identificados en PR #92, especialmente BTCUSD, y revisar DST.
5. **App/widget:** solo una vez certificadas las fuentes, la causalidad y los eventos; TTL 4 horas, deduplicación y E2E Android QA antes de cualquier push real.

El job no se conecta al gateway móvil. Permanecen `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`. GitHub es la fuente soberana.
