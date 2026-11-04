# QORE CRT RADAR PRO V34.12R — limpieza y estabilidad del Chart Android

**Corte:** 04-Nov-2026 · PR #74 DRAFT · NO LIVE · NO PUSH · NO MERGE.

## Evidencia del Owner

En captura de IC:US30 H4 aparecen etiquetas antiguas **PDH QA INTACTO**, **PDL QA INTACTO**, CRH/CRL 2C QA y un box genérico FVG 4H. El Owner señala un FVG cercano al precio que quiere priorizar frente a otro FVG distante que pierde relevancia. Al salir y volver al gráfico, algunos objetos desaparecen o dejan de aparecer. Exige también **un único modo horario: todas las H4 del día**, y estados diarios individuales: p.ej., `PDL TOMADO` y `PDH INTACTO`.

## Causas probadas en el código V34.12Q

1. **Acoplamiento erróneo:** `sameDailySymbol` y `fvgChartOK` dependían de `chartAvailable`, que solo era verdadero cuando el `Signal` de M5 del scanner era válido en ese instante. Un `na` del radar podía apagar objetos Daily/FVG totalmente independientes del CRT. **No debían depender del estado de C1 ni del UDT del radar.**
2. **Filtro horario antiguo aún visible:** el ajuste `scheduleMode` permitía volver a “Solo C1 de tres horarios NY”. El dueño quiere una única opción, TODAS las seis H4 cada 24 horas.
3. **FVG incorrectamente priorizado:** se dibujaban los tres FVG *más recientes* sin priorizar proximidad, y podía quedar una zona distante mientras otra cercana se omitía.
4. **CRT desaparece después de C3:** `keepLastCRT` estaba desactivado por defecto; el `f_engine` retornaba fase cero tras vencer C3. Eso es distinto de borrar un objeto correcto: la memoria de eventos históricos era opt-in. **Nunca convertir un CRT vencido en señal vigente.**
5. **Objetos ajenos:** un Pine nuevo NO puede borrar líneas/labels/drawings de otro indicador instalado previamente. Es necesaria una limpieza de las instancias viejas desde TradingView Android.

## Solución incorporada (archivo nuevo)

`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12R_LIMPIEZA_NIVELES_FVG_CERCANOS_QA_NO_LIVE.pine`

### Escaneo sin filtros de sesión opcionales

- Se elimina el input `scheduleMode` y su rama 3/6. `f_allowed` exige solamente FX/BTC NY 01/05/09/13/17/21; índices 02/06/10/14/18/22. Los 6 bloques H4 son elegibles; esto no asegura cotizaciones reales durante cierres de mercado ni corrige diferencias de ancla horaria del broker.
- No se alteró **ni una línea** de `f_engine()`; 34 feeds, BTC por su ruta original, 48 M5 cerradas contiguas, MSS5/MSS15 independientes y siete roles QA se mantienen. Ningún contador QA equivale a certificación de entrada.

### PDH y PDL estables y estados independientes

- `chartStaticSlot` se resuelve con `ticker.standard(symbol)` para los 34 mercados **independientemente del valor de `s`/Signal**. `sameDailySymbol = chartStaticSlot >= 0` y `showPDLevels` ya no dependen de `chartAvailable` ni de activar dibujo CRT/MSS.
- PDH/PDL se obtienen del Daily anterior del ticker **abierto y exacto**, con `request.security(syminfo.tickerid,"D",[high[1],low[1],time[1],time_close[1]],lookahead=barmerge.lookahead_on)`, sin confundirlo con la sesión RTH de US30. Comparar con el mismo gráfico 1D, no con otro proveedor.
- En cada nuevo día de TradingView se reinician por separado `chartPdhTaken1D` y `chartPdlTaken1D`; cualquier mecha `high>=PDH` marca **PDH TOMADO**, cualquier `low<=PDL` marca **PDL TOMADO**. El otro queda INTACTO si no fue alcanzado. Se preserva la primera barra que lo tomó en Data Window, no se inventa la hora exacta intrabar.
- Solo dos líneas y dos etiquetas PDH/PDL son propias de este Pine. El color naranja indica TOMADO; turquesa/fucsia INTACTO. Al cambiar de mercado o timeframe TradingView recalcula con la misma fuente Daily y solo dibuja niveles si el ticker exacto existe en el inventario del radar.

### FVG H4 cercanos y sin objetos “alucinados”

- Una sola solicitud **H4 del ticker del chart**; revisa hasta 24 H4 confirmadas por defecto, busca las velas 1/2/3 consecutivas del mismo proveedor sin mirar al futuro. No requiere que haya un CRT actual.
- Se rechazan FVG completamente rellenados y se identifica INTACTO o PARCIAL según que mechas posteriores hayan alcanzado los límites; una mecha de la H4 abierta se toma solo como observación actual, no como futura vela cerrada.
- **Ordenación por distancia** a `close[1]` (última H4 confirmada) entre todos los FVG sin relleno; desempate favorece el reciente. En el chart se ocultan los que quedan a más de **1,5 ATR H4 confirmada del precio actual**, por defecto. `chartFvgMaxZones=1` muestra solo el más cercano para no saturar Android. Ajustes opcionales de 1–3 zonas, 0.25–5 ATR. Las zonas antiguas lejanas no aparecen por ser simplemente más recientes o grandes.
- Se dibujan `box` y `label` solo desde **el cierre de la tercera H4**; el script borra sus propios objetos al perder validez o quedar completamente rellenados. NO puede borrar objetos de otros scripts.

### Último CRT ratificado, sin falsificar una señal viva

- `keepLastCRT` activado por defecto, con **48 horas** de memoria. En fase 3, si el motor conserva CRH/CRL y evidencia de retorno confirmado, la etiqueta sobre chart será **2C HIST QA** en gris; **no** se presenta como CRT vigente ni nueva entrada. La fase 2 actual conserva su etiqueta propia y su causalidad.
- La memoria no resuelve todos los problemas de origen M5, calendario o `barstate.islast` del UDT: una ausencia de Signal puede seguir impidiendo dibujar CRT, pero **ya no afecta al dibujo Daily y FVG**.

## Limpieza real desde TradingView Android (OBLIGATORIA)

1. **Guardar copia** del código propio actual si corrigió horarios por su cuenta y no está en GitHub.
2. Entrar al gráfico, abrir la lista de indicadores aplicados y **eliminar todas las instancias** de QORE CRT viejas (12N, 12O, 12P, 12Q, Chart B u otros PDH/FVG), no solo ocultar su nombre. Cada instancia Pine controla sus propios objetos; instalar 12R sobre otras instancias genera superposición falsa.
3. Si líneas PDH/PDL fueron dibujadas manualmente, borrarlas desde herramientas/árbol de objetos de TradingView; el Pine no puede eliminarlas.
4. Añadir **solo una instancia V34.12R** y confirmar su shorttitle en encabezado. No hace falta instalar aparte “Chart B” ni otro indicador FVG. Activar PDH/PDL y FVG nativos en `04 / Chart integrado`.
5. En IC:US30 1D comparar los extremos del día anterior; en H4 comprobar **PDH TOMADO / PDL INTACTO** o viceversa según **mechas del día actual**, y FVG cercano. Salir/volver al gráfico y verificar que Daily/FVG se reconstruyen. Si el broker del chart no coincide con un slot de los 34, se bloquean en lugar de usar otro feed.
6. Probar también GBPUSD (mercado abierto) y un horario Asia/Londres; comparar PDH/PDL del mismo proveedor. Documentar error real de Pine Editor o discrepancia OHLC con captura, sin afirmar que CI equivale a compilación en TradingView.

## Auditoría

- `qore-crt-alerts/test/pine-v34-12r-one-h4-persistent-chart-near-fvg.test.mjs` comprueba invariancia byte a byte de motor, 34 slots, H4 única 6/6, estados de Daily, independencia del UDT, FVG cercano ordenado, borrado de cajas propias y 36 `request.security` únicas estimadas para TradingView Basic (34 M5+1D+1H4).
- **Pendiente:** compilación en Pine Editor de TradingView y prueba visual de salida/entrada y comparación de fuentes; ningún test Node puede dar por certificado el render de Pine.
- Sin MERGE, LIVE ni alerta real.
