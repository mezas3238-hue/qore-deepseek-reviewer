# Corrección QORE CRT 34+Chart V34.12O — US30 Daily vs H4

Fecha: 2026-11-04. PR #74 DRAFT. NO LIVE / NO PUSH / NO MERGE.

## Evidencia del Owner (TradingView Android)

El Owner comparó **US30 en IC:US30 en el gráfico 1D y H4**. Las líneas manuales de referencia trazadas en la vela 1D anterior son correctas. Las líneas con etiquetas `PDH QA INTACTO` y `PDL QA INTACTO` dibujadas por el V34.12N sobre H4 no son líneas duplicadas: son **precios erróneos en H4 respecto al 1D del mismo proveedor**. Un desplazamiento de líneas no lo soluciona.

## Causa técnica verificada

En la V34.12N `own.nyPDH / own.nyPDL` derivan de la M5 de una **sesión RTH index (09:30 a 16:00 NY) por defecto**, o alternativa extendida NY, y se dibujaban como si fueran `Previous Day High/Low` de la vela diaria de TradingView. En IC:US30 la sesión RTH no tiene por qué coincidir con el rango completo de 1D. Un valor válido RTH puede ser incorrecto si la referencia elegida por el usuario es el OHLC 1D. El motor `f_engine` seguirá calculando esa liquidez interna para QA de CRT; sus niveles NO pueden presentarse como el PDH/PDL oficial 1D del chart.

## Parche entregado (nuevo archivo; V34.12N conservada sin modificar)

`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12O_PDH_PDL_1D_REAL_QA_NO_LIVE.pine`

1. PDH y PDL visuales se leen exclusivamente del ticker abierto con una única consulta Daily: `request.security(syminfo.tickerid, "D", [high[1],low[1],time[1],time_close[1]], lookahead=barmerge.lookahead_on, calc_bars_count=25)`. El `[1]` usa la vela **ya cerrada** y `lookahead_on` la mantiene estable sin adelantar el día actual. Se valida la fecha de cierre anterior, timestamp de la sesión y `PDH > PDL`.
2. Las líneas **no dependen de que haya un CRT** ni de un estado `INTACTO/TAKEN` reconstruido en RTH. Se dibujan sobre H4 y sobre 1D con la misma fuente de Daily, y se etiquetan `PDH 1D CONF` y `PDL 1D CONF`. Si el ticker/proveedor no coincide EXACTAMENTE con uno de los 34 slots, no se dibujan.
3. El escaneo sigue limitado a los 34 símbolos M5 originales. Se agrega UNA sola consulta diaria del **mismo ticker abierto**, no un símbolo 35. Total máximo normal esperado: 34 consultas M5 + 1 consulta 1D = 35, debajo de las 40 únicas permitidas por TradingView Basic. Los 600 M5 por feed, el `f_engine` y los MSS M5/M15 NO se modifican. Se mantiene el estado no certificado y sin alertas.
4. FVG H4 se deja **desactivado por defecto** hasta validar su fuente, antigüedad, límites y proximidad. Su lógica se conserva idéntica y el usuario puede activarlo para QA: FVG se dibuja solamente si el motor tiene un CRT visible y cumple los límites. No etiquetar cualquier vela como FVG.

## Qué sigue SIN resolver

- En capturas, `R:34/34` solo significa respuestas de las fuentes, **no** 34 señales. `C:0`, `QA:0`, `M5q:0`, `M15q:0` indican que en ese snapshot no hay CRT ratificados ni MSS confirmados. `2C*` significa candidato provisional, nunca CRT confirmado.
- El indicador no ha sido compilado ni ejecutado en Pine Editor de TradingView desde estas herramientas. Las pruebas GitHub Node no validan OHLC reales, disponibilidad de fuentes, consumo de memoria ni paridad en la pantalla móvil.
- Verificación visual pendiente: en TradingView Android abrir **IC:US30** con el mismo tipo de gráfico/cotización, comparar exactamente el high/low de la 1D anterior con ambas líneas en **1D y 4H**. No confundir alto/bajo de día anterior con alto/bajo de sesión RTH.
- Seguir investigando por separado la ausencia de CRT/MSS confirmados y la causalidad de 7 roles; no relajar puertas de certificación para fabricar detecciones.

## QA estática

`qore-crt-alerts/test/pine-v34-12o-daily-pdh-pdl-qa.test.mjs` comprueba que no cambió `f_engine`, conserva 34 requests M5 más un request 1D, usa `high[1]/low[1]` confirmados, no mezcla precios RTH con 1D, mantiene el FVG y no habilita alertas/trading.

Referencias: https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/ y https://es.tradingview.com/support/solutions/43000745852/
