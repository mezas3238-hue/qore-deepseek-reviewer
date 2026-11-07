# QORE CRT — cuatro nuevos mercados observados en IC Markets cTrader DEMO
**7 de noviembre de 2026 · QA STAGING · NO LIVE / NO TRADING / NO PUSH / NO MERGE / NO FCM / NO producción.**

## Procedimiento real

Tras la certificación intra-cTrader EURUSD (600 M5, 200 M15 nativas/derivadas idénticas, 12 H4 nativas/derivadas idénticas), se ejecutaron **cuatro pruebas independientes** de una sola página de histórico M5 en `crt-demo-readonly-worker` de Railway STAGING usando la cuenta DEMO ya verificada con `accounts / SCOPE_VIEW` y bróker `Raw Trading Ltd`.

Se ajustaron solo las variables `QORE_CT_SAMPLE_SYMBOL_ID`, `QORE_CT_SAMPLE_SYMBOL_NAME`, `QORE_CT_SAMPLE_INSTRUMENT_ID`; en el primer cambio desde EURUSD también se fijaron `QORE_CT_QA_HISTORY_PAGES=1`, `QORE_CT_QA_NATIVE_M15_COMPARE=DISABLED`, `QORE_CT_QA_NATIVE_H4_AUDIT=DISABLED`. La exportación masiva CSV permaneció deshabilitada. No hubo solicitud de órdenes ni push.

| Instrumento de catálogo | Nombre bróker | ID nativo | M5 cerradas | Fase min | Discontinuidades M5 | Deploy ID | Estado |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| NDX100 (NAS100) | USTEC | 10014 | 300 | 0 | 1 | `6fededfd-5f2f-45d4-97ed-eec90ee16e64` | SUCCESS |
| SPX500 (SP500) | US500 | 10013 | 300 | 0 | 1 | `0682f09e-1e8c-4fab-b9f0-3115a335c23c` | SUCCESS |
| US30 | US30 | 10015 | 300 | 0 | 1 | `faf430e6-a3bd-414a-92d3-3398dfc62d0c` | SUCCESS |
| XAUUSD | XAUUSD | 41 | 300 | 0 | 1 | `0c5fb1d9-ecdf-483c-811a-6ccab3dee9b9` | SUCCESS |

Todos devolvieron `HISTORICAL_M5_QA_UNCERTIFIED`, `connected=true`, `canTrade=false`, `sendPush=false`. El worker reportó `qaMobileProbeBridge=AWAITING_OWNER_QA_BRIDGE_AUTHORIZATION`; **eso no representa entrega de alertas**. Nunca se modificó el gateway de QORE Mobile.

Las cuatro discontinuidades temporales detectadas son **hechos observados**, aún no clasificadas como pausa válida de la sesión del instrumento versus fallo de datos; no se corrigen por interpolación ni velas inventadas. Una sola muestra de 300 M5 no certifica la lógica H4, siete CRT o MSS; estos cuatro mercados siguen **no certificados**. La coincidencia por nombre con el inventario de 34 candidatos sigue pendiente de aprobación de paridad independiente.

## Cobertura real acumulada

- Inventario de cTrader DEMO: 365 instrumentos, 34 candidatos de nombre exacto sin ambigüedad (no equivale a paridad con TradingView).
- Histórico real M5 probado: **5 de 34** instrumentos, incluyendo EURUSD (600) y estos cuatro (300 cada uno); `sourceParityCertified=false` para todos.
- EURUSD: 200 M15 nativas iguales a 200 derivadas y 12 H4 nativas iguales a 12 NY 1/5/9 en esa muestra, fuente exclusivamente cTrader.
- Aún faltan: 29 instrumentos sin lectura histórica M5 real, perfiles de sesión específicos, M5/M15/H4 para índices y metal, BTCUSD por ruta distinta, siete CRT y MSS M5/M15 causal validados contra implementaciones y holdout, Android QA y widget.

## Orden de trabajo siguiente

1. Construir/auditar calendarios verificables para USTEC, US500, US30 y XAUUSD, y determinar si las discontinuidades corresponden a cierres reglamentarios o huecos anómalos. No aplicar reglas continuas de EURUSD a índices/metales.
2. Llevar cada mercado a un mínimo de 600 M5 cerradas en rangos y sesiones controladas, luego comparar M15 y H4 nativas con reconstruidas, sin forzar anclas.
3. Repetir por los otros 29 mercados y BTCUSD por su reconocimiento específico.
4. Validar las siete **categorías/roles** actuales de CRT, no siete estrategias independientes. Fuente soberana de categorías en `crt-seven-role-certification-readiness.mjs` y `crt-seven-category-event-parity.mjs` (algunas son PROVISIONAL/REJECTED y nunca deben generar entrada).
5. Certificar los detectores MSS separados M5 y M15 con datos causales; contrastar eventos, timestamps, no repaint, controles negativos/holdout, deduplicación y expiración de alerta TTL 4 horas.
6. Conectar QORE Mobile + widget solamente tras certificación positiva, sin LIVE ni FCM real antes.

**Gobernanza:** GitHub fuente de verdad, PR DRAFT abierto sin merge, toda investigación actual exclusivamente DEMO en Railway STAGING.
