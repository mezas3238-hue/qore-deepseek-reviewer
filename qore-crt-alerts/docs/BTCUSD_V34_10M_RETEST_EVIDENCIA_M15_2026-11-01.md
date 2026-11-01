# CRT RADAR PRO V34.10m — evidencia de retest M15 directamente en dashboard Android

Fecha: 2026-11-01. Candidato QA NO INTEGRADO, desde V34.10l. PR DRAFT, NO MERGE, NO LIVE.

## Origen
El propietario envió capturas de V34.10l con `CRT 3C REV MSS C3`, `RETEST M15 QA` en H1, M5 y M15, manteniendo PDH/PDL del mismo proveedor, MSS M5/M15 independientes y respuesta del escáner de 34 instrumentos. Los parámetros de entrada fueron comprobados: swing 2/2 en ambos, catálogo activado y alertas OFF.

Advertencia: la fila `BTC MSS QA` muestra la **última vela M15 cerrada**, que no equivale al momento del RETEST. No se debe atribuir el retest a las 16:45 por esa celda.

## Cambio V34.10m
- Persistir exclusivamente al primer retest M15 del ciclo los OHLC: `qaRetest15High`, `qaRetest15Low`, `qaRetest15Close` y pivote congelado `qaRetest15Pivot`, siempre sobre M15 que agregaron 3 M5 cerradas consecutivas.
- Reinicializar las cuatro evidencias si cambia el MSS/ciclo o el MSS deja de estar disponible.
- Visibilidad QA exige identidad de C1, fuente de MSS M15, pivote original, dirección, intervalo temporal posterior al MSS y <= cuatro horas, además de toque y cierre al lado correcto. Nada se eleva a entrada.
- Agregar a `Signal` cuatro campos finales y cuatro trazas numéricas en Data Window; `retest15At` existente se conserva.
- Nueva fila 4 del dashboard para BTC con catálogo activo: `RETEST M15 | dd/MM HH:mm NY | P:<pivote> | H:<max> / L:<min> | C:<cierre> | TOQUE QA`.
- La hora muestra **el cierre de la vela que disparó el retest**, no el último M15. Si no hay prueba compatible, mostrar `ESPERA` y precios N/D.
- 34 símbolos por escaneo se mantienen, pero máximo **dos filas de otros símbolos por página** cuando se reserva también la fila 4 de evidencia; sin catálogo, máximo cinco. No se añaden llamadas `request.security`.
- Permanecen los algoritmos CRT H4 C1/C2/C3, MSS M5 y M15, FVG H1/H4, PDH/PDL, Inside, MULTI4, precios y formato; no habilitar alertas.

## Verificación
1. Copiar TXT completo V34.10m a indicador NUEVO desde Android. Mantener V34.10i/k/l de respaldo.
2. COINBASE:BTCUSD M5 y M15, mismo proveedor, con `34 instrumentos (experimental)`, catálogo CRT ON, `useAlerts` OFF.
3. Verificar fila `RETEST M15` con instante NY, pivote, H/L y C. Para evento bajista: H >= P y C < P; alcista: L <= P y C > P. Se verifica **con el precio de la vela de retest**, no con vela actual.
4. Comparar con OHLC M15 del broker en la **fecha y hora real de cierre**; confrontar C1/MSS/ciclo y comprobar vela cerrada, no provisional.
5. Verificar que 34 SNAP/RESP y página no pisan diagnóstico, y las líneas CRH/CRL, MSS y PDH/PDL no cambiaron.
6. Probar M5/M15/H4 en TradingView Android y observar límites de memoria y reloj Nueva York.

## No certificados
TradingView real compilación V34.10m: pendiente de ejecución humana.
Paridad M5 proveedor Pine↔backend: pendiente; 34 feeds: no homologados.
FCM Android real y pruebas STAGING E2E: pendientes; BuildConfig deshabilita notificaciones.
No LIVE, no merge, no señales operativas.
