# QORE CRT RADAR 34 — R4, ensayo comparativo de rendimiento (solo QA)
Corte: 2026-11-09. 34 instrumentos obligatorios, 7 familias presentes, BTCUSD especial, FVG j=0 corregido. **NO MERGE / NO LIVE / NO alertas / NO trading**.

## Cuatro brazos reproducibles (solo `request.security` M5 y buffer, diff exacto)
1. **R3 base:** `QORE_CRT_RADAR_34_CHART_V34_12X_R3_34FVG_FIX_SAFE_PERF_QA.pine` — 600 M5, buffer automático. Referencia funcional.
2. **R4-A:** `QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine` — 400 M5, buffer automático. **Primero probar este contra R3** para aislar reducción de barras.
3. **R4-B:** `QORE_CRT_34_R4_AB_600_M5_GLOBAL_BUFFER_600_QA.pine` — 600 M5, `max_bars_back=600`. Solo compara efecto del parámetro global.
4. **R4-C:** `QORE_CRT_RADAR_34_CHART_V34_12X_R3_EXPERIMENTO_400_M5_QA.pine` — 400 M5, `max_bars_back=600`. Prueba la propuesta completa de la auditoría.

Los cambios NO desactivan gates QA ni 34 solicitudes, pero **400 M5 puede cambiar resultados** porque reinicia desde una ventana más corta un motor M5 stateful. No prometer paridad por diff textual. `keepHours` predeterminado 48 h (máximo 120), 400×5m solo 33 h 20 m de datos continuos; `maxH4Life` permite hasta 10 H4. El comportamiento puede variar con horarios/cierres de mercado. No promocionar 400 a versión certificada sin comparativa.

## Protocolo de medición Pine/TradingView obligatorio
1. Instalar cada variante como indicador **distinto**, en condiciones comparables; no medir múltiples indicadores simultáneos. Registrar si Pine Editor compila; anotar mensaje exacto cuando falle.
2. Misma cuenta/plan, dispositivo Android, versión de app, conexión, horario, timeframe y lista de símbolos; empezar con IC:EURUSD y cambiar a IC:GBPUSD, IC:USDJPY, IC:XAUUSD, IC:USTEC, IC:US500, IC:US30, IC:BTCUSD.
3. Registrar 3 cambios por transición, separar primera carga de cambios posteriores. Cronometrar desde cambio de gráfico hasta actualización completa del dashboard/HUD y líneas. No atribuir tiempos de red/compilación sin Profiler.
4. En los 34 IC, comparar R3 y R4 fecha/hora de C1, C2, dirección, extremos H4, categoría 1–7, MMS M5/M15, pivotes, PDH/PDL y causas de abstención. Aceptar falta de señales legítima, NO falsear positivo.
5. Repetir con `keepLastCRT` ON y `keepHours` a 48 y 120, `maxH4Life` hasta 10, y tras fin de semana/sesión, para detectar dependencia de historial truncado.
6. Guardar evidencia Pine Profiler por variante; aceptar 400 solo si no cambia eventos causales reales ni introduce N/V o FVG indebidas.
7. En chart IC fuera de los 34 verificar que `chartExternalQA` usa su request M5 separado y que NO crea feed #35 en radar.

## Alcance de pruebas GitHub
`test_r4_perf_factorial_34.py` verifica blob pinning, diff exacto, 34 slots, 7 roles, gates, colores, FVG, requests y la incompatibilidad de 400 M5 con memoria 48h. Las pruebas son estáticas/sintéticas; GitHub Actions **no compila Pine**, no mide latencia Android, ni certifica 34 feeds en mercado real.

## Resultado conocido
- Cierre 2026-11-09: CI del PR #101, run 42736062908, **83 pruebas de integración + 35 MSS = 118 PASS**.
- Desconocido: tiempo de carga/switch, paridad de eventos 600↔400, compilación Pine.
- Recomendación de prueba: comparar R3 contra R4-A antes de probar R4-C. Evitar el `max_bars_back` global por defecto: la documentación oficial TradingView advierte que puede sobredimensionar buffers y consumir memoria.
