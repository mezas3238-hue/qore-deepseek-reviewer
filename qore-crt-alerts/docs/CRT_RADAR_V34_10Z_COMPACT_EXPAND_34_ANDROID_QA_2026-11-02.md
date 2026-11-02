# CRT RADAR PRO V34.10z — panel compacto, vista ampliada de 34 instrumentos

Fecha: 2026-11-02. **Pine QA, NO LIVE, NO INTEGRADO.** Continuidad sobre V34.10w → x → y, sin reconstruir motor CRT.

## Comportamiento
- **Por defecto: compacto** en la esquina; muestra hasta dos CRT H4 centrales RATIFICADOS importantes (prioridad MSS M15 confirmado; luego CRT H4 ratificados aún esperando M15). Si no existen, indica `SIN CRT VIGENTE`, sin fabricar señales. 34 fuentes siguen consultadas.
- **Vista ampliada:** Ajustes del indicador → `03 / Dashboard` → activar **`Ver los 34 instrumentos (expandir)`**. Muestra **34 slots, 4 por página**, con `Pagina si hay mas senales` (páginas 1 a 9), incluyendo `SIN FEED`, `H4 N/D`, `ESPERA`, `C2*`, y estructuras `INS/MN/M4 QA`, separadas de `ALC/BAJ` ratificados.
- Al desactivar el ajuste vuelve a compacto. La tabla por defecto solo ocupa encabezado, dos señales y dos filas de estado.
- Pie: `R:respondidos/consultados`, `SIN:sin feed`, `QA:estructuras QA` y `34 FEEDS/BTC SOLO` muestran que **34 consultados no significa 34 CRT vigentes**.
- No añade `request.security`, no cambia el bucle de 34 fuentes, f_engine ni alertas. `useAlerts=false` continúa por defecto. No integra FCM ni autorización de señales.

## Límite del producto y UX futura
Las celdas `table.cell` de Pine v6 son una visualización **no táctil**; no existe `onClick` ni API para abrir un panel por toque. La solución realizable dentro de TradingView es un `input.bool` en Ajustes. No simular clic en tabla ni prometerlo.
TradingView incorporó en 2026 el menú **Move tables to bottom**: usuario puede mover una tabla al panel inferior desde el menú del indicador, donde no tapa el gráfico y puede desplazarse. Esta operación es control de TradingView, no un evento detectado por Pine.
En la futura aplicación Android QORE CRT ALERTS, implementar pulsación real sobre el encabezado y listado expandible de los 34 con estado de verificación del proveedor.

## Evidencia y criterios
- Candidato: `crt-radar-pro/CRT_RADAR_PRO_V34_10Z_COMPACTO_EXPANDIR_34_QA_NO_INTEGRADO.pine`.
- Pruebas QA: `qore-crt-alerts/test/pine-v34-10z-expand-compact-mobile.test.mjs`.
- Comparación estática: `f_engine()` y el loop completo de `request.security` de 34 permanecen idénticos a V34.10y.
- La certificación Pine v6 en TradingView real, OHLC 34/34, paridad MSS M15, no-repaint y APK/FCM E2E siguen pendientes. **No unir DRAFT ni habilitar alertas reales**.

## Prueba manual en Android
1. Abrir TradingView y pegar el archivo de V34.10z como indicador QA nuevo sin reemplazar V34.10w.
2. Abrir ajustes → 00 / Memoria (QA) → `34 instrumentos (experimental)`.
3. En 03 / Dashboard dejar `Panel compacto (movil)` activado y `Ver los 34 instrumentos (expandir)` desactivado. Debe verse una vista pequeña con CRT vigentes prioritarios.
4. Para ver los 34, activar `Ver los 34 instrumentos (expandir)`; cambiar `Pagina si hay mas senales` del 1 al 9.
5. Confirmar `R:34/34` solo si 34 respondieron; si muestra otro número, registrar símbolos `SIN FEED` para corregir datos, sin tocar reglas CRT.
6. Para liberar superficie, desde el menú del indicador usar `Move tables to bottom` si la opción está disponible en la interfaz.
