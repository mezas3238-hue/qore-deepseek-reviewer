# CRT RADAR V34.12X — Contraste técnico de propuesta DeepSeek sobre cambio de par

**Corte 2026-11-05. Decisión Owner:** la única modificación tolerable es VELOCIDAD de carga/cambio de par, sin pérdida funcional ni visual. **No MERGE, no LIVE, no reemplazar versión actual.**

## Hallazgos comprobados en código V34.12X
- Fuente exacta congelada: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine`.
- `request.security(symbol,"5",f_engine_snapshot(),...,calc_bars_count=600)` recorre los 34 slots IC. Ejecuta `f_engine()` con estado acumulativo C1/C2/C3, múltiples familias, PDH/PDL, MSS M5/M15 y QA.
- `f_engine_snapshot()` contiene `Signal state = f_engine(); barstate.islast ? state : na`. NO eliminar la condición de salida sin demostrar paridad y perfiles.
- El gráfico también solicita FVG H4 (`calc_bars_count=110`) y dos referencias 1D (`calc_bars_count=60`). Feed M5 extra solamente para ticker IC externo a 34 slots.
- Predeterminados: `scanAll=true`, `chartFvgLookbackH4=24`, máximo 40; quince colores `input.color`.

## Valoración de la propuesta
1. **Correcto como hipótesis:** escaneo de 34 mercados×600 M5 es una carga significativa y merece perfilado. `calc_bars_count` reduce trabajo si sobra historia.
2. **Afirmación excesiva:** TradingView documenta que cambiar ticker carga los scripts pero también puede usar datos temporalmente cacheados por combinación de ajustes. No afirmar caché inexistente o 20.400 ejecuciones completas CADA cambio sin medir.
3. **Error arquitectónico:** dos indicadores Pine sobre el MISMO gráfico NO garantizan un Radar permanente: cambiar ticker también causa la carga de los scripts de ese gráfico. Separarlos puede consumir además espacios del plan. Un Radar en otra pestaña/gráfico fijo sería otra UX y requeriría aprobación.
4. **Error de cobertura:** bajar de 600 a 250/300 M5 puede truncar sesiones completas. BTCUSD puede requerir 276/288/300 velas M5 por día NY (DST) y el indicador reconstruye referencia previa más sesión actual. No se acreditó C1/Inside/Multi-N/MSS de menor ventana. Cambiar histórico disponible SÍ puede cambiar salidas aunque se conserve el código de las reglas.
5. **H4 110→35 incompatible con ajustes máximos:** `chartFvgLookbackH4` permite 40 y el motor usa `time[k+2]`, `high[k+2]` etc. Con 35 barras no se garantiza igual FVG histórico.
6. **Daily 60→10 no certificado:** comprobar continuidad de anteriores días, sesiones y momentos sin datos.
7. **`max_bars_back=250` no es un remedio genérico:** define historial reservado para referencias, puede generar errores si resulta insuficiente. No demuestra que 34 requests desaparezcan.
8. **Tiempos estimados** (5ms/engine, Android ×2-4 y 5–15 s después del split) no tienen respaldo de mediciones.

Fuentes oficiales:
- https://www.tradingview.com/pine-script-docs/language/execution-model/
- https://www.tradingview.com/pine-script-docs/writing/profiling-and-optimization/
- https://www.tradingview.com/pine-script-docs/writing/limitations/
- https://www.tradingview.com/pine-script-docs/language/declaration-statements/

## Gate antes de reducir histórico
- Baseline control con 600 M5 / 110 H4 / 60 Daily y estado visual original.
- PR #79 variante PERF ONLY con seis `var` en datos invariantes: estáticamente comprobada, SIN tiempo real certificado.
- Experimentos diagnósticos separados, nunca sustitutos: BTCUSD solo frente a 34 feeds. Si se ensaya reducción M5, matriz 600/500/450/400/350/300 con EXACTOS mismos parámetros y cero tolerancia a diferencias.
- Paridad por 34 instrumentos y siete familias: H4 48 M5 completas, C1/C2/C3, barridas, pivotes MSS M5 y MSS M15 independientes, Inside/Multi4/Multi-N, PDH/PDL, Daily, tres FVG H4, dashboard, 15 colores, eventos historicos, tiempo NY+DST, gaps de proveedor.
- Perfil Pine de ambos escenarios en varias repeticiones, medir claramente cambio de ticker aparte de carga inicial.
- Si no es viable reducir histórico sin perder información, investigar cuellos de botella en `f_engine()` mediante Profiler y experimentar con cálculos de contexto invariantes sin modificar reglas.
- No entregar a Owner ni sustituir V34.12X hasta compilación real Pine, salidas idénticas y mejora de latencia **medida**, sin pérdidas.

**Estado:** auditoría documentada. Original intacto. No MERGE / No LIVE / No PUSH.