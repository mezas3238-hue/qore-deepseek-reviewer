# CRT RADAR PRO V34.11R — auditoría del consejo de DeepSeek y visualización con C1 propia

**Fecha 2 noviembre 2026 | PR #74 DRAFT | QA solamente | NO LIVE / NO PUSH / NO MERGE.**

## Petición confirmada del propietario
El indicador consulta los 34 mercados y muestra dónde ocurrió CRT, el modelo, la dirección y si el MSS **M5 y M15 independientes** ya se confirmaron. Al abrir el par en TradingView debe dibujar CRH/CRL de la **C1 del mismo patrón**, sin niveles equivocados de otro ciclo.

## Por qué NO aplicar literalmente los parches propuestos
1. `own.modelKind` NO contiene siete modelos. El CRT 2C tiene `CRT_2C_RETURN`; Inside/Multi ocupan `extraFamilyKind` y `extraFamilyC1`, y el verdadero 3C C2-setup/C3-sweep usa `qaTrue3CSignedAt` desde V34.11Q. Solo agregar OR sobre `own.modelKind` y `own.extraFamilyValid` reusa el `own.crh/own.crl` del 2C, aunque sean distintos del rango real de Inside/Multi/C3.
2. En el dashboard no se deben promover `2C*` pendiente, `EXP RECH`, Inside Continuation rechazada ni retest suelto a CRT operativo por meter el mask de siete roles en `hasCRT`. Los siete bits son **roles**, NO siete familias geométricas certificadas. Cuatro grupos estructurales: 2C, 3C independiente, Inside, Multi (Multi4 y Multi-N variantes).
3. Es incorrecto marcar `classified2C := "CRT_3C"` al cierre de **C2** solo porque esa C2 no barrió C1: el verdadero 3C requiere esperar a **C3 H4 cerrada**, barrida estricta unilateral de C1, retorno dentro C1, continuidad 48 M5/H4 y ancla NY. V34.11Q implementa esa geometría en QA, conserva 2C separado.

## V34.11R (archivo nuevo, sin modificar Q)

`crt-radar-pro/CRT_RADAR_PRO_V34_11R_C1_PROPIO_4_MODELOS_DASHBOARD_QA_NO_LIVE.pine`

- `FamilyVisual` UDT nested en un único campo `Signal.familyVisual` (UDT 128 campos en total, no 128 elementos de tupla), calculada dentro de **la misma** llamada por feed `f_engine()`. No suma solicitudes `request.security()`.
- Obtiene C1 para: **3C independiente** desde `qaMultiNHistory` y la C3 firmada; **Inside** desde `InsideCandidate.c1High/c1Low`; **Multi-N** desde su historia de H4 buscando `extraC1`; **Multi4** desde `qaFourH4` buscando `extraC1`. Todo usando el mismo proveedor e identidad de evento. Si C1 no aparece, NO se inventan niveles.
- Para el CRT base **2C** conserva `own.crh/crl`. Para 2C no BTC bajo `qaPhase1NonBtc=true` muestra rango en **naranja QA**, no en verde certificado. Se exige C1 y ratificación del propio ciclo.
- `displayCRH/displayCRL/displayC1/displayFamily/displayEnd` seleccionan una sola familia por gráfico; rango, `line.new`, `line.set_xy`, `label.new` y `label.set_xy` usan los mismos precios. Las líneas expiran en la ventana del evento; no quedan ligadas a otro ciclo.
- Si el modelo mostrado es **Inside/MultiN**, una línea M15 de swing se dibuja solo cuando `extraFamilyC1 == familyVisual.c1Start` **y** `extraFamilyKind == familyVisual.kind` y su pivote es anterior al sweep. Naranja antes de ruptura, azul solo con cierre M15 de la fase nativa real y dentro de último M15 cerrado. `true3C` sigue sin MSS M5/M15 propio exportado: `N/V`; no dibujar swings 2C ajenos.
- Las etiquetas del dashboard de seis columnas incluyen `[2C]`, `[2C QA]`, `[3C QA]`, `[INS QA]`, `[M4 QA]` y `[MN QA]`, con dirección por el evento propio. Se admite cada estructura verdadera en la lista, sin desbloquear falsamente candidatos/rechazos. La vista móvil de V34.11Q continúa mostrando mercado, CRT, dirección, MSS5, MSS15 y etapa. Los roles QA no se vuelven LIVE.
- El cambio agrega solo visualización/diagnóstico y un objeto C1. Se conservan la detección previa 2C/Inside/Multi y true3C de Q, el calendario NY, las fases M5 nativas 0–4, BTC separado, 34 feeds, 60 plots, guardas de alerta OFF y FCM Android bloqueado.

## Verificaciones y límites
- Test estructural `qore-crt-alerts/test/pine-v34-11r-multifamily-c1-chart-qa.test.mjs` comprueba correspondencia entre fuente, C1, precios de línea/etiqueta, 2C/3C/Inside/Multi y MSS condicionado al mismo ciclo.
- **GitHub Node no compila Pine v6**. Falta compilar R en el Pine Editor REAL y verificar si el rendimiento y memoria admiten el campo de objeto adicional para 34 símbolos. El manual oficial de TradingView aclara que el límite 127 afecta **tuplas** de request, y que UDT se usa para superar ese límite; esto no equivale a garantía de memoria o de compilación de R.
- **Pine no permite click de celda de table como navegación**: para expandir/seleccionar mercados usar `03 / Dashboard` y abrir el ticker en TradingView manualmente.
- Debe comprobarse visualmente al menos un ejemplo **2C, 3C puro, Inside y Multi**, cada uno en su broker exacto, cotejando C1 H/L en gráfico H4 con las líneas del indicador y pruebas de no repaint. `R:34/34` solo acredita feeds respondidos; no 34 CRT.

## Trabajo crítico que falta antes de LIVE
1. Implementar sweepAt y pivotes M5/M15 propios para el nuevo 3C (actualmente estructura QA con MSS N/V).
2. Conservar identidad y MSS por ciclo para Inside, Multi4 y Multi-N; un token QA o una línea de pivote NO certifica ruptura.
3. Confrontar cada modelo y cada uno de los 34 feeds con la misma secuencia OHLC M5 en Trader Lab y TradingView, DST, continuidad, invalidación, holdout y negativos.
4. Solo después conectar el motor autónomo de precios aprobado y FCM autenticado a Android para avisos, sin depender de las alertas TradingView. No habilitar hasta E2E y consentimiento.
