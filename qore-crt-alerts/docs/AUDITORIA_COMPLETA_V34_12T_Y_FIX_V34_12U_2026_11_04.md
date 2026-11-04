# Auditoría V34.12T completa y revisión V34.12U — FVG / HIST / 34 IC

Fecha 2026-11-04 · PR #74 DRAFT · QA / NO LIVE / NO PUSH / NO MERGE.

## Integridad de fuente: respuesta al auditor

La copia enviada al auditor quedó truncada en un comentario dentro de `type Signal`, pero el blob de GitHub **NO está truncado**. Fuente completa V34.12T: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12T_IC_MARKETS_34_FIJOS_QA_NO_LIVE.pine`, **3.443 líneas**, ~215 KB. Está la declaración completa `Signal`, `f_engine()` en torno a la línea 524, `Signal.new()` cerca de 2268, todos los módulos de chart/PDH/PDL/FVG y la limpieza final de gráficos en ~3440.

URL completo (usuario autenticado en GitHub): https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/crt-v34-11a-seven-catalog-34feeds-20261102/crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12T_IC_MARKETS_34_FIJOS_QA_NO_LIVE.pine

Para la auditoría de otro agente, usar GitHub en modo RAW o descargar **el archivo .pine completo**; no copiar los primeros caracteres desde una conversación con límite de texto. Verificar explícitamente `f_engine() =>`, `Signal.new(...)`, `f_chartH4Fvgs(...)` y el bloque final `line.delete(pdlChartLine)`.

## Evaluación punto por punto de la auditoría externa

1. **6 H4 fijas:** confirmado. NO constituye automáticamente un bug ni duplica señales válidas: expande los candidatos C1, pero la aceptación todavía exige estructura C1/C2 cerrada, sweeps y MSS causal. El Owner exigió seis H4, por lo cual **no se vuelve a tres**. No cambiar `maxH4Life` de forma especulativa (solo afecta Inside y eventos relacionados).
2. **keepLastCRT=true:** confirmado en T. Fase 3 solo se dibuja como `2C HIST QA` gris, no como activo, pero la superposición confunde. La nueva U usa `keepLastCRT=false` **por defecto**, conservando la opción manual de historial QA con 48 horas. Motor intacto.
3. **FVG con ATR H4:** confirmado; `ta.atr(14)[1]` se calcula en contexto `240` del ticker del chart, o sea ATR de una vela H4 ya cerrada. FVG H4 no depende del tamaño de C1, coherente con la zona nativa.
4. **FVG maxZones=1:** confirmado. El bug real es seleccionar entre candidatos según `close[1]` en contexto H4 y aplicar la distancia sobre `close` actual DESPUÉS de seleccionar, por lo cual una zona cercana actual puede quedar fuera. U corrige **ranking en el chart entre las tres candidatas retornadas**, considerando toque, relleno y ATR antes de escoger 1–3. No obliga a mostrar tres y deja 1 por defecto para mantener gráfica legible.
5. **FVG lookback24:** confirmado (hasta 24 H4 cerradas), pero el costo NO puede deducirse exactamente como 4×: el algoritmo tiene lazos internos de mitigación por cada candidato y cada llamada del request se evalúa según historiales. Optimizar solo después de medir presupuesto/runtime real.
6. **max_boxes_count=5:** confirmado. Se destinan 3 boxes FVG, no `1 PDH/PDL box` (los PDH/PDL se dibujan con `line.new`, no `box.new`). Es capacidad de objetos declarada, no prueba de que una etiqueta exista.
7. **IC:USTEC índice:** confirmado; `idxList` y la clasificación específica lo reconocen como índice. Fuente soberana `IC:USTEC`, se prohíben fallbacks OANDA.
8. **PDH/PDL solo BTC:** desactualizado/falso en V34.12T. Los dos niveles visuales provienen del **Daily confirmado del mismo chart IC**: `request.security(syminfo.tickerid,"D",[high[1],low[1],time[1],time],lookahead_on)`. Dos estados independientes `PDH TOMADO/INTACTO`, `PDL TOMADO/INTACTO` y panel `DAILY`, incluso si CRT=0. El motor CRT mantiene su propia liquidez RTH interna, NO se dibuja como nivel 1D.
9. **Chart solo 34 y misma fuente exacta:** sigue siendo un fallo de arquitectura para `CRT/MSS` fuera de esos 34, documentado en auditoría maestra. FVG y PDH/PDL del chart IC no requieren slot válido, pero NO hay garantía en otro broker porque el Owner prohíbe cambiar fuentes. Si abre OANDA/COINBASE se muestra `FUENTE NO IC`; Pine no puede cambiar el proveedor elegido en el encabezado de TradingView.
10. **Historial/recarga:** el snapshot `request.security(...,"5",f_engine_snapshot())` en un chart mayor M5 NO constituye un ledger completo. Cambiar de timeframe puede cambiar qué ventana queda visible. Requiere auditoría por OHLC real, no inferir saturación por seis H4.

## Cambios auditados en nueva V34.12U (T conservada sin modificar)

Nuevo archivo: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12U_IC_FVG_RELEVANCIA_QA_NO_LIVE.pine`.

- V34.12U mantiene **exactamente** `s01..s34` IC Markets, IC:USTEC/IC:US500 y seis H4/24h, sin `input.symbol` ni `array.set` del BTC y sin modificación de `f_engine()` o `Signal.new`.
- `keepLastCRT=false` por defecto en modo corriente; historial 48h solo si el Owner lo habilita conscientemente; se conserva el rótulo `2C HIST QA` de fase 3, nunca señales nuevas.
- `f_chartH4Fvgs(depth)` **sigue recogiendo y clasificando hasta tres candidatas no rellenadas** en un shortlist basado en el cierre H4 anterior. Luego, **en el chart actual** usa `f_chartZoneDistance(close,top,bottom)` sobre las 3, verifica `currentH4` rellenado + `1.5*ATR` y ordena solo las que siguen siendo relevantes con `array.sort_indices` antes de dibujar 1–3 boxes. Los FVG completamente rellenados no vuelven a mostrarse.
- **Limitación explícita**: el shortlist inicial aún contiene solo las tres zonas más próximas al cierre H4 anterior. Un cuarto FVG que hoy se vuelva más cercano pero quedó fuera del shortlist no se verá; falta un mecanismo de candidatos completo o re-ranking dentro de la fuente H4 para universalidad certificada. No presentar la U como FVG perfecto.
- 34 M5 + 2 solicitudes Daily + 1 H4 = **37 requests únicos teóricos** para Basic (sin variación respecto a T), sujeto a límites de runtime y memoria. No se agregó fuente ajena a IC Markets.

## Pruebas CI

`qore-crt-alerts/test/pine-v34-12u-current-fvg-rank-and-history-default.test.mjs`: verifica archivo completo, 34 IC fijos, seis H4, motor intacto, historial desactivado por defecto y selección FVG al precio actual dentro del shortlist; conserva PDH/PDL y presupuesto de solicitudes. Una prueba sintética reproduce la zona históricamente primera que deja de estar cerca hoy y confirma selección de la segunda.

**Condición QA obligatoria:** pruebas Node y GitHub verdes solo validan contratos de código; todavía NO hay compilación real en Pine Editor ni comparación con H4 de IC Markets. No afirmar certificación ni despliegue de señales.

## Cómo transferir el código completo al auditor

1. Abrir el enlace de GitHub de V34.12U, en vista de archivo completo, y elegir **Raw** o descargar el `.pine`, en lugar de copiar un extracto de una conversación.
2. Verificar inicio `//@version=6`, presencia de `f_engine()` y `Signal.new()`, y terminación con limpieza de objetos `line.delete(pdlChartLine)`. Si falta alguna sección, el transporte volvió a truncar.
3. Analizar primero la UDT y funciones completas; si hay un error de compilación Pine, conservar línea y mensaje exactos. No depender solo de los Node tests.
