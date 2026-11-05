# V34.12X — rendimiento G3 · LAZY SIGNAL · laboratorio QA

**Fecha 05-nov-2026 | NO LIVE | NO MERGE | NO PUSH | NO instalar de forma definitiva**

## Medición real proporcionada por Owner
- V34.12X ORIGINAL: entre **120 y 180 segundos** aproximadamente al iniciar y cambiar símbolo.
- V34.12X PERF ONLY (PR #79): **~60 segundos** al iniciar y al cambiar símbolo en TradingView Android. Reducción observada aproximadamente 50–67%, referida por Owner. Sin cronómetro automatizado ni medición con Pine Profiler.

## Hipótesis G3 y mejora propuesta
El motor `f_engine()` debe seguir procesando las **600 velas M5 de cada uno de los 34 instrumentos** con todas sus variables, arrays, pivotes, sesiones y familias. Sin embargo, originalmente construía `FamilyVisual.new(...)` y `Signal.new(...)` (UDT de gran número de campos) durante *cada vela M5*, aunque `f_engine_snapshot()` descartaba el resultado en todas excepto la última mediante `barstate.islast ? state : na`.

Se crea **otra copia de trabajo**: `crt-radar-pro/performance/QORE_CRT_RADAR_34_CHART_V34_12X_PERF_LAZY_SIGNAL_QA_NO_LIVE.pine`.

ÚNICAS diferencias sobre el archivo PERF ONLY del PR #79:
1. Cambiar `FamilyVisual outFamilyVisual = FamilyVisual.new(...)` por `FamilyVisual outFamilyVisual = barstate.islast ? FamilyVisual.new(...) : na`.
2. Cambiar la expresión final `Signal.new(...)` por `barstate.islast ? Signal.new(...) : na`.

**Las dos condiciones son las mismas que ya utiliza `f_engine_snapshot()` para descartar todas las velas no finales.** Ninguna regla de cálculo o estado del motor se condiciona. Las 600 M5, los 34 IC, siete familias, MSS M5/M15, confirmaciones, 15 colores, PDH/PDL, FVG, objetos, dashboard, lookahead, alertas, tiempos y configuraciones NO cambian.

## Riesgos de prueba
- Una prueba estática solo valida que el diff exacto contiene dos expresiones de gating, **NO** valida compilación Pine v6 ni tiempo real. Una nueva condición puede cambiar cómo TradingView organiza series/allocaciones y debe comprobarse.
- Verificar específicamente que `FamilyVisual` y `Signal` retienen su tipo UDT con el `na` terminal del operador ternario.
- No declarar mejora adicional antes de medir cambios de símbolo en M5, M15 y H4 con el mismo Android.
- En un futuro, no reducir `calc_bars_count` de 600 ni separar el radar sin antes certificar equivalencia de eventos y visibilidad.
- Si el candidato no compila o no acelera, descartar G3 sin tocar el PERF ONLY de 60 s.

## Gates automáticos y de laboratorio
- `crt-radar-pro/performance/tests/test_perf_v34_12x_lazy_snapshot.py`: compara cada byte entre base PR #79 y G3, salvo los dos cambios terminales; motor y solicitudes iguales.
- `crt-radar-pro/performance/tests/test_perf_v34_12x_exact_diff.py`: sigue bloqueando diferencias entre original V34.12X y PERF ONLY.
- GitHub CI: `.github/workflows/crt-v34-12x-lazy-snapshot-qa.yml`.
- Comprobar compilación real Pine v6 en TradingView y equivalencia visual/funcional antes de recomendar reemplazo; datos de tiempos antes y después comparables.

**El objetivo es menos de 60 segundos sin sacrificar absolutamente ninguna de las funciones existentes.**
