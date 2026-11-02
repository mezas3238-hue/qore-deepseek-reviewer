# CRT RADAR PRO V34.10r — auditoría histórica de detectores H4 por modelo
Fecha de corte: 2026-11-01 · Rama separada · NO INTEGRADO · NO LIVE

## Necesidad verificada
El propietario probó V34.10q en TradingView Android, `COINBASE:BTCUSD` M15 con `Solo CRT + QA`: panel `CRT:0 QA:0 RESP:34 SD:0`, `C1:13`, `C2 OK:2`, `ULT C2 OK (HIST)`, `INSIDE HIST`, `M5:31` de la H4 NY actual. Esto descarta que un filtro de vista equivocado explique la ausencia del CRT: faltaba conocer el historial real de cada motor y la razón de rechazo. `RESP:34` no certifica cobertura ni paridad de los 34 feeds.

## Cambio funcional V34.10r
Sin reconstruir el motor, se instrumentaron **19 contadores persistentes por contexto** (últimas M5 cargadas del proveedor de ese contexto) y se añaden a `Signal`:
- **Ratificados por detector**: `2C` al cierre C2 ratificado; `3C` al cerrar C3 válida; `INS` al ratificar Inside Return; `M4` al validar Multi4 distribuido; `MN` al validar Multi-N con 2–5 H4 interiores, con barrida terminal H4 cerrada.
- **C2 rechazo, motivo exclusivo**: `GAP` por datos de C2 insuficientes; `DOB` doble barrida; `SIN` sin sweep estricta; `FUERA` cierre fuera/no retorno; `HORA` desajuste de ancla C3. Estos motivos solo se cuentan una vez, al cerrar C2 candidata.
- **C3 INV**: cierre C3 inválido respecto a mecha C2 o H4 incompleta en BTC; nunca sumarlo como `3C` válida.
- **Inside descartes**: `GAP` por falta de continuidad, `DOB` por doble barrida, `OTRO` por `CONTINUATION`, `UNRESOLVED` o invalidación de C1, `VENC` por vida H4 agotada. Se cuentan al convertirse en estado terminal, no continuamente mientras aparezcan en memoria.
- **Multi-N terminales evaluadas**: `SIN` (consolidación completa, aún sin barrida terminal), `DOB` (doble sweep), `FUERA` (barrida unilateral con cierre exterior). Solo una causa por cierre H4 terminal, aun con varios valores N posibles; un `SIN` puede preceder un `MN` válido posterior, **no es un error ni una señal**.
- **H4 GAP**: cada H4 cerrada con alguna vela M5 faltante o discontinuidad/menos de 48 M5. Esto no describe por sí solo un error del proveedor; puede corresponder a mercados con sesiones parciales.

Los contadores están separados de `phase`, `modelKind`, `mssAt`, alertas y los estados actuales. Una ratificación histórica no se considera un CRT vigente.

## Nueva vista opt-in en Android
En **03 / Dashboard → Vista**, añadir `Auditoría histórica (QA)`. Esta vista sustituye SOLO las filas de diagnóstico 7–11 por cinco líneas:
- `HIST M5 2C:n 3C:n INS:n M4:n MN:n`.
- `C2 RECH GAP:n DOB:n SIN:n FUERA:n HORA:n`.
- `INS RECH GAP:n DOB:n OTRO:n VENC:n C3 INV:n`.
- `MN TERM SIN:n DOB:n FUERA:n H4 GAP:n SOLO QA`.
- `ALCANCE GRAFICO M5 HIST NO 34 HIST NO FCM NO LIVE`.

**Solo CRT** sigue siendo la vista predeterminada, no presenta 34 activos vacíos ni patrones QA. `Solo CRT + QA` mantiene la comparación de familias provisionales. `Auditoría histórica` solo analiza el **símbolo abierto del gráfico**, no son conteos históricos agregados de 34 símbolos. Cuando se salga del modo auditoría, se restauran filas PDH/PDL/MSS sin modificar el motor ni el resumen `CRT / QA / RESP`.

## Procedimiento de validación real
1. Conservar **V34.10p y V34.10q** (ambas ya se mostraron en Android); crear nuevo indicador V34.10r desde el TXT completo de GitHub en la rama.
2. COINBASE:BTCUSD M5/M15, escaneo `34 instrumentos (experimental)`; mantener alertas OFF.
3. Comparar la vista `Solo CRT + QA` con V34.10q para verificar que CRT, MSS, PDH/PDL, niveles y conteos vigentes no se alteran.
4. Elegir `Auditoría histórica (QA)` y capturar las filas 7–11. Documentar `2C/3C/INS/M4/MN` y rechazos. Si el feed BTCUSD está abierto, las H4 incompletas no se contabilizan como ratificadas.
5. Interpretación: `HIST M5` refleja el número de eventos que han pasado por el historial **efectivamente cargado** de Pine (el escáner solicita `calc_bars_count=1500` en cada `request.security`, el ticker del gráfico tiene su propio rango). NO equivale al historial del mercado completo, a 34 feeds certificados, a seis meses ni a 34 señales CRT.
6. Repetir en un ticker Forex tras actividad suficiente, y comprobar huecos de sesión; no extrapolar del BTCUSD continuo.
7. En cuanto exista un rechazo claro, contrastar timestamps C1/C2/C3 y OHLC del mismo proveedor; validar si la lógica de detección o la fuente causó el descarte.

## Pruebas automatizadas
`qore-crt-alerts/test/pine-v34-10r-historical-audit.test.mjs` verifica campos, contador por transición H4, razones exclusivas C2, no duplicación Multi-N, configuración predeterminada, ausencia de nuevas `request.security`, puertas de alertas y separación del panel histórico.
Es un **test estático Node**, NO una compilación real Pine. Debe añadirse prueba manual TradingView y certificar runtime de memoria, límites, rendimiento M5/34 y valores reales contra OHLC.

## Bloqueos aún existentes
- Falta completar confirmación MSS M15 causal **por Inside/Multi-N**, no heredar la del CRT 2C/3C.
- Definición de las «siete familias» sigue siendo una taxonomía mixta (cuatro morfologías documentadas y variantes/estados/entradas) hasta nueva evidencia visual verificable.
- No se ha certificado continuidad del escáner 34, no-repaint, Pine/backend parity ni alertas push Android E2E.
- PR #63 y sus ancestros protegidos. Este PR también **DRAFT**; NO MERGE, NO LIVE, NO FCM, NO ÓRDENES.
