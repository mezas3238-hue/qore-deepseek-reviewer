# BTCUSD — PDH visible en 1D vs PDH del calendario NY (V34.10f QA)

**1 noviembre 2026 · PR #55 DRAFT · No LIVE · No merge.**

## Evidencia de TradingView

Captura facilitada por el propietario, BTCUSD en gráfico **1D**:
- Panel V34.10e: `PDH NY: 77.747,48`, `PDL NY: 76.954,57`,
  referencia `01/11 00:00` NY; `PDH TAKEN/T OTR`,
  `PDL INTACTO`.
- Línea de cursor inferior ubicada en **sábado 17 Oct 2026**,
  una vela histórica que NO representa automáticamente la jornada
  inmediatamente anterior al 1 de noviembre.
- Los valores anteriores pertenecen a la jornada civil NY cerrada;
  NO se deduce de la captura el OHLC de la previa vela diaria 1D del
  proveedor ni el exchange completo. No inventar precios.
- La etiqueta `T OTR` se refiere a la barrida del **PDH NY**, fuera
  de un CRT activo. No certifica que se haya tomado el PDH 1D.

**Problema semántico confirmado**: Pine V34.10e usa expresamente
`America/New_York`, `0000-0000:1234567`, para construir PDH/PDL
desde M5. TradingView puede construir su vela 1D nativa con distinta
apertura del día del proveedor. Los dos máximos no tienen obligación
de coincidir. No son dos cotizaciones distintas por definición:
pueden ser **distintos intervalos del mismo proveedor**.

## Implementación V34.10f QA: dos referencias independientes

Archivo nuevo, preservando V34.9 y las candidatas b/c/d/e:

`crt-radar-pro/CRT_RADAR_PRO_V34_10F_QA_BTC_PDH_GRAFICO_VS_NY_NO_INTEGRADO.pine`

- La cabecera del dashboard distingue explícitamente **PDH NY /
  PDL NY** (estados TAKEN/INTACTO que ya calcula el motor desde M5).
- En la fila 10, nueva referencia **PDH 1D GRAF /
  PDL 1D GRAF**: el máximo y mínimo de la **última vela
  D cerrada de `syminfo.tickerid`**, y sus horas de inicio/cierre
  en `syminfo.timezone`, zona del proveedor.
- La fila 11 conserva **PDH/PDL NY**, con ambos niveles,
  cierre de la jornada NY de referencia y estado real de la
  barrida NY. No confundir con la anterior.
- La referencia 1D se obtiene con:
  ```pine
  [chartPrevDHigh, chartPrevDLow, chartPrevDOpenAt, chartPrevDCloseAt] =
      request.security(syminfo.tickerid, "D",
          [high[1], low[1], time[1], time_close[1]],
          lookahead=barmerge.lookahead_on,
          ignore_invalid_symbol=true, calc_bars_count=7)
  ```
  Todos los valores se desplazan una vela D cerrada;
  `lookahead_on` con offset `[1]` no introduce fuga de
  máximos futuros. Referencia TradingView:
  https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/
- La comparación solo se muestra para **BTCUSD en M5, M15,
  H4 o 1D**, nunca como referencia fiable en gráfico semanal,
  para evitar interpretación errónea de solicitud de D inferior
  al timeframe del gráfico.
- Cuatro columnas auditables de Data Window:
  `QA BTC PDH 1D GRAFICO precio`,
  `QA BTC PDL 1D GRAFICO precio`,
  `QA BTC D proveedor inicio UTC min`,
  `QA BTC D proveedor cierre UTC min`.
- Una sola solicitud adicional, en el símbolo del gráfico.
  Se conserva modo memoria **BTC QA 1/34** y la lógica
  CRT H4 NY / MSS M15 / 48 M5 y PDH NY 24×7, sin activación FCM.
- Esta revisión es **instrumentación para comparar**, no
  autorización de cambiar el algoritmo de barridas al daily del
  proveedor sin verificar si esa es la referencia de negocio elegida.

## Verificación móvil pendiente

1. Retirar solo del gráfico el antiguo candidato V34.10e;
   abrir el texto de V34.10f en GitHub y copiarlo al Editor Pine.
   Mantener alerta OFF y `BTCUSD solo`.
2. Seleccionar 1D. Confirmar que el valor **PDH 1D GRAF**
   coincide con el máximo de **la vela diaria inmediatamente
   anterior a la actual**, no con una vela antigua marcada por
   la cruz del cursor.
3. Leer junto a él el **PDH NY** y las fechas de apertura/cierre
   para explicar cualquier diferencia de sesión; comparar
   `PDL 1D` vs `PDL NY` con la misma metodología.
4. Verificar en M5/H4 con el mismo proveedor; capturar ticker
   exacto y las dos filas. Si no coincide el **PDH 1D GRAF**
   con la última vela D cerrada del chart, el error persiste
   y debe investigarse con OHLC exportado, no declararse arreglado.
5. Para activar señales de liquidez basadas en el día del
   proveedor en lugar del día civil NY, primero acordar cuál
   referencia es la oficial y demostrar paridad con backend.

**No hay prueba de compilación REAL de V34.10f en TradingView
al momento de escribir. Tests Node son estáticos/fixture.**
