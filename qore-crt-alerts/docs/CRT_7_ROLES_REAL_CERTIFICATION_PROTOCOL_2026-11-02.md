# CRT RADAR PRO — certificación verificable de siete categorías

**2 noviembre 2026 — PR #74 DRAFT — NO LIVE, NO PUSH, NO MERGE**

## Siete roles: NO equivalen a siete estrategias de entrada aprobadas

| Rol | Qué debe demostrar | Control negativo obligatorio |
|---|---|---|
| CRT_3C_REVERSAL | C1/C2/C3 H4, barrida estricta, retorno, ratificación; MSS15 si existe | C3_INVALIDATED |
| CRT_2C_CANDIDATE | C2 pendiente sin inventar ratificación | C2_NOT_RATIFIED |
| CRT_2C_EXPANSION | Detectar cierre fuera de C1 como rechazo, jamás entrada | FAKE_RETURN |
| CRT_INSIDE_RETURN | Inside H4 con barrida y retorno completos | DOUBLE_SWEEP |
| CRT_INSIDE_CONTINUATION | Detectar continuación pero rechazar entrada | FORBIDDEN_ENTRY |
| CRT_MULTICANDLE | Multi4 **y** Multi-N separados, H4 cerradas propias | INVALID_H4_CHAIN |
| CRT_M15_RETEST | Pivote M15 L2/R2 previo a barrida; ruptura y retest después | BEFORE_MSS |

## Código aplicado directamente en GitHub

- `qore-crt-alerts/src/contracts.mjs`: M5 aceptada en fases exactas 0..4 minutos, sin redondear timestamps ni alterar OHLC.
- `qore-crt-alerts/src/crt-seven-category-parity-audit.mjs`: deriva fase de cada proveedor de M5 cerradas, exige estabilidad de fase, hash OHLC idéntico y tiempos de MSS/retest M15 según fase de esa fuente.
- `qore-crt-alerts/src/crt-seven-category-event-parity.mjs`: compara C1, barrida, ratificación, pivote, ruptura y retest sin tolerancia horaria y publica proveedor/huella/fase por slot auditado.
- `qore-crt-alerts/test/crt-seven-category-native-phase-34-parity.test.mjs`: prueba AUDJPY +1, XAUUSD +2, BTCUSD 0 simultáneos; rechaza MSS con fase prestada, deriva M5 y falsificación temporal.
- `qore-crt-alerts/src/crt-seven-role-certification-readiness.mjs`: matriz read-only de 7 positivos + 7 negativos (y prueba extra Multi-N), enlazados al hash, fuente y fase de las 34 trazas correspondientes.
- `qore-crt-alerts/test/crt-seven-role-certification-readiness.test.mjs`: suites contra falsos positivos/negativos, multivela, retest M15, falta de BTC, suplantación de fuente, duplicados y autorización indebida.
- `qore-crt-alerts/scripts/certify-seven-roles.mjs`: comando QA que une la comparación de los 34 feeds con la matriz de siete roles.

Desde el directorio `qore-crt-alerts`: `npm test` y `npm run certify:seven:qa -- /ruta/evidencia.json`.

El JSON de evidencia para la segunda orden contiene: `catalog`, `feeds`, `asOf`, `pineSourceBlobSha`, `pineCaptures`, `labSnapshots`, `controlCases`. Debe obtenerse de **dos ejecuciones independientes** (editor real TradingView y Trader Lab), con las mismas velas M5 y el mismo proveedor. Los fixtures sintéticos sirven exclusivamente para verificar el software de auditoría.

## Condiciones que aún impiden certificar los siete roles

1. Compilación y ejecución de la versión Pine V34.11k exacta en el editor real TradingView.
2. Capturas/series originales M5 de los 34 instrumentos (33 no BTC + BTC independiente), con el mismo OHLC, proveedor, fase 0..4 y SHA256 que Trader Lab.
3. Casos reales positivos y negativos por rol; Multi4 y Multi-N separados. Los rechazos o estados provisionales NUNCA son entradas válidas.
4. Barrida única y retorno de C2, C1/C2/C3 con 48 M5 continuas cada H4, fase NY y sesiones de metales/índices verificadas.
5. Confirmación MSS15 en M15 propia, con pivote L2/R2 anterior a la barrida y primer cierre de ruptura posterior. No reutilizar MSS M5.
6. Holdout fuera de muestra sellado y ensayo no-repaint en TradingView; resolver la equivalencia entre H4 del proveedor 01:01/01:02 y H4 normativa 01:00.
7. Solo tras lo anterior, autorizar controles de alertas y comprobar Android/FCM extremo a extremo.

**Estado de estos cambios:** pruebas GitHub offline; no constituye compilación privada Pine, paridad OHLC real ni certificado. La matriz mantiene `certified:false`, `actionable:false` y `sendPush:false` incluso con 15 pruebas sintéticas exitosas.

## CERT-7B — anclaje evento a evento y prueba visual real (2026-11-02)

Captura real de TradingView Android: el indicador identifica **`CRT MSS QA 4C 11K`**, lo que confirma la carga de V34.11k en el gráfico M15 de NZDCAD. El panel de 33 fuentes conserva `R:33/33`, `0C1:0`, `C1+:33`, `BLOQ:0`, `HIST:33`; última H4 NZDCAD 48 velas M5 e inicio/fin `0/0`. XAUUSD `MET+2` presenta todavía `NO48:7`. La captura **no contiene evidencia temporal C1/C2/MSS15 de cada familia**, ni el cotejo independiente OHLC del proveedor.

Se ha reforzado **`src/crt-seven-category-event-parity.mjs`**: cada slot que empata incluye únicamente los eventos CANÓNICOS con coincidencia entre Pine y Trader Lab, con categoría, variante Multi4/N, ciclo C1, dirección, timestamp, fuente, fase, hash y ventana M5. No basta con una máscara global que diga que la categoría aparece en alguna parte.

**`src/crt-seven-role-certification-readiness.mjs`** exige que cada caso POSITIVE sea **el mismo evento exacto** en el mismo slot, ciclo, dirección y subtipo. Para RETEST compara también pivotAt, sweepAt, breakAt y retestAt; no basta un MSS M5 o un retest de otro ciclo. Los NEGATIVE requieren ausencia del evento correspondiente en ambas trazas emparejadas y controles dentro de los límites de la misma ventana OHLC M5 cerrada. Rechaza evidencias de otros instrumentos, fases o ventanas.

Pruebas nuevas/extendidas en `test/crt-seven-role-certification-readiness.test.mjs`: máscaras globales fraudulentas, evento ausente en el instrumento correcto, C1/timestamp/dirección alterados, Multi-N sin evento idéntico, MSS15 cruzado, negativo contradicho por un evento real y controles fuera de ventana. **607/607 PASS, 0 fallos**, GitHub Actions Foundation [41459005170](https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41459005170); workflows CRT offline y Harness también SUCCESS en el mismo commit `e0beddbe4d8b31da07cb4ab84c024477cdb125de`.

El resultado de matriz con 15 casos **sintéticos** seguirá siendo exclusivamente `SEVEN_OFFLINE_ROLE_CONTROLS_COMPLETE_NEEDS_EXTERNAL_CERTIFICATION`; la salida nunca concede certificación de TradingView real, ni `actionable` ni `sendPush`.

**Siguiente evidencia crítica:** ejecutar en TradingView V34.11k `03 / Dashboard → Ver los 34 instrumentos (expandir)` y `Ampliado: inspeccionar 7 categorias CRT (QA)` con `QA: auditar los 33 instrumentos sin BTC` **OFF**, y después activar `QA: ver tiempos CRT/MSS de 1 instrumento` para capturar tiempos, de un slot por vez; la tabla normal y la tabla 33 no se pueden mostrar simultáneamente. Contrastar cada positivo y negativo con Trader Lab M5 del mismo proveedor y fase, y luego holdout/no-repaint. Nunca clasificar `3C HIST` como MSS15 confirmado sin sus tiempos de pivote y ruptura.
