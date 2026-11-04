# V34.12M — USDCAD Multi4 MSS M5/M15 QA causal: no confundir anotacion manual con señal

2026-11-03. PR #74 DRAFT, NO LIVE / NO PUSH / NO MERGE.

## Reporte real del usuario

Captura de **USDCAD 15m**, muestra `MULTI4 QA ALC`, dashboard `MSS M5=N/V; MSS M15=N/V`, niveles CRH/CRL Multi4 naranjas, **y un texto "MSS" dibujado MANUALMENTE por el usuario** sobre un swing. El indicador NO dibujó ese MSS ni reportó el evento. Esto debe investigarse, no presentarse como señal automática ni atribuir a todos los pares.

El dibujo manual indica un swing candidato; **sin OHLC M5/M15 auténtico del mismo broker** no confirma que exista pivote L2/R2 consolidado antes de la barrida, un cierre M15 que cruce el pivot con cierre previo al lado opuesto, ventana Multi4, ausencia de barrida contraria y fase compatible.

## Cambio diagnóstico quirúrgico (motor congelado)

Versión `QORE CRT 34+Chart 12M` conserva exactamente el `f_engine()` v12L, los 34 slots, 600 M5, 1 sentencia `request.security`, gating de C1 phase y toda la visualización Chart. **No habilita ningún MSS falso**.

En ajustes > `03 / Dashboard y auditoria QA`: activar `QA: ver tiempos CRT/MSS de 1 instrumento` y mantener `QA: seguir grafico solo si proveedor coincide` activado. Abrir USDCAD M15 del broker IC:USDCAD (slot 10); si proveedor diferente, seleccionar exactamente el del feed s10 o usar selector manual slot 10 solo para QA (sin dibujar por broker distinto). Aparecen filas existentes de tiempos C1/SWEEP/RAT/MSS5/MSS15 y EXTRA/C1 EX/SWEEP EX/RAT EX/M15 EX, junto a **nueva fila M4 SWEEP | PIV15 PRE | PIV15 PR | MSS15 EX | MSS5 EX | M4 CAUSA**.

Valores de M4 CAUSA (solo candidatos seleccionados y visibles): `NO MULTI4`, `SIN SWEEP`, `SIN PIV15`, `SIN MSS15`, `GATE M15`, `M15 QA SI`. `SIN MSS15` significa 'no MSS15 exportado como válido' (puede ser falta de cruce, ventana, fase o cierre), **no demuestra que no hubo ruptura visible**. Para el MSS M5 solo tenemos flag binario (QA SI / NO VALID), pues Signal UDT actual exporta pivote5 únicamente cuando existe MSS5 causal; distinguir falta de pivote de falta de cruce M5 requerirá telemetría adicional en el motor y un test de paridad.

Una estructura válida de Multi4 con pivote y barrida propios debe pasar todas las condiciones; no relajar causalidad para acomodar una anotación visual. Diagnóstico primero; después contrastar con datos OHLC crudos/replay del mismo feed y corregir la condición responsable si efectivamente rechazó un cruce elegible.

## Evidencia

Node test protege motor byte-idéntico A/B y comprueba que el diagnóstico solo consulta el mismo Signal de una de las 34 fuentes. No equivale a compilación Pine o paridad real Trader Lab. La captura de USDCAD existe en el chat del usuario, sin subir a repo.
