# Contraste de DeepSeek V34.12I: inicialización del primer segmento M5 y ciclo Multi-N

**Fecha:** 2026-11-02 · QA / NO LIVE / NO PUSH / NO MERGE · PR #74 DRAFT.

Se recibieron dos supuestos «bugs demostrables» (A.1, A.2) con propuestas de cambio J.1/J.2. Se contrastó directamente el código de los dos archivos V34.12I con el contrato de Pine v6.

## A.1 — Primer segmento M5

**Causa alegada por DeepSeek:** `previousM5Continuous` sería `na` en la primera barra e impediría inicializar `qaExtraM5SegmentStart` hasta detectar un hueco.

**Contraste:** En Pine **v6** los booleanos **nunca pueden ser `na`**. La expresión:
`not na(barT) and not na(previousBarEnd) and barT == previousBarEnd`
da **false** si falta alguno de los dos timestamps. Además, `barT=time[1]` no está disponible en la primera barra, pero sí en la siguiente cuando ya se ha cerrado una M5; ahí `previousBarEnd=time_close[2]` sigue faltando y `previousM5Continuous=false`. La rama original `if not previousM5Continuous and not na(barT)` ya arranca el segmento en la primera M5 utilizable. **A.1 no queda demostrado como fallo real**.

**Cambio defensivo de claridad aplicado SOLO en V34.12I, tanto A como B:**
`if (na(qaExtraM5SegmentStart) or not previousM5Continuous) and not na(barT)`
Esta condición permite inicialización explícita y reinicio después de gaps sin modificar la secuencia de datos. No reescribe el motor H4 ni los modelos.

Fuente oficial: https://www.tradingview.com/pine-script-docs/migration-guides/to-pine-version-6/ (sección «Boolean values cannot be na»).

## A.2 — Supuesta pérdida de la última M5 terminal al borrar Multi-N

**Causa alegada por DeepSeek:** `array.clear(qaMultiNMssCandidates)` al iniciar H4 nueva ocurriría antes de computar el MSS de la M5 terminal anterior, debido al orden de los bloques en el código.

**Contraste concreto:** El motor usa `barT=time[1]` y `barEnd=time_close[1]`: evalúa la **vela M5 previamente cerrada**, no la vela del gráfico que acaba de abrirse. El `nextH4` solo se activa cuando `bucketH4(barT)` cambia de H4. Ejemplo de una H4 [00:00, 04:00), con M5 contiguas:

| Apertura de la M5 actual | barT (la M5 cerrada evaluada) | bucketH4(barT) | nextH4 | Acción |
|---|---|---|---|---|
| 03:55 | 03:50 | 00:00 | false | M5 03:50→03:55 |
| **04:00** | **03:55** | **00:00** | **false** | Procesa última M5 03:55→04:00 y cualquier MSS M5 de Multi-N |
| **04:05** | **04:00** | **04:00** | **true** | Primero extrae la prueba del candidato H4 ya cerrada; después borra el array obsoleto |

En consecuencia, la última M5 del ciclo terminal **ya se procesó antes del clear**. Reordenar todo `QA M5 causal` por encima de `if nextH4` sería un refactor de riesgo, no la reparación de un error demostrado.

**No aplicar J.2** sin un replay real que muestre lo contrario. La extracción `qaMultiNMss5At := qaOwn.mss5At` ocurre antes de `array.clear(qaMultiNMssCandidates)`. La M5 de 04:00→04:05 pertenece a la **H4 nueva** y NO debe modificar el candidato terminal anterior.

## Regresión creada

`qore-crt-alerts/test/pine-v34-12i-first-segment-h4-terminal-order-regression.test.mjs`:
- Asserts de ambos códigos con `time[1]` y `time_close[1]`.
- Simulación determinista del cierre de 48 M5 consecutivas y el `nextH4` de la vela posterior.
- Prueba de primer segmento usable, continuidad de 5m y reinicio por gap.
- Verifica que A y B mantengan `f_engine()` y `type Signal` idénticos.
- No autoriza señales operativas ni certifica compilación Pine.

El codebase previo I conserva la congelación de pivote M5, cruce posterior del mismo C1 de Inside/Multi-N, rechazo doble barrida y guardas de gaps. V34.12H y Chart V34.12B originales no modificados.

## Bloqueantes sin resolver

- Compilación **Pine Editor real** de ambas V34.12I.
- MSS M5/M15 propio de 3C verdadero y MSS M5 de Multi4.
- Reproducibilidad de histórico en 34 feeds con mismo broker y datos M5.
- Trader Lab: BTCUSD y licencia del proveedor, evidencia de contenido OHLC, paridad TradingView y holdout sellado.
- Android FCM extremo a extremo NO PUSH.

No reinterpretar las siete categorías como siete familias estructurales certificadas.
