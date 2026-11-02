# CRT RADAR PRO V34.11g — 33 fuentes: causa del bloqueo H4

**2 nov 2026. DRAFT / solo QA.**

## Evidencia TradingView Android suministrada

La captura real del panel `CRT MSS QA 4C 11F` en NZDCAD M15 presenta:
- `R:33/33`: 33 fuentes distintas de BTCUSD respondieron (no prueba OHLC equivalente ni un CRT activo).
- `0C1:30`, `C1+:3`, `BLOQ:30`, `HIST:3`: 30 instrumentos sin C1, tres con alguna C1 y tres con patrones históricos en contexto. Estos tres últimos no necesariamente son los mismos sin comparación por slot.
- `FX:28`, `MET:2`, `IND:3`, `H4:1037`, `PARC:943`, `INT:13`. 943 etiquetas parciales ≠ 943 gaps reales de proveedor, y no se deben interpretar como 943 días/velas ausentes. La suma puede diferir de 1037 por H4 completas y DST.
- Primeras 4 filas: AUDJPY 31/31 H4 incompletas; GBPUSD 32/32; GBPJPY 31/31; XAUUSD 33/33. C1 OK = 0 en esos cuatro.
- BTCUSD permanece en fila APARTE, con contador C1 propio `13` en esta imagen, pero esto NO certifica 13 entradas reales.

## Verificación de código

El motor marca H4 `fullH4` solo cuando se cumple **todo**:
`h4Continuous && h4Count == 48 && h4FirstT == h4Bucket && h4LastEnd == h4Bucket + H4MS`.

Cuando falla, `qaAuditH4Session` ("PARC") es la categoría residual: no es prueba de pérdidas de datos; puede ser **inicio NY diferente**, **fin H4 diferente**, **menos/más de 48 M5**, o ventana parcial de proveedor. En la imagen PARC 943 es la principal causa observable, mientras los huecos *internos* son 13.

No se puede concluir todavía si el causante es fecha/huso, proveedor, sesión, DST o ejecución `request.security` sin tiempos M5 detallados. **No es correcto cambiar f_engine para aceptar H4 incompletas o fabricar CRT.**

## Nuevo código V34.11g

Pine candidato exacto `crt-radar-pro/CRT_RADAR_PRO_V34_11G_H4_RAZONES_33_QA.pine`, SHA blob Git `ea619e19b271bfffed96fe05bc71fa6c584c1316`, derivado de V34.11f:

- `03 / Dashboard → QA: auditar los 33 instrumentos sin BTC` (ON para probar) y `QA 33: mostrar causas H4 (inicio/fin/conteo)` (ON por defecto dentro de ese modo).
- Por cada fila y feed **MAL INI**, **MAL FIN**, **NO 48**: cuántas H4 incumplen cada condición durante la ventana observada. Son motivos que **pueden superponerse**; jamás sumarlos para obtener H4 BAD.
- Pie 33 se mantiene: 33 respuestas, 30 bloqueos, grupos 28/2/3, y BTC separado con su contador original.
- Dos filas adicionales por el instrumento del gráfico, **si coincide EXACTAMENTE el ticker con proveedor no-BTC**, o slot manual no BTC: **H4 ULT M5 / # M5 / INICIO Δm / FIN Δm / FEED / AUTO-MANUAL**. Desplazamientos en minutos firmados respecto de la H4 NY reconstruida. **0** es alineado; valores distintos demuestran desfase/fin parcial. Una única H4 última no representa a todas las históricas; los contadores son acumulativos.
- No se ha modificado el reconocimiento BTC ni H4/C1/C2/C3/MSS15, ni la lógica de 48 M5, el escaneo 34, las 60 salidas de diagnóstico o alertas OFF. Solo UDT/arrays QA, contadores y render de tabla existente.
- Test de regresión `qore-crt-alerts/test/pine-v34-11g-h4-33-root-evidence.test.mjs` comprueba aislamiento BTC, motivos por 33 feed, continuidad H4 sin relajar, proveedor exacto y bloqueo de push.

## Ensayo real solicitado

1. En Android / TradingView, cargar el archivo como nuevo indicador QA, ocultando V34.11f (respaldo).
2. Gráfico `IC:NZDCAD` M15; 00/Memoria `34 instrumentos`; 03/Dashboard `QA: auditar los 33 instrumentos sin BTC` ON; `QA 33: mostrar causas H4` ON.
3. En la primera página registrar `MAL INI`, `MAL FIN`, `NO 48`. Abajo registrar, para `IC:NZDCAD`, número real de M5 de la última H4 e `INICIO Δm / FIN Δm`.
4. Si `MAL INI` predomina, verificar ancla horaria por feed/NY; si `MAL FIN`, verificar fin H4/pausa; si `NO 48`, verificar disponibilidad de todas las M5 y límite/histórico del feed, sin reducir el mínimo.
5. Repetir páginas 2..9, poniendo especial atención a índices y metales, cuyos horarios y sesiones no tienen por qué ser idénticos a Forex. Verificar catálogo fuente a fuente en Trader Lab con las mismas M5 cerradas de IC/OANDA.
6. Solo después corregir la causa demostrada, repetir auditoría 33 y certificar C1→C2→C3, MSS15, siete categorías, no-repaint y holdout. No activar notificaciones ni ejecutar operaciones.

**Estado:** evidencia visual de bloqueo global 30/33, QA de nueva instrumentación y pruebas offline; compilación de V34.11g en TradingView y captura de los contadores nuevos aún pendientes. No afirmar que el problema quedó resuelto antes de observar nuevos valores.
