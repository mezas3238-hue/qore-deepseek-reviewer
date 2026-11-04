# CRT RADAR PRO V34.11f — certificación por cohorte de 33 mercados, BTCUSD independiente

**Fecha:** 2026-11-02. **Estado:** QA DRAFT / NO MERGE / NO LIVE / NO PUSH.

## Decisión funcional del propietario
Los controles de H4, C1, C2, C3 y MSS M15 deben comprobarse **en los 33 instrumentos distintos de BTCUSD**, no extrapolar el resultado de NZDCAD. BTCUSD usa un camino de reconocimiento específico y nunca se cuenta dentro del denominador de 33. Se mantiene el escaneo simultáneo de los 34.

### Catálogo verdadero de 34 inputs del Pine (sin reemplazar símbolo/proveedor)
- **28 Forex** (ancla NY 01/05/09/13/17/21, sujeto a apertura/cierre real): AUDJPY, GBPUSD, GBPJPY, AUDUSD, USDCAD, USDJPY, EURUSD, USDCHF, NZDUSD, NZDJPY, NZDCHF, AUDCAD, AUDCHF, AUDNZD, CADCHF, CADJPY, CHFJPY, EURAUD, EURCAD, EURCHF, EURGBP, EURJPY, EURNZD, GBPAUD, GBPCAD, GBPCHF, GBPNZD y NZDCAD.
- **2 metales** (XAUUSD y XAGUSD): ancla H4 NY común de referencia, **horas y pausas de metal independientes a validar**; no asumir que todas las 48 M5 existen.
- **3 índices**: NAS100USD (OANDA), US500 (IC), US30 (IC); ancla NY 02/06/10/14/18/22 y horarios reales del instrumento/proveedor a validar.
- **BTCUSD (IC, slot 8)**: queda FUERA de la cohorte; conserva `f_btc_crt_h4_ny()`, su verificación de 48 M5, controles de sesión y reglas previas.

No mezclar proveedor `IC` y `OANDA`. Los nombres de clases en la tabla se basan en las posiciones predeterminadas del catálogo; si el usuario cambia el input de un slot, revisar su naturaleza.

## Cambios en código, no declaraciones de trading real
Archivo Pine: `crt-radar-pro/CRT_RADAR_PRO_V34_11F_COHORTE_33_SIN_BTC_QA.pine`, SHA blob `4e0d5541413fa0054c8fad827a8023929d105177`.

1. Tres ramas H4 explícitas: `isBTC ? f_btc_crt_h4_ny(barT) : isIndex ? f_index_crt_h4_ny(barT) : f_forex_metal_crt_h4_ny(barT)`. **No se cambia el contenido de `f_btc_crt_h4_ny` ni la lógica de CRT/MSS15**; solo se separa la función de anclaje para Forex/metales.
2. Ajuste nuevo, desactivado por defecto, **`03 / Dashboard → QA: auditar los 33 instrumentos sin BTC`**. Reutiliza tabla 6×15, cuatro filas por página, 9 páginas (33 instrumentos), sin afectar panel compacto mientras esté OFF.
3. Cada fila de los 33 reporta símbolo original del slot, tipo `FX/MET/IND`, H4 cerradas en contexto, H4 incompletas, C1 válidas, diagnóstico `SIN FEED` / `SIN H4` / `H4 BLOQ` / `SIN C1` / `2C HIST` / `3C HIST` / `C1 LISTA`.
4. Pie agregado **solo 33**: respondidos/33, mercados sin C1, con C1, H4 totalmente bloqueadas, con CRT retrospectivos, suma H4, parciales e internas; grupo `FX:28 MET:2 IND:3`; fila **`BTC APARTE`** con estado BTC sin mezclarlo en ninguno de esos totales.
5. La auditoría del slot 1..34 y los modelos de las siete categorías siguen disponibles como antes, pero la tabla de los 33 pasa a ocupar la pantalla cuando el ajuste está ON.

**No se han añadido requests, plots ni operaciones.** Siguen **34 consultas M5**, 60 `plot()`, 7 categorías de QA con estados separados, MSS M15 y alertas deshabilitadas por defecto. La condición de 48 M5 contiguas no se ha rebajado.

## Auditoría offline reproducible — misma cohorte
`qore-crt-alerts/src/crt-33-nonbtc-h4-cohort-qa.mjs` y comando:

```bash
cd qore-crt-alerts
npm test
npm run audit:33-h4 -- /ruta/evidencia_33_con_34_catalogo.json
```

Entrada: `sourceCatalog` con exactamente 34 slots de la preinscripción, `snapshots` con valores de H4/C1 de los 33 no BTC, `asOf` y SHA exacto `pineSourceBlobSha`. Cada snapshot requiere `slot, tvSymbol, responded, pineBlobSha, evidenceLocator, asOf, lookbackM5` y contadores `h4Closed, h4Incomplete, h4Partial, h4Internal, h4Dst, c1Hours, c1Ok, c1BadClock, c1BadData, c1BadRange, audit2C, audit3C, auditInside, auditMulti4, auditMultiN`. El esquema **bloquea** duplicados, proveedores/símbolos que no correspondan al catálogo y recuentos imposibles (`h4Incomplete ≠ h4Partial+h4Internal+h4Dst`; `c1Hours ≠ c1Ok+c1BadClock+c1BadData+c1BadRange`). BTC excluido sin excepciones.

Un resultado `33_NONBTC_SNAPSHOTS_VALID_BUT_UNCERTIFIED` solo significa que **33 respuestas presentaron contadores consistentes**. No certifica OHLC real ni modelos CRT ni Pine editor. No se dispone todavía de 33 capturas verificadas del nuevo Pine.

## Pasos de prueba en TradingView Android
1. Crear indicador QA **V34.11f** nuevo. Ocultar los anteriores; conservar V34.11e como respaldo.
2. En `00 / Memoria`, seleccionar **34 instrumentos (experimental)**. En `03 / Dashboard`, activar **QA: auditar los 33 instrumentos sin BTC**. Verificar `FX:28 MET:2 IND:3`, `R:xx/33`, `BTC APARTE`.
3. Cambiar **Página** desde 1 hasta 9. Ningún BTCUSD debe aparecer entre las 33 filas. Los valores no serán iguales entre instrumentos; deben venir de su `request.security(symbol, "5", ...)` respectiva.
4. Revisar los 33 bloqueos `H4 BLOQ`; si hay uno, usar `QA: ver tiempos CRT/MSS de 1 instrumento` con la auditoría de 33 OFF y revisar `H4 BAD/PARC/INT`, `C1 HORA/DATO/CLK` en ese mismo feed.
5. Compilar Pine v6 real con este SHA, registrar 33/33 por proveedor, comparar el histórico M5 de cada feed con Trader Lab en la misma ventana de 1500 M5, verificar siete modelos y MSS M15 causal por evento, holdout/no-repaint. No atribuir un 0 detectado automáticamente a una falta del motor sin fuentes equivalentes.

**Bloqueos todavía existentes:** recompilación Pine real, 33/33 datos H4 en vivo y ventana M5 cerrada, equivalencia con Trader Lab, 7 familias completamente validadas, holdout sellado, notificaciones Android E2E. Se mantiene DRAFT y alertas reales OFF.
