# CRT Radar V34.12I — integración causal MSS M5 Inside/Multi-N, sin live
**Fecha 2026-11-02 · PR #74 DRAFT · QA / NO LIVE / NO PUSH / NO MERGE.**

## Fuente y correcciones de DeepSeek
Auditoría recibida por el propietario sobre A H, B B, D, E, preflight. Hallazgo aceptado: UDTs InsideCandidate y MultiNMssCandidate guardaban solo M15; el Radar y Chart B no podían atribuir sus propios MSS5. No aplicar el parche literal con `...`, campos de origen sin congelar, ni dedup basado solo en fecha/cierre. **No tocar** Radar H ni Chart B originales.

Candidatos nuevos:
- **Radar A V34.12I**: `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine`.
- **Chart B V34.12I**: `crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine`.

## Qué está codificado

1. Se agregan `pivot5,pivot5At,mss5At` a los candidatos **Inside** y **Multi-N**, inicializados a NA, congelados en primera barrida M5 y limpiados tras barrida doble/ambigüedad o salto temporal.
2. La barrida usa un pivote M5 ya confirmado antes de `barT`, dentro de la edad admisible y posterior al comienzo del **segmento M5 continuo**. El MSS se escribe solo cuando una **M5 cerrada posterior a la barrida**, con cierre anterior continuo, cruza el precio congelado y mantiene identidad de candidato. Nunca emplea el timestamp MSS15 para MSS5.
3. En **Multi-N** se congela el pivote en el candidato del mismo C1 y H4 terminal; se extrae al RATIFICAR esa H4 y se borra el array al pasar a la siguiente. Ningún MSS heredado del 2C ni del otro Multi-N. El nuevo control no certifica Multi4.
4. Ambos contratos `Signal` se amplían de **128 a 132** campos: `extraFamilyM5Pivot`, `extraFamilyM5PivotAt`, `extraFamilyM5At` y `extraFamilyM5C1`. `f_engine()`, UDT y `Signal.new` de candidatos A/B coinciden **byte a byte**. **No** sustituye ni reordena campos anteriores.
5. Radar A V34.12I solo muestra `QA SI` M5 extra cuando `extraFamilyM5C1 == extraFamilyC1`, pivot5 anterior a barrida, ruptura posterior y fase M5 propia. Mantiene 34 fuentes y el ranking por MSS. Si el rol visible es **3C TRUE** y hay Inside solapado, NO se atribuye su MSS5/MSS15 a 3C.
6. Chart B V34.12I dibuja nivel M5 extra solo cuando C1, tipo de familia, pivote y cierre coinciden con `familyVisual` vigente; se suprime cualquier línea cruzada. Añade tres valores Data Window, no nuevas líneas simultáneas; el archivo tiene **63** llamadas `plot()`, cerca del máximo documentado de **64 plot counts**: no agregar plots antes de compilar.
7. **3C TRUE** aún no conserva MSS5/15 propio para esta vía; **MULTI4** tampoco conserva un sweep/pivote M5 propio. Se mantienen **N/V**, no se promocionan a señal.
8. Política aparte `qore-crt-alerts/src/crt-canonical-event-qa.mjs`: agrupa candidatos QA solo si ambos tienen geometría y ciclo verificados y coincide EXACTAMENTE `source + C1Start + terminalCloseAt + direction`. Conserva ambas observaciones, prioriza un nombre y nunca habilita push. Esto NO es integración Android/FCM ni reescribe `qaCatalogMask`.
9. No se aplicó la telemetría incorrecta `qaH4LastBars==48 => 1500 M5 reales`. Ese campo acredita **la última H4 auditada**, no todo el lookback. Ya existe `R:34/34` para fuentes que responden, y auditoría C1/H4 por slot. Los históricos D→E→F siguen con causa pendiente.

## Tests
- `qore-crt-alerts/test/pine-v34-12i-inside-multin-family-mss5-parity.test.mjs`: congruencia de 132 campos, misma engine en A/B, rechazo de pivote cruzando gap, pivote anterior a barrida, posterioridad del cruce M5, doble barrida, no atribuir Inside a TRUE3C, dibujo mismo C1/familia, 63 plots.
- `qore-crt-alerts/test/crt-canonical-event-qa.test.mjs`: caso positivo de dedup QA, misma fecha con distinta H4, distinto broker, distinta C1, distinta dirección, información incompleta, no dar validez a siete bits o rechazos. **Ninguna alerta real**.
- Estas son pruebas de código/QA offline, **NO** compilación real Pine, no paridad TradingView↔Trader Lab y no certificación de familias.

## Bloqueantes y aceptación

**Pendiente obligatorio**:
- Compilar **ambos V34.12I por separado** en TradingView Pine v6 usando dos slots de indicador. Si aparecen errores, capturar el texto, línea exacta y contexto. No compilar A+B concatenados.
- Confirmar bajo mismos brokers y fuentes las ventanas, tests con 34 feeds, épocas DST, geometrías de Inside/Multi-N, C1 y swing M5 antes/sweep/después.
- Completar MSS M5 y M15 de 3C verdadero, y MSS M5 de Multi4, si la definición real del modelo lo requiere.
- Revisar coincidencias 3C=INS por C1/sweep/dir, no solo cierre H4.
- Attestar contenidos OHLC de preflight Trader Lab, verificar licencias, origen, BTCUSD, paridad broker TradingView y congelar holdout antes de certificar. Preflight conocido sigue `final_verdict: BLOCKED_SOURCE_DATA_LICENSE_BTC_HOLDOUT`, `data_license_verified:false`, `pine_compiler_executed:false`, `real_price_replay_executed:false`.
- Backend Android/FCM REAL permanece bloqueado hasta paridad del motor autónomo y E2E con dispositivo físico.

**No merge, no autorizar señales operativas ni notificaciones reales.**
