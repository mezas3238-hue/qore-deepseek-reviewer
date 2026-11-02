# V34.11e — NZDCAD 32/32 H4 incompletas · auditoría NY H4

**Fecha:** 2026-11-02 · QA / DRAFT / NO LIVE.

## Evidencia (TradingView Android)
Captura M15 de NZDCAD con fuente `IC:NZDCAD` en ambos extremos (gráfico/slot 34), `R:34/34`, `SIN CRT ACT`, `MASK 0`, `HIST 1500 M5: 32 H4, C1=0, 2C=0, 3C=0, INS=0, M4/MN=0`, `H4 GAP=32, H4 DST=0, C2 RECH=0`. En consecuencia la condición de C1 válida nunca se cumple; el dashboard NO puede mostrar CRT sin violar las reglas.

## Hallazgo de código, no confirmado todavía contra ejecución Pine real

El motor V34.11d exige una H4 **sin huecos M5**, con ancla de inicio coincidente y fin correcto:
`h4Continuous && h4FirstT == h4Bucket && h4LastEnd == bucketH4 && h4Count >= minBarsC1`.
`fullH4` incluso exige **48 M5**, ancla exacta y 4 horas. Se rechaza cualquier H4 que incumpla esto; el mensaje `H4 GAP` es la **suma de incidencias**, no prueba de 32 datos M5 ausentes.

V34.11d calcula H4 Forex desde `time("240", "0100-0100:1234567", "America/New_York")[1]`, pero BTCUSD ya utiliza una función de anclaje NY explícito `f_btc_crt_h4_ny(barT)`. La documentación/código anterior reconoce que el inicio de bloque `time("240",custom_session,...)` puede diferir de las horas C1 NY especialmente con DST. Esta inconsistencia es una **causa candidata plausible** de 32/32 bloques no válidos; no se afirma probada por la captura. Además, TradingView explica que `request.security` con una resolución inferior al gráfico devuelve solo un valor intrabar por barra del gráfico y puede producir divergencias de tiempo real; los motores acumulativos intrabar requieren QA específico. Referencia: https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/ y https://www.tradingview.com/pine-script-docs/concepts/repainting/.

## Cambio mínimo en V34.11e

Pine `crt-radar-pro/CRT_RADAR_PRO_V34_11E_ANCLA_NY_H4_DIAGNOSTICO_QA.pine`, blob SHA `d95872057233e58c128f1c6171c620bdb2524b30`.

- **Forex + BTC** ahora comparten `f_btc_crt_h4_ny(barT)` con ciclos 01/05/09/13/17/21 NY.
- **Índices** reciben `f_index_crt_h4_ny(barT)` con ciclos 02/06/10/14/18/22 NY; 00:00-01:59 NY es parte del bloque 22h del día anterior.
- Se conserva íntegra la estricta comprobación de 48 M5, continuidad, rangos, barridas C2, MSS M15, invalidaciones y `useAlerts=false`.
- La tabla QA del mismo feed diferencia **H4 BAD, H4 PARC, H4 INT, C1 HORA, C1 DATO, C1 CLK**, más DST y C2 rechazadas. Antes todo quedaba resumido como 32 "H4 GAP".
- No aumenta los 34 símbolos ni las peticiones `request.security`, ni los 60 `plot()` existentes; no cambia backend o alertas Android.

## Ensayo obligatorio en Android

1. Mantener V34.11d como respaldo. Crear indicador nuevo V34.11e desde el archivo exacto. Solo él activo durante la prueba y conservar `IC:NZDCAD` M15.
2. En 03/Dashboard: `QA: ver tiempos CRT/MSS de 1 instrumento` ON y `QA: seguir grafico solo si proveedor coincide` ON.
3. Capturar tabla completa: `HIST 1500 M5` (H4, C1, 2C/3C) y fila `H4 BAD/PARC/INT/C1 HORA/DATO/CLK`.
4. Si H4 BAD cae drásticamente y C1 aparece: el anclaje anterior era causalmente relevante. **No confirmar todavía señales sin cotejar OHLC 5m con Trader Lab, MSS15 y repaint.**
5. Si H4 BAD continúa 32/32: comprobar **H4 PARC vs H4 INT**. Si PARC domina, revisar ancla real de la primera/última M5, horarios y sesión; si INT domina, revisar saltos de M5 en la fuente/request.security y probar chart M5 + exportación del feed. Rechazar datos M5 discontinuos, no reducir minBars para forzar CRT.
6. Repetir con NZDCAD M5 y M15 del mismo proveedor, luego índice (ancla 02/06/22) y otros feeds. Una pantalla completa de datos no certifica feed parity ni 7/7 modelos operativos.

**Cierre:** V34.11e solo añade una reparación de anclaje NY y prueba explicativa; la confirmación visual real en TradingView, paridad independiente en 34 proveedores, holdout sin repaint, y E2E FCM siguen PENDIENTES. NO MERGE, NO LIVE, NO PUSH.
