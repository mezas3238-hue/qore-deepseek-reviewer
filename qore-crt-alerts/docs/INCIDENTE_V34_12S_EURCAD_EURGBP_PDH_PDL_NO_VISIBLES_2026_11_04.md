# V34.12S — Incidente: PDH/PDL ausentes en EURCAD M15 y EURGBP H4

**2026-11-04** · PR #74 DRAFT · No LIVE, no PUSH, no MERGE.

## Evidencia del Owner

Capturas TradingView Android: EURCAD M15 y EURGBP H4 presentan CRH/CRL 2C QA visibles pero no las líneas PDH/PDL ni estados TOMADO/INTACTO. Por ello no se debe atribuir el error al dibujo global del CRT; hay que auditar las puertas específicas de Daily.

## Error encontrado en V34.12R

El gate `dailyDataOK` exigía `dailyPrevClose <= dailyNowOpen`. El primero provenía de `time_close[1]` de una solicitud D; el segundo de `time("D")` ejecutado en la temporalidad del gráfico. Diferencias de definición de sesión o aperturas/cierres de velas pueden volver falso ese predicado aunque el high y low del Daily anterior sean correctos. Había otra dependencia innecesaria de `chartStaticSlot`, aun cuando la consulta Daily utiliza `syminfo.tickerid` del propio gráfico.

No es posible probar a partir de las dos capturas cuál de esos predicados concretos fue falso. V34.12S añade estado visible en pantalla en lugar de seguir ocultando los niveles sin explicación.

## Cambio implementado

Archivo nuevo: `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12S_PDH_PDL_VISIBLE_DIARIO_QA_NO_LIVE.pine`.

- Una fuente Daily confirmada exacta del chart: `request.security(syminfo.tickerid,"D",[high[1],low[1],time[1],time],lookahead=barmerge.lookahead_on)`. `time` del Daily actual es su apertura, conocida desde que comienza; `high[1]` y `low[1]` permanecen confirmados.
- Retirado el gate `dailyPrevClose <= dailyNowOpen` y la dependencia `chartStaticSlot` para PDH/PDL. Validación: high > low, timestamps Daily existentes y `dailyPrevOpen < dailyNowOpen`.
- Conserva lineas horizontales y estados independientes de `PDH TOMADO` / `PDH INTACTO` y `PDL TOMADO` / `PDL INTACTO`. El primer toque por mecha se registra desde inicio de la nueva sesión del broker.
- Reconciliación observacional del high/low Daily actualmente en formación usando segunda solicitud `request.security(...,"D",[high,low,time],lookahead_off)` solo en `barstate.islast` y cuando el inicio del día coincide con el ya confirmado. Así se evita perder un toque en la barra H4 que cruza una frontera de día. No se utiliza la OHLC final de un Daily futuro para señales históricas.
- Añadido un panel minimalista `DAILY · <simbolo>` en esquina inferior derecha. Siempre muestra precio y estado de PDH/PDL si hay datos, aunque las líneas estén fuera del zoom. Si falla la fuente o se desactiva la opción, declara explícitamente `SIN D`, `TF NO SOPORTADA` o `DESACTIVADO`, sin inventar niveles.
- No cambia escaneo 6 H4 de 24h, 34 feeds M5, CRT/MSS ni FVG cercano. V34.12R queda intacta.

## Prueba de aceptación Android

1. Guardar versiones personalizadas si existen, retirar instancias viejas QORE CRT y añadir solo V34.12S.
2. Abrir EURCAD M15 y EURGBP H4 en el mismo broker exacto. Inspeccionar el panel de esquina inferior derecha: tiene que mostrar dos valores y estados; si reporta SIN D, conservar captura para diagnóstico de fuente.
3. Verificar que PDH/PDL coinciden con high/low de la 1D previa. Si el precio solo toma el PDL, debe mostrar `PDL TOMADO` y `PDH INTACTO`. Salir y volver para validar reconstrucción.
4. Separar de esta prueba el resultado del detector CRT; R:34/34 no certifica CRT operables.

## QA

`qore-crt-alerts/test/pine-v34-12s-daily-visibility-and-taken-states.test.mjs`: motor CRT byte idéntico a R, seis H4, dos snapshots D, fuente nativa, estados independientes, panel de diagnóstico y 37 solicitudes únicas teóricas (<40 Basic). Estas pruebas NO compilan ni ejecutan el Pine Editor de TradingView; la validación del broker y de visuales sigue pendiente.
