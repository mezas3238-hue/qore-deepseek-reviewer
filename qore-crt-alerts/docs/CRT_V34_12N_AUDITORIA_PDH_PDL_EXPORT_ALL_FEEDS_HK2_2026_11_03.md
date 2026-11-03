# Auditoría de la V34.12N — PDH/PDL para todos los mercados y H-K2

Fecha 2026-11-03. PR #74 DRAFT. NO LIVE / NO PUSH / NO MERGE.

## Hallazgo importante: la hipótesis "PDH solo BTC" es falsa

El tipo `Signal` contiene **132 campos** y el constructor `Signal.new(...)` entrega **132 argumentos**. Las posiciones 44/45/46 se corresponden con:
- `nyPDH` = `hasLiquidityRef ? prev_PDH : na`
- `nyPDL` = `hasLiquidityRef ? prev_PDL : na`
- `nyPDHReferenceAt` = `hasLiquidityRef ? prev_timestamp : na`

La rama `else` de `if isBTC` **sí calcula** `prev_PDH/prev_PDL` para FX y los índices bajo sus respectivas sesiones. Esos campos, aunque llevan prefijo `ny`, no son de uso exclusivo BTC. Añadir más campos al `Signal` sería redundante; no se ejecuta ese cambio.

**Limitación real:** `hasLiquidityRef` exige `prev_valid` y `prev_timestamp` / extremos no nulos. Para FX +1/+2 M5, la rama de sesión actual solo ratifica una sesión previa en `hour(barEnd,TZ)==17 && minute(barEnd,TZ)==0` y continuidad/densidad suficientes. Un proveedor cuyo M5 cierra a 17:01/17:02 puede terminar con `prev_valid=false`, dejando ambos niveles **N/D**. Eso no se arregla cambiando el constructor. Antes de permitir una alineación de sesión nativa alternativa se debe demostrar equivalencia con OHLC/horas por proveedor y no falsificar el cierre NY oficial. La V34.12N conserva `N/D` cuando no hay evidencia completa.

## H-K2: pivote M15 previo al gap no puede sobrevivir

Ante `not previousM5Continuous`, el motor vacía `highs15/lows15/times15`, pone `lastHigh15/lastLow15` y sus timestamps a `na`, además de `array.clear(qaMulti4MssCandidates)`. Por consiguiente ni Multi4 ni 3C/Inside/Multi-N pueden reutilizar sin más el pivote M15 del viernes tras el reset del lunes. La condición `lastHigh15At >= qaExtraM5SegmentStart` en Multi4 es un guard adicional redundante tras reset, no la causa del caso hipotético. Mantener por seguridad hasta replay de datos reales.

## H-K3, 7 categorías y pruebas

H-K3 (`q4.sweepAt > q4.c2aStart`) es defensivo y no se modifica. Detectar C1 en los 33 no-BTC no equivale a certificar siete categorías. Se conservan sin cambios motor/MSS/alertas/gráficos. Nuevos tests verifican mapeo posicional del constructor y reinicio por gap. Hay que auditar datos fuente de PDH/PDL en varios brokers antes de afirmar compatibilidad operativa.

**Test:** `qore-crt-alerts/test/pine-v34-12k-integrated-34-chart-visual-qa.test.mjs`. Sigue pendiente compilación real Pine Editor v34.12N y visualización de niveles PDH/PDL/FVG.
