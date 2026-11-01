# BTCUSD V34.10h — CRT H4 no detectados: causa y corrección del reloj

**1 noviembre 2026 · QA sin merge / NO LIVE · PR #55 DRAFT.**

## Evidencia objetiva del fallo

El propietario confirmó que **V34.10g lee correctamente PDH y PDL
del gráfico**, pero sigue indicando `CRT:0`. Capturas previas de
V34.10d en M5 muestran `BTC H4 NY = 01/11 08:00`, aunque
las horas legales para abrir H4 del reloj CRT Forex/BTC son
**01 / 05 / 09 / 13 / 17 / 21** (`America/New_York`).

**08:00 NY es un ancla IMPOSIBLE para esta estrategia**. No es un
motivo para relajar el barrido C2 o la exigencia MSS M15. Es una
indicación material de que el agrupador de H4 dependiente de
`time("240", "0100-0100:1234567", TZ)[1]` puede desplazarse en
el fin de semana del cambio DST; la captura no prueba por sí sola
que todas las C1/C2 fueran válidas, pero sí que el reloj no era fiable.

TradingView:
https://www.tradingview.com/pine-script-docs/concepts/time/

## Corrección real en candidato NUEVO sin sobrescribir V34.9 ni 10b-g

`crt-radar-pro/CRT_RADAR_PRO_V34_10H_QA_BTC_CRT_RELOJ_NY_NO_INTEGRADO.pine`

Git blob SHA exacto:
`d254ff36c735ce071b46dc744e241ed25fb2b1ae`

Copia Android:
`crt-radar-pro/CRT_RADAR_PRO_V34_10H_BTC_CRT_NY_ANDROID_COPIAR.txt`

**Nueva función BTC** `f_btc_crt_h4_ny(barT)`:
- Lee `hour(barT,"America/New_York")` en cada M5 cerrada.
- Asigna por hora local los bloques 01/05/09/13/17/21;
  de 00:00 a 00:59 usa las 21:00 del día NY anterior.
- Obtiene el timestamp con `timestamp(TZ,...,horaBloque,0)`,
  sin inferir los bloques del comportamiento DST de
  `time("240",session)` para BTC.
- En la repetición 01:00 de salida DST, 48 M5 H4 durante cuatro
  horas reales sigue siendo obligatorio. No debe certificar
  como completa una H4 de 5 horas o con M5 ausentes.
- Forex/índices conservan su calendario previo, y los horarios
  C1 autorizados BTC siguen **01/05/21 NY**; la C2 cierra
  dentro del rango de C1 tras barrido ESTRICTO unilateral.
  MSS M15 de swing 2/2 sigue obligatorio para confirmación.
  C3 solo invalida por cierre H4 más allá de mecha C2.
- BTC PDH/PDL 1D del PROVEEDOR (validado por usuario),
  fila NY de diagnóstico, 34 slots y modo de memoria
  BTCQA 1/34 se conservan.

**Diagnósticos nuevos** para evitar `CRT:0` inexplicable:
- Fila `BTC CRT QA`: `C1:` número de C1 completas
  detectadas en las M5 cargadas, `C2 OK:` número de C2
  ratificadas y **último rechazo C2**.
- Rechazo explícito `C2 M5 NO 48`, `C2 SIN BARRIDA`,
  `C2 DOBLE BARRIDA`, `C2 CIERRE FUERA`,
  `C2 SIN RETORNO` o `C3 HORA INVALIDA`.
  Si la C2 se ratifica: `CRT C2 RATIFICADO`.
- `NY:` la hora local del inicio H4 del motor;
  debe ser una de 01/05/09/13/17/21, jamás 08.
- Valores de auditoría nuevos en Data Window:
  `QA BTC C1 NY completas en historial M5`,
  `QA BTC CRT C2 ratificados en historial M5`,
  `QA BTC H4 hora local NY`.
- Los conteos de historial son **diagnósticos**, no
  alertas; el `CRT:0` de la cabecera continúa significando
  que no hay un CRT mostrado actualmente. Una C2 antigua
  ratificada no debe reaparecer como CRT actual si ya caducó.
  `MSS M15` sigue siendo requisito para señal certificable.

## Evidencia de laboratorio

`qore-crt-alerts/test/pine-btcusd-v34-10h-crt-h4-anchor.test.mjs`
prueba fecha NY 2026-11-01 tras fin DST, rechazo de 08:00
como ancla, fin de semana 01/05/21, 48 M5 completas y
congelamiento durante DST ambiguo, preservación PDH/PDL
del proveedor y anti-alertas.

Node QA **260/260 PASS**:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41334916409

**IMPORTANTE: GitHub no compiló ni ejecutó Pine V34.10h
en TradingView**; las comprobaciones de archivo y el motor
independiente son QA estático/replay solamente.

## Prueba obligatoria en TradingView Android

1. Retirar solo del gráfico la vieja V34.10g.
2. Copiar TXT **V34.10h** completo a un nuevo Pine privado.
   Mantener `BTCUSD solo`; no tocar el parámetro horario.
3. Elegir gráfico BTCUSD **M5** con el mismo exchange en el
   gráfico y en slot BTCUSD. Confirmar que el panel está
   funcionando y la hora `NY` que muestra no es 08.
4. Hacer captura de `BTC CRT QA` que muestre
   `C1`, `C2 OK`, `NY` y el motivo de rechazo.
   Probar también H4 para confirmar que no volvió el
   error previo de memoria.
5. Si C1>0 y C2 OK=0: evaluar el rechazo exacto con
   el máximo/mínimo y cierre de las C1 y C2 correspondientes.
   Si C2 OK>0 pero CRT actual=0: puede significar que el CRT
   acabó; revisar C3, MSS M15 y caducidad.
6. Sin usar TradingView para notificaciones: Firebase/FCM
   sigue desactivado hasta pruebas reales de paridad
   y entrega Android STAGING.

El resultado esperado es una observación real de H4 NY
correcta y razones trazables, **no una falsa promesa
de que toda barrida produce un CRT válido**.
