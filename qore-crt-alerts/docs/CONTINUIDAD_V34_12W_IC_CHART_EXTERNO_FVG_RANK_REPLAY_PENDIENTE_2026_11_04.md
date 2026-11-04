# QORE CRT RADAR PRO — V34.12W, continuación de la auditoría externa

Fecha: 2026-11-04 · Repositorio `mezas3238-hue/qore-deepseek-reviewer` · PR #74 **DRAFT** · QA / NO LIVE / NO PUSH / NO MERGE.

## Directivas Owner irreversibles sin orden nueva

- Los **34 feeds del RADAR** siguen inmutables con proveedor **IC Markets `IC:`**, sin OANDA, sin COINBASE y sin reemplazar el slot BTC cuando se cambia de gráfico. `IC:USTEC` representa Nasdaq 100 y `IC:US500` el SPX500.
- **Seis H4 del día, siempre**: sin selector de tres horarios, sin rechazar sesiones Asia, Londres o Nueva York por horario.
- Chart dibuja PDH/PDL de Daily anterior confirmado del símbolo IC abierto con TOMADO/INTACTO independientes, y FVG de H4 nativo; ningún CRT/MSS se etiqueta como operativo sin paridad y pruebas reales.
- Usuario trabaja desde Android, cuenta TradingView Basic gratuita, **no tiene VPS**.

## Reconciliación de las tres líneas de trabajo

**A — Chart CRT para un símbolo IC no presente entre los 34 del radar.** Antes `integratedSlot==-1` impedía dibujarlo. La V34.12W incorpora una única lectura M5 adicional **condicional** únicamente si `chartIsIC && chartStaticSlot < 0`, usando `request.security(syminfo.tickerid,"5",f_engine_snapshot(),lookahead_off,calc_bars_count=600)`. El `Signal` se guarda en `integratedOwn` y usa un centinela interno `integratedSlot=34` (fuera del rango 0..33 del radar), sin añadir elementos a `scanSymbols`, sin alterar las 34 alertas vigiladas ni el nombre del feed BTC. El dashboard de 34 sigue siendo exactamente 34. Se muestra `IC EXTERNO · QA M5` o `CRT EXT SIN M5/CRT EXT SIN C1 QA` y cualquier CRT externo activo se etiqueta `2C QA EXT IC` **NUNCA RATIFICADO OPERABLE**. Falta probar si el feed exacto de cada símbolo IC tiene 48 M5 cerradas, fases H4 correctas y MSS causal.

**B — FVG H4 más cercano entre TODAS las zonas válidas del lookback.** La V34.12U/V primero elegía un shortlist de tres por distancia al **cierre H4 anterior**, luego filtraba esos tres por precio actual del chart. El cuarto FVG podía ser el más cercano hoy y quedar fuera. En W, `f_chartH4Fvgs` **recorre toda la profundidad 3..40 H4 confirmadas**, rechaza zonas completamente rellenadas y ordena los candidatos contra el `close` **H4 ACTUAL (provisional)** en contexto del mismo proveedor, eligiendo los tres más cercanos. Se conserva la distancia ATR H4 confirmada, se comprueba el relleno con los máximos/mínimos ya observados de la H4 en curso, y se reordena entre tres contra el `close` actual del chart para mostrar hasta 1..3. No se devuelve ninguna colección grande al contexto principal: 16 campos escalares que ya existían. No se añaden requests por este arreglo. **Riesgo/política de tiempo:** con `request.security(...,"240", ...,lookahead_off)` la lectura del contexto H4 en un gráfico inferior puede actualizarse a cierres H4 en el histórico, y durante H4 viva cambiar con el precio; esto es adecuado para presentación QA dinámica, pero NO es base causal certificada de entradas.

**C — Replay stateful M5/H4.** Sigue pendiente y es **bloqueante** para certificar señales. Se conserva `f_engine()` byte idéntico, mismo M5 solicitado y UDT con `barstate.islast`; tener M5 actual no prueba paridad entre un chart M5 y un chart H4 al recargar. TradingView documenta que `request.security()` de lower timeframe devuelve un único intrabar de cada barra del gráfico y que el contexto LTF puede diferir en realtime/histórico. La certificación requiere capturar eventos cerrados por `feed+symbol+bar_end+C1+family+MSS5+MSS15`, comparar chart M5/M15/H4 sin datos futuros, registrar recarga y validar fases exactas del proveedor. No habilitar alertas operables hasta pasar.

## Archivo y QA

Nuevo: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12W_IC_CHART_EXTERNO_FVG_NATIVE_QA_NO_LIVE.pine`.

Test: `qore-crt-alerts/test/pine-v34-12w-ic-external-chart-and-all-fvg-candidates.test.mjs` verifica invariancia de motor, 34 IC, H4 6/6, presupuesto 38/40 máximo estimado, branch Chart externo sin mutar Radar34, FVG comparado con las cuatro zonas de ejemplo (cuarta más cercana ahora debe entrar en top3), sin fugas de velas H4 futuras usadas para definir FVG, Daily PDH/PDL y HUD de 6 filas.

Presupuesto: **34 M5 del radar + 1 M5 del chart si es externo + 2 Daily del chart + 1 H4 del chart = 38 solicitudes únicas máximas previstas** para Basic (frente a 37 de V). No garantiza compilación, runtime, consumo de memoria ni permiso para todos los símbolos IC. Usar solo QA.

## Matriz E2E no ejecutada todavía

1. **IC:EURCAD M15** y **IC:EURGBP H4** (dentro de 34), 1D anterior debe coincidir con PDH/PDL y TOMADO por mecha, FVG más próximo de H4 válido.
2. **IC:US30 H4**, **IC:USTEC H4**, index clocks correctos con día completo (no selector 3H4).
3. Símbolo fuera del radar **pero disponible con proveedor IC**, p.ej. IC:EURTRY si existe en TradingView: HUD debe mostrar `IC EXTERNO · QA M5` y `CRT EXT SIN M5` o detección QA exacta, sin cambiar ninguno de los 34 feeds.
4. FVG caso cuatro zonas: cuarta zona que se acerca debe reemplazar a una distante; mostrar 1-3 por relevancia y ATR, no por edad.
5. Cambiar temporalidad M5→M15→H4 y volver, cerrar/reabrir gráfico y comparar eventos cerrados; no certificar parity C1/C2/C3 ni MSS sin replay detallado.

## Importante: ninguna sobrepromesa

- Pruebas Node en GitHub comprueban propiedades textuales/fixture sintéticos; NO compilan Pine ni conectan TradingView gráfico con datos reales.
- Este archivo no sustituye la necesidad de 5 capturas del HUD diagnóstico para localizar fallos residuales. El código es completo en GitHub, usar RAW para auditor externo.
- Sin merge, sin aviso push ni sin LIVE.