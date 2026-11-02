# QORE CRT RADAR A V34.12E — auditoría de coincidencia 3C/Inside por cierre exacto

**Fecha: 2026-11-02 | PR #74 DRAFT | NO LIVE / NO PUSH / NO MERGE.**

## Evidencia obtenida en TradingView Android

El propietario cargó y compiló **Radar A V34.12D**; sus cuatro capturas del historial P1–P4/4 muestran:
- 2C con histórico en **34** mercados, verdadero 3C en **9**, Inside Return en **15**, Multi4 en **4**, Multi-N en **2**.
- **GBPNZD**: 3C e Inside el **02/11/2026**, además Multi-N el 30/10/2026. Slot **33**, feed previsto **IC:GBPNZD**.
- **XAUUSD**: 3C e Inside el **29/10/2026**. Slot **4**, feed previsto **IC:XAUUSD**.
- **NZDJPY**: Inside 02/11, Multi4 29/10. Slot **15**, previsto **IC:NZDJPY**.
- **GBPAUD**: Inside 28/10, Multi4 30/10. Slot **30**, previsto **IC:GBPAUD**.
- **AUDUSD**: Inside 30/10, Multi-N 30/10. Slot **9**, previsto **IC:AUDUSD**.

Estas fechas son **solo DD/MM**, sin hora. No acreditan ni la misma vela H4 ni el mismo ciclo. El recuento 9/15/4/2 significa **mercados con algún histórico en la ventana M5**, no 30 señales independientes ni eventos actuales.

**Error de interfaz identificado:** la parte inferior repetía `S1 AUDJPY` y su UTCmin mientras el gráfico abierto era GBPAUD. La vista tenía `qaEventSlot=1` por defecto; no significaba que los datos pertenecieran a GBPAUD. Cualquier coincidencia basada en esos UTCmin sería inválida.

## Implementación V34.12E

Nuevo candidato, no sobrescribe D:
`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_E_CIERRE_EXACTO_3C_INS_QA_NO_LIVE.pine`.

- Agrega opción **`QA historial: seguir el simbolo del grafico (mismo broker)`** ON por defecto. Al entrar a la tabla histórica compara `ticker.standard(syminfo.tickerid)` con **cada uno de los 34 símbolos del Radar**. Si hay coincidencia, las cinco marcas UTCmin pertenecen a ese feed; si no hay, aparece **`SIN SLOT / BROKER`** y **N/D**. Jamás reemplazar `IC:GBPAUD` por otro broker de GBPAUD. Para elegir un slot distinto al gráfico, dejar el toggle OFF y utilizar `QA: numero de instrumento (1-34)`.
- Calcula **`3C=INS:n`**: número de mercados donde el **último** cierre H4 registrado de 3C verdadera y de Inside Return coincide en **el mismo Unix ms**. No compara solo DD/MM y **no** certifica que haya sido la misma estructura (puede diferir C1/dirección).
- En el slot seleccionado, `MISMO CIERRE` exige timestamps cerrados idénticos. `MISMO DIA` expresa solo misma fecha; `CIERRE DIST` expresa cierres distintos; `N/D` indica falta de alguno. Muestra todavía cinco UTCmin exactos.
- `C1 SIN VER` recuerda que los timestamps de fin H4 no transportan necesariamente los C1 y la dirección de **ambas** familias; se requieren los datos OHLC por ciclo.
- **Sin cambios** en `f_engine()`, `Signal`, inventario de 34 símbolos, MSS M5/M15 y orden del monitor principal; no se modifica Chart B.
- Módulo JS experimental `qore-crt-alerts/src/crt-family-overlap-evidence-qa.mjs`: rechaza datos de otro broker, misma fecha sin cierre exacto, y coincidencias sin C1 y dirección. Aun con geometrías coincidentes, produce un candidato QA con prioridad explícita 3C barrida de C1 / Inside barrida de C2, **nunca dos entradas certificadas ni notificaciones**.
- Tests `test/crt-family-overlap-evidence-qa.test.mjs` y `test/pine-v34-12e-h4-close-collision-and-broker-selection.test.mjs`.

## Prueba Android recomendada

1. Instalar **solamente el nuevo Radar A V34.12E** en su slot; **Chart B permanece sin tocar**.
2. En `03 / Dashboard`, activar `QA: historial 2C/3C/Inside/Multi por mercado` y dejar `QA historial: seguir el simbolo del grafico (mismo broker)` ON.
3. Abrir **IC:GBPNZD M15**, mirar abajo `S33 GBPNZD`, comparar 3C UTCmin e Inside UTCmin y leer el estado `MISMO CIERRE/MISMO DIA/CIERRE DIST`. Repetir con **IC:XAUUSD M15**, que debe mostrar `S4 XAUUSD`. Si el broker no coincide aparece SIN SLOT; no cambiar información de la fuente por la del nombre genérico.
4. Conservar UTCmin para contrastar **misma fuente M5, H4 C1/C2/C3**, C1 high/low, dirección y ruptura M5/M15 real en Trader Lab. Una misma fecha o cierre NO justifica un CRT aprobado.
5. Para regresar al monitor aprobado de CRT/MSS, desactivar `QA: historial 2C/3C/Inside/Multi por mercado`.

## Criterio de certificación

Se necesita **historial M5 original del mismo proveedor**, ancla H4 de NY, continuidad de las 48 M5, C1 de ambas familias, C2, C3, hora exacta de barrida, retorno al rango, pivote M5/M15 anterior y ruptura **por cierre** posterior, y contraste TradingView↔Trader Lab en holdout. El preflight de datos del repositorio sigue sin certificar licencias/paridad de feed/replay/holdout. **El valor de 3C=INS y la salida del JS son solo diagnóstico.** El segundo indicador de líneas y las alertas Android no se han modificado.
