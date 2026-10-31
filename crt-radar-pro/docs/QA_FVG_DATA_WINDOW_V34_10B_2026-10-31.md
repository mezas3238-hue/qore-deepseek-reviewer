# CRT RADAR PRO — QA FVG H1/H4 con TradingView (31 oct 2026)
Estado: PROTOTIPO DE DIAGNÓSTICO EN RAMA DE ENSAYO. NO CERTIFICADO. NO INTEGRADO.

## Código

`crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_FVG_OBSERVABILIDAD_NO_INTEGRADO.pine`
Rama: `review/crt-radar-v34-10b-qa-strict-20261031`.

Fuente heredada: V34.10b M5B, CRT H4/Inside/MSS M5/M15/PDH/PDL/dashboard de seis columnas, 34 símbolos; los únicos cambios diagnósticos son lectura del FVG H1/H4 más reciente, 14 campos exportables, nombre de script y alertas apagadas por defecto. Mantener sin modificación el oficial V34.9.

## Propósito y limitaciones

1. Cada `request.security(..., "5", f_engine(), ...)` continúa ejecutándose para 34 símbolos y para el gráfico; **no se añaden solicitudes**.
2. El UDT Signal devuelve **solo el FVG más recientemente formado** de H1 y H4 por símbolo. No es un resumen de los diez FVG ni el «último intacto» ni necesariamente el FVG asociado al CRT.
3. Los estados solo se exponen en la **ventana de datos/Export chart data CSV** para el **símbolo del gráfico**. El dashboard conserva las seis columnas; no dibujamos FVG.
4. Estado numérico: `-1` no existe; `0` INTACTO; `1` PARCIAL; `2` LLENADO_TOTAL; `3` INVALIDADO; `4` DATOS_INCOMPLETOS; `-2` estado desconocido (error diagnóstico).
5. `penetracion %` se exporta en `[0,100]`. `formedAt UTC min` y `gapAt UTC min` están medidos como minutos Unix desde 1970-01-01 UTC; multiplicar por 60.000 para recuperar milisegundos Pine.
6. Los FVG H1/H4 requieren tres velas completas H1/H4 reconstruidas con M5 cerradas; al disponer de menos histórico en `calc_bars_count=2500` puede ser normal que no haya FVG.
7. **La compilación Pine v6 real, la sincronía de M5→M15→H4, los datos por proveedor y el no-repaint siguen pendientes.** No se debe activar trading real ni alertas Android por el simple éxito de tests JS.

## Procedimiento manual reproducible

1. Abrir el archivo GitHub de esta rama y copiar sus **1310 líneas** completas al Pine Editor web como script privado separado.
2. Compilar y añadir al gráfico en **M5** (primera prueba). Conservar mensaje literal del compilador si hay un error.
3. En configuración: `Escaneo C1=Solo C1 de tres horarios NY`, `QA: exportar estados FVG=true`, `Alertar confirmaciones M5/M15=false`.
4. Abrir la ventana de datos de TradingView y buscar los 14 campos que comienzan por `QA FVG H1` y `QA FVG H4`.
5. Para H1: comprobar límites `techo/suelo` frente a las velas H1 del **mismo proveedor**. Si hay formación, las velas primera y tercera deben dejar un hueco estrictamente positivo.
6. Repetir con H4. Confirmar que la mitigación solo es evaluada por velas M5 posteriores a la vela H1/H4 de formación; cotejar estado y `penetracion %`.
7. Capturar dos conjuntos de evidencia por instrumento: valor Data Window + captura de OHLC M5/H1/H4, timestamp y proveedor.
8. Verificar Forex EURCAD, GBPAUD, EURUSD, GBPUSD, XAUUSD e índices NAS100USD/US500, incluyendo fines de semana, aperturas y ausencia de `session.islastbar`.
9. Exportar `Chart data...` CSV de TradingView para comparar valores numéricos; NO inferir que CSV es una compilación adicional.
10. Cambiar gráfico a M15 y H4, comparar los FVG con M5 **solo como diagnóstico**. TradingView limita `request.security` en LTF a una intrabar por barra del gráfico; puede haber diferencias histórica/realtime. La auditoría debe registrar discrepancias, no ignorarlas.
11. Si se observan errores de datos incompletos en sesiones lícitas, adjuntar instrumento, sesión RTH/ETH, hora del último M5 y estado exportado; no relajar la detección de gaps arbitrariamente.
12. Para auditar alertas, usar **otro script QA separado** `CRT_RADAR_PRO_V34_10B_QA_ALERTAS_RATIFICADAS_NO_INTEGRADO.pine` y activar notificaciones únicamente en entorno de ensayo, preferentemente sobre M5, después de compilar.

## Requisitos de salida

| Verificación | Evidencia requerida | Estado inicial |
|---|---|---|
| 34 símbolos y 6 columnas | Panel y lista de símbolos | Código existente, no probado en TV |
| 3 ciclos NY por familia | C1 horarios 01/05/21 FX, 02/06/22 índices | Configurado en QA |
| Pine v6 real | Captura de «añadido al gráfico» | Pendiente |
| FVG H1 | valores Data Window + H1 OHLC feed | Pendiente |
| FVG H4 | valores Data Window + H4 OHLC feed | Pendiente |
| Mitigación y pausas de sesión | M5 OHLC + flags/estado | Pendiente |
| Alertas | registro real de notificaciones | Pendiente |
| No-repaint | recarga, comparación histórico/live | Pendiente |

## Fuente pública de limitaciones de Pine
- https://www.tradingview.com/pine-script-docs/faq/other-data-and-timeframes/
- https://www.tradingview.com/pine-script-docs/concepts/repainting/
- https://www.tradingview.com/pine-script-docs/faq/indicators/

Este expediente nunca reemplaza una compilación real. La versión oficial V34.9 no se modifica ni se promueve V34.10b.
