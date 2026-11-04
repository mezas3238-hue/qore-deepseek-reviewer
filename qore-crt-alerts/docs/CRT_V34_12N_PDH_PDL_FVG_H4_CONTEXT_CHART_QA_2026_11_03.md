# CRT RADAR 34 + CHART V34.12N — PDH PDL + ultimo FVG H4 cercano a CRT (QA)

2026-11-03 · PR #74 DRAFT. **NO LIVE / NO PUSH / NO MERGE.**

## Solicitud del Owner

Añadir al mismo gráfico del CRT los niveles **Previous Day High (PDH)** y **Previous Day Low (PDL)** con el horario NY propio del mercado, y un FVG H4 espacialmente próximo al CRT formado. Sin contaminar MSS ni sumar solicitudes security. La investigación de USDCAD Multi4 MSS (v12M) permanece congelada y separada.

## Implementación incremental

- Nuevos inputs del **grupo 04 / Chart integrado**: `Mostrar PDH/PDL de sesion validada (QA)`, `Mostrar ultimo FVG H4 cercano al CRT (QA)`, distancia máxima FVG respecto al rango C1 (`1.5x` por defecto) y ventana de antigüedad `6 H4` previa a C1.
- PDH/PDL: reutiliza `own.nyPDH`, `own.nyPDL`, `own.nyPDHReferenceAt`, `own.pdhStatus`, `own.pdlStatus` del **mismo Signal escaneado para el proveedor exacto del gráfico**. Solo dibuja ambos si existe sesión de referencia validada; no muestra niveles N/D ni toma OHLC incompletos como referencia. Índices usan su modo RTH/extended configurado en el motor, FX 17-17 NY, BTC 00-00 NY.
- FVG: `own.fvgH4Top/Bottom/FormAt/StateCode` contiene el **ÚLTIMO FVG H4 registrado**, no una colección de todos los FVG. Solo se dibuja **una zona violeta semitransparente** si la estructura CRT está visible, FVG intacto (código 0) o parcial (1), formado desde un máximo de `6 H4` antes de C1 hasta el límite del evento, y cuya distancia espacial al rango C1 es como máximo `1.5 x (CRH-CRL)`. Un FVG anterior más próximo podría quedar omitido si no fue el último; eso es una limitación explícita, no afirmar "nearest all".
- Hasta 6 líneas (CRH/CRL, MSS M5/M15, PDH/PDL), 1 box H4, máx. 5 etiquetas; `max_lines_count=8`, `max_labels_count=8`, `max_boxes_count=2`.
- Líneas PDH turquesa punteada, PDL fucsia punteada, FVG violeta translúcido. CRH/CRL naranja y MSS se mantienen.
- Solamente gráfico de ticker estándar con proveedor que coincida *exactamente* con uno de los 34 feeds; no se dibujan niveles ajenos.
- No modifica el `f_engine()` ni sus 132 argumentos de `Signal.new`, los 34 slots/600 M5, gating 2C RAT/QA, sesiones CRT, MSS, ni emite alertas.

## Validación / limitaciones

Prueba Node QA de contratos y CI NO sustituye compilación Pine Editor o verificación visual en TradingView Android. Con 600 M5 algunas sesiones previas y algunos FVG pueden quedar fuera del historial; en ese caso las líneas/zonas faltarán legitimamente y no se fabrican precios. FVG H4 nativo desplazado (+1/+2 min) es **QA no certificado** para NY H4 :00, y no se puede usar para filtrar entradas LIVE.

Prueba manual: mismo broker IC:USDCAD 15m, alternar capas ON/OFF, comparar PDH/PDL con sesión previa realmente COMPLETA del mismo proveedor, verificar FVG H4 etiquetado como "ULT", de rango y tiempo correctos, comprobar sin box tras invalidación o sin CRT, validar que la tabla MSS Multi4 siga en N/V hasta disponer de evidencia. Probar 2 mercados adicionales y que no haya Memory limits exceeded.

Siguiente evolución si el Owner la necesita: conservar/buscar el **FVG H4 verdaderamente más cercano entre múltiples zonas**, lo cual requiere payload de zonas y selección con criterio temporal causal por CRT, nuevos tests y presupuesto de memoria — no inventarlo con el último FVG.
