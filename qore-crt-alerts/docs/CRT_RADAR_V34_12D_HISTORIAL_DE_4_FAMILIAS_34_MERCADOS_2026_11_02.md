# QORE CRT RADAR A V34.12D — auditoría histórica independiente de cuatro familias

**2 de noviembre de 2026 | PR #74 DRAFT | laboratorio, NO LIVE / NO PUSH / NO MERGE.**

## Observación inicial

Las cuatro capturas del usuario de GBP/AUD M15 del Radar anterior muestran 34/34 fuentes, 16 candidatos estructurales 2C QA, 10 MSS M5 QA y 7 MSS M15 QA. La tabla principal prioriza correctamente los mercados con ambos MSS (siete). En las capturas **no aparecen 3C verdadero, Inside ni Multi vigentes**. Eso no demuestra que falte la lógica: el motor tiene historiales de la mayoría de estas familias, pero el monitor habitual solo muestra vigentes.

**Importante:** los siete bits del catálogo no son siete modelos operativos de entrada: incluyen 2C provisional, rechazo/expansión, Inside continuación y retest M15. Las cuatro familias estructurales principales son 2C, 3C independiente (C2 setup / C3 barrida de C1), Inside Return y Multi (Multi4/Multi-N).

## Cambio entregado

Archivo candidato sin sobrescribir V34.12C:
`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_D_AUDITORIA_FAMILIAS_QA_NO_LIVE.pine`.

Nueva opción **`03 / Dashboard → QA: historial 2C/3C/Inside/Multi por mercado`**, OFF por defecto. Mantiene el orden previo CRT/MSS en pantalla habitual.

Con ON, la tabla usa seis columnas:
`MERCADO | 2C H | 3C H | INS H | M4 H | MN H`.
- Cada celda muestra `DD/MM` (UTC) del **último evento histórico** registrado por ese feed en la ventana M5 cargada, o `—` si no hay.
- 3C se obtiene EXCLUSIVAMENTE de `qaTrue3CSignedAt` generado por C3 H4 cerrada que barrió C1. **No usa** el contador legado `qaLastConfirmed3CAt`, que representa un 2C distribuyendo en C3.
- Inside: `qaLastInsideReturnAt` (no Inside Continuation rechazada).
- Multi4 y Multi-N mantienen columnas separadas; no se mezclan fechas ni C1.
- 2C usa `qaLastRatified2CAt`, no 2C candidata ni expansión.
- Pie de tabla: número de mercados con algún evento en cada grupo; **son mercados con histórico, no número de señales**. Cuenta independiente de `R:34/34`.
- `QA: numero de instrumento (1-34)` permite seleccionar un mercado y obtener sus cinco `UTCmin` numéricos exactos, para compararlos con Trader Lab. **UTCmin es timestamp / 60000**, no pivote MSS.
- Modo de emergencia `BTCUSD solo`: la tabla debe limitarse a BTCUSD y señalar una única fuente; no inventar los otros 33.

**Motor inalterado:** misma función `f_engine()` byte a byte; mismo escáner, 34 `input.symbol`, una `request.security(symbol,"5",f_engine_snapshot())` dinámica por símbolo, estructuras Signal, reglas M5/M15, controles contra repaint y envío bloqueado. El indicador B de líneas no se modifica.

## Guía Android

1. En TradingView abre el archivo de **Radar A V34.12D** desde la misma rama GitHub; reemplaza A con ese script y **verifica compilación real Pine v6**. No consumas un tercer indicador Basic.
2. Abre `03 / Dashboard`: deja `Panel compacto (movil)` ON y `Monitor principal: CRT + MSS M5/M15 (QA)` ON.
3. Para revisar historial, activa `QA: historial 2C/3C/Inside/Multi por mercado`. Navega usando `Pagina si hay mas senales` de 1 a 4.
4. Para un caso concreto, elige `QA: numero de instrumento (1-34)`; copia el tiempo `UTCmin` que aparece debajo.
5. Para regresar al monitor que ordena por MSS, **desactiva la vista histórica**; sus contadores M5q y M15q siguen intactos.
6. Que un mercado tenga fecha histórica no significa CRT vigente. Tampoco justifica pintar de verde, activar FCM ni operar.

## Pruebas y límites

Regression `qore-crt-alerts/test/pine-v34-12d-four-family-history-evidence.test.mjs` verifica separación de 3C verdadero frente al antiguo 2C/C3, campos históricos por feed, no promoción MSS/QA, 34 slots y equivalencia de motor.

CI Foundation #41533774751: **682/682 PASS**, no errores; Pine offline antiguo y Harness también SUCCESS. **No garantiza que V34.12D compile en TradingView ni que exista el histórico en las fuentes reales.**

El preflight `qore-crt-alerts/trader-lab/34-instrument-source-preflight-2026-11-01.json` registra `data_license_verified=false`, `holdout_period_frozen=false`, `real_price_replay_executed=false`, `pine_compiler_executed=false`, `broker_to_tradingview_price_parity_verified=false` por fuente. Hay metadatos de archivos históricos, pero no son prueba de paridad de los 34 brokers ni un holdout de certificación.

## Próximos pasos obligatorios

- Con la nueva tabla, identificar por lo menos un evento 3C, Inside Return, Multi4 y Multi-N **real** por mercado, con UTCmin, proveedor M5 y OHLC originales; si no hay, ampliar la ventana de datos justificadamente, sin inventar señales.
- Validar estrictamente C1/C2/C3 y barrida de la familia en Trader Lab con **mismo proveedor y ciclo**, y negativos de doble barrida/gap/hora DST.
- Completar MSS5 y MSS15 propios del verdadero 3C, Inside y Multi4/N; **una línea de swing no es una ruptura por cierre**. FCM Android permanece desactivado.
- Compilar en Pine Editor V34.12D, verificar rendimiento y capacidad Basic con dos indicadores y corregir cualquier CE10295 u otros errores visibles.
