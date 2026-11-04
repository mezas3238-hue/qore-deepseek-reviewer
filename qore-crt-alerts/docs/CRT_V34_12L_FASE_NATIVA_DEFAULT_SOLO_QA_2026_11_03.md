# V34.12L — QA 34 mercados + Chart integrado: fase de proveedor por defecto

Fecha 2026-11-03, PR #74 DRAFT. Basado en `309040657c348a6b5bd7bb47e1655dd7c25cdaa2`. **NO LIVE / NO PUSH / NO MERGE.**

## Contraste de la auditoría recibida

**H-K1 — Aceptado de manera acotada.** La prueba manual de TradingView Android YA mostró 33/33 no-BTC con C1:6 y H4:13 al activar `qaPhase1NonBtc=true`, 34/34 feeds respondieron, 15 estructuras 2C QA y MSS M5/M15 QA. **No es un pendiente por repetir.** En la NUEVA versión integrada exclusiva de ensayo, el input pasa a `true` por defecto; la sonda original Radar A 600 M5 y Chart B permanecen inalterados con defaults estrictos. Al usar `true`, se reconstruyen buckets H4 :01/:02 de la fuente; **no son velas NY :00 exactas** y NO se convierten en entradas válidas. El gate `scanCrtValid = structuralCoreObserved and (not qaPhase1NonBtc or i == 7)` se mantiene; non-BTC se etiqueta `2C QA`, solo BTC tiene tratamiento separado.

**H-K2 — REFUTADO como defecto causal.** El bloque de reset `if (na(qaExtraM5SegmentStart) or not previousM5Continuous)` borra `lastHigh15/lastLow15`, sus timestamps, `highs15/lows15/times15`, y `qaMulti4MssCandidates`. Por tanto, el pivote M15 del viernes que cruza una laguna de fin de semana **no está disponible el lunes**, tampoco para 3C TRUE/Inside/Multi-N. Quitar `lastHigh15At >= qaExtraM5SegmentStart` no restaura ese pivote, solamente relaja un control defensivo. No se aplica ese cambio.

**H-K3 — INFO, mantener.** `q4.sweepAt > q4.c2aStart` preserva límite temporal causal. No obstaculiza compilación; no tocar.

**H-K4 — Corregido.** Comentario de histórico actualizado de 1500 a 600 M5.

**Typo de auditoría — descartar.** La cita del auditor dice `showIntegratedShop`, pero el archivo real contiene `showIntegratedChart` en el CRL, igual que CRH. La cita no es evidencia de bug.

## Evidencia y bloqueos restantes

- El archivo integrado tiene **un solo motor exacto**, 34 slots configurables y una única sentencia dinámica `request.security` dentro de `for i=0..33`; no añade feed #35, y solo dibuja del broker idéntico del gráfico.
- La validación 34/34 previa corresponde a la **sonda Radar A 600 M5 no integrada**. **NO se ha compilado la variante integrada V34.12L en TradingView**. Node QA comprueba el código, no límites de memoria ni exactitud de OHLC.
- Multi4 MSS M15 propio está implementado, pero sin replay autenticado. Inside Continuation es rechazo diagnóstico, Retest M15 es una validación derivada, no familias originales independientes; no declarar las 7 certificadas.
- Para validar: copia la nueva rama en un borrador, añade al gráfico **IC:US30 M5**. Debe mostrar `R:34/34`; el puerto del gráfico debe corresponder al slot 7, líneas CRH/CRL y MSS solo si estructura vigente y gate causal, o quedar vacías justificadamente. Comprueba broker distinto y no atribución. Registrar compilador Pine real, memoria y paridad con la sonda anterior.
- Solo al verificar, sustituir contenido del ÚNICO script guardado en plan Basic. **No borrar Radar A hasta certificar**.
