# CRT RADAR PRO V34.10k — Multi-Candle de cuatro H4 + Retest M15

**Fecha: 2026-11-01. PR #55 DRAFT. No merge, no LIVE.**

## Continuidad de versiones

- V34.9: oficial histórico de desarrollo, preservado.
- V34.10i: candidato del que el propietario aportó capturas positivas de CRT, PDH/PDL del proveedor y MSS M5/M15 independiente en COINBASE:BTCUSD.
- V34.10j: siete familias catalogadas; 3C principal, 2C/Inside existentes; Multi-Candle y Retest estaban únicamente anotados como diagnósticos, sin detectores propios.
- **V34.10k: nueva candidata separada, SIN reemplazar V34.10i ni V34.10j.** Conserva el código de 3C/MSS/FVG/PDH y agrega dos detectores acotados, exclusivamente de auditoría.

Código:
`crt-radar-pro/CRT_RADAR_PRO_V34_10K_QA_MULTICANDLE_RETEST_M15_NO_INTEGRADO.pine`

Git blob SHA: `92af8c5a85141ada91dfa139548b62b0d9fa9dd9`.

TXT Android completo:
`crt-radar-pro/CRT_RADAR_PRO_V34_10K_MULTI4_RETEST_M15_ANDROID_COPIAR.txt`.

## Detector #6: MULTI4 (nuevo, QA no entrada)

**Regla experimental propuesta en esta versión**, no atribuirla a una aprobación previa de DeepSeek:

1. Se conservan exactamente **cuatro H4 completas y consecutivas**, construidas por la misma secuencia de velas M5 ya cerradas. Máximo cuatro objetos `MultiH4` en memoria.
2. Primera H4 = C1, apertura en uno de los tres horarios NY oficiales de su familia.
3. Segunda H4 = manipulación A: barrida estricta de UN extremo de C1; no cruza el extremo contrario y cierra dentro de C1.
4. Tercera H4 = manipulación B: mantiene o extiende el mismo extremo, no rompe el opuesto y también cierra dentro de C1.
5. Cuarta H4 = distribución: cierre más alto que el cierre de la tercera H4 para estructura alcista y retorno por encima de CRL; simétrico bajista con cierre más bajo y debajo de CRH.
6. Las dos direcciones no pueden confirmarse a la vez. Huecos y H4 incompletas vacían la memoria y la candidata pasa a N/D.
7. La fila de QA muestra `MULTI4 BULL QA`, `MULTI4 BEAR QA` o `MULTI4 ESP` y caduca al transcurrir una H4; **nunca activa las entradas del CRT principal ni entrega alertas**.

**IMPORTANTE:** la regla soberana de señales todavía exige C1/C2/C3 H4 consecutivas. MULTI4 es un patrón adicional bajo prueba, NO validación de una estrategia de entrada autónoma.

## Detector #7: RETEST M15 (nuevo, QA no entrada)

1. Parte exclusivamente de una **confirmación MSS M15 propia y cerrada**, nunca del evento M5.
2. Usa el pivote M15 congelado antes de barrida C2 y el identificador C1 del mismo CRT.
3. Exige un **M15 posterior** al cierre del MSS (`closed15At > qaMssAt`), y dentro de las cuatro horas siguientes, con tres M5 cerradas consecutivas en el agregador.
4. Alcista: la vela M15 toca o perfora el pivote (`low <= pivot`) y **cierra por encima** (`close > pivot`). Bajista: `high >= pivot`, `close < pivot`.
5. El escáner no permite reutilizar eventos de otro C1 ni reciclar un retest anterior al nuevo MSS. El resultado es `RETEST M15 QA` o `RETEST ESP` (sin afirmación de señal).
6. Únicamente se presenta como parte del CRT vigente, nunca por un MSS M15 histórico no asociado.

## Interfaz

`OTROS CRT QA` fila 6 del dashboard muestra:
- Columna 1/2: último Inside Return/Continuation previo (módulo existente).
- Columna 3: `MULTI4 BULL QA`, `MULTI4 BEAR QA` o `MULTI4 ESP`.
- Columna 4: `RETEST M15 QA` o `RETEST ESP`.
- Columna 5: `SOLO QA` — ninguna de estas etiquetas significa entrada confirmada.

Data Window:
- `QA CRT MULTI4 cierre cuarta H4 UTC min`;
- `QA CRT RETEST M15 cierre UTC min`.

Sin solicitudes adicionales `request.security`, sin nuevas líneas en el gráfico, y con modo `BTCUSD solo` por defecto.

## Backend y pruebas

- `qore-crt-alerts/src/crt-auxiliary-models.mjs`: réplica independiente con guardas de proveedor, continuidad, C1, barrida unilateral, retorno, M15 posterior, ventana de cuatro horas y dirección.
- `qore-crt-alerts/src/replay-cycle.mjs`: misma fuente M5, agregación H4/M15, añade `auxiliaryModels` y clasifica los diagnósticos sin permitir señales LIVE.
- Pruebas `qore-crt-alerts/test/crt-auxiliary-models.test.mjs` y `pine-btcusd-v34-10k-multi4-retest.test.mjs`.
- Suite foundation ejecutada satisfactoriamente en commit `e1996883307950b3d0e86fddf91e551f656865ef`: **310/310 PASS**.
- Referencia: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41343216948

## Bloqueos de FINAL (no declararlos completados)

1. **V34.10k NO se ha compilado ni probado realmente en TradingView Pine Editor.** La primera prueba debe ser en COINBASE:BTCUSD M5 y M15 desde Android. No sustituir la copia V34.10i validada hasta confirmar.
2. El modo 34 instrumentos simultáneos es experimental y puede exceder límites de memoria/tiempo; no asumir que 310 tests Node garantizan rendimiento del gráfico en el teléfono.
3. Las reglas propuestas MULTI4/RETEST aún necesitan cotejo real con los ejemplos y definiciones previamente aprobados por el propietario/DeepSeek, si se recuperan sus transcripciones originales. No elevar a señal operativa sin autorización explícita.
4. Paridad de OHLC Pine ↔ backend y cadenas de alertas Android FCM siguen sin certificación LIVE.

## Protocolo Android

1. Guardar como respaldo la V34.10i que funcionaba. Retirar los duplicados del gráfico.
2. Copiar el TXT V34.10k en una copia nueva del Editor Pine. Añadirla sobre COINBASE:BTCUSD M5 (después M15), mantener `BTCUSD solo`, alertas OFF.
3. Verificar `CRT H4`, líneas MSS M5/M15 independientes, PDH/PDL 1D y la fila `MODELO CRT`; deben seguir funcionando sin cambiar precio, horario ni estados.
4. Observar fila `OTROS CRT QA`: `MULTI4 ... QA` solo tras cuatro H4 y `RETEST M15 QA` solamente después de cierre M15 posterior al MSS, sin ✓ anticipado.
5. Guardar evidencia de Pine compilado y captura del gráfico completo; validar después otros proveedores y los 34 feeds en un laboratorio de memoria separado.
