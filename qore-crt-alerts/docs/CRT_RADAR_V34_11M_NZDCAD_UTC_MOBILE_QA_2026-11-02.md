# CRT RADAR PRO V34.11M — auditoría móvil: horarios UTC legibles

**2 nov 2026 · investigación QA · NO LIVE · NO PUSH · NO MERGE**

## Punto de partida: captura TradingView Android, IC:NZDCAD M15

La captura del usuario muestra V34.11L en vivo, mismo proveedor del gráfico `IC:NZDCAD`, escáner `R:34/34`, `MASK 7=0` y C1/C2/RAT/MSS15 del ciclo **actual** N/D. La tabla de memoria de 1500 M5 sí conserva estas **últimas marcas históricas observadas** (minutos Unix UTC):

| Rol QA | UTCmin mostrado | UTC legible |
|---|---:|---|
| 2C pendiente | 29893406 | 2026-11-02 07:26 |
| 2C ratificada | 29889181 | 2026-10-30 09:01 |
| Expansión rechazada | 29893561 | 2026-11-02 10:01 |
| 3C completada | 29889421 | 2026-10-30 13:01 |
| Inside Return | 29886541 | 2026-10-28 13:01 |
| Inside Continuation rechazado | 29889661 | 2026-10-30 17:01 |
| Multi4 | 29889661 | 2026-10-30 17:01 |
| Multi-N | N/D | N/D |
| Retest M15 QA | 29888131 | 2026-10-29 15:31 |

Los +240 minutos entre **últimos 2C ratificado** y **último 3C** son coherentes con la duración de H4; **no prueban identidad del ciclo**, misma dirección, sweepAt, ni confirmación MSS15. El histórico retest M15 **no demuestra** confirmación de ese 3C: las marcas por categoría pueden provenir de ciclos distintos.

## Implementación V34.11M

Se preserva íntegro V34.11L como respaldo y se crea
`crt-radar-pro/CRT_RADAR_PRO_V34_11M_HISTORICO_HORAS_UTC_MOVIL_QA_NO_LIVE.pine`.

En **03 / Dashboard** se añade `QA: mostrar fechas UTC (DD/MM HH:mm)` **ON por defecto** para la tabla de auditoría de un instrumento. Cada timestamp muestra `dd/MM HH:mm` en **Etc/UTC**; para ver/copiar la cifra UTCmin numérica usada por Trader Lab, desactivar esa opción. La hora y el dato M5 que alimentan la detección nunca se desplazan ni redondean. Esta modificación es exclusivamente de presentación. También se corrige el texto de versión V34.11M y se acortan encabezados en móvil.

**Condiciones conservadas sin modificaciones:** `f_engine()`, 126 campos UDT, catálogo de nueve marcas, 34 input.symbol M5, 60 plot(), continuidad 48 M5, ancla NY con DST y fases nativas, identidad de BTC separada, invalidación de C3, pivote M15 independiente, lectura/guardas de alertas OFF. El test de igualdad del motor entre 11L/11M y de conversión de minutos evita promover un cambio cosmético como nueva certificación.

## Verificación del usuario en TradingView Android

1. Copiar V34.11M de la **misma rama PR #74**, instalar como indicador nuevo para preservar V34.11L.
2. Abrir IC:NZDCAD M15; asegurar `QA: auditar los 33 instrumentos sin BTC` OFF, `QA: ver tiempos CRT/MSS de 1 instrumento` ON y `QA: ver ultimo evento historico por categoria` ON.
3. Dejar `QA: mostrar fechas UTC (DD/MM HH:mm)` ON para comparar los valores de la captura con la tabla anterior; si algo no coincide, desactivar el toggle y aportar UTCmin crudos y nombre de la fuente.
4. Para comparar los 34 mercados, desactivar QA de un instrumento, activar `Ver los 34 instrumentos (expandir)` y `Ampliado: inspeccionar 7 categorias CRT (QA)`.
5. Anotar compilación REAL de Pine Editor, limitaciones del móvil y timings; no marcar validado desde CI Node.

## Para certificar las siete categorías reales

Se necesita por **evento individual**: proveedor+símbolo M5 exactos y OHLC sha, ventana UTC `asOf`, `c1Start/c2Start/sweepAt/ratifiedAt`, dirección, variante si hay Multi, pivote M15 **anterior a barrida**, ruptura/retest M15 **posterior**, evidencia independiente Pine y Trader Lab con tolerancia cero, control negativo, holdout nuevo y no repaint. La mera coincidencia de `UTCmin`, máscara, contadores o última marca **no basta**.

La app Android QA compila, pero el backend de precios reales, fuente homologada, FCM autenticado y E2E en teléfono siguen pendientes. `0/7` externamente certificados. No habilitar ni fusionar alertas LIVE.
