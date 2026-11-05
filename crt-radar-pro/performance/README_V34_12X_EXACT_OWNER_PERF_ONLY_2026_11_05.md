# Rendimiento V34.12X — indicador ACTUAL con 15 colores personalizables

**Owner, 05-nov-2026:** Optimizar exclusivamente la lentitud de 2–3 minutos al cambiar de instrumento en TradingView. **No cambiar absolutamente ningún comportamiento ni diseño.**

## Fuente exacta — NO MODIFICADA
`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine`
Blob SHA `470214fea377b05e537a18c0ce8097986da86fac` (rama PR #74).

## Candidato aparte — PERF ONLY
`crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERF_ONLY_QA_NO_LIVE.pine`

Dos cambios exactos y reversibles, únicamente:
- `string[] scanSymbols = array.from(...)` → `var string[] scanSymbols = array.from(...)`.
- `string[] scanNames = array.from(...)` → `var string[] scanNames = array.from(...)`.

Son los 34 símbolos IC Markets fijados en el código y sus nombres, por lo que este cálculo se realiza una vez por instancia Pine en lugar de reconstruirse en cada barra. TradingView recalcula/reinicializa el script al cambiar de símbolo o configuración. **No** se cambia `request.security`, sus profundidades (600 M5 por feed, H4 y daily), ni los bucles del detector.

## Contrato INNEGOCIABLE de protección
Todos los demás bytes del indicador se conservan sin excepción. En particular:
- 15 entradas `input.color`, colores por CRT, CRH/CRL, MSS M5/M15, PDH/PDL, FVG.
- 34 instrumentos IC Market sin cambiar fuentes, sesiones ni disponibilidad.
- Siete familias CRT, sus C1/C2/C3, MSS M5 y M15 independientes, niveles, estructura histórica, FVG, CRH/CRL, horarios y fase M5.
- Dashboard compactado/ampliado, textos, etiquetas, movimientos, inputs, overlays, reglas de alertas, `NO LIVE`.
- Tiempos de caducidad, confirmaciones, stops, selección broker y snapshots.

## Evidencia y honestidad
`crt-radar-pro/performance/tests/test_perf_v34_12x_exact_diff.py` verifica equivalencia exacta del archivo completo y presencia de los **15 colores configurables**. GitHub Actions `.github/workflows/crt-v34-12x-performance-parity.yml` ejecuta ese bloqueo.

**La prueba estática NO demuestra rapidez ni compilación Pine real.** El principal costo sigue siendo escanear 34×600 velas M5 y ejecutar la lógica de siete familias; dos cambios de listas pueden tener un efecto pequeño. Si no existe mejora material, NO reemplazar el indicador.

## Gate de verificación antes de ofrecer nueva versión
1. Confirmar que la fuente del Owner corresponde a V34.12X del blob indicado; si existiese una modificación local no versionada en TradingView, usar esa fuente real.
2. Medir V34.12X BASE y PERF ONLY con el mismo ticker, tiempo, historial, configuración y dispositivo, en tres recorridos de cambio de par. Registrar mediana de segundos, Pine Profiler, historial cargado, símbolo del panel, errores de memoria.
3. Comprobar visualmente con capturas que los 15 colores, 34 mercados, CRT, niveles, MSS, FVG, dashboard y alertas son idénticos.
4. Si la velocidad no mejora sin perder nada, investigar primero las peticiones y cálculo de 34 mercados con Pine Profiler; cualquier optimización adicional necesitará paridad total.
5. Mantener indicador Owner vigente instalado; NO MERGE, NO LIVE, NO PUSH, NO sustitución automática.
