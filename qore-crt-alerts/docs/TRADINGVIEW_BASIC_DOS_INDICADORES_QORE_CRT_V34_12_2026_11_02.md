# QORE CRT RADAR + QORE CRT CHART — dos indicadores TradingView Basic

**Fecha de diseño:** 2026-11-02. **Estado:** candidato de compilación Pine v6, NO LIVE, NO PUSH, NO MERGE.

## Respuesta al propietario

Sí: el nivel **Basic (Free)** de TradingView admite **dos indicadores por gráfico** según https://es.tradingview.com/pricing/ (consulta 2026-11-02). El error de captura V34.11S es **CE10295: "The main body of the script is too long. Try wrapping code in functions"**, con 1 de 3 problemas visibles. GitHub Node PASS no es compilación Pine. Separar es arquitectónicamente mejor que amputar familias del motor para reducir el script, siempre que se acepte el límite de dos indicadores y que ambos ejecuten el mismo motor autónomo.

### A — Radar de 34 mercados

Archivo `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_QA_NO_LIVE.pine`.

- Reutiliza SIN CAMBIOS el `f_engine()` del archivo V34.11S: CRT 2C, TRUE 3C (C3 barre C1), Inside Return, Multi4 y Multi-N, reconstrucción H4 desde 48 M5, NY/DST, MSS M5/M15 independientes con barras cerradas.
- Conserva 34 `input.symbol` con los brokers configurados, BTCUSD separado, y exactamente el mismo único `request.security(symbol,"5",f_engine_snapshot())` dentro del bucle de 34.
- Tabla principal 6 columnas: **MERCADO | CRT H4 | DIR | MSS M5 | MSS M15 | ETAPA**, 34 expandibles de 10 por página, estado `C1 N/D` cuando falta la C1 propia, roles QA en ámbar, rechazo/provisional nunca como señal.
- Se retira de A exclusivamente la llamada de gráfico independiente y sus 60 plots, el dibujo CRH/CRL, el panel legado PDH/PDL/FVG y las otras cuatro tablas de diagnóstico. Las reglas subyacentes de cálculo NO se eliminan del motor; los valores permanecen en el Signal para las comprobaciones.
- Dashboard extraído a función `f_renderRadarDashboard()` para reducir cuerpo principal CE10295. `plot(checked, display=display.data_window)` sirve como salida válida de Pine y cuenta feeds. `alert()` retirado y ramas de emisión inmovilizadas; no depende de alertas TradingView.

### B — Gráfico abierto CRH/CRL y MSS

Archivo `crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_QA_NO_LIVE.pine`.

- Copia el MISMO motor `f_engine()` de S. **No** escanea otros 33 mercados ni crea dashboard. Consulta solo `syminfo.tickerid` en 5 minutos, más la referencia histórica diaria del mismo broker.
- Dibuja CRH y CRL de la **C1 del propio modelo** usando `FamilyVisual`: 2C, 3C independiente, Inside y Multi, y las líneas MSS que ese mismo modelo pueda sustentar. **No** muestra confirmado M5/M15 de 3C, Inside o Multi si la evidencia no existe; continúa QA/N/V.
- Conserva 60 `plot()` de auditoría en Data Window más los dibujos CRH/CRL/MSS; su emisión está separada del gran for de los 34 símbolos.
- Sin clic navegable de la tabla Pine a otro ticker; abrir manualmente mercado y **mismo broker** que el listado en A.

## Instrucciones Android

1. Retirar el script viejo V34.11S del gráfico para liberar los dos slots del plan gratuito.
2. Abrir el archivo **A** en GitHub móvil, copiar el Pine completo, crear script nuevo «QORE CRT RADAR», guardar y **añadir al gráfico** en TradingView.
3. Crear el script **B** por separado con el segundo archivo Pine, guardar y **añadir al mismo gráfico**.
4. En **A**: `Panel compacto (movil)` ON, `Monitor principal: CRT + MSS M5/M15 (QA)` ON, `Ver los 34 instrumentos (expandir)` ON para consultar todos, `Ampliado: inspeccionar 7 categorias CRT (QA)` OFF salvo investigación.
5. Seleccionar en TradingView el símbolo del broker listado en A, p.ej. `IC:USDCAD` y temporalidad M15. **B** debe dibujar los CRH/CRL de la C1 correcta si la memoria de ese modelo está lista. Para ver el panel de 34, desplazar la página con `Pagina si hay mas senales`.
6. Capturar errores 1, 2 y 3 del compilador **para cada archivo** si aparecen; las pruebas GitHub Node no se convierten en validación Pine real.

## Integridad y limitaciones

- Ambos scripts **evalúan por separado el motor**. No se puede compartir un `Signal` UDT completo por `input.source()`. Pine acepta solo fuentes de series `plot` entre indicadores (máximo 10 entradas externas) y requieren vinculación manual; se conserva un diseño sin esa dependencia.
- Usar el mismo `syminfo.tickerid`, feed, intervalo, offset nativo, y settings de lógica/QA en A/B. Si un slot en A usa `OANDA:EURCHF`, abrir `IC:EURCHF` en B puede producir otro CRT.
- El plan de dos indicadores por gráfico NO aumenta los límites `request.*()` internos, memoria, rendimiento ni el límite de Pine por script. Se sigue necesitando compilar cada archivo. No confirmar aún **CE10295 resuelto**, funcionamiento E2E, 7/7 roles certificados ni FCM Android.
- **Pendientes**: MSS independiente para 3C verdadero, Inside/Multi según fuente, paridad 34 feeds Pine↔Trader Lab, holdout/no repaint, alertas autónomas Android con datos licenciados y FCM.
- Fuente plan: https://es.tradingview.com/pricing/ ; fuente indicador-a-indicador: https://www.tradingview.com/pine-script-docs/faq/indicators/ .
