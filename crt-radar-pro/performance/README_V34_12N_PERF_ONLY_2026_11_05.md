# CRT RADAR PRO — rendimiento SIN cambiar lógica (V34.12N QA)

**Fecha:** 2026-11-05 · **Regla Owner:** indicador visual y detector quedan congelados; SOLO optimización de velocidad al cambiar de par. NO MERGE, NO PUSH, NO LIVE.

## Línea base y estado

Origen (NO MODIFICADO):
`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_QA_NO_LIVE.pine`

Candidato:
`crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_PERF_ARRAYS_QA_NO_LIVE.pine`

El candidato está basado en la copia V34.12N presente en PR #74. **No se ha podido confirmar desde GitHub la versión exacta que está instalada en el TradingView del propietario.** No reemplazar un indicador de versión diferente.

## Cambios permitidos — exactamente dos calificadores

1. `string[] scanSymbols = array.from(s01,...)` → `var string[] scanSymbols = array.from(s01,...)`.
2. `string[] scanNames = array.from(f_name(s01),...)` → `var string[] scanNames = array.from(f_name(s01),...)`.

Con Pine `var`, ambas listas se construyen solo una vez por instancia del script, en lugar de construirse nuevamente en cada barra. Los 34 `input.symbol` son constantes durante la ejecución del script, y al cambiar ticker o modificar un input TradingView reinicializa el script. La excepción BTCUSD ya existente `array.set(scanSymbols,7,syminfo.tickerid)` queda **exactamente igual**.

**Cero modificaciones** al motor `f_engine_snapshot()`, `request.security()`, `calc_bars_count=600`, detección de siete familias, CRT H4 C1/C2/C3, MSS M5/M15 independientes, PDH/PDL, FVG, fases de proveedor, inputs, dashboard, niveles CRH/CRL, colores, marcas, horarios, etiquetas, condiciones de alerta o control NO LIVE.

La prueba `crt-radar-pro/performance/tests/test_perf_v34_12n_exact_diff.py` reconstruye el candidato desde el original y compara **todo el archivo** byte a byte; cualquier tercera modificación causa fallo. CI propio: `.github/workflows/crt-performance-exact-diff.yml`.

## Advertencia de rendimiento honesta

La llamada `request.security(symbol,"5",f_engine_snapshot(),...,calc_bars_count=600)` sigue analizando los 34 mercados. Esta pequeña optimización de listas elimina un trabajo repetido innecesario, pero **NO demuestra** todavía que el cambio de par pase de 2–3 minutos a segundos. No es una optimización del motor y no se modificarán 600 M5 ni los 34 mercados sin pruebas de paridad y cobertura.

Para medir el resultado, utilizar **Pine Profiler de TradingView** con las mismas condiciones antes/después: mismos pares, misma temporalidad, misma sesión, mismo dispositivo, misma carga de gráficos. Repetir al menos tres veces e informar mediana. Medir 1) tiempo desde el cambio de símbolo a la visualización completa del panel, 2) valores de las 34 filas, 3) C1/CRH/CRL, 4) MSS M5 y M15, 5) PDH/PDL y FVG, 6) rendimiento Pine Profiler por sección y 7) errores memoria/runtime. La igualdad de salidas manda sobre cualquier mejora en velocidad.

**Criterio de aceptación:** compilar en Pine real, cero diferencias funcionales y mejora comprobable de latencia sin pérdidas. Si el rendimiento no mejora significativamente, **NO reemplazar** el indicador vigente. En ese caso identificar el cuello de botella en `request.security` y los bucles usando el Profiler, sin aprobar ajustes que reduzcan vigilancia de los 34 símbolos ni cambien las siete familias.

**Sin falsos éxitos:** la comparación estática del repositorio no valida la velocidad ni la compilación en los servidores de TradingView.
