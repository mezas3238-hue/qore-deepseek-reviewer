# CRT RADAR PRO V34.11L — últimos eventos históricos por cada feed / siete categorías

**2 noviembre 2026 | CANDIDATO QA DRAFT / NO LIVE / NO PUSH**

## Evidencia real que originó la corrección

El usuario abrió el diagnóstico detallado en TradingView Android, gráfico `IC:NZDCAD` M15. Captura: `R:34/34`, feed exacto `IC:NZDCAD` y gráfico con el mismo proveedor, `PHASE = SIN CRT ACT`, `MASK 7 = 0`, tiempos C1/C2/RAT y pivot/MSS15 `N/D`. Eso NO es prueba de falta de reconocimiento: la vista temporal de V34.11k exporta **solo el estado actual**, mientras el histórico de las últimas 1500 M5 muestra para NZDCAD **32 H4 cerradas, 16 C1 NY, 7 casos 2C QA ratificados, 5 casos 3C QA, 1 Inside retorno QA y 2 Multi4 / 0 Multi-N**; también 7 H4 BAD (6 parciales, 1 discontinuidad interna) y 8 rechazos C2. No confundir los 7 casos 2C ratificados con la categoría independiente de una C2 **provisional**. La etiqueta `V34.11d` en esa pantalla era un texto heredado, no la versión efectiva: la captura anterior identificaba `CRT MSS QA 4C 11K`.

Este dato visual tampoco demuestra que exista en la última M5 una C1/C2 actual, ni que haya un MSS15 aprobado. En concreto `M15 CERR` solo informa última M15 cerrada, NO un MSS confirmado.

## Implementación específica

Nuevo Pine: `crt-radar-pro/CRT_RADAR_PRO_V34_11L_HISTORIAL_7_CATEGORIAS_QA_NO_LIVE.pine`, blob exacto **`f299f7b5160ee646c7c170ca119cd01c7cbe7f24`**.

- Mantiene las 34 `request.security(..., "5", f_engine_snapshot(), calc_bars_count=1500)` y los 60 `plot()`, con BTCUSD independiente, 33 proveedores de fase M5 0…4 minutos, H4 de 48 M5 cerradas obligatorias, MSS15 causal propio y alertas/entradas bloqueadas en QA.
- Conserva en la memoria del motor **nueve marcas `eventAt` cerradas o provisionales etiquetadas**, extraídas por feed y guardadas en el `Signal` de 126 campos (constructor con exactamente 126 argumentos). No se sustituye un MSS M15 por un M5.
- Para cada feed: primera observación de **2C provisional** (M5), último cierre H4 de **2C ratificada**, última **expansión rechazada**, última **3C completa**, último **Inside retorno**, último **Inside continuación rechazada**, último **Multi4**, último **Multi-N** y último **retest M15** observado. La ausencia se muestra `N/D`. Son **últimas marcas** en la ventana efectiva, no un archivo con todos los eventos ni prueba de relación causal.
- Los timestamps se exponen en el diagnóstico de **un instrumento** con la nueva opción opt-in `QA: ver ultimo evento historico por categoria`. Cuando está OFF, se conservan exactamente los contadores históricos previos. El panel indica explícitamente `HIST != ACT`, `SIN MSS PROOF`, `SIN CERT`, `NO PUSH`.
- Corregido el texto heredado `V34.11d` a `V34.11L` en la vista temporal; el código del motor no ha cambiado filtros, direcciones, H4/M15 ni criterio de invalidación.
- La paridad de eventos acepta exclusivamente la huella Git exacta de esta fuente bajo el mismo contrato fail-closed. Las pruebas offline siguen respondiendo `certified:false`, `actionable:false`, `sendPush:false`.

## Prueba Android

1. Conservar V34.11k como respaldo. Copiar el **archivo completo V34.11L** desde la rama existente a un indicador nuevo. Confirmar compilación Pine v6 real; GitHub CI Node no es el compilador de TradingView.
2. En `00 / Memoria`: `34 instrumentos (experimental)`. En `03 / Dashboard`: `QA: auditar los 33 instrumentos sin BTC` **OFF**, `QA: ver tiempos CRT/MSS de 1 instrumento` **ON**, `QA: seguir grafico solo si proveedor coincide` **ON**; nueva opción `QA: ver ultimo evento historico por categoria` **ON**.
3. Abrir `IC:NZDCAD` M15; primera sección puede seguir diciendo `SIN CRT ACT / MASK 7 = 0` porque es solo estado ACTUAL. En la parte inferior deben aparecer las marcas `ULT C2 PEND`, `ULT C2 RAT`, `EXP RECH`, `ULT 3C`, `INS RET`, `INS CONT`, `ULT MULTI4`, `ULT MULTIN`, `ULT RETEST`. Anotar timestamps `UTCmin` para preparar el cotejo en Trader Lab; un `N/D` es correcto si esa categoría no ocurrió en la ventana.
4. Repetir `AUDJPY` (FX+1), `XAUUSD` (MET+2), `BTCUSD` con proveedor exacto del chart, y después los demás mercados. No se puede inferir MSS15 de una marca H4 sin su pivote L2/R2 y cierre de ruptura en la fuente original.
5. Para volver a ver la tabla de las 34 fuentes con categorías actuales: **desactivar** `QA: ver tiempos CRT/MSS de 1 instrumento` y `QA: auditar los 33 instrumentos sin BTC`, luego activar `Ver los 34 instrumentos (expandir)` y `Ampliado: inspeccionar 7 categorias CRT (QA)`. En Pine las tablas no reciben toques.
6. Una vez identificado un timestamp histórico, obtener la misma ventana M5 del feed original en Trader Lab (con fase 0…4, 48 M5 por H4) y comparar todos los eventos/negativos, incluyendo pivote y primer cierre MSS15, DST, no-repaint y holdout. Nunca declararlos señales por un solo timestamp.

## Estado real

**0/7 categorías certificadas externamente.** Estas marcas ayudan a localizar ejemplos históricos donde ya hubo alguna detección. No sustituyen capturas/eventos completos de Pine y Trader Lab ni acreditan igualdad entre H4 nativa 01:01/01:02 y H4 oficial NY 01:00. El próximo bloqueo es ejecución Pine Editor + evidencia OHLC independiente, no capacidad de representar siete títulos.
