# CRT RADAR PRO V34.11S — filtro seguro para las 34 fuentes y CRH/CRL

Fecha: 2 de noviembre 2026. PR #74 DRAFT. QA ONLY / NO LIVE / NO PUSH / NO ORDERS.

## Evaluación de la recomendación DeepSeek para V34.11R

**NO aplicar** el parche `visible = visualChartAligned and (chartCoreC1 or chartExtraC1 or (chartAvailable and own.qaCatalogMask > 0))`.

Motivo: `qaCatalogMask` usa 7 bits diagnósticos, **no** 7 modelos de entrada operativos:
- 1: verdadero 3C independiente C2 setup / C3 barre C1 (QA).
- 2: 2C provisional, **no CRT ratificado**.
- 4: 2C expansión/rechazo, **no CRT válido**.
- 8: Inside Return (QA).
- 16: Inside Continuation rechazada, **no CRT válido homologado**.
- 32: Multi4 / Multi-N (QA).
- 64: Retest M15, **no modelo CRT**.

El CRT 2C estructural ratificado se sigue detectando en `CRT_2C_RETURN` de `Signal.modelKind`; el bit 1 ya no se puede reutilizar como un segundo 2C en fase C3. Resultado: **cuatro familias estructurales base (2C, verdadero 3C, Inside y Multi) con variantes**, y siete roles de auditoría. No certificar 7/7 familias por 7 bits.

Si se habilita un bit no nulo sin C1 visual, `displayC1/displayCRH/displayCRL/displayEnd` pueden ser `na`. Abrir el gráfico produciría una línea inexistente, sin evidencia o con coordenadas de otro modelo. No forzar `line.new()` con datos ausentes.

## Nuevo candidato V34.11S, archivo separado

`crt-radar-pro/CRT_RADAR_PRO_V34_11S_C1_LISTO_34_CRT_MSS_QA_NO_LIVE.pine`

**Regla del gráfico:** `visible` exige timeframe alineado, 2C core o `FamilyVisual` del mismo instrumento, C1 timestamp y high/low presentes, `displayCRH > displayCRL`, intervalo temporal válido y barras del gráfico posteriores a C1. **Nunca** el mask solo.

**Regla del dashboard:** usa los 34 objetos `Signal` de `request.security`, sin peticiones extra. Guarda por símbolo `qaCoreC1ReadyBySlot`, `qaOtherC1ReadyBySlot` y `qaOtherC1KindBySlot`; si el modelo que se está presentando en la fila carece de C1 real para dibujar, en la columna ETAPA escribe **`C1 N/D`**. En la tabla grande, indica `C1 N/D` al lado del nombre/etiqueta correspondiente. No atribuye niveles de Inside/Multi a la C1 del 2C, ni convierte retest, expansión o provisional en CRT operativo. No promueve confirmaciones MSS M5/M15.

**Prioridad en pantalla:** 2C ratificado > 2C bajo auditoría > 3C verdadero > Inside > Multi (la selección existente se conserva). Una coincidencia adicional de roles en el mismo feed no concede segunda alerta ni par visual si la primera ya ocupa esa fila.

**Controles:** mantener `Panel compacto (movil)=ON`, `Monitor principal CRT + MSS M5/M15 (QA)=ON`, `Ver los 34 instrumentos (expandir)=ON` para revisar los 34, `Ampliado: inspeccionar 7 categorias CRT (QA)=OFF` salvo investigación. Para la tabla grande heredada PDH/PDL se puede elegir `Panel compacto=OFF`, pero **no hace falta para vigilar CRT/MSS**. Al abrir un par hacerlo en el símbolo de **igual broker** (por ejemplo `IC:USDCAD`, no `OANDA:USDCAD`) y M15/M5; un proveedor distinto produce otra secuencia OHLC y puede no coincidir. Pine table no ofrece navegación por toque a otro ticker.

**CI de control:** `qore-crt-alerts/test/pine-v34-11s-safe-c1-readiness-34-feeds.test.mjs`. Foundation run #41501937465 a SHA `78728aac159768d0c320118db5163997b34f3f54`: **662/662 PASS**, offline Pine regression SUCCESS. El motor y el UDT `Signal` son byte-a-byte idénticos a V34.11R; 34 input.symbol, 60 plot(), misma cardinalidad request y guardas de push desactivadas.

## Bloqueos no resueltos
- **Compilar V34.11S en el Pine Editor TradingView real y obtener captura** con gráfica y tabla de mismo proveedor M15. Este paso no se certifica desde GitHub Actions.
- Confirmar mismo rango C1 y versión del evento (C1, C2/C3, sweep) para un 2C, verdadero 3C, Inside y Multi4/Multi-N; revisar no repaint y holdout de los 34 símbolos.
- Añadir MSS M5/M15 independientes al verdadero 3C y a variantes Inside/Multi con evidencia por cierre de cada TF (no sólo una línea de pivote).
- Preparar fuente real homologada y motor autónomo QORE CRT ALERTS Android FCM E2E (no depender de alertas TradingView). Hasta entonces: **0/7 roles certificados externamente, NO LIVE, NO PUSH**.
