# CRT RADAR PRO V34.12P — Corregir escaneo parcial: Asia, Londres y Nueva York

Fecha: 2026-11-04 · PR #74 DRAFT · NO LIVE, NO PUSH, NO MERGE.

## Que reporta el Owner

Con el Pine 34+Chart en 4H el dashboard muestra `R:34/34`, `C:0`, `QA:0`, MSS5q:0/MSS15q:0 y candidatos 2C*. No observa CRT fuera de la sesion NY. El mismo indicador tenia ademas un incidente PDH/PDL contra vela Daily, tratado en V34.12O.

## Diagnostico comprobado EN CODIGO

1. El input anterior `scheduleMode` usaba por defecto **`Solo C1 de tres horarios NY`**. `f_allowed()` elegia Forex/BTC NY 01/05/21, indices NY 02/06/22, exactamente 3 de 6 bloques H4 por ciclo. C1 de las otras H4 se descartaban incluso con OHLC completas. Aunque esos horarios estan expresados en el reloj NY, no son todos la sesion de Nueva York: los otros bloques incluyen actividad de Asia y Londres.
2. La visualizacion del chart 4H exigia que `own.nyH4Start == time`, igualdad exacta entre el bucket H4 derivado del feed M5 y el horario de inicio de la vela abierta en el grafico. Esto puede fallar por horario del proveedor o fase M5 +1/+2 y ocultar CRH/CRL/MSS aunque haya evidencia del mismo `Signal`/slot.
3. `R:34/34` cuenta feeds con un `Signal` legible, **no** CRH/CRL ni 34 CRT. `2C*` es un candidato, nunca una confirmacion. `scanCrtValid` continua sin certificar fuentes +1/+2 bajo `qaPhase1NonBtc`.

## Version V34.12P creada sin reemplazar V34.12O

`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12P_C1_TODAS_H4_24H_QA_NO_LIVE.pine`

- `scheduleMode = "Todas las H4 NY"` predeterminado: Forex/BTC 01/05/09/13/17/21, indices 02/06/10/14/18/22. Son SEIS bloques H4 (ciclo de 24 horas). El antiguo filtro de 3 horarios se mantiene opcional solo para comparacion.
- `visualChartAligned` acepta H4 240m ademas de M5 y M15 sin requerir igualdad literal entre el inicio del bucket H4 propio de M5 y el open de H4 del chart. Se mantiene obligatorio `integratedSlot` de broker+symbol exacto, `chartCoreC1/chartExtraC1`, C1 y extremos propios, `visible` y uso de `xloc.bar_time`. No crea señales a partir de una hora arbitraria.
- El panel de estado anuncia `H4 24H QA` o `H4 3/6 QA` para informar el modo. No cambia la logica de 48 M5 contiguas ni el cese de M5/M15 ante gaps, no mueve niveles diarios.
- Se preserva el parche de la V34.12O: PDH/PDL visuales vienen de la 1D previa del chart exacto, `request.security(syminfo.tickerid,"D",[high[1],low[1],time[1],time_close[1]],lookahead=barmerge.lookahead_on)`; el FVG H4 sigue apagado por defecto. Son los mismos 34 slots M5 + 1 solicitud D del chart, no 35 mercados.

## Puertas y limites que NO quedan resueltos

- No hay validacion real de compilacion Pine Editor ni ejecucion TradingView Android desde esta sesion. Node CI prueba contratos estaticos y la invariancia byte-por-byte de `f_engine`, no calidad de detecciones ni datos de feeds.
- `Todas las H4 NY` significa **todas las H4 del dia en la ancla NY actual**. No significa que cada H4 del broker tenga exactamente ese reloj, ni garantiza barras M5 completas durante cierres de mercado (especialmente indices/metales), DST o variaciones de proveedores. Esto requiere cotejo con velas H4 reales del mismo feed y, si fuera necesario, implementar perfil de ancla nativo por mercado como avance separado.
- Sin garantia de CRT vigente: la estructura C2 debe barrer C1 y cerrar dentro, sin doble barrida y con datos completos; MSS M5 y M15 siguen causales e independientes. No relajar reglas para producir señales artificiales.
- El dashboard actual muestra SOLO estado vivo por feed (con QA historica bajo un control distinto). Los eventos de Asia/Londres expirados no deben mostrarse como 'CRT ahora'. Para auditar eventos pasados, usar `QA: historial 2C/3C/Inside/Multi por mercado` y `QA: ver ultimo evento historico por categoria` en Ajustes.

## Comprobacion manual desde Android

1. Abrir el archivo V34.12P desde GitHub, copiar codigo entero en el mismo Pine Editor/indicador del plan Basic (conservar 12O como respaldo GitHub). Confirmar que Pine compile SIN errores.
2. Ajustes > `01 / Logica CRT` > `Escaneo C1 (24 horas)` = `Todas las H4 NY`; comprobar pie `H4 24H QA`.
3. Seleccionar **el mismo proveedor exacto** en H4 y, si no hay dibujos, probar M5/M15 para observar las ventanas, sin inferir falsamente error por ausencia de CRT vigente.
4. Activar auditoria historica para contrastar candidatos C1 de periodos que abarcan sesiones asiaticas, Londres y NY. Comparar C1/C2/CRH/CRL y MSS5/MSS15 reales, no solamente `R:34/34`.
5. Verificar PDH/PDL en `IC:US30` comparando 1D contra H4. FVG H4 OFF por defecto hasta validacion.

Suite QA: `qore-crt-alerts/test/pine-v34-12p-all-sessions-h4-qa.test.mjs`. Riesgo principal restante: incompatibilidad de ancla NY vs H4 nativa del broker en 33 instrumentos y limitaciones de historia/calc_bars_count 600; se requieren datos por proveedor para certificar 7 familias.
