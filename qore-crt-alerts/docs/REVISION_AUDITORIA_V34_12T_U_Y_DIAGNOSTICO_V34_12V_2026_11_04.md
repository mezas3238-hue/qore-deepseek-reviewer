# Revisión de auditoría externa V34.12T y diagnostico Chart V34.12V

Fecha 2026-11-04 · PR #74 DRAFT · QA · NO LIVE, NO PUSH, NO MERGE.

## Resumen ejecutivo

El auditor encontró restricciones reales, pero comete un error lógico grave al presentar los ocho gates como una sola cadena que debe superarse para mostrar absolutamente cualquier dibujo. **CRT/MSS, PDH/PDL y FVG tienen rutas de datos independientes**: una ausencia de evento CRT NO autoriza ocultar PDH/PDL ni FVG. En T/U, PDH/PDL del gráfico dependen de Daily del ticker IC y del timeframe soportado; FVG depende de H4, ATR, zona disponible y timeframe; CRT/MSS dependen además del slot 34, M5 y la validez del evento.

## Reconciliación punto por punto con el Pine real

| Afirmación del auditor | Estado comprobado | Consecuencia |
|---|---|---|
| `chartIsIC = prefix == IC` bloquea feeds externos | Sí, intencional por orden Owner | Todos los feeds radar fijos IC. Pine NO puede cambiar automáticamente el proveedor del gráfico abierto. Un gráfico no IC informa bloqueo, nunca mezcla cotizaciones. |
| Slot `na` equivale a proveedor incorrecto | **Falso / incompleto** | `integratedSlot` requiere proveedor+símbolo IC y además `Signal` M5 utilizable; por tanto `na` también puede reflejar fuente M5 no disponible. `chartStaticSlot` distingue coincidencia del mercado de disponibilidad de `Signal`. |
| `visualChartAligned` bloquea absolutamente todo en H1/M30 | **Falso** | Limita CRT/MSS a M5/M15/H4; PDH/PDL y FVG son independientes y pueden aparecer en H1/M30. Chart CRT en esas otras TF sigue pendiente de diseño/validación. |
| `integratedSlot` debe coincidir con los 34 para PDH/PDL/FVG | **Falso para T/U** | Daily = `syminfo.tickerid` y FVG H4 = `syminfo.tickerid`, ambos bajo proveedor IC; `integratedSlot` solo restringe CRT/MSS. |
| FVG no aparece por maxZones1 + filtro ATR | **Parcialmente cierto** | T elegía 1 de 3 basado en close H4 anterior y filtraba ATR al precio actual. U reordena las 3 candidatas por relevancia actual y después aplica `maxZones=1`. Permanece límite: fuera del shortlist inicial de 3 no se dibuja un cuarto FVG aunque sea el más cercano actual. |
| `keepLastCRT=true` contamina chart | **Corregido en U** | U/V usan `keepLastCRT=false` por defecto; fase HIST únicamente si se activa en ajustes. No cambiar ciclo seis H4 por este problema. |
| Seis H4 causan automáticamente saturación/colisiones | **Hipótesis no demostrada** | Los seis bloques son mandato del Owner y suponen elegibilidad, no seis CRT simultáneamente confirmados. Debe medirse selección exacta de C1/C2 en datos de cada broker antes de atribuir saltos. |
| `Signal.new()` está compilado y sin errores | **No acreditado** | Confirmada integridad de texto (3.443+ líneas, constructor presente); los checks Node no compilan el script Pine Editor. Solo TradingView puede certificar compilación real. |
| Ajustar a otro broker para mejorar Chart | **Rechazado por Owner** | IC Markets se mantiene como única fuente. No usar OANDA/COINBASE fallback. |

## Nueva V34.12V — prueba diagnostica sin nuevos requests

Archivo: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12V_GATES_HUD_IC_QA_NO_LIVE.pine`.

Se mantiene V34.12U completa como respaldo; misma UDT, mismo f_engine CRT/MSS, mismo FVG H4 (preselección limitada de 3) y mismos 34 IC. El único cambio es un HUD (mini panel) de **6 filas**, visible en TradingView Android en la parte inferior derecha, que informa directamente:

1. Versión identificable `V12V IC · TICKER` o `V12V NO IC`.
2. PDH numérico + `TOMADO`/`INTACTO`, o `SIN D`/`OFF`/`TF`.
3. PDL numérico + `TOMADO`/`INTACTO`, o causa.
4. Fuente: `IC SLOT 1..34`, `IC SIN SLOT RADAR 34`, o `FUENTE BLOQUEADA NO IC`.
5. CRT: `CRT VISTA OFF`, `CRT TF NO SOPORTADA`, `CRT FUERA DE RADAR 34`, `CRT SIN SNAPSHOT M5`, `CRT SIN C1 VIGENTE`, o `CRT C1 [familia]`.
6. FVG: `FVG OFF`, `FVG TF NO SOPORTADA`, `FVG H4 SIN RELOJ`, `FVG H4 SIN ATR`, `FVG SIN ZONA VALIDA`, `FVG LEJOS/RELLENADOS` o `FVG VISIBLES N`.

Así el Owner no tiene que buscar campos de Data Window en Android para cada caso. La V se usa solo para evaluar síntomas desde pantalla; los diagnósticos son evidencia de las condiciones del script, no confirmación automática de rentabilidad ni de paridad.

## Riesgo técnico que NO se oculta

El radar usa `request.security(symbol,"5",f_engine_snapshot(), lookahead_off, calc_bars_count=600)` y solo emite UDT con `barstate.islast`; desde M15/H4, los contextos M5 son inferiores al TF del gráfico. TradingView documenta que `request.security` devuelve el resultado de una sola vela inferior por barra del gráfico y advierte diferencias histórico/realtime para cálculos stateful de lower timeframe. Esto requiere validación de causalidad y reload: https://www.tradingview.com/pine-script-docs/faq/other-data-and-timeframes/ y https://www.tradingview.com/pine-script-docs/concepts/repainting/.

**Otras carencias pendientes:** Chart CRT fuera de los 34 slots IC no tiene M5 independiente; el FVG solo muestrea sus tres candidatas más próximas al close H4 anterior, no todos los candidatos históricos. Ninguna aprobación offline autoriza declarar Chart universal. El presupuesto 34 M5 + 2 Daily + 1 H4 = 37 llamadas únicas estimadas (sujeto a límites reales del plan Basic), sin incremento en V.

## Matriz operativa de aceptación

1. Pine Editor debe compilar V34.12V en TradingView Android. No hay confirmación de compilación en herramientas conectadas.
2. Probar IC:EURCAD M15 y IC:EURGBP H4, luego IC:US30 H4, IC:USTEC H4 y al menos otro IC fuera del radar. Registrar seis filas del HUD; PDH/PDL deben corresponder exactamente a 1D anterior del mismo proveedor.
3. Alternar M5, M15, M30, H1, H4 y 1D. El HUD debe describir CRT TF no soportada cuando proceda, pero sin apagar niveles Daily injustificadamente.
4. El indicador no debe seleccionar OANDA ni cambiar slot IC:BTCUSD al mirar otro ticker.
5. Una vez determinado el gate real, implementar reparación dirigida de ChartCRT y del ranking completo FVG, sin relajar estructuras ni permitir falsas alertas.

Test automatizado `qore-crt-alerts/test/pine-v34-12v-hud-real-gates.test.mjs`: invariancia del motor, 34 IC, seis H4 y 37 requests, diagnóstico de slot/no Signal, causas Daily/FVG/CRT. PASS = diagnóstico instrumentado en código, NO Pine ejecutado ni Chart certificado.
