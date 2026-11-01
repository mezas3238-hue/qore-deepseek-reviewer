# BTCUSD — PDH/PDL NYC 24×7, corrección QA V34.10e

Fecha: 2026-11-01. Rama del PR #55 DRAFT.
**NO LIVE · NO merge · Pine TradingView aún NO compilado/probado para esta revisión.**

## Evidencia y error real del código

El propietario presentó capturas BTCUSD en M5, H4 y 1D donde el panel
del candidato V34.10d mostraba `PDH = INT` y `PDL = INT`, pese
a una aparente barrida anterior. La captura no contiene el nivel PDH
numérico ni la identidad completa del proveedor: **NO permite por sí
sola demostrar qué PDH fue roto**.

La lectura del código sí identifica un defecto concreto: el módulo
M4A aplicaba a BTCUSD `"1700-1700:23456"` (FX, sesión de lunes
a viernes), lo cual excluía el fin de semana y definía una referencia
distinta del día civil NY. Documentación oficial:
https://www.tradingview.com/pine-script-docs/concepts/sessions/

**Nuevo criterio explícito BTCUSD para QA:** el PDH y PDL son
máximo/mínimo de **ayer calendario NY (00:00 a 00:00,
America/New_York)**, 7 días de la semana. Esto es INDEPENDIENTE del
calendario CRT H4 C1 01/05/21, que NO cambia. Las velas H4/1D
visuales del exchange pueden tener una apertura diaria distinta.

## Corrección entregada

Nuevo candidato, conserva originales oficiales y V34.10b/c/d:

`crt-radar-pro/CRT_RADAR_PRO_V34_10E_QA_BTC_PDH_24X7_NY_NO_INTEGRADO.pine`

Git blob exacto SHA-1:
`3c51656418313fb51172e03657eed3bf37b0e4e1`

Copia literal Android:

`crt-radar-pro/CRT_RADAR_PRO_V34_10E_BTC_PDH_NY_ANDROID_COPIAR.txt`

Se cambió únicamente el calendario PDH/PDL de BTC:
- `0000-0000:1234567` — 24×7, sesiones de día civil Nueva York,
  incluidos sábados y domingos.
- Solo se fija un nuevo `prev_PDH/PDL` después de cerrar una jornada
  con todas las M5 **contiguas** desde medianoche NY hasta la
  medianoche NY siguiente.
- La duración de la jornada es dinámica según la IANA:
  **276 M5 = 23h (entrada DST); 288 = 24h; 300 = 25h
  (salida DST)**. Si faltan M5 o el día está incompleto,
  estado `N/D` (sin nivel de referencia ratificado).
- Si salta un día completo de observación no se conserva un PDH
  antiguo como si fuera el de ayer; `prev_valid=false`.
- La primera M5 con `high > prev_PDH` registra el PDH como
  `TAKEN`; primera M5 con `low < prev_PDL` registra PDL
  `TAKEN`. Igualdad exacta no cuenta como barrida. **No requiere
  cierre de vela por encima del nivel:** para PDH basta que la mecha
  lo supere en la M5 cerrada. En panel, `T OTR` indica barrida
  fuera del CRT mostrado, `T C2`/`T C3` cuando corresponde.
- Se mantienen exactamente las sesiones Forex/índices del módulo
  anterior; no se amplía el alcance a 34 feeds en esta prueba.
- El dashboard agrega la fila **PDH/PDL NY**, con:
  `PDH: [precio]`, `PDL: [precio]`,
  `dd/MM HH:mm` del cierre de referencia NY, estados completos
  `INTACTO/TAKEN`; dos nuevos plots y timestamp exacto en
  Data Window: `QA BTC PDH NY nivel`,
  `QA BTC PDL NY nivel`,
  `QA BTC PDH PDL NY referencia UTC min`.
- El resto del sistema sigue: CRT H4 NY 01/05/21, 48 M5
  cerradas por H4 BTC, MSS M15 2/2, BTC-only memoria,
  `useAlerts=false`, FCM desactivado.

## Verificación cruzada backend

Se incorpora `qore-crt-alerts/src/btcusd-ny-daily-liquidity.mjs`,
auditoría offline de la misma regla de jornada, + tests
`qore-crt-alerts/test/btcusd-ny-daily-liquidity.test.mjs`.
Cubren sábado/domingo, barridas estrictas, igualdad que no barre,
huecos M5 sin nivel falso, cambio DST primavera 276 M5 y otoño
300 M5, y ausencia de jornada previa válida.

El contrato de paridad BTC ahora fija el SHA de V34.10e, pero
no afirma compilación Pine ni coincidencia real de proveedor.

## Verificación que falta en TradingView Android

1. Retirar V34.10d del gráfico para no duplicar indicadores y pegar
   V34.10e (copia TXT completa).
2. Configurar `BTCUSD solo`, mantener QA alert OFF, mismo
   BTCUSD exacto chart + slot s08. Testar primero M5.
3. Revisar nueva fila **PDH/PDL NY**, precio de referencia y fecha:
   comprobar que la jornada referenciada es exactamente **ayer
   NY**, no una vela 1D del exchange con otra apertura.
4. Si cualquier vela M5 cerrada de HOY tiene high estrictamente mayor
   que ese PDH, el estado debe ser `TAKEN`, y en panel
   puede decir `T OTR` al no haber CRT C2/C3.
5. Enviar captura de esa fila junto con ticker/exchange de la
   ventana de datos para comparar contra backend con la misma serie M5.

**Estado final:** GitHub QA/replay no sustituye la compilación y
ejecución real en TradingView. No activar señales reales hasta
certificar el ciclo CRT+MSS y la referencia PDH/PDL.
