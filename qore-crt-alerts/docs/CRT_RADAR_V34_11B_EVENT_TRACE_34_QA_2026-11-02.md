# CRT RADAR PRO V34.11b — Auditoría causal por instrumento y paridad de eventos

**Estado** 2026-11-02 · QA DRAFT · NO LIVE · conservar V34.10w como respaldo.

## Alcance comprobable en código

El candidato `crt-radar-pro/CRT_RADAR_PRO_V34_11B_34_SLOT_CAUSAL_TRACE_QA.pine` conserva los **34** `request.security(symbol, "5", f_engine_snapshot(), calc_bars_count=1500)` del ciclo principal. `f_engine()` es **idéntico** al V34.11a. Mantiene el panel compacto y la vista de los 34. No añade request, plot, webhook, FCM ni operaciones. Tiene 60 `plot()` previos: la telemetría adicional usa la MISMA tabla de seis columnas ya existente para no superar el margen de Pine.

La configuración **03 / Dashboard** incluye:
- `QA: ver tiempos CRT/MSS de 1 instrumento` (OFF predeterminado);
- `QA: numero de instrumento (1-34)` (1 predeterminado).

Con el control QA encendido, la tabla del indicador muestra un **snapshot** del slot solicitado: identidad, respuesta, fase, máscara de siete categorías, C1, C2, barrida C2, ratificación, pivote M15 (tiempo/precio), ruptura M15, última M15 cerrada y la última estructura auxiliar Inside/Multi con sus marcas causales propias. Los tiempos se muestran como **minutos UNIX UTC** para transcripción sin zonas locales ni redondeos de hora. Valores `N/D` o `SIN FEED` son ausencia de evidencia, NO cero, NO CRT de otro proveedor.

No es un historial de eventos: una captura de tabla de un solo instante puede omitir patrones anteriores o simultáneos. No promover máscara 7-bit por sí sola como siete entradas.

## Motor de comparación por eventos

El nuevo archivo `src/crt-seven-category-event-parity.mjs` amplía el validador de las siete máscaras y exige **eventos por categoría y slot** tomados independientemente de Trader Lab y del editor Pine. Valida:

- 34 fuentes/slots originales y mismos proveedores, `instrumentId`, OHLC M5 cerradas, hash SHA256 y últimos **hasta 1500 M5** exactamente;
- SHA exacto del archivo Pine V34.11b: `28c8c731c943d9c3b3f8a2cc77746dee3a02f8c6`;
- 7 categorías declaradas por estado correcto (3C `RATIFIED`, 2C `PROVISIONAL`, expansiones/continuación `REJECTED`, Inside y Multi `QA_RATIFIED`, retest `QA_OBSERVED`);
- igual evento por **modelo + variante Multi4/Multi-N + proveedor + instrumento + dirección + C1 + fecha exacta + inicio C2 + sweep + ratificación**;
- MSS M15 propio con **pivote precio + pivotAt < sweepAt < breakAt**, cierre real M15, misma C1/proveedor; retest estrictamente posterior al MSS;
- ningún duplicado, ninguna categoría declarada sin evento causal, ninguna máscara modificada para ocultar discrepancias;
- 34 fuentes con cero eventos NO se transforman en certificación, aunque ambos sistemas coincidan en el vacío.

Para ejecutar (requiere fichero de evidencia original real, **no fixtures sintéticos**):

```bash
cd qore-crt-alerts
npm test
npm run parity:events -- /ruta/evidencia_34_m5_pine_trader_lab.json
```

El documento de evidencia requiere el mismo objeto `catalog/feeds/pineCaptures/labSnapshots/asOf/pineSourceBlobSha` del contrato `parity:seven`, agregando a cada captura `events`. Cada evento tiene `category`, `state`, `provider`, `instrumentId`, `direction`, `c1StartMs`, `eventAtMs`; para 3C `c2StartMs`, `sweepAtMs`, `ratifiedAtMs`; para Multi `variant` en `MULTI4/MULTI_N`. MSS opcional requiere `mss15={provider,instrumentId,timeframe:"M15",c1StartMs,pivotAtMs,pivotPrice,sweepAtMs,breakAtMs,observedUntilMs}`; retest suma `retestAtMs`. `categoryMask` debe corresponder exactamente a los bits declarados en `events` y al tiempo de captura.

**Importante:** `verifiedOnTradingView:true` es una declaración de operador y `evidenceLocator` es una referencia, **no** autenticación criptográfica. La comparación de eventos puede devolver `ALL_34_EVENT_TRACES_MATCH_UNCERTIFIED` pero nunca certifica compile/runtime/no-repaint, fuentes con equivalencia homologada, independencia de holdout, ni envío Android. Un archivo sintético no es evidencia real.

## Pasos para el ensayo real desde Android

1. Copiar el archivo Pine **V34.11b** desde su rama sin sobrescribir V34.10w. Compilar en TradingView Pine v6 y archivar captura del resultado; un test Node PASS no demuestra compilación.
2. Poner `00 / Memoria (QA) → 34 instrumentos (experimental)`. Verificar `R:34/34` o inventariar los `SIN FEED`.
3. Activar `QA: ver tiempos CRT/MSS de 1 instrumento`; seleccionar slot 1..34. Registrar símbolo **completo del proveedor**, captura, instante de M5 cerrada y los campos de tiempo/precio. Un slot diferente debe producir valores de su propia fuente.
4. Exportar M5 OHLC del MISMO proveedor para la última ventana de 1500 y generar la evidencia `Trader Lab` independientemente (sin circularidad ni copia de Pine).
5. Comparar mismo evento, y cuando haya discrepancia clasificar `PINE_MISSING`, `LAB_MISSING`, `TIMESTAMP`, `MODEL`, `MSS_M15`, `OHLC_PROVIDER`; no cambiar reglas para inflar detecciones.
6. Certificar no-repaint y holdout y recién después completar prueba Android E2E de notificaciones autenticadas con opt-in.

**Veredicto pendiente:** real TradingView Pine v6 compilación, 34/34 feeds, 7/7 contratos de evento sobre históricos validados, MSS M15, holdout real, móvil Android FCM. Sin merge ni publicación hasta que exista evidencia original.
