# CRT RADAR PRO — V34.11a · término de siete categorías · criterio de entrega

**Corte 2026-11-02** · QA DRAFT · no integrable hasta certificar Pine v6 real y 34 fuentes.

## Implementación actual

**Pine fuente:** `crt-radar-pro/CRT_RADAR_PRO_V34_11A_SIETE_CATEGORIAS_34_FEEDS_QA.pine`, derivada de V34.10z, sin reconstrucción.
- Preserva 34 `request.security(...,"5", f_engine_snapshot(),calc_bars_count=1500)` y misma lógica CRT C1→C2→C3, NY/DST, FVG, PDH/PDL, MSS M5/M15 y no órdenes.
- El UDT `Signal` conserva un **catálogo explícito de 7 bits**, por proveedor e instrumento: 1 3C ratificado (estructura H4); 2 2C candidato **no ratificado**; 4 expansión C2 **rechazada**; 8 Inside Return **QA**; 16 Inside Continuation **rechazada**; 32 Multi-Candle **QA** (Multi-N/4 H4); 64 retest M15 **QA posterior a MSS15**.
- Dentro del escáner se guarda `qaCatalogPerFeed[34]`. Ya no se confunde selección de la última familia extra con pérdida de todas las demás categorías.
- La vista compacta prioriza CRT **ratificados**, luego MSS M15; la vista `Ver los 34 instrumentos (expandir)` + `Ampliado: inspeccionar 7 categorias CRT (QA)` muestra estados por mercado en 9 páginas (4 por página). Las QA/rechazadas nunca reciben check verde operativo.
- Se restauró y probó la condición **`extraMssAt > extraSweepAt`**: Inside/Multi nunca puede atribuirse confirmación M15 anterior a su propia barrida.
- `useAlerts=false` predeterminado; nunca habilitar FCM/Android desde esta rama.

## No confundir siete etiquetas con siete detectores de entrada independientes

La taxonomía de siete categorías contiene **etapas y rechazos**, además de familias estructurales. Conservar una expansión rechazada y una continuación Inside no aprobada como **diagnóstico**, sin fabricar entradas, es un requisito de corrección, no una falta de implementación. No anunciar `7/7 entradas activas`; sí observar siete categorías separadas.

## Puerta de paridad ejecutable

- `src/crt-seven-category-parity-audit.mjs`: acepta 34 feeds M5 del mismo proveedor y ventana, evidencias de laboratorio `INDEPENDENT_TRADER_LAB_SEVEN_CATALOG_REPLAY`, y capturas verificadas `TRADINGVIEW_PINE_V6_CAPTURE`; compara los siete bits por instrumento.
- Valida número y unicidad de fuentes, serie M5 **cerrada**, hash SHA256, identidad proveedor+símbolo, `asOf`, número/rango de velas y SHA exacto del Pine; bloquea evidencias no auténticas, discrepancias o 35º feed.
- Un retest M15 reclama prueba causal `pivotAt < sweepAt < mssAt < retestAt` con M15 cerradas del mismo instrumento/proveedor, no MSS5.
- **El resultado MATCH siempre es `UN CERTIFIED`**: coincidencia de máscaras NO demuestra que las marcas H4, timestamps MSS, compilación/no repaint o OHLC fueran obtenidos realmente. La certificación externa requiere pruebas adicionales.

Ejecutar desde Codespace/GitHub:

```bash
cd qore-crt-alerts
npm test
npm run parity:seven -- /ruta/evidencia-34.json
```

Sin evidencia real de TradingView, el segundo comando debe bloquearse. Las 34 fuentes del laboratorio no reemplazan el feed de TradingView. El archivo JSON no debe incorporar claves, tokens Firebase ni credenciales de datos.

## Cierre obligatorio antes de lanzar

1. Compilar versión exacta en TradingView Pine v6 y comprobar cero errores de memoria/request en Android; archivar SHA y capturas del editor.
2. Observar 34/34 fuentes reales; para cada una guardar proveedor, OHLC M5 cerradas, hash y horario NY para C1/C2/C3. Corregir ticker o fuente invalidada, no inventar eventos.
3. Paridad por **evento** y **modelo** (no solo máscara), con C1, barrida, cierre C2, invalidación C3, pivote M15 L2/R2 pre-barrida y primer cierre de ruptura M15. Corregir diferencias justificadas en Pine/Trader Lab.
4. Completar definición acordada/ilustrada de Inside Continuation y Multi4 distribuido y sus causales MSS M15; hasta entonces QA/rechazo según corresponda.
5. Holdout sellado 34/34, sesiones, DST, pausas, latencia, repaint y límites Pine reales; no recuentos 1500 vs históricos 9539 como si fuesen comparables.
6. Autorizar Android solamente después de feed STAGING, registro autenticado, opt-in y E2E Firebase por dispositivo: deduplicación, reintentos, desconexión y rechazo de eventos falsos.

**Veredicto actual:** implementación del registro/diagnóstico 7 categorías en 34 feeds **en código QA**; **Pine/TradingView/Android NO CERTIFICADOS**. NO MERGE. NO LIVE. No abandonar versión anterior del usuario.
