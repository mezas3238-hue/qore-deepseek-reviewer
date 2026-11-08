# QORE CRT V34.12J QA — corregir identidad USTEC sin cambiar CRT, MSS ni el reloj C1

**Corte:** 8 noviembre de 2026. **Alcance:** dos archivos Pine QA + prueba de identidad en gráfico. **NO LIVE, NO MERGE, NO ÓRDENES, NO PUSH/FCM, NO CAMBIO C1.**

## Origen y límites de la corrección

El PR #98 demostró con el feed cTrader DEMO y **34/34 instrumentos** que los tres índices tienen geometrías de C1/C2/C3 distintas bajo el calendario actual 02/06/22 NY y el nativo 01/05/21 NY. Ambos relojes **NO son equivalentes**; los índices siguen vetados en la app.

Una inspección estática de las fuentes Pine V34.12I de Radar A y Chart B encontró que `f_index()` dependía de `syminfo.type == "index"`, de una lista configurable `idxList` y de un detector de nombres típicos, pero en las dos fuentes **faltaba literalmente USTEC**. El manifiesto autenticado de cTrader/TradingView asocia `NDX100 => IC:USTEC => cTrader DEMO ID 10014`; la equivalencia de precios con TradingView sigue sin certificar.

**Corrección V34.12J QA, mínimamente invasiva:**
- Se preservan sin editar los dos Pine V34.12I originales.
- Se crean por separado:
  - `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_J_USTEC_INDEX_QA_NO_LIVE.pine`
  - `crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_J_USTEC_INDEX_QA_NO_LIVE.pine`
- En cada archivo, se agrega `USTEC` a la lista de índices predeterminada **y** se agrega la condición literal `name == "USTEC"` al clasificador de índices. La condición exacta funciona incluso cuando el usuario modifica `idxList` o `syminfo.type` resulta diferente de `index`. No clasifica `NOTUSTEC` por coincidencia parcial.
- Versiones de nombres/shorttitle pasan de 12I a 12J, y se añade un comentario QA. **Toda la lógica adicional se conserva byte a byte** desde V34.12I: `f_engine()`, H4/C1/C2/C3, siete roles, MSS M5 y M15, Inside, Multicandle, FVG, alertas deshabilitadas, 34 fuentes en Radar A y una sola fuente en Chart B.
- En particular, el reloj soberano de índices **sigue en 02/06/22 NY**, no se modifica la configuración ni se transforma el horario nativo. La presente corrección NO levanta el veto de los índices para señales.

## Evidencia programática

`qore-crt-alerts/test/pine-v34-12j-ustec-index-34-invariance.test.mjs` compara ambos archivos V34.12J con una transformación permitida exacta de sus originales V34.12I, impidiendo cambios no autorizados en el motor. Recorre los **34 IDs reales del manifiesto** en condiciones conservadoras `syminfo.type="cfd"` y comprueba que **solamente USTEC/NDX100** cambia de clasificación: USTEC pasa de indeterminado/no índice a índice, US500/US30 siguen índices y los otros 31 no cambian. Además prueba con la lista CSV personalizada, preservación de `C1_HOURS.index=[2,6,22]`, alcance de Radar A/Chart B y ausencia de transporte/órdenes.

Estas pruebas son **estáticas y locales**, NO prueban compilación ni ejecución Pine dentro de TradingView, ni verifican el resultado de `syminfo.type` vivo en IC:USTEC.

## Comprobador visual independiente en TradingView

Archivo: `crt-radar-pro/QORE_QA_FEED_IDENTITY_IC_USTEC_V34_12J_NO_ALERTAS.pine`.

- Es un microindicador de una sola fuente **del gráfico abierto**, sin `request.security`, sin alertas y sin CRT/MSS.
- Muestra `syminfo.prefix`, `syminfo.ticker`, `syminfo.type`, coincidencia explícita de nombre, familia final y **C1 actualmente programadas**.
- Se puede pegar en Pine Editor como verificación manual de `IC:USTEC` si se dispone de acceso a ese gráfico; no necesita suscripción ni permisos de trading. Por diseño no escanea 34 mercados ni pretende certificar esos 34 mediante una sola captura.
- El resultado esperado en IC:USTEC **si compila y ese símbolo está disponible** es «INDICE», con horario de referencia «02/06/22», independientemente de si TradingView etiqueta el feed como CFD o índice. No afirmar observación antes de la prueba real.

## Puertas todavía bloqueadas

1. **No existe comprobación de que V34.12I sea la versión realmente cargada** del indicador del Owner en TradingView. V34.12J de este PR es un candidato QA derivado de los archivos GitHub V34.12I; no sustituye automáticamente otra versión instalada.
2. Requiere compilación real de ambos archivos V34.12J en el Pine Editor, confirmar que Radar A escanee 34, observar la identidad del ticker `IC:USTEC` y validar que no haya errores/limitación de memoria.
3. Comparar eventos por instrumento y por fuente real: C1 UTC, CRH/CRL, fin C2, tipo CRT, dirección, MSS M5 y MSS M15; contrastar con el replay DEMO sobre el **mismo OHLC**, con test positivo/negativo para los siete roles, holdout y no repaint.
4. No reinterpretar la corrección de **identidad del ticker** como solución del desacuerdo de **calendario H4**. Los índices permanecen bloqueados para alertas.
5. Solo tras certificación integral, E2E app/widget TTL 4 horas y aprobación explícita podrán considerarse notificaciones reales. No deploy Railway para estos archivos de Pine: Railway ejecuta exclusivamente el worker cTrader DEMO de PR #98, que no utiliza los archivos Pine V34.12J.

**GitHub es fuente soberana. PR DRAFT sin merge.**
