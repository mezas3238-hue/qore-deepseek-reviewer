# QORE CRT RADAR PRO R4-A — correcciones del informe DeepSeek y contrato holdout 2Y
**Estado:** RESEARCH / QA ONLY · NO LIVE · NO MERGE · NO VPS · NO ÓRDENES

## 0. Fuente inmutable auditada
- Repositorio: `mezas3238-hue/qore-deepseek-reviewer`
- Pine: `crt-radar-pro/qa-integrated-34/QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine`
- Git blob: `693e3f49719e86e2ea0702f7b355af33bd0c4c7c`.
- Un detector de 34 símbolos IC: la existencia de 34 requests, un catálogo de siete roles o 118 pruebas estáticas **no demuestra** paridad histórica, rentabilidad ni certificar señales. Existió RE10110 en TradingView Android US500/1H para R4-A. No ocultar.

## 1. Correcciones bloqueantes a DeepSeek
1. **NO afirmar que TRUE 3C es la única categoría operable.** El Pine implementa un `entryFamily` / `entryStage` para `outPhase==2`, `outValid`, `outModel=="CRT_2C_RETURN"` y MSS M15 propio confirmado: investigar 2C RETURN ratificado + MSS15 como estrategia candidata independiente (aprox. líneas 2110–2127). En los 33 no-BTC, `scanCrtValid=structuralCoreObserved and i==7` implica que NO está certificado como operable (aprox. 2496–2503): es investigación, NO LIVE.
2. TRUE 3C lleva etiqueta exacta `"3C TRUE QA"` (aprox. 2188–2208); `qaTrue3CConfirmed` se establece al **cerrar la H4 C3** bajo condiciones estrictas (aprox. 1340–1372). `q3.mss5At` puede detectarse **durante C3** (aprox. 1993–2004). Por lo tanto, NO permitir entrada "la M5 siguiente al MSS" si ocurre antes de cerrar C3; primer momento operable hipotético posterior a `max(C3 end, MSS5 end)`, no la anticipación histórica.
3. El argumento "Multi4/MultiN NUNCA producen MSS" es incorrecto: el código incluye `q4.mss5At`, `qaMultiNMss5At` y confirmaciones M15 (aprox. 1070–1085, 1999–2030). Que se registren **no significa** que puedan operar: permanecen categorías de QA mientras no se certifiquen.
4. El SL propuesto para TRUE 3C detrás de mínimo/máximo **C1/C2** es causalmente insuficiente: su barrida se produce en **C3**; el SL debe contemplar extremo real de C3/sweep observado antes de colocar orden y disparador de invalidación. Usar extremo `C1/C2` puede dejar stop del lado incorrecto. Diferenciar de 2C RETURN donde la barrida es en C2.
5. Entrada al 50 % del cuerpo de C3, `0.25 ATR`, vencimiento en 3 H4, SL ATR/TP estructural/1–3R **NO son reglas del Pine**: son hipótesis exógenas para desarrollo, sujetas a pruebas y congelación. Definir cómo se forman las órdenes límite y distinguir LONG/SHORT con bid/ask, precio de entrada, stop mínimo/tick, spread y órdenes ya atravesadas. NO admitir TP detrás de entrada ni riesgo/beneficio no positivo.
6. `f_engine_snapshot()` **solo exporta UDT en `barstate.islast`**, después de ejecutar `f_engine()` sobre su ventana corta de M5 (aprox. 2294–2296); no es un archivo de cada evento histórico ni un strategy/backtest 2Y. Replay externo debe replicar estados temporales y retener todos los eventos en cada barra sin future leak.
7. **El plan DeepSeek solo reservó 2025, un año**: contradice la orden de **24 meses completos**. 2024 NO puede simultáneamente ser validación y parte de un holdout 2024–2025. Si 2024-01-01/2025-12-31 sigue completamente virgen, congelar ambos años y usar solo datos anteriores a 2024 para desarrollo y validación (seleccionar ventanas realmente no contaminadas). De lo contrario: declarar BURNED, identificar 24 meses consecutivos no usados o hacer evaluación prospectiva, sin renombrar 12 meses como 24. No usar datos de 2026 todavía incompletos como "dos años" sin justificar.
8. `calc_bars_count=400` por símbolo no proporciona dos años de memoria ni basta para validar diferencias frente a `600`. Reconstruir motor secuencial desde un warmup suficiente por instrumento, persistir eventos y comprobar bootstrap, continuidad de sesiones H4, DST, gaps y parámetros `keepHours/maxH4Life`; rechazar si fuente incompleta.
9. Paridad requerida: **igualdad exacta de identidad del evento, timestamp de confirmación, fuente OHLC, dirección, niveles, causalidad y estados** en ventanas idénticas. Un mero «desvío de conteo menor a 1 %» permite errores peligrosos de sincronización; no es una certificación causal.
10. Los costos no se estiman con bid=ask: cotizaciones bid/ask, spread variable, comisión, swap y slippage, ejecución M5 conservadora y reglas de OHLC con ambigüedad stop/TP. Congelar parámetros y datos SHA-256 **antes** de leer resultados del holdout.

## 2. Diseño experimental CORREGIDO
- **Hipótesis H0:** CRT 2C RETURN **ratificado**, con MSS M15 **del mismo C1/C2**, evaluado en 34 feeds; QA/observación y sin trading real.
- **Hipótesis H1:** TRUE 3C estrictamente ratificado **tras cerrar C3**, con MSS5 propio observado antes o después según estado, sin adelantar la entrada.
- **H2 complementaria:** Inside RATIFIED / otros modelos, exclusivamente diagnóstico hasta tener pruebas de paridad y reglas propias; no mezclarlos con H0/H1 ni presentar el catálogo como siete estrategias.
- Para cada H0/H1, comparar al menos: market next M5 vs retroceso 50 % y/o MSS-pivot limit, siempre una **regla que pueda ser evaluada a tiempo**; SL real detrás de extremo de barrida de la vela correspondiente (C2 para H0, C3 para H1) con buffer definido ex ante; TP nivel C1 opuesto si está del lado de ganancia, y TP fijo 2R como control.
- Registrar por instrumento y evento: OHLC exactas, primer tiempo observacional, tiempo de ratificación H4, tiempo de cierre MSS M5/M15, tiempo de autorización, colocación, ejecución, SL, TP, vencimiento, costo, R y razón de abstención.
- Evitar optimización por cada uno de los 34 feeds y regresión silenciosa. Si no hay margen de trades suficiente, informar NO CONCLUYENTE.

## 3. Salidas exigidas antes del holdout
1. Tabla `Pine variable → fuente → disponibilidad temporal → campo de evento replay`, incluyendo `qaTrue3CSignedAt,qaTrue3CConfirmed,entryFamily,entryConfirmedAt,extraMss5Causal,extraMssCausal,crtRatifiedAt,qaCatalogMask`.
2. Especificación completa de entradas LONG/SHORT, SL, TP, cancelación y ejecuciones bid/ask.
3. Datos realmente disponibles y no disponibles para TODOS los 34, dos años y warmup, con origen/licencia e integridad.
4. Historial de exposición a datasets para confirmar **24 meses vírgenes** y ventanas previas para desarrollo/validación.
5. Plan de replay causal, CI, paridad de señales EXACTA antes de tocar el holdout.
6. Congelación inmutable con sha256 de códigos/configs/datos/costos y una única ejecución holdout sin optimización posterior.

**ESTADO: NO CERTIFICABLE.** Nunca reportar resultados de 24 meses sin producir efectivamente evidencia de dos años completos por feed y ejecución registrada.
