# CRT RADAR PRO V34.11c — auditoría del proveedor y líneas CRH/CRL en TradingView Android

**Fecha:** 2026-11-02. **QA / DRAFT / NO LIVE**. Origen: dos capturas de NZDCAD en M15 y H4 mostrando líneas "CRH"/"CRL", al tiempo que el panel de V34.11b indica `PHASE 0`, `MASK 0`, C1/C2 `N/D`, `R:34/34`.

## Diagnóstico sustentado en el código

1. El indicador V34.11b dibuja líneas de niveles únicamente con rótulos exactos **`CRT H4 NY HIGH`** y **`CRT H4 NY LOW`**, cuando hay C2 H4 ratificada en el motor NY y temporalidad visual compatible. Los rótulos cortos "CRH"/"CRL" **no se originan en sus label.new/label.set_text**; revisar visibilidad de otros indicadores o dibujos preexistentes antes de atribuirlos a V34.11b.
2. `PHASE 0`, `MASK 0` solo describen el último snapshot de ese feed; no niegan la existencia de estructuras históricas al desplazarse hacia atrás en el gráfico. `barstate.islast` no sigue la vela ubicada en el centro de la pantalla.
3. `R:34/34` certifica **34 resultados de la solicitud a Pine**, no 34 series completas, equivalentes a Trader Lab, sin huecos ni 34 CRT.
4. La etiqueta fija `MASK != EV` de V34.11b es engañosa: no se había realizado una comparación evento por evento en el panel, solo se había calculado el bitmask del snapshot.
5. El slot 34 es `IC:NZDCAD` por defecto. Un gráfico llamado "NZDCAD" puede corresponder a otro proveedor y no debe suponerse que los precios sean la misma fuente.

## Correcciones nuevas

**Pine QA:** `crt-radar-pro/CRT_RADAR_PRO_V34_11C_FEED_AUDIT_GRAFICO_QA.pine` (blob SHA `3c202bf8ff7eaec8b8f043aad8d0117cccd900ca`).
- `QA: seguir grafico solo si proveedor coincide` activado por defecto. Busca el `ticker.standard` exacto del feed contra el `ticker.standard(syminfo.tickerid)`, no solo el alias `NZDCAD`.
- Si coinciden, selecciona automáticamente el slot exacto. Si no, usa el selector manual **y señala explícitamente** `FEED!=CHART` / `PROV DIF` / `SIN MATCH`. No sustituye datos entre proveedores.
- Añade identificadores de fuente completos `GRAFICO` y `FEED`, número de slot, `SIN CRT ACT`, `MASK=EST` (estado) y `EST ACTUAL`. El usuario puede identificar la versión `V34.11c` en el pie QA.
- La impresión de pivotes QA ya **no usa el mintick del gráfico para precios obtenidos de otro feed**; presenta hasta 10 decimales de la fuente, como telemetría visual (no equivale a precisión numérica de JSON).
- `f_engine()`, 34 M5 consultados, lógica de C1/C2/C3 y MSS M15, 60 `plot()` y alertas: **sin modificaciones**.
- Comparador de trazas admite **solo blobs PINNED exactos** V34.11b/11c; coincidencia de máscaras/eventos sigue `UNCERTIFIED` y jamás desbloquea órdenes o FCM.

## Instrucciones de prueba en Android

1. En el gráfico, abrir **Indicadores** y ocultar temporalmente todos los indicadores anteriores y dibujos ajenos; dejar únicamente **CRT MSS QA 4C 11C**. La ausencia de "CRH"/"CRL" al ocultar otro indicador identificaría su origen visual.
2. Añadir este archivo Pine V34.11c desde la rama actual como QA **sin sobrescribir el anterior**; archivar resultado de compilación.
3. Elegir NZDCAD M15 y, en Ajustes `03 / Dashboard`, activar `QA: ver tiempos CRT/MSS de 1 instrumento` y dejar activado `QA: seguir grafico solo si proveedor coincide`; en `00 / Memoria` dejar **34 instrumentos**.
4. Verificar la última fila del panel: **GRAFICO** debe indicar el ticker completo del proveedor abierto; **FEED** el ticker exacto consultado. Si `PROV DIF`, no comparar niveles sin homologar el proveedor. Si `MISMO ORIGEN`, inspeccionar estado actual, C1/C2/MSS y continuar pruebas.
5. Cambiar M15 y H4 del mismo instrumento/proveedor y cotejar que ambas auditorías corresponden al **mismo feed M5**. Las líneas de un CRT NY no tienen por qué coincidir con velas H4 del broker si su ancla es diferente.
6. Para revisar un CRT **histórico**, usar Bar Replay/Data Window y capturar los tiempos completos de C1, barrida, cierre C2 y MSS15 de esa fecha; **no** inferirlo del snapshot `barstate.islast` mostrado en una vista desplazada.
7. Todavía falta demostrar compilación de este nuevo SHA en TradingView, igualdad de OHLC de 34 mercados, trazas temporales completas, no-repaint/holdout y pruebas Android push E2E.

**Control:** no merge, no live, no órdenes, no notificaciones.
