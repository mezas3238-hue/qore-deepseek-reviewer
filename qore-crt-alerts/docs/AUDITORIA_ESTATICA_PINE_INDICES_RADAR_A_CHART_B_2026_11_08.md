# QORE CRT — auditoría estática del reloj H4 en Pine Radar A / Chart B
**8 noviembre 2026 · Fuente GitHub · QA documental · NO CAMBIOS PINE, LIVE, MERGE ni PUSH**

## Dos archivos inspeccionados (no equivale al indicador instalado en TradingView)
- `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine` · blob SHA `4efd5622124c93ffbb35f6579e71044559e370f6`.
- `crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine` · blob SHA `4e41b47c75679e89b96d1234cc0dbc52ed915c2e`.

**Conclusiones estáticas verídicas para estas dos versiones V34.12I (sin inferir que sean la última Pine ejecutada):**
1. Tanto Radar A como Chart B configuran `scheduleMode = "Solo C1 de tres horarios NY"` por defecto; el modo `"Todas las H4 NY"` existe pero se presenta como diagnóstico opcional, no como señal oficial.
2. La elegibilidad exacta de C1 en índices se calcula con `hh == 2 or hh == 6 or hh == 22` (America/New_York). La función `f_index_crt_h4_ny` usa el cubo 02/06/10/14/18/22 NY, incluyendo la atribución al día anterior si NY hour < 2.
3. Es una alineación **diferente** a la H4 nativa cTrader DEMO verificada históricamente: 01/05/09/13/17/21 NY; el PR #98 comparó las geometrías de dos particiones de un mismo feed de 600 M5 en 34 mercados, 3 índices.
4. **Riesgo concreto de identidad USTEC**: en ambas versiones V34.12I, la lista `idxList` y los términos `bool typical` no contienen explícitamente el nombre `USTEC` (cTrader/TradingView `IC:USTEC` corresponde a NDX100 en el manifiesto de 34). La clasificación `f_index()` también acepta `syminfo.type == "index"`. Por eso **si TradingView devuelve un tipo distinto de `index` para IC:USTEC, el indicador podría tratarlo con reloj forex**. Esto es una condición de riesgo descubierta estáticamente; no existe todavía evidencia de la clasificación real de `syminfo.type` en TradingView ni debemos afirmar que esté fallando. Tampoco se infiere desde estas dos versiones que una revisión posterior del indicador tenga el mismo código.
5. El manifiesto backend sí identifica inequívocamente `NDX100 => IC:USTEC => cTrader ID 10014` y aplica reloj index, aunque eso no demuestra la configuración del indicador cargado en TradingView.
6. El detector Pine es más amplio que el comparador geométrico de PR #98: incluye familias con MSS M5/M15, pivotes, estados provisionales y retest. **La coincidencia de un patrón geométrico no certifica `f_engine()`, siete categorías, feed parity, no repaint ni aptitud de entrada**.

## Comprobaciones pendientes para certificar realmente Pine con las 34
1. Obtener una captura verificable **desde el Pine Editor de TradingView** que establezca el archivo/versión de Radar A y Chart B efectivamente instalados, compilación, `scheduleMode`, `qaPhase1NonBtc` y listado de exactamente 34 símbolos.
2. Confirmar en gráfico `IC:USTEC` el valor real de `syminfo.type` y el resultado `f_index()`; evitar depender de conjeturas de la categoría de TradingView.
3. Reconciliar por instrumento y por misma ventana **todas las OHLC M5** y sus fases antes de cotejar cada evento Pine/Trader Lab/cTrader: C1/C2/C3, dirección, cierre H4, MSS M5/M15 y categoría. Fuente GitHub únicamente no sustituye ejecución Pine.
4. El Owner debe aprobar expresamente cualquier modificación del reloj C1 para índices. Mientras tanto **no cambiar** `ny-clock.mjs` ni editar Pine A/B; `canTrade=false`, `sendPush=false`.

**Hallazgo importante:** el nuevo comparador de dos relojes confirma el efecto estructural del desfasaje, pero no establece cuál método debe adoptarse. Su salida es análisis contrafactual y no señal.
